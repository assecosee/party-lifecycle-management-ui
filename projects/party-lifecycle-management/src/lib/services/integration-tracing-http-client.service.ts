import { Injectable, Injector } from '@angular/core';
import { AbstractHttpClient, HttpClientBuilder, HttpMethod } from '@asseco/common-ui';
import { IntegrationTracing } from '../model/integration-tracing/integration-tracing';

@Injectable({
  providedIn: 'root'
})
export class IntegrationTracingHttpClient extends AbstractHttpClient {
  public serviceName = 'integration-tracing';
  public defaultApiVersion = 'v1';

  constructor(protected override injector: Injector) {
    super(injector);
  }

  public getTracings(key: string): HttpClientBuilder<any> {
    const url = `${this.getUrl()}tracings?context-identifier=${key}`;
    return this.getHttpClientBuilder<any>()
      .addAuthentication()
      .setResponseType('json')
      .setUrl(url)
      .mapResponseToCamelCase();
  }

  public getTracing(key: string): HttpClientBuilder<IntegrationTracing> {
    const url = `${this.getUrl()}tracings/${key}`;
    return this.getHttpClientBuilder<IntegrationTracing>()
      .addAuthentication()
      .setResponseType('json')
      .setUrl(url);
  }
}
