import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

import { Alert, type AlertProps } from "../Alert/index.ts";
import { Button, type ButtonProps } from "../Button/index.ts";
import { TileLink, type TileLinkProps } from "../TileLink/index.ts";
import { tokenVar } from "../../tokens.ts";
import type { StressTestVariant } from "../../generated/contracts/StressTest.ts";

export type { StressTestVariant };

/**
 * Feuille de couleurs de l'unique combinaison présente dans Figma
 * (`variants[].tokens` et `variants[].strokes`), écrite en toutes lettres.
 *
 * Les clés viennent du design system et ne se limitent pas aux cinq clés
 * partagées : `rendering.roles` dit comment peindre chacune, et
 * `variantViews.v1.paintPlacements` où — c'est cette localisation qui est
 * reprise ci-dessous, slot par slot, jamais le nom de la clé.
 */
const COLORS = {
  text: "{components.stresstest.info.head.colors.text}",
  tile: "{components.stresstest.info.tilesgrid.colors.tile}",
  userinputBackground: "{components.stresstest.info.userinput.colors.background}",
  backgroundTag: "{components.stresstest.info.userinput.colors.background-tag}",
  textColorTag: "{components.stresstest.info.userinput.colors.text-color-tag}",
  title: "{components.stresstest.info.textcolumns.colors.title}",
  description: "{components.stresstest.info.textcolumns.colors.description}",
  link: "{components.stresstest.info.textcolumns.colors.link}",
  dividerBackground: "{components.stresstest.info.divider.colors.background}",
  scale1: "{components.stresstest.info.scalewrap.colors.scale-1}",
  scale2: "{components.stresstest.info.scalewrap.colors.scale-2}",
  scale3: "{components.stresstest.info.scalewrap.colors.scale-3}",
  scale4: "{components.stresstest.info.scalewrap.colors.scale-4}",
  scale5: "{components.stresstest.info.scalewrap.colors.scale-5}",
  scale6: "{components.stresstest.info.scalewrap.colors.scale-6}",
};

/** `variants[].strokes` : deux traits, sur la racine et sur `userinput`. */
const STROKES = {
  base: {
    color: "{components.stresstest.info.base.colors.border}",
    width: "{components.stresstest.info.base.sizes.border-width}",
  },
  userinput: {
    color: "{components.stresstest.info.userinput.colors.border}",
    width: "{components.stresstest.info.userinput.sizes.border-width}",
  },
};

/** Dimensions publiées par `structure`, slot par slot. */
const SIZES = {
  baseGap: "{components.stresstest.info.base.sizes.gap}",
  basePadding: "{components.stresstest.info.base.sizes.padding}",
  baseRadius: "{components.stresstest.info.base.sizes.border-radius}",
  headGap: "{components.stresstest.info.head.sizes.gap}",
  gridColumnGap: "{components.stresstest.info.tilesgrid.sizes.gap-col}",
  gridRowGap: "{components.stresstest.info.tilesgrid.sizes.gap-rows}",
  tileRadius: "{components.stresstest.info.tilesgrid.sizes.radius}",
  userinputRadius: "{components.stresstest.info.userinput.sizes.border-radius}",
  userinputPaddingLeft: "{components.stresstest.info.userinput.sizes.padding-left}",
  userinputPaddingRight: "{components.stresstest.info.userinput.sizes.padding-right}",
  userinputPaddingTop: "{components.stresstest.info.userinput.sizes.padding-top}",
  userinputPaddingBottom: "{components.stresstest.info.userinput.sizes.padding-bottom}",
  tagRadius: "{components.stresstest.info.userinput.sizes.border-radius-tag}",
  tagPaddingX: "{components.stresstest.info.userinput.sizes.padding-x-tag}",
  tagPaddingY: "{components.stresstest.info.userinput.sizes.padding-y-tag}",
  columnsGap: "{components.stresstest.info.textcolumns.sizes.gap}",
  columnGap: "{components.stresstest.info.textcolumns.sizes.gap-col}",
  dividerHeight: "{components.stresstest.info.divider.sizes.height}",
  dividerMaxWidth: "{components.stresstest.info.divider.sizes.max-width}",
  tileLinksGapX: "{components.stresstest.info.tilelinkswrap.sizes.gap-x}",
  tileLinksGapY: "{components.stresstest.info.tilelinkswrap.sizes.gap-y}",
  scaleHeight: "{components.stresstest.info.scalewrap.sizes.height}",
  scaleRadiusTopLeft: "{components.stresstest.info.scalewrap.sizes.radius-top-left}",
  scaleRadiusBottomLeft: "{components.stresstest.info.scalewrap.sizes.radius-bottom-left}",
  scaleRadiusTopRight: "{components.stresstest.info.scalewrap.sizes.radius-top-right}",
  scaleRadiusBottomRight: "{components.stresstest.info.scalewrap.sizes.radius-bottom-right}",
};

/**
 * Pistes de la grille du slot `tilesgrid`, telles que le contrat les publie.
 *
 * La ligne 1 est une piste FIXED conservée en pixels : c'est l'exception
 * structurelle explicite aux dimensions tokenisées, signalée par
 * `meta.warnings`. Elle se recopie sans devenir un token.
 */
const GRID_COLUMN_SIZES = ["1fr", "1fr", "1fr", "1fr"];
const GRID_ROW_SIZES = [
  "15px",
  "fit-content(100%)",
  "fit-content(100%)",
  "fit-content(100%)",
  "fit-content(100%)",
];

/** Place de chaque tuile dans la grille (`columnStart`, `rowStart`, spans). */
const TILES: readonly {
  slot: string;
  columnStart: number;
  rowStart: number;
  columnSpan?: number;
  rowSpan?: number;
}[] = [
  { slot: "tile", columnStart: 1, rowStart: 1 },
  { slot: "tile-2", columnStart: 2, rowStart: 1 },
  { slot: "tile-3", columnStart: 3, rowStart: 1 },
  { slot: "tile-4", columnStart: 4, rowStart: 1 },
  { slot: "tile-5", columnStart: 1, rowStart: 2 },
  { slot: "tile-6", columnStart: 2, rowStart: 2, columnSpan: 2 },
  { slot: "tile-7", columnStart: 4, rowStart: 2 },
  { slot: "tile-8", columnStart: 1, rowStart: 3, columnSpan: 4, rowSpan: 2 },
  { slot: "tile-9", columnStart: 1, rowStart: 5 },
  { slot: "tile-10", columnStart: 2, rowStart: 5 },
  { slot: "tile-11", columnStart: 3, rowStart: 5 },
  { slot: "tile-12", columnStart: 4, rowStart: 5 },
];

/**
 * Les six marches de `scalewrap` : leur couleur, et les seuls coins que le
 * contrat tokenise. Un côté absent n'est pas complété par un autre.
 */
const STEPS: readonly {
  slot: string;
  color: string;
  radius?: CSSProperties;
}[] = [
  {
    slot: "step",
    color: COLORS.scale1,
    radius: {
      borderTopLeftRadius: tokenVar(SIZES.scaleRadiusTopLeft),
      borderBottomLeftRadius: tokenVar(SIZES.scaleRadiusBottomLeft),
    },
  },
  { slot: "step-2", color: COLORS.scale2 },
  { slot: "step-3", color: COLORS.scale3 },
  { slot: "step-4", color: COLORS.scale4 },
  { slot: "step-5", color: COLORS.scale5 },
  {
    slot: "step-6",
    color: COLORS.scale6,
    radius: {
      borderTopRightRadius: tokenVar(SIZES.scaleRadiusTopRight),
      borderBottomRightRadius: tokenVar(SIZES.scaleRadiusBottomRight),
    },
  },
];

/** `textStyles` : les cinq styles employés par les slots de texte. */
const TEXT_STYLES = {
  "title.medium": {
    fontFamily: "{primitives.fontfamily.base}",
    fontSize: "{typography.title.medium.fontsize}",
    fontWeight: "{typography.title.medium.fontweight}",
    lineHeight: "{typography.title.medium.lineheight}",
    letterSpacing: "{typography.title.medium.letterspacing}",
  },
  "body.medium": {
    fontFamily: "{primitives.fontfamily.base}",
    fontSize: "{typography.body.medium.fontsize}",
    fontWeight: "{typography.body.medium.fontweight}",
    lineHeight: "{typography.body.medium.lineheight}",
    letterSpacing: "{typography.body.medium.letterspacing}",
  },
  "label.small": {
    fontFamily: "{primitives.fontfamily.base}",
    fontSize: "{typography.label.small.fontsize}",
    fontWeight: "{typography.label.small.fontweight}",
    lineHeight: "{typography.label.small.lineheight}",
    letterSpacing: "{typography.label.small.letterspacing}",
  },
  "body.large": {
    fontFamily: "{primitives.fontfamily.base}",
    fontSize: "{typography.body.large.fontsize}",
    fontWeight: "{typography.body.large.fontweight}",
    lineHeight: "{typography.body.large.lineheight}",
    letterSpacing: "{typography.body.large.letterspacing}",
  },
  "body.small": {
    fontFamily: "{primitives.fontfamily.base}",
    fontSize: "{typography.body.small.fontsize}",
    fontWeight: "{typography.body.small.fontweight}",
    lineHeight: "{typography.body.small.lineheight}",
    letterSpacing: "{typography.body.small.letterspacing}",
  },
};

/** Traduit un style de texte du contrat en propriétés CSS. */
function typographie(nom: keyof typeof TEXT_STYLES): CSSProperties {
  const style = TEXT_STYLES[nom];

  return {
    fontFamily: tokenVar(style.fontFamily),
    fontSize: tokenVar(style.fontSize),
    fontWeight: tokenVar(style.fontWeight),
    letterSpacing: tokenVar(style.letterSpacing),
    lineHeight: tokenVar(style.lineHeight),
  };
}

/** Contenu d'une des trois colonnes de texte du slot `label-2`. */
export interface StressTestColonne {
  title?: ReactNode;
  description?: ReactNode;
  link?: ReactNode;
}

/** Props visuelles déclarées par le contrat. */
interface StressTestContractProps {
  variant?: StressTestVariant;
}

export interface StressTestProps
  extends Omit<HTMLAttributes<HTMLDivElement>, keyof StressTestContractProps>,
    StressTestContractProps {
  /** Slot `label` / `label` : le titre de l'en-tête. */
  titleContent?: ReactNode;
  /** Slot `alert` : la dépendance composée `Alert`. */
  alertProps?: AlertProps;
  /** Slot `userinput` / `button` : le premier bouton composé. */
  firstActionProps?: ButtonProps;
  /** Slot `userinput` / `label` : le tag qui sépare les deux boutons. */
  tagContent?: ReactNode;
  /** Slot `userinput` / `button-2` : le second bouton composé. */
  secondActionProps?: ButtonProps;
  /** Slot `label-2` : les trois colonnes de texte, dans leur ordre publié. */
  columns?: readonly StressTestColonne[];
  /** Slot `tilelinkswrap` : les sept dépendances `TileLink`, dans leur ordre. */
  tileLinks?: readonly TileLinkProps[];
}

/**
 * Composant au layout complexe utilisé uniquement pour stress-tester
 * l'exporter de contrats (`intent.usage`).
 *
 * Reconstruction en contexte froid : écrite depuis le seul
 * `StressTest.contract.json` (10.0) et le skill `consommer-contrat`.
 */
export function StressTest({
  titleContent,
  alertProps,
  firstActionProps,
  tagContent,
  secondActionProps,
  columns = [{}, {}, {}],
  tileLinks = [],
  children,
  style,
  ...rest
}: StressTestProps) {
  /** Racine : flex-column ajustée à son contenu, bordée sur place. */
  const rootStyle: CSSProperties = {
    alignItems: "center",
    borderColor: tokenVar(STROKES.base.color),
    borderRadius: tokenVar(SIZES.baseRadius),
    borderStyle: "solid",
    borderWidth: tokenVar(STROKES.base.width),
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    gap: tokenVar(SIZES.baseGap),
    height: "fit-content",
    justifyContent: "center",
    padding: `${tokenVar(SIZES.basePadding)} ${tokenVar(SIZES.basePadding)}`,
    width: "fit-content",
    ...style,
  };

  return (
    <div {...rest} style={rootStyle}>
      {/* Slot `label` — Head */}
      <div
        style={{
          alignItems: "flex-start",
          alignSelf: "stretch",
          display: "flex",
          flexDirection: "column",
          gap: tokenVar(SIZES.headGap),
          justifyContent: "flex-start",
        }}
      >
        <span style={{ ...typographie("title.medium"), color: tokenVar(COLORS.text) }}>
          {titleContent}
        </span>
        <span
          style={{
            ...typographie("body.medium"),
            alignSelf: "stretch",
            color: tokenVar(COLORS.text),
          }}
        >
          {children}
        </span>
      </div>

      {/* Slot `alert` — le slot EST le composant Alert */}
      <Alert {...alertProps} style={{ alignSelf: "stretch", ...alertProps?.style }} />

      {/* Slot `tilesgrid` — grille de douze tuiles */}
      <div
        style={{
          alignSelf: "stretch",
          columnGap: tokenVar(SIZES.gridColumnGap),
          display: "grid",
          gridTemplateColumns: GRID_COLUMN_SIZES.join(" "),
          gridTemplateRows: GRID_ROW_SIZES.join(" "),
          rowGap: tokenVar(SIZES.gridRowGap),
        }}
      >
        {TILES.map((tile) => (
          <div
            key={tile.slot}
            style={{
              backgroundColor: tokenVar(COLORS.tile),
              borderRadius: tokenVar(SIZES.tileRadius),
              gridColumn:
                tile.columnSpan === undefined
                  ? tile.columnStart
                  : `${tile.columnStart} / span ${tile.columnSpan}`,
              gridRow:
                tile.rowSpan === undefined
                  ? tile.rowStart
                  : `${tile.rowStart} / span ${tile.rowSpan}`,
            }}
          />
        ))}
      </div>

      {/* Slot `userinput` — deux boutons composés et un tag, padding par côté */}
      <div
        style={{
          alignItems: "center",
          alignSelf: "stretch",
          backgroundColor: tokenVar(COLORS.userinputBackground),
          borderColor: tokenVar(STROKES.userinput.color),
          borderRadius: tokenVar(SIZES.userinputRadius),
          borderStyle: "solid",
          borderWidth: tokenVar(STROKES.userinput.width),
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          paddingBottom: tokenVar(SIZES.userinputPaddingBottom),
          paddingLeft: tokenVar(SIZES.userinputPaddingLeft),
          paddingRight: tokenVar(SIZES.userinputPaddingRight),
          paddingTop: tokenVar(SIZES.userinputPaddingTop),
        }}
      >
        <Button {...firstActionProps} />
        <div
          style={{
            alignItems: "flex-start",
            backgroundColor: tokenVar(COLORS.backgroundTag),
            borderRadius: tokenVar(SIZES.tagRadius),
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-start",
            padding: `${tokenVar(SIZES.tagPaddingY)} ${tokenVar(SIZES.tagPaddingX)}`,
          }}
        >
          <span style={{ ...typographie("label.small"), color: tokenVar(COLORS.textColorTag) }}>
            {tagContent}
          </span>
        </div>
        <Button {...secondActionProps} />
      </div>

      {/* Slot `label-2` — TextColumns */}
      <div
        style={{
          alignItems: "flex-start",
          alignSelf: "stretch",
          display: "flex",
          flexDirection: "row",
          gap: tokenVar(SIZES.columnsGap),
          justifyContent: "flex-start",
        }}
      >
        {columns.map((colonne, rang) => (
          <div
            key={rang}
            style={{
              alignItems: "flex-start",
              display: "flex",
              flexDirection: "column",
              flexGrow: 1,
              gap: tokenVar(SIZES.columnGap),
              justifyContent: "center",
            }}
          >
            <span
              style={{
                ...typographie("body.large"),
                alignSelf: "stretch",
                color: tokenVar(COLORS.title),
              }}
            >
              {colonne.title}
            </span>
            <span
              style={{
                ...typographie("body.small"),
                alignSelf: "stretch",
                color: tokenVar(COLORS.description),
              }}
            >
              {colonne.description}
            </span>
            <span
              style={{
                ...typographie("label.small"),
                alignSelf: "stretch",
                color: tokenVar(COLORS.link),
              }}
            >
              {colonne.link}
            </span>
          </div>
        ))}
      </div>

      {/*
        Slot `divider` — il remplit l'axe, sa borne le retient, puis sa boîte se
        centre. La borne ne remplace ni le remplissage ni la hauteur.
      */}
      <div
        style={{
          alignSelf: "stretch",
          backgroundColor: tokenVar(COLORS.dividerBackground),
          height: tokenVar(SIZES.dividerHeight),
          marginLeft: "auto",
          marginRight: "auto",
          maxWidth: tokenVar(SIZES.dividerMaxWidth),
          width: "100%",
        }}
      />

      {/* Slot `tilelinkswrap` — sept TileLink composés, sur plusieurs lignes */}
      <div
        style={{
          alignItems: "center",
          alignSelf: "stretch",
          columnGap: tokenVar(SIZES.tileLinksGapX),
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "flex-start",
          rowGap: tokenVar(SIZES.tileLinksGapY),
        }}
      >
        <TileLink {...tileLinks[0]} />
        <TileLink {...tileLinks[1]} />
        <TileLink {...tileLinks[2]} />
        <TileLink {...tileLinks[3]} />
        <TileLink {...tileLinks[4]} />
        <TileLink {...tileLinks[5]} />
        <TileLink {...tileLinks[6]} />
      </div>

      {/* Slot `scalewrap` — six marches étirées, seuls les coins extrêmes arrondis */}
      <div
        style={{
          alignItems: "center",
          alignSelf: "stretch",
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          height: tokenVar(SIZES.scaleHeight),
          justifyContent: "flex-start",
        }}
      >
        {STEPS.map((step) => (
          <div
            key={step.slot}
            style={{
              alignSelf: "stretch",
              backgroundColor: tokenVar(step.color),
              flexGrow: 1,
              ...step.radius,
            }}
          />
        ))}
      </div>
    </div>
  );
}
