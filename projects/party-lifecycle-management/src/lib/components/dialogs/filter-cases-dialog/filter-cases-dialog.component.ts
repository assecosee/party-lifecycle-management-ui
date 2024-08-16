import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { AseeFormControl, AseeFormGroup, AssecoFormService } from '@asseco/common-ui';

@Component({
  selector: 'party-lcm-filter-cases-dialog',
  templateUrl: './filter-cases-dialog.component.html',
  styleUrl: './filter-cases-dialog.component.scss'
})
export class FilterCasesDialogComponent implements OnInit {

  public filtersGroup: AseeFormGroup | undefined;

 /**
  *
  */
 constructor(
  protected formService: AssecoFormService
 ) {
 
 }

  ngOnInit(): void {
    this.initForm();
  }

  filter() {
    throw new Error('Method not implemented.');
  }
  
  closeDialog() {
    throw new Error('Method not implemented.');
  }
  
  clearFilter() {
    throw new Error('Method not implemented.');
  }

  private initForm() {
    this.filtersGroup = this.formService.getFormGroup('party-lcm/filter-cases-dialog', 
       {
        partyName: new AseeFormControl(null),
        partyNumber: new AseeFormControl(null),
        dateFrom: new AseeFormControl(null),
        dateTo: new AseeFormControl(null)
      }
    );
  }

}
