import React from "react";
import logo from "../../../src/logo.svg";
import "./App.css";
import Recorder from "../recorder/Recorder";

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <img src={logo} className="app-logo" alt="logo" />
        Page Recorder
      </header>
      <Recorder></Recorder>
    </div>
  );
}

export default App;
