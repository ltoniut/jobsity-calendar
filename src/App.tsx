import "antd/dist/antd.css";
import { DateTime } from "luxon";
import React from "react";
import "./App.css";
import { Calendar } from "./components/Calendar";
import { jawgdMapsAPI, openWeatherAPI } from "./lib/api";

export const App = () => (
  <div className="App">
    <Calendar
      env={{
        jawgdMapsAPI: jawgdMapsAPI(
          "RWtnM5Cl0RNlchWd1BQN0gx4l1E596HkNkp2YzNyyFA5FmMd1Uoi5yKyhQWsa4Z9"
        ),
        openWeatherAPI: openWeatherAPI("c78e9ebc9005d5b2db1bd0fc80e530d5"),
      }}
      date={DateTime.utc().startOf("day")}
    />
  </div>
);

export default App;
