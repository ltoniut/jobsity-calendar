import { css } from "emotion";
import React from "react";
import { Tooltip } from "@material-ui/core";

export interface Props {
  [x: string]: any;
  id: number;
  color: string;
  message: string;
}

export const ReminderThumbnail = ({ color, id, message }: Props) => (
  <Tooltip title={message} placement="bottom">
    <div className={styles.component({ color })} />
  </Tooltip>
);

const styles = {
  component: ({ color }: { color: string }) => css`
    width: 15%;
    height: 15%;
    background-color: ${color};
    border-style: solid;
    border-width: thick;
    padding-bottom: 0;
  `,
};
