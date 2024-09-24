import { Component, Injector, OnInit } from '@angular/core';
import { BaseWidget } from '@asseco/components-ui';
import { L10N_LOCALE, L10nLocale } from 'angular-l10n';

@Component({
  selector: 'lib-context-widget',
  templateUrl: './context-widget.component.html',
  styleUrl: './context-widget.component.scss'
})
export class ContextWidgetComponent extends BaseWidget implements OnInit{
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
    this.title = 'Context';
  }

}
