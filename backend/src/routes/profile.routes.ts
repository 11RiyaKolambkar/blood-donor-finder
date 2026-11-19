import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  updateBloodGroup,
  addEmergencyContact,
  removeEmergencyContact,
} from '../controllers/profile.controller';
import { authenticate } from '../middleware/auth';

export const profileRouter = Router();

profileRouter.use(authenticate);

profileRouter.get('/', getProfile);
profileRouter.put('/', updateProfile);
profileRouter.patch('/blood-group', updateBloodGroup);
profileRouter.post('/emergency-contacts', addEmergencyContact);
profileRouter.delete('/emergency-contacts/:contactId', removeEmergencyContact);
