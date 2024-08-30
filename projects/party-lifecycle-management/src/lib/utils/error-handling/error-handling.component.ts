import { Component, Injector, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { AssecoMaterialModule } from '@asseco/components-ui';
import { L10N_LOCALE, L10nIntlModule, L10nLocale, L10nTranslationModule } from 'angular-l10n';

@Component({
  selector: 'error-handling',
  standalone: true,
  imports: [L10nTranslationModule,L10nIntlModule,AssecoMaterialModule],
  templateUrl: './error-handling.component.html',
  styleUrl: './error-handling.component.scss'
})
export class ErrorHandlingComponent {
  public locale: L10nLocale;
  @Input() control: AbstractControl | null = null;

  // Error message dictionary
  errorMessages: { [key: string]: string } = {
    required: 'Field is required',
    pattern: 'Invalid format',
    minlength: 'Minimum length for field is',
    maxlength: 'Maximum length for field is',
    email: 'You must provide a valid email address',
    invalid_code: 'Code is invalid',
    invalidRegistrationNumber: 'Invalid registration number',
    error: 'An error occurred',
    noSlashesAllowed: 'Slash is not allowed',
    invalidTaxNumber: 'Invalid tax number',
    matDatepickerParse: 'Invalid date format'
  };

  constructor(protected injector: Injector){
    this.locale = injector.get(L10N_LOCALE);
  }

  getErrorMessage(): string[] {
    const errors = this.control?.errors;
    if (!errors) {
      return [];
    }

    return Object.keys(errors).map(key => {
      if (key === 'minlength' || key === 'maxlength') {
        const length = errors[key].requiredLength;
        return `${this.errorMessages[key]}: ${length}`;
      }

      return this.errorMessages[key] || 'Invalid field';
    });
  }
}
