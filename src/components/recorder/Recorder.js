/* global chrome */
import React, { Component } from "react";
import "./Recorder.css";
import { sendToContentScript } from "../../utils/extensionHelper";

class Recorder extends React.Component {
  constructor() {
    super();

    this.state = {
      status: "",
      userActions: []
    };

    this.clearRecording = this.clearRecording.bind(this);
    this.startRecording = this.startRecording.bind(this);
    this.saveRecording = this.saveRecording.bind(this);
    this.chromeListener = this.chromeListener.bind(this);
  }

  clearRecording(event){
    this.setState(state => ({
      userActions: [],
      status: "Reset recording"
    }));
    sendToContentScript({
      action: "clear"
    });
  }

  startRecording(event){
    this.setState(state => ({
      status: "Actively recording"
    }));
    sendToContentScript({
      action: "record"
    });
  }

  saveRecording(event){
    this.setState(state => ({
      status: "Saved recording"
    }));
    sendToContentScript({
      action: "save"
    });
  }

  chromeListener(event){
    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
        switch(message.action){        
          case "userAction":
            console.log("last action: " + message.data);
          break;
          default:
            break;
        }

        console.log(message);
        return true;
    });
  }

  renderStatus() {
    if (this.state.status.length > 0) {
      return <div>{this.state.status}</div>;
    }
  }

  renderControls() {
    return (
      <div>
        <div>
          <input type="button" value="Clear" onClick={this.clearRecording} />
          <input type="button" value="Record" onClick={this.startRecording} />
          <input type="button" value="Save" onClick={this.saveRecording} />
        </div>
        <div>
          
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="recorder">
        {this.renderStatus()}
        {this.renderControls()}        
      </div>
    );
  }
}

export default Recorder;
