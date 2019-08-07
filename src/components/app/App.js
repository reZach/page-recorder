/*global chrome*/
import React from "react";
import logo from "../../../src/logo.svg";
import "./App.css";
import Recorder from "../recorder/Recorder";

function App() {
  return (
    <div className="app app-header">
      <h1 className="app-title">Page Recorder</h1>
      <Recorder></Recorder>
    </div>
  );
}

export default App;
