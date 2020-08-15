import { css } from "emotion";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/pipeable";
import { DateTime } from "luxon";
import React, { FC, useState } from "react";
import { Props as ReminderProps, ReminderThumbnail } from "./ReminderThumbnail";
import { colors } from "./theme";

export interface Props {
  date: DateTime;
  active: boolean;
}

export const Day: FC<Props> = ({ date, active }) => {
  const [reminders] = useState<Array<ReminderProps>>([]);
  const [displayReminder, setDisplayReminder] = useState<boolean>(false);

  const weekday = date.weekday;
  const isWeekend = weekday === 6 || weekday === 7;

  return (
    <div
      className={styles.component({ isWeekend })}
      onClick={() => {
        if (active) {
          setDisplayReminder(true);
        }
      }}
    >
      <div className={styles.day({ active, isWeekend })}>{date.day}</div>
      <ul>
        {pipe(
          reminders,
          A.map((r) => <ReminderThumbnail {...r} />)
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
};
