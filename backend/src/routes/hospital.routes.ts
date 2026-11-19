import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { getNearbyHospitals, getHospitalById } from '../controllers/hospital.controller';

export const hospitalRouter = Router();

hospitalRouter.get('/nearby', asyncHandler(getNearbyHospitals));
hospitalRouter.get('/:id', asyncHandler(getHospitalById));
