import { css } from "emotion";
import * as A from "fp-ts/lib/Array";
import { flow, pipe } from "fp-ts/lib/function";
import { DateTime, Info, Interval } from "luxon";
import React, { useState } from "react";
import { Day } from "./Day";
import { colors } from "./theme";

import { Props as ReminderProps, Reminder } from "./ReminderDetails";
const weekdays = Info.weekdays();

interface Props {
  date: DateTime;
}

export const Calendar = ({ date }: Props) => {
  const reminders: Array<ReminderProps> = [];
  const [reminderData, setReminderData] = useState<ReminderProps>();
  const [displayReminder, setDisplayReminder] = useState<boolean>();
  const [curId, setCurId] = useState<number>(1);

  const weekOffset = 1;
  const rightWeekOffset = pipe(weekdays, A.takeRight(weekOffset));
  const remainingWeekdays = pipe(weekdays, A.dropRight(weekOffset));
  const offsetWeekdays = [...rightWeekOffset, ...remainingWeekdays];

  const addReminder = (
    day: DateTime,
    active: boolean,
    positionX: number,
    positionY: number
  ) => {
    if (active) {
      const newReminder = {
        color: "white",
        day: day,
        time: "00:00",
        city: "",
        message: "",
        id: curId,
        positionX: positionX,
        positionY: positionY,
      };
      setCurId(curId + 1);
      reminders.push(newReminder);
      openReminder(curId);
    }
  };

  const openReminder = (id: number) => {
    console.log(reminders);
    setReminderData(reminders.find((r) => r.id === id));
    console.log();
    setDisplayReminder(true);
  };

  const monthInterval = Interval.fromDateTimes(
    date.startOf("month"),
    date.endOf("month")
  );
  const interval = Interval.fromDateTimes(
    monthInterval.start.startOf("week").minus({ day: weekOffset }),
    monthInterval.end.endOf("week").minus({ day: weekOffset })
  );
  const dayIntervals = interval.splitBy({ day: 1 });

  return (
    <div className={styles.component}>
      <header>
        <div className={styles.month}>{date.monthLong.toUpperCase()}</div>
        <div className={styles.weekdays}>
          {A.array.map(offsetWeekdays, (day) => (
            <div key={day}>{day}</div>
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
                addReminder$={addReminder}
                possibleReminders={reminders}
              />
            )
          )
        )}
      </section>
      {displayReminder && <Reminder {...(reminderData as ReminderProps)} />}
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
