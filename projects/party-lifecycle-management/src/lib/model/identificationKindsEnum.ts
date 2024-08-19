export type IdentificationKindsEnum = 'registration-number' | 'tax-id-number' | 'personal-id-number'
| 'identity-card-number' | 'passport-number' | 'driver-license-number' | 'social-security-number'
| 'agricultural-holding-number' | 'internal-id-number';

export const IdentificationKindsEnum = {
  RegistrationNumber: 'registration-number' as IdentificationKindsEnum,
  TaxIdNumber: 'tax-id-number' as IdentificationKindsEnum,
  PersonalIdNumber: 'personal-id-number' as IdentificationKindsEnum,
  IdentityCardNumber: 'identity-card-number' as IdentificationKindsEnum,
  PassportNumber: 'passport-number' as IdentificationKindsEnum,
  DriverLicenseNumber: 'driver-license-number' as IdentificationKindsEnum,
  SocialSecurityNumber: 'social-security-number' as IdentificationKindsEnum,
  AgriculturalHoldingNumber: 'agricultural-holding-number' as IdentificationKindsEnum,
  InternalIdNumber: 'internal-id-number' as IdentificationKindsEnum
};
