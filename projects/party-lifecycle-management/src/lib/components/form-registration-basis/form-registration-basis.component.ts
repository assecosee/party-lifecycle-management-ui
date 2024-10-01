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
import { combineLatest } from 'rxjs';
import { MaterialCustomerActionsComponent } from '../../utils/customer-actions/customer-actions.component';
import { UppercaseDirective } from '../../utils/directives/uppercase-directive';
import { ErrorHandlingComponent } from '../../utils/error-handling/error-handling.component';
import { PartyService } from '../../services/party.service';

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
    private partyService: PartyService,
    protected translationService: L10nTranslationService
  ) {
    this.activatedRoute = this.injector.get(ActivatedRoute);
    this.bpmTaskService = this.injector.get(BpmTasksHttpClient);
    this.locale = injector.get(L10N_LOCALE);
  }

  ngOnInit(): void {
    this.partyService.getRegistrationProfiles().subscribe((res) => {
      this.basis = res.values.filter((item: any) => item.literal);
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
    const formFieldVal = this.getFormFieldValue('registrationProfile');

    valueBasis = this.basis.find(
      (item: any) => item.literal === formFieldVal
    );

    this.validateBasis(valueBasis);
    const controlBasis = new AseeFormControl(valueBasis, Validators.required);
    this.formGroup.addControl('registrationProfile', controlBasis);

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
    switch (val?.literal) {
      case 'customer':
        this.readonly = true;
        this.basisOptions = this.basis.filter((obj: any) => obj.literal === 'customer');
        break;
      case 'prospect':
        this.basisOptions = this.basis;
        break;
      case 'related-party':
        this.basisOptions = this.basis.filter((obj: any) =>
          ['related-party', 'customer'].includes(obj.literal)
        );
        break;
      case 'counter-party':
        this.basisOptions = this.basis.filter((obj: any) => obj.literal !== 'prospect');
        break;
      default:
        this.basisOptions = this.basis;
        break;
    }
  }
}
