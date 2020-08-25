import { AutoComplete, DatePicker, Input, TimePicker, Modal } from "antd";
import { css, cx } from "emotion";
import * as AP from "fp-ts/lib/Apply";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import { constVoid, flow, pipe } from "fp-ts/lib/function";
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
import { Reminder } from "./Calendar";

export interface Props {
  id: string;
  env: Env;
  color: string;
  day: DateTime;
  time: O.Option<Moment>;
  city: string;
  message: string;
  saveReminder: (props: Reminder, id: string) => void;
  deleteReminder: (id: string) => void;
}

export const ReminderDetails = (props: Props) => {
  const [cityOptions, setCityOptions] = useState<Array<string>>(() => []);
  const [day, setDay] = useState<DateTime>(props.day);
  const [timeO, setTimeO] = useState<O.Option<Moment>>(() => props.time);
  const [city, setCity] = useState(props.city);
  const [color, setColor] = useState<string>(props.color);
  const [message, setMessage] = useState<string>(props.message);
  const [weatherO, setWeatherO] = useState<O.Option<string>>(O.none);

  const updatedData: () => Reminder = () => ({
    id: props.id,
    color: color,
    env: props.env,
    day: day,
    time: pipe(
      timeO,
      O.fold(
        () => moment(),
        (a) => a
      )
    ),
    city: city,
    message: message,
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
              A.map((p) =>
                p.properties.name
                  ? p.properties.name + ", " + p.properties.country
                  : ""
              ),
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
                pipe(
                  x,
                  E.fold(
                    constVoid,
                    flow(
                      (x) => x.weather,
                      A.head,
                      O.map((x) => x.description),
                      setWeatherO
                    )
                  )
                )
              )
            )
        )
      ),
    [city, timeO]
  );

  return (
    <Modal
      title={message || "New Reminder"}
      visible={true}
      onOk={() => props.saveReminder(updatedData(), props.id)}
      onCancel={() => props.deleteReminder(props.id)}
      cancelText="Delete"
    >
      <div className={styles.container}>
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
            maxLength={30}
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
              (weather) => <div>{`The weather is ${weather}`}</div>
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
      </div>
    </Modal>
  );
};

const styles = {
  container: css`
    > * {
      margin-bottom: 1rem;
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
    grid-gap: 0.5rem;
    grid-template-columns: repeat(auto-fit, 2rem);
  `,
  selectedColor: css`
    border: 3px #4fc3f7 solid;
  `,
  color: (color: string) => css`
    background-color: ${color};
    width: 2rem;
    height: 2rem;
    float: left;
    border-style: solid;
    border-color: #4fc3f7;
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
