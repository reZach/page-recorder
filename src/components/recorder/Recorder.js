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
  }

  componentDidMount() {
    chrome.runtime.onMessage.addListener(function(
      message,
      sender,
      sendResponse
    ) {
      switch (message.action) {
        case "action":
          console.log("last action: " + message.data);
          break;
        case "save":
          sendToContentScript({
            action: "save"
          });
          break;
        default:
          break;
      }

      console.log(message);
      return true;
    });
  }

  clearRecording(event) {
    this.setState(state => ({
      userActions: [],
      status: "Reset recording"
    }));
    sendToContentScript({
      action: "clear"
    });
  }

  startRecording(event) {
    this.setState(state => ({
      status: "Actively recording"
    }));
    sendToContentScript({
      action: "record"
    });
  }

  saveRecording(event) {
    this.setState(state => ({
      status: "Saved recording"
    }));
    sendToContentScript({
      action: "save"
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
        <div />
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
