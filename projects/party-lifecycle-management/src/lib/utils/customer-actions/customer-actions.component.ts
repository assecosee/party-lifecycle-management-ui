import { Component, EventEmitter, Injector, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BpmTasksHttpClient, ErrorEmitterService } from '@asseco/common-ui';
import { MaterialModule } from '@asseco/components-ui';
import { L10N_LOCALE, L10nIntlModule, L10nLocale, L10nTranslationModule } from 'angular-l10n';

@Component({
  standalone: true,
  imports: [MaterialModule, L10nTranslationModule, L10nIntlModule],
  selector: 'customer-actions',
  templateUrl: './customer-actions.component.html',
  styleUrls: ['./customer-actions.component.scss']
})
export class MaterialCustomerActionsComponent implements OnInit {
  @Input() public currentTask: any;
  @Input() public formGroup: any;
  @Input() public submitDisabled = false;
  @Input() public submitButtonName = 'Continue';
  @Output() public onSubmit = new EventEmitter<any>();
  public locale: L10nLocale;
  protected bpmTasksHttpClient: BpmTasksHttpClient;
  protected activatedRoute: ActivatedRoute;
  protected router: Router;
  constructor(
    protected injector: Injector,
    protected errorEmitterService: ErrorEmitterService
  ) {
    this.locale = this.injector.get(L10N_LOCALE);
    this.bpmTasksHttpClient = this.injector.get(BpmTasksHttpClient);
    this.activatedRoute = this.injector.get(ActivatedRoute);
    this.router = this.injector.get(Router);
  }

  public ngOnInit() {
  }

  public removeTimeZoneFromDate() {
    // Go through each date and subtract time zone (sending one date before current problem)
    Object.keys(this.formGroup.controls).forEach((key) => {
      const control = this.formGroup.get(key);
      if (control.value instanceof Date) {
        const options = { timeZone: 'Europe/Belgrade', year: 'numeric', month: '2-digit', day: '2-digit' };
        const belgradeDateString = control.value.toLocaleDateString('en-CA', options); // 'en-CA' outputs in YYYY-MM-DD format

        control.value = belgradeDateString;
        control.updateValueAndValidity();
      }
    });
  }

  public submit() {
    if (this.submitDisabled) {
      return;
    }
    if (this.onSubmit.observers.length > 0) {
      this.onSubmit.emit();
      return;
    }
    console.log(this.formGroup)
    return;

    this.removeTimeZoneFromDate();

    this.bpmTasksHttpClient.complete(this.currentTask.id, this.formGroup)
      .build().subscribe((res) => {
        this.router.navigateByUrl('tasks');
      },
        (err) => {
          this.errorEmitterService.setError(err);
        }
      );

  }

}
