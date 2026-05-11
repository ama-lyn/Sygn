import * as React from "react";
import Link from "next/link";

type CommonProps = {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md";
  className?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

type ButtonAsButton = CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
  };

type ButtonAsLink = React.PropsWithChildren<
  CommonProps & {
    href: string;
  } & Omit<React.ComponentProps<typeof Link>, "href" | "className">
>;

export type ButtonProps = ButtonAsButton | ButtonAsLink;

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

function classes(variant: NonNullable<CommonProps["variant"]>, size: NonNullable<CommonProps["size"]>) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-50 disabled:pointer-events-none";
  const sz = size === "sm" ? "h-9 px-4 text-sm" : "h-11 px-5 text-sm";
  const v =
    variant === "primary"
      ? "bg-orange-500 text-white hover:bg-orange-600"
      : variant === "secondary"
        ? "bg-zinc-900 text-white hover:bg-zinc-800"
        : variant === "outline"
          ? "border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50"
          : "text-zinc-900 hover:bg-zinc-50";
  return cx(base, sz, v);
}

export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    className,
    leftIcon,
    rightIcon,
    ...rest
  } = props as ButtonProps & Record<string, unknown>;

  const cls = cx(classes(variant, size), className);

  if ("href" in props && typeof props.href === "string") {
    const { href, children, ...linkProps } = props as ButtonAsLink & {
      children?: React.ReactNode;
    };
    return (
      <Link href={href} className={cls} {...linkProps}>
        {leftIcon}
        {children}
        {rightIcon}
      </Link>
    );
  }

  const { children, ...buttonProps } = rest as ButtonAsButton & {
    children?: React.ReactNode;
  };
  return (
    <button className={cls} {...buttonProps}>
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
}

