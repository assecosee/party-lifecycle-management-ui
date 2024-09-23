import { Component, OnInit } from '@angular/core';
import { BaseWidget } from '@asseco/components-ui';

@Component({
  selector: 'lib-tracking-widget',
  templateUrl: './tracking-widget.component.html',
  styleUrl: './tracking-widget.component.scss'
})
export class TrackingWidgetComponent extends BaseWidget implements OnInit {
  override title: string;
  override configuration?: any;
  ngOnInit(): void {
    this.title = 'Tracking';
  }

}
