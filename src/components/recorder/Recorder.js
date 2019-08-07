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

  chromeListener(event){
    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
        // switch(message.action){        
        //     default:
        //         break;
        // }

        console.log(message);
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
          <input type="button" value="Clear" onClick={this.clearRecording} /> - Resets recording
        </div>
        <div>
          <input type="button" value="Save" onClick={this.startRecording} /> - Saves recording file
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
