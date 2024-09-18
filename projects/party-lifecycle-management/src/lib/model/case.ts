import { EntityInfo } from './entityInfo';
import { IdentificationKindsEnum } from './identificationKindsEnum';
import { PartyReference } from './partyReference';

export interface Case {
  /**
   * Unique identifier of case
   */
  readonly id: string;
  /**
   * Type of party maintenance administrativa plan, bpm proccess
   */
  readonly administrativePlanName?: string;
  /**
   * Type of party maintenance administrativa plan, bpm proccess
   */
  readonly administrativePlanId?: string;
  /**
   * Status of case
   */
  readonly status?: Case.StatusEnum;
  /**
   * Case priority. Default is medium
   */
  priority?: Case.PriorityEnum;
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
  partyReference: PartyReference;
  /**
   * DB creation time
   */
  readonly creationTime?: Date;
  /**
   * Unique identifier of application agent/creator/owner/initiator
   */
  readonly createdBy?: string;
  /**
   * DB modified time
   */
  readonly lastModifiedTime?: Date;
  /**
   * Unique identifier of agent, agent code or agent name
   */
  readonly lastModifiedBy?: string;
  entityInfo?: EntityInfo;
}
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Case {
  export type StatusEnum = 'opened' | 'active' | 'rejected' | 'canceled' | 'approved' | 'completed';
  export const StatusEnum = {
    Opened: 'opened' as StatusEnum,
    Active: 'active' as StatusEnum,
    Rejected: 'rejected' as StatusEnum,
    Canceled: 'canceled' as StatusEnum,
    Approved: 'approved' as StatusEnum,
    Completed: 'completed' as StatusEnum
  };
  export type PriorityEnum = 'low' | 'medium' | 'high' | 'critical';
  export const PriorityEnum = {
    Low: 'low' as PriorityEnum,
    Medium: 'medium' as PriorityEnum,
    High: 'high' as PriorityEnum,
    Critical: 'critical' as PriorityEnum
  };
  export type PartyKindEnum = 'individual' | 'organization';
  export const PartyKindEnum = {
    Individual: 'individual' as PartyKindEnum,
    Organization: 'organization' as PartyKindEnum
  };
}
