import { Component, Injector, OnInit } from '@angular/core';
import { BaseWidget } from '@asseco/components-ui';
import { L10N_LOCALE, L10nLocale } from 'angular-l10n';

@Component({
  selector: 'lib-wiservicing-info-widget',
  templateUrl: './wiservicing-info-widget.component.html',
  styleUrl: './wiservicing-info-widget.component.scss'
})
export class WIServicingInfoWidgetComponent extends BaseWidget implements OnInit {
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
    this.title = 'Servicing info';
  }

}
