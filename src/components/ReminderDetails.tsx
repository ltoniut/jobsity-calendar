import { TextField } from "@material-ui/core";
import { TimePicker } from "antd";
import { css } from "emotion";
import { DateTime } from "luxon";
import { identity, pipe } from "fp-ts/lib/function";
import moment, { Moment } from "moment";
import React, { useEffect, useState } from "react";
import { SketchPicker, ColorResult } from "react-color";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { from } from "rxjs";
import { IRestResponse, RestClient } from "typed-rest-client";
import { lazyUnsubscribe } from "../helpers/functions/lazyUnsubscribe";

export interface Props {
  id: number;
  color: string;
  day: DateTime;
  time: string;
  city: string;
  message: string;
  positionX: number;
  positionY: number;
}

export const Reminder = (props: Props) => {
  const [time, setTime] = useState(props.time);
  const [city, setCity] = useState(props.city);
  const [color, setColor] = useState<string>(props.color);
  const [displayColors, setDisplayColors] = useState<boolean>(false);
  const [message, setMessage] = useState<string>(props.message);
  const [weather, setWeather] = useState<string>("");

  const userAgent = "challenge-calendar";

  const onChangeTime = (t: Moment | null) => {
    if (t) setTime(t.hours + "/" + t.minutes);
    else setTime("00:00");
  };

  useEffect(() => {
    if (city && time) {
      // Find weather
    }
  }, [city]);

  const handleChangeColor = (color: ColorResult) => {
    setColor(color.hex);
  };

  // DEBUG API
  // API Reference https://developers.google.com/places/web-service/autocomplete
  const googlePlacesApiKey = "";
  const [
    googlePlacesAutocompleteApiCall,
    setGooglePlacesAutocompleteApiCall,
  ] = useState<O.Option<E.Either<unknown, IRestResponse<unknown>>>>(
    () => O.none
  );
  const googlePlacesClient = new RestClient(
    userAgent,
    "https://maps.googleapis.com"
  );
  useEffect(
    () =>
      lazyUnsubscribe(
        from(
          TE.tryCatch(
            () =>
              googlePlacesClient.get(
                // `/maps/api/place/autocomplete/output?parameters`
                `/maps/api/place/autocomplete`
              ),
            identity
          )()
        ).subscribe((x) => setGooglePlacesAutocompleteApiCall(O.some(x)))
      ),
    []
  );

  // API Reference https://openweathermap.org/current
  const openWeatherApiKey = "";
  const [openWeatherApiCall, setOpenWeatherApiCall] = useState<
    O.Option<E.Either<unknown, IRestResponse<unknown>>>
  >(() => O.none);
  const openWeatherClient = new RestClient(
    userAgent,
    "https://api.openweathermap.org"
  );
  useEffect(
    () =>
      lazyUnsubscribe(
        from(
          TE.tryCatch(
            () =>
              openWeatherClient.get(
                `data/2.5/weather?q=${props.city}&appid=${openWeatherApiKey}`
              ),
            identity
          )()
        ).subscribe((x) => setOpenWeatherApiCall(O.some(x)))
      ),
    []
  );

  // Functionality to change date and city
  return (
    <div className={styles.component(color, props.positionX, props.positionY)}>
      <label>Message: </label>
      <TextField
        defaultValue={message}
        inputProps={{
          maxLength: 30,
        }}
      />
      <br />
      <label>Day: {props.day.toFormat("MM / dd")}</label>
      <br />
      <TimePicker onChange={onChangeTime} />
      <br />
      <label>City: </label>
      <TextField
        defaultValue="City"
        inputProps={{
          maxLength: 30,
        }}
      />{" "}
      <section>
        <h4>GOOGLE PLACES API - DEBUG</h4>
        <div>
          {pipe(
            googlePlacesAutocompleteApiCall,
            O.fold(
              () => <div>Nothing yet.</div>,
              E.fold(
                (e) => <div>Error: {JSON.stringify(e)}</div>,
                (x) => <div>Result: {JSON.stringify(x)}</div>
              )
            )
          )}
        </div>
      </section>
      <label>Weather: </label>
      <section>
        <h4>OPEN WEATHER API - DEBUG</h4>
        <div>
          {pipe(
            openWeatherApiCall,
            O.fold(
              () => <div>Nothing yet.</div>,
              E.fold(
                (e) => <div>Error: {JSON.stringify(e)}</div>,
                (x) => <div>Result: {JSON.stringify(x)}</div>
              )
            )
          )}
        </div>
      </section>
      <br />
      <button onClick={() => setDisplayColors(true)}>Select Color: </button>
      {displayColors && <SketchPicker onChangeComplete={handleChangeColor} />}
      <br />
    </div>
  );
};

const styles = {
  component: (color: string, positionX: number, positionY: number) => css`
    background-color: ${color};
    border: 1px solid grey;
    color: #000000;
    text-align: center;
    width: 20%;
    position: absolute;
    left: ${positionX}px;
    top: ${positionY}px;
  `,
};
