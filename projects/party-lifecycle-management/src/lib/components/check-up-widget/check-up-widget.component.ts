import { Component, Injector, OnInit } from '@angular/core';
import { BaseWidget } from '@asseco/components-ui';
import { L10N_LOCALE, L10nLocale } from 'angular-l10n';

@Component({
  selector: 'lib-check-up-widget',
  templateUrl: './check-up-widget.component.html',
  styleUrl: './check-up-widget.component.scss'
})
export class CheckUpWidgetComponent extends BaseWidget implements OnInit {
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
    this.title = 'Check ups';
  }

}
