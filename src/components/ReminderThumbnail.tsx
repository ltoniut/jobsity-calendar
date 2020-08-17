import { css } from "emotion";
import React from "react";
import { Tooltip } from "antd";

export interface Props {
  [x: string]: any;
  id: number;
  color: string;
  message: string;
  selectReminder: (id: number) => void;
}

export const ReminderThumbnail = ({
  color,
  id,
  message,
  selectReminder,
}: Props) => {
  return (
    <Tooltip title={message} placement="bottom">
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
    width: 0.5rem;
    height: 0.5rem;
    background-color: ${color};
    border-style: solid;
    border-width: thin;
    float: left;
  `,
};
