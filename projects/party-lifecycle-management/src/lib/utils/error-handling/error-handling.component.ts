import { Component, Injector, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { AssecoMaterialModule } from '@asseco/components-ui';
import { L10N_LOCALE, L10nIntlModule, L10nLocale, L10nTranslationModule } from 'angular-l10n';

@Component({
  selector: 'error-handling',
  standalone: true,
  imports: [L10nTranslationModule, L10nIntlModule, AssecoMaterialModule],
  templateUrl: './error-handling.component.html',
  styleUrl: './error-handling.component.scss'
})
export class ErrorHandlingComponent {
  public locale: L10nLocale;
  @Input() control: AbstractControl | null = null;

  // Error message dictionary
  errorMessages: { [key: string]: string } = {
    required: 'errorLblFieldIsRequired',
    pattern: 'errorLblInvalidFormat',
    minlength: 'errorLblMinimumLengthForFieldIs',
    maxlength: 'errorLblMaximumLengthForFieldIs',
    email: 'errorLblInvalidEmailAddress',
    invalid_code: 'errorLblCodeIsInvalid',
    invalidRegistrationNumber: 'errorLblInvalidRegistrationNumber',
    error: 'errorLblAnErrorOccurred',
    noSlashesAllowed: 'errorLblSlashNotAllowed',
    invalidTaxNumber: 'errorLblInvalidTaxNumber',
    matDatepickerParse: 'errorLblInvalidDateFormat',
    onlyCharactersAllowed: 'errorLblOnlyCharactersAllowed',
    onlyCharactersAndHyphensAllowed: 'errorLblOnlyCharactersAndHyphensAllowed',
    max: 'errorLblMaxNumber',
    min: 'errorLblMinNumber',
    dateInPast: 'errorLblDateInPast',
    dateInFuture: 'errorLblDateInFuture'
  };

  constructor(protected injector: Injector) {
    this.locale = injector.get(L10N_LOCALE);
  }

  getErrorMessage(): { key: string; value?: number }[] {
    const errors = this.control?.errors;
    if (!errors) {
      return [];
    }

    return Object.keys(errors).map(key => {
      if (key === 'minlength' || key === 'maxlength') {
        console.log('desi se');
        const requiredLength = errors[key].requiredLength;
        return { key: this.errorMessages[key], value: requiredLength };
      }

      return { key: this.errorMessages[key] || 'Invalid field', value: null };
    });
  }

}
