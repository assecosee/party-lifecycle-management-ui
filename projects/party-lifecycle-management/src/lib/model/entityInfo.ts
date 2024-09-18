export interface EntityInfo {
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
}
