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
} from 'angular-l10n';
import { combineLatest } from 'rxjs';
import { MaterialCustomerActionsComponent } from '../../utils/customer-actions/customer-actions.component';
import { UppercaseDirective } from '../../utils/directives/uppercase-directive';
import { ErrorHandlingComponent } from '../../utils/error-handling/error-handling.component';

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
  public acControl = new AseeFormControl(null, Validators.required);
  public basis = [
    {
      literal: 'client',
      label: 'Client',
    },
    {
      literal: 'prospect',
      label: 'Prospect',
    },
    {
      literal: 'temporary-client',
      label: 'Temporary client',
    },
    {
      literal: 'related-party',
      label: 'Related party',
    },
  ];

  constructor(
    protected injector: Injector,
    protected configurationService: ConfigurationHttpClient
  ) {
    this.activatedRoute = this.injector.get(ActivatedRoute);
    this.bpmTaskService = this.injector.get(BpmTasksHttpClient);
    this.locale = injector.get(L10N_LOCALE);
  }

  ngOnInit(): void {
    combineLatest([
      this.activatedRoute.params,
      this.activatedRoute.queryParams,
    ]).subscribe((params) => {
      this.taskId = params[0]['taskId'];
      this.getTask();
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
    valueBasis = this.basis.find(
      (item) =>
        item.literal.toLowerCase() ===
        this.getFormFieldValue('basisForClientRegistration')?.toLowerCase()
    );
    this.validateBasis(valueBasis);
    this.acControl.setValue(valueBasis);
    const controlBasis = new AseeFormControl(
      valueBasis?.literal,
      Validators.required
    );
    this.formGroup.addControl('basisForClientRegistration', controlBasis);

    const valueSwResult = this.getFormFieldValue('swFilteringResult');
    const controlSwResult = new AseeFormControl(valueSwResult, []);
    this.formGroup.addControl('swFilteringResult', controlSwResult);

    this.acControl.valueChanges.subscribe((basis) =>
      this.formGroup.controls['basisForClientRegistration'].setValue(
        basis.literal
      )
    );

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
      case 'related-party':
        this.basisOptions = this.basis.filter((obj) =>
          ['client', 'related-party'].includes(obj.literal)
        );
        break;
      case 'temporary-client':
        this.basisOptions = this.basis.filter(
          (obj) => obj.literal !== 'prospect'
        );
        break;
      case 'prospect':
        this.basisOptions = this.basis;
        break;
      case 'client':
        this.readonly = true;
        this.basisOptions = this.basis.filter(
          (obj) => obj.literal === 'client'
        );
        break;
      default:
        this.basisOptions = this.basis;
        break;
    }
  }
}
