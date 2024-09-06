import { Injectable, Injector } from '@angular/core';
import { AbstractHttpClient, EnvironmentService, HttpMethod } from '@asseco/common-ui';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OfferService extends AbstractHttpClient {
  protected override defaultApiVersion = this.getApiVersion() ?? 'v1';
  protected serviceName = 'offer';
  public url: string;
  constructor(protected override injector: Injector, protected override envService: EnvironmentService) {
    super(injector);
    this.url = this.getUrl();
  }

  public getClassification(classificationName: string): Observable<any> {
    const builder = this.getHttpClientBuilder<any[]>()
      .setUrl(`${this.url}classifications/${classificationName}`)
      .setHttpMethod(HttpMethod.GET)
      .mapResponseToCamelCase()
      .addAuthentication();

    return builder.build();
  }

}
