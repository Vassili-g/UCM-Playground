import {
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";

import type {
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from "../../generated/contracts/Button.ts";
import { tokenVar } from "../../tokens.ts";
import { ContractIcon } from "../ContractIcon.tsx";

export type { ButtonColor, ButtonSize, ButtonVariant };

export type ButtonIconName = string;

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color"> {
  color?: ButtonColor;
  variant?: ButtonVariant;
  disabled?: boolean;
  label?: boolean;
  iconRight?: boolean;
  iconLeft?: boolean;
  size?: ButtonSize;
  iconLeftName?: ButtonIconName | null;
  iconRightName?: ButtonIconName | null;
  children?: ReactNode;
}

type ButtonState = "default" | "hover" | "focus" | "press" | "disable";

interface SizeTokens {
  gap: string;
  paddingX: string;
  paddingY: string;
  radius: string;
  fontSize: string;
}

const SIZE_TOKENS: Record<ButtonSize, SizeTokens> = {
  medium: {
    gap: "{components.button.sizes.medium.gap}",
    paddingX: "{components.button.sizes.medium.padding-x}",
    paddingY: "{components.button.sizes.medium.padding-y}",
    radius: "{components.button.sizes.medium.border-radius}",
    fontSize: "{components.button.sizes.medium.label-size}",
  },
  big: {
    gap: "{components.button.sizes.big.gap}",
    paddingX: "{components.button.sizes.big.padding-x}",
    paddingY: "{components.button.sizes.big.padding-y}",
    radius: "{components.button.sizes.big.border-radius}",
    fontSize: "{components.button.sizes.big.label-size}",
  },
  small: {
    gap: "{components.button.sizes.small.gap}",
    paddingX: "{components.button.sizes.small.padding-x}",
    paddingY: "{components.button.sizes.small.padding-y}",
    radius: "{components.button.sizes.small.border-radius}",
    fontSize: "{components.button.sizes.small.label-size}",
  },
};

const ICON_SIZE = "{components.icons.sizes.base}";
const FONT_WEIGHT = "{layouts.fontweight.600}";
const LINE_HEIGHT = "{layouts.lineheight.base}";
const FONT_FAMILY = "{layouts.fontfamily.base}";
const OUTLINE_WIDTH = "{layouts.stroke.outline}";
const RING_WIDTH = "{layouts.stroke.ring}";

function colorToken(
  color: ButtonColor,
  variant: ButtonVariant,
  state: ButtonState,
  role: "background" | "foreground" | "border" | "ring",
): string {
  return `{components.button.colors.${color}.${variant}.${state}.${role}}`;
}

function buttonVisualStyle(
  color: ButtonColor,
  variant: ButtonVariant,
  state: ButtonState,
  size: ButtonSize,
): CSSProperties {
  const dimensions = SIZE_TOKENS[size];
  const hasBackground =
    variant !== "text" ||
    state === "hover" ||
    state === "focus" ||
    state === "press";
  const hasBorder = variant === "outlined";
  const hasRing = state === "focus" || state === "press";

  return {
    appearance: "none",
    background: hasBackground
      ? tokenVar(colorToken(color, variant, state, "background"))
      : "none",
    borderColor: hasBorder
      ? tokenVar(colorToken(color, variant, state, "border"))
      : undefined,
    borderStyle: hasBorder ? "solid" : "none",
    borderWidth: hasBorder ? tokenVar(OUTLINE_WIDTH) : undefined,
    borderRadius: tokenVar(dimensions.radius),
    boxShadow: hasRing
      ? `0 0 0 ${tokenVar(RING_WIDTH)} ${tokenVar(
          colorToken(color, variant, state, "ring"),
        )}`
      : "none",
    boxSizing: "border-box",
    color: tokenVar(colorToken(color, variant, state, "foreground")),
    display: "inline-flex",
    flexDirection: "row",
    fontFamily: tokenVar(FONT_FAMILY),
    fontSize: tokenVar(dimensions.fontSize),
    fontWeight: tokenVar(FONT_WEIGHT),
    gap: tokenVar(dimensions.gap),
    lineHeight: tokenVar(LINE_HEIGHT),
    outline: "none",
    paddingBlock: tokenVar(dimensions.paddingY),
    paddingInline: tokenVar(dimensions.paddingX),
  };
}

export function Button({
  color = "primary",
  variant = "contained",
  disabled = false,
  label = true,
  iconRight = true,
  iconLeft = true,
  size = "medium",
  iconLeftName = null,
  iconRightName = null,
  children,
  onBlur,
  onFocus,
  onKeyDown,
  onKeyUp,
  onPointerCancel,
  onPointerDown,
  onPointerEnter,
  onPointerLeave,
  onPointerUp,
  style,
  type = "button",
  ...nativeProps
}: ButtonProps) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pressed, setPressed] = useState(false);

  const state: ButtonState = disabled
    ? "disable"
    : pressed
      ? "press"
      : focused
        ? "focus"
        : hovered
          ? "hover"
          : "default";

  function handlePointerEnter(event: PointerEvent<HTMLButtonElement>) {
    setHovered(true);
    onPointerEnter?.(event);
  }

  function handlePointerLeave(event: PointerEvent<HTMLButtonElement>) {
    setHovered(false);
    setPressed(false);
    onPointerLeave?.(event);
  }

  function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
    if (!disabled) {
      setPressed(true);
    }
    onPointerDown?.(event);
  }

  function handlePointerUp(event: PointerEvent<HTMLButtonElement>) {
    setPressed(false);
    onPointerUp?.(event);
  }

  function handlePointerCancel(event: PointerEvent<HTMLButtonElement>) {
    setPressed(false);
    onPointerCancel?.(event);
  }

  function handleFocus(event: React.FocusEvent<HTMLButtonElement>) {
    setFocused(event.currentTarget.matches(":focus-visible"));
    onFocus?.(event);
  }

  function handleBlur(event: React.FocusEvent<HTMLButtonElement>) {
    setFocused(false);
    setPressed(false);
    onBlur?.(event);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    setFocused(event.currentTarget.matches(":focus-visible"));
    if (!disabled && (event.key === " " || event.key === "Enter")) {
      setPressed(true);
    }
    onKeyDown?.(event);
  }

  function handleKeyUp(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === " " || event.key === "Enter") {
      setPressed(false);
    }
    onKeyUp?.(event);
  }

  return (
    <button
      {...nativeProps}
      data-ucm-state={state}
      disabled={disabled}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onPointerCancel={handlePointerCancel}
      onPointerDown={handlePointerDown}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerUp={handlePointerUp}
      style={{
        ...style,
        ...buttonVisualStyle(color, variant, state, size),
      }}
      type={type}
    >
      {iconLeft ? (
        <ContractIcon
          name={iconLeftName ?? "arrow-left-long"}
          sizeToken={ICON_SIZE}
        />
      ) : null}
      {label ? <span>{children}</span> : null}
      {iconRight ? (
        <ContractIcon
          name={iconRightName ?? "arrow-right-long"}
          sizeToken={ICON_SIZE}
        />
      ) : null}
    </button>
  );
}
