import { css } from "emotion";
import * as A from "fp-ts/lib/Array";
import * as ORD from "fp-ts/lib/Ord";
import { pipe } from "fp-ts/lib/pipeable";
import { DateTime } from "luxon";
import React from "react";
import { Reminder } from "./Calendar";
import { ReminderThumbnail } from "./ReminderThumbnail";
import { colors } from "./theme";

export interface Props {
  date: DateTime;
  active: boolean;
  addReminder: (day: DateTime, active: boolean) => void;
  selectReminder: (id: string) => void;
  reminders: [string, Reminder][];
}

export const Day = ({
  date,
  active,
  addReminder,
  selectReminder,
  reminders,
}: Props) => {
  const weekday = date.weekday;
  const isWeekend = weekday === 6 || weekday === 7;

  return (
    <div
      className={styles.component({ isWeekend })}
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        return addReminder(date, active);
      }}
    >
      <div className={styles.day({ active, isWeekend })}>{date.day}</div>
      <ul className={styles.reminders}>
        {active &&
          pipe(
            reminders,
            A.sort(
              ORD.ord.contramap(ORD.ordString, ([, r]: [string, Reminder]) =>
                r.time.format("LT")
              )
            ),
            A.map(([id, reminder]) => (
              <ReminderThumbnail
                message={reminder.message}
                color={reminder.color}
                selectReminder={selectReminder}
                id={id}
                time={reminder.time}
              />
            ))
          )}
      </ul>
    </div>
  );
};

const styles = {
  component: ({ isWeekend }: { isWeekend: boolean }) => css`
    padding: 0.25rem;
    font-weight: bold;
    user-select: none;
    background-color: ${isWeekend ? colors.inactiveLight : "white"};
  `,
  day: ({ active, isWeekend }: { isWeekend: boolean; active: boolean }) => css`
    text-align: left;
    color: ${active
      ? isWeekend
        ? colors.highlight
        : colors.active
      : colors.inactive};
  `,
  reminders: css`
    padding-bottom: 0px;
    padding-left: 0px;
    display: grid;
    grid-gap: 0.1rem;
    grid-template-columns: repeat(auto-fit, 1.1rem);
  `,
};
