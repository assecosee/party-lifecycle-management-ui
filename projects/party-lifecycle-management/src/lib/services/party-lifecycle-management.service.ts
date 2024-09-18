import { Injectable, Injector } from '@angular/core';
import { PagedCaseList } from '../model/pagedCaseList';
import { Observable, of } from 'rxjs';
import { FilterCaseCommandQuery } from '../model/filterCaseCommandQuery';
import { AbstractHttpClient, ConfigurationHttpClient, HttpClientBuilder } from '@asseco/common-ui';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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
}
