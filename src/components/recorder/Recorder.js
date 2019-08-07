import React, { Component } from "react";
import "./Recorder.css";

class Recorder extends React.Component {
  constructor() {
    super();
    
    this.state = {
      test: "afasfawef"
    };
  }

  render() {
    return (
      <div>
        <div>{this.state.test}</div>
        <div>test</div>
      </div>
    );
  }
}

export default Recorder;
