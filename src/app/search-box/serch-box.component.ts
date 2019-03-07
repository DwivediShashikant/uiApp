import { Component, OnInit } from '@angular/core';
import axios from 'axios';
import { forEach } from '@angular/router/src/utils/collection';

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

  constructor() { }

  ngOnInit() {
    this.getAllApprovalRequset();
  }

  getAllApprovalRequset() {

    axios.get('http://localhost:8080/cerner/getallapprovalrequset').then((response) => {
      console.log("getallapprovalrequset ===>>>" + JSON.stringify(response));
      if (response.data && response.data.length > 0) {
        this.baseApprovalRequestList = response.data;
        this.baseApprovalRequestList.forEach(baseApprovalRequestObj => {
          baseApprovalRequestObj.isChecked = false;
          baseApprovalRequestObj.accessRequestStatus = false;
        });
      }
    });
  }

  fetchToolsforAssociate() {

    //fetching employee information based on EMPID
    this.isErrorVisible = false;
    this.isApprovalRequestForAssociateIdFetched = false;
    axios.get('http://localhost:8080/cerner/getapprovalrequsetonassociateId?associateId=' + this.searchedAssociateId).then((response) => {

      this.isApprovalRequestForAssociateIdFetched = true;
      console.log("response ===>>>" + JSON.stringify(response));
      if (response.data) {
        let approvedAssociateList = response.data;
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
    });
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

    //fetching emailID of manager based on 
    axios.get('http://localhost:8080/cerner/getmanageremail?associateId=' + this.searchedAssociateId).then((response) => {
      console.log("getmanageremail ===>>>" + JSON.stringify(response));
      if (response && response.data) {
        this.isSearchDivVisible = false;
        this.isPreviewVisible = true;
        this.managerEmailId = response.data.managerEmailId;
      }
    });
  }

  onSendClick() {
    console.log("=====" + JSON.stringify(this.baseApprovalRequestList));
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

    axios.post('http://localhost:8080/cerner/sendmailfromoutlook', body).then((response) => {
      console.log("response ===>>>" + JSON.stringify(response));
      if (response.data && response.data.statusCode == 200) {
        this.isFinalSucessResponseArrived = true;
      } else {
        this.isFinalFailureResponseArrived = true;
      }
    });
  }
}
