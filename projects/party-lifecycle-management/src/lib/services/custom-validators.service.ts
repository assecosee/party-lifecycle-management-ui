import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class CustomValidatorsService {
  constructor() {}

  // Validator for a single form control
  static registrationNumberFormat(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      // Convert value to string and handle empty or null values
      if (!value) {
        return { invalidRegistrationNumber: true };
      }

      // Ensure value is a string before checking the format
      const stringValue = String(value);
      const validFormat = /^[A-Z0-9]{6,13}$/; // Example format: alphanumeric, 6 to 10 characters

      // If the string value doesn't match the format, return an error object
      if (!validFormat.test(stringValue)) {
        return { invalidRegistrationNumber: true };
      }

      // If the value is valid, return null (no error)
      return null;
    };
  }

  // Validator to disallow slashes in any text input
  static noSlashesAllowed(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      // If value is empty there is no error
      if (!value) {
        return null;
      }

      // Ensure value is a string before checking the format
      const stringValue = String(value);

      if (stringValue.includes('/')) {
        return { noSlashesAllowed: true };
      }

      return null; // No error
    };
  }

  // Validator to allow only alphabetic characters (letters) without spaces in any text input
  static onlyCharactersAllowed(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      // If the value is empty, return null (no error)
      if (!value) {
        return null;
      }

      // Ensure the value is a string before checking the format
      const stringValue = String(value);

      // Regex pattern to match only letters (both uppercase and lowercase), no spaces allowed
      const onlyCharactersPattern = /^[\p{L}]+$/u;

      // If the string does not match the pattern, return an error
      if (!onlyCharactersPattern.test(stringValue)) {
        return { onlyCharactersAllowed: true };
      }

      return null; // No error
    };
  }

  static parentLastNameRequired(
    gender: string,
    maritalStatus: string,
    parentLastName: string
  ): ValidatorFn {
    return (control: AbstractControl) => {
      const formGroup = control.parent;
      if (!formGroup) {
        return null; // If the formGroup is not available, return null
      }

      const genderControl = formGroup.get(gender);
      const maritalStatusControl = formGroup.get(maritalStatus);
      const parentLastNameControl = formGroup.get(parentLastName);

      // Check if both controls have the specific required values
      if (
        genderControl?.value &&
        genderControl.value === 'female' &&
        maritalStatusControl &&
        maritalStatusControl.value?.literal === 'married' &&
        parentLastNameControl &&
        !parentLastNameControl.value
      ) {
        return { required: true }; // Return error if the control is empty
      }

      return null; // If condition is not met, no error
    };
  }

  // Validator to allow only letters and hyphens in any text input (no spaces allowed)
  static onlyCharactersAndHyphensAllowed(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      // If the value is empty, return null (no error)
      if (!value) {
        return null;
      }

      // Ensure the value is a string before checking the format
      const stringValue = String(value);

      // Regex pattern to match only letters (both uppercase and lowercase) and hyphens, no spaces allowed
      const onlyCharactersPattern = /^[\p{L}-]+$/u;

      // If the string does not match the pattern, return an error
      if (!onlyCharactersPattern.test(stringValue)) {
        return { onlyCharactersAndHyphensAllowed: true };
      }

      return null; // No error
    };
  }

  // Validator to disallow slashes in any text input
  static validateRegNumIndividualPerson(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      // If value is empty there is no error
      if (!value) {
        return { invalidRegistrationNumber: true };
      }

      // Ensure value is a string before checking the format
      const stringValue = String(value);



      if (!this.parsePersonalNumber(stringValue)) {
        return { invalidRegistrationNumber: true };
      }

      return null; // No error
    };
  }

  // private static validRegNumIndividualPerson(jmbg: any) {
  //   if (
  //     typeof jmbg !== 'undefined' &&
  //     jmbg !== null &&
  //     jmbg.length === 13 &&
  //     this.validNumber(jmbg)
  //   ) {
  //     const day = parseInt(jmbg.substring(0, 2), 10);
  //     const month = parseInt(jmbg.substring(2, 4), 10) - 1;
  //     let year = parseInt(jmbg.substring(4, 7), 10);

  //     // Ako je vrednost godine manja od 800, onda je 2000-ti vek, inače 1900-ti
  //     if (year < 800) {
  //       year = 2000 + year;
  //     } else {
  //       year = 1000 + year;
  //     }

  //     if (this.validDate(new Date(year, month, day))) {
  //       return (
  //         /^60|66$/.test(jmbg.substring(7, 9)) ||
  //         parseInt(jmbg.charAt(12), 10) ===
  //           this.mod11(
  //             jmbg.substring(0, 12),
  //             // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  //             function(kb: any) {
  //               return kb === 11 ? 0 : kb === 10 ? 'X' : kb;
  //             }
  //           )
  //       );
  //     }
  //   }
  //   return false;
  // }

  private static parsePersonalNumber(personalNumber: string) {
    if (personalNumber && personalNumber.length === 13) {
      const day = Number(personalNumber[0] + personalNumber[1]);
      const mounth = Number(personalNumber[2] + personalNumber[3]);
      const year = Number(personalNumber[4] + personalNumber[5] + personalNumber[6]);
      const region = personalNumber[7] + personalNumber[8];
      const identificationNumber = Number(personalNumber[9] + personalNumber[10] + personalNumber[11]);
      const controlNumber = Number(personalNumber[12]);
      let correctControlNumber =
        11 -
        (7 * (Number(personalNumber[0]) + Number(personalNumber[6])) +
          6 * (Number(personalNumber[1]) + Number(personalNumber[7])) +
          5 * (Number(personalNumber[2]) + Number(personalNumber[8])) +
          4 * (Number(personalNumber[3]) + Number(personalNumber[9])) +
          3 * (Number(personalNumber[4]) + Number(personalNumber[10])) +
          2 * (Number(personalNumber[5]) + Number(personalNumber[11]))) % 11;
      if (correctControlNumber > 9) {
        correctControlNumber = 0;
      }
      return this.checkPersonalNumber(day, mounth, year, region, identificationNumber, controlNumber, correctControlNumber);
    }
    return false;
  }

  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  private static checkPersonalNumber(
    day: number,
    mounth: number,
    year: number,
    region: string,
    identificationNumber: number,
    controlNumber: number,
    correctControlNumber: number) {
    if(region === '66' || region === '06') {
      return true;
    }
    if (controlNumber !== correctControlNumber) {
      return false;
    } else {
      return true;
    }
  }


  // Validator to disallow slashes in any text input
  static validateRegNumLegalEntity(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      // If value is empty there is no error
      if (!value) {
        return { invalidRegistrationNumber: true };
      }

      // Ensure value is a string before checking the format
      const stringValue = String(value);

      if (!this.validRegNumLegalEntity(stringValue)) {
        return { invalidRegistrationNumber: true };
      }

      return null; // No error
    };
  }
  // Validator to disallow slashes in any text input
  static validateTaxNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      // If value is empty there is no error
      if (!value) {
        return { invalidTaxNumber: true };
      }

      // Ensure value is a string before checking the format
      const stringValue = String(value);

      if (!this.validTaxNumber(stringValue)) {
        return { invalidTaxNumber: true };
      }

      return null; // No error
    };
  }

  private static validTaxNumber(pib: any) {
    if (pib.length === 9 && this.validNumber(pib)) {
      let sum = 10;
      for (let i = 0; i < 8; i++) {
        sum = (sum + parseInt(pib.charAt(i), 10)) % 10;
        sum = ((sum === 0 ? 10 : sum) * 2) % 11;
      }
      sum = (11 - sum) % 10;
      return parseInt(pib.charAt(8), 10) === sum;
    }
    return false;
  }

  private static validRegNumLegalEntity(mb: any) {
    return (
      mb.length === 8 &&
      this.validNumber(mb) &&
      parseInt(mb.charAt(7), 10) ===
        this.mod11(
          mb.substring(0, 7),
          // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
          function(kb: any) {
            return kb > 9 ? 0 : kb;
          }
        )
    );
  }

  // private static validDate(value: any) {
  //   if (Object.prototype.toString.call(value) === '[object Date]') {
  //     return !isNaN(value.getTime());
  //   }
  //   return false;
  // }

  private static validNumber(value: any) {
    if (typeof value !== 'undefined' && value !== null) {
      value = value.replace(',', '.');
      return !isNaN(parseFloat(value)) && isFinite(value);
    }
    return false;
  }

  private static mod11(num: any, additionalCondition: any) {
    let kb = 0;
    for (let i = num.length - 1, multiplier = 2; i >= 0; i--) {
      kb += parseInt(num.charAt(i), 10) * multiplier;
      multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }
    kb = 11 - (kb % 11);
    return typeof additionalCondition === 'undefined'
      ? kb
      : additionalCondition(kb);
  }

  static nonResidentCodeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      // Regular expression to match only numbers, E, +, and -
      const validPattern = /^[0-9E\+\-]*$/;

      if (!value) {
        return null; // Allow empty values (optional)
      }

      // Check if value matches the pattern
      const isValid = validPattern.test(value);
      return isValid ? null : { invalidFormat: true };
    };
  }
}
