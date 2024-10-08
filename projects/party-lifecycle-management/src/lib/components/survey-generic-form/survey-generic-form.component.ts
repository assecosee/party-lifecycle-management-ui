import { ChangeDetectorRef, Component, ComponentRef, Injector, OnDestroy, OnInit } from '@angular/core';
import { BpmTasksHttpClient, FormField, LoaderService, Task, UIService, ValidationConstraint } from '@asseco/common-ui';
import { L10N_LOCALE, L10nLocale } from 'angular-l10n';
import { SurveyService } from '../../services/survey.service';
import { SurveyQuestion, SurveySection, SurveyTemplate } from '../../model/survey-template';
import { UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { catchError, EMPTY, forkJoin, map, of, Subscription, switchMap, throwError } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationListenerService } from '@asseco/task-inbox';
import { ReferenceService } from '../../services/reference.service';
import { CaseDetailsWidgetComponent } from '../case-details-widget/case-details-widget.component';

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
  public countries = [];
  private routeSubscription: Subscription = new Subscription();
  private taskSubscription: Subscription  = new Subscription();
  private formData: any[];
  private componentRefCaseShortDetailes: ComponentRef<CaseDetailsWidgetComponent>;

  constructor(
    protected surveyService: SurveyService,
    protected injector: Injector,
    protected uiService: UIService,
    protected route: ActivatedRoute,
    protected router: Router,
    protected taskService: BpmTasksHttpClient,
    protected loaderService: LoaderService,
    protected dialog: MatDialog,
    protected notificationService: NotificationListenerService,
    protected referenceService: ReferenceService,
    private cdr: ChangeDetectorRef
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
          this.initSurveyForm(this.templateId),
          this.referenceService.getCountries(),
          this.taskService.getFormData(params['taskId']).build()
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
        ([task, surverField, countries, taskResults]: [Task, SurveyTemplate, any, any]) => {
          this.task = task;
          this.formData = taskResults;
          if(this.task && this.task !== undefined) {
            this.notificationService.lastBusinessKey = this.task.businessKey;
            this.notificationService.lastDate = new Date();
            this.initCaseInfo(task.businessKey);
          }
          if(countries && countries.items) {
            this.countries = countries.items.filter((e: any) => e.name && e.alpha2);
          }
          this.surveyTemplate = surverField;
          this.uiService.setTitle(this.surveyTemplate.info.title);
          this.transformSurveyTemplate(this.surveyTemplate);
          this.surveyTemplate.sections.forEach(
          (s: SurveySection) => {
            this.items.push(s.title);
          }
          );
          // fill form fields
          this.cdr.detectChanges();
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
    this.fillForm(listFormFields);
  }

  fillForm(listFormFields: FormField[]) {
    listFormFields.forEach(fiels => {
      const formData = this.formData?.find(data => data.id === fiels.id);
      if (fiels.data.type === 'custom-enum' || fiels.data.type === 'string') {
        fiels.data.value = formData?.data.value;
      }
      if (fiels.data.type === 'multi-select' || fiels.data.type === 'multi-select-country') {
        fiels.data.value = formData?.data.value?.split(',');
      }
      if (fiels.data.type === 'boolean') {
        // bool pitanja su kind=string
        fiels.data.value = formData?.data.value === 'true';
      }
      this.formGroup.controls[fiels.id].setValue(fiels.data.value);
    });
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
            if(constraint.kind === 'maxElement') {
              this.maxElements(field, constraint);
            }
            if(constraint.kind === 'minElement') {
              this.minElements(field, constraint);
            }
          }
        }
      }
    }
  }
  minElements(field: FormField, constraint: ValidationConstraint) {
    if(this.formGroup.controls[field.id]) {
      this.formGroup.controls[field.id].valueChanges.subscribe(
        (res: any[]) => {
          if(res && Array.isArray(res)) {
            if(res.length < constraint.value) {
              this.formGroup.controls[field.id].setErrors(
                {
                   error: `Min elements is ${constraint.value}`
                }
              );
            }
          }
        }
      );
    }
  }
  maxElements(field: FormField, constraint: ValidationConstraint) {
    if(this.formGroup.controls[field.id]) {
      this.formGroup.controls[field.id].valueChanges.subscribe(
        (res: any[]) => {
          if(res && Array.isArray(res)) {
            if(res.length > constraint.value) {
              this.formGroup.controls[field.id].setErrors(
                {
                   error: `Max elements is ${constraint.value}`
                }
              );
            }
          }
        }
      );
    }
  }

  private transformSurveyTemplate(surveyTemplate: SurveyTemplate) {
    surveyTemplate.sections.forEach((s: SurveySection, i) => {
      const listFormField: FormField [] = [];
      s.questions.forEach((q: SurveyQuestion, l) => {
        const ff: FormField =
          {
            id: q.questionId,
            label: q.title,
            data: {
              type: this.getType(q.kind, q.isCollection),
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
          };
        if(ff.data.type === 'multi-select-country') {
          ff.enumProps = this.countries;
        }
        listFormField.push(ff);
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
  private getType(kind: string, isCollection: boolean = false): string {
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
      case'country':
        return  isCollection ? 'multi-select-country' : 'select-country';
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
                      if(this.checkIsNumeric(clName)) {
                        value = Number(value);
                      }
                      value = parseCondition[2] === 'true' ?
                      value = true : parseCondition[2] === 'false' ? value = false : value;
                      const res = this.compare(formGroup.controls[controlName].value
                        , operator, value);
                      listBool.push(res);
                    }
                  }
                );
                this.listFormFields[index].properties.hidden = !listBool.includes(true);
                this.updateConditionalValidator(index, listBool.includes(true));
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
                      if(this.checkIsNumeric(clName)) {
                        value = Number(value);
                      }
                      value = parseCondition[2] === 'true' ?
                      value = true : parseCondition[2] === 'false' ? value = false : value;
                      const res = this.compare(formGroup.controls[controlName].value
                        , operator, value);
                      listBool.push(res);
                    }
                  }
                );
                this.listFormFields[index].properties.hidden = !listBool.includes(false);
                this.updateConditionalValidator(index, listBool.includes(false));

              }
              if(rule && !rule.includes('&&') && !rule.includes('||')) {
                rule = rule.trim().replaceAll('  ', ' ');
                const parseCondition = rule.split(' ');
                const clName = parseCondition[0];
                const operator = parseCondition[1];
                let value = parseCondition[2];
                if(this.checkIsNumeric(clName)) {
                  value = Number(value);
                }
                value = parseCondition[2] === 'true' ?
                value = true : parseCondition[2] === 'false' ? value = false : value;
                const res = this.compare(formGroup.controls[controlName].value
                  , operator, value);
                  this.listFormFields[index].properties.hidden = !res;
                  this.updateConditionalValidator(index, res);
              }
              this.formGroup.controls[this.listFormFields[index].id].setValue(null);
              // this.updateConditionalValidator(index, false);
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
  checkIsNumeric(controlName: string) {
    const field = this.listFormFields.find(e => e.id === controlName);
    if(field && field?.data.type === 'long') {
      return true;
    }
    return false;
  }
  public theCallback(controlName: string){
    return this.formGroup.controls[controlName].value;
  }
  private initCaseInfo(caseId: string) {
    if (!this.componentRefCaseShortDetailes) {
      this.componentRefCaseShortDetailes = this.uiService.addComponentToRightSideNav(CaseDetailsWidgetComponent, true);
    }
    this.componentRefCaseShortDetailes.instance.caseId = caseId;
  }
}
