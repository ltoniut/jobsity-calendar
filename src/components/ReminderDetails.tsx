import { TextField } from "@material-ui/core";
import { TimePicker } from "antd";
import { css } from "emotion";
import { DateTime } from "luxon";
import moment, { Moment } from "moment";
import React, { useEffect, useState } from "react";
import { SketchPicker } from "react-color";

export interface Props {
  id: number;
  color: string;
  day: DateTime;
  time: string;
  city: string;
  message: string;
}

export const Reminder = (props: Props) => {
  const [time, setTime] = useState(moment(props.time));
  const [city, setCity] = useState(props.city);
  const [color, setColor] = useState<string>(props.color);
  const [weather, setWeather] = useState<string>("");

  const onChangeTime = (t: Moment | null) => {
    if (t) setTime(t);
    else setTime(moment("00:00"));
  };

  useEffect(() => {
    if (city && time) {
      // Find weather
    }
  }, [city]);

  const styles = {
    component: css`
      background-color: ${color};
      color: #ffffff;
      text-align: center;
      width: 100%;
    `,
  };

  // Functionality to change date and city
  return (
    <div className={styles.component}>
      <label>Message: </label>
      <TextField
        defaultValue="Message"
        inputProps={{
          maxLength: 30,
        }}
      />
      <br />
      <label>Day: {props.day.toFormat("MM / dd")}</label>
      <br />
      <TimePicker value={time} onChange={onChangeTime} />
      <br />
      <label>City: </label>
      <TextField
        defaultValue="City"
        inputProps={{
          maxLength: 30,
        }}
      />{" "}
      <br />
      <label>Color: </label>
      <SketchPicker />
      <br />
    </div>
  );
};
