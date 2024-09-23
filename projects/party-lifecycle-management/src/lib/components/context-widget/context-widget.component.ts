import { Component, OnInit } from '@angular/core';
import { BaseWidget } from '@asseco/components-ui';

@Component({
  selector: 'lib-context-widget',
  templateUrl: './context-widget.component.html',
  styleUrl: './context-widget.component.scss'
})
export class ContextWidgetComponent extends BaseWidget implements OnInit{
  override title: string;
  override configuration?: any;
  ngOnInit(): void {
    this.title = 'Context';
  }

}
