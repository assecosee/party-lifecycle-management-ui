import { Case } from './case';
import { IdentificationKindsEnum } from './identificationKindsEnum';

export interface PartyReference {
  /**
   * Unique customer identificator, if party already registered as customer
   */
  partyNumber?: string;
  partyName?: string;
  /**
   * Party kind
   */
  partyKind?: Case.PartyKindEnum;
  partyIdentificationNumber?: string;
  partyIdentificationKind?: IdentificationKindsEnum;
}
