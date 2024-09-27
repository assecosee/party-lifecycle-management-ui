import { AfterViewInit, Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { AseeFormGroup, BpmTasksHttpClient, FormField, LoaderService, Task, UIService } from '@asseco/common-ui';
import { L10N_LOCALE, L10nLocale } from 'angular-l10n';
import { SurveyService } from '../../services/survey.service';
import { SurveyQuestion, SurveySection, SurveyTemplate } from '../../model/survey-template';
import { UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { catchError, combineLatest, EMPTY, forkJoin, map, of, Subscription, switchMap, throwError } from 'rxjs';
import { MaterialErrorDialogComponent } from '@asseco/components-ui';
import { MatDialog } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationListenerService } from '@asseco/task-inbox';

interface RuleData {
  key?: string;
  value: string;
}

@Component({
  selector: 'party-lcm-survey-generic-form',
  templateUrl: './survey-generic-form.component.html',
  styleUrl: './survey-generic-form.component.scss'
})
export class SurveyGenericFormComponent implements OnInit, OnDestroy {
  public locale: L10nLocale;
  public taskId: string;
  public task: Task;
  public formGroup: UntypedFormGroup = new UntypedFormGroup({});
  public surveyTemplate: SurveyTemplate | undefined;
  public templateId: string;
  public items: string [] = [];
  public listFormFields: FormField [] = [];
  public hashMapFormFields: { [key: string]: FormField [] } = {};
  public submitDisabled = false;
  public submitButtonName = 'Continue';
  public listComplexValidators: { [key: string]: RuleData [] } = {};
  private routeSubscription: Subscription = new Subscription();
  private taskSubscription: Subscription  = new Subscription();

  constructor(
    protected surveyService: SurveyService,
    protected injector: Injector,
    protected uiService: UIService,
    protected route: ActivatedRoute,
    protected router: Router,
    protected taskService: BpmTasksHttpClient,
    protected loaderService: LoaderService,
    protected dialog: MatDialog,
    protected notificationService: NotificationListenerService
  ) {
    this.locale = this.injector.get(L10N_LOCALE);
  }
  ngOnDestroy(): void {
    if(this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }
  ngAfterViewInit(): void {
    // this.listenValue();
  }
  ngOnInit(): void {
    this.routeSubscription = this.route.params.pipe(
      switchMap((params: Params) => {
        this.templateId = params['templateId'];
        this.taskId = params['taskId'];
        if (params['taskId'] && this.task?.id === params['taskId']) {
          return EMPTY;
        }

        this.task = null as any;

        if (!params['taskId']) {
          this.loaderService.stopLoader();
          this.uiService.setTitle('Error: No task');
          return EMPTY;
        }
        if(this.hashMapFormFields) {
          this.hashMapFormFields = {};
        }
        if(this.listFormFields) {
          this.listFormFields = [];
        }
        if(this.items) {
          this.items = [];
        }
        if(this.surveyTemplate) {
          this.surveyTemplate = null as any;
        }
        if(this.formGroup) {
          this.formGroup = new UntypedFormGroup({});
        }
        return forkJoin([
          this.taskService.getTask(params['taskId']).build(),
          this.initSurveyForm(this.templateId)
        ]).pipe(
          catchError(
            (error: HttpErrorResponse) => {
              this.loaderService.stopLoader();
              this.uiService.setTitle('Error: No task');
              return EMPTY;
            }
          )
        );
      }
      )).subscribe(
        ([task, surverField]: [Task, SurveyTemplate]) => {
          this.task = task;
          if(this.task && this.task !== undefined) {
            this.notificationService.lastBusinessKey = this.task.businessKey;
            this.notificationService.lastDate = new Date();
          }
          this.surveyTemplate = surverField;
          this.uiService.setTitle(this.surveyTemplate.info.title);
          this.transformSurveyTemplate(this.surveyTemplate);
          this.surveyTemplate.sections.forEach(
          (s: SurveySection) => {
            this.items.push(s.title);
          }
          );
        });
  }
  public loadedFormGroup() {
    const listKey = Object.keys(this.hashMapFormFields);
    listKey.forEach((k: string) => {
      if(this.listFormFields.length) {
        this.listFormFields = this.listFormFields.concat(this.hashMapFormFields[k]);
      } else {
        this.listFormFields = this.hashMapFormFields[k];
      }
    });
    this.initForm(this.listFormFields);
  }
  public complate() {
    // this.router.navigate(['/tasks/survey/kyc-pep/499c9609-7673-11ef-92cd-7233c520c38f']);
    if(this.task && this.task !== undefined && this.task.id) {
      this.taskService.complete(this.task.id, this.formGroup).build()
        .pipe(
          catchError(
        (err) => {
          if (err?.status === 200) {
            return of(err);
          } else {
            return throwError(err);
          }
        }
          )
        ).subscribe(
          () => {
            // this.actionInProgress = false;
          },
          (error: HttpErrorResponse) => {
            this.loaderService.stopLoader();
          }
        );
    }
  }
  private initSurveyForm(templateId: any) {
    if(templateId === null || templateId === undefined) {
      return EMPTY;
    }
    return this.surveyService.getTemplateDetails(templateId);
  }

  private initForm(listFormFields: FormField []) {
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
    this.resolveCondition();
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
            if(constraint.kind === 'ruleOut') {
              this.ruleOutValues(field, constraint);
            }
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
              wide: true
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
        if(q.conditionVisibility && q.conditionVisibility !== undefined) {
          const validationRuleKey = Object.keys(q.conditionVisibility);
          validationRuleKey.forEach((v: string) => {
            if(!listFormField[l].properties.conditions || listFormField[l].properties.conditions === undefined) {
              listFormField[l].properties.conditions = [];
            }
            listFormField[l].properties.conditions.push(
              {
                questionId: v,
                rule: this.readValueFromHashMap(q.conditionVisibility, v)
              }
            );
          });
        }
      });
      this.hashMapFormFields[i] = listFormField;
    });
    this.loadedFormGroup();
  }
  readValueFromHashMap(hasMap: { [key: string]: string } | undefined, k: string): any {
    if(hasMap && hasMap !== undefined) {
      return hasMap[k];
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
          value: k
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
  ruleOutValues(field: FormField, constraint: any) {
    if(this.formGroup.controls[field.id]) {
      this.formGroup.controls[field.id].valueChanges.subscribe(
        (res: string[]) => {
          if(res && Array.isArray(res)) {
            if(res.includes(constraint.value)) {
              res = [constraint.value];
              this.formGroup.controls[field.id].setValue(res, { emitEvent: false });
            }
          }
        }
      );
    }
  }
  private resolveCondition() {
    for (let index = 0; index < this.listFormFields.length; index++) {
      const element = this.listFormFields[index];
      if (element.properties && element.properties.conditions) {
        element.properties.conditions.forEach((c: any) => {
          if (this.formGroup.controls[c.questionId]) {
            const controlName = c.questionId;
            let rule = c.rule;
            // let value = parseCondition[2];
            // value = parseCondition[2] === 'true' ?
            //   value = true : parseCondition[2] === 'false' ? value = false : value;
            const formGroup = this.formGroup;
            const r = [] as any;
            if(rule.includes('||')) {
              rule.split('||').forEach(
                (e: any) => {
                  r.push(controlName + ' ' + e);
                }
              );
              rule = r.join('||');
            }

            if(rule.includes('&&')) {
              rule.split('&&').forEach(
                (e: any) => {
                  r.push(controlName + ' ' + e);
                }
              );
              rule = r.join('&&');
            }
            if(rule && !rule.includes('&&') && !rule.includes('||')) {
              rule = controlName + ' ' + rule;
            }
            this.formGroup.controls[controlName].valueChanges.subscribe((_res) => {

              const listBool: boolean[] = [];
              if(rule.includes('||')) {
                rule.split('||').forEach(
                  (e: any) => {
                    if(e) {
                      e = e.trim().replaceAll('  ', ' ');
                      const parseCondition = e.split(' ');
                      const clName = parseCondition[0];
                      const operator = parseCondition[1];
                      let value = parseCondition[2];
                      value = parseCondition[2] === 'true' ?
                      value = true : parseCondition[2] === 'false' ? value = false : value;
                      const res = this.compare(formGroup.controls[controlName].value
                        , operator, value);
                      listBool.push(res);
                    }
                  }
                );
                this.listFormFields[index].properties.hidden = !listBool.includes(true);
              }
              if(rule.includes('&&')) {
                rule.split('&&').forEach(
                  (e: any) => {
                    if(e) {
                      e = e.trim().replaceAll('  ', ' ');
                      const parseCondition = e.split(' ');
                      const clName = parseCondition[0];
                      const operator = parseCondition[1];
                      let value = parseCondition[2];
                      value = parseCondition[2] === 'true' ?
                      value = true : parseCondition[2] === 'false' ? value = false : value;
                      const res = this.compare(formGroup.controls[controlName].value
                        , operator, value);
                      listBool.push(res);
                    }
                  }
                );
                this.listFormFields[index].properties.hidden = !listBool.includes(false);
              }
              if(rule && !rule.includes('&&') && !rule.includes('||')) {
                rule = rule.trim().replaceAll('  ', ' ');
                const parseCondition = rule.split(' ');
                const clName = parseCondition[0];
                const operator = parseCondition[1];
                let value = parseCondition[2];
                value = parseCondition[2] === 'true' ?
                value = true : parseCondition[2] === 'false' ? value = false : value;
                const res = this.compare(formGroup.controls[controlName].value
                  , operator, value);
                  this.listFormFields[index].properties.hidden = !res;
              }
              this.formGroup.controls[this.listFormFields[index].id].setValue(null);
              this.updateConditionalValidator(index, false);
            });
            this.formGroup.controls[controlName].updateValueAndValidity({ emitEvent: true });
          }
        });
      }
    }
  }
  private compare(post: any, operator: string, value: any): any {
    switch (operator) {
      case '>': return post > value;
      case '<': return post < value;
      case '>=': return post >= value;
      case '<=': return post <= value;
      case '==': return post === value || (Array.isArray(post) && post.includes(value));
      case '!=': return post !== value;
      case '===': return post === value || (Array.isArray(post) && post.includes(value));
      case '!==': return post !== value;
    }
  }

  private updateConditionalValidator(index: any, conditionResult: any) {
    if (this.formGroup.controls[this.listFormFields[index].id]) {
      if (conditionResult) {
        this.formGroup.controls[this.listFormFields[index].id]
          .setValidators(this.appendValidators(this.listFormFields[index]));
      } else {
        this.formGroup.controls[this.listFormFields[index].id].clearValidators();
      }
      this.formGroup.controls[this.listFormFields[index].id].updateValueAndValidity();
    }
  }
}
