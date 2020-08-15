import { css } from "emotion";
import React from "react";

export interface Props {
  id: number;
  color: string;
  message: string;
}

export const ReminderThumbnail = ({ color, id, message }: Props) => (
  <div className={styles.component({ color })} />
);

const styles = {
  component: ({ color }: { color: string }) => css`
    width: 100%;
    height: 20%;
    background-color: ${color};
    border-style: solid;
    border-width: thick;
  `,
};
