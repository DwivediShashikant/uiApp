import { TestBed } from '@angular/core/testing';
import { HttpService } from './http.service';
import { HttpClientModule, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { defer } from "rxjs";
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CompileShallowModuleMetadata } from '@angular/compiler';

let httpClientSpy: { get: jasmine.Spy, post: jasmine.Spy };
let httpService: HttpService;

/** Create async observable that emits-once and completes
 *  after a JS engine turn */
export function asyncData<T>(data: T) {
  return defer(() => Promise.resolve(data));
}

export function asyncSucess<T>(successObject: T) {
  return defer(() => Promise.resolve(successObject));
}

/** Create async observable error that errors
 *  after a JS engine turn */
export function asyncError<T>(errorObject: any) {
  return defer(() => Promise.reject(errorObject));
}

describe('HttpService', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserModule,
        HttpClientModule,
        FormsModule
      ]
    })
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post']);
    httpService = new HttpService(<any>httpClientSpy);
  });


  it('should be created', () => {
    const service: HttpService = TestBed.get(HttpService);
    expect(service).toBeTruthy();
  });

  ///////////////////////////////// checking get request ///////////////////////////////////
  it('should return expected approval Request', () => {
    const expectedApprovalRequests: any[] = [
      {
        accessName: "JIRA",
        accessRequestStatus: true,
        approvalRequestId: "1",
        isChecked: true
      },
      {
        accessName: "Crucible",
        accessRequestStatus: true,
        approvalRequestId: "2",
        isChecked: false
      }
    ]

    httpClientSpy.get.and.returnValue(asyncData(expectedApprovalRequests));

    httpService.makeRequest('GET', 'cernerurl')
      .subscribe(
        approvalRequest => expect(approvalRequest).toEqual(expectedApprovalRequests, 'expect Approval Requests'),
        fail
      );
    expect(httpClientSpy.get.calls.count()).toBe(1, 'one call');
  })


  it('should return an error when the server returns a 404', () => {
    const errorResponse = new HttpErrorResponse({
      error: 'test 404 error',
      status: 404, statusText: 'Not Found'
    });

    httpClientSpy.get.and.returnValue(asyncError(errorResponse));

    httpService.makeRequest('GET', 'cernerurl').subscribe(
      approvelRequest => fail('expected an error, not approvel Request'),
      error => expect(error).toContain('Something bad happened')
    );
  });

  //////////////////////////// checking post request //////////////////////////////////

  it('should return a success response when the serve return a 200 code', () => {
    const successResposne = new HttpResponse({
      body : 'test 200 response',
      status : 200, statusText : 'Post request successful'
    });

    httpClientSpy.post.and.returnValue(asyncSucess(successResposne));

    httpService.makeRequest('POST','cerner',{key : 'demo object'})
    .subscribe(
      response => expect(response.body).toContain('200'),
      error => fail(`expected success not error : ${error}`)
    )
  })

  it('should return an error on post request when the server returns a 404', () => {
    const errorResponse = new HttpErrorResponse({
      error: 'test 404 error',
      status: 404, statusText: 'Not Found'
    });

    httpClientSpy.post.and.returnValue(asyncError(errorResponse));

    httpService.makeRequest('POST', 'cernerurl',{key : 'demo object'}).subscribe(
      approvelRequest => fail('expected an error, not approvel Request'),
      error => expect(error).toContain('Something bad happened')
    );
  });


  /////////////////// testing when wrong http request is made /////////////////////
  
  it('should return an error when making weiong http request', () => {
    const errorResponse = new HttpErrorResponse({
      error: 'test 500error',
      status: 500, statusText: 'wrong http request'
    });

    httpService.makeRequest('XYZ','cerenerurl')
    .subscribe(
      response =>  fail('expected error not a success response'),
      error => expect(error).toContain('request type is not valid')
    )
  })
});


