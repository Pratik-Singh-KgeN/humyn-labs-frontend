import { HTMLAttributes } from "react";

type ButtonProps = HTMLAttributes<HTMLButtonElement>;

export default function Button(props: ButtonProps) {
  return <button {...props}>{props.children}</button>;
}
