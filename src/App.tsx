import { DateTime } from "luxon";
import React from "react";
import "./App.css";
import { Calendar } from "./components/Calendar";

export const App = () => (
  <div className="App">
    <Calendar date={DateTime.utc().startOf("day")} />
  </div>
);

export default App;
