import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User } from '../models/User';
import { Profile } from '../models/Profile';
import { Donor } from '../models/Donor';
import { config } from '../config';
import { sendError, ErrorCodes } from '../utils/apiResponse';
import { AuthRequest, JwtPayload, UserRole, BloodGroup } from '../types';
import { logger } from '../utils/logger';

const registerSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(1),
  password: z.string().min(1),
  name: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  bloodGroup: z.string().optional(),
  role: z.string().default('patient'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const generateTokenPair = (userId: string, email: string, roles: UserRole[]) => {
  const accessToken = jwt.sign(
    { sub: userId, id: userId, email, roles, role: roles[0], type: 'access' } as any,
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn } as jwt.SignOptions,
  );
  const refreshToken = jwt.sign(
    { sub: userId, id: userId, email, roles, role: roles[0], type: 'refresh' } as any,
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn } as jwt.SignOptions,
  );
  return { accessToken, refreshToken, token: accessToken };
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      const message = issue ? `${issue.path.join('.')}: ${issue.message}` : 'Validation error';
      res.status(400).json({ success: false, message });
      return;
    }
    const data = parseResult.data;

    const existing = await User.findOne({ email: data.email.toLowerCase().trim() });
    if (existing) {
      res.status(400).json({ success: false, message: 'Email already registered' });
      return;
    }

    let fName = data.firstName;
    let lName = data.lastName;
    if (data.name && (!fName || !lName)) {
      const parts = data.name.trim().split(/\s+/);
      fName = parts[0] || 'User';
      lName = parts.slice(1).join(' ') || parts[0];
    }
    fName = fName || 'User';
    lName = lName || 'Member';

    let assignedRole: UserRole = UserRole.PATIENT;
    if (data.role === 'donor') {
      assignedRole = UserRole.DONOR;
    } else if (data.role === 'admin') {
      assignedRole = UserRole.ADMIN;
    }

    const passwordHash = await bcrypt.hash(data.password, config.bcrypt.saltRounds);
    const user = await User.create({
      email: data.email.toLowerCase().trim(),
      phone: data.phone.trim(),
      passwordHash,
      roles: [assignedRole],
    });

    const validBloodGroup = Object.values(BloodGroup).includes(data.bloodGroup as BloodGroup)
      ? (data.bloodGroup as BloodGroup)
      : BloodGroup.A_POS;

    const profile = await Profile.create({
      userId: user._id,
      firstName: fName,
      lastName: lName,
      bloodGroup: validBloodGroup,
    });

    if (assignedRole === UserRole.DONOR) {
      await Donor.create({
        userId: user._id,
        bloodGroup: validBloodGroup,
        isAvailable: true,
        locationConsentGranted: true,
        location: { type: 'Point', coordinates: [77.5946, 12.9716] },
      }).catch(() => {});
    }

    const tokens = generateTokenPair(user.id, user.email, user.roles);
    logger.info('User registered', { userId: user.id, role: assignedRole });

    const userPayload = {
      id: user.id,
      _id: user.id,
      name: `${profile.firstName} ${profile.lastName}`.trim(),
      email: user.email,
      phone: user.phone,
      bloodGroup: profile.bloodGroup || 'A+',
      role: data.role === 'donor' ? 'donor' : 'recipient',
      roles: user.roles,
      isAvailable: true,
      isVerified: user.isVerified,
    };

    res.status(201).json({
      success: true,
      token: tokens.token,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: userPayload,
      data: {
        user: userPayload,
        ...tokens,
      },
    });
  } catch (error: any) {
    logger.error('Registration error', { error: error.message });
    res.status(400).json({ success: false, message: error.message || 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await User.findOne({ email: data.email.toLowerCase().trim() }).select('+passwordHash');
    if (!user) {
      res.status(400).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    if (!user.isActive) {
      res.status(401).json({ success: false, message: 'Account is inactive' });
      return;
    }

    const isValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValid) {
      res.status(400).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    user.lastLogin = new Date();
    await user.save();

    const profile = await Profile.findOne({ userId: user._id });

    const tokens = generateTokenPair(user.id, user.email, user.roles);
    logger.info('User logged in', { userId: user.id });

    const userPayload = {
      id: user.id,
      _id: user.id,
      name: profile ? `${profile.firstName} ${profile.lastName}`.trim() : user.email,
      email: user.email,
      phone: user.phone,
      bloodGroup: profile?.bloodGroup || 'A+',
      role: user.roles.includes(UserRole.DONOR) ? 'donor' : 'recipient',
      roles: user.roles,
      isAvailable: true,
      isVerified: user.isVerified,
    };

    res.status(200).json({
      success: true,
      token: tokens.token,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: userPayload,
      data: {
        user: userPayload,
        ...tokens,
      },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Login failed' });
  }
};

export const updateLocation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { lat, lng } = req.body;
    const userId = req.user!._id;

    if (lat !== undefined && lng !== undefined) {
      await Donor.findOneAndUpdate(
        { userId },
        {
          location: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          locationConsentGranted: true,
        },
      );
    }

    res.status(200).json({ success: true, message: 'Location updated' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!._id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    const profile = await Profile.findOne({ userId: user._id });
    const userPayload = {
      id: user.id,
      _id: user.id,
      name: profile ? `${profile.firstName} ${profile.lastName}`.trim() : user.email,
      email: user.email,
      phone: user.phone,
      bloodGroup: profile?.bloodGroup || 'A+',
      role: user.roles.includes(UserRole.DONOR) ? 'donor' : 'recipient',
      roles: user.roles,
      isAvailable: true,
      isVerified: user.isVerified,
    };
    res.status(200).json(userPayload);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken: token } = req.body;
  if (!token) {
    sendError(res, 400, ErrorCodes.VALIDATION_ERROR, 'Refresh token required');
    return;
  }

  try {
    const payload = jwt.verify(token, config.jwt.refreshSecret) as JwtPayload;
    if (payload.type !== 'refresh') {
      sendError(res, 401, ErrorCodes.TOKEN_INVALID, 'Invalid token type');
      return;
    }

    const user = await User.findById(payload.sub);
    if (!user || !user.isActive) {
      sendError(res, 401, ErrorCodes.UNAUTHORIZED, 'User not found or inactive');
      return;
    }

    const tokens = generateTokenPair(user.id, user.email, user.roles);
    res.status(200).json({ success: true, ...tokens });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      sendError(res, 401, ErrorCodes.TOKEN_EXPIRED, 'Refresh token expired, please log in again');
    } else {
      sendError(res, 401, ErrorCodes.TOKEN_INVALID, 'Invalid refresh token');
    }
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.user!._id);
  if (!user) {
    sendError(res, 404, ErrorCodes.NOT_FOUND, 'User not found');
    return;
  }
  const profile = await Profile.findOne({ userId: user._id });
  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user.id,
        _id: user.id,
        name: profile ? `${profile.firstName} ${profile.lastName}`.trim() : user.email,
        email: user.email,
        phone: user.phone,
        bloodGroup: profile?.bloodGroup || 'A+',
        roles: user.roles,
        isVerified: user.isVerified,
        lastLogin: user.lastLogin,
      },
      profile,
    },
  });
};
