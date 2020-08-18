import { AutoComplete, Button, DatePicker, Input, TimePicker } from "antd";
import { css, cx } from "emotion";
import * as AP from "fp-ts/lib/Apply";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import { constVoid, flow, identity, not, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { DateTime } from "luxon";
import moment, { Moment } from "moment";
import React, { useState } from "react";
import { from, Subject, timer } from "rxjs";
import { debounce } from "rxjs/operators";
import { Env } from "../env";
import { lazyUnsubscribe } from "../helpers/functions/lazyUnsubscribe";
import { useConst, useEffectSkipping } from "../hooks/custom";
import { useObservableState } from "../hooks/rxjs";
import { WeatherC } from "../lib/api";

export interface Props {
  id: string;
  env: Env;
  color: string;
  day: DateTime;
  time: O.Option<Moment>;
  city: string;
  message: string;
  positionX: number;
  positionY: number;
  goesLeft: boolean;
  saveReminder: (props: Props, id: string) => void;
  deleteReminder: (id: string) => void;
}

export const Reminder = (props: Props) => {
  const [cityOptions, setCityOptions] = useState<Array<string>>(() => []);
  const [day, setDay] = useState<DateTime>(props.day);
  const [timeO, setTimeO] = useState<O.Option<Moment>>(() => props.time);
  const [city, setCity] = useState(props.city);
  const [color, setColor] = useState<string>(props.color);
  const [message, setMessage] = useState<string>(props.message);
  const [weatherO, setWeatherO] = useState<O.Option<WeatherC>>(O.none);

  const updatedData: () => Props = () => ({
    id: props.id,
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
  });

  const cityInput$ = useConst(() => new Subject<string>());
  const cityInput = useObservableState(
    useConst(() => cityInput$.pipe(debounce(() => timer(400)))),
    city
  );
  useEffectSkipping(
    () =>
      lazyUnsubscribe(
        from(
          props.env.jawgdMapsAPI.autocompleteCity({ search: cityInput })()
        ).subscribe({
          next: E.fold(
            constVoid,
            flow(
              A.takeLeft(6),
              A.map((p) => p.properties.name ?? ""),
              setCityOptions
            )
          ),
        })
      ),
    [cityInput]
  );

  useEffectSkipping(
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
                  time,
                })()
              ).subscribe((x) =>
                pipe(x, E.fold(constVoid, flow(O.some, setWeatherO)))
              )
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
      <div>
        <DatePicker
          className={styles.datePicker}
          defaultValue={moment(props.day.toRFC2822(), "DD-MMM-YYYY")}
          onChange={(e) => {
            if (e) setDay(DateTime.fromJSDate(e.toDate()));
          }}
        />
      </div>
      <div>
        <TimePicker
          className={styles.timePicker}
          value={O.toNullable(timeO)}
          onChange={flow(O.fromNullable, setTimeO)}
        />
      </div>
      <div>
        <Input
          className={styles.message}
          name="message"
          placeholder="Write some message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      <div>
        <AutoComplete
          className={styles.searchCity}
          placeholder="Search city"
          onChange={(e) => cityInput$.next(e)}
          onSelect={(e) => setCity(e)}
          options={A.array.map(cityOptions, (x) => ({ label: x, value: x }))}
        />
      </div>
      <div>
        {pipe(
          weatherO,
          O.fold(
            () => <div>The weather is...</div>,
            ({ weather }) => (
              <div>
                <div>Weather</div>
                <div>
                  {JSON.stringify(
                    weather[0].description.charAt(0).toUpperCase() +
                      weather[0].description.slice(1)
                  )}
                </div>
              </div>
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
      <Button
        disabled={pipe(
          { timeO },
          AP.sequenceS(O.option),
          O.isSome,
          not(identity)
        )}
        onClick={() => props.saveReminder(updatedData(), props.id)}
      >
        Save
      </Button>
      <Button onClick={() => props.deleteReminder(props.id)}>Delete</Button>
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
  datePicker: css`
    border: none;
    text-align: center;
    outline: none;
    width: 100%;
  `,
  timePicker: css`
    border: none;
    width: 100%;
  `,
  message: css`
    width: 100%;
  `,
  searchCity: css`
    width: 100%;
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
