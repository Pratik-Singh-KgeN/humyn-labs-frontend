import { HTMLAttributes } from "react";

type ButtonProps = HTMLAttributes<HTMLButtonElement>;

export const Button = (props: ButtonProps) => {
  return <button {...props}>{props.children}</button>;
};
