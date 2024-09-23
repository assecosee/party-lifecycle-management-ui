import { Component, OnInit } from '@angular/core';
import { BaseWidget } from '@asseco/components-ui';

@Component({
  selector: 'lib-task-widget',
  templateUrl: './task-widget.component.html',
  styleUrl: './task-widget.component.scss'
})
export class TaskWidgetComponent extends BaseWidget implements OnInit{
  override title: string;
  override configuration?: any;
  ngOnInit(): void {
    this.title = 'Tasks';
  }

}
