import { ChangeDetectorRef, Component, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AseeFormControl, AseeFormGroup, ErrorEmitterService, IdentityProviderService, UserService } from '@asseco/common-ui';
import { L10N_LOCALE, L10nLocale } from 'angular-l10n';
import { User } from '../../model/User';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { DirectoryService } from '../../services/directory.service';
import { debounceTime, distinctUntilChanged, map, Observable, startWith, switchMap } from 'rxjs';


@Component({
  selector: 'lib-agent-search',
  templateUrl: './agent-search.component.html',
  styleUrl: './agent-search.component.scss'
})
export class AgentSearchComponent implements OnInit{
  public locale: L10nLocale;
  @Input() public label = 'Agent ...';
  @Input() public controlName: string;
  @Input() public formGroup: AseeFormGroup;
  @Input() public showClear = true;
  @Input() public onlyUsersWithSameOrganization = false;
  @Input() public focus = false;
  @Input() public showSearch = true;
  @Input() public pageSize = 20;
  @Input() public appearance = 'outline';
  @Input() public ouCode: string;
  @Output() public agentSelected = new EventEmitter<any>();
  public autocompleteInputControl: AseeFormControl = new AseeFormControl('');
  public clearHidden = true;
  public filteredAgentList: User[] = [];
  public initialAgentList: User[] = [];
  public control: AseeFormControl;
  public get getControl(): AseeFormControl {
    return this.control;
  }
  @Input('control')
  public set setControl(ctrl: AseeFormControl) {
    if(ctrl && ctrl !== undefined) {
      this.control = ctrl;
      this.initiaListAgent();
    }
    this.cdr.detectChanges();
  }
  public totalCount: number;
  public totalPages = 0;
  public pageNumber = 1;
  public initialTotalPages = 0;
  private user: any;
  @ViewChild('auto', { static: false }) private autocomplete: MatAutocomplete;
  @ViewChild(MatAutocompleteTrigger, { static: false }) private autoTrigger: MatAutocompleteTrigger;
  constructor(
    private cdr: ChangeDetectorRef,
    private injector: Injector,
    private directoryService: DirectoryService,
    private errorEmitterService: ErrorEmitterService,
    private userService: UserService,
    protected identityProvider: IdentityProviderService,
  ) {
    this.locale = this.injector.get(L10N_LOCALE);
    this.user = this.userService.getUserData();
  }

  ngOnInit() {}

  public onInit() {
    if (!this.control && this.formGroup && this.controlName) {
      this.control = this.formGroup.controls[this.controlName] as AseeFormControl;
    } else if (!this.control) {
      this.control = new AseeFormControl('');
    }
    this.setListeners();
    if (this.control.value) {
      const filter: any = {
        directory: this.identityProvider.getDirectoryName(),
        externalId: this.control.value,
        pageSize: this.pageSize,
        page: this.pageNumber
      };
      // get agent because passed object may be incomplete
      this.directoryService.getUsersList(filter)
        .subscribe((listUsers: any) => {
          const user: User  = listUsers.items.length ? listUsers.items[0] : null;
          if (user) {
            this.autocompleteInputControl.setValue(user.displayName);
          }
          this.autocomplete.optionSelected.emit(user as any);
        }, (error) => {
          this.errorEmitterService.setError(error);
        });
    } else {
      this.autocompleteInputControl.setValue(undefined);
    }
  }
  public clearValue() {
    this.autocomplete.optionSelected.emit(undefined);
    this.clearHidden = true;
    this.pageNumber = 1;
    this.totalPages = this.initialTotalPages;
    this.autocompleteInputControl.setValue(null);
  }
  public searchCanceled(event: any) {
    this.pageNumber = 1;
    if ((event.keyCode === 27 || event.keyCode === undefined)) {
      if (this.control && this.control.value) {
        this.autocompleteInputControl
          .setValue(this.control.value && this.control.value.displayName || null);
      }
    }
  }
  public displayWith(agent: any): string | undefined {
    if (typeof (agent) === 'string') {
      return agent;
    }
    return agent ? agent.displayName : undefined;
  }

  public openPanel() {
    this.autoTrigger.openPanel();
  }

  public inputClick(_event: any) {
    this.openPanel();
  }

  public onScroll() {
    if (this.pageNumber !== this.totalPages) {
      ++this.pageNumber;
      const filter: any = {
        directory: this.identityProvider.getDirectoryName(),
        pageSize: this.pageSize,
        page: this.pageNumber
      };
      if(this.ouCode){
        filter.ouCode = this.ouCode;
      }
      if(this.autocompleteInputControl.value) {
        filter.q = this.autocompleteInputControl.value;
      }
      if(this.onlyUsersWithSameOrganization) {
        filter.ouCode = this.user.mainOrganizationUnit;
      }
      this.filterAgent(filter).subscribe(
        (res: any) => {
          const newFilterAgentList = this.filteredAgentList.concat(res);
          if(newFilterAgentList.length) {
            this.filteredAgentList = newFilterAgentList;
          }
        }
      );
    }
  }

  public updateCustomerExternally(agent: User) {
    if (!this.control.value || !agent ||
      this.control.value.externalId !== agent.externalId) {
      // get party because passed object may be incomplete
      const filter: any = {
        directory: this.identityProvider.getDirectoryName(),
        externalId: agent.externalId,
        pageSize: this.pageSize,
        page: this.pageNumber
      };
        // get agent because passed object may be incomplete
      this.directoryService.getUsersList(filter)
        .subscribe((listUsers: any) => {
            const user: User  = listUsers.items.length ? listUsers.items[0] : null;
            if (user) {
              this.autocompleteInputControl.setValue(user.displayName);
              this.autocomplete.optionSelected.emit(user as any);
            }
          }, (error) => {
            this.errorEmitterService.setError(error);
          });
    }
  }

  private setListeners() {
    if (this.agentSelected) {
      this.autocomplete.optionSelected.subscribe((x: any) => {
        // eslint-disable-next-line
        // in case of handling value passed through the control on init, externalId will be present (only than property is required)
        if (!(x && x.externalId) && (!x || (!x.email && !x.option))) {
          this.agentSelected.emit(null);
          this.control.setValue(null);
          this.clearHidden = true;
        } else {
          const value = x.externalId ? x : x.option.value;
          // prevent emiting preset value (value passed through the control)
          if (!x.externalId) {
            this.agentSelected.emit(value);
          }
          this.control.setValue(value);
          this.clearHidden = false;
        }
      });
    }
    this.autocompleteInputControl.valueChanges
      .pipe(
        startWith(null),
        debounceTime(200),
        distinctUntilChanged(),
        switchMap((r: any) => this.filter(r || ''))
      ).subscribe(
        (res: any) => {
          this.filteredAgentList = res;
        }
      );
    if (this.autocompleteInputControl.value) {
      this.clearHidden = false;
    }
  }
  private filter(val: string): Observable<any[]> {
    if (typeof (val) === 'string') {
      if (val.length < 1) {
        return Observable.create((observer: any) => {
          // this.clearValue();
          this.totalPages = this.initialTotalPages;
          observer.next(this.initialAgentList);
          observer.complete();
        });
      }
      const filter: any = {
        directory: this.identityProvider.getDirectoryName(),
        q: val,
        pageSize: this.pageSize
      };
      if(this.onlyUsersWithSameOrganization) {
        if(this.user && this.user.mainOrganizationUnit) {
          filter.ouCode = this.user.mainOrganizationUnit;
        }
      }
      return this.directoryService.getUsersList(filter)
        .pipe(
          map((response: any) =>
          {
            this.totalCount = response.totalCount;
            this.totalPages = response.totalPages;
            return response?.items.filter((el: any) => this.filterSelected(el));
          }
          ));
    } else {
      return Observable.create((observer: any) => {
        observer.next([]);
        observer.complete();
      });
    }
  }

  private filterSelected(option: User): boolean {
    return !this.control || !this.control.value ||
      (option.externalId || '').toLowerCase() !== this.control.value.externalId;
  }

  private filterAgent(filter: any): Observable<User[]> {
    return this.directoryService.getUsersList(filter)
      .pipe(
        map((response: any) =>
          {
            this.totalCount = response.totalCount;
            if(this.initialTotalPages === 0) {
              this.initialTotalPages = response.totalPages;
              this.totalPages = this.initialTotalPages;
            }
            return response?.items;
          }
        ));
  }
  private initiaListAgent() {
    const filter: any = {
      directory: this.identityProvider.getDirectoryName(),
      pageSize: this.pageSize,
      page: this.pageNumber
    };
    if(this.ouCode){
      filter.ouCode = this.ouCode;
    }
    if(this.onlyUsersWithSameOrganization) {
      if(this.user && this.user.mainOrganizationUnit) {
        filter.ouCode = this.user.mainOrganizationUnit;
      }
    }
    this.filterAgent(filter).subscribe(
      (res) => {
        this.initialAgentList = res;
        this.filteredAgentList = res;
      }
    );
  }
  public getDefaultDirectory(): string{
    return this.identityProvider.getDirectoryName();
  }
}
