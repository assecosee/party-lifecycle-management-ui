import { Component, Injector, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AseeFormControl, BpmTasksHttpClient, CommonUiModule, FormField } from '@asseco/common-ui';
import { AssecoMaterialModule, MaterialModule } from '@asseco/components-ui';
import { L10N_LOCALE, L10nIntlModule, L10nLocale, L10nTranslationModule } from 'angular-l10n';
import { combineLatest, forkJoin, tap } from 'rxjs';
import { OfferService } from '../../services/offer.service';
import { MaterialCustomerActionsComponent } from '../../utils/customer-actions/customer-actions.component';
import { ErrorHandlingComponent } from '../../utils/error-handling/error-handling.component';

@Component({
  selector: 'process-selection',
  standalone: true,
  imports: [AssecoMaterialModule,
    L10nTranslationModule, L10nIntlModule, MaterialModule, ErrorHandlingComponent, MaterialCustomerActionsComponent, CommonUiModule],
  templateUrl: './process-selection.component.html',
  styleUrl: './process-selection.component.scss'
})
export class ProcessSelectionComponent implements OnInit {

  public locale: L10nLocale;
  public taskId = '';
  public task: any;
  public formGroup: FormGroup = new FormGroup({});
  public formFields: FormField[] = [];
  public processSelectionList: any = [];
  public formGroupInitialized = false;
  public agentHasAMLRole = false;
  public basisForClientRegistration = '';
  public formKeys = [
    { key: 'selectedProcess', validators: [Validators.required] }
  ];
  protected activatedRoute: ActivatedRoute;
  protected bpmTaskService: BpmTasksHttpClient;


  constructor(protected injector: Injector, private offerService: OfferService) {
    this.activatedRoute = this.injector.get(ActivatedRoute);
    this.bpmTaskService = this.injector.get(BpmTasksHttpClient);
    this.locale = injector.get(L10N_LOCALE);
  }

  ngOnInit(): void {
    forkJoin({
      processOptions: this.offerService.getClassification('agent-process-choose')
    }).pipe(
      tap(({ processOptions }) => {
        this.processSelectionList = processOptions.values;
      })
    ).subscribe(response => {
      // Handle ActivatedRoute data as before
      combineLatest([this.activatedRoute.params, this.activatedRoute.queryParams])
        .subscribe((params) => {
          this.taskId = params[0]['taskId'];
          this.getTask();
        });
    });
  }

  public getTask() {
    this.bpmTaskService.getTask(this.taskId).build().subscribe((task) => {
      this.task = task;
      console.log('Task data: ', this.task);
      this.bpmTaskService.getFormData(this.taskId).build().subscribe((result) => {
        this.formFields = result;
        console.log('Form data: ', this.formFields);
        this.initFormGroup();
      });
    });
  }

  private initFormGroup() {
    this.formGroupInitialized = false;
    this.agentHasAMLRole = this.getFormFieldValue('agentHasAMLRole');
    this.basisForClientRegistration = this.getFormFieldValue('basisForClientRegistration');
    this.formGroup = new FormGroup({});

    // Create controls
    this.formKeys.forEach(formKey => {
      if (formKey) {
        const control = new AseeFormControl(null, formKey.validators);
        this.formGroup.addControl(formKey.key, control);
      }
    });

    // Initialize controls with values (this is because some logic in control listeners must be triggered)
    // So this is the reason why creation and initialization are separated
    this.formKeys.forEach(formKey => {
      if (formKey) {
        let controlValue = null;
        try {
          controlValue = JSON.parse(this.getFormFieldValue(formKey.key));
        } catch (e) {
          controlValue = this.getFormFieldValue(formKey.key);
        }
        this.formGroup.controls[formKey.key].setValue(controlValue);
        this.formGroup.controls[formKey.key].updateValueAndValidity();
      }
    });

    if (this.basisForClientRegistration !== null && this.basisForClientRegistration.toUpperCase() !== 'KLIJENT'
      && this.basisForClientRegistration.toUpperCase() !== 'POVREMENI KLIJENT') {
      this.processSelectionList = this.removeByProperty(this.processSelectionList, 'literal', 'kyc-renewal');
      this.processSelectionList = this.removeByProperty(this.processSelectionList, 'literal', 'recalculation-of-risk-level');
    }

    if (!this.agentHasAMLRole) {
      this.processSelectionList = this.removeByProperty(this.processSelectionList, 'literal', 'recalculation-of-risk-level');
    }

    this.formGroupInitialized = true;
  }

  private getFormFieldValue(formField: any) {
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

  private removeByProperty(array: [], property: string, value: string) {
    return array.filter(item => item[property] !== value);
  }

  // Method to mark control as touched
  markAsTouched(controlName: string) {
    const control = this.formGroup.get(controlName);
    if (control) {
      control.markAsTouched();
    }
  }

}
