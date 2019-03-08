import { Component, OnInit } from '@angular/core';
import { HttpService } from '../http.service';

@Component({
  selector: 'app-serch-box',
  templateUrl: './serch-box.component.html',
  styleUrls: ['./serch-box.component.css']
})

export class SerchBoxComponent implements OnInit {
  // toolsForAssociateList: any = [];
  searchedAssociateId: any = "";
  isErrorVisible: boolean = false;
  isSearchDivVisible: boolean = true;
  isPreviewVisible: boolean = false;
  isFinalSucessResponseArrived: boolean = false;
  isFinalFailureResponseArrived: boolean = false;
  managerEmailId: any;
  body: any;

  baseApprovalRequestList: any[] = [];
  isApprovalRequestForAssociateIdFetched: boolean = false;

  constructor(private httpService: HttpService) { }

  ngOnInit() {
    this.getAllApprovalRequset();
  }

  getAllApprovalRequset() {
    this.httpService.makeRequest('GET', 'getallapprovalrequset')
      .subscribe(response => {
        console.log('getAllApprovalRequset :',response);
        if (response && response.length > 0) {
          this.baseApprovalRequestList = response;
          this.baseApprovalRequestList.forEach(baseApprovalRequestObj => {
            baseApprovalRequestObj.isChecked = false;
            baseApprovalRequestObj.accessRequestStatus = false;
          });
        }
      })
  }

  fetchToolsforAssociate() {
    //fetching employee information based on EMPID
    this.isErrorVisible = false;
    this.isApprovalRequestForAssociateIdFetched = false;
    this.httpService.makeRequest('GET','getapprovalrequsetonassociateId?associateId='+this.searchedAssociateId)
    .subscribe( response => {
      console.log('fetchToolsforAssociate :',response);
      this.isApprovalRequestForAssociateIdFetched = true;
      console.log("response ===>>>" + JSON.stringify(response));
      if (response && response.length) {
        let approvedAssociateList = response;
        //setting checked status for originally checked items

        this.baseApprovalRequestList.forEach(baseApprovalRequestObj => {
          approvedAssociateList.forEach(approvedAssociateIdObj => {
            if (baseApprovalRequestObj.approvalRequestId == approvedAssociateIdObj.approvalRequestId) {
              baseApprovalRequestObj.isChecked = true;
              baseApprovalRequestObj.accessRequestStatus = true;
            }
          });
        });

        console.log("baseApprovalRequestList ===>>" + JSON.stringify(this.baseApprovalRequestList));

      } else {
        this.isErrorVisible = true;
      }
    })
  }

  onSendForApprovalClick() {

    //check if user has checked any new option or access request
    let atLeastOneNewAccessChecked: boolean = false;

    this.baseApprovalRequestList.forEach(element => {
      if (element.accessRequestStatus && !element.isChecked) {
        atLeastOneNewAccessChecked = true;
      }
    });

    if (!atLeastOneNewAccessChecked) {
      alert("Please select atleast one access request !!!!")
      return;
    }

    this.httpService.makeRequest('GET','getmanageremail?associateId='+this.searchedAssociateId)
    .subscribe( response => {
      console.log("onSendForApprovalClick ===>>>" + JSON.stringify(response));
      if (response) {
        this.isSearchDivVisible = false;
        this.isPreviewVisible = true;
        this.managerEmailId = response.managerEmailId;
      }
    })
  }

  onSendClick() {
    console.log("onClick" + JSON.stringify(this.baseApprovalRequestList));
    this.isPreviewVisible = false;
    let body: any = [];
    this.baseApprovalRequestList.forEach(element => {
      if (element.accessRequestStatus && !element.isChecked) {
        delete element.accessName;
        delete element.isChecked;
        delete element.accessRequestStatus;
        element.associateId = this.searchedAssociateId;
        body.push(element);
      }
    });

    console.log("----", body);

    this.httpService.makeRequest('POST','sendmailfromoutlook', body)
    .subscribe( response => {
      if (response && response.statusCode == 200) {
        this.isFinalSucessResponseArrived = true;
      } else {
        this.isFinalFailureResponseArrived = true;
      }
    })
  }
}
