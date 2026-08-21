import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

import { Alert } from "../Alert/index.ts";
import type { AlertProps } from "../Alert/index.ts";
import { Button } from "../Button/index.ts";
import type { ButtonProps } from "../Button/index.ts";
import { TileLink } from "../TileLink/index.ts";
import type { TileLinkProps } from "../TileLink/index.ts";
import { tokenVar } from "../../tokens.ts";
import type { StressTestVariant } from "../../generated/contracts/StressTest.ts";

export type { StressTestVariant };

/**
 * Clés de peinture des feuilles de variantes (`variants[].tokens`). Elles
 * dépassent les cinq clés partagées : `rendering.roles` dit comment peindre
 * chacune, et `variantViews[].paintPlacements` où la poser.
 */
type PaintKey =
  | "text"
  | "tile"
  | "title"
  | "description"
  | "link"
  | "divider.background"
  | "scale-1"
  | "scale-2"
  | "scale-3"
  | "scale-4"
  | "scale-5"
  | "scale-6"
  | "userinput.background"
  | "background-tag"
  | "text-color-tag";

/**
 * Feuille de couleurs d'une variante. Une clé absente n'est pas un défaut à
 * compléter : la vue exacte de cette variante ne peint simplement pas ce
 * calque — `success` n'a ni `UserInput` ni son `Tag`.
 */
type PaintSheet = Readonly<Partial<Record<PaintKey, string>>>;

/** Contour lié : sa couleur, son épaisseur, et rien si elle manque. */
interface Stroke {
  color: string;
  width: string | null;
}

type StrokeKey = "base.border" | "userinput.border";
type StrokeSheet = Readonly<Partial<Record<StrokeKey, Stroke>>>;

/**
 * Les deux feuilles complètes de `variants[].tokens`, recopiées en toutes
 * lettres : un chemin assemblé à l'exécution ne serait plus comparable au
 * contrat.
 */
const COLORS: Record<StressTestVariant, PaintSheet> = {
  info: {
    "text": "{components.stresstest.info.head.colors.text}",
    "tile": "{components.stresstest.info.tilesgrid.colors.tile}",
    "userinput.background": "{components.stresstest.info.userinput.colors.background}",
    "background-tag": "{components.stresstest.info.userinput.colors.background-tag}",
    "text-color-tag": "{components.stresstest.info.userinput.colors.text-color-tag}",
    "title": "{components.stresstest.info.textcolumns.colors.title}",
    "description": "{components.stresstest.info.textcolumns.colors.description}",
    "link": "{components.stresstest.info.textcolumns.colors.link}",
    "divider.background": "{components.stresstest.info.divider.colors.background}",
    "scale-1": "{components.stresstest.info.scalewrap.colors.scale-1}",
    "scale-2": "{components.stresstest.info.scalewrap.colors.scale-2}",
    "scale-3": "{components.stresstest.info.scalewrap.colors.scale-3}",
    "scale-4": "{components.stresstest.info.scalewrap.colors.scale-4}",
    "scale-5": "{components.stresstest.info.scalewrap.colors.scale-5}",
    "scale-6": "{components.stresstest.info.scalewrap.colors.scale-6}",
  },
  success: {
    "text": "{components.stresstest.info.head.colors.text}",
    "tile": "{components.stresstest.success.tilesgrid.colors.tile}",
    "title": "{components.stresstest.info.textcolumns.colors.title}",
    "description": "{components.stresstest.info.textcolumns.colors.description}",
    "link": "{components.stresstest.info.textcolumns.colors.link}",
    "divider.background": "{components.stresstest.info.divider.colors.background}",
    "scale-1": "{components.stresstest.success.scalewrap.colors.scale-1}",
    "scale-2": "{components.stresstest.success.scalewrap.colors.scale-2}",
    "scale-3": "{components.stresstest.success.scalewrap.colors.scale-3}",
    "scale-4": "{components.stresstest.success.scalewrap.colors.scale-4}",
    "scale-5": "{components.stresstest.success.scalewrap.colors.scale-5}",
    "scale-6": "{components.stresstest.success.scalewrap.colors.scale-6}",
  },
};

/** Les contours de `variants[].strokes`, alignés `inside` dans les deux vues. */
const STROKES: Record<StressTestVariant, StrokeSheet> = {
  info: {
    "base.border": {
      color: "{components.stresstest.info.base.colors.border}",
      width: "{components.stresstest.info.base.sizes.border-width}",
    },
    "userinput.border": {
      color: "{components.stresstest.info.userinput.colors.border}",
      width: "{components.stresstest.info.userinput.sizes.border-width}",
    },
  },
  success: {
    "base.border": {
      color: "{components.stresstest.info.base.colors.border}",
      width: "{components.stresstest.info.base.sizes.border-width}",
    },
  },
};

/** Styles de texte du contrat (`textStyles`), variables comprises. */
type TextStyleName =
  | "title.medium"
  | "body.large"
  | "body.medium"
  | "body.small"
  | "label.small";

const TEXT_STYLES: Record<TextStyleName, CSSProperties> = {
  "title.medium": {
    fontFamily: tokenVar("{primitives.fontfamily.base}"),
    fontSize: tokenVar("{typography.title.medium.fontsize}"),
    fontWeight: tokenVar("{typography.title.medium.fontweight}"),
    lineHeight: tokenVar("{typography.title.medium.lineheight}"),
    letterSpacing: tokenVar("{typography.title.medium.letterspacing}"),
  },
  "body.large": {
    fontFamily: tokenVar("{primitives.fontfamily.base}"),
    fontSize: tokenVar("{typography.body.large.fontsize}"),
    fontWeight: tokenVar("{typography.body.large.fontweight}"),
    lineHeight: tokenVar("{typography.body.large.lineheight}"),
    letterSpacing: tokenVar("{typography.body.large.letterspacing}"),
  },
  "body.medium": {
    fontFamily: tokenVar("{primitives.fontfamily.base}"),
    fontSize: tokenVar("{typography.body.medium.fontsize}"),
    fontWeight: tokenVar("{typography.body.medium.fontweight}"),
    lineHeight: tokenVar("{typography.body.medium.lineheight}"),
    letterSpacing: tokenVar("{typography.body.medium.letterspacing}"),
  },
  "body.small": {
    fontFamily: tokenVar("{primitives.fontfamily.base}"),
    fontSize: tokenVar("{typography.body.small.fontsize}"),
    fontWeight: tokenVar("{typography.body.small.fontweight}"),
    lineHeight: tokenVar("{typography.body.small.lineheight}"),
    letterSpacing: tokenVar("{typography.body.small.letterspacing}"),
  },
  "label.small": {
    fontFamily: tokenVar("{primitives.fontfamily.base}"),
    fontSize: tokenVar("{typography.label.small.fontsize}"),
    fontWeight: tokenVar("{typography.label.small.fontweight}"),
    lineHeight: tokenVar("{typography.label.small.lineheight}"),
    letterSpacing: tokenVar("{typography.label.small.letterspacing}"),
  },
};

/**
 * Tuile de `TilesGrid` : sa place dans la grille, et — sous une piste qui hug —
 * la mesure en PIXELS que sa cellule attend d'elle (`structuralSize`). Ce n'est
 * pas un token : la passer à `tokenVar` fabriquerait `var(--15px)`.
 */
interface Tile {
  slot: string;
  columnStart: number;
  rowStart: number;
  columnSpan?: number;
  rowSpan?: number;
  structuralHeight?: string;
}

/**
 * Colonne de `TextColumns` : le style de texte de chacune de ses parts, dans la
 * vue exacte de sa variante. Un `link` absent n'est pas un contenu manquant,
 * c'est un slot que cette vue ne publie pas.
 */
interface Column {
  title: TextStyleName;
  description: TextStyleName;
  link?: TextStyleName;
}

/**
 * Ce que chaque `variantViews[variants[].view]` publie et que l'autre ne publie
 * pas. Deux vues ne se complètent pas : ni héritage, ni merge avec la vue de
 * référence.
 */
interface ExactView {
  rowSizes: readonly string[];
  tiles: readonly Tile[];
  columns: readonly Column[];
  /** Slot `userinput`, ses deux boutons et son `Tag`. */
  userInput: boolean;
  /** Slot `divider-2`, entre `TileLinksWrap` et `ScaleWrap`. */
  dividerAfterLinks: boolean;
  /** Slot `actionswrap` et ses trois boutons. */
  actions: boolean;
}

/** Pistes de colonnes, identiques dans les deux vues. */
const COLUMN_SIZES = ["1fr", "1fr", "1fr", "1fr"];

const VIEWS: Record<StressTestVariant, ExactView> = {
  info: {
    rowSizes: [
      "15px",
      "fit-content(100%)",
      "fit-content(100%)",
      "fit-content(100%)",
      "fit-content(100%)",
    ],
    tiles: [
      { slot: "tile", columnStart: 1, rowStart: 1 },
      { slot: "tile-2", columnStart: 2, rowStart: 1 },
      { slot: "tile-3", columnStart: 3, rowStart: 1 },
      { slot: "tile-4", columnStart: 4, rowStart: 1 },
      { slot: "tile-5", columnStart: 1, rowStart: 2, structuralHeight: "15px" },
      { slot: "tile-6", columnStart: 2, rowStart: 2, columnSpan: 2, structuralHeight: "15px" },
      { slot: "tile-7", columnStart: 4, rowStart: 2, structuralHeight: "15px" },
      {
        slot: "tile-8",
        columnStart: 1,
        rowStart: 3,
        columnSpan: 4,
        rowSpan: 2,
        structuralHeight: "40px",
      },
      { slot: "tile-9", columnStart: 1, rowStart: 5, structuralHeight: "15px" },
      { slot: "tile-10", columnStart: 2, rowStart: 5, structuralHeight: "15px" },
      { slot: "tile-11", columnStart: 3, rowStart: 5, structuralHeight: "15px" },
      { slot: "tile-12", columnStart: 4, rowStart: 5, structuralHeight: "15px" },
    ],
    columns: [
      { title: "body.large", description: "body.small", link: "label.small" },
      { title: "body.large", description: "body.small", link: "label.small" },
      { title: "body.large", description: "body.small", link: "label.small" },
    ],
    userInput: true,
    dividerAfterLinks: false,
    actions: false,
  },
  success: {
    rowSizes: ["15px", "15px", "15px", "fit-content(100%)", "fit-content(100%)"],
    tiles: [
      { slot: "tile", columnStart: 1, rowStart: 1, rowSpan: 2 },
      { slot: "tile-2", columnStart: 2, rowStart: 1 },
      { slot: "tile-3", columnStart: 3, rowStart: 1 },
      { slot: "tile-4", columnStart: 4, rowStart: 1 },
      { slot: "tile-5", columnStart: 2, rowStart: 2 },
      { slot: "tile-6", columnStart: 3, rowStart: 2 },
      { slot: "tile-7", columnStart: 4, rowStart: 2, rowSpan: 2 },
      { slot: "tile-8", columnStart: 1, rowStart: 3 },
      { slot: "tile-9", columnStart: 2, rowStart: 3 },
      { slot: "tile-10", columnStart: 3, rowStart: 3 },
      { slot: "tile-11", columnStart: 1, rowStart: 4, structuralHeight: "15px" },
      { slot: "tile-12", columnStart: 2, rowStart: 4, structuralHeight: "15px" },
      { slot: "tile-13", columnStart: 3, rowStart: 4, columnSpan: 2, structuralHeight: "15px" },
      { slot: "tile-14", columnStart: 1, rowStart: 5, structuralHeight: "15px" },
      { slot: "tile-15", columnStart: 2, rowStart: 5, structuralHeight: "15px" },
      { slot: "tile-16", columnStart: 3, rowStart: 5, structuralHeight: "15px" },
      { slot: "tile-17", columnStart: 4, rowStart: 5, structuralHeight: "15px" },
    ],
    columns: [
      { title: "body.large", description: "body.medium" },
      { title: "body.large", description: "body.small", link: "label.small" },
    ],
    userInput: false,
    dividerAfterLinks: true,
    actions: true,
  },
};

/**
 * Les six barres de `ScaleWrap` : leur couleur et, aux extrémités, les seuls
 * coins que le contrat arrondit. Les côtés absents ne se complètent pas avec le
 * premier token.
 */
const STEPS: readonly { slot: string; paint: PaintKey; radius: CSSProperties }[] = [
  {
    slot: "step",
    paint: "scale-1",
    radius: {
      borderTopLeftRadius: tokenVar("{components.stresstest.info.scalewrap.sizes.radius-top-left}"),
      borderBottomLeftRadius: tokenVar(
        "{components.stresstest.info.scalewrap.sizes.radius-bottom-left}",
      ),
    },
  },
  { slot: "step-2", paint: "scale-2", radius: {} },
  { slot: "step-3", paint: "scale-3", radius: {} },
  { slot: "step-4", paint: "scale-4", radius: {} },
  { slot: "step-5", paint: "scale-5", radius: {} },
  {
    slot: "step-6",
    paint: "scale-6",
    radius: {
      borderTopRightRadius: tokenVar(
        "{components.stresstest.info.scalewrap.sizes.radius-top-right}",
      ),
      borderBottomRightRadius: tokenVar(
        "{components.stresstest.info.scalewrap.sizes.radius-bottom-right}",
      ),
    },
  },
];

/**
 * Ce que la maquette MONTRE pour une variante : le texte de ses slots et les
 * props qu'elle applique à chacune de ses dépendances (`samples`, désigné par
 * `variants[].sample`).
 *
 * Rien ici n'est normatif — aucun contrôle ne le compare au contrat. C'est le
 * DÉFAUT des props applicatives, que l'appelant remplace librement. Les états
 * (`args.state`) n'y figurent pas : ils décrivent un état, pas une prop.
 */
interface SampleContent {
  title: string;
  description: string;
  tag?: string;
  columns: readonly StressTestColonne[];
  alert: AlertProps;
  actions: readonly ButtonProps[];
  tileLinks: readonly TileLinkProps[];
}

const SAMPLES: Record<StressTestVariant, SampleContent> = {
  info: {
    title: "Titre",
    description:
      "Description de l’élément sur quelques lignes, idéalement deux au maximum.",
    tag: "ou",
    columns: [
      {
        title: "Point 1",
        description:
          "Ce qui est important de faire pour le point 1 c’est de suivre impérativement les règles du point 1",
        link: "Lien vers ressource 1",
      },
      {
        title: "Point 2",
        description:
          "Ce qui est important de faire pour le point 2 c’est de suivre impérativement les règles du point 2",
        link: "Lien vers ressource 2",
      },
      {
        title: "Point 3",
        description:
          "Ce qui est important de faire pour le point 3 c’est de suivre impérativement les règles du point 3",
        link: "Lien vers ressource 3",
      },
    ],
    // L'`Alert` n'a pas d'`overrides` : son texte est celui de SON échantillon,
    // et c'est à elle de le rendre. Seuls ses `args` viennent d'ici.
    alert: {
      severity: "info",
      variant: "standard",
      icon: true,
      title: true,
      action: true,
      actionProps: {
        color: "info",
        variant: "text",
        iconLeft: false,
        iconRight: false,
        label: true,
        size: "small",
      },
    },
    actions: [
      {
        color: "success",
        variant: "contained",
        iconLeft: true,
        iconRight: false,
        label: true,
        size: "medium",
        children: "Accepter",
      },
      {
        color: "error",
        variant: "contained",
        iconLeft: true,
        iconRight: false,
        label: true,
        size: "medium",
        children: "Refuser",
      },
    ],
    tileLinks: [
      { variant: "info" },
      { variant: "info" },
      { variant: "info" },
      { variant: "info" },
      { variant: "info" },
      { variant: "info" },
      { variant: "info" },
    ],
  },
  success: {
    title: "Titre",
    description:
      "Description de l’élément sur quelques lignes, idéalement deux au maximum.",
    columns: [
      {
        title: "Point 1",
        description:
          "Ce qui est important de faire pour le point 1 c’est de suivre impérativement les règles du point 1",
      },
      {
        title: "Point 2",
        description:
          "Ce qui est important de faire pour le point 2 c’est de suivre impérativement les règles du point 2",
        link: "Lien vers ressource 2",
      },
    ],
    alert: {
      severity: "success",
      variant: "outlined",
      icon: true,
      title: true,
      action: true,
      actionProps: {
        color: "info",
        variant: "text",
        iconLeft: false,
        iconRight: false,
        label: true,
        size: "small",
      },
    },
    actions: [
      {
        color: "secondary",
        variant: "text",
        iconLeft: false,
        iconRight: false,
        label: true,
        size: "medium",
        children: "Retour",
      },
      {
        color: "success",
        variant: "text",
        iconLeft: true,
        iconRight: false,
        label: false,
        size: "medium",
        children: "Poursuivre",
      },
      {
        color: "info",
        variant: "outlined",
        iconLeft: true,
        iconRight: false,
        label: true,
        size: "medium",
        children: "Poursuivre",
      },
    ],
    tileLinks: [
      { variant: "success" },
      { variant: "info" },
      { variant: "info" },
      { variant: "info" },
      { variant: "info" },
      { variant: "info" },
      { variant: "success" },
    ],
  },
};

/** Couleur d'une clé, ou rien quand la vue de cette variante ne la peint pas. */
function paintOf(sheet: PaintSheet, key: PaintKey): string | undefined {
  const reference = sheet[key];
  return reference === undefined ? undefined : tokenVar(reference);
}

/**
 * Bordure d'une clé de contour. Une épaisseur absente ne se rend pas : le
 * navigateur ne doit pas en inventer une. L'alignement `inside` du contrat se
 * rend en `border-box`, la bordure restant dans la boîte du calque.
 */
function strokeOf(sheet: StrokeSheet, key: StrokeKey): CSSProperties {
  const stroke = sheet[key];
  if (stroke === undefined || stroke.width === null) return {};
  return {
    borderStyle: "solid",
    borderColor: tokenVar(stroke.color),
    borderWidth: tokenVar(stroke.width),
    boxSizing: "border-box",
  };
}

/** Place d'un layer dans la grille, avec son étendue quand il en a une. */
function placement(start: number, span?: number): string {
  return span === undefined ? String(start) : `${start} / span ${span}`;
}

/** Contenu d'une colonne de `TextColumns`. */
export interface StressTestColonne {
  title?: ReactNode;
  description?: ReactNode;
  link?: ReactNode;
}

interface StressTestContractProps {
  variant?: StressTestVariant;
}

/**
 * Le contrat ne déclare qu'une prop, `variant`. Tout le reste est applicatif :
 * ces champs portent le CONTENU, et chacun a pour défaut celui que la maquette
 * montre pour la variante rendue.
 */
export interface StressTestProps
  extends Omit<HTMLAttributes<HTMLDivElement>, keyof StressTestContractProps>,
    StressTestContractProps {
  /** Contenu du slot `label` de `Head` ; `children` porte celui de `label-2`. */
  titleContent?: ReactNode;
  /** Contenu du `Tag` de `UserInput`, que seule la vue `info` publie. */
  tagContent?: ReactNode;
  /** Contenus des colonnes, dans l'ordre où la vue exacte les publie. */
  columns?: readonly StressTestColonne[];
  /** Props de l'`Alert` composée ; son `actionProps` se fusionne à part. */
  alertProps?: AlertProps;
  /** Props des trois `Button` composés, dans l'ordre de `composes`. */
  firstActionProps?: ButtonProps;
  secondActionProps?: ButtonProps;
  thirdActionProps?: ButtonProps;
  /** Props des sept `TileLink` composés, dans l'ordre de `composes`. */
  tileLinks?: readonly TileLinkProps[];
}

/**
 * Composant au layout complexe utilisé uniquement pour stress-tester
 * l'exporter de contrats (`intent.usage`).
 *
 * Reconstruction en contexte froid : écrite depuis le seul
 * `StressTest.contract.json` (10.2) et le skill `consommer-contrat`. La
 * structure, les tokens et la typographie viennent du contrat NORMATIF ; le
 * contenu vient de `samples`, où il n'est que le défaut de props applicatives.
 *
 * Le contrat n'a pas de `stateModel` : aucun état à suivre, et les styles
 * inline n'ont ici aucune pseudo-classe à remplacer. Les deux variantes ne
 * partagent pas leur arbre — `info` porte un `UserInput`, `success` un
 * `ActionsWrap` et un second `Divider` — et chaque vue exacte est reprise telle
 * quelle, sans merge avec celle de référence.
 */
export function StressTest({
  variant = "info",
  titleContent,
  tagContent,
  columns = [],
  alertProps,
  firstActionProps,
  secondActionProps,
  thirdActionProps,
  tileLinks = [],
  children,
  style,
  ...rest
}: StressTestProps) {
  const view = VIEWS[variant];
  const colors = COLORS[variant];
  const strokes = STROKES[variant];
  const sample = SAMPLES[variant];

  // Les dépendances de `composes`, à leur cardinalité maximale : les deux vues
  // rendent une `Alert` et sept `TileLink`, mais `info` n'occupe que deux des
  // trois emplacements de `Button` que `success` occupe tous. Chacune part des
  // props de l'échantillon, que celles de l'appelant recouvrent.
  const alert = (
    <Alert
      {...sample.alert}
      {...alertProps}
      actionProps={{ ...sample.alert.actionProps, ...alertProps?.actionProps }}
      style={{ alignSelf: "stretch", ...alertProps?.style }}
    />
  );
  const actions = [
    <Button key="button" {...sample.actions[0]} {...firstActionProps} />,
    <Button key="button-2" {...sample.actions[1]} {...secondActionProps} />,
    <Button key="button-3" {...sample.actions[2]} {...thirdActionProps} />,
  ];
  const links = [
    <TileLink key="tilelink" {...sample.tileLinks[0]} {...tileLinks[0]} />,
    <TileLink key="tilelink-2" {...sample.tileLinks[1]} {...tileLinks[1]} />,
    <TileLink key="tilelink-3" {...sample.tileLinks[2]} {...tileLinks[2]} />,
    <TileLink key="tilelink-4" {...sample.tileLinks[3]} {...tileLinks[3]} />,
    <TileLink key="tilelink-5" {...sample.tileLinks[4]} {...tileLinks[4]} />,
    <TileLink key="tilelink-6" {...sample.tileLinks[5]} {...tileLinks[5]} />,
    <TileLink key="tilelink-7" {...sample.tileLinks[6]} {...tileLinks[6]} />,
  ];

  // `divider` remplit la largeur mais reste borné : il garde son remplissage,
  // applique sa borne, puis centre sa boîte dans un parent qui centre.
  const divider = (
    <div
      style={{
        alignSelf: "stretch",
        height: tokenVar("{components.stresstest.info.divider.sizes.height}"),
        maxWidth: tokenVar("{components.stresstest.info.divider.sizes.max-width}"),
        marginInline: "auto",
        backgroundColor: paintOf(colors, "divider.background"),
      }}
    />
  );

  return (
    <div
      {...rest}
      style={{
        display: "flex",
        flexDirection: "column",
        width: "fit-content",
        height: "fit-content",
        maxWidth: tokenVar("{components.stresstest.info.base.sizes.max-width}"),
        justifyContent: "center",
        alignItems: "center",
        gap: tokenVar("{components.stresstest.info.base.sizes.gap}"),
        paddingInline: tokenVar("{components.stresstest.info.base.sizes.padding}"),
        paddingBlock: tokenVar("{components.stresstest.info.base.sizes.padding}"),
        borderRadius: tokenVar("{components.stresstest.info.base.sizes.border-radius}"),
        ...strokeOf(strokes, "base.border"),
        ...style,
      }}
    >
      <div
        style={{
          alignSelf: "stretch",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          gap: tokenVar("{components.stresstest.info.head.sizes.gap}"),
        }}
      >
        <span style={{ ...TEXT_STYLES["title.medium"], color: paintOf(colors, "text") }}>
          {titleContent ?? sample.title}
        </span>
        <span
          style={{
            alignSelf: "stretch",
            ...TEXT_STYLES["body.medium"],
            color: paintOf(colors, "text"),
          }}
        >
          {children ?? sample.description}
        </span>
      </div>

      {alert}

      <div
        style={{
          alignSelf: "stretch",
          display: "grid",
          gridTemplateColumns: COLUMN_SIZES.join(" "),
          gridTemplateRows: view.rowSizes.join(" "),
          columnGap: tokenVar("{components.stresstest.info.tilesgrid.sizes.gap-col}"),
          rowGap: tokenVar("{components.stresstest.info.tilesgrid.sizes.gap-rows}"),
        }}
      >
        {view.tiles.map((tile) => (
          <div
            key={tile.slot}
            style={{
              gridColumn: placement(tile.columnStart, tile.columnSpan),
              gridRow: placement(tile.rowStart, tile.rowSpan),
              height: tile.structuralHeight,
              borderRadius: tokenVar("{components.stresstest.info.tilesgrid.sizes.radius}"),
              backgroundColor: paintOf(colors, "tile"),
            }}
          />
        ))}
      </div>

      {view.userInput ? (
        <div
          style={{
            alignSelf: "stretch",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingLeft: tokenVar("{components.stresstest.info.userinput.sizes.padding-left}"),
            paddingRight: tokenVar("{components.stresstest.info.userinput.sizes.padding-right}"),
            paddingTop: tokenVar("{components.stresstest.info.userinput.sizes.padding-top}"),
            paddingBottom: tokenVar("{components.stresstest.info.userinput.sizes.padding-bottom}"),
            borderRadius: tokenVar("{components.stresstest.info.userinput.sizes.border-radius}"),
            backgroundColor: paintOf(colors, "userinput.background"),
            ...strokeOf(strokes, "userinput.border"),
          }}
        >
          {actions[0]}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "flex-start",
              paddingInline: tokenVar("{components.stresstest.info.userinput.sizes.padding-x-tag}"),
              paddingBlock: tokenVar("{components.stresstest.info.userinput.sizes.padding-y-tag}"),
              borderRadius: tokenVar(
                "{components.stresstest.info.userinput.sizes.border-radius-tag}",
              ),
              backgroundColor: paintOf(colors, "background-tag"),
            }}
          >
            <span
              style={{
                ...TEXT_STYLES["label.small"],
                color: paintOf(colors, "text-color-tag"),
              }}
            >
              {tagContent ?? sample.tag}
            </span>
          </div>
          {actions[1]}
        </div>
      ) : null}

      <div
        style={{
          alignSelf: "stretch",
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          gap: tokenVar("{components.stresstest.info.textcolumns.sizes.gap}"),
        }}
      >
        {view.columns.map((column, index) => {
          const content = { ...sample.columns[index], ...columns[index] };
          return (
            <div
              key={index}
              style={{
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "flex-start",
                gap: tokenVar("{components.stresstest.info.textcolumns.sizes.gap-col}"),
              }}
            >
              <span
                style={{
                  alignSelf: "stretch",
                  ...TEXT_STYLES[column.title],
                  color: paintOf(colors, "title"),
                }}
              >
                {content.title}
              </span>
              <span
                style={{
                  alignSelf: "stretch",
                  ...TEXT_STYLES[column.description],
                  color: paintOf(colors, "description"),
                }}
              >
                {content.description}
              </span>
              {column.link === undefined ? null : (
                <span
                  style={{
                    alignSelf: "stretch",
                    ...TEXT_STYLES[column.link],
                    color: paintOf(colors, "link"),
                  }}
                >
                  {content.link}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {divider}

      <div
        style={{
          alignSelf: "stretch",
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "flex-start",
          alignItems: "center",
          columnGap: tokenVar("{components.stresstest.info.tilelinkswrap.sizes.gap-x}"),
          rowGap: tokenVar("{components.stresstest.info.tilelinkswrap.sizes.gap-y}"),
        }}
      >
        {links}
      </div>

      {view.dividerAfterLinks ? divider : null}

      <div
        style={{
          alignSelf: "stretch",
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "flex-start",
          alignItems: "center",
          height: tokenVar("{components.stresstest.info.scalewrap.sizes.height}"),
        }}
      >
        {STEPS.map((step) => (
          <div
            key={step.slot}
            style={{
              alignSelf: "stretch",
              flexGrow: 1,
              ...step.radius,
              backgroundColor: paintOf(colors, step.paint),
            }}
          />
        ))}
      </div>

      {view.actions ? (
        <div
          style={{
            alignSelf: "stretch",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {actions[0]}
          {actions[1]}
          {actions[2]}
        </div>
      ) : null}
    </div>
  );
}
