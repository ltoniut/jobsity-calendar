import { css } from "emotion";
import React from "react";
import { Tooltip } from "antd";
import { Moment } from "moment";

export interface Props {
  [x: string]: any;
  id: string;
  color: string;
  message: string;
  time: Moment;
  selectReminder: (id: string) => void;
}

export const ReminderThumbnail = ({
  color,
  id,
  message,
  time,
  selectReminder,
}: Props) => {
  return (
    <Tooltip title={time.format("LT") + ": " + message} placement="bottom">
      <div
        className={styles.component({ color })}
        onClick={(e) => {
          selectReminder(id);
          e.stopPropagation();
        }}
      />
    </Tooltip>
  );
};

const styles = {
  component: ({ color }: { color: string }) => css`
    width: 1rem;
    height: 1rem;
    background-color: ${color};
    border-style: solid;
    border-width: thin;
    float: left;
  `,
};
