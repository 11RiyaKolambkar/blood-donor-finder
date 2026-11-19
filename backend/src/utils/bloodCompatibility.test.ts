import { BloodGroup } from '../types';
import { getCompatibleDonors, isCompatible } from './bloodCompatibility';

describe('blood compatibility', () => {
  it('allows O-negative donors to donate to every blood group', () => {
    for (const recipientGroup of Object.values(BloodGroup)) {
      expect(isCompatible(BloodGroup.O_NEG, recipientGroup)).toBe(true);
    }
  });

  it('only allows AB-positive donors to donate to AB-positive recipients', () => {
    for (const recipientGroup of Object.values(BloodGroup)) {
      expect(isCompatible(BloodGroup.AB_POS, recipientGroup)).toBe(
        recipientGroup === BloodGroup.AB_POS,
      );
    }
  });

  it('returns all compatible donor groups for an AB-positive recipient', () => {
    const compatibleDonors = getCompatibleDonors(BloodGroup.AB_POS);
    expect(compatibleDonors).toHaveLength(Object.values(BloodGroup).length);
    expect(compatibleDonors).toEqual(
      expect.arrayContaining(Object.values(BloodGroup)),
    );
  });
});
