import { Injectable, Injector } from '@angular/core';
import { AbstractHttpClient, EnvironmentService, HttpMethod } from '@asseco/common-ui';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PartyLcmService extends AbstractHttpClient {
  protected override defaultApiVersion = this.getApiVersion() ?? 'v1';
  protected serviceName = 'party-lifecycle';
  public url: string;
  constructor(protected override injector: Injector, protected override envService: EnvironmentService) {
    super(injector);
    this.setDefaultApiVersion('beta');
    this.url = this.getUrl();
  }

  public initiateCase(payload: any): Observable<any>{
    const builder = this.getHttpClientBuilder<any[]>()
      .setUrl(`${this.url}lifecycle-cases`)
      .setBody(payload)
      .setHttpMethod(HttpMethod.POST)
      .mapResponseToCamelCase()
      .addAuthentication();

    return builder.build();
  }



}
