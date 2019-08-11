/* global chrome */
import React, { Component } from "react";
import "./myBudget.css";
import { sendToContentScript } from "../../utils/extensionHelper";

class MyBudget extends React.Component {
  constructor() {
    super();

    this.state = {
      date: "",
      dateText: "",
      dateFormat: "mm/dd/yy",
      amount: "",
      amountText: "",
      amountFormat: "$xx.xx",
      category: "",
      categoryText: "",
      subCategory: "",
      subCategoryText: "",
      note: "",
      noteText: ""
    };

    this.dateFormats = [
      "mm/dd/yy",
      "mm/dd/yyyy",
      "yy/mm/dd",
      "yyyy/mm/dd"
    ];
    this.amountFormats = [
      "$xx.xx"
    ];

    this.componentDidMount = this.componentDidMount.bind(this);
    this.refreshDataPoints = this.refreshDataPoints.bind(this);
    this.captureDataPoint = this.captureDataPoint.bind(this);
    this.changeDateFormat = this.changeDateFormat.bind(this);
    this.changeAmountFormat = this.changeAmountFormat.bind(this);
    this.renderDataPoints = this.renderDataPoints.bind(this);
    this.renderDateFormats = this.renderDateFormats.bind(this);
    this.renderAmountFormats = this.renderAmountFormats.bind(this);
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
    console.warn(`refreshDataPoints`);
    if (data === null || typeof data === "undefined") return;
    
    let updDate = "";
    let updDateText = "";
    let updAmount = "";
    let updAmountText = "";
    let updCategory = "";
    let updCategoryText = "";
    let updSubcategory = "";
    let updSubcategoryText = "";
    let updNote = "";
    let updNoteText = "";
    if (data["dataPoint_date"]){
      updDate = data["dataPoint_date"].selector;
      updDateText = data["dataPoint_date"].textContent;
    }
    if (data["dataPoint_amount"]){
      updAmount = data["dataPoint_amount"].selector;
      updAmountText = data["dataPoint_amount"].textContent;
    }
    if (data["dataPoint_category"]){
      updCategory = data["dataPoint_category"].selector;
      updCategoryText = data["dataPoint_category"].textContent;
    }
    if (data["dataPoint_subcategory"]){
      updSubcategory = data["dataPoint_subcategory"].selector;
      updSubcategoryText = data["dataPoint_subcategory"].textContent;
    }
    if (data["dataPoint_note"]){
      updNote = data["dataPoint_note"].selector;
      updNoteText = data["dataPoint_note"].textContent;
    }

    this.setState(state => ({
      date: updDate,
      dateText: updDateText,
      amount: updAmount,
      amountText: updAmountText,
      category: updCategory,
      categoryText: updCategoryText,
      subCategory: updSubcategory,
      subCategoryText: updSubcategoryText,
      note: updNote,
      noteText: updNoteText
    }));
  }

  captureDataPoint(propertyName){

    // Begin capturing for this data point
    sendToContentScript(`dataPoint_${propertyName}`);
  }

  changeDateFormat(event){
    this.setState(state => ({
      dateFormat: event.target.selected
    }));
  }

  changeAmountFormat(event){
    this.setState(state => ({
      amountFormat: event.target.selected
    }));
  }

  renderDateFormats(){
    let options = [];

    for (var i = 0; i < this.dateFormats.length; i++){
      options.push(
        <option value={`${this.dateFormats[i]}`} selected={this.dateFormats[i] === this.state.dateFormat}>{this.dateFormats[i]}</option>
      );
    }

    return (
      <select onChange={this.changeDateFormat}>
        {options}
      </select>
    )
  }

  renderAmountFormats(){
    let options = [];

    for (var i = 0; i < this.amountFormats.length; i++){
      options.push(
        <option value={`${this.amountFormats[i]}`} selected={this.amountFormats[i] === this.state.amountFormat || this.amountFormats.length === 1}>{this.amountFormats[i]}</option>
      );
    }

    return (
      <select>
        {options}
      </select>
    )
  }

  renderSelectorCell(propertySelector, propertyValue, stringName){  
    if (propertySelector === ""){
      return (
        <div className="empty-cell" onClick={() => this.captureDataPoint(stringName)}>
          (Select)
        </div>
      );
    } else { 
      return (
        <div onClick={() => this.captureDataPoint(stringName)}>
          {propertyValue}
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
            <div>Value</div>
            <div>Format</div>
            
            {/*data points*/}
            <div>Date</div>
            {this.renderSelectorCell(this.state.date, this.state.dateText, "date")}            
            <div>{this.renderDateFormats()}</div>

            <div>Amount</div>
            {this.renderSelectorCell(this.state.amount, this.state.amountText, "amount")}
            <div>{this.renderAmountFormats()}</div>

            <div>Category</div>
            {this.renderSelectorCell(this.state.category, this.state.categoryText, "category")}
            <div>N/A</div>

            <div>Sub-category</div>
            {this.renderSelectorCell(this.state.subCategory, this.state.subCategoryText, "subcategory")}            
            <div>N/A</div>

            <div>Note</div>
            {this.renderSelectorCell(this.state.note, this.state.noteText, "note")}            
            <div>N/A</div>
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
