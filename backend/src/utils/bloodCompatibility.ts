import { BloodGroup } from '../types';

// Donor -> compatible recipients
export const BLOOD_COMPATIBILITY_MAP: Record<BloodGroup, BloodGroup[]> = {
  [BloodGroup.O_NEG]:  [BloodGroup.O_NEG, BloodGroup.O_POS, BloodGroup.A_NEG, BloodGroup.A_POS, BloodGroup.B_NEG, BloodGroup.B_POS, BloodGroup.AB_NEG, BloodGroup.AB_POS],
  [BloodGroup.O_POS]:  [BloodGroup.O_POS, BloodGroup.A_POS, BloodGroup.B_POS, BloodGroup.AB_POS],
  [BloodGroup.A_NEG]:  [BloodGroup.A_NEG, BloodGroup.A_POS, BloodGroup.AB_NEG, BloodGroup.AB_POS],
  [BloodGroup.A_POS]:  [BloodGroup.A_POS, BloodGroup.AB_POS],
  [BloodGroup.B_NEG]:  [BloodGroup.B_NEG, BloodGroup.B_POS, BloodGroup.AB_NEG, BloodGroup.AB_POS],
  [BloodGroup.B_POS]:  [BloodGroup.B_POS, BloodGroup.AB_POS],
  [BloodGroup.AB_NEG]: [BloodGroup.AB_NEG, BloodGroup.AB_POS],
  [BloodGroup.AB_POS]: [BloodGroup.AB_POS],
};

export const isCompatible = (donorGroup: BloodGroup, recipientGroup: BloodGroup): boolean => {
  return BLOOD_COMPATIBILITY_MAP[donorGroup]?.includes(recipientGroup) ?? false;
};

/** Returns all donor blood groups that can donate to the given recipient group */
export const getCompatibleDonors = (recipientGroup: BloodGroup): BloodGroup[] => {
  return (Object.entries(BLOOD_COMPATIBILITY_MAP) as [BloodGroup, BloodGroup[]][])
    .filter(([, recipients]) => recipients.includes(recipientGroup))
    .map(([donor]) => donor);
};
