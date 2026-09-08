import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { Icone } from "../../Icone";
import { Alert } from "../Alert/Alert";
import { Button } from "../Button/Button";
import { TileLink } from "../TileLink/TileLink";

/** `{chemin.du.token}` → `var(--chemin-du-token)`, comme style-dictionary.config.mjs. */
function token(reference: string): string {
  const chemin = reference.slice(1, -1);
  return `var(--${chemin
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")})`;
}

type Variant = "info" | "success" | "warning";

const TEXT_STYLES: Record<string, CSSProperties> = {
  "title.medium": {
    fontFamily: token("{primitives.fontfamily.base}"),
    fontSize: token("{typography.title.medium.fontsize}"),
    fontWeight: token("{typography.title.medium.fontweight}") as unknown as number,
    lineHeight: token("{typography.title.medium.lineheight}"),
    letterSpacing: token("{typography.title.medium.letterspacing}"),
  },
  "body.medium": {
    fontFamily: token("{primitives.fontfamily.base}"),
    fontSize: token("{typography.body.medium.fontsize}"),
    fontWeight: token("{typography.body.medium.fontweight}") as unknown as number,
    lineHeight: token("{typography.body.medium.lineheight}"),
    letterSpacing: token("{typography.body.medium.letterspacing}"),
  },
  "body.large": {
    fontFamily: token("{primitives.fontfamily.base}"),
    fontSize: token("{typography.body.large.fontsize}"),
    fontWeight: token("{typography.body.large.fontweight}") as unknown as number,
    lineHeight: token("{typography.body.large.lineheight}"),
    letterSpacing: token("{typography.body.large.letterspacing}"),
  },
  "body.small": {
    fontFamily: token("{primitives.fontfamily.base}"),
    fontSize: token("{typography.body.small.fontsize}"),
    fontWeight: token("{typography.body.small.fontweight}") as unknown as number,
    lineHeight: token("{typography.body.small.lineheight}"),
    letterSpacing: token("{typography.body.small.letterspacing}"),
  },
  "label.small": {
    fontFamily: token("{primitives.fontfamily.base}"),
    fontSize: token("{typography.label.small.fontsize}"),
    fontWeight: token("{typography.label.small.fontweight}") as unknown as number,
    lineHeight: token("{typography.label.small.lineheight}"),
    letterSpacing: token("{typography.label.small.letterspacing}"),
  },
};

function Text({
  styleName,
  color,
  children,
}: {
  styleName: keyof typeof TEXT_STYLES;
  color: string;
  children: ReactNode;
}) {
  return <span style={{ ...TEXT_STYLES[styleName], color }}>{children}</span>;
}

interface TileSpec {
  col: number;
  row: number;
  colSpan?: number;
  rowSpan?: number;
  height?: string;
}

const TILES_12: TileSpec[] = [
  { col: 1, row: 1 },
  { col: 2, row: 1 },
  { col: 3, row: 1 },
  { col: 4, row: 1 },
  { col: 1, row: 2, height: "15px" },
  { col: 2, row: 2, colSpan: 2, height: "15px" },
  { col: 4, row: 2, height: "15px" },
  { col: 1, row: 3, colSpan: 4, rowSpan: 2, height: "40px" },
  { col: 1, row: 5, height: "15px" },
  { col: 2, row: 5, height: "15px" },
  { col: 3, row: 5, height: "15px" },
  { col: 4, row: 5, height: "15px" },
];
const ROWS_12 = "15px fit-content(100%) fit-content(100%) fit-content(100%) fit-content(100%)";

const TILES_17: TileSpec[] = [
  { col: 1, row: 1, rowSpan: 2 },
  { col: 2, row: 1 },
  { col: 3, row: 1 },
  { col: 4, row: 1 },
  { col: 2, row: 2 },
  { col: 3, row: 2 },
  { col: 4, row: 2, rowSpan: 2 },
  { col: 1, row: 3 },
  { col: 2, row: 3 },
  { col: 3, row: 3 },
  { col: 1, row: 4, height: "15px" },
  { col: 2, row: 4, height: "15px" },
  { col: 3, row: 4, colSpan: 2, height: "15px" },
  { col: 1, row: 5, height: "15px" },
  { col: 2, row: 5, height: "15px" },
  { col: 3, row: 5, height: "15px" },
  { col: 4, row: 5, height: "15px" },
];
const ROWS_17 = "15px 15px 15px fit-content(100%) fit-content(100%)";

const TILE_RADIUS = token("{components.stresstest.info.tilesgrid.sizes.radius}");

function TilesGrid({ tiles, rows, tileColor }: { tiles: TileSpec[]; rows: string; tileColor: string }) {
  return (
    <div
      style={{
        alignSelf: "stretch",
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr 1fr",
        gridTemplateRows: rows,
        columnGap: token("{components.stresstest.info.tilesgrid.sizes.gap-col}"),
        rowGap: token("{components.stresstest.info.tilesgrid.sizes.gap-rows}"),
      }}
    >
      {tiles.map((tile, index) => (
        <div
          key={index}
          style={{
            gridColumn: `${tile.col} / span ${tile.colSpan ?? 1}`,
            gridRow: `${tile.row} / span ${tile.rowSpan ?? 1}`,
            height: tile.height,
            borderRadius: TILE_RADIUS,
            backgroundColor: tileColor,
          }}
        />
      ))}
    </div>
  );
}

const SCALE_HEIGHT = token("{components.stresstest.info.scalewrap.sizes.height}");
const SCALE_RADIUS_TOP_LEFT = token("{components.stresstest.info.scalewrap.sizes.radius-top-left}");
const SCALE_RADIUS_BOTTOM_LEFT = token("{components.stresstest.info.scalewrap.sizes.radius-bottom-left}");
const SCALE_RADIUS_TOP_RIGHT = token("{components.stresstest.info.scalewrap.sizes.radius-top-right}");
const SCALE_RADIUS_BOTTOM_RIGHT = token("{components.stresstest.info.scalewrap.sizes.radius-bottom-right}");

function ScaleWrap({ colors }: { colors: string[] }) {
  return (
    <div
      style={{
        alignSelf: "stretch",
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "flex-start",
        alignItems: "center",
        height: SCALE_HEIGHT,
      }}
    >
      {colors.map((color, index) => (
        <div
          key={index}
          style={{
            alignSelf: "stretch",
            flexGrow: 1,
            backgroundColor: color,
            borderTopLeftRadius: index === 0 ? SCALE_RADIUS_TOP_LEFT : undefined,
            borderBottomLeftRadius: index === 0 ? SCALE_RADIUS_BOTTOM_LEFT : undefined,
            borderTopRightRadius: index === colors.length - 1 ? SCALE_RADIUS_TOP_RIGHT : undefined,
            borderBottomRightRadius: index === colors.length - 1 ? SCALE_RADIUS_BOTTOM_RIGHT : undefined,
          }}
        />
      ))}
    </div>
  );
}

function Divider({ background }: { background: string }) {
  return (
    <div
      style={{
        alignSelf: "stretch",
        height: token("{components.stresstest.info.divider.sizes.height}"),
        maxWidth: token("{components.stresstest.info.divider.sizes.max-width}"),
        backgroundColor: background,
      }}
    />
  );
}

interface TileLinkSample {
  variant: "info" | "success";
  chessName?: string;
}

function TileLinksWrap({ links }: { links: TileLinkSample[] }) {
  return (
    <div
      style={{
        alignSelf: "stretch",
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "flex-start",
        alignItems: "center",
        columnGap: token("{components.stresstest.info.tilelinkswrap.sizes.gap-x}"),
        rowGap: token("{components.stresstest.info.tilelinkswrap.sizes.gap-y}"),
      }}
    >
      {links.map((link, index) => (
        <TileLink key={index} variant={link.variant} chessName={link.chessName} />
      ))}
    </div>
  );
}

const BASE_STYLE = (borderColor: string): CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  width: "fit-content",
  height: "fit-content",
  maxWidth: token("{components.stresstest.info.base.sizes.max-width}"),
  justifyContent: "center",
  alignItems: "center",
  gap: token("{components.stresstest.info.base.sizes.gap}"),
  padding: token("{components.stresstest.info.base.sizes.padding}"),
  borderRadius: token("{components.stresstest.info.base.sizes.border-radius}"),
  backgroundColor: token("{components.stresstest.info.base.colors.background}"),
  boxShadow: `inset 0 0 0 ${token("{components.stresstest.info.base.sizes.border-width}")} ${borderColor}`,
});

const HEAD_TEXT_COLOR = token("{components.stresstest.info.head.colors.text}");

function Head({ title, description }: { title: string; description: string }) {
  return (
    <div
      style={{
        alignSelf: "stretch",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        gap: token("{components.stresstest.info.head.sizes.gap}"),
      }}
    >
      <Text styleName="title.medium" color={HEAD_TEXT_COLOR}>{title}</Text>
      <span style={{ alignSelf: "stretch" }}>
        <Text styleName="body.medium" color={HEAD_TEXT_COLOR}>{description}</Text>
      </span>
    </div>
  );
}

const TITLE_COLOR = token("{components.stresstest.info.textcolumns.colors.title}");
const DESCRIPTION_COLOR = token("{components.stresstest.info.textcolumns.colors.description}");
const LINK_COLOR = token("{components.stresstest.info.textcolumns.colors.link}");

function TextColumn({ title, description, link }: { title: string; description: string; link?: string }) {
  return (
    <div
      style={{
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        gap: token("{components.stresstest.info.textcolumns.sizes.gap-col}"),
      }}
    >
      <span style={{ alignSelf: "stretch" }}><Text styleName="body.large" color={TITLE_COLOR}>{title}</Text></span>
      <span style={{ alignSelf: "stretch" }}><Text styleName="body.small" color={DESCRIPTION_COLOR}>{description}</Text></span>
      {link ? <span style={{ alignSelf: "stretch" }}><Text styleName="label.small" color={LINK_COLOR}>{link}</Text></span> : null}
    </div>
  );
}

/** Variante `info` — vue `st1` : Head, Alert, grille de 12 tuiles, UserInput, trois colonnes, séparateur, tuiles-liens, échelle. */
function VueInfo() {
  return (
    <div style={BASE_STYLE(token("{components.stresstest.info.base.colors.border}"))}>
      <Head
        title="Titre"
        description="Première variante du composant StressTest qui test l’imbrication de composants, les GRID, le wrap auto, le flew between, les paddings à différentes dimensions, les border radius à différentes dimensions."
      />
      <span style={{ alignSelf: "stretch" }}>
        <Alert
          severity="info"
          variant="standard"
          titleContent="Vous devez choisir"
          actionButtonProps={{ children: "On fait ça" }}
        >
          Choisissez entre les deux options disponibles
        </Alert>
      </span>
      <TilesGrid tiles={TILES_12} rows={ROWS_12} tileColor={token("{components.stresstest.info.tilesgrid.colors.tile}")} />
      <div
        style={{
          alignSelf: "stretch",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: token("{components.stresstest.info.userinput.sizes.border-radius}"),
          backgroundColor: token("{components.stresstest.info.userinput.colors.background}"),
          boxShadow: `inset 0 0 0 ${token("{components.stresstest.info.userinput.sizes.border-width}")} ${token("{components.stresstest.info.userinput.colors.border}")}`,
          paddingLeft: token("{components.stresstest.info.userinput.sizes.padding-left}"),
          paddingRight: token("{components.stresstest.info.userinput.sizes.padding-right}"),
          paddingTop: token("{components.stresstest.info.userinput.sizes.padding-top}"),
          paddingBottom: token("{components.stresstest.info.userinput.sizes.padding-bottom}"),
        }}
      >
        <Button color="success" variant="contained" size="medium" iconLeft iconRight={false} label iconLeftName="check">
          Accepter
        </Button>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "flex-start",
            borderRadius: token("{components.stresstest.info.userinput.sizes.border-radius-tag}"),
            backgroundColor: token("{components.stresstest.info.userinput.colors.background-tag}"),
            padding: `${token("{components.stresstest.info.userinput.sizes.padding-y-tag}")} ${token("{components.stresstest.info.userinput.sizes.padding-x-tag}")}`,
          }}
        >
          <Text styleName="label.small" color={token("{components.stresstest.info.userinput.colors.text-color-tag}")}>ou</Text>
        </div>
        <Button color="error" variant="contained" size="medium" iconLeft iconRight={false} label iconLeftName="xmark">
          Refuser
        </Button>
      </div>
      <div
        style={{
          alignSelf: "stretch",
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          gap: token("{components.stresstest.info.textcolumns.sizes.gap}"),
        }}
      >
        <TextColumn
          title="Point 1"
          description="Ce qui est important de faire pour le point 1 c’est de suivre impérativement les règles du point 1"
          link="Lien vers ressource 1"
        />
        <TextColumn
          title="Point 2"
          description="Ce qui est important de faire pour le point 2 c’est de suivre impérativement les règles du point 2"
          link="Lien vers ressource 2"
        />
        <TextColumn
          title="Point 3"
          description="Ce qui est important de faire pour le point 3 c’est de suivre impérativement les règles du point 3"
          link="Lien vers ressource 3"
        />
      </div>
      <Divider background={token("{components.stresstest.info.divider.colors.background}")} />
      <TileLinksWrap
        links={[
          { variant: "info" },
          { variant: "info", chessName: "circle-9" },
          { variant: "info", chessName: "duck" },
          { variant: "info", chessName: "oil-temperature" },
          { variant: "info", chessName: "fence" },
          { variant: "info", chessName: "wheat" },
          { variant: "info", chessName: "candle-holder" },
        ]}
      />
      <ScaleWrap
        colors={[
          token("{components.stresstest.info.scalewrap.colors.scale-1}"),
          token("{components.stresstest.info.scalewrap.colors.scale-2}"),
          token("{components.stresstest.info.scalewrap.colors.scale-3}"),
          token("{components.stresstest.info.scalewrap.colors.scale-4}"),
          token("{components.stresstest.info.scalewrap.colors.scale-5}"),
          token("{components.stresstest.info.scalewrap.colors.scale-6}"),
        ]}
      />
    </div>
  );
}

/** Variante `success` — vue `st2` : grille de 17 tuiles, deux colonnes, deux séparateurs, échelle, rangée d'actions. */
function VueSuccess() {
  return (
    <div style={BASE_STYLE(token("{components.stresstest.info.base.colors.border}"))}>
      <Head
        title="Titre"
        description="Seconde variante du composant StressTest qui test des variations d’affichage basées sur la 1ère variante et la configuration de composants enfants."
      />
      <span style={{ alignSelf: "stretch" }}>
        <Alert
          severity="success"
          variant="outlined"
          titleContent="Le projet est validé"
          actionButtonProps={{ children: "Génial" }}
        >
          Vous n’avez plus rien à faire
        </Alert>
      </span>
      <TilesGrid tiles={TILES_17} rows={ROWS_17} tileColor={token("{components.stresstest.success.tilesgrid.colors.tile}")} />
      <div
        style={{
          alignSelf: "stretch",
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          gap: token("{components.stresstest.info.textcolumns.sizes.gap}"),
        }}
      >
        <TextColumn
          title="Point 1"
          description="Ce qui est important de faire pour le point 1 c’est de suivre impérativement les règles du point 1"
        />
        <TextColumn
          title="Point 2"
          description="Ce qui est important de faire pour le point 2 c’est de suivre impérativement les règles du point 2"
          link="Lien vers ressource 2"
        />
      </div>
      <Divider background={token("{components.stresstest.info.divider.colors.background}")} />
      <TileLinksWrap
        links={[
          { variant: "success", chessName: "chess-king-piece" },
          { variant: "info", chessName: "circle-arrow-up" },
          { variant: "info", chessName: "dumbbell" },
          { variant: "info", chessName: "oil-can-drip" },
          { variant: "info", chessName: "ferris-wheel" },
          { variant: "info", chessName: "whale" },
          { variant: "success", chessName: "candy" },
        ]}
      />
      <Divider background={token("{components.stresstest.info.divider.colors.background}")} />
      <ScaleWrap
        colors={[
          token("{components.stresstest.success.scalewrap.colors.scale-1}"),
          token("{components.stresstest.success.scalewrap.colors.scale-2}"),
          token("{components.stresstest.success.scalewrap.colors.scale-3}"),
          token("{components.stresstest.success.scalewrap.colors.scale-4}"),
          token("{components.stresstest.success.scalewrap.colors.scale-5}"),
          token("{components.stresstest.success.scalewrap.colors.scale-6}"),
        ]}
      />
      <div style={{ alignSelf: "stretch", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Button color="secondary" variant="text" size="medium" iconLeft={false} iconRight={false} label>
          Retour
        </Button>
        <Button color="success" variant="text" size="medium" iconLeft iconRight={false} label={false} iconLeftName="ballot" />
        <Button color="info" variant="outlined" size="medium" iconLeft iconRight={false} label iconLeftName="arrow-right-long">
          Poursuivre
        </Button>
      </div>
    </div>
  );
}

const BADGE_SIZE = token("{components.stresstest.warning.badge.sizes.size}");
const BADGE_ICON_SIZE = token("{components.stresstest.warning.badge.sizes.icon-size}");

/** Variante `warning` — vue `st3` : Head, Alert, grille de 12 tuiles, séparateur, tuiles-liens, badge en position absolue. */
function VueWarning() {
  return (
    <div style={{ ...BASE_STYLE(token("{components.stresstest.info.base.colors.border}")), position: "relative" }}>
      <Head
        title="Titre"
        description="Troisième variante du composant StressTest qui test les éléments en position absolute, les rotations et la configuration de composants enfants."
      />
      <span style={{ alignSelf: "stretch" }}>
        <Alert
          severity="warning"
          variant="standard"
          titleContent="Attention"
          actionButtonProps={{ children: "J’ai compris" }}
        >
          Ceci est un avertissement
        </Alert>
      </span>
      <TilesGrid tiles={TILES_12} rows={ROWS_12} tileColor={token("{components.stresstest.warning.tilesgrid.colors.tile}")} />
      <Divider background={token("{components.stresstest.info.divider.colors.background}")} />
      <TileLinksWrap
        links={[
          { variant: "info", chessName: "skull" },
          { variant: "success", chessName: "circle-half" },
          { variant: "success", chessName: "face-awesome" },
          { variant: "info", chessName: "skull" },
          { variant: "info", chessName: "triangle-exclamation" },
          { variant: "info", chessName: "brake-warning" },
          { variant: "info", chessName: "wrench" },
        ]}
      />
      <div
        style={{
          position: "absolute",
          top: "13.63px",
          right: "13.63px",
          transform: "rotate(45deg)",
          width: BADGE_SIZE,
          height: BADGE_SIZE,
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: token("{components.stresstest.warning.badge.sizes.radius}"),
          backgroundColor: token("{components.stresstest.warning.badge.colors.background}"),
          boxShadow: `inset 0 0 0 ${token("{components.stresstest.warning.badge.sizes.border}")} ${token("{components.stresstest.warning.badge.colors.foreground}")}`,
        }}
      >
        <span style={{ transform: "rotate(-45deg)", display: "flex" }}>
          <Icone nom="skull" taille={BADGE_ICON_SIZE} couleur={token("{components.stresstest.warning.badge.colors.foreground}")} />
        </span>
      </div>
    </div>
  );
}

export interface StressTestProps extends HTMLAttributes<HTMLDivElement> {
  variant: Variant;
}

export function StressTest({ variant, ...rest }: StressTestProps) {
  return (
    <div {...rest}>
      {variant === "info" ? <VueInfo /> : null}
      {variant === "success" ? <VueSuccess /> : null}
      {variant === "warning" ? <VueWarning /> : null}
    </div>
  );
}
