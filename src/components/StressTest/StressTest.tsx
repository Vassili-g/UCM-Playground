import type { CSSProperties, HTMLAttributes } from "react";

import { tokenVar } from "../../tokens.ts";
import { Alert } from "../Alert";
import { Button } from "../Button";
import { TileLink } from "../TileLink";
import type { TileLinkIconName } from "../TileLink";
import type { StressTestVariant } from "../../generated/contracts/StressTest.ts";

export type { StressTestVariant };

/**
 * Une colonne du bloc « TextColumns » : titre, description et — pour
 * certaines colonnes seulement, cf. `variantViews[view].structure` — un
 * lien. Le contrat ne publie pas ces trois champs comme une prop de
 * StressTest (sa seule prop est `variant`) ; ce type sert uniquement à
 * typer les contenus figés lus dans `samples`.
 */
export interface StressTestColonne {
  titre: string;
  description: string;
  lien?: string;
}

interface StressTestContractProps {
  /** Prop `variant` du contrat. Défaut contrat : "info". */
  variant?: StressTestVariant;
}

export interface StressTestProps
  extends Omit<HTMLAttributes<HTMLDivElement>, keyof StressTestContractProps>,
    StressTestContractProps {}

/* ------------------------------------------------------------------ */
/* Text styles — variantViews[*].typography × textStyles              */
/* ------------------------------------------------------------------ */

const textStyle = (
  fontFamily: string,
  fontSize: string,
  fontWeight: string,
  lineHeight: string,
  letterSpacing: string,
): CSSProperties => ({
  fontFamily: tokenVar(fontFamily),
  fontSize: tokenVar(fontSize),
  fontWeight: tokenVar(fontWeight) as unknown as CSSProperties["fontWeight"],
  lineHeight: tokenVar(lineHeight),
  letterSpacing: tokenVar(letterSpacing),
});

const TEXT_STYLES = {
  "title.medium": textStyle(
    "{primitives.fontfamily.base}",
    "{typography.title.medium.fontsize}",
    "{typography.title.medium.fontweight}",
    "{typography.title.medium.lineheight}",
    "{typography.title.medium.letterspacing}",
  ),
  "body.medium": textStyle(
    "{primitives.fontfamily.base}",
    "{typography.body.medium.fontsize}",
    "{typography.body.medium.fontweight}",
    "{typography.body.medium.lineheight}",
    "{typography.body.medium.letterspacing}",
  ),
  "label.small": textStyle(
    "{primitives.fontfamily.base}",
    "{typography.label.small.fontsize}",
    "{typography.label.small.fontweight}",
    "{typography.label.small.lineheight}",
    "{typography.label.small.letterspacing}",
  ),
  "body.large": textStyle(
    "{primitives.fontfamily.base}",
    "{typography.body.large.fontsize}",
    "{typography.body.large.fontweight}",
    "{typography.body.large.lineheight}",
    "{typography.body.large.letterspacing}",
  ),
  "body.small": textStyle(
    "{primitives.fontfamily.base}",
    "{typography.body.small.fontsize}",
    "{typography.body.small.fontweight}",
    "{typography.body.small.lineheight}",
    "{typography.body.small.letterspacing}",
  ),
} as const;

/* ------------------------------------------------------------------ */
/* Root container — structure (identique dans les deux vues)          */
/* ------------------------------------------------------------------ */

const ROOT_STYLE: CSSProperties = {
  alignItems: "center",
  borderRadius: tokenVar("{components.stresstest.info.base.sizes.border-radius}"),
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  gap: tokenVar("{components.stresstest.info.base.sizes.gap}"),
  height: "fit-content",
  justifyContent: "center",
  maxWidth: tokenVar("{components.stresstest.info.base.sizes.max-width}"),
  padding: `${tokenVar("{components.stresstest.info.base.sizes.padding}")} ${tokenVar("{components.stresstest.info.base.sizes.padding}")}`,
  width: "fit-content",
};

/** `strokes.base.border`, commun aux deux variants (align: "inside"). */
const ROOT_BORDER_SHADOW = `inset 0 0 0 ${tokenVar("{components.stresstest.info.base.sizes.border-width}")} ${tokenVar("{components.stresstest.info.base.colors.border}")}`;

/* ------------------------------------------------------------------ */
/* Head — slot "label" (figmaLayer "Head")                            */
/* ------------------------------------------------------------------ */

const HEAD_STYLE: CSSProperties = {
  alignItems: "flex-start",
  alignSelf: "stretch",
  display: "flex",
  flexDirection: "column",
  gap: tokenVar("{components.stresstest.info.head.sizes.gap}"),
  justifyContent: "flex-start",
};

const HEAD_TEXT_COLOR = tokenVar("{components.stresstest.info.head.colors.text}");

function Head({ titre, description }: { titre: string; description: string }) {
  return (
    <div style={HEAD_STYLE}>
      <div style={{ ...TEXT_STYLES["title.medium"], color: HEAD_TEXT_COLOR }}>{titre}</div>
      <div
        style={{
          ...TEXT_STYLES["body.medium"],
          alignSelf: "stretch",
          color: HEAD_TEXT_COLOR,
        }}
      >
        {description}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* TilesGrid — slot "tilesgrid"                                       */
/* ------------------------------------------------------------------ */

interface TileCell {
  slot: string;
  columnStart: number;
  rowStart: number;
  columnSpan?: number;
  rowSpan?: number;
  /**
   * `structuralSize.height` : exception grille — la piste qui « hug »
   * publie sa taille résolue en pixels, pas en token (cf. warnings du
   * contrat). Valeur conservée telle quelle.
   */
  heightPx?: string;
}

const TILESGRID_RADIUS = tokenVar("{components.stresstest.info.tilesgrid.sizes.radius}");

const TILESGRID_COLUMN_GAP = tokenVar("{components.stresstest.info.tilesgrid.sizes.gap-col}");
const TILESGRID_ROW_GAP = tokenVar("{components.stresstest.info.tilesgrid.sizes.gap-rows}");

function TilesGrid({
  tiles,
  rowSizes,
  tileToken,
}: {
  tiles: TileCell[];
  rowSizes: string;
  tileToken: string;
}) {
  return (
    <div
      style={{
        alignSelf: "stretch",
        columnGap: TILESGRID_COLUMN_GAP,
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr 1fr",
        gridTemplateRows: rowSizes,
        rowGap: TILESGRID_ROW_GAP,
      }}
    >
      {tiles.map((tile) => (
        <div
          key={tile.slot}
          style={{
            backgroundColor: tileToken,
            borderRadius: TILESGRID_RADIUS,
            gridColumn: `${tile.columnStart} / span ${tile.columnSpan ?? 1}`,
            gridRow: `${tile.rowStart} / span ${tile.rowSpan ?? 1}`,
            height: tile.heightPx,
          }}
        />
      ))}
    </div>
  );
}

const TILESGRID_V1_ROW_SIZES = "15px fit-content(100%) fit-content(100%) fit-content(100%) fit-content(100%)";
const TILESGRID_V1_TILES: TileCell[] = [
  { slot: "tile", columnStart: 1, rowStart: 1 },
  { slot: "tile-2", columnStart: 2, rowStart: 1 },
  { slot: "tile-3", columnStart: 3, rowStart: 1 },
  { slot: "tile-4", columnStart: 4, rowStart: 1 },
  { slot: "tile-5", columnStart: 1, rowStart: 2, heightPx: "15px" },
  { slot: "tile-6", columnStart: 2, rowStart: 2, columnSpan: 2, heightPx: "15px" },
  { slot: "tile-7", columnStart: 4, rowStart: 2, heightPx: "15px" },
  { slot: "tile-8", columnStart: 1, rowStart: 3, columnSpan: 4, rowSpan: 2, heightPx: "40px" },
  { slot: "tile-9", columnStart: 1, rowStart: 5, heightPx: "15px" },
  { slot: "tile-10", columnStart: 2, rowStart: 5, heightPx: "15px" },
  { slot: "tile-11", columnStart: 3, rowStart: 5, heightPx: "15px" },
  { slot: "tile-12", columnStart: 4, rowStart: 5, heightPx: "15px" },
];

const TILESGRID_V2_ROW_SIZES = "15px 15px 15px fit-content(100%) fit-content(100%)";
const TILESGRID_V2_TILES: TileCell[] = [
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
  { slot: "tile-11", columnStart: 1, rowStart: 4, heightPx: "15px" },
  { slot: "tile-12", columnStart: 2, rowStart: 4, heightPx: "15px" },
  { slot: "tile-13", columnStart: 3, rowStart: 4, columnSpan: 2, heightPx: "15px" },
  { slot: "tile-14", columnStart: 1, rowStart: 5, heightPx: "15px" },
  { slot: "tile-15", columnStart: 2, rowStart: 5, heightPx: "15px" },
  { slot: "tile-16", columnStart: 3, rowStart: 5, heightPx: "15px" },
  { slot: "tile-17", columnStart: 4, rowStart: 5, heightPx: "15px" },
];

/* ------------------------------------------------------------------ */
/* UserInput — slot "userinput" (v1 uniquement)                       */
/* ------------------------------------------------------------------ */

const USERINPUT_STYLE: CSSProperties = {
  alignItems: "center",
  alignSelf: "stretch",
  backgroundColor: tokenVar("{components.stresstest.info.userinput.colors.background}"),
  borderRadius: tokenVar("{components.stresstest.info.userinput.sizes.border-radius}"),
  boxShadow: `inset 0 0 0 ${tokenVar("{components.stresstest.info.userinput.sizes.border-width}")} ${tokenVar("{components.stresstest.info.userinput.colors.border}")}`,
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  paddingBottom: tokenVar("{components.stresstest.info.userinput.sizes.padding-bottom}"),
  paddingLeft: tokenVar("{components.stresstest.info.userinput.sizes.padding-left}"),
  paddingRight: tokenVar("{components.stresstest.info.userinput.sizes.padding-right}"),
  paddingTop: tokenVar("{components.stresstest.info.userinput.sizes.padding-top}"),
};

const TAG_STYLE: CSSProperties = {
  alignItems: "flex-start",
  backgroundColor: tokenVar("{components.stresstest.info.userinput.colors.background-tag}"),
  borderRadius: tokenVar("{components.stresstest.info.userinput.sizes.border-radius-tag}"),
  display: "flex",
  flexDirection: "row",
  justifyContent: "flex-start",
  padding: `${tokenVar("{components.stresstest.info.userinput.sizes.padding-y-tag}")} ${tokenVar("{components.stresstest.info.userinput.sizes.padding-x-tag}")}`,
};

const TAG_TEXT_COLOR = tokenVar("{components.stresstest.info.userinput.colors.text-color-tag}");

function UserInput() {
  return (
    <div style={USERINPUT_STYLE}>
      {/*
       * Button.iconLeft / Button.iconRight / Button.label et le nom de
       * prop transportant le texte affiché ne sont pas vérifiables sans
       * lire Button.tsx (interdit). Seuls color/variant/size sont
       * garantis par le fichier généré. Voir le rapport final.
       */}
      <Button color="success" variant="contained" size="medium">
        Accepter
      </Button>
      <div style={TAG_STYLE}>
        <div style={{ ...TEXT_STYLES["label.small"], color: TAG_TEXT_COLOR }}>ou</div>
      </div>
      <Button color="error" variant="contained" size="medium">
        Refuser
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* TextColumns — slot "label-2" (figmaLayer "TextColumns")            */
/* ------------------------------------------------------------------ */

const TEXTCOLUMNS_STYLE: CSSProperties = {
  alignItems: "flex-start",
  alignSelf: "stretch",
  display: "flex",
  flexDirection: "row",
  gap: tokenVar("{components.stresstest.info.textcolumns.sizes.gap}"),
  justifyContent: "flex-start",
};

const COL_STYLE: CSSProperties = {
  alignItems: "flex-start",
  display: "flex",
  flex: "1 1 0%",
  flexDirection: "column",
  gap: tokenVar("{components.stresstest.info.textcolumns.sizes.gap-col}"),
  justifyContent: "center",
};

const TITLE_COLOR = tokenVar("{components.stresstest.info.textcolumns.colors.title}");
const DESCRIPTION_COLOR = tokenVar("{components.stresstest.info.textcolumns.colors.description}");
const LINK_COLOR = tokenVar("{components.stresstest.info.textcolumns.colors.link}");

function Col({
  colonne,
  descriptionStyle,
}: {
  colonne: StressTestColonne;
  descriptionStyle: CSSProperties;
}) {
  return (
    <div style={COL_STYLE}>
      <div style={{ ...TEXT_STYLES["body.large"], alignSelf: "stretch", color: TITLE_COLOR }}>
        {colonne.titre}
      </div>
      <div style={{ ...descriptionStyle, alignSelf: "stretch", color: DESCRIPTION_COLOR }}>
        {colonne.description}
      </div>
      {colonne.lien !== undefined && (
        <div style={{ ...TEXT_STYLES["label.small"], alignSelf: "stretch", color: LINK_COLOR }}>
          {colonne.lien}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Divider — slot "divider" / "divider-2"                             */
/* ------------------------------------------------------------------ */

function Divider() {
  return (
    <div
      style={{
        alignSelf: "center",
        backgroundColor: tokenVar("{components.stresstest.info.divider.colors.background}"),
        height: tokenVar("{components.stresstest.info.divider.sizes.height}"),
        maxWidth: tokenVar("{components.stresstest.info.divider.sizes.max-width}"),
        width: "100%",
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* TileLinksWrap — slot "tilelinkswrap" : 7 TileLink composés          */
/* ------------------------------------------------------------------ */

const TILELINKSWRAP_STYLE: CSSProperties = {
  alignItems: "center",
  alignSelf: "stretch",
  columnGap: tokenVar("{components.stresstest.info.tilelinkswrap.sizes.gap-x}"),
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "flex-start",
  rowGap: tokenVar("{components.stresstest.info.tilelinkswrap.sizes.gap-y}"),
};

interface TileLinkEntry {
  variant: "info" | "success";
  /**
   * `composes[].swaps` pour ce TileLink. Absent = le TileLink garde son
   * icône « chess » par défaut (aucun swap déclaré dans l'échantillon).
   */
  chessName?: string;
}

function TileLinksWrap({ entries }: { entries: TileLinkEntry[] }) {
  return (
    <div style={TILELINKSWRAP_STYLE}>
      {entries.map((entry, index) => (
        <TileLink
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          variant={entry.variant}
          chessName={entry.chessName as TileLinkIconName | undefined}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ScaleWrap — slot "scalewrap" : 6 steps                             */
/* ------------------------------------------------------------------ */

const SCALEWRAP_STYLE_BASE: CSSProperties = {
  alignItems: "center",
  alignSelf: "stretch",
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  height: tokenVar("{components.stresstest.info.scalewrap.sizes.height}"),
  justifyContent: "flex-start",
};

const STEP_BASE: CSSProperties = {
  alignSelf: "stretch",
  flex: "1 1 0%",
};

const STEP_FIRST_RADIUS: CSSProperties = {
  borderBottomLeftRadius: tokenVar("{components.stresstest.info.scalewrap.sizes.radius-bottom-left}"),
  borderTopLeftRadius: tokenVar("{components.stresstest.info.scalewrap.sizes.radius-top-left}"),
};

const STEP_LAST_RADIUS: CSSProperties = {
  borderBottomRightRadius: tokenVar("{components.stresstest.info.scalewrap.sizes.radius-bottom-right}"),
  borderTopRightRadius: tokenVar("{components.stresstest.info.scalewrap.sizes.radius-top-right}"),
};

function ScaleWrap({ scaleTokens }: { scaleTokens: string[] }) {
  return (
    <div style={SCALEWRAP_STYLE_BASE}>
      {scaleTokens.map((token, index) => (
        <div
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          style={{
            ...STEP_BASE,
            ...(index === 0 ? STEP_FIRST_RADIUS : null),
            ...(index === scaleTokens.length - 1 ? STEP_LAST_RADIUS : null),
            backgroundColor: token,
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ActionsWrap — slot "actionswrap" (v2 uniquement) : 3 Button         */
/* ------------------------------------------------------------------ */

const ACTIONSWRAP_STYLE: CSSProperties = {
  alignItems: "center",
  alignSelf: "stretch",
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
};

function ActionsWrap() {
  return (
    <div style={ACTIONSWRAP_STYLE}>
      <Button color="secondary" variant="text" size="medium">
        Retour
      </Button>
      <Button color="success" variant="text" size="medium">
        Poursuivre
      </Button>
      <Button color="info" variant="outlined" size="medium">
        Poursuivre
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Vue "info" — variantViews.v1 / sample s1                           */
/* ------------------------------------------------------------------ */

const INFO_TILE_TOKEN = tokenVar("{components.stresstest.info.tilesgrid.colors.tile}");
const INFO_SCALE_TOKENS = [1, 2, 3, 4, 5, 6].map((n) =>
  tokenVar(`{components.stresstest.info.scalewrap.colors.scale-${n}}`),
);

const INFO_COLS: StressTestColonne[] = [
  {
    titre: "Point 1",
    description: "Ce qui est important de faire pour le point 1 c’est de suivre impérativement les règles du point 1",
    lien: "Lien vers ressource 1",
  },
  {
    titre: "Point 2",
    description: "Ce qui est important de faire pour le point 2 c’est de suivre impérativement les règles du point 2",
    lien: "Lien vers ressource 2",
  },
  {
    titre: "Point 3",
    description: "Ce qui est important de faire pour le point 3 c’est de suivre impérativement les règles du point 3",
    lien: "Lien vers ressource 3",
  },
];

const INFO_TILELINKS: TileLinkEntry[] = [
  { variant: "info" },
  { variant: "info", chessName: "circle-9" },
  { variant: "info", chessName: "duck" },
  { variant: "info", chessName: "oil-temperature" },
  { variant: "info", chessName: "fence" },
  { variant: "info", chessName: "wheat" },
  { variant: "info", chessName: "candle-holder" },
];

function InfoView() {
  return (
    <>
      <Head
        titre="Titre"
        description="Description de l’élément sur quelques lignes, idéalement deux au maximum."
      />

      {/*
       * severity/variant garantis par Alert.ts généré ; action/title/icon
       * ne sont pas vérifiables sans lire le contrat d'Alert (interdit
       * ici) — non transmis, cf. rapport final.
       */}
      <Alert severity="info" variant="standard" style={{ alignSelf: "stretch" }} />

      <TilesGrid tiles={TILESGRID_V1_TILES} rowSizes={TILESGRID_V1_ROW_SIZES} tileToken={INFO_TILE_TOKEN} />

      <UserInput />

      <div style={TEXTCOLUMNS_STYLE}>
        {INFO_COLS.map((colonne) => (
          <Col key={colonne.titre} colonne={colonne} descriptionStyle={TEXT_STYLES["body.small"]} />
        ))}
      </div>

      <Divider />

      <TileLinksWrap entries={INFO_TILELINKS} />

      <ScaleWrap scaleTokens={INFO_SCALE_TOKENS} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Vue "success" — variantViews.v2 / sample s2                        */
/* ------------------------------------------------------------------ */

const SUCCESS_TILE_TOKEN = tokenVar("{components.stresstest.success.tilesgrid.colors.tile}");
const SUCCESS_SCALE_TOKENS = [1, 2, 3, 4, 5, 6].map((n) =>
  tokenVar(`{components.stresstest.success.scalewrap.colors.scale-${n}}`),
);

const SUCCESS_COLS: StressTestColonne[] = [
  {
    titre: "Point 1",
    description: "Ce qui est important de faire pour le point 1 c’est de suivre impérativement les règles du point 1",
  },
  {
    titre: "Point 2",
    description: "Ce qui est important de faire pour le point 2 c’est de suivre impérativement les règles du point 2",
    lien: "Lien vers ressource 2",
  },
];

const SUCCESS_TILELINKS: TileLinkEntry[] = [
  { variant: "success", chessName: "chess-king-piece" },
  { variant: "info", chessName: "circle-arrow-up" },
  { variant: "info", chessName: "dumbbell" },
  { variant: "info", chessName: "oil-can-drip" },
  { variant: "info", chessName: "ferris-wheel" },
  { variant: "info", chessName: "whale" },
  { variant: "success", chessName: "candy" },
];

function SuccessView() {
  return (
    <>
      <Head
        titre="Titre"
        description="Description de l’élément sur quelques lignes, idéalement deux au maximum."
      />

      <Alert severity="success" variant="outlined" style={{ alignSelf: "stretch" }} />

      <TilesGrid tiles={TILESGRID_V2_TILES} rowSizes={TILESGRID_V2_ROW_SIZES} tileToken={SUCCESS_TILE_TOKEN} />

      <div style={TEXTCOLUMNS_STYLE}>
        <Col colonne={SUCCESS_COLS[0]} descriptionStyle={TEXT_STYLES["body.medium"]} />
        <Col colonne={SUCCESS_COLS[1]} descriptionStyle={TEXT_STYLES["body.small"]} />
      </div>

      <Divider />

      <TileLinksWrap entries={SUCCESS_TILELINKS} />

      <Divider />

      <ScaleWrap scaleTokens={SUCCESS_SCALE_TOKENS} />

      <ActionsWrap />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Composant                                                           */
/* ------------------------------------------------------------------ */

export function StressTest({ variant = "info", style, ...rest }: StressTestProps) {
  return (
    <div style={{ ...ROOT_STYLE, ...style, boxShadow: ROOT_BORDER_SHADOW }} {...rest}>
      {variant === "success" ? <SuccessView /> : <InfoView />}
    </div>
  );
}
