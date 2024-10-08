import { Component, Injector, OnInit } from '@angular/core';
import { BaseWidget } from '@asseco/components-ui';
import { L10N_LOCALE, L10nLocale } from 'angular-l10n';

@Component({
  selector: 'lib-widocuments-widget',
  templateUrl: './widocuments-widget.component.html',
  styleUrl: './widocuments-widget.component.scss'
})
export class WIDocumentsWidgetComponent extends BaseWidget implements OnInit{
  override title: string;
  override configuration?: any;
  public locale: L10nLocale;
  constructor(
    private injector: Injector
  ){
    super();
    this.locale = injector.get(L10N_LOCALE);
  }
  ngOnInit(): void {
    this.title = 'Documents';
  }

}
