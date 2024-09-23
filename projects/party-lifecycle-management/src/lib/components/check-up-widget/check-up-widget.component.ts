import { Component, OnInit } from '@angular/core';
import { BaseWidget } from '@asseco/components-ui';

@Component({
  selector: 'lib-check-up-widget',
  templateUrl: './check-up-widget.component.html',
  styleUrl: './check-up-widget.component.scss'
})
export class CheckUpWidgetComponent extends BaseWidget implements OnInit {
  override title: string;
  override configuration?: any;
  ngOnInit(): void {
    this.title = 'Check ups';
  }

}
