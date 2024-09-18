import { animate, state, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, Component, ElementRef, HostListener, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ErrorEmitterService, LoaderService, UIService } from '@asseco/common-ui';
import { L10N_LOCALE, L10nLocale } from 'angular-l10n';
import { PartyLifecycleManagementService } from '../../../services/party-lifecycle-management.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { PagedCaseList } from '../../../model/pagedCaseList';
import { Case } from '../../../model/case';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FilterCasesDialogComponent } from '../../dialogs/filter-cases-dialog/filter-cases-dialog.component';

@Component({
  selector: 'party-lcm-case-list',
  templateUrl: './case-list.component.html',
  styleUrls: ['./case-list.component.scss'],
  animations: [
    trigger('rotateArrow', [
      state('down', style({})),
      state('up', style({ transform: 'rotate(180deg)' })),
      transition('down <=> up', animate('250ms ease-in'))
    ]),
    trigger('pushDown', [
      state('void', style({ overflow: 'hidden', height: '0', opacity: '0' })),
      state('*', style({ overflow: 'hidden' })),
      transition('void => *', animate('250ms ease-out')),
      transition('* => void', animate('250ms ease-out'))
    ])
  ],
})
export class CaseListComponent implements OnInit, AfterViewInit, OnDestroy{
  public locale: L10nLocale;
  public loading = false;
  public sortFields: any[] | undefined;
  public displayedColumns = ['caseNumber', 'partyNumber', 'partyName', 'partyIdentificationNumber',
    'creationDate', 'status', 'actions'];
  public selectedFilters: any = {
    page: 1,
    pageSize: 30,
    sortBy: 'creation-time',
    sortOrder: 'desc',
  };
  public totalPages: number | undefined = 0;
  public casesData: MatTableDataSource<Case> = new MatTableDataSource();
  @ViewChild('spinder', { static: false }) public spinder: ElementRef | undefined;
  @ViewChild('tableContainer', { static: true }) public table: ElementRef | undefined;

  private getCasesSubscription: Subscription = new Subscription();
  private cases: Case[] = [];
  private filterDialog: MatDialogRef<FilterCasesDialogComponent> | undefined;
  private totalCount = 0;

  constructor(
    protected uiService: UIService,
    protected injector: Injector,
    protected loaderService: LoaderService,
    protected router: Router,
    protected activatedRoute: ActivatedRoute,
    protected errorEmitterService: ErrorEmitterService,
    protected dialog: MatDialog,
    protected partyLifecycleManagementService: PartyLifecycleManagementService
  ) {
    this.uiService.setTitle('List cases');
    this.locale = this.injector.get(L10N_LOCALE);
  }

  ngOnInit(): void {
    this.sortFields = [
      {
        label: 'Creation Date (asc)',
        sortBy: 'creation-time',
        sortOrder: 'asc'
      },
      {
        label: 'Creation Date (desc)',
        sortBy: 'creation-time',
        sortOrder: 'desc'
      }
    ];
    this.init();
  }

  ngAfterViewInit(): void {
    this.adaptToSize();
  }

  ngOnDestroy(): void {
    if(this.getCasesSubscription) {
      this.getCasesSubscription.unsubscribe();
    }
  }

  @HostListener('window:resize', ['$event'])
  public onResize(_event: any) {
    this.adaptToSize();
  }

  public adaptToSize(size?: number) {
    size = size || this.getTableWidth();

  }

  public openFilters() {
    this.filterDialog = this.dialog.open(FilterCasesDialogComponent, {});
    this.filterDialog.afterClosed().subscribe((selectedFilters) => {
      if (selectedFilters) {
        this.selectedFilters = selectedFilters;
        this.resetLoading();
      }
    });
  }

  public sort(sortField: any) {
    this.selectedFilters.sortOrder = sortField.sortOrder;
    this.selectedFilters.sortBy = sortField.sortBy;
    this.resetLoading();
  }

  public onScroll() {
    if (!this.loading) {
      if (this.selectedFilters.page !== this.totalPages) {
        this.selectedFilters.page++;
        this.getCases();
        this.loaderService.stopLoader();
      }
    }
  }

  public openCase(c: Case) {
    this.router.navigate([`party-lifecycle-management/cases/${c.id}`]);
  }

  public getCases() {
    this.loading = true;
    this.setRouteQueryParams();
    this.getCasesSubscription = this.partyLifecycleManagementService.getCases(this.selectedFilters).subscribe(
      (res: PagedCaseList) => {
        this.loading = false;
        if(res.lifecycleCases) {
          this.cases = res.lifecycleCases;
        }
        if(res.totalCount) {
          this.totalCount = res.totalCount;
        }
        this.totalPages = res.totalPages;
        this.selectedFilters.page = res.page;
        this.selectedFilters.pageSize = res.pageSize;
        if (this.selectedFilters.page !== 1) {
          this.casesData.data = this.casesData.data.concat(this.cases);
        } else {
          this.casesData.data = this.cases;
        }
      },
      (error) => {
        this.errorEmitterService.setError(error);
        this.loading = false;
      }
    );
  }

  public resetLoading() {
    if (this.loading) {
      return;
    }
    this.selectedFilters.page = 1;
    this.loaderService.stopLoader();
    this.getCases();
  }

  private getTableWidth() {
    if (this.table && this.table.nativeElement) {
      return this.table.nativeElement.clientWidth;
    }
    return 0;
  }

  private setRouteQueryParams() {
    const queryParams = Object.assign({}, this.selectedFilters);
    delete queryParams.page;
    delete queryParams.pageSize;
    this.router.navigate([], { queryParams });
    this.uiService.setTitle('List cases');
  }

  private parseRouteQueryParams() {
    const queryParams = Object.assign({}, this.activatedRoute.snapshot.queryParams || {});
    this.selectedFilters = Object.assign(this.selectedFilters, queryParams);
  }

  private init() {
    this.getCases();
  }

}
