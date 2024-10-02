import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IntegrationTracing } from '../../../model/integration-tracing/integration-tracing';

@Component({
  selector: 'party-lcm-integration-tracing-details',
  templateUrl: './integration-tracing-details.component.html',
  styleUrl: './integration-tracing-details.component.scss'
})
export class IntegrationTracingDetailsComponent {
  public details: IntegrationTracing;
  public payload: string;
  public response: string;
  public formGroup: FormGroup;
  public integrationName: string;
  public hasPayload = true;
  public hasResponse = true;
  public hasError = false;


  constructor(
    public dialogRef: MatDialogRef<IntegrationTracingDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.details = this.data.details;
    this.payload = JSON.stringify(this.details.payload.payload,undefined, 4);
    this.response = JSON.stringify(this.details.response.response,undefined, 4);

    if (!this.details['response-code']?.startsWith('20')) {
      this.hasError = true;
    }

    if (this.payload === undefined || this.payload === 'null'){
      this.payload = '';
      this.hasPayload = false;
    }


    if (this.response === undefined || this.response === 'null' || this.response === '[]'){
      this.response = '';
      this.hasResponse = false;
    }


    this.initFormGroup();
  }

  public closeDialog(): void {
    this.dialogRef.close();
  }

  private initFormGroup() {

    this.integrationName = this.details.name;

    this.formGroup = new FormGroup({});
    this.formGroup.addControl('name', new FormControl(
      this.details.name ? this.details.name : null));
    this.formGroup.addControl('payload', new FormControl(
      this.payload ? this.payload : null));
    this.formGroup.addControl('response', new FormControl(
      this.response ? this.response : null));
    this.formGroup.addControl('responseCode', new FormControl(
      this.details['response-code'] ? this.details['response-code'] : null));
    this.formGroup.addControl('method', new FormControl(
      this.details.method ? this.details.method : null));
    this.formGroup.addControl('endpoint', new FormControl(
      this.details.endpoint ? this.details.endpoint : null));
    this.formGroup.addControl('createdBy', new FormControl(
      this.details['created-by'] ? this.details['created-by'] : null));
    this.formGroup.addControl('createdOn', new FormControl(
      this.details['created-on'] ? this.details['created-on'] : null));
  }
}
