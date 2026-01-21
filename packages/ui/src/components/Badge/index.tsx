import {
  Badge as ShadcnBadge,
  BadgeProps as ShadcnBadgeProps,
} from "../ui/badge";

export type BadgeProps = ShadcnBadgeProps;

export default function Badge(props: BadgeProps) {
  return <ShadcnBadge {...props}>{props.children}</ShadcnBadge>;
}
