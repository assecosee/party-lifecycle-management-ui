import { Injectable } from '@angular/core';
import { PagedCaseList } from '../model/pagedCaseList';
import { Observable, of } from 'rxjs';
import { FilterCaseCommandQuery } from '../model/filterCaseCommandQuery';

@Injectable({
  providedIn: 'root'
})
export class PartyLifecycleManagementService {

  constructor() { }

  public getCases(filterCaseCommandQuery: FilterCaseCommandQuery): Observable<PagedCaseList> {
    return of(
      {
        totalCount: 10,
        pageSize: 50,
        page: 1,
        totalPages: 3,
        cases: [
          {
            caseNumber: "C-265",
            administrativePlanName: "bpm.individual-onboarding",
            administrativePlanId: "bpm-6b54",
            status: "active",
            priority: "medium",
            partyNumber: "ID001",
            partyName: "John Doe",
            partyKind: "individual",
            creationTime: "2024-08-15",
            partyIdentificationNumber: "1802970302967"
          },
          {
            caseNumber: "C-265",
            administrativePlanName: "bpm.individual-onboarding",
            administrativePlanId: "bpm-6b54",
            status: "active",
            priority: "medium",
            partyNumber: "ID002",
            partyName: "Linda Doe",
            partyKind: "individual",
            creationTime: "2024-08-15",
            partyIdentificationNumber: "1608003363050"
          },
          {
            caseNumber: "C-265",
            administrativePlanName: "bpm.individual-onboarding",
            administrativePlanId: "bpm-6b54",
            status: "active",
            priority: "medium",
            partyNumber: "ID002",
            partyName: "Linda Doe",
            partyKind: "individual",
            creationTime: "2024-08-15",
            partyIdentificationNumber: "1608003363050"
          },
          {
            caseNumber: "C-265",
            administrativePlanName: "bpm.individual-onboarding",
            administrativePlanId: "bpm-6b54",
            status: "active",
            priority: "medium",
            partyNumber: "ID002",
            partyName: "Linda Doe",
            partyKind: "individual",
            creationTime: "2024-08-15",
            partyIdentificationNumber: "1608003363050"
          }, {
            caseNumber: "C-265",
            administrativePlanName: "bpm.individual-onboarding",
            administrativePlanId: "bpm-6b54",
            status: "active",
            priority: "medium",
            partyNumber: "ID002",
            partyName: "Linda Doe",
            partyKind: "individual",
            creationTime: "2024-08-15",
            partyIdentificationNumber: "1608003363050"
          }, {
            caseNumber: "C-265",
            administrativePlanName: "bpm.individual-onboarding",
            administrativePlanId: "bpm-6b54",
            status: "active",
            priority: "medium",
            partyNumber: "ID002",
            partyName: "Linda Doe",
            partyKind: "individual",
            creationTime: "2024-08-15",
            partyIdentificationNumber: "1608003363050"
          }, {
            caseNumber: "C-265",
            administrativePlanName: "bpm.individual-onboarding",
            administrativePlanId: "bpm-6b54",
            status: "active",
            priority: "medium",
            partyNumber: "ID002",
            partyName: "Linda Doe",
            partyKind: "individual",
            creationTime: "2024-08-15",
            partyIdentificationNumber: "1608003363050"
          }, {
            caseNumber: "C-265",
            administrativePlanName: "bpm.individual-onboarding",
            administrativePlanId: "bpm-6b54",
            status: "active",
            priority: "medium",
            partyNumber: "ID002",
            partyName: "Linda Doe",
            partyKind: "individual",
            creationTime: "2024-08-15",
            partyIdentificationNumber: "1608003363050"
          }, {
            caseNumber: "C-265",
            administrativePlanName: "bpm.individual-onboarding",
            administrativePlanId: "bpm-6b54",
            status: "active",
            priority: "medium",
            partyNumber: "ID002",
            partyName: "Linda Doe",
            partyKind: "individual",
            creationTime: "2024-08-15",
            partyIdentificationNumber: "1608003363050"
          }, {
            caseNumber: "C-265",
            administrativePlanName: "bpm.individual-onboarding",
            administrativePlanId: "bpm-6b54",
            status: "active",
            priority: "medium",
            partyNumber: "ID002",
            partyName: "Linda Doe",
            partyKind: "individual",
            creationTime: "2024-08-15",
            partyIdentificationNumber: "1608003363050"
          }, {
            caseNumber: "C-265",
            administrativePlanName: "bpm.individual-onboarding",
            administrativePlanId: "bpm-6b54",
            status: "active",
            priority: "medium",
            partyNumber: "ID002",
            partyName: "Linda Doe",
            partyKind: "individual",
            creationTime: "2024-08-15",
            partyIdentificationNumber: "1608003363050"
          }, {
            caseNumber: "C-265",
            administrativePlanName: "bpm.individual-onboarding",
            administrativePlanId: "bpm-6b54",
            status: "active",
            priority: "medium",
            partyNumber: "ID002",
            partyName: "Linda Doe",
            partyKind: "individual",
            creationTime: "2024-08-15",
            partyIdentificationNumber: "1608003363050"
          }, {
            caseNumber: "C-265",
            administrativePlanName: "bpm.individual-onboarding",
            administrativePlanId: "bpm-6b54",
            status: "active",
            priority: "medium",
            partyNumber: "ID002",
            partyName: "Linda Doe",
            partyKind: "individual",
            creationTime: "2024-08-15",
            partyIdentificationNumber: "1608003363050"
          }, {
            caseNumber: "C-265",
            administrativePlanName: "bpm.individual-onboarding",
            administrativePlanId: "bpm-6b54",
            status: "active",
            priority: "medium",
            partyNumber: "ID002",
            partyName: "Linda Doe",
            partyKind: "individual",
            creationTime: "2024-08-15",
            partyIdentificationNumber: "1608003363050"
          }, {
            caseNumber: "C-265",
            administrativePlanName: "bpm.individual-onboarding",
            administrativePlanId: "bpm-6b54",
            status: "active",
            priority: "medium",
            partyNumber: "ID002",
            partyName: "Linda Doe",
            partyKind: "individual",
            creationTime: "2024-08-15",
            partyIdentificationNumber: "1608003363050"
          }, {
            caseNumber: "C-265",
            administrativePlanName: "bpm.individual-onboarding",
            administrativePlanId: "bpm-6b54",
            status: "active",
            priority: "medium",
            partyNumber: "ID002",
            partyName: "Linda Doe",
            partyKind: "individual",
            creationTime: "2024-08-15",
            partyIdentificationNumber: "1608003363050"
          }, {
            caseNumber: "C-265",
            administrativePlanName: "bpm.individual-onboarding",
            administrativePlanId: "bpm-6b54",
            status: "active",
            priority: "medium",
            partyNumber: "ID002",
            partyName: "Linda Doe",
            partyKind: "individual",
            creationTime: "2024-08-15",
            partyIdentificationNumber: "1608003363050"
          }, {
            caseNumber: "C-265",
            administrativePlanName: "bpm.individual-onboarding",
            administrativePlanId: "bpm-6b54",
            status: "active",
            priority: "medium",
            partyNumber: "ID002",
            partyName: "Linda Doe",
            partyKind: "individual",
            creationTime: "2024-08-15",
            partyIdentificationNumber: "1608003363050"
          }, {
            caseNumber: "C-265",
            administrativePlanName: "bpm.individual-onboarding",
            administrativePlanId: "bpm-6b54",
            status: "active",
            priority: "medium",
            partyNumber: "ID002",
            partyName: "Linda Doe",
            partyKind: "individual",
            creationTime: "2024-08-15",
            partyIdentificationNumber: "1608003363050"
          }, {
            caseNumber: "C-265",
            administrativePlanName: "bpm.individual-onboarding",
            administrativePlanId: "bpm-6b54",
            status: "active",
            priority: "medium",
            partyNumber: "ID002",
            partyName: "Linda Doe",
            partyKind: "individual",
            creationTime: "2024-08-15",
            partyIdentificationNumber: "1608003363050"
          }, {
            caseNumber: "C-265",
            administrativePlanName: "bpm.individual-onboarding",
            administrativePlanId: "bpm-6b54",
            status: "active",
            priority: "medium",
            partyNumber: "ID002",
            partyName: "Linda Doe",
            partyKind: "individual",
            creationTime: "2024-08-15",
            partyIdentificationNumber: "1608003363050"
          }, {
            caseNumber: "C-265",
            administrativePlanName: "bpm.individual-onboarding",
            administrativePlanId: "bpm-6b54",
            status: "active",
            priority: "medium",
            partyNumber: "ID002",
            partyName: "Linda Doe",
            partyKind: "individual",
            creationTime: "2024-08-15",
            partyIdentificationNumber: "1608003363050"
          }, {
            caseNumber: "C-265",
            administrativePlanName: "bpm.individual-onboarding",
            administrativePlanId: "bpm-6b54",
            status: "active",
            priority: "medium",
            partyNumber: "ID002",
            partyName: "Linda Doe",
            partyKind: "individual",
            creationTime: "2024-08-15",
            partyIdentificationNumber: "1608003363050"
          }, {
            caseNumber: "C-265",
            administrativePlanName: "bpm.individual-onboarding",
            administrativePlanId: "bpm-6b54",
            status: "active",
            priority: "medium",
            partyNumber: "ID002",
            partyName: "Linda Doe",
            partyKind: "individual",
            creationTime: "2024-08-15",
            partyIdentificationNumber: "1608003363050"
          }, {
            caseNumber: "C-265",
            administrativePlanName: "bpm.individual-onboarding",
            administrativePlanId: "bpm-6b54",
            status: "active",
            priority: "medium",
            partyNumber: "ID002",
            partyName: "Linda Doe",
            partyKind: "individual",
            creationTime: "2024-08-15",
            partyIdentificationNumber: "1608003363050"
          }, {
            caseNumber: "C-265",
            administrativePlanName: "bpm.individual-onboarding",
            administrativePlanId: "bpm-6b54",
            status: "active",
            priority: "medium",
            partyNumber: "ID002",
            partyName: "Linda Doe",
            partyKind: "individual",
            creationTime: "2024-08-15",
            partyIdentificationNumber: "1608003363050"
          }, {
            caseNumber: "C-265",
            administrativePlanName: "bpm.individual-onboarding",
            administrativePlanId: "bpm-6b54",
            status: "active",
            priority: "medium",
            partyNumber: "ID002",
            partyName: "Linda Doe",
            partyKind: "individual",
            creationTime: "2024-08-15",
            partyIdentificationNumber: "1608003363050"
          }, {
            caseNumber: "C-265",
            administrativePlanName: "bpm.individual-onboarding",
            administrativePlanId: "bpm-6b54",
            status: "active",
            priority: "medium",
            partyNumber: "ID002",
            partyName: "Linda Doe",
            partyKind: "individual",
            creationTime: "2024-08-15",
            partyIdentificationNumber: "1608003363050"
          }, {
            caseNumber: "C-265",
            administrativePlanName: "bpm.individual-onboarding",
            administrativePlanId: "bpm-6b54",
            status: "active",
            priority: "medium",
            partyNumber: "ID002",
            partyName: "Linda Doe",
            partyKind: "individual",
            creationTime: "2024-08-15",
            partyIdentificationNumber: "1608003363050"
          }, {
            caseNumber: "C-265",
            administrativePlanName: "bpm.individual-onboarding",
            administrativePlanId: "bpm-6b54",
            status: "active",
            priority: "medium",
            partyNumber: "ID002",
            partyName: "Linda Doe",
            partyKind: "individual",
            creationTime: "2024-08-15",
            partyIdentificationNumber: "1608003363050"
          }, {
            caseNumber: "C-265",
            administrativePlanName: "bpm.individual-onboarding",
            administrativePlanId: "bpm-6b54",
            status: "active",
            priority: "medium",
            partyNumber: "ID002",
            partyName: "Linda Doe",
            partyKind: "individual",
            creationTime: "2024-08-15",
            partyIdentificationNumber: "1608003363050"
          }
        ]
      } as unknown as PagedCaseList
    );
  }
 
}
