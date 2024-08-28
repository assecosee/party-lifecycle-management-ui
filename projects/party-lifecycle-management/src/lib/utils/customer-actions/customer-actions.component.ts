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
  @Input() public submitDisabled: boolean = false;
  @Input() public submitButtonName: string = "Continue";
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

  public submit() {
    if (this.submitDisabled) {
      return;
    }
    if (this.onSubmit.observers.length > 0) {
      this.onSubmit.emit();
      return;
    }

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