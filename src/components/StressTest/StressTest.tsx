/**
 * StressTest — reconstruction à froid depuis `StressTest.contract.json` (9.0).
 *
 * `intent.usage` : « Composant au layout complexe utilisé uniquement pour
 * stress-tester l'exporter de contrats. » Il n'a donc aucune sémantique
 * applicative : il rend des cadres, une grille, des enveloppements et trois
 * composants composés.
 *
 * Le composant n'importe pas son contrat et ne l'interprète pas au runtime : il
 * ÉCRIT ses références de tokens, et le contrat co-localisé sert à vérifier que
 * ce sont les bonnes.
 *
 * `stateModel` vaut `null` : aucun axe d'états, donc aucune pseudo-classe à
 * suivre. `variantAxes` n'en compte qu'un — `variant` — et la matrice a un seul
 * niveau.
 *
 * `meta.coverage.portable` vaut « partial » : l'export signale que la première
 * piste de la grille « TilesGrid » est un nombre écrit à la main, qu'il ne
 * publie pas. Cette piste est donc rendue en `auto` ci-dessous, faute de savoir
 * quelle place elle prend — c'est la conséquence directe de l'avertissement,
 * pas une valeur devinée.
 */
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

import { Alert } from "../Alert/Alert.tsx";
import type { AlertProps } from "../Alert/Alert.tsx";
import { Button } from "../Button/Button.tsx";
import type { ButtonProps } from "../Button/Button.tsx";
import { TileLink } from "../TileLink/TileLink.tsx";
import type { TileLinkProps } from "../TileLink/TileLink.tsx";
import { tokenVar } from "../../tokens.ts";
import type { StressTestVariant } from "../../generated/contracts/StressTest.ts";

export type { StressTestVariant };

/** Un trait de `variants[].strokes` : sa couleur et son épaisseur, tokenisées. */
type TraitTokenise = {
  color: string;
  width: string;
};

/**
 * Une feuille de la matrice.
 *
 * Ses clés sont celles du design system, et elles ne se limitent pas aux cinq
 * partagées : ce composant peint plusieurs surfaces, donc il expose ses propres
 * clés. `rendering.roles[clé].cssProperties` dit comment peindre chacune —
 * `tile`, `divider.background` et les six `scale-*` en `background-color`,
 * `text`, `title`, `description`, `link` et `text-color-tag` en `color`.
 *
 * Le nom de la clé porte AUSSI l'endroit où la poser : le contrat dit comment
 * peindre, pas sur quel élément du DOM, et c'est le nom qui le désigne — comme
 * tout nom de l'API visuelle.
 */
type FeuilleDeVariante = {
  text: string;
  tile: string;
  "userinput.background": string;
  "background-tag": string;
  "text-color-tag": string;
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
  "base.border": TraitTokenise;
  "userinput.border": TraitTokenise;
};

/** `variants[]`, rangé par son unique axe `variant`. */
const TOKENS_DE_VARIANTE: Record<StressTestVariant, FeuilleDeVariante> = {
  default: {
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
    "base.border": {
      color: "{components.stresstest.info.base.colors.border}",
      width: "{components.stresstest.info.base.sizes.border-width}",
    },
    "userinput.border": {
      color: "{components.stresstest.info.userinput.colors.border}",
      width: "{components.stresstest.info.userinput.sizes.border-width}",
    },
  },
};

/**
 * Dimensions de `structure` et de chaque slot conteneur.
 *
 * Le contrat ne publie AUCUN axe de tailles : les dimensions vivent donc au
 * niveau haut et sur les slots, jamais dans un `sizes` qui n'existe pas.
 */
const DIMENSIONS = {
  base: {
    gap: "{components.stresstest.info.base.sizes.gap}",
    padding: "{components.stresstest.info.base.sizes.padding}",
    radius: "{components.stresstest.info.base.sizes.border-radius}",
  },
  head: {
    gap: "{components.stresstest.info.head.sizes.gap}",
  },
  tilesgrid: {
    columnGap: "{components.stresstest.info.tilesgrid.sizes.gap-col}",
    rowGap: "{components.stresstest.info.tilesgrid.sizes.gap-rows}",
  },
  userinput: {
    paddingLeft: "{components.stresstest.info.userinput.sizes.padding-left}",
    paddingRight: "{components.stresstest.info.userinput.sizes.padding-right}",
    paddingTop: "{components.stresstest.info.userinput.sizes.padding-top}",
    paddingBottom: "{components.stresstest.info.userinput.sizes.padding-bottom}",
    radius: "{components.stresstest.info.userinput.sizes.border-radius}",
    paddingXTag: "{components.stresstest.info.userinput.sizes.padding-x-tag}",
    paddingYTag: "{components.stresstest.info.userinput.sizes.padding-y-tag}",
    radiusTag: "{components.stresstest.info.userinput.sizes.border-radius-tag}",
  },
  textcolumns: {
    gap: "{components.stresstest.info.textcolumns.sizes.gap}",
    gapCol: "{components.stresstest.info.textcolumns.sizes.gap-col}",
  },
  divider: {
    height: "{components.stresstest.info.divider.sizes.height}",
    maxWidth: "{components.stresstest.info.divider.sizes.max-width}",
  },
  tilelinkswrap: {
    gapX: "{components.stresstest.info.tilelinkswrap.sizes.gap-x}",
    gapY: "{components.stresstest.info.tilelinkswrap.sizes.gap-y}",
  },
  scalewrap: {
    height: "{components.stresstest.info.scalewrap.sizes.height}",
  },
} as const;

/** `textStyles`, transcrits tels quels : le slot ne recopie aucune de ces valeurs. */
const STYLES_DE_TEXTE = {
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
} as const;

/** Traduit un text style du contrat en propriétés CSS. */
function styleDeTexte(nom: keyof typeof STYLES_DE_TEXTE): CSSProperties {
  const style = STYLES_DE_TEXTE[nom];
  return {
    fontFamily: tokenVar(style.fontFamily),
    fontSize: tokenVar(style.fontSize),
    fontWeight: tokenVar(style.fontWeight),
    letterSpacing: tokenVar(style.letterSpacing),
    lineHeight: tokenVar(style.lineHeight),
  };
}

/** Contenu applicatif d'une colonne du slot « label-2 » (calque « TextColumns »). */
export interface StressTestColonne {
  title?: ReactNode;
  description?: ReactNode;
  link?: ReactNode;
}

/** Les props que le contrat déclare, et elles seules. */
interface StressTestContractProps {
  /** `props.variant` — une seule valeur publiée, « default ». */
  variant?: StressTestVariant;
}

/**
 * L'espace de noms des props appartient au contrat ; les homonymes natifs sont
 * retirés mécaniquement. Tout le reste est du contenu applicatif, que le
 * contrat ne décrit pas et n'a pas à décrire.
 */
export interface StressTestProps
  extends Omit<HTMLAttributes<HTMLDivElement>, keyof StressTestContractProps>,
    StressTestContractProps {
  /** Slot « label » / « label » (calque « Titre »). */
  titleContent?: ReactNode;
  /** Slot « label » / « label-2 » (calque « Description … »). */
  children?: ReactNode;
  /** Props de l'`Alert` composée. */
  alertProps?: AlertProps;
  /** Props du `Button` composé du slot « userinput » / « button ». */
  firstActionProps?: ButtonProps;
  /** Props du `Button` composé du slot « userinput » / « button-2 ». */
  secondActionProps?: ButtonProps;
  /** Slot « userinput » / « label » / « label » (calque « ou »). */
  tagContent?: ReactNode;
  /** Les trois colonnes du slot « label-2 », dans l'ordre des calques. */
  columns?: readonly [StressTestColonne, StressTestColonne, StressTestColonne];
  /** Props des sept `TileLink` composés, dans l'ordre des calques. */
  tileLinks?: readonly TileLinkProps[];
}

export function StressTest({
  variant = "default",
  titleContent,
  children,
  alertProps,
  firstActionProps,
  secondActionProps,
  tagContent,
  columns,
  tileLinks,
  style,
  ...attributsNatifs
}: StressTestProps) {
  const feuille = TOKENS_DE_VARIANTE[variant];

  const styleRacine: CSSProperties = {
    // `structure.layout`, `justifyContent` et `alignItems`, recopiés.
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",

    // `structure.sizing` : « fit-content » sur les deux axes.
    width: "fit-content",
    height: "fit-content",

    gap: tokenVar(DIMENSIONS.base.gap),
    paddingLeft: tokenVar(DIMENSIONS.base.padding),
    paddingRight: tokenVar(DIMENSIONS.base.padding),
    paddingTop: tokenVar(DIMENSIONS.base.padding),
    paddingBottom: tokenVar(DIMENSIONS.base.padding),
    borderRadius: tokenVar(DIMENSIONS.base.radius),

    // Trait « base.border », tracé « inside ».
    borderColor: tokenVar(feuille["base.border"].color),
    borderStyle: "solid",
    borderWidth: tokenVar(feuille["base.border"].width),
    boxSizing: "border-box",

    ...style,
  };

  // Les douze tuiles ne portent qu'une couleur : ce sont des calques graphiques
  // (`optional: true` sans `visibilityProp`), donc aucune prop ne les masque.
  const styleTuile: CSSProperties = {
    backgroundColor: tokenVar(feuille.tile),
  };

  /** Un pas de l'échelle : `alignSelf: stretch` et `flexGrow: 1`, publiés par le slot. */
  const styleDuPas = (couleur: string): CSSProperties => ({
    alignSelf: "stretch",
    backgroundColor: tokenVar(couleur),
    flexGrow: 1,
  });

  /** Une colonne du slot « label-2 » : `flexGrow: 1` et son `gap` propre. */
  const styleColonne: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    flexGrow: 1,
    gap: tokenVar(DIMENSIONS.textcolumns.gapCol),
  };

  return (
    <div {...attributsNatifs} style={styleRacine}>
      {/* Slot « label » — calque « Head ». */}
      <div
        style={{
          alignSelf: "stretch",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          gap: tokenVar(DIMENSIONS.head.gap),
          color: tokenVar(feuille.text),
        }}
      >
        <span style={styleDeTexte("title.medium")}>{titleContent}</span>
        <span style={{ ...styleDeTexte("body.medium"), alignSelf: "stretch" }}>
          {children}
        </span>
      </div>

      {/* Slot « alert » : ce slot EST l'Alert composée. */}
      <Alert {...alertProps} style={{ alignSelf: "stretch", ...alertProps?.style }} />

      {/* Slot « tilesgrid » — la seule grille du corpus. La cellule décide de la
          boîte : remplir sa cellule est le DÉFAUT d'un enfant de grille, et
          aucun d'eux ne cite de variable de taille. */}
      <div
        style={{
          alignSelf: "stretch",
          display: "grid",
          // `columnSizes` : quatre pistes « 1fr ».
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          // `rowSizes` : la première vaut `null` — l'export a signalé un nombre
          // écrit à la main, qu'il ne publie pas. Les quatre suivantes valent
          // « fit-content », soit une piste qui suit son contenu.
          gridTemplateRows: "auto auto auto auto auto",
          columnGap: tokenVar(DIMENSIONS.tilesgrid.columnGap),
          rowGap: tokenVar(DIMENSIONS.tilesgrid.rowGap),
        }}
      >
        <div style={{ ...styleTuile, gridColumn: "1", gridRow: "1" }} />
        <div style={{ ...styleTuile, gridColumn: "2", gridRow: "1" }} />
        <div style={{ ...styleTuile, gridColumn: "3", gridRow: "1" }} />
        <div style={{ ...styleTuile, gridColumn: "4", gridRow: "1" }} />
        <div style={{ ...styleTuile, gridColumn: "1", gridRow: "2" }} />
        <div style={{ ...styleTuile, gridColumn: "2 / span 2", gridRow: "2" }} />
        <div style={{ ...styleTuile, gridColumn: "4", gridRow: "2" }} />
        <div style={{ ...styleTuile, gridColumn: "1 / span 4", gridRow: "3 / span 2" }} />
        <div style={{ ...styleTuile, gridColumn: "1", gridRow: "5" }} />
        <div style={{ ...styleTuile, gridColumn: "2", gridRow: "5" }} />
        <div style={{ ...styleTuile, gridColumn: "3", gridRow: "5" }} />
        <div style={{ ...styleTuile, gridColumn: "4", gridRow: "5" }} />
      </div>

      {/* Slot « userinput » — padding détaillé côté par côté, comme le contrat
          le publie : les quatre côtés citent des variables distinctes. */}
      <div
        style={{
          alignSelf: "stretch",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingLeft: tokenVar(DIMENSIONS.userinput.paddingLeft),
          paddingRight: tokenVar(DIMENSIONS.userinput.paddingRight),
          paddingTop: tokenVar(DIMENSIONS.userinput.paddingTop),
          paddingBottom: tokenVar(DIMENSIONS.userinput.paddingBottom),
          borderRadius: tokenVar(DIMENSIONS.userinput.radius),
          backgroundColor: tokenVar(feuille["userinput.background"]),
          borderColor: tokenVar(feuille["userinput.border"].color),
          borderStyle: "solid",
          borderWidth: tokenVar(feuille["userinput.border"].width),
          boxSizing: "border-box",
        }}
      >
        {/* Slot « button » : ce slot EST un Button. */}
        <Button {...firstActionProps} />

        {/* Slot « label » — calque « Tag », un conteneur de CE contrat. */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "flex-start",
            paddingLeft: tokenVar(DIMENSIONS.userinput.paddingXTag),
            paddingRight: tokenVar(DIMENSIONS.userinput.paddingXTag),
            paddingTop: tokenVar(DIMENSIONS.userinput.paddingYTag),
            paddingBottom: tokenVar(DIMENSIONS.userinput.paddingYTag),
            borderRadius: tokenVar(DIMENSIONS.userinput.radiusTag),
            backgroundColor: tokenVar(feuille["background-tag"]),
          }}
        >
          <span
            style={{
              ...styleDeTexte("label.small"),
              color: tokenVar(feuille["text-color-tag"]),
            }}
          >
            {tagContent}
          </span>
        </div>

        {/* Slot « button-2 ». */}
        <Button {...secondActionProps} />
      </div>

      {/* Slot « label-2 » — calque « TextColumns ». Trois colonnes, écrites
          telles que le contrat les publie. */}
      <div
        style={{
          alignSelf: "stretch",
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          gap: tokenVar(DIMENSIONS.textcolumns.gap),
        }}
      >
        <div style={styleColonne}>
          <span style={{ ...styleDeTexte("body.large"), alignSelf: "stretch", color: tokenVar(feuille.title) }}>
            {columns?.[0]?.title}
          </span>
          <span style={{ ...styleDeTexte("body.small"), alignSelf: "stretch", color: tokenVar(feuille.description) }}>
            {columns?.[0]?.description}
          </span>
          <span style={{ ...styleDeTexte("label.small"), alignSelf: "stretch", color: tokenVar(feuille.link) }}>
            {columns?.[0]?.link}
          </span>
        </div>
        <div style={styleColonne}>
          <span style={{ ...styleDeTexte("body.large"), alignSelf: "stretch", color: tokenVar(feuille.title) }}>
            {columns?.[1]?.title}
          </span>
          <span style={{ ...styleDeTexte("body.small"), alignSelf: "stretch", color: tokenVar(feuille.description) }}>
            {columns?.[1]?.description}
          </span>
          <span style={{ ...styleDeTexte("label.small"), alignSelf: "stretch", color: tokenVar(feuille.link) }}>
            {columns?.[1]?.link}
          </span>
        </div>
        <div style={styleColonne}>
          <span style={{ ...styleDeTexte("body.large"), alignSelf: "stretch", color: tokenVar(feuille.title) }}>
            {columns?.[2]?.title}
          </span>
          <span style={{ ...styleDeTexte("body.small"), alignSelf: "stretch", color: tokenVar(feuille.description) }}>
            {columns?.[2]?.description}
          </span>
          <span style={{ ...styleDeTexte("label.small"), alignSelf: "stretch", color: tokenVar(feuille.link) }}>
            {columns?.[2]?.link}
          </span>
        </div>
      </div>

      {/* Slot « divider » : une feuille graphique, avec sa hauteur tokenisée et
          sa borne de largeur. `bounds` ne remplace aucun autre champ. */}
      <div
        style={{
          alignSelf: "stretch",
          backgroundColor: tokenVar(feuille["divider.background"]),
          height: tokenVar(DIMENSIONS.divider.height),
          maxWidth: tokenVar(DIMENSIONS.divider.maxWidth),
        }}
      />

      {/* Slot « tilelinkswrap » : `wrap` est une propriété de flux, et `rowGap`
          un token à part entière — le contrat les publie tous les deux. */}
      <div
        style={{
          alignSelf: "stretch",
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "flex-start",
          alignItems: "center",
          columnGap: tokenVar(DIMENSIONS.tilelinkswrap.gapX),
          rowGap: tokenVar(DIMENSIONS.tilelinkswrap.gapY),
        }}
      >
        <TileLink {...tileLinks?.[0]} />
        <TileLink {...tileLinks?.[1]} />
        <TileLink {...tileLinks?.[2]} />
        <TileLink {...tileLinks?.[3]} />
        <TileLink {...tileLinks?.[4]} />
        <TileLink {...tileLinks?.[5]} />
        <TileLink {...tileLinks?.[6]} />
      </div>

      {/* Slot « scalewrap » : sa hauteur est tokenisée, ses six pas la
          remplissent (`alignSelf: stretch`) et se partagent la largeur
          (`flexGrow: 1`). Le contrat ne publie aucun `gap` ici. */}
      <div
        style={{
          alignSelf: "stretch",
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "flex-start",
          alignItems: "center",
          height: tokenVar(DIMENSIONS.scalewrap.height),
        }}
      >
        <div style={styleDuPas(feuille["scale-1"])} />
        <div style={styleDuPas(feuille["scale-2"])} />
        <div style={styleDuPas(feuille["scale-3"])} />
        <div style={styleDuPas(feuille["scale-4"])} />
        <div style={styleDuPas(feuille["scale-5"])} />
        <div style={styleDuPas(feuille["scale-6"])} />
      </div>
    </div>
  );
}
