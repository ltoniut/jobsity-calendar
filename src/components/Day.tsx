import { css } from "emotion";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/pipeable";
import { DateTime } from "luxon";
import React, { FC, useState, useEffect } from "react";
import {
  Props as ThumbnailProps,
  ReminderThumbnail,
} from "./ReminderThumbnail";
import { Props as ReminderProps } from "./ReminderDetails";
import { colors } from "./theme";
import { getOffset } from "../helpers/functions/getOffset";

export interface Props {
  date: DateTime;
  active: boolean;
  addReminder$: (
    day: DateTime,
    active: boolean,
    positionX: number,
    positionY: number
  ) => void;
  possibleReminders: Array<ReminderProps>;
}

export const Day: FC<Props> = ({
  date,
  active,
  addReminder$,
  possibleReminders,
}) => {
  const [reminders, setReminders] = useState<Array<ReminderProps>>([]);

  useEffect(() => {
    setReminders([]);
    possibleReminders.forEach((r) => {
      console.log(r.day.day + "  " + date.day);
      if (r.day.day === date.day) {
        reminders.push(r);
      }
    });
  }, [possibleReminders]);

  const weekday = date.weekday;
  const isWeekend = weekday === 6 || weekday === 7;

  return (
    <div
      className={styles.component({ isWeekend })}
      onClick={(e) =>
        addReminder$(
          date,
          active,
          getOffset(e.target as HTMLElement).right,
          getOffset(e.target as HTMLElement).top
        )
      }
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
  reminders: css`
    padding-bottom: 0px;
  `,
};
