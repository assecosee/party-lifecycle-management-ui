import { Component, OnInit } from '@angular/core';
import { UIService } from '@asseco/common-ui';
import { Case } from '../../../model/case';
import { PartyLifecycleManagementService } from '../../../services/party-lifecycle-management.service';
import { BehaviorSubject, combineLatest, Subject, Subscription, takeUntil } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { DashboardDataStoreService } from '../../../services/dashboard-data-store.service';

@Component({
  selector: 'party-lcm-case-overview',
  templateUrl: './case-overview.component.html',
  styleUrl: './case-overview.component.scss'
})
export class CaseOverviewComponent implements OnInit{

  public caseOverview: Case;
  public caseId: string;
  public ngUnsubscribe = new Subject<void>();
  private routeSubscription: Subscription;
  public dashboardNameBody: string;
  public dashboardNameHeader: string;
  constructor(
    private uiService: UIService,
    private partyLCMService: PartyLifecycleManagementService,
    private route: ActivatedRoute,
    private dashboardDataService: DashboardDataStoreService
  ) {
    this.uiService.setTitle('Case overview');
  }
  ngOnInit(): void {
    this.routeSubscription = combineLatest([this.route.params])
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(params => {
        this.caseId= params[0]['caseNumber'];
      });
    this.initCase();
    this.dashboardNameBody = 'party-lcm/case-overview';
  }
  ngOnDestroy(): void{
    this.routeSubscription.unsubscribe();
  }
  initCase(){
    const filter = {
      include: 'entity-info,servicing-info,context'
    };
    this.partyLCMService.getCaseById(this.caseId,filter).subscribe(res =>{
      this.caseOverview = res;
      if(this.dashboardDataService.subjects['case']){
        this.dashboardDataService.subjects['case'].next(res);
      }
      this.dashboardDataService.subjects['case'] = new BehaviorSubject(res);

  });
  }
}
