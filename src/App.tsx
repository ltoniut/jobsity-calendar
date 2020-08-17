import { DateTime } from "luxon";
import React from "react";
import "./App.css";
import { Calendar } from "./components/Calendar";
import { googlePlaceAPI, openWeatherAPI } from "./lib/api";
import "antd/dist/antd.css";

export const App = () => (
  <div className="App">
    <Calendar
      env={{
        googlePlaceAPI: googlePlaceAPI(
          "AIzaSyBCqMiTroIEMcSlR5aPrP49b31OnEkJtM8"
        ),
        openWeatherAPI: openWeatherAPI("c78e9ebc9005d5b2db1bd0fc80e530d5"),
      }}
      date={DateTime.utc().startOf("day")}
    />
  </div>
);

export default App;
