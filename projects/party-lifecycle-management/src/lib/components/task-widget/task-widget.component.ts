import { Component, Injector, OnInit } from '@angular/core';
import { BaseWidget } from '@asseco/components-ui';
import { L10N_LOCALE, L10nLocale } from 'angular-l10n';

@Component({
  selector: 'lib-task-widget',
  templateUrl: './task-widget.component.html',
  styleUrl: './task-widget.component.scss'
})
export class TaskWidgetComponent extends BaseWidget implements OnInit{
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
    this.title = 'Tasks';
  }

}
