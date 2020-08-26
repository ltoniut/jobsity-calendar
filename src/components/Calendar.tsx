import { css } from "emotion";
import * as A from "fp-ts/lib/Array";
import { flow, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as R from "fp-ts/lib/Record";
import { DateTime, Info, Interval } from "luxon";
import React, { useState } from "react";

import { Env } from "../env";
import { Day } from "./Day";
import { ReminderDetails } from "./ReminderDetails";
import { colors } from "./theme";
import { Moment } from "moment";
import moment from "moment";

const weekdays = Info.weekdays();

export interface Reminder {
  env: Env;
  color: string;
  day: DateTime;
  time: Moment;
  city: string;
  message: string;
}

interface Props {
  date: DateTime;
  env: Env;
}

const getIdentifier: (r: Reminder) => string = (r) =>
  `${r.day.toISO()}#${r.time.format("LT")}#${r.message}#${r.color}#${r.city}`;

export const Calendar = ({ date, env }: Props) => {
  const [reminderRecord, setReminderRecord] = useState<
    Record<string, Reminder>
  >({});

  const [reminderData, setReminderData] = useState<Reminder>();
  const [displayReminder, setDisplayReminder] = useState<boolean>();
  const weekOffset = 1;
  const rightWeekOffset = pipe(weekdays, A.takeRight(weekOffset));
  const remainingWeekdays = pipe(weekdays, A.dropRight(weekOffset));
  const offsetWeekdays = [...rightWeekOffset, ...remainingWeekdays];

  const monthInterval = Interval.fromDateTimes(
    date.startOf("month"),
    date.endOf("month")
  );
  const interval = Interval.fromDateTimes(
    monthInterval.start.startOf("week").minus({ day: weekOffset }),
    monthInterval.end.endOf("week").minus({ day: weekOffset })
  );
  const dayIntervals = interval.splitBy({ day: 1 });

  const deleteReminder = (id: string) => {
    setReminderRecord(R.deleteAt(id)(reminderRecord));
    setDisplayReminder(false);
  };

  const saveReminder = (newReminder: Reminder, id: string) => {
    const newId = getIdentifier(newReminder);
    setReminderRecord(
      R.insertAt(newId, newReminder)(R.deleteAt(id)(reminderRecord))
    );
    setDisplayReminder(false);
  };

  return (
    <div className={styles.component}>
      <header>
        <div className={styles.month}>{date.monthLong.toUpperCase()}</div>
        <div className={styles.weekdays}>
          {A.array.map(offsetWeekdays, (day) => (
            <div id={day}>{day}</div>
          ))}
        </div>
      </header>
      <section className={styles.days}>
        {A.array.map(
          dayIntervals,
          flow(
            (i) => i.start,
            (d) => (
              <Day
                key={d.toMillis()}
                date={d}
                active={monthInterval.contains(d)}
                selectReminder={(key) => {
                  setReminderData(
                    R.toArray(reminderRecord).filter((r) => r[0] === key)[0][1]
                  );
                  if (reminderData) {
                    setDisplayReminder(true);
                  }
                }}
                addReminder={(day: DateTime, active: boolean) => {
                  if (active) {
                    const newReminder: Reminder = {
                      color: "white",
                      day: day,
                      time: moment(day).startOf("day"),
                      city: "",
                      message: "",
                      env: env,
                    };
                    setReminderData(newReminder);
                    setDisplayReminder(true);
                  }
                }}
                reminders={R.toArray(reminderRecord).filter(
                  (r) => r[1].day.day === d.day
                )}
              />
            )
          )
        )}
      </section>
      {displayReminder && reminderData && (
        <ReminderDetails
          {...reminderData}
          timeO={O.fromNullable(reminderData.time)}
          cityO={O.fromNullable(reminderData.city)}
          messageO={
            reminderData.message ? O.fromNullable(reminderData.message) : O.none
          }
          id={getIdentifier(reminderData)}
          deleteReminder={deleteReminder}
          saveReminder={saveReminder}
        />
      )}
    </div>
  );
};

const styles = {
  component: css`
    border: 1px solid grey;
    > header {
      font-weight: bold;
    }
  `,
  month: css`
    background-color: ${colors.highlight};
    color: white;
    padding: 0.25rem;
    text-align: center;
  `,
  weekdays: css`
    background-color: ${colors.highlight};
    color: white;
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    padding: 0.25rem;
    text-align: center;
  `,
  days: css`
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    > * {
      height: 4rem;
      border-top: 1px solid grey;
      border-left: 1px solid grey;
    }
  `,
};
