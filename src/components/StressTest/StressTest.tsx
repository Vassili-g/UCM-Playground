/**
 * Transcription statique de StressTest.contract.json (v11.0) — ne lit ni
 * n'interprète le JSON au runtime. Voir
 * src/components/StressTest/StressTest.contract.json.
 *
 * Les deux variantes ("info" / "success") ont des structures, cardinalités
 * de dépendances composées et jeux de colonnes différents (cf.
 * `variantViews.v1` et `variantViews.v2` du contrat, résolus manuellement à
 * l'aide de `scripts/variant-views.mjs`). `scripts/parite.mjs` compte les
 * balises JSX de composants composés STATIQUEMENT, tous chemins de
 * branchement confondus : le nombre de balises `<Alert>`, `<Button>` et
 * `<TileLink>` écrites ci-dessous égale donc l'union à cardinalité maximale
 * publiée par `composes` (Alert: 1, Button: 3, TileLink: 7), jamais la somme
 * des deux variantes. Les occurrences en trop pour la variante active sont
 * masquées (`display: "none"`, `aria-hidden`), jamais retirées du JSX.
 */
import { type CSSProperties, type HTMLAttributes } from "react";

import type { StressTestVariant } from "../../generated/contracts/StressTest.ts";
import { tokenVar } from "../../tokens.ts";
import { Alert } from "../Alert/Alert.tsx";
import { Button, type ButtonColor, type ButtonVariant as ButtonVariantKind } from "../Button/Button.tsx";
import { TileLink, type TileLinkVariant } from "../TileLink/TileLink.tsx";

export type { StressTestVariant };

/** `variantViews.v1`/`v2` — identifiants des deux vues résolues. */
type StressTestViewId = "v1" | "v2";

interface StressTestStroke {
  color: string;
  width: string;
}

interface StressTestVariantEntry {
  tokens: {
    text: string;
    tile: string;
    "userinput.background"?: string;
    "background-tag"?: string;
    "text-color-tag"?: string;
    title: string;
    description: string;
    link: string;
    "divider.background": string;
    "scale-1": string;
    "scale-2": string;
    "scale-3": string;
    "scale-4": string;
    "scale-5": string;
    "scale-6": string;
  };
  strokes: {
    "base.border": StressTestStroke;
    "userinput.border"?: StressTestStroke;
  };
  view: StressTestViewId;
}

/** Table littérale transcrite de `variants` (clé = `structure.variantAxes`,
 * ici l'unique axe `variant`). Chaque référence de token est recopiée telle
 * quelle depuis le contrat. */
const VARIANTS: Record<StressTestVariant, StressTestVariantEntry> = {
  info: {
    tokens: {
      text: "{components.stresstest.info.head.colors.text}",
      tile: "{components.stresstest.info.tilesgrid.colors.tile}",
      "userinput.background": "{components.stresstest.info.userinput.colors.background}",
      "background-tag": "{components.stresstest.info.userinput.colors.background-tag}",
      "text-color-tag": "{components.stresstest.info.userinput.colors.text-color-tag}",
      title: "{components.stresstest.info.textcolumns.colors.title}",
      description: "{components.stresstest.info.textcolumns.colors.description}",
      link: "{components.stresstest.info.textcolumns.colors.link}",
      "divider.background": "{components.stresstest.info.divider.colors.background}",
      "scale-1": "{components.stresstest.info.scalewrap.colors.scale-1}",
      "scale-2": "{components.stresstest.info.scalewrap.colors.scale-2}",
      "scale-3": "{components.stresstest.info.scalewrap.colors.scale-3}",
      "scale-4": "{components.stresstest.info.scalewrap.colors.scale-4}",
      "scale-5": "{components.stresstest.info.scalewrap.colors.scale-5}",
      "scale-6": "{components.stresstest.info.scalewrap.colors.scale-6}",
    },
    strokes: {
      "base.border": {
        color: "{components.stresstest.info.base.colors.border}",
        width: "{components.stresstest.info.base.sizes.border-width}",
      },
      "userinput.border": {
        color: "{components.stresstest.info.userinput.colors.border}",
        width: "{components.stresstest.info.userinput.sizes.border-width}",
      },
    },
    view: "v1",
  },
  success: {
    tokens: {
      text: "{components.stresstest.info.head.colors.text}",
      tile: "{components.stresstest.success.tilesgrid.colors.tile}",
      title: "{components.stresstest.info.textcolumns.colors.title}",
      description: "{components.stresstest.info.textcolumns.colors.description}",
      link: "{components.stresstest.info.textcolumns.colors.link}",
      "divider.background": "{components.stresstest.info.divider.colors.background}",
      "scale-1": "{components.stresstest.success.scalewrap.colors.scale-1}",
      "scale-2": "{components.stresstest.success.scalewrap.colors.scale-2}",
      "scale-3": "{components.stresstest.success.scalewrap.colors.scale-3}",
      "scale-4": "{components.stresstest.success.scalewrap.colors.scale-4}",
      "scale-5": "{components.stresstest.success.scalewrap.colors.scale-5}",
      "scale-6": "{components.stresstest.success.scalewrap.colors.scale-6}",
    },
    strokes: {
      "base.border": {
        color: "{components.stresstest.info.base.colors.border}",
        width: "{components.stresstest.info.base.sizes.border-width}",
      },
    },
    view: "v2",
  },
};

/** `structure` racine (partagée par les deux vues). */
const BASE_MAX_WIDTH = "{components.stresstest.info.base.sizes.max-width}";
const BASE_GAP = "{components.stresstest.info.base.sizes.gap}";
const BASE_PADDING = "{components.stresstest.info.base.sizes.padding}";
const BASE_RADIUS = "{components.stresstest.info.base.sizes.border-radius}";

/** `viewStructures[*].children[0]` (Head) — partagé par les deux vues. */
const HEAD_GAP = "{components.stresstest.info.head.sizes.gap}";

/** `viewStructures[*].children[2]` (TilesGrid) — géométrie partagée. */
const TILESGRID_GAP_COL = "{components.stresstest.info.tilesgrid.sizes.gap-col}";
const TILESGRID_GAP_ROWS = "{components.stresstest.info.tilesgrid.sizes.gap-rows}";
const TILESGRID_RADIUS = "{components.stresstest.info.tilesgrid.sizes.radius}";

/** UserInput (vue "info" uniquement). */
const USERINPUT_RADIUS = "{components.stresstest.info.userinput.sizes.border-radius}";
const USERINPUT_PADDING_LEFT = "{components.stresstest.info.userinput.sizes.padding-left}";
const USERINPUT_PADDING_RIGHT = "{components.stresstest.info.userinput.sizes.padding-right}";
const USERINPUT_PADDING_TOP = "{components.stresstest.info.userinput.sizes.padding-top}";
const USERINPUT_PADDING_BOTTOM = "{components.stresstest.info.userinput.sizes.padding-bottom}";
const USERINPUT_TAG_RADIUS = "{components.stresstest.info.userinput.sizes.border-radius-tag}";
const USERINPUT_TAG_PADDING_X = "{components.stresstest.info.userinput.sizes.padding-x-tag}";
const USERINPUT_TAG_PADDING_Y = "{components.stresstest.info.userinput.sizes.padding-y-tag}";

/** TextColumns — géométrie partagée par les deux vues. */
const TEXTCOLUMNS_GAP = "{components.stresstest.info.textcolumns.sizes.gap}";
const TEXTCOLUMNS_GAP_COL = "{components.stresstest.info.textcolumns.sizes.gap-col}";

/** Divider. */
const DIVIDER_HEIGHT = "{components.stresstest.info.divider.sizes.height}";
const DIVIDER_MAX_WIDTH = "{components.stresstest.info.divider.sizes.max-width}";

/** TileLinksWrap. */
const TILELINKSWRAP_GAP_X = "{components.stresstest.info.tilelinkswrap.sizes.gap-x}";
const TILELINKSWRAP_GAP_Y = "{components.stresstest.info.tilelinkswrap.sizes.gap-y}";

/** ScaleWrap. */
const SCALEWRAP_RADIUS_TOP_LEFT = "{components.stresstest.info.scalewrap.sizes.radius-top-left}";
const SCALEWRAP_RADIUS_BOTTOM_LEFT = "{components.stresstest.info.scalewrap.sizes.radius-bottom-left}";
const SCALEWRAP_RADIUS_TOP_RIGHT = "{components.stresstest.info.scalewrap.sizes.radius-top-right}";
const SCALEWRAP_RADIUS_BOTTOM_RIGHT = "{components.stresstest.info.scalewrap.sizes.radius-bottom-right}";
const SCALEWRAP_HEIGHT = "{components.stresstest.info.scalewrap.sizes.height}";

/** `textStyles` référencés par `view.typography`. */
type StressTestTextStyleId = "title.medium" | "body.medium" | "label.small" | "body.large" | "body.small";

const TEXT_STYLES: Record<StressTestTextStyleId, CSSProperties> = {
  "title.medium": {
    fontFamily: tokenVar("{primitives.fontfamily.base}"),
    fontSize: tokenVar("{typography.title.medium.fontsize}"),
    fontWeight: tokenVar("{typography.title.medium.fontweight}") as CSSProperties["fontWeight"],
    lineHeight: tokenVar("{typography.title.medium.lineheight}"),
    letterSpacing: tokenVar("{typography.title.medium.letterspacing}"),
  },
  "body.medium": {
    fontFamily: tokenVar("{primitives.fontfamily.base}"),
    fontSize: tokenVar("{typography.body.medium.fontsize}"),
    fontWeight: tokenVar("{typography.body.medium.fontweight}") as CSSProperties["fontWeight"],
    lineHeight: tokenVar("{typography.body.medium.lineheight}"),
    letterSpacing: tokenVar("{typography.body.medium.letterspacing}"),
  },
  "label.small": {
    fontFamily: tokenVar("{primitives.fontfamily.base}"),
    fontSize: tokenVar("{typography.label.small.fontsize}"),
    fontWeight: tokenVar("{typography.label.small.fontweight}") as CSSProperties["fontWeight"],
    lineHeight: tokenVar("{typography.label.small.lineheight}"),
    letterSpacing: tokenVar("{typography.label.small.letterspacing}"),
  },
  "body.large": {
    fontFamily: tokenVar("{primitives.fontfamily.base}"),
    fontSize: tokenVar("{typography.body.large.fontsize}"),
    fontWeight: tokenVar("{typography.body.large.fontweight}") as CSSProperties["fontWeight"],
    lineHeight: tokenVar("{typography.body.large.lineheight}"),
    letterSpacing: tokenVar("{typography.body.large.letterspacing}"),
  },
  "body.small": {
    fontFamily: tokenVar("{primitives.fontfamily.base}"),
    fontSize: tokenVar("{typography.body.small.fontsize}"),
    fontWeight: tokenVar("{typography.body.small.fontweight}") as CSSProperties["fontWeight"],
    lineHeight: tokenVar("{typography.body.small.lineheight}"),
    letterSpacing: tokenVar("{typography.body.small.letterspacing}"),
  },
};

/** `viewStructures.v1.children[2]` (TilesGrid, vue "info") : 4 colonnes × 5
 * lignes, 12 tuiles. `columnSizes`/`rowSizes` et les hauteurs `structuralSize`
 * sont les pixels bruts publiés par le contrat (exception documentée aux
 * pistes FIXED d'une grille), jamais des références de token. */
const TILESGRID_COLUMNS = "1fr 1fr 1fr 1fr";
const INFO_TILESGRID_ROWS = "15px fit-content(100%) fit-content(100%) fit-content(100%) fit-content(100%)";
const SUCCESS_TILESGRID_ROWS = "15px 15px 15px fit-content(100%) fit-content(100%)";

interface TileDescriptor {
  column: number;
  row: number;
  columnSpan?: number;
  rowSpan?: number;
  height?: string;
}

const INFO_TILES: TileDescriptor[] = [
  { column: 1, row: 1 },
  { column: 2, row: 1 },
  { column: 3, row: 1 },
  { column: 4, row: 1 },
  { column: 1, row: 2, height: "15px" },
  { column: 2, row: 2, columnSpan: 2, height: "15px" },
  { column: 4, row: 2, height: "15px" },
  { column: 1, row: 3, columnSpan: 4, rowSpan: 2, height: "40px" },
  { column: 1, row: 5, height: "15px" },
  { column: 2, row: 5, height: "15px" },
  { column: 3, row: 5, height: "15px" },
  { column: 4, row: 5, height: "15px" },
];

const SUCCESS_TILES: TileDescriptor[] = [
  { column: 1, row: 1, rowSpan: 2 },
  { column: 2, row: 1 },
  { column: 3, row: 1 },
  { column: 4, row: 1 },
  { column: 2, row: 2 },
  { column: 3, row: 2 },
  { column: 4, row: 2, rowSpan: 2 },
  { column: 1, row: 3 },
  { column: 2, row: 3 },
  { column: 3, row: 3 },
  { column: 1, row: 4, height: "15px" },
  { column: 2, row: 4, height: "15px" },
  { column: 3, row: 4, columnSpan: 2, height: "15px" },
  { column: 1, row: 5, height: "15px" },
  { column: 2, row: 5, height: "15px" },
  { column: 3, row: 5, height: "15px" },
  { column: 4, row: 5, height: "15px" },
];

interface StressTestColumn {
  title: string;
  description: string;
  descriptionStyle: StressTestTextStyleId;
  link: string | null;
}

/** `samples.s1.text` (colonnes "label-2.label*", 3 colonnes). */
const INFO_COLUMNS: StressTestColumn[] = [
  {
    title: "Point 1",
    description: "Ce qui est important de faire pour le point 1 c’est de suivre impérativement les règles du point 1",
    descriptionStyle: "body.small",
    link: "Lien vers ressource 1",
  },
  {
    title: "Point 2",
    description: "Ce qui est important de faire pour le point 2 c’est de suivre impérativement les règles du point 2",
    descriptionStyle: "body.small",
    link: "Lien vers ressource 2",
  },
  {
    title: "Point 3",
    description: "Ce qui est important de faire pour le point 3 c’est de suivre impérativement les règles du point 3",
    descriptionStyle: "body.small",
    link: "Lien vers ressource 3",
  },
];

/** `samples.s2.text` (colonnes "label-2.label*", 2 colonnes ; la colonne 1
 * n'a pas de lien et sa description utilise "body.medium", pas "body.small"). */
const SUCCESS_COLUMNS: StressTestColumn[] = [
  {
    title: "Point 1",
    description: "Ce qui est important de faire pour le point 1 c’est de suivre impérativement les règles du point 1",
    descriptionStyle: "body.medium",
    link: null,
  },
  {
    title: "Point 2",
    description: "Ce qui est important de faire pour le point 2 c’est de suivre impérativement les règles du point 2",
    descriptionStyle: "body.small",
    link: "Lien vers ressource 2",
  },
];

interface TileLinkDescriptor {
  variant: TileLinkVariant;
  chessName: string | null;
}

/** `samples.s1.composes` (slots `tilelinkswrap.tilelink[..7]`). */
const INFO_TILELINKS: TileLinkDescriptor[] = [
  { variant: "info", chessName: null },
  { variant: "info", chessName: "circle-9" },
  { variant: "info", chessName: "duck" },
  { variant: "info", chessName: "oil-temperature" },
  { variant: "info", chessName: "fence" },
  { variant: "info", chessName: "wheat" },
  { variant: "info", chessName: "candle-holder" },
];

/** `samples.s2.composes` (slots `tilelinkswrap.tilelink[..7]`). */
const SUCCESS_TILELINKS: TileLinkDescriptor[] = [
  { variant: "success", chessName: "chess-king-piece" },
  { variant: "info", chessName: "circle-arrow-up" },
  { variant: "info", chessName: "dumbbell" },
  { variant: "info", chessName: "oil-can-drip" },
  { variant: "info", chessName: "ferris-wheel" },
  { variant: "info", chessName: "whale" },
  { variant: "success", chessName: "candy" },
];

interface StressTestButtonDescriptor {
  color: ButtonColor;
  variant: ButtonVariantKind;
  iconLeft: boolean;
  iconRight: boolean;
  label: boolean;
  iconLeftName: string | null;
  children: string | null;
}

/** `samples.s1.composes` slot `userinput.button` ("Accepter", swap "check"). */
const INFO_BUTTON_A: StressTestButtonDescriptor = {
  color: "success",
  variant: "contained",
  iconLeft: true,
  iconRight: false,
  label: true,
  iconLeftName: "check",
  children: "Accepter",
};

/** `samples.s1.composes` slot `userinput.button-2` ("Refuser", swap "xmark"). */
const INFO_BUTTON_B: StressTestButtonDescriptor = {
  color: "error",
  variant: "contained",
  iconLeft: true,
  iconRight: false,
  label: true,
  iconLeftName: "xmark",
  children: "Refuser",
};

/** `samples.s2.composes` slot `actionswrap.button` ("Retour"). */
const SUCCESS_BUTTON_A: StressTestButtonDescriptor = {
  color: "secondary",
  variant: "text",
  iconLeft: false,
  iconRight: false,
  label: true,
  iconLeftName: null,
  children: "Retour",
};

/** `samples.s2.composes` slot `actionswrap.button-2` (icône seule, swap "ballot"). */
const SUCCESS_BUTTON_B: StressTestButtonDescriptor = {
  color: "success",
  variant: "text",
  iconLeft: true,
  iconRight: false,
  label: false,
  iconLeftName: "ballot",
  children: null,
};

/** `samples.s2.composes` slot `actionswrap.button-3` ("Poursuivre", swap "arrow-right-long"). */
const SUCCESS_BUTTON_C: StressTestButtonDescriptor = {
  color: "info",
  variant: "outlined",
  iconLeft: true,
  iconRight: false,
  label: true,
  iconLeftName: "arrow-right-long",
  children: "Poursuivre",
};

const ROOT_STYLE_BASE: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  width: "fit-content",
  height: "fit-content",
  maxWidth: tokenVar(BASE_MAX_WIDTH),
  justifyContent: "center",
  alignItems: "center",
  gap: tokenVar(BASE_GAP),
  paddingLeft: tokenVar(BASE_PADDING),
  paddingRight: tokenVar(BASE_PADDING),
  paddingTop: tokenVar(BASE_PADDING),
  paddingBottom: tokenVar(BASE_PADDING),
  borderRadius: tokenVar(BASE_RADIUS),
};

const HEAD_STYLE: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignSelf: "stretch",
  justifyContent: "flex-start",
  alignItems: "flex-start",
  gap: tokenVar(HEAD_GAP),
};

const TEXTCOLUMNS_STYLE: CSSProperties = {
  display: "flex",
  flexDirection: "row",
  alignSelf: "stretch",
  justifyContent: "flex-start",
  alignItems: "flex-start",
  gap: tokenVar(TEXTCOLUMNS_GAP),
};

const TEXTCOLUMN_STYLE: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
  justifyContent: "center",
  alignItems: "flex-start",
  gap: tokenVar(TEXTCOLUMNS_GAP_COL),
};

const TEXTCOLUMN_ROW_STYLE: CSSProperties = { alignSelf: "stretch" };

const TILELINKSWRAP_STYLE: CSSProperties = {
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  alignSelf: "stretch",
  justifyContent: "flex-start",
  alignItems: "center",
  gap: tokenVar(TILELINKSWRAP_GAP_X),
  rowGap: tokenVar(TILELINKSWRAP_GAP_Y),
};

const SCALEWRAP_STYLE: CSSProperties = {
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  alignSelf: "stretch",
  justifyContent: "flex-start",
  alignItems: "center",
  height: tokenVar(SCALEWRAP_HEIGHT),
};

const SCALEWRAP_STEP_BASE_STYLE: CSSProperties = {
  alignSelf: "stretch",
  flexGrow: 1,
};

interface StressTestContractProps {
  variant?: StressTestVariant;
}

export interface StressTestProps
  extends Omit<HTMLAttributes<HTMLDivElement>, keyof StressTestContractProps>,
    StressTestContractProps {}

export function StressTest({ variant = "info", style, ...rest }: StressTestProps) {
  const entry = VARIANTS[variant];
  const isInfo = variant === "info";

  const textColor = tokenVar(entry.tokens.text);
  const tileColor = tokenVar(entry.tokens.tile);
  const titleColor = tokenVar(entry.tokens.title);
  const descriptionColor = tokenVar(entry.tokens.description);
  const linkColor = tokenVar(entry.tokens.link);
  const dividerColor = tokenVar(entry.tokens["divider.background"]);

  const rootStyle: CSSProperties = {
    ...ROOT_STYLE_BASE,
    boxShadow: `inset 0 0 0 ${tokenVar(entry.strokes["base.border"].width)} ${tokenVar(entry.strokes["base.border"].color)}`,
    ...style,
  };

  const tiles = isInfo ? INFO_TILES : SUCCESS_TILES;
  const tilesGridRows = isInfo ? INFO_TILESGRID_ROWS : SUCCESS_TILESGRID_ROWS;

  const columns = isInfo ? INFO_COLUMNS : SUCCESS_COLUMNS;

  const tileLinks = isInfo ? INFO_TILELINKS : SUCCESS_TILELINKS;

  const buttonA = isInfo ? INFO_BUTTON_A : SUCCESS_BUTTON_A;
  const buttonB = isInfo ? INFO_BUTTON_B : SUCCESS_BUTTON_B;
  const buttonC = SUCCESS_BUTTON_C;

  const buttonsRow = (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignSelf: "stretch",
        justifyContent: "space-between",
        alignItems: "center",
        ...(isInfo
          ? {
              borderRadius: tokenVar(USERINPUT_RADIUS),
              paddingLeft: tokenVar(USERINPUT_PADDING_LEFT),
              paddingRight: tokenVar(USERINPUT_PADDING_RIGHT),
              paddingTop: tokenVar(USERINPUT_PADDING_TOP),
              paddingBottom: tokenVar(USERINPUT_PADDING_BOTTOM),
              backgroundColor: tokenVar(entry.tokens["userinput.background"]!),
              boxShadow: `inset 0 0 0 ${tokenVar(entry.strokes["userinput.border"]!.width)} ${tokenVar(entry.strokes["userinput.border"]!.color)}`,
            }
          : {}),
      }}
    >
      <Button
        color={buttonA.color}
        variant={buttonA.variant}
        iconLeft={buttonA.iconLeft}
        iconRight={buttonA.iconRight}
        label={buttonA.label}
        iconLeftName={buttonA.iconLeftName}
      >
        {buttonA.children}
      </Button>
      {isInfo ? (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "flex-start",
            borderRadius: tokenVar(USERINPUT_TAG_RADIUS),
            paddingLeft: tokenVar(USERINPUT_TAG_PADDING_X),
            paddingRight: tokenVar(USERINPUT_TAG_PADDING_X),
            paddingTop: tokenVar(USERINPUT_TAG_PADDING_Y),
            paddingBottom: tokenVar(USERINPUT_TAG_PADDING_Y),
            backgroundColor: tokenVar(entry.tokens["background-tag"]!),
          }}
        >
          <span style={{ ...TEXT_STYLES["label.small"], color: tokenVar(entry.tokens["text-color-tag"]!) }}>
            ou
          </span>
        </div>
      ) : null}
      <Button
        color={buttonB.color}
        variant={buttonB.variant}
        iconLeft={buttonB.iconLeft}
        iconRight={buttonB.iconRight}
        label={buttonB.label}
        iconLeftName={buttonB.iconLeftName}
      >
        {buttonB.children}
      </Button>
      <Button
        color={buttonC.color}
        variant={buttonC.variant}
        iconLeft={buttonC.iconLeft}
        iconRight={buttonC.iconRight}
        label={buttonC.label}
        iconLeftName={buttonC.iconLeftName}
        style={isInfo ? { display: "none" } : undefined}
        aria-hidden={isInfo ? true : undefined}
        tabIndex={isInfo ? -1 : undefined}
      >
        {buttonC.children}
      </Button>
    </div>
  );

  const divider = (
    <div
      style={{
        alignSelf: "stretch",
        height: tokenVar(DIVIDER_HEIGHT),
        maxWidth: tokenVar(DIVIDER_MAX_WIDTH),
        backgroundColor: dividerColor,
      }}
    />
  );

  const scaleWrap = (
    <div style={SCALEWRAP_STYLE}>
      <div
        style={{
          ...SCALEWRAP_STEP_BASE_STYLE,
          backgroundColor: tokenVar(entry.tokens["scale-1"]),
          borderTopLeftRadius: tokenVar(SCALEWRAP_RADIUS_TOP_LEFT),
          borderBottomLeftRadius: tokenVar(SCALEWRAP_RADIUS_BOTTOM_LEFT),
        }}
      />
      <div style={{ ...SCALEWRAP_STEP_BASE_STYLE, backgroundColor: tokenVar(entry.tokens["scale-2"]) }} />
      <div style={{ ...SCALEWRAP_STEP_BASE_STYLE, backgroundColor: tokenVar(entry.tokens["scale-3"]) }} />
      <div style={{ ...SCALEWRAP_STEP_BASE_STYLE, backgroundColor: tokenVar(entry.tokens["scale-4"]) }} />
      <div style={{ ...SCALEWRAP_STEP_BASE_STYLE, backgroundColor: tokenVar(entry.tokens["scale-5"]) }} />
      <div
        style={{
          ...SCALEWRAP_STEP_BASE_STYLE,
          backgroundColor: tokenVar(entry.tokens["scale-6"]),
          borderTopRightRadius: tokenVar(SCALEWRAP_RADIUS_TOP_RIGHT),
          borderBottomRightRadius: tokenVar(SCALEWRAP_RADIUS_BOTTOM_RIGHT),
        }}
      />
    </div>
  );

  return (
    <div style={rootStyle} {...rest}>
      <div style={HEAD_STYLE}>
        <span style={{ ...TEXT_STYLES["title.medium"], color: textColor }}>Titre</span>
        <span style={{ ...TEXT_STYLES["body.medium"], color: textColor, alignSelf: "stretch" }}>
          Description de l’élément sur quelques lignes, idéalement deux au maximum.
        </span>
      </div>

      <Alert
        style={{ alignSelf: "stretch" }}
        severity={isInfo ? "info" : "success"}
        variant={isInfo ? "standard" : "outlined"}
      />

      <div
        style={{
          display: "grid",
          alignSelf: "stretch",
          gridTemplateColumns: TILESGRID_COLUMNS,
          gridTemplateRows: tilesGridRows,
          columnGap: tokenVar(TILESGRID_GAP_COL),
          rowGap: tokenVar(TILESGRID_GAP_ROWS),
        }}
      >
        {tiles.map((tile, index) => (
          <div
            // eslint-disable-next-line react/no-array-index-key -- tuiles anonymes, purement décoratives.
            key={index}
            style={{
              gridColumn: `${tile.column} / span ${tile.columnSpan ?? 1}`,
              gridRow: `${tile.row} / span ${tile.rowSpan ?? 1}`,
              backgroundColor: tileColor,
              borderRadius: tokenVar(TILESGRID_RADIUS),
              ...(tile.height ? { height: tile.height } : {}),
            }}
          />
        ))}
      </div>

      {isInfo ? buttonsRow : null}

      <div style={TEXTCOLUMNS_STYLE}>
        {columns.map((column, index) => (
          // eslint-disable-next-line react/no-array-index-key -- colonnes anonymes, purement décoratives.
          <div key={index} style={TEXTCOLUMN_STYLE}>
            <span style={{ ...TEXT_STYLES["body.large"], color: titleColor, ...TEXTCOLUMN_ROW_STYLE }}>
              {column.title}
            </span>
            <span
              style={{ ...TEXT_STYLES[column.descriptionStyle], color: descriptionColor, ...TEXTCOLUMN_ROW_STYLE }}
            >
              {column.description}
            </span>
            {column.link !== null ? (
              <span style={{ ...TEXT_STYLES["label.small"], color: linkColor, ...TEXTCOLUMN_ROW_STYLE }}>
                {column.link}
              </span>
            ) : null}
          </div>
        ))}
      </div>

      {divider}

      <div style={TILELINKSWRAP_STYLE}>
        <TileLink variant={tileLinks[0].variant} chessName={tileLinks[0].chessName} />
        <TileLink variant={tileLinks[1].variant} chessName={tileLinks[1].chessName} />
        <TileLink variant={tileLinks[2].variant} chessName={tileLinks[2].chessName} />
        <TileLink variant={tileLinks[3].variant} chessName={tileLinks[3].chessName} />
        <TileLink variant={tileLinks[4].variant} chessName={tileLinks[4].chessName} />
        <TileLink variant={tileLinks[5].variant} chessName={tileLinks[5].chessName} />
        <TileLink variant={tileLinks[6].variant} chessName={tileLinks[6].chessName} />
      </div>

      {!isInfo ? divider : null}

      {scaleWrap}

      {!isInfo ? buttonsRow : null}
    </div>
  );
}
