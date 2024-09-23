export interface ServicingInfo {
  /**
   * OU code for organization unit that is managing case
   */
  readonly orgUnit?: string;
  /**
   * Unique identifier of agent who is managing case
   */
  readonly agent?: string;
  /**
   //  * Unique identifier (channel code) of channel from which customer was came
   */
  readonly channel?: string;
};
