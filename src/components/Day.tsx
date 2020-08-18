import { css } from "emotion";
import * as A from "fp-ts/lib/Array";
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
  const isEnding = 4 < weekday && weekday < 7;

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
            A.map((r) => (
              <ReminderThumbnail
                message={r[1].message}
                color={r[1].color}
                selectReminder={selectReminder}
                id={r[0]}
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
