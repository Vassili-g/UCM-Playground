import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

import { Alert } from "../Alert/Alert.tsx";
import type { AlertProps } from "../Alert/Alert.tsx";
import { Button } from "../Button/Button.tsx";
import { TileLink } from "../TileLink/TileLink.tsx";
import type { TileLinkProps } from "../TileLink/TileLink.tsx";
import { tokenVar } from "../../tokens.ts";
import type { StressTestVariant } from "../../generated/contracts/StressTest.ts";

export type { StressTestVariant };

interface StrokeLeaf {
  color: string;
  width: string;
  align: "inside" | "outside" | "center";
}

/**
 * `rendering.roles.*.kind === "stroke"` : un stroke se rend en `box-shadow`,
 * jamais en bordure CSS, pour ne pas pousser la mise en page (skill
 * « consommer-contrat », §3). `align` en donne la forme.
 */
function strokeBoxShadow(stroke: StrokeLeaf | undefined): string | undefined {
  if (!stroke) return undefined;
  const width = tokenVar(stroke.width);
  const color = tokenVar(stroke.color);
  if (stroke.align === "inside") return `inset 0 0 0 ${width} ${color}`;
  if (stroke.align === "outside") return `0 0 0 ${width} ${color}`;
  return `0 0 0 calc(${width} / 2) ${color}`;
}

interface TextStyleTokens {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing: string;
}

/** `textStyles[style].tokens`, recopiés en toutes lettres. */
const TITLE_MEDIUM: TextStyleTokens = {
  fontFamily: "{primitives.fontfamily.base}",
  fontSize: "{typography.title.medium.fontsize}",
  fontWeight: "{typography.title.medium.fontweight}",
  lineHeight: "{typography.title.medium.lineheight}",
  letterSpacing: "{typography.title.medium.letterspacing}",
};

const BODY_MEDIUM: TextStyleTokens = {
  fontFamily: "{primitives.fontfamily.base}",
  fontSize: "{typography.body.medium.fontsize}",
  fontWeight: "{typography.body.medium.fontweight}",
  lineHeight: "{typography.body.medium.lineheight}",
  letterSpacing: "{typography.body.medium.letterspacing}",
};

const BODY_LARGE: TextStyleTokens = {
  fontFamily: "{primitives.fontfamily.base}",
  fontSize: "{typography.body.large.fontsize}",
  fontWeight: "{typography.body.large.fontweight}",
  lineHeight: "{typography.body.large.lineheight}",
  letterSpacing: "{typography.body.large.letterspacing}",
};

const BODY_SMALL: TextStyleTokens = {
  fontFamily: "{primitives.fontfamily.base}",
  fontSize: "{typography.body.small.fontsize}",
  fontWeight: "{typography.body.small.fontweight}",
  lineHeight: "{typography.body.small.lineheight}",
  letterSpacing: "{typography.body.small.letterspacing}",
};

const LABEL_SMALL: TextStyleTokens = {
  fontFamily: "{primitives.fontfamily.base}",
  fontSize: "{typography.label.small.fontsize}",
  fontWeight: "{typography.label.small.fontweight}",
  lineHeight: "{typography.label.small.lineheight}",
  letterSpacing: "{typography.label.small.letterspacing}",
};

function textStyle(style: TextStyleTokens, color: string | undefined): CSSProperties {
  return {
    color,
    fontFamily: tokenVar(style.fontFamily),
    fontSize: tokenVar(style.fontSize),
    fontWeight: tokenVar(style.fontWeight),
    letterSpacing: tokenVar(style.letterSpacing),
    lineHeight: tokenVar(style.lineHeight),
  };
}

/** `structure` (racine, projection de référence — commune aux deux vues). */
const ROOT_MAX_WIDTH = "{components.stresstest.info.base.sizes.max-width}";
const ROOT_GAP = "{components.stresstest.info.base.sizes.gap}";
const ROOT_PADDING = "{components.stresstest.info.base.sizes.padding}";
const ROOT_RADIUS = "{components.stresstest.info.base.sizes.border-radius}";
const ROOT_BORDER: StrokeLeaf = {
  color: "{components.stresstest.info.base.colors.border}",
  width: "{components.stresstest.info.base.sizes.border-width}",
  align: "inside",
};

/** Slot `label` (Head) — `variantViews.v1/v2.structure.children[0]`. */
const HEAD_GAP = "{components.stresstest.info.head.sizes.gap}";
const HEAD_TEXT_COLOR = "{components.stresstest.info.head.colors.text}";

/** Slot `tilesgrid` — communs aux deux vues. */
const TILESGRID_COLUMN_GAP = "{components.stresstest.info.tilesgrid.sizes.gap-col}";
const TILESGRID_ROW_GAP = "{components.stresstest.info.tilesgrid.sizes.gap-rows}";
const TILESGRID_RADIUS = "{components.stresstest.info.tilesgrid.sizes.radius}";
const TILE_COLOR_INFO = "{components.stresstest.info.tilesgrid.colors.tile}";
const TILE_COLOR_SUCCESS = "{components.stresstest.success.tilesgrid.colors.tile}";

interface GridTile {
  slot: string;
  columnStart: number;
  rowStart: number;
  columnSpan?: number;
  rowSpan?: number;
  /**
   * `structuralSize.height` : exception structurelle propre aux grilles
   * (skill « consommer-contrat », §5) — une mesure en pixels, jamais un
   * token, portée par l'enfant d'une piste qui hug.
   */
  structuralHeight?: string;
}

/** `variantViews.v1.structure.children[tilesgrid]`. */
const V1_COLUMN_SIZES = ["1fr", "1fr", "1fr", "1fr"];
const V1_ROW_SIZES = ["15px", "fit-content(100%)", "fit-content(100%)", "fit-content(100%)", "fit-content(100%)"];
const V1_TILES: GridTile[] = [
  { slot: "tile", columnStart: 1, rowStart: 1 },
  { slot: "tile-2", columnStart: 2, rowStart: 1 },
  { slot: "tile-3", columnStart: 3, rowStart: 1 },
  { slot: "tile-4", columnStart: 4, rowStart: 1 },
  { slot: "tile-5", columnStart: 1, rowStart: 2, structuralHeight: "15px" },
  { slot: "tile-6", columnStart: 2, rowStart: 2, columnSpan: 2, structuralHeight: "15px" },
  { slot: "tile-7", columnStart: 4, rowStart: 2, structuralHeight: "15px" },
  { slot: "tile-8", columnStart: 1, rowStart: 3, columnSpan: 4, rowSpan: 2, structuralHeight: "40px" },
  { slot: "tile-9", columnStart: 1, rowStart: 5, structuralHeight: "15px" },
  { slot: "tile-10", columnStart: 2, rowStart: 5, structuralHeight: "15px" },
  { slot: "tile-11", columnStart: 3, rowStart: 5, structuralHeight: "15px" },
  { slot: "tile-12", columnStart: 4, rowStart: 5, structuralHeight: "15px" },
];

/** `variantViews.v2.structure.children[tilesgrid]`. */
const V2_COLUMN_SIZES = ["1fr", "1fr", "1fr", "1fr"];
const V2_ROW_SIZES = ["15px", "15px", "15px", "fit-content(100%)", "fit-content(100%)"];
const V2_TILES: GridTile[] = [
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
];

function TilesGrid({
  columnSizes,
  rowSizes,
  tiles,
  tileColor,
}: {
  columnSizes: string[];
  rowSizes: string[];
  tiles: GridTile[];
  tileColor: string;
}) {
  return (
    <div
      style={{
        alignSelf: "stretch",
        columnGap: tokenVar(TILESGRID_COLUMN_GAP),
        display: "grid",
        gridTemplateColumns: columnSizes.join(" "),
        gridTemplateRows: rowSizes.join(" "),
        rowGap: tokenVar(TILESGRID_ROW_GAP),
        width: "100%",
      }}
    >
      {tiles.map((tile) => (
        <div
          key={tile.slot}
          style={{
            backgroundColor: tileColor,
            borderRadius: tokenVar(TILESGRID_RADIUS),
            gridColumn: `${tile.columnStart} / span ${tile.columnSpan ?? 1}`,
            gridRow: `${tile.rowStart} / span ${tile.rowSpan ?? 1}`,
            height: tile.structuralHeight,
          }}
        />
      ))}
    </div>
  );
}

/** Slot `userinput` — n'existe que dans `variantViews.v1` (variant « info »). */
const USERINPUT_RADIUS = "{components.stresstest.info.userinput.sizes.border-radius}";
const USERINPUT_PADDING_LEFT = "{components.stresstest.info.userinput.sizes.padding-left}";
const USERINPUT_PADDING_RIGHT = "{components.stresstest.info.userinput.sizes.padding-right}";
const USERINPUT_PADDING_TOP = "{components.stresstest.info.userinput.sizes.padding-top}";
const USERINPUT_PADDING_BOTTOM = "{components.stresstest.info.userinput.sizes.padding-bottom}";
const USERINPUT_BACKGROUND = "{components.stresstest.info.userinput.colors.background}";
const USERINPUT_BORDER: StrokeLeaf = {
  color: "{components.stresstest.info.userinput.colors.border}",
  width: "{components.stresstest.info.userinput.sizes.border-width}",
  align: "inside",
};
const TAG_RADIUS = "{components.stresstest.info.userinput.sizes.border-radius-tag}";
const TAG_PADDING_X = "{components.stresstest.info.userinput.sizes.padding-x-tag}";
const TAG_PADDING_Y = "{components.stresstest.info.userinput.sizes.padding-y-tag}";
const TAG_BACKGROUND = "{components.stresstest.info.userinput.colors.background-tag}";
const TAG_TEXT_COLOR = "{components.stresstest.info.userinput.colors.text-color-tag}";

/** `samples.s1.text[].value` — slot `userinput > label > label`. */
const DEFAULT_TAG_TEXT = "ou";
/** `samples.s1.composes[].overrides[].text`. */
const DEFAULT_ACCEPT_LABEL = "Accepter";
const DEFAULT_REFUSE_LABEL = "Refuser";

/** Slot `actionswrap` — n'existe que dans `variantViews.v2` (variant « success »). */
const DEFAULT_BACK_LABEL = "Retour";
const DEFAULT_CONTINUE_LABEL = "Poursuivre";

/** Slot `label-2` (TextColumns) — dimensions communes aux deux vues. */
const TEXTCOLUMNS_GAP = "{components.stresstest.info.textcolumns.sizes.gap}";
const TEXTCOLUMNS_GAP_COL = "{components.stresstest.info.textcolumns.sizes.gap-col}";
const TITLE_COLOR = "{components.stresstest.info.textcolumns.colors.title}";
const DESCRIPTION_COLOR = "{components.stresstest.info.textcolumns.colors.description}";
const LINK_COLOR = "{components.stresstest.info.textcolumns.colors.link}";

/** Un élément de texte d'une colonne du slot `label-2` (TextColumns). */
export interface StressTestColonne {
  text: string;
  style: TextStyleTokens;
  color: string;
}

function Col({ items }: { items: StressTestColonne[] }) {
  return (
    <div
      style={{
        alignItems: "flex-start",
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        gap: tokenVar(TEXTCOLUMNS_GAP_COL),
        justifyContent: "center",
      }}
    >
      {items.map((item, index) => (
        <span key={index} style={{ ...textStyle(item.style, item.color), alignSelf: "stretch" }}>
          {item.text}
        </span>
      ))}
    </div>
  );
}

function TextColumns({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        alignItems: "flex-start",
        alignSelf: "stretch",
        display: "flex",
        flexDirection: "row",
        gap: tokenVar(TEXTCOLUMNS_GAP),
        justifyContent: "flex-start",
      }}
    >
      {children}
    </div>
  );
}

/** Slot `divider` / `divider-2`. */
const DIVIDER_HEIGHT = "{components.stresstest.info.divider.sizes.height}";
const DIVIDER_MAX_WIDTH = "{components.stresstest.info.divider.sizes.max-width}";
const DIVIDER_BACKGROUND = "{components.stresstest.info.divider.colors.background}";

function Divider() {
  return (
    <div
      style={{
        alignSelf: "stretch",
        backgroundColor: tokenVar(DIVIDER_BACKGROUND),
        height: tokenVar(DIVIDER_HEIGHT),
        maxWidth: tokenVar(DIVIDER_MAX_WIDTH),
      }}
    />
  );
}

/** Slot `tilelinkswrap` — sept `TileLink`, communs aux deux vues. */
const TILELINKSWRAP_GAP_X = "{components.stresstest.info.tilelinkswrap.sizes.gap-x}";
const TILELINKSWRAP_GAP_Y = "{components.stresstest.info.tilelinkswrap.sizes.gap-y}";

/** Slot `scalewrap` — six `Step`, communs aux deux vues hormis la couleur. */
const SCALEWRAP_HEIGHT = "{components.stresstest.info.scalewrap.sizes.height}";
const SCALEWRAP_RADIUS_TOP_LEFT = "{components.stresstest.info.scalewrap.sizes.radius-top-left}";
const SCALEWRAP_RADIUS_BOTTOM_LEFT = "{components.stresstest.info.scalewrap.sizes.radius-bottom-left}";
const SCALEWRAP_RADIUS_TOP_RIGHT = "{components.stresstest.info.scalewrap.sizes.radius-top-right}";
const SCALEWRAP_RADIUS_BOTTOM_RIGHT = "{components.stresstest.info.scalewrap.sizes.radius-bottom-right}";

const SCALE_COLORS_INFO = [
  "{components.stresstest.info.scalewrap.colors.scale-1}",
  "{components.stresstest.info.scalewrap.colors.scale-2}",
  "{components.stresstest.info.scalewrap.colors.scale-3}",
  "{components.stresstest.info.scalewrap.colors.scale-4}",
  "{components.stresstest.info.scalewrap.colors.scale-5}",
  "{components.stresstest.info.scalewrap.colors.scale-6}",
];
const SCALE_COLORS_SUCCESS = [
  "{components.stresstest.success.scalewrap.colors.scale-1}",
  "{components.stresstest.success.scalewrap.colors.scale-2}",
  "{components.stresstest.success.scalewrap.colors.scale-3}",
  "{components.stresstest.success.scalewrap.colors.scale-4}",
  "{components.stresstest.success.scalewrap.colors.scale-5}",
  "{components.stresstest.success.scalewrap.colors.scale-6}",
];

function ScaleWrap({ colors }: { colors: string[] }) {
  return (
    <div
      style={{
        alignItems: "center",
        alignSelf: "stretch",
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        height: tokenVar(SCALEWRAP_HEIGHT),
        justifyContent: "flex-start",
      }}
    >
      {colors.map((color, index) => {
        const isFirst = index === 0;
        const isLast = index === colors.length - 1;
        return (
          <div
            key={index}
            style={{
              alignSelf: "stretch",
              backgroundColor: tokenVar(color),
              borderBottomLeftRadius: isFirst ? tokenVar(SCALEWRAP_RADIUS_BOTTOM_LEFT) : undefined,
              borderBottomRightRadius: isLast ? tokenVar(SCALEWRAP_RADIUS_BOTTOM_RIGHT) : undefined,
              borderTopLeftRadius: isFirst ? tokenVar(SCALEWRAP_RADIUS_TOP_LEFT) : undefined,
              borderTopRightRadius: isLast ? tokenVar(SCALEWRAP_RADIUS_TOP_RIGHT) : undefined,
              flexGrow: 1,
            }}
          />
        );
      })}
    </div>
  );
}

/** `samples.s1.text[].value` — slot `label` (Head), commun aux deux vues. */
const DEFAULT_TITLE_TEXT = "Titre";
const DEFAULT_DESCRIPTION_TEXT = "Description de l’élément sur quelques lignes, idéalement deux au maximum.";

function Head() {
  return (
    <div
      style={{
        alignItems: "flex-start",
        alignSelf: "stretch",
        display: "flex",
        flexDirection: "column",
        gap: tokenVar(HEAD_GAP),
        justifyContent: "flex-start",
      }}
    >
      <span style={textStyle(TITLE_MEDIUM, tokenVar(HEAD_TEXT_COLOR))}>{DEFAULT_TITLE_TEXT}</span>
      <span style={{ ...textStyle(BODY_MEDIUM, tokenVar(HEAD_TEXT_COLOR)), alignSelf: "stretch" }}>
        {DEFAULT_DESCRIPTION_TEXT}
      </span>
    </div>
  );
}

interface StressTestContractProps {
  variant?: StressTestVariant;
}

export interface StressTestProps
  extends Omit<HTMLAttributes<HTMLDivElement>, keyof StressTestContractProps>,
    StressTestContractProps {
  /**
   * Props applicatives transmises à l'`Alert` composée dans le slot
   * `alert` — hors surface du contrat, qui ne publie que sa présence et sa
   * sévérité/variante par vue. Alert ne rend pas encore son propre
   * échantillon : on lui passe donc ici le contenu que la maquette montre.
   */
  alertProps?: AlertProps;
  /**
   * Props applicatives transmises à chaque `TileLink` du slot
   * `tilelinkswrap`, dans l'ordre des slots (`href`, gestionnaires
   * d'événements…) — hors surface du contrat.
   */
  tileLinks?: TileLinkProps[];
}

/**
 * Composant au layout complexe utilisé uniquement pour stress-tester
 * l'exporter de contrats (`intent.usage`). `variant` choisit entre deux
 * arbres distincts (`variantViews.v1`/`v2`) : `stateModel` vaut `null`, ce
 * composant ne suit aucun état interactif.
 */
export function StressTest({ variant = "info", alertProps, tileLinks, style, ...rest }: StressTestProps) {
  const isSuccess = variant === "success";

  // Slot `alert` — une seule occurrence composée, sa sévérité/variante suit
  // la vue exacte (`variantViews.v1.icons`/`v2.composes`). `contrat.composes`
  // (l'union ordonnée à cardinalité maximale — skill « consommer-contrat »
  // §5) attend exactement UNE occurrence d'`Alert` : jamais deux arbres
  // dupliqués par variante.
  const alertElement = (
    <Alert
      style={{ alignSelf: "stretch" }}
      severity={isSuccess ? "success" : "info"}
      variant={isSuccess ? "outlined" : "standard"}
      {...alertProps}
    />
  );

  // Slots `button` / `button-2` : présents dans `userinput` (info) comme dans
  // `actionswrap` (success), avec des props différentes par vue —
  // `samples.s1.composes` vs `samples.s2.composes`.
  const buttonSlotElement = (
    <Button
      color={isSuccess ? "secondary" : "success"}
      variant={isSuccess ? "text" : "contained"}
      size="medium"
      iconLeft={!isSuccess}
      iconRight={false}
    >
      {isSuccess ? DEFAULT_BACK_LABEL : DEFAULT_ACCEPT_LABEL}
    </Button>
  );

  const button2SlotElement = (
    <Button
      color={isSuccess ? "success" : "error"}
      variant={isSuccess ? "text" : "contained"}
      size="medium"
      iconRight={false}
      label={!isSuccess}
    >
      {isSuccess ? DEFAULT_CONTINUE_LABEL : DEFAULT_REFUSE_LABEL}
    </Button>
  );

  // Slot `button-3` : n'existe que dans `variantViews.v2` (`actionswrap`).
  // `contrat.composes` publie 3 `Button` au total (l'union à cardinalité
  // maximale entre les deux `Button` d'`userinput` et les trois
  // d'`actionswrap`) : cette troisième occurrence est donc la seule qui doit
  // rester conditionnelle à l'écriture, pas les deux premières.
  const button3SlotElement = isSuccess ? (
    <Button color="info" variant="outlined" size="medium" iconRight={false}>
      {DEFAULT_CONTINUE_LABEL}
    </Button>
  ) : null;

  // Slot `tilelinkswrap` — sept `TileLink`, communs aux deux vues ; seules
  // les tuiles 1 et 7 changent de variante avec `success` (`samples.s2`).
  const tileLinksElement = (
    <div
      style={{
        alignItems: "center",
        alignSelf: "stretch",
        columnGap: tokenVar(TILELINKSWRAP_GAP_X),
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "flex-start",
        rowGap: tokenVar(TILELINKSWRAP_GAP_Y),
      }}
    >
      <TileLink variant={isSuccess ? "success" : "info"} {...tileLinks?.[0]} />
      <TileLink variant="info" {...tileLinks?.[1]} />
      <TileLink variant="info" {...tileLinks?.[2]} />
      <TileLink variant="info" {...tileLinks?.[3]} />
      <TileLink variant="info" {...tileLinks?.[4]} />
      <TileLink variant="info" {...tileLinks?.[5]} />
      <TileLink variant={isSuccess ? "success" : "info"} {...tileLinks?.[6]} />
    </div>
  );

  return (
    <div
      {...rest}
      style={{
        alignItems: "center",
        boxShadow: strokeBoxShadow(ROOT_BORDER),
        borderRadius: tokenVar(ROOT_RADIUS),
        display: "flex",
        flexDirection: "column",
        gap: tokenVar(ROOT_GAP),
        height: "fit-content",
        justifyContent: "center",
        maxWidth: tokenVar(ROOT_MAX_WIDTH),
        padding: `${tokenVar(ROOT_PADDING)} ${tokenVar(ROOT_PADDING)}`,
        width: "fit-content",
        ...style,
      } as CSSProperties}
    >
      <Head />
      {alertElement}
      <TilesGrid
        columnSizes={isSuccess ? V2_COLUMN_SIZES : V1_COLUMN_SIZES}
        rowSizes={isSuccess ? V2_ROW_SIZES : V1_ROW_SIZES}
        tiles={isSuccess ? V2_TILES : V1_TILES}
        tileColor={isSuccess ? tokenVar(TILE_COLOR_SUCCESS) : tokenVar(TILE_COLOR_INFO)}
      />
      {/* Slot `userinput` — n'existe que dans `variantViews.v1` (variant « info »). */}
      {!isSuccess && (
        <div
          style={{
            alignItems: "center",
            alignSelf: "stretch",
            backgroundColor: tokenVar(USERINPUT_BACKGROUND),
            borderRadius: tokenVar(USERINPUT_RADIUS),
            boxShadow: strokeBoxShadow(USERINPUT_BORDER),
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            paddingBottom: tokenVar(USERINPUT_PADDING_BOTTOM),
            paddingLeft: tokenVar(USERINPUT_PADDING_LEFT),
            paddingRight: tokenVar(USERINPUT_PADDING_RIGHT),
            paddingTop: tokenVar(USERINPUT_PADDING_TOP),
          }}
        >
          {buttonSlotElement}
          <div
            style={{
              alignItems: "flex-start",
              backgroundColor: tokenVar(TAG_BACKGROUND),
              borderRadius: tokenVar(TAG_RADIUS),
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
              padding: `${tokenVar(TAG_PADDING_Y)} ${tokenVar(TAG_PADDING_X)}`,
            }}
          >
            <span style={textStyle(LABEL_SMALL, tokenVar(TAG_TEXT_COLOR))}>{DEFAULT_TAG_TEXT}</span>
          </div>
          {button2SlotElement}
        </div>
      )}
      <TextColumns>
        {isSuccess ? (
          <>
            <Col
              items={[
                { text: "Point 1", style: BODY_LARGE, color: tokenVar(TITLE_COLOR) },
                {
                  text: "Ce qui est important de faire pour le point 1 c’est de suivre impérativement les règles du point 1",
                  style: BODY_MEDIUM,
                  color: tokenVar(DESCRIPTION_COLOR),
                },
              ]}
            />
            <Col
              items={[
                { text: "Point 2", style: BODY_LARGE, color: tokenVar(TITLE_COLOR) },
                {
                  text: "Ce qui est important de faire pour le point 2 c’est de suivre impérativement les règles du point 2",
                  style: BODY_SMALL,
                  color: tokenVar(DESCRIPTION_COLOR),
                },
                { text: "Lien vers ressource 2", style: LABEL_SMALL, color: tokenVar(LINK_COLOR) },
              ]}
            />
          </>
        ) : (
          <>
            <Col
              items={[
                { text: "Point 1", style: BODY_LARGE, color: tokenVar(TITLE_COLOR) },
                {
                  text: "Ce qui est important de faire pour le point 1 c’est de suivre impérativement les règles du point 1",
                  style: BODY_SMALL,
                  color: tokenVar(DESCRIPTION_COLOR),
                },
                { text: "Lien vers ressource 1", style: LABEL_SMALL, color: tokenVar(LINK_COLOR) },
              ]}
            />
            <Col
              items={[
                { text: "Point 2", style: BODY_LARGE, color: tokenVar(TITLE_COLOR) },
                {
                  text: "Ce qui est important de faire pour le point 2 c’est de suivre impérativement les règles du point 2",
                  style: BODY_SMALL,
                  color: tokenVar(DESCRIPTION_COLOR),
                },
                { text: "Lien vers ressource 2", style: LABEL_SMALL, color: tokenVar(LINK_COLOR) },
              ]}
            />
            <Col
              items={[
                { text: "Point 3", style: BODY_LARGE, color: tokenVar(TITLE_COLOR) },
                {
                  text: "Ce qui est important de faire pour le point 3 c’est de suivre impérativement les règles du point 3",
                  style: BODY_SMALL,
                  color: tokenVar(DESCRIPTION_COLOR),
                },
                { text: "Lien vers ressource 3", style: LABEL_SMALL, color: tokenVar(LINK_COLOR) },
              ]}
            />
          </>
        )}
      </TextColumns>
      <Divider />
      {tileLinksElement}
      {/* Slot `divider-2` — n'existe que dans `variantViews.v2` (variant « success »). */}
      {isSuccess && <Divider />}
      <ScaleWrap colors={isSuccess ? SCALE_COLORS_SUCCESS : SCALE_COLORS_INFO} />
      {/* Slot `actionswrap` — n'existe que dans `variantViews.v2` (variant « success »). */}
      {isSuccess && (
        <div
          style={{
            alignItems: "center",
            alignSelf: "stretch",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          {buttonSlotElement}
          {button2SlotElement}
          {button3SlotElement}
        </div>
      )}
    </div>
  );
}
