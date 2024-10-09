import { Component, OnInit } from '@angular/core';
import { BrokerFacade, UIService, UserService } from '@asseco/common-ui';
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
  private offerChangeSubscription: Subscription;
  constructor(
    private uiService: UIService,
    private partyLCMService: PartyLifecycleManagementService,
    private route: ActivatedRoute,
    private dashboardDataService: DashboardDataStoreService,
    private stompService: BrokerFacade,
    private userService: UserService
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
    this.offerChangeSubscription = this.stompService.subscribe('party-lifecycle', 'username = \'ALL\' or username = \''
      + this.userService.getUserData().userName + '\'')
      .subscribe((message: any) => {
        console.log(message);
        // const applicationNumber = message.headers.get('caseId') || message.headers.get('case-number');
        // if ((message.messageName === 'status-updated' || message.messageName === 'offer-canceled')
        //   && applicationNumber === this.caseId) {
        //   this.initCase();
        // }
      });
  }
  ngOnDestroy(): void{
    this.routeSubscription.unsubscribe();
    if (this.offerChangeSubscription) {
      this.offerChangeSubscription.unsubscribe();
    }
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
