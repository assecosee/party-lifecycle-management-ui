import { Case } from './case';
import { IdentificationKindsEnum } from './identificationKindsEnum';

export interface CaseContext {
  party?: CaseContextParty;
}
export interface CaseContextParty {
  partyNumber?: string;
  contactName?: string;
  /**
   * Party kind
   */
  partyKind?: Case.PartyKindEnum;
  partyIdentificationNumber?: string;
  partyIdentificationKind?: IdentificationKindsEnum;
  registrationProfile?: string;
  placeOfBirth?: string;
}
