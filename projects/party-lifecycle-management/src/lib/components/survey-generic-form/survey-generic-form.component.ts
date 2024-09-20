import { AfterViewInit, Component, Injector, OnInit } from '@angular/core';
import { AseeFormGroup, FormField, Task, UIService } from '@asseco/common-ui';
import { L10N_LOCALE, L10nLocale } from 'angular-l10n';
import { SurveyService } from '../../services/survey.service';
import { SurveyQuestion, SurveySection, SurveyTemplate } from '../../model/survey-template';
import { UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';

interface RuleData {
  key?: string;
  value: string;
}

@Component({
  selector: 'party-lcm-survey-generic-form',
  templateUrl: './survey-generic-form.component.html',
  styleUrl: './survey-generic-form.component.scss'
})
export class SurveyGenericFormComponent implements OnInit, AfterViewInit {
  public locale: L10nLocale;
  public taskId: string | undefined;
  public task: Task | undefined ;
  public formGroup: UntypedFormGroup = new UntypedFormGroup({});
  public surveyTemplate: SurveyTemplate | undefined;
  public templateId = 'kyc-fl';
  public items: string [] = [];
  public listFormFields: FormField [] = [];
  public hashMapFormFields: { [key: string]: FormField [] } = {};
  public submitDisabled = false;
  public submitButtonName = 'Continue';
  public listComplexValidators: { [key: string]: RuleData [] } = {};
  constructor(
    protected surveyService: SurveyService,
    protected injector: Injector,
    protected uiService: UIService
  ) {
    this.locale = this.injector.get(L10N_LOCALE);
  }
  ngAfterViewInit(): void {
    // this.listenValue();
  }
  ngOnInit(): void {
    this.initSurveyForm(this.templateId);
  }
  public loadedFormGroup(listFormFields: FormField []) {
    this.initForm(listFormFields);
  }
  public complate() {
    console.log(this.formGroup.getRawValue());
  }
  private initSurveyForm(templateId: any) {
    this.surveyService.getTemplateDetails(templateId).subscribe(
      (res: SurveyTemplate) => {
        this.surveyTemplate = res;
        this.uiService.setTitle(this.surveyTemplate.info.title);
        this.transformSurveyTemplate(this.surveyTemplate);
        this.surveyTemplate.sections.forEach(
          (s: SurveySection) => {
            this.items.push(s.title);
          }
        );
      }
    );
  }

  private initForm(listFormFields: FormField []){
    for (const field of listFormFields) {
      let value = null;
      value = field.data.type === 'boolean' ? false : value;
      if (field.data.type === 'boolean' &&
        field.constraints) {
        const index = field.constraints.findIndex((constraint) => constraint.kind === 'required');
        if (index > -1) {
          field.constraints[index].kind = 'requiredTrue';
        }
      }
      if (field.data.type === 'string' && field.properties.componentType) {
        field.data.type = field.properties.componentType;
      }
      if ((field.data.type === 'string' || field.data.type === 'boolean'
        || field.data.type === 'iso-date' || field.data.type === 'enum') && field.properties.inputType) {
        field.data.type = field.properties.inputType;
      }
      if (field.data.value || field.data.value === 0) {
        value = field.data.value;
        value = !value && field.data.type === 'string' ? '' : value;

        if (field.properties.inputType === 'multi-select') {
          // render default value for multi-select
          value = value !== '' ? JSON.parse(value) : '';
        }
      }
      const control = new UntypedFormControl(value, this.appendValidators(field));
      // for HTML we do not need a component
      if (field.data.type !== 'html' && (field.properties && !field.properties.componentType)) {
        if (field.readonly) {
          control.disable();
        }
        this.formGroup.addControl(field.id,
          control
        );
      }
      this.appendComplexValidators(field);
    }
  }

  appendComplexValidators(field: FormField) {
    this.listComplexValidators[field.id] = [];
    if (field.constraints) {
      if (field.constraints.length > 0) {
        for (const constraint of field.constraints) {
          if(constraint.value !== undefined && constraint.value ) {
            this.listComplexValidators[field.id].push({
              key: constraint.kind,
              value: constraint.value
            });
          }
        }
      }
    }
  }

  private transformSurveyTemplate(surveyTemplate: SurveyTemplate) {
    surveyTemplate.sections.forEach((s: SurveySection, i) => {
      const listFormField: FormField [] = [];
      s.questions.forEach((q: SurveyQuestion, l) => {
        listFormField.push(
          {
            id: q.questionId,
            label: q.title,
            data: {
              type: this.getType(q.kind),
              value: null
            },
            properties: {
              wide: true,
            },
            constraints: [
              {
                kind: q.isMandatory ? 'required': ''
              }
            ],
            enumProps: q.possibleOptions ? this.getEnumProps(q.possibleOptions) : null
          }
        );
        if(q.validationRules && q.validationRules !== undefined) {
          const validationRuleKey = Object.keys(q.validationRules);
          validationRuleKey.forEach((k: string) => {
            listFormField[l].constraints?.push(
              {
                kind: k,
                value: this.readValueFromHashMap(q.validationRules, k)
              }
            );
          });
        }
      });
      this.hashMapFormFields[i] = listFormField;
    });
  }
  readValueFromHashMap(validationRules: { [key: string]: string } | undefined, k: string): any {
    if(validationRules && validationRules !== undefined) {
      return validationRules[k];
    }
    return null;
  }
  private getEnumProps(possibleOptions: { [key: string]: string}): any [] {
    const keys =  Object.keys(possibleOptions);
    const options: any[] = [];
    keys.forEach((k: string) => {
      options.push(
        {
          label: possibleOptions[k],
          value: possibleOptions[k]
        }
      );
    });
    return options;
  }
  private getType(kind: string): string {
    switch(kind) {
      case'text':
        return 'string';
        break;
      case'numeric':
        return 'long';
        break;
      case'date':
        return 'date';
        break;
      case'bool':
        return 'boolean';
        break;
      case'options':
        return 'custom-enum';
        break;
      case'multiple-options':
        return 'multi-select';
        break;
      case'currency':
        return 'currency';
        break;
      case'unit-of-measure':
        return 'string';
        break;
      case'complex':
        return 'string';
        break;
      default:
        return 'string';
        break;
    }
  }
  private appendValidators(field: FormField) {
    const validators: ValidatorFn[] = [];
    if (field.constraints) {
      if (field.constraints.length > 0) {
        for (const constraint of field.constraints) {
          if (constraint.kind === 'required') {
            validators.push(Validators.required);
          } else if (constraint.kind === 'regex') {
            validators.push(Validators.pattern(constraint.value));
          } else if (constraint.kind === 'min') {
            validators.push(Validators.min(constraint.value));
          } else if (constraint.kind === 'max') {
            validators.push(Validators.max(constraint.value));
          } else if (constraint.kind === 'maxElement') {
            validators.push(Validators.nullValidator);
          } else if (constraint.kind === 'minLength') {
            validators.push(Validators.minLength(constraint.value));
          } else if (constraint.kind === 'requiredTrue') {
            validators.push(Validators.requiredTrue);
          } else if (constraint.kind === 'maxLength') {
            if (field.data.type === 'string') {
              if (constraint.value > 50) {
                field.isTextArea = true;
                field.rows = Math.round(constraint.value / 70);
              }
              field.maxLength = constraint.value;
            }
            validators.push(Validators.maxLength(constraint.value));
          } else if (constraint.kind === 'readonly') {
            field.readonly = true;
          }
        }
      }
    }
    return validators;
  }
  private tryStringToNumber(v: string): any {
    try {
      return parseInt(v, 10);
    } catch {
      console.log(v);
      return v;
    }
  }
}
