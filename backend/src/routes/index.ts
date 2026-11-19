import { Router } from 'express';
import { authRouter } from './auth.routes';
import { profileRouter } from './profile.routes';
import { donorRouter } from './donor.routes';
import { bloodRequestRouter } from './blood-request.routes';
import { bloodBankRouter } from './blood-bank.routes';
import { emergencyRouter } from './emergency.routes';
import { hospitalRouter } from './hospital.routes';
import { adminRouter } from './admin.routes';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/profile', profileRouter);
apiRouter.use('/donors', donorRouter);
apiRouter.use('/blood-requests', bloodRequestRouter);
apiRouter.use('/requests', bloodRequestRouter); // compatibility with /api/requests
apiRouter.use('/blood-banks', bloodBankRouter);
apiRouter.use('/emergency', emergencyRouter);
apiRouter.use('/hospitals', hospitalRouter);
apiRouter.use('/admin', adminRouter);
