import { Request, Response } from 'express';
import { z } from 'zod';
import { BloodRequest, BloodRequestStatus, UrgencyLevel } from '../models/BloodRequest';
import { Profile } from '../models/Profile';
import { User } from '../models/User';
import { Donor } from '../models/Donor';
import { AuthRequest, BloodGroup, UserRole } from '../types';
import { sendSuccess, sendError, ErrorCodes } from '../utils/apiResponse';
import { emitBloodRequestUpdate } from '../utils/socketSetup';
import { BLOOD_COMPATIBILITY_MAP } from '../utils/bloodCompatibility';

const urgencyValues: [UrgencyLevel, ...UrgencyLevel[]] = ['routine', 'urgent', 'critical'];
const statusValues: [BloodRequestStatus, ...BloodRequestStatus[]] = [
  'pending',
  'matched',
  'accepted',
  'rejected',
  'fulfilled',
  'cancelled',
  'expired',
];

const createRequestSchema = z.object({
  patientName: z.string().optional(),
  bloodGroup: z.string(),
  unitsRequired: z.number().int().min(1).max(20).default(1),
  urgency: z.string().default('routine'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  hospitalName: z.string().optional(),
  clinicalNotes: z.string().max(500).optional(),
  message: z.string().max(500).optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(statusValues),
  donorId: z.string().optional(),
  notes: z.string().optional(),
});

export const createBloodRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  const data = createRequestSchema.parse(req.body);
  const requesterId = req.user!._id;

  const validBloodGroup = Object.values(BloodGroup).includes(data.bloodGroup as BloodGroup)
    ? (data.bloodGroup as BloodGroup)
    : BloodGroup.A_POS;

  let assignedUrgency: UrgencyLevel = 'routine';
  if (data.urgency === 'urgent') assignedUrgency = 'urgent';
  if (data.urgency === 'critical') assignedUrgency = 'critical';

  const latitude = data.latitude ?? data.lat ?? 12.9716;
  const longitude = data.longitude ?? data.lng ?? 77.5946;

  const location = {
    type: 'Point' as const,
    coordinates: [longitude, latitude] as [number, number],
  };

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 3);

  const bloodRequest = await BloodRequest.create({
    requesterId,
    patientName: data.patientName || 'Emergency Patient',
    bloodGroup: validBloodGroup,
    unitsRequired: data.unitsRequired,
    urgency: assignedUrgency,
    location,
    hospitalName: data.hospitalName,
    clinicalNotes: data.message || data.clinicalNotes || 'Urgent blood request',
    status: 'pending',
    expiresAt,
  });

  emitBloodRequestUpdate(bloodRequest.id, {
    action: 'created',
    requestId: bloodRequest.id,
    bloodGroup: bloodRequest.bloodGroup,
    urgency: bloodRequest.urgency,
  });

  const formatted = {
    _id: bloodRequest._id,
    id: bloodRequest._id,
    bloodGroup: bloodRequest.bloodGroup,
    urgency: bloodRequest.urgency,
    message: bloodRequest.clinicalNotes,
    status: bloodRequest.status,
    createdAt: bloodRequest.createdAt.toISOString(),
  };

  res.status(201).json({
    success: true,
    request: formatted,
    data: bloodRequest,
  });
};

export const getMyRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!._id;
  const isDonor = req.user!.roles?.includes(UserRole.DONOR);

  let requests: any[] = [];

  if (isDonor) {
    // If the logged-in user is a DONOR: show all active emergency requests compatible with this donor!
    const profile = await Profile.findOne({ userId });
    const donorGroup = profile?.bloodGroup;

    const query: any = { status: { $ne: 'cancelled' } };

    if (donorGroup && BLOOD_COMPATIBILITY_MAP[donorGroup]) {
      const compatibleRecipients = BLOOD_COMPATIBILITY_MAP[donorGroup];
      query.bloodGroup = { $in: compatibleRecipients };
    }

    requests = await BloodRequest.find(query)
      .populate('requesterId', 'email phone name')
      .populate({
        path: 'matchedDonorId',
        populate: { path: 'userId', select: 'email phone' },
      })
      .sort({ createdAt: -1 })
      .limit(30);

    // If no strictly matching request, return all active requests so donor can always help
    if (requests.length === 0) {
      requests = await BloodRequest.find({ status: { $ne: 'cancelled' } })
        .populate('requesterId', 'email phone name')
        .populate({
          path: 'matchedDonorId',
          populate: { path: 'userId', select: 'email phone' },
        })
        .sort({ createdAt: -1 })
        .limit(30);
    }
  } else {
    // If RECIPIENT / PATIENT: show requests they created
    requests = await BloodRequest.find({ requesterId: userId })
      .populate('requesterId', 'email phone name')
      .populate({
        path: 'matchedDonorId',
        populate: { path: 'userId', select: 'email phone' },
      })
      .sort({ createdAt: -1 });
  }

  const formatted = await Promise.all(
    requests.map(async (r) => {
      const contactPhone = r.requesterId?.phone || '+919876543210';
      const patientName = r.patientName || r.requesterId?.email?.split('@')[0] || 'Patient';

      let donorInfo: any = null;
      if (r.matchedDonorId) {
        const donorDoc: any = r.matchedDonorId;
        const donorUser: any = donorDoc.userId;
        const donorUserId = donorUser?._id || donorUser;
        let donorName = 'Verified Donor';
        let donorPhone = donorUser?.phone || '+91 9876543210';
        const donorBlood = donorDoc.bloodGroup || 'Compatible';

        if (donorUserId) {
          const dProfile = await Profile.findOne({ userId: donorUserId });
          if (dProfile) {
            donorName = `${dProfile.firstName} ${dProfile.lastName}`.trim();
          }
        }
        donorInfo = {
          name: donorName,
          phone: donorPhone,
          bloodGroup: donorBlood,
        };
      }

      return {
        _id: r._id,
        id: r._id,
        patientName,
        bloodGroup: r.bloodGroup,
        urgency: r.urgency,
        message: r.clinicalNotes || r.hospitalName || 'Emergency blood required',
        hospitalName: r.hospitalName || '',
        contactPhone,
        status: r.status,
        matchedDonor: donorInfo,
        donorName: donorInfo?.name || '',
        donorPhone: donorInfo?.phone || '',
        donorBloodGroup: donorInfo?.bloodGroup || '',
        createdAt: r.createdAt.toISOString(),
      };
    })
  );

  res.json(formatted);
};

export const getBloodRequestById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const bloodRequest = await BloodRequest.findById(id)
    .populate('requesterId', 'email phone')
    .populate('matchedDonorId', 'bloodGroup isAvailable');

  if (!bloodRequest) {
    sendError(res, 404, ErrorCodes.NOT_FOUND, 'Blood request not found');
    return;
  }

  sendSuccess(res, bloodRequest);
};

export const updateRequestStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const data = updateStatusSchema.parse(req.body);

  const bloodRequest = await BloodRequest.findById(id);
  if (!bloodRequest) {
    sendError(res, 404, ErrorCodes.NOT_FOUND, 'Blood request not found');
    return;
  }

  bloodRequest.status = data.status;
  if (data.donorId) {
    bloodRequest.matchedDonorId = data.donorId as any;
  } else if (req.user?.roles?.includes(UserRole.DONOR)) {
    const donor = await Donor.findOne({ userId: req.user._id });
    if (donor) {
      bloodRequest.matchedDonorId = donor._id as any;
    } else {
      const profile = await Profile.findOne({ userId: req.user._id });
      const newDonor = await Donor.create({
        userId: req.user._id,
        bloodGroup: profile?.bloodGroup || BloodGroup.O_NEG,
        isAvailable: true,
      });
      bloodRequest.matchedDonorId = newDonor._id as any;
    }
  }
  await bloodRequest.save();

  emitBloodRequestUpdate(bloodRequest.id, {
    action: 'status_updated',
    requestId: bloodRequest.id,
    status: bloodRequest.status,
  });

  sendSuccess(res, bloodRequest);
};

export const cancelBloodRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user!._id;

  const bloodRequest = await BloodRequest.findOne({ _id: id, requesterId: userId });
  if (!bloodRequest) {
    sendError(res, 404, ErrorCodes.NOT_FOUND, 'Blood request not found or unauthorized');
    return;
  }

  bloodRequest.status = 'cancelled';
  await bloodRequest.save();

  emitBloodRequestUpdate(bloodRequest.id, {
    action: 'cancelled',
    requestId: bloodRequest.id,
  });

  sendSuccess(res, { message: 'Blood request cancelled' });
};
