import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Profile } from '../models/Profile';
import { Donor } from '../models/Donor';
import { BloodGroup, UserRole } from '../types';
import { logger } from './logger';

export const seedInitialDonorsIfEmpty = async (): Promise<void> => {
  try {
    const donorCount = await Donor.countDocuments({});
    if (donorCount >= 4) return;

    logger.info('Seeding initial verified donors for emergency discovery...');

    const sampleDonors = [
      { name: 'Dr. Priya Sharma', email: 'priya.sharma@pulsenet.org', phone: '+919876500001', bloodGroup: BloodGroup.O_NEG, coordinates: [77.5946, 12.9716] },
      { name: 'Rahul Verma', email: 'rahul.verma@pulsenet.org', phone: '+919876500002', bloodGroup: BloodGroup.O_POS, coordinates: [77.5980, 12.9750] },
      { name: 'Ananya Iyer', email: 'ananya.iyer@pulsenet.org', phone: '+919876500003', bloodGroup: BloodGroup.A_POS, coordinates: [77.5900, 12.9680] },
      { name: 'Vikram Patel', email: 'vikram.patel@pulsenet.org', phone: '+919876500004', bloodGroup: BloodGroup.B_POS, coordinates: [77.6020, 12.9800] },
      { name: 'Sneha Reddy', email: 'sneha.reddy@pulsenet.org', phone: '+919876500005', bloodGroup: BloodGroup.AB_POS, coordinates: [77.5850, 12.9650] },
    ];

    const passwordHash = await bcrypt.hash('DonorPassword123', 10);

    for (const d of sampleDonors) {
      let user = await User.findOne({ email: d.email });
      if (!user) {
        user = await User.create({
          email: d.email,
          phone: d.phone,
          passwordHash,
          roles: [UserRole.DONOR],
          isVerified: true,
        });

        const [firstName, ...rest] = d.name.split(' ');
        await Profile.create({
          userId: user._id,
          firstName,
          lastName: rest.join(' ') || 'Donor',
          bloodGroup: d.bloodGroup,
        });

        await Donor.create({
          userId: user._id,
          bloodGroup: d.bloodGroup,
          isAvailable: true,
          locationConsentGranted: true,
          location: {
            type: 'Point',
            coordinates: d.coordinates,
          },
        });
      }
    }

    logger.info('Verified initial emergency donors seeded successfully.');
  } catch (error: any) {
    logger.warn('Seed donors notice', { message: error.message });
  }
};
