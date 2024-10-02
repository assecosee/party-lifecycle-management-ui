import { Component, Injector, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ErrorEmitterService } from '@asseco/common-ui';
import { BaseWidget } from '@asseco/components-ui';
import { L10nLocale, L10N_LOCALE } from 'angular-l10n';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { IntegrationTracingHttpClient } from '../../services/integration-tracing-http-client.service';
import { IntegrationTracing } from '../../model/integration-tracing/integration-tracing';
import { IntegrationTracingDetailsComponent } from './integration-tracing-details/integration-tracing-details.component';

@Component({
  selector: 'party-lcm-integration-tracing',
  templateUrl: './integration-tracing.component.html',
  styleUrl: './integration-tracing.component.scss'
})
export class IntegrationTracingComponent extends BaseWidget implements OnInit, OnDestroy {
  private pageSize = 20;
  private integrationPage = 0;
  private moreDetailsDialog: MatDialogRef<IntegrationTracingDetailsComponent>;

  public title = 'Integration tracing';
  public configuration: string;
  public integrationList: IntegrationTracing[] = [];
  public integrationTotalCount = 0;
  public contextIdentifier = '';
  public integrationTotalPages = 0;
  public locale: L10nLocale;
  public subscription: Subscription = new Subscription();
  public disableBtnMoreIntegrationList = false;
  public ctxIdent: any;

  constructor(
    protected injector: Injector,
    protected integrationHttpClient: IntegrationTracingHttpClient,
    protected errorEmitterService: ErrorEmitterService,
    protected dialog: MatDialog,
    protected route: ActivatedRoute,
  ){
    super();
    this.locale = injector.get(L10N_LOCALE);
  }

  ngOnInit(): void {
    if (!this.ctxIdent) {
      this.ctxIdent = this.route.snapshot.paramMap.get('caseNumber');
    }
    this.contextIdentifier = 'integration/tracing/' + this.ctxIdent;
    this.getIntegrationList();
  }

  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private createQueryString(): string {
    return `${this.contextIdentifier}&page=${this.integrationPage}&page-size=${this.pageSize}`;
  }

  public getIntegrationList() {
    this.callIntegrationAPI();
  }

  private callIntegrationAPI(){
    const qString = this.createQueryString();
    this.integrationHttpClient.getTracings(qString).build().pipe(take(1)).subscribe((res: any) => {
      this.disableBtnMoreIntegrationList = false;
      this.integrationTotalCount = res.totalCount;
      this.integrationPage = res.page;
      this.integrationTotalPages = res.totalPages;

      const lastOrdinal = (this.integrationTotalCount - (this.pageSize * (this.integrationPage - 1)));
      for (let i = 0; i < res.integrationTracings.length; i++) {
        const intTrace = res.integrationTracings[i];// as IntegrationTracing;
        intTrace.name = (lastOrdinal - i).toString().concat('. ').concat(intTrace.name);
        intTrace.severity = 'success';
        if (!intTrace.responseCode?.startsWith('20')) {
          intTrace.severity = 'error';
        }
        this.integrationList.push(intTrace);
      }
    }, (error: any) => {
      this.errorEmitterService.setError(error);
    });
  }

  public getNextPageIntegrationList() {
    if (this.integrationTotalPages > 1 && this.integrationTotalPages > this.integrationPage) {
      this.integrationPage++;
      this.disableBtnMoreIntegrationList = true;
      this.callIntegrationAPI();
    }
  }

  public showPayload(integrationResult: IntegrationTracing) {
    let intTrace: IntegrationTracing;
    this.subscription.add(
      this.integrationHttpClient.getTracing(integrationResult.id).build().subscribe((res: any) => {
        intTrace = res;
        this.showMoreDetails(intTrace);
      }, (error: any) => {
        this.errorEmitterService.setError(error);
      })
    );
  }

  public showMoreDetails(tracing: IntegrationTracing) {
    this.moreDetailsDialog = this.dialog.open(IntegrationTracingDetailsComponent, {
      data: {
        details: tracing
      }
    });
    this.moreDetailsDialog.afterClosed().subscribe(() => {
      //
    });
  }
}
