import { css } from "emotion";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/pipeable";
import { DateTime } from "luxon";
import React from "react";
import { Props as ReminderProps } from "./ReminderDetails";
import { ReminderThumbnail } from "./ReminderThumbnail";
import { colors } from "./theme";

export const getOffset = (rect: DOMRect) => ({
  left: rect.left + window.scrollX,
  top: rect.top + window.scrollY,
  right: rect.right + window.scrollX,
  bottom: rect.bottom + window.scrollY,
});

export interface Props {
  date: DateTime;
  active: boolean;
  addReminder: (
    day: DateTime,
    active: boolean,
    positionX: number,
    positionY: number
  ) => void;
  selectReminder: (id: number) => void;
  reminders: Array<ReminderProps>;
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
      onClick={(e) =>
        addReminder(
          date,
          active,
          getOffset(e.currentTarget.getBoundingClientRect()).right,
          getOffset(e.currentTarget.getBoundingClientRect()).top
        )
      }
    >
      <div className={styles.day({ active, isWeekend })}>{date.day}</div>
      <ul className={styles.reminders}>
        {active &&
          pipe(
            reminders,
            A.map((r) => (
              <ReminderThumbnail
                message={r.message}
                color={r.color}
                selectReminder={selectReminder}
                id={r.id}
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
  `,
};
