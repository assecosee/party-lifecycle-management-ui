/* eslint-disable @typescript-eslint/no-namespace */
export interface User {
  /**
   * Unique identifier of user
   */
  readonly id?: string;
  /**
   * The given name (first name) of the user.
   */
  firstName?: string;
  /**
   * The user's surname (family name or last name).
   */
  lastName?: string;
  /**
   * The name displayed in the address book for the user.
   * This is usually the combination of the user's first name, middle initial and last name.
   */
  displayName?: string;
  /**
   * Unique username of user
   */
  username?: string;
  /**
   * ID in external system
   */
  externalId?: string;
  /**
   * Type of user
   */
  userType?: User.UserTypeEnum;
  /**
   * Indicates the user's preferred written or spoken languages and is generally used for selecting a localized
   *  user interface. Preffered language tag is composed from a sequence of one or more “subtags” separated by a
   * hyphen. Each subtag refines or narrows the range of language variants identified by the tag.
   *  For practical purpose, we are using a limited subset of most commonly used subtags in formatted
   *  as xx-yyyy-zz where   xx is a mandatory primary subtag as ISO 639-1 two-character code (lowercase)
   * yyyy is an optional script subtag as ISO 15924 four-character code (first letter capitalized)
   * zz is an optional region subtag as ISO 3166-1 two-character code (uppercase)
   */
  preferredLanguage?: string;
  /**
   * Used to indicate the User's default location for purposes of localizing such items as currency,
   * date time format, or numerical representations. Locale language tag is composed from a sequence of
   * one or more “subtags” separated by a hyphen. Each subtag refines or narrows the range of language variants
   *  identified by the tag. For practical purpose, we are using a limited subset of most commonly used
   * subtags in formatted as xx-yyyy-zz where xx is a mandatory primary subtag as ISO 639-1 two-character code
   *  (lowercase) yyyy is an optional script subtag as ISO 15924 four-character code (first letter capitalized)
   *  zz is an optional region subtag as ISO 3166-1 two-character code (uppercase)
   */
  locale?: string;
  /**
   * The User's time zone, in IANA Time Zone database format [RFC6557],
   *  also known as the \"Olson\" time zone database format [Olson-TZ] (e.g., \"America/Los_Angeles\").
   */
  timezone?: string;
  /**
   * true if the account is enabled; otherwise, false.
   */
  accountEnabled?: boolean;
  /**
   * Customer number of user
   */
  customerNumber?: string;
  /**
   * Email address of user
   */
  email?: string;
  /**
   * A flag indicating if email has been verified for the user
   */
  emailVerified?: boolean;
  /**
   * Phone number of user
   */
  phoneNumber?: string;
  /**
   * A flag indicating if phone number has been verified for the user
   */
  phoneNumberVerified?: boolean;
  /**
   * Url to hint picture
   */
  readonly hintPictureUrl?: string;
  /**
   * Url to profile picture
   */
  readonly profilePictureUrl?: string;
  /**
   * true if account is locked
   */
  accountLocked?: boolean;
  /**
   * Date and time when lock expires
   */
  accountLockExpires?: Date;
  /**
   * Reason why account is locked
   */
  accountLockedReason?: string;
  /**
   * Date and time of last directory login
   */
  readonly lastDirectoryLogin?: Date;
  /**
   * Last time when security answer vas validated
   */
  readonly lastAnswerValidated?: Date;
  /**
   * Date and time of last password change
   */
  readonly lastPasswordReset?: Date;
  /**
   * A flag indicating if multifactor authentication is enabled for the user
   */
  multifactorEnabled?: boolean;
  /**
   * Required actions needed to be done by user
   */
  requiredActions?: Array<User.RequiredActionsEnum>;
  /**
   * Additional attributes of the user
   */
  attributes?: { [key: string]: string };
  roles?: Array<string>;
  /**
   * Organization unit code
   */
  readonly ouCode?: string;
  /**
   * A string identifier, typically numeric or alphanumeric, assigned to a person,
   * typically based on order of hire or association with an organization.
   */
  employeeNumber?: string;
  /**
   * Identifies the name of a cost center.
   */
  costCenter?: string;
  /**
   * Identifies the name of an organization.
   */
  organization?: string;
  /**
   * Identifies the name of an devision.
   */
  division?: string;
  /**
   * Identifies user current job title.
   */
  jobTitle?: string;
  /**
   * Identifies the name of an department.
   */
  department?: string;
  /**
   * User id of this users Manager
   */
  managerId?: string;
  /**
   * Nameof this users Manager
   */
  readonly managerDisplayName?: string;
}
export namespace User {
  export type UserTypeEnum = 'customer' | 'prospect' | 'internal-agent' | 'external-agent' | 'admin';
  export const UserTypeEnum = {
    Customer: 'customer' as UserTypeEnum,
    Prospect: 'prospect' as UserTypeEnum,
    InternalAgent: 'internal-agent' as UserTypeEnum,
    ExternalAgent: 'external-agent' as UserTypeEnum,
    Admin: 'admin' as UserTypeEnum
  };
  export type RequiredActionsEnum = 'change-password-on-next-login' | 'verify-email' | 'verify-phone-number';
  export const RequiredActionsEnum = {
    ChangePasswordOnNextLogin: 'change-password-on-next-login' as RequiredActionsEnum,
    VerifyEmail: 'verify-email' as RequiredActionsEnum,
    VerifyPhoneNumber: 'verify-phone-number' as RequiredActionsEnum
  };
}
