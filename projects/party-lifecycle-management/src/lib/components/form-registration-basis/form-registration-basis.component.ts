import { Component, Injector, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  AseeFormControl,
  BpmTasksHttpClient,
  ConfigurationHttpClient,
  FormField,
} from '@asseco/common-ui';
import { AssecoMaterialModule, MaterialModule } from '@asseco/components-ui';
import {
  L10N_LOCALE,
  L10nIntlModule,
  L10nLocale,
  L10nTranslationModule,
  L10nTranslationService,
} from 'angular-l10n';
import { catchError, combineLatest, of } from 'rxjs';
import { MaterialCustomerActionsComponent } from '../../utils/customer-actions/customer-actions.component';
import { UppercaseDirective } from '../../utils/directives/uppercase-directive';
import { ErrorHandlingComponent } from '../../utils/error-handling/error-handling.component';
import { CustomService } from '../../services/custom.service';

@Component({
  selector: 'lib-form-registration-basis',
  standalone: true,
  imports: [
    AssecoMaterialModule,
    L10nTranslationModule,
    L10nIntlModule,
    MaterialModule,
    ErrorHandlingComponent,
    MaterialCustomerActionsComponent,
    UppercaseDirective,
  ],
  templateUrl: './form-registration-basis.component.html',
  styleUrl: './form-registration-basis.component.scss',
})
export class FormRegistrationBasisComponent implements OnInit {
  public locale: L10nLocale;
  protected activatedRoute: ActivatedRoute;
  protected bpmTaskService: BpmTasksHttpClient;
  public taskId = '';
  public task: any;
  public formGroup: FormGroup = new FormGroup({});
  public formFields: FormField[] = [];
  public formGroupInitialized = false;
  public isIndividualPerson = false;
  public readonly = false;
  public basisOptions = [{}];
  public swRes = new AseeFormControl(null, []);
  public basis: any = [];

  constructor(
    protected injector: Injector,
    protected configurationService: ConfigurationHttpClient,
    private customService: CustomService,
    protected translationService: L10nTranslationService
  ) {
    this.activatedRoute = this.injector.get(ActivatedRoute);
    this.bpmTaskService = this.injector.get(BpmTasksHttpClient);
    this.locale = injector.get(L10N_LOCALE);
  }

  ngOnInit(): void {
    this.customService
      .getClassification('JK2OSNOV')
      .pipe(
        catchError((error) => {
          console.error('Error fetching organizationUnits:', error);
          return of({ items: [] });
        })
      )
      .subscribe((res) => {
        this.basis = res.items.filter((item: any) => item.name);
        combineLatest([
          this.activatedRoute.params,
          this.activatedRoute.queryParams,
        ]).subscribe((params) => {
          this.taskId = params[0]['taskId'];
          this.getTask();
        });
      });
  }

  public getTask() {
    this.bpmTaskService
      .getTask(this.taskId)
      .build()
      .subscribe((task) => {
        this.task = task;
        console.log('Task data: ', this.task);
        this.bpmTaskService
          .getFormData(this.taskId)
          .build()
          .subscribe((result) => {
            this.formFields = result;
            console.log('Form data: ', this.formFields);
            // Populate form group with controls received from task
            this.initFormGroup();
          });
      });
  }

  private initFormGroup() {
    this.formGroupInitialized = false;

    let valueBasis = null;
    const formFieldVal = this.getFormFieldValue(
      'basisForClientRegistration'
    )?.toLowerCase();

    valueBasis = this.basis.find(
      (item: any) => item.description.toLowerCase() === formFieldVal
    );
    this.validateBasis(valueBasis);
    const controlBasis = new AseeFormControl(valueBasis, Validators.required);
    this.formGroup.addControl('basisForClientRegistration', controlBasis);

    const valueSwResult = this.getFormFieldValue('swFilteringResult');
    const controlSwResult = new AseeFormControl(valueSwResult, []);
    this.formGroup.addControl('swFilteringResult', controlSwResult);
    this.swRes.setValue(this.translationService.translate(valueSwResult));

    setTimeout(() => (this.formGroupInitialized = true));
  }

  private getFormFieldValue(formField: string) {
    if (!formField) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < this.formFields.length; i++) {
      if (this.formFields[i].id === formField) {
        return this.formFields[i].data?.value;
      }
    }

    return null;
  }

  markAsTouched(controlName: string) {
    const control = this.formGroup.get(controlName);
    if (control) {
      control.markAsTouched();
    }
  }

  private validateBasis(val: any) {
    switch (val?.name) {
      case '1':
        this.readonly = true;
        this.basisOptions = this.basis.filter((obj: any) => obj.name === '1');
        break;
      case '2':
        this.basisOptions = this.basis.filter((obj: any) => obj.name !== '4');
        break;
      case '3':
        this.basisOptions = this.basis.filter((obj: any) =>
          ['1', '3'].includes(obj.name)
        );
        break;
      case '4':
        this.basisOptions = this.basis;
        break;
      default:
        this.basisOptions = this.basis;
        break;
    }
  }
}
