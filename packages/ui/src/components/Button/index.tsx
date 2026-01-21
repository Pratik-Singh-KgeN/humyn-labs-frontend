import {
  Button as ShadcnButton,
  ButtonProps as ShadcnButtonProps,
} from "../ui/button";
import { cn } from "../../lib/utils";

import styles from "./Button.module.scss";

export type ButtonProps = ShadcnButtonProps;

export default function Button({ className, ...props }: ButtonProps) {
  return (
    <ShadcnButton
      className={cn(styles["button-animated"], className)}
      {...props}
    >
      {props.children}
    </ShadcnButton>
  );
}
