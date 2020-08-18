import { css } from "emotion";
import React from "react";
import { Tooltip } from "antd";

export interface Props {
  [x: string]: any;
  id: string;
  color: string;
  message: string;
  selectReminder: (id: string) => void;
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
    width: 1rem;
    height: 1rem;
    background-color: ${color};
    border-style: solid;
    border-width: thin;
    float: left;
  `,
};
