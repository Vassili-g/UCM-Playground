import * as React from "react";

export type TileLinkVariant = "info" | "success";

export interface TileLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "color"> {
  variant?: TileLinkVariant;
  chessName?: string;
  href: string;
}

const tk = (ref: string) => `var(--${ref.slice(1, -1).replace(/\./g, "-")})`;

const WIDTH = tk("{components.tilelink.sizes.width}");
const HEIGHT = tk("{components.tilelink.sizes.height}");
const ICON_SIZE = tk("{components.tilelink.sizes.icon}");

type TileLinkState = "default" | "hover";

interface VariantEntry {
  variant: TileLinkVariant;
  state: TileLinkState;
  tokens: { background: string; foreground: string };
}

// Transcription littérale de `variants[]` du contrat.
const VARIANTS: VariantEntry[] = [
  { variant: "info", state: "default", tokens: { background: "{components.tilelink.colors.info.default.background}", foreground: "{components.tilelink.colors.info.default.foreground}" } },
  { variant: "info", state: "hover", tokens: { background: "{components.tilelink.colors.info.hover.background}", foreground: "{components.tilelink.colors.info.hover.foreground}" } },
  { variant: "success", state: "default", tokens: { background: "{components.tilelink.colors.success.default.background}", foreground: "{components.tilelink.colors.success.default.foreground}" } },
  { variant: "success", state: "hover", tokens: { background: "{components.tilelink.colors.success.hover.background}", foreground: "{components.tilelink.colors.success.hover.foreground}" } },
];

// Ordre du moins prioritaire au plus prioritaire, inverse de
// `stateModel.precedence` ["hover","default"].
const STATE_ORDER: TileLinkState[] = ["default", "hover"];
const STATE_SELECTORS: Record<TileLinkState, string> = { default: "", hover: ":hover" };

function buildStyleSheet(): string {
  const rules: string[] = [];
  for (const state of STATE_ORDER) {
    for (const entry of VARIANTS.filter((v) => v.state === state)) {
      const sel = `.ucm-tilelink[data-variant="${entry.variant}"]${STATE_SELECTORS[state]}`;
      rules.push(
        `${sel} { background-color: ${tk(entry.tokens.background)}; color: ${tk(entry.tokens.foreground)}; fill: ${tk(entry.tokens.foreground)}; }`
      );
    }
  }
  return rules.join("\n");
}

const STYLE_SHEET = buildStyleSheet();

export function TileLink({ variant = "info", chessName, className, ...rest }: TileLinkProps) {
  return (
    <a
      data-variant={variant}
      className={["ucm-tilelink", className].filter(Boolean).join(" ")}
      style={{
        display: "inline-flex",
        flexDirection: "row",
        width: WIDTH,
        height: HEIGHT,
        justifyContent: "center",
        alignItems: "center",
        textDecoration: "none",
      }}
      {...rest}
    >
      <style>{STYLE_SHEET}</style>
      <span
        aria-hidden="true"
        data-icon={chessName ?? "chess"}
        style={{ width: ICON_SIZE, height: ICON_SIZE, display: "inline-block", color: "inherit", fill: "currentColor" }}
      />
    </a>
  );
}

export default TileLink;
