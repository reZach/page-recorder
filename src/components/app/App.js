/*global chrome*/
import React from "react";
//import logo from "../../../src/logo.svg";
import "./App.css";
import Recorder from "../recorder/Recorder";
import MyBudget from "../myBudget/myBudget";

function App() {
  return (
    <div className="app app-header">
      <h1 className="app-title">Page Recorder</h1>
      <Recorder></Recorder>
      <MyBudget></MyBudget>
    </div>
  );
}

export default App;
