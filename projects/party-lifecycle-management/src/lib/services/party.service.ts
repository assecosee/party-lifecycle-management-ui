import { Injectable, Injector } from '@angular/core';
import { AbstractHttpClient, EnvironmentService, HttpMethod } from '@asseco/common-ui';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PartyService extends AbstractHttpClient {
  protected override defaultApiVersion = this.getApiVersion() ?? 'v1';
  protected serviceName = 'party';
  public url: string;
  constructor(protected override injector: Injector, protected override envService: EnvironmentService) {
    super(injector);
    this.url = this.getUrl();
  }

  public getParty(partyQueryParams: string): Observable<any> {
    const builder = this.getHttpClientBuilder<any[]>()
      .setUrl(`${this.url}parties${partyQueryParams}`)
      .setHttpMethod(HttpMethod.GET)
      .mapResponseToCamelCase()
      .addAuthentication();

    return builder.build();
  }
}
