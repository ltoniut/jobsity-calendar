import { TimePicker, Input, DatePicker, AutoComplete } from "antd";
import { css, cx } from "emotion";
import * as A from "fp-ts/lib/Array";
import * as AP from "fp-ts/lib/Apply";
import * as E from "fp-ts/lib/Either";
import { pipe, flow } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { DateTime } from "luxon";
import { Moment } from "moment";
import React, { useEffect, useState } from "react";
import { from } from "rxjs";
import { IRestResponse } from "typed-rest-client";
import { Env } from "../env";
import { lazyUnsubscribe } from "../helpers/functions/lazyUnsubscribe";
import moment from "moment";

export interface Props {
  id: number;
  env: Env;
  color: string;
  day: DateTime;
  time: O.Option<Moment>;
  city: string;
  message: string;
  positionX: number;
  positionY: number;
  goesLeft: boolean;
  saveReminder: (props: Props) => void;
  deleteReminder: (id: number) => void;
}

export const Reminder = (props: Props) => {
  const [timeO, setTimeO] = useState<O.Option<Moment>>(() => props.time);
  const [day, setDay] = useState<DateTime>(props.day);
  const [city, setCity] = useState(props.city);
  const [cityFinder, setCityFinder] = useState(props.city);
  const [color, setColor] = useState<string>(props.color);
  const [message, setMessage] = useState<string>(props.message);
  const [weather, setWeather] = useState<string>("");
  const key = props.id;

  const updatedData: () => Props = () => {
    return {
      id: key,
      color: color,
      env: props.env,
      day: day,
      time: timeO,
      city: city,
      message: message,
      goesLeft: props.goesLeft,
      positionX: props.positionX,
      positionY: props.positionY,
      saveReminder: props.saveReminder,
      deleteReminder: props.deleteReminder,
    };
  };

  // DEBUG API
  const [
    googlePlacesAutocompleteApiCall,
    setGooglePlacesAutocompleteApiCall,
  ] = useState<O.Option<E.Either<unknown, IRestResponse<unknown>>>>(
    () => O.none
  );
  useEffect(
    () =>
      lazyUnsubscribe(
        from(
          props.env.googlePlaceAPI.autocompleteCity({ search: cityFinder })()
        ).subscribe((x) => setGooglePlacesAutocompleteApiCall(O.some(x)))
      ),
    [cityFinder]
  );

  const [openWeatherApiCall, setOpenWeatherApiCall] = useState<
    O.Option<E.Either<unknown, IRestResponse<unknown>>>
  >(() => O.none);
  useEffect(
    () =>
      pipe(
        { time: timeO },
        AP.sequenceS(O.option),
        O.fold(
          () => {},
          ({ time }) =>
            lazyUnsubscribe(
              from(
                props.env.openWeatherAPI.getCurrentWeather({
                  city,
                })()
              ).subscribe((x) => setOpenWeatherApiCall(O.some(x)))
            )
        )
      ),
    [city, timeO]
  );

  return (
    <form
      className={styles.component({
        x: props.positionX,
        y: props.positionY,
        goesLeft: props.goesLeft,
      })}
      action=""
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <div>{props.day.toFormat("MM / dd")}</div>
      <DatePicker
        defaultValue={moment(props.day.toRFC2822(), "DD-MMM-YYYY")}
        onChange={(e) => {
          if (e) setDay(DateTime.fromJSDate(e.toDate()));
        }}
      />
      <div>
        <Input
          name="message"
          placeholder="Write some message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      <div>
        <TimePicker
          value={O.toNullable(timeO)}
          onChange={flow(O.fromNullable, setTimeO)}
        />
      </div>
      <div>
        <AutoComplete placeholder="Search city" onChange={setCity} />
      </div>
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
      <div className={styles.colorSelector}>
        {pipe(
          colorChoices,
          A.map((r) => (
            <div
              className={cx([
                styles.color(r),
                ...(color === r ? [styles.selectedColor] : []),
              ])}
              onClick={() => setColor(r)}
            />
          ))
        )}
      </div>
      <button onClick={() => props.saveReminder(updatedData())}>Save</button>
      <button onClick={() => props.deleteReminder(props.id)}>Delete</button>
    </form>
  );
};

const styles = {
  component: ({
    x,
    y,
    goesLeft,
  }: {
    x: number;
    y: number;
    goesLeft: boolean;
  }) => css`
    background-color: white;
    border: 1px solid grey;
    display: flex;
    flex-direction: column;
    color: #000000;
    position: absolute;
    text-align: center;
    width: 200px;
    padding: 0.5rem;
    ${direction(x, y, goesLeft)};
    > * {
      margin-bottom: 0.5rem;
    }
  `,
  colorSelector: css`
    display: grid;
    grid-gap: 0.25rem;
    grid-template-columns: repeat(auto-fit, 2rem);
  `,
  selectedColor: css`
    border: 2px black solid;
  `,
  color: (color: string) => css`
    background-color: ${color};
    width: 2rem;
    height: 2rem;
    float: left;
    border-style: solid;
    border-width: thin;
  `,
};

const direction = (x: number, y: number, goesLeft: boolean) =>
  goesLeft
    ? css`
        right: ${window.innerWidth - x + 5}px;
        top: ${y + 5}px;
      `
    : css`
        left: ${x + 5}px;
        top: ${y + 5}px;
      `;

const colorChoices = [
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "purple",
  "white",
];
