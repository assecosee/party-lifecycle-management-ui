import { Injectable, Injector } from '@angular/core';
import { AbstractHttpClient, EnvironmentService, HttpMethod } from '@asseco/common-ui';
import { Observable } from 'rxjs';
import { ListChannels } from '../model/reference/listChannels';

@Injectable({
  providedIn: 'root'
})
export class ReferenceService extends AbstractHttpClient {
  protected override defaultApiVersion = this.getApiVersion() ?? 'v1';
  protected serviceName = 'reference';
  public url: string;
  constructor(protected override injector: Injector, protected override envService: EnvironmentService) {
    super(injector);
    this.url = this.getUrl();
  }

  public getCountries(): Observable<any> {
    const builder = this.getHttpClientBuilder<any[]>()
      .setUrl(`${this.url}countries`)
      .setHttpMethod(HttpMethod.GET)
      .mapResponseToCamelCase()
      .addAuthentication();

    return builder.build();
  }

  public getCurrencies(): Observable<any> {
    const builder = this.getHttpClientBuilder<any[]>()
      .setUrl(`${this.url}currencies`)
      .setHttpMethod(HttpMethod.GET)
      .mapResponseToCamelCase()
      .addAuthentication();

    return builder.build();
  }

  public getChannels(ignoreLoader = false): Observable<ListChannels> {
    const builder = this.getHttpClientBuilder<ListChannels>().mapResponseToCamelCase().
      addAuthentication()
      .setHttpMethod(HttpMethod.GET).setUrl(this.getUrl() + 'channels');
    builder.setIgnoreLoader(ignoreLoader);
    return builder.build();
  }

}
