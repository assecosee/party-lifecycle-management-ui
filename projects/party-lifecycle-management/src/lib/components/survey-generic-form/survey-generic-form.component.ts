import { Component, Injector } from '@angular/core';
import { AseeFormGroup, Task } from '@asseco/common-ui';
import { L10N_LOCALE, L10nLocale } from 'angular-l10n';

@Component({
  selector: 'lib-survey-generic-form',
  templateUrl: './survey-generic-form.component.html',
  styleUrl: './survey-generic-form.component.scss'
})
export class SurveyGenericFormComponent {
  public locale: L10nLocale;
  public taskId: string | undefined;
  public task: Task | undefined;
  public formGroup: AseeFormGroup | undefined;
  constructor(protected injector: Injector) {
    this.locale = this.injector.get(L10N_LOCALE);
  }
}
