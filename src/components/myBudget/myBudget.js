/* global chrome */
import React, { Component } from "react";
import "./myBudget.css";
import { sendToContentScript } from "../../utils/extensionHelper";

class MyBudget extends React.Component {
  constructor() {
    super();

    this.state = {
      date: "",
      dateFormat: "",
      amount: "",
      amountFormat: "",
      category: "",
      subCategory: "",
      note: ""
    };

    this.componentDidMount = this.componentDidMount.bind(this);
    this.refreshDataPoints = this.refreshDataPoints.bind(this);
    this.captureDataPoint = this.captureDataPoint.bind(this);
    this.renderDataPoints = this.renderDataPoints.bind(this);
  }

  componentDidMount() {
    chrome.runtime.onMessage.addListener(function(
      message,
      sender,
      sendResponse
    ) {
      switch (message.action) {
        case "dataPointAll":
          this.refreshDataPoints(message.data);          
          break;
        default:
          break;
      }

      sendResponse({});
      return true;
    }.bind(this));

    // Refresh data from localstorage
    sendToContentScript("dataPointAll");
  }

  refreshDataPoints(data){
    if (data === null || typeof data === "undefined") return;
    
    let updDate = "";
    let updAmount = "";
    let updCategory = "";
    let updSubcategory = "";
    let updNote = "";
    if (data["dataPoint_date"]){
      updDate = data["dataPoint_date"].selector;
    }
    if (data["dataPoint_amount"]){
      updAmount = data["dataPoint_amount"].selector;
    }
    if (data["dataPoint_category"]){
      updCategory = data["dataPoint_category"].selector;
    }
    if (data["dataPoint_subcategory"]){
      updSubcategory = data["dataPoint_subcategory"].selector;
    }
    if (data["dataPoint_note"]){
      updNote = data["dataPoint_note"].selector;
    }

    this.setState(state => ({
      date: updDate,
      amount: updAmount,
      category: updCategory,
      subCategory: updSubcategory,
      note: updNote
    }));
  }

  captureDataPoint(propertyName){

    // Begin capturing for this data point
    sendToContentScript(`dataPoint_${propertyName}`);
  }

  renderSelectorCell(property, stringName){
    console.log(property, stringName);
    if (property === ""){
      return (
        <div className="empty-cell" onClick={() => this.captureDataPoint(stringName)}>
          (Select)
        </div>
      );
    } else {
      return (
        <div onClick={() => this.captureDataPoint(stringName)}>
          {property}
        </div>
      );
    }
  }

  renderDataPoints() {
    return (
      <div>
          <h3>Data points</h3>
          <div className="data-point-grid">
            <div>Selector</div>
            <div>Type</div>
            <div>Format</div>
            
            {/*data points*/}
            <div>Date</div>
            {this.renderSelectorCell(this.state.date, "date")}            
            <div></div>

            <div>Amount</div>
            {this.renderSelectorCell(this.state.amount, "amount")}
            <div>{this.state.amountFormat}</div>

            <div>Category</div>
            {this.renderSelectorCell(this.state.category, "category")}
            <div></div>

            <div>Sub-category</div>
            {this.renderSelectorCell(this.state.subCategory, "subcategory")}            
            <div></div>

            <div>Note</div>
            {this.renderSelectorCell(this.state.note, "note")}            
            <div></div>
          </div>
        <div />
      </div>
    );
  }

  render() {
    return (
      <div className="my-budget">
        {this.renderDataPoints()}
        
      </div>
    );
  }
}

export default MyBudget;
