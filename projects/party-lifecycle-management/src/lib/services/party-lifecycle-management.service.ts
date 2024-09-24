import { Injectable, Injector } from '@angular/core';
import { PagedCaseList } from '../model/pagedCaseList';
import { Observable, of } from 'rxjs';
import { FilterCaseCommandQuery } from '../model/filterCaseCommandQuery';
import { AbstractHttpClient, ConfigurationHttpClient, HttpClientBuilder, HttpMethod } from '@asseco/common-ui';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ClassificationSchema } from '../model/classification-schema';
import { Case } from '../model/case';

@Injectable({
  providedIn: 'root'
})
export class PartyLifecycleManagementService extends AbstractHttpClient {

  public serviceName = 'party-lifecycle';
  public defaultApiVersion = 'beta';
  private httpHeaders: HttpHeaders = new HttpHeaders();
  constructor(
    private http: HttpClient,
    protected override injector: Injector,
    protected configurationHttpClient: ConfigurationHttpClient
  ) {
    super(injector);
  }
  public getCases(filterCaseCommandQuery?: FilterCaseCommandQuery): Observable<PagedCaseList> {
    const builder = this.getHttpClientBuilder<PagedCaseList>()
      .setUrl(this.getUrl() + 'lifecycle-cases').mapResponseToCamelCase().addAuthentication();
    if(!filterCaseCommandQuery?.include || filterCaseCommandQuery?.include?.includes('entity-info')) {
      if(!filterCaseCommandQuery) {
        filterCaseCommandQuery = {};
      }
      filterCaseCommandQuery.include = 'entity-info';
    }
    if (filterCaseCommandQuery) {
      builder.addRawQueryParams(filterCaseCommandQuery);
    }
    return builder.build();
  }
  public getCaseById(caseId: string, filterCaseCommandQuery: FilterCaseCommandQuery): Observable<Case> {
    const builder = this.getHttpClientBuilder<Case>()
      .setUrl(this.getUrl() + 'lifecycle-cases/' + caseId)
      .addRawQueryParams(filterCaseCommandQuery)
      .mapResponseToCamelCase()
      .addAuthentication();;
    return builder.build();
  }
  public patchCaseStatus(caseId: string, changeCaseStatusBody: any): Observable<any>{
    const builder = this.getHttpClientBuilder<any>()
      .setUrl(`${this.getUrl()}lifecycle-cases/${caseId}/status`)
      .setHttpMethod(HttpMethod.PATCH)
      .setBody(changeCaseStatusBody)
      .addAuthentication();
    return builder.build();
  }
  public getClassification(classificationName: string): Observable<ClassificationSchema> {
    const builder = this.getHttpClientBuilder<ClassificationSchema>()
      .setUrl(`${this.getUrl()}classifications/${classificationName}`)
      .setHttpMethod(HttpMethod.GET)
      .mapResponseToCamelCase()
      .addAuthentication();

    return builder.build();
  }
}
