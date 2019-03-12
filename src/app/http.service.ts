import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, retry} from "rxjs/operators";
import { throwError, Observable } from "rxjs";
@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private baseUrl = 'http://localhost:8080/cerner/';
  constructor(private http : HttpClient) {}

  public makeRequest(requestType : string,path:string,body?, headers?:string, responseType?:string) : Observable<any>{
    let url = this.baseUrl + path;
    switch(requestType){
      case 'GET' : return this.getRequest(url)
      case 'POST': return this.postRequest(url,body)
      default: return throwError('request type is not valid');
    }
  }

  private getRequest(url){
    return this.http.get(url)
    .pipe(
      retry(3),
      catchError(this.handleError)
    )
  }

  private postRequest(url,body,headers?){
    if(!headers){
      return this.http.post(url,body)
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
    }
    else{
      // add headers to post request here
    }
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      'Something bad happened; please try again later.');
  };
}
