import { Component, Injector, OnInit } from '@angular/core';
import { AseeFormGroup, Task } from '@asseco/common-ui';
import { L10N_LOCALE, L10nLocale } from 'angular-l10n';
import { SurveyService } from '../../services/survey.service';
import { SurveySection, SurveyTemplate } from '../../model/survey-template';

@Component({
  selector: 'lib-survey-generic-form',
  templateUrl: './survey-generic-form.component.html',
  styleUrl: './survey-generic-form.component.scss'
})
export class SurveyGenericFormComponent implements OnInit {
  public locale: L10nLocale;
  public taskId: string | undefined;
  public task: Task | undefined ;
  public formGroup: AseeFormGroup | undefined;
  public surveyTemplate: SurveyTemplate | undefined;
  public templateId = 'kyc-fl';
  public items: string [] = [];
  constructor(
    protected surveyService: SurveyService,
    protected injector: Injector
  ) {
    this.locale = this.injector.get(L10N_LOCALE);
  }
  ngOnInit(): void {
    this.initSurveyForm(this.templateId);
  }
  private initSurveyForm(templateId: any) {
    this.surveyService.getTemplateDetails(templateId).subscribe(
      (res: SurveyTemplate) => {
        this.surveyTemplate = res;
        console.log('RES SURVEY', res);
        this.surveyTemplate.sections.forEach(
          (s: SurveySection) => {
            this.items.push(s.title);
          }
        );
      }
    );
  }
}
