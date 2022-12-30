import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class BackendInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    let data:any = request.body
    data.token=environment.token
    if(request.url.endsWith('ChangePassword')){
      request = request.clone({ headers: request.headers.set('Authorization',JSON.parse(sessionStorage.getItem('loggedUser')).api_token),body:data});
    }else{
      request = request.clone({ headers: request.headers.set('Authorization', '922A66CE-742F-4173-A8D7-24E381890D76'),body:data});
    }
    return next.handle(request);
  }
}
