import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class CustomValidatorsService {

  constructor() { }

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
      const validFormat = /^[A-Z0-9]{6,13}$/;  // Example format: alphanumeric, 6 to 10 characters

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
      const onlyCharactersPattern = /^[A-Za-z]+$/;

      // If the string does not match the pattern, return an error
      if (!onlyCharactersPattern.test(stringValue)) {
        return { onlyCharactersAllowed: true };
      }

      return null; // No error
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
      const onlyCharactersPattern = /^[A-Za-z-]+$/;

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
        return { invalidRegistrationNumber: true };;
      }

      // Ensure value is a string before checking the format
      const stringValue = String(value);

      if (!this.validRegNumIndividualPerson(stringValue)) {
        return { invalidRegistrationNumber: true };
      }

      return null; // No error
    };
  }

  // Validator to disallow slashes in any text input
  static validateRegNumLegalEntity(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      // If value is empty there is no error
      if (!value) {
        return { invalidRegistrationNumber: true };;
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
        sum = (sum === 0 ? 10 : sum) * 2 % 11;
      }
      sum = (11 - sum) % 10;
      return parseInt(pib.charAt(8), 10) === sum;
    }
    return false;
  };

  private static validRegNumLegalEntity(mb: any) {
    return mb.length === 8 &&
      this.validNumber(mb) &&
      parseInt(mb.charAt(7), 10) === this.mod11(mb.substring(0, 7),
        // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
        function(kb: any) { return kb > 9 ? 0 : kb; });
  };


  private static validRegNumIndividualPerson(jmbg: any) {
    if (typeof jmbg !== 'undefined' && jmbg !== null &&
      jmbg.length === 13 && this.validNumber(jmbg)) {
      const day = parseInt(jmbg.substring(0, 2), 10);
      const month = parseInt(jmbg.substring(2, 4), 10) - 1;
      const year = parseInt('2' + jmbg.substring(4, 7), 10);
      if (this.validDate(new Date(year, month, day))) {
        return /^60|66$/.test(jmbg.substring(7, 9)) ||
          parseInt(jmbg.charAt(12), 10) === this.mod11(jmbg.substring(0, 12),
            // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
            function(kb: any) { return kb === 11 ? 0 : ((kb === 10) ? 'X' : kb); });
      }
    }
    return false;
  };

  private static validDate(value: any) {
    if (Object.prototype.toString.call(value) === '[object Date]') { return !isNaN(value.getTime()); }
    return false;
  };

  private static validNumber(value: any) {
    if (typeof value !== 'undefined' && value !== null) {
      value = value.replace(',', '.');
      return !isNaN(parseFloat(value)) && isFinite(value);
    }
    return false;
  };

  private static mod11(num: any, additionalCondition: any) {
    let kb = 0;
    for (let i = num.length - 1, multiplier = 2; i >= 0; i--) {
      kb += parseInt(num.charAt(i), 10) * multiplier;
      multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }
    kb = 11 - (kb % 11);
    return (typeof additionalCondition === 'undefined') ? kb : additionalCondition(kb);
  }






}
