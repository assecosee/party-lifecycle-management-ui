import { Component, Injector, Input, OnInit } from '@angular/core';
import { Case } from '../../../model/case';
import { L10N_LOCALE, L10nLocale } from 'angular-l10n';

@Component({
  selector: 'case-overview-header',
  templateUrl: './case-overview-header.component.html',
  styleUrl: './case-overview-header.component.scss'
})
export class CaseOverviewHeaderComponent implements OnInit{
  @Input() set caseOverview(caseOverview: any){
    if(caseOverview !== undefined){
      this._caseOverview = caseOverview as Case;
    }
  }

  public locale: L10nLocale;
  public menuItems: any;
  constructor(private injector: Injector){
    this.locale = injector.get(L10N_LOCALE);
  }
  public _caseOverview: Case;
  ngOnInit(): void {
  }
  public customMenuItemClick( callBack: string): void {
    // const component = this.loadedComponents.get(dashboardItem.id);
    // try {
    //   const instance = component.componentRef.instance;
    //   component.componentRef.instance[callBack].call(instance);
    // } catch (error) {
    //   console.warn('Provided method "' + callBack + '" is not implemented.');
    // }
  }

}
