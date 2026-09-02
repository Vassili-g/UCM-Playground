/**
 * Transcription statique de StressTest.contract.json (v10.3) — ne lit ni
 * n'interprète le JSON au runtime. Voir src/components/StressTest/StressTest.contract.json.
 *
 * `structure` (la projection générale du contrat) reste la vue historique du
 * variant « Info » de référence : elle n'est pas la source pour « Success ».
 * Chaque variante transcrit ici sa propre `variantViews[…].structure`, sa
 * propre cardinalité de dépendances et son propre `samples[…]`, sans jamais
 * fusionner les deux vues (v1 ≠ v2 : nombre de tuiles, présence du bloc
 * « UserInput », nombre de boutons, textes).
 */
import type { CSSProperties, HTMLAttributes } from "react";

import type { StressTestVariant } from "../../generated/contracts/StressTest.ts";

export type { StressTestVariant };
import { tokenVar } from "../../tokens.ts";
import { Alert } from "../Alert/Alert.tsx";
import { Button } from "../Button/Button.tsx";
import { TileLink } from "../TileLink/TileLink.tsx";

/** `structure.sizes`/`structure` racine — communs aux deux vues. */
const ROOT_STYLE: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  width: "fit-content",
  height: "fit-content",
  maxWidth: tokenVar("{components.stresstest.info.base.sizes.max-width}"),
  justifyContent: "center",
  alignItems: "center",
  gap: tokenVar("{components.stresstest.info.base.sizes.gap}"),
  paddingLeft: tokenVar("{components.stresstest.info.base.sizes.padding}"),
  paddingRight: tokenVar("{components.stresstest.info.base.sizes.padding}"),
  paddingTop: tokenVar("{components.stresstest.info.base.sizes.padding}"),
  paddingBottom: tokenVar("{components.stresstest.info.base.sizes.padding}"),
  borderRadius: tokenVar("{components.stresstest.info.base.sizes.border-radius}"),
  alignSelf: "stretch",
};

/** `variants[].strokes["base.border"]` — identique sur les deux variantes. */
const BASE_BORDER_SHADOW = `inset 0 0 0 ${tokenVar("{components.stresstest.info.base.sizes.border-width}")} ${tokenVar("{components.stresstest.info.base.colors.border}")}`;

const TITLE_TEXT_STYLE: CSSProperties = {
  fontFamily: tokenVar("{primitives.fontfamily.base}"),
  fontSize: tokenVar("{typography.title.medium.fontsize}"),
  fontWeight: tokenVar("{typography.title.medium.fontweight}") as unknown as CSSProperties["fontWeight"],
  lineHeight: tokenVar("{typography.title.medium.lineheight}"),
  letterSpacing: tokenVar("{typography.title.medium.letterspacing}"),
};

const HEAD_DESCRIPTION_TEXT_STYLE: CSSProperties = {
  fontFamily: tokenVar("{primitives.fontfamily.base}"),
  fontSize: tokenVar("{typography.body.medium.fontsize}"),
  fontWeight: tokenVar("{typography.body.medium.fontweight}") as unknown as CSSProperties["fontWeight"],
  lineHeight: tokenVar("{typography.body.medium.lineheight}"),
  letterSpacing: tokenVar("{typography.body.medium.letterspacing}"),
};

const TAG_TEXT_STYLE: CSSProperties = {
  fontFamily: tokenVar("{primitives.fontfamily.base}"),
  fontSize: tokenVar("{typography.label.small.fontsize}"),
  fontWeight: tokenVar("{typography.label.small.fontweight}") as unknown as CSSProperties["fontWeight"],
  lineHeight: tokenVar("{typography.label.small.lineheight}"),
  letterSpacing: tokenVar("{typography.label.small.letterspacing}"),
};

const COL_TITLE_TEXT_STYLE: CSSProperties = {
  fontFamily: tokenVar("{primitives.fontfamily.base}"),
  fontSize: tokenVar("{typography.body.large.fontsize}"),
  fontWeight: tokenVar("{typography.body.large.fontweight}") as unknown as CSSProperties["fontWeight"],
  lineHeight: tokenVar("{typography.body.large.lineheight}"),
  letterSpacing: tokenVar("{typography.body.large.letterspacing}"),
};

const COL_LINK_TEXT_STYLE: CSSProperties = {
  fontFamily: tokenVar("{primitives.fontfamily.base}"),
  fontSize: tokenVar("{typography.label.small.fontsize}"),
  fontWeight: tokenVar("{typography.label.small.fontweight}") as unknown as CSSProperties["fontWeight"],
  lineHeight: tokenVar("{typography.label.small.lineheight}"),
  letterSpacing: tokenVar("{typography.label.small.letterspacing}"),
};

/** `body.small` (description de colonne en v1) et `body.medium` (description
 * de colonne 1 en v2) : deux références distinctes de `textStyles`. */
const COL_DESCRIPTION_SMALL_TEXT_STYLE: CSSProperties = {
  fontFamily: tokenVar("{primitives.fontfamily.base}"),
  fontSize: tokenVar("{typography.body.small.fontsize}"),
  fontWeight: tokenVar("{typography.body.small.fontweight}") as unknown as CSSProperties["fontWeight"],
  lineHeight: tokenVar("{typography.body.small.lineheight}"),
  letterSpacing: tokenVar("{typography.body.small.letterspacing}"),
};

const COL_DESCRIPTION_MEDIUM_TEXT_STYLE: CSSProperties = {
  fontFamily: tokenVar("{primitives.fontfamily.base}"),
  fontSize: tokenVar("{typography.body.medium.fontsize}"),
  fontWeight: tokenVar("{typography.body.medium.fontweight}") as unknown as CSSProperties["fontWeight"],
  lineHeight: tokenVar("{typography.body.medium.lineheight}"),
  letterSpacing: tokenVar("{typography.body.medium.letterspacing}"),
};

/** `variantViews.v1.structure.children[label]` (« Head »). */
const HEAD_STYLE: CSSProperties = {
  alignSelf: "stretch",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
  alignItems: "flex-start",
  gap: tokenVar("{components.stresstest.info.head.sizes.gap}"),
};

/** `variantViews[…].structure.children[tilesgrid]` — 4 colonnes `1fr`,
 * pistes de ligne littérales publiées par le contrat (dont des pistes FIXED
 * en pixels bruts, cf. diagnostics `UCM_EXPORT_INFO`). */
function tilesGridStyle(rowSizes: string[]): CSSProperties {
  return {
    alignSelf: "stretch",
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1fr",
    gridTemplateRows: rowSizes.join(" "),
    columnGap: tokenVar("{components.stresstest.info.tilesgrid.sizes.gap-col}"),
    rowGap: tokenVar("{components.stresstest.info.tilesgrid.sizes.gap-rows}"),
  };
}

interface TileSpec {
  column: number;
  row: number;
  columnSpan?: number;
  rowSpan?: number;
  /** `structuralSize.height` — publiée en pixels bruts sous une piste HUG. */
  height?: string;
}

function tileStyle(spec: TileSpec, tileColor: string): CSSProperties {
  return {
    gridColumn: `${spec.column} / span ${spec.columnSpan ?? 1}`,
    gridRow: `${spec.row} / span ${spec.rowSpan ?? 1}`,
    borderRadius: tokenVar("{components.stresstest.info.tilesgrid.sizes.radius}"),
    backgroundColor: tileColor,
    ...(spec.height ? { height: spec.height } : {}),
  };
}

/** `variantViews.v1.structure.children[tilesgrid].children` — 12 tuiles. */
const V1_TILES: TileSpec[] = [
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

/** `variantViews.v2.structure.children[tilesgrid].children` — 17 tuiles. */
const V2_TILES: TileSpec[] = [
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

/** `variantViews.v1.structure.children[userinput]`. */
const USER_INPUT_STYLE: CSSProperties = {
  alignSelf: "stretch",
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  borderRadius: tokenVar("{components.stresstest.info.userinput.sizes.border-radius}"),
  paddingLeft: tokenVar("{components.stresstest.info.userinput.sizes.padding-left}"),
  paddingRight: tokenVar("{components.stresstest.info.userinput.sizes.padding-right}"),
  paddingTop: tokenVar("{components.stresstest.info.userinput.sizes.padding-top}"),
  paddingBottom: tokenVar("{components.stresstest.info.userinput.sizes.padding-bottom}"),
  backgroundColor: tokenVar("{components.stresstest.info.userinput.colors.background}"),
  boxShadow: `inset 0 0 0 ${tokenVar("{components.stresstest.info.userinput.sizes.border-width}")} ${tokenVar("{components.stresstest.info.userinput.colors.border}")}`,
};

const TAG_STYLE: CSSProperties = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "flex-start",
  alignItems: "flex-start",
  borderRadius: tokenVar("{components.stresstest.info.userinput.sizes.border-radius-tag}"),
  paddingLeft: tokenVar("{components.stresstest.info.userinput.sizes.padding-x-tag}"),
  paddingRight: tokenVar("{components.stresstest.info.userinput.sizes.padding-x-tag}"),
  paddingTop: tokenVar("{components.stresstest.info.userinput.sizes.padding-y-tag}"),
  paddingBottom: tokenVar("{components.stresstest.info.userinput.sizes.padding-y-tag}"),
  backgroundColor: tokenVar("{components.stresstest.info.userinput.colors.background-tag}"),
};

/** `variantViews[…].structure.children[label-2]` (« TextColumns »). */
const TEXT_COLUMNS_STYLE: CSSProperties = {
  alignSelf: "stretch",
  display: "flex",
  flexDirection: "row",
  justifyContent: "flex-start",
  alignItems: "flex-start",
  gap: tokenVar("{components.stresstest.info.textcolumns.sizes.gap}"),
};

const COLUMN_STYLE: CSSProperties = {
  flexGrow: 1,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "flex-start",
  gap: tokenVar("{components.stresstest.info.textcolumns.sizes.gap-col}"),
};

function dividerStyle(): CSSProperties {
  return {
    alignSelf: "stretch",
    height: tokenVar("{components.stresstest.info.divider.sizes.height}"),
    maxWidth: tokenVar("{components.stresstest.info.divider.sizes.max-width}"),
    backgroundColor: tokenVar("{components.stresstest.info.divider.colors.background}"),
  };
}

/** `variantViews[…].structure.children[tilelinkswrap]`. */
const TILE_LINKS_WRAP_STYLE: CSSProperties = {
  alignSelf: "stretch",
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "flex-start",
  alignItems: "center",
  columnGap: tokenVar("{components.stresstest.info.tilelinkswrap.sizes.gap-x}"),
  rowGap: tokenVar("{components.stresstest.info.tilelinkswrap.sizes.gap-y}"),
};

/** `variantViews[…].structure.children[scalewrap]`. */
function scaleWrapStyle(): CSSProperties {
  return {
    alignSelf: "stretch",
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    alignItems: "center",
    height: tokenVar("{components.stresstest.info.scalewrap.sizes.height}"),
  };
}

const SCALE_STEP_FIRST_RADIUS: CSSProperties = {
  borderTopLeftRadius: tokenVar("{components.stresstest.info.scalewrap.sizes.radius-top-left}"),
  borderBottomLeftRadius: tokenVar("{components.stresstest.info.scalewrap.sizes.radius-bottom-left}"),
};

const SCALE_STEP_LAST_RADIUS: CSSProperties = {
  borderTopRightRadius: tokenVar("{components.stresstest.info.scalewrap.sizes.radius-top-right}"),
  borderBottomRightRadius: tokenVar("{components.stresstest.info.scalewrap.sizes.radius-bottom-right}"),
};

function scaleStepStyle(color: string, cornerStyle?: CSSProperties): CSSProperties {
  return {
    alignSelf: "stretch",
    flexGrow: 1,
    backgroundColor: color,
    ...cornerStyle,
  };
}

/** `variantViews.v2.structure.children[actionswrap]`. */
const ACTIONS_WRAP_STYLE: CSSProperties = {
  alignSelf: "stretch",
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
};

interface StressTestContractProps {
  variant?: StressTestVariant;
}

export interface StressTestProps
  extends Omit<HTMLAttributes<HTMLDivElement>, keyof StressTestContractProps>,
    StressTestContractProps {}

export function StressTest({
  variant = "info",
  style,
  ...rest
}: StressTestProps) {
  const rootStyle: CSSProperties = {
    ...ROOT_STYLE,
    boxShadow: BASE_BORDER_SHADOW,
    ...style,
  };

  /**
   * `variants[0]` (« info » → `variantViews.v1`, `samples.s1`).
   * Structure, tokens, strokes et cardinalité de dépendances propres à cette
   * vue : Head, Alert, TilesGrid (12 tuiles), UserInput (2 boutons + Tag),
   * TextColumns (3 colonnes avec lien), Divider, TileLinksWrap (7 TileLink),
   * ScaleWrap (6 marches).
   *
   * Déclarée à l'intérieur de `StressTest` (et non au niveau module) : la
   * parité contrat ↔ code (`scripts/parite.mjs`) relève les dépendances
   * composées uniquement parmi les descendants AST du corps de la fonction
   * exportée — une fonction sœur au niveau module ne serait jamais visitée.
   */
  function renderStressTestInfo() {
  const tileColor = tokenVar("{components.stresstest.info.tilesgrid.colors.tile}");
  const scaleColors = [
    tokenVar("{components.stresstest.info.scalewrap.colors.scale-1}"),
    tokenVar("{components.stresstest.info.scalewrap.colors.scale-2}"),
    tokenVar("{components.stresstest.info.scalewrap.colors.scale-3}"),
    tokenVar("{components.stresstest.info.scalewrap.colors.scale-4}"),
    tokenVar("{components.stresstest.info.scalewrap.colors.scale-5}"),
    tokenVar("{components.stresstest.info.scalewrap.colors.scale-6}"),
  ];

  return (
    <>
      <div style={HEAD_STYLE}>
        <span style={{ ...TITLE_TEXT_STYLE, color: tokenVar("{components.stresstest.info.head.colors.text}") }}>
          Titre
        </span>
        <span
          style={{
            ...HEAD_DESCRIPTION_TEXT_STYLE,
            alignSelf: "stretch",
            color: tokenVar("{components.stresstest.info.head.colors.text}"),
          }}
        >
          Description de l’élément sur quelques lignes, idéalement deux au maximum.
        </span>
      </div>

      <Alert icon title action severity="info" variant="standard" style={{ alignSelf: "stretch" }} />

      <div style={tilesGridStyle(["15px", "fit-content(100%)", "fit-content(100%)", "fit-content(100%)", "fit-content(100%)"])}>
        {V1_TILES.map((spec, index) => (
          // eslint-disable-next-line react/no-array-index-key -- tuiles sans identité propre dans le contrat
          <div key={index} style={tileStyle(spec, tileColor)} />
        ))}
      </div>

      <div style={USER_INPUT_STYLE}>
        <Button
          color="success"
          variant="contained"
          size="medium"
          iconLeft
          iconRight={false}
          label
          iconLeftName="check"
        >
          Accepter
        </Button>
        <div style={TAG_STYLE}>
          <span
            style={{ ...TAG_TEXT_STYLE, color: tokenVar("{components.stresstest.info.userinput.colors.text-color-tag}") }}
          >
            ou
          </span>
        </div>
        <Button
          color="error"
          variant="contained"
          size="medium"
          iconLeft
          iconRight={false}
          label
          iconLeftName="xmark"
        >
          Refuser
        </Button>
      </div>

      <div style={TEXT_COLUMNS_STYLE}>
        <div style={COLUMN_STYLE}>
          <span style={{ ...COL_TITLE_TEXT_STYLE, alignSelf: "stretch", color: tokenVar("{components.stresstest.info.textcolumns.colors.title}") }}>
            Point 1
          </span>
          <span style={{ ...COL_DESCRIPTION_SMALL_TEXT_STYLE, alignSelf: "stretch", color: tokenVar("{components.stresstest.info.textcolumns.colors.description}") }}>
            Ce qui est important de faire pour le point 1 c’est de suivre impérativement les règles du point 1
          </span>
          <span style={{ ...COL_LINK_TEXT_STYLE, alignSelf: "stretch", color: tokenVar("{components.stresstest.info.textcolumns.colors.link}") }}>
            Lien vers ressource 1
          </span>
        </div>
        <div style={COLUMN_STYLE}>
          <span style={{ ...COL_TITLE_TEXT_STYLE, alignSelf: "stretch", color: tokenVar("{components.stresstest.info.textcolumns.colors.title}") }}>
            Point 2
          </span>
          <span style={{ ...COL_DESCRIPTION_SMALL_TEXT_STYLE, alignSelf: "stretch", color: tokenVar("{components.stresstest.info.textcolumns.colors.description}") }}>
            Ce qui est important de faire pour le point 2 c’est de suivre impérativement les règles du point 2
          </span>
          <span style={{ ...COL_LINK_TEXT_STYLE, alignSelf: "stretch", color: tokenVar("{components.stresstest.info.textcolumns.colors.link}") }}>
            Lien vers ressource 2
          </span>
        </div>
        <div style={COLUMN_STYLE}>
          <span style={{ ...COL_TITLE_TEXT_STYLE, alignSelf: "stretch", color: tokenVar("{components.stresstest.info.textcolumns.colors.title}") }}>
            Point 3
          </span>
          <span style={{ ...COL_DESCRIPTION_SMALL_TEXT_STYLE, alignSelf: "stretch", color: tokenVar("{components.stresstest.info.textcolumns.colors.description}") }}>
            Ce qui est important de faire pour le point 3 c’est de suivre impérativement les règles du point 3
          </span>
          <span style={{ ...COL_LINK_TEXT_STYLE, alignSelf: "stretch", color: tokenVar("{components.stresstest.info.textcolumns.colors.link}") }}>
            Lien vers ressource 3
          </span>
        </div>
      </div>

      <div style={dividerStyle()} />

      <div style={TILE_LINKS_WRAP_STYLE}>
        <TileLink variant="info" href="#" />
        <TileLink variant="info" href="#" chessName="circle-9" />
        <TileLink variant="info" href="#" chessName="duck" />
        <TileLink variant="info" href="#" chessName="oil-temperature" />
        <TileLink variant="info" href="#" chessName="fence" />
        <TileLink variant="info" href="#" chessName="wheat" />
        <TileLink variant="info" href="#" chessName="candle-holder" />
      </div>

      <div style={scaleWrapStyle()}>
        {scaleColors.map((color, index) => (
          <div
            // eslint-disable-next-line react/no-array-index-key -- marches sans identité propre dans le contrat
            key={index}
            style={scaleStepStyle(
              color,
              index === 0 ? SCALE_STEP_FIRST_RADIUS : index === scaleColors.length - 1 ? SCALE_STEP_LAST_RADIUS : undefined,
            )}
          />
        ))}
      </div>
    </>
  );
}

/**
 * `variants[1]` (« success » → `variantViews.v2`, `samples.s2`).
 * Structure, tokens et cardinalité propres à cette vue, différentes de
 * « info » : pas de bloc UserInput, TilesGrid à 17 tuiles, TextColumns à 2
 * colonnes (la première sans lien), 2 Divider, ScaleWrap puis ActionsWrap
 * (3 boutons).
 */
function renderStressTestSuccess() {
  const tileColor = tokenVar("{components.stresstest.success.tilesgrid.colors.tile}");
  const scaleColors = [
    tokenVar("{components.stresstest.success.scalewrap.colors.scale-1}"),
    tokenVar("{components.stresstest.success.scalewrap.colors.scale-2}"),
    tokenVar("{components.stresstest.success.scalewrap.colors.scale-3}"),
    tokenVar("{components.stresstest.success.scalewrap.colors.scale-4}"),
    tokenVar("{components.stresstest.success.scalewrap.colors.scale-5}"),
    tokenVar("{components.stresstest.success.scalewrap.colors.scale-6}"),
  ];

  return (
    <>
      <div style={HEAD_STYLE}>
        <span style={{ ...TITLE_TEXT_STYLE, color: tokenVar("{components.stresstest.info.head.colors.text}") }}>
          Titre
        </span>
        <span
          style={{
            ...HEAD_DESCRIPTION_TEXT_STYLE,
            alignSelf: "stretch",
            color: tokenVar("{components.stresstest.info.head.colors.text}"),
          }}
        >
          Description de l’élément sur quelques lignes, idéalement deux au maximum.
        </span>
      </div>

      <Alert icon title action severity="success" variant="outlined" style={{ alignSelf: "stretch" }} />

      <div style={tilesGridStyle(["15px", "15px", "15px", "fit-content(100%)", "fit-content(100%)"])}>
        {V2_TILES.map((spec, index) => (
          // eslint-disable-next-line react/no-array-index-key -- tuiles sans identité propre dans le contrat
          <div key={index} style={tileStyle(spec, tileColor)} />
        ))}
      </div>

      <div style={TEXT_COLUMNS_STYLE}>
        <div style={COLUMN_STYLE}>
          <span style={{ ...COL_TITLE_TEXT_STYLE, alignSelf: "stretch", color: tokenVar("{components.stresstest.info.textcolumns.colors.title}") }}>
            Point 1
          </span>
          <span style={{ ...COL_DESCRIPTION_MEDIUM_TEXT_STYLE, alignSelf: "stretch", color: tokenVar("{components.stresstest.info.textcolumns.colors.description}") }}>
            Ce qui est important de faire pour le point 1 c’est de suivre impérativement les règles du point 1
          </span>
        </div>
        <div style={COLUMN_STYLE}>
          <span style={{ ...COL_TITLE_TEXT_STYLE, alignSelf: "stretch", color: tokenVar("{components.stresstest.info.textcolumns.colors.title}") }}>
            Point 2
          </span>
          <span style={{ ...COL_DESCRIPTION_SMALL_TEXT_STYLE, alignSelf: "stretch", color: tokenVar("{components.stresstest.info.textcolumns.colors.description}") }}>
            Ce qui est important de faire pour le point 2 c’est de suivre impérativement les règles du point 2
          </span>
          <span style={{ ...COL_LINK_TEXT_STYLE, alignSelf: "stretch", color: tokenVar("{components.stresstest.info.textcolumns.colors.link}") }}>
            Lien vers ressource 2
          </span>
        </div>
      </div>

      <div style={dividerStyle()} />

      <div style={TILE_LINKS_WRAP_STYLE}>
        <TileLink variant="success" href="#" chessName="chess-king-piece" />
        <TileLink variant="info" href="#" chessName="circle-arrow-up" />
        <TileLink variant="info" href="#" chessName="dumbbell" />
        <TileLink variant="info" href="#" chessName="oil-can-drip" />
        <TileLink variant="info" href="#" chessName="ferris-wheel" />
        <TileLink variant="info" href="#" chessName="whale" />
        <TileLink variant="success" href="#" chessName="candy" />
      </div>

      <div style={dividerStyle()} />

      <div style={scaleWrapStyle()}>
        {scaleColors.map((color, index) => (
          <div
            // eslint-disable-next-line react/no-array-index-key -- marches sans identité propre dans le contrat
            key={index}
            style={scaleStepStyle(
              color,
              index === 0 ? SCALE_STEP_FIRST_RADIUS : index === scaleColors.length - 1 ? SCALE_STEP_LAST_RADIUS : undefined,
            )}
          />
        ))}
      </div>

      <div style={ACTIONS_WRAP_STYLE}>
        <Button color="secondary" variant="text" size="medium" iconLeft={false} iconRight={false} label>
          Retour
        </Button>
        <Button color="success" variant="text" size="medium" iconLeft iconRight={false} label={false} iconLeftName="ballot" />
        <Button color="info" variant="outlined" size="medium" iconLeft iconRight={false} label iconLeftName="arrow-right-long">
          Poursuivre
        </Button>
      </div>
    </>
  );
}

  return (
    <div style={rootStyle} {...rest}>
      {variant === "success" ? renderStressTestSuccess() : renderStressTestInfo()}
    </div>
  );
}
