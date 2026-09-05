import * as React from "react";
import { Alert } from "../Alert/Alert";
import { Button } from "../Button/Button";
import { TileLink } from "../TileLink/TileLink";

export type StressTestVariant = "success" | "warning" | "info";

export interface StressTestProps {
  variant?: StressTestVariant;
  className?: string;
}

const tk = (ref: string) => `var(--${ref.slice(1, -1).replace(/\./g, "-")})`;

// textStyles — transcription littérale.
const TITLE_MEDIUM: React.CSSProperties = {
  fontFamily: tk("{primitives.fontfamily.base}"),
  fontSize: tk("{typography.title.medium.fontsize}"),
  fontWeight: tk("{typography.title.medium.fontweight}") as any,
  lineHeight: tk("{typography.title.medium.lineheight}"),
  letterSpacing: tk("{typography.title.medium.letterspacing}"),
};
const BODY_MEDIUM: React.CSSProperties = {
  fontFamily: tk("{primitives.fontfamily.base}"),
  fontSize: tk("{typography.body.medium.fontsize}"),
  fontWeight: tk("{typography.body.medium.fontweight}") as any,
  lineHeight: tk("{typography.body.medium.lineheight}"),
  letterSpacing: tk("{typography.body.medium.letterspacing}"),
};
const LABEL_SMALL: React.CSSProperties = {
  fontFamily: tk("{primitives.fontfamily.base}"),
  fontSize: tk("{typography.label.small.fontsize}"),
  fontWeight: tk("{typography.label.small.fontweight}") as any,
  lineHeight: tk("{typography.label.small.lineheight}"),
  letterSpacing: tk("{typography.label.small.letterspacing}"),
};
const BODY_LARGE: React.CSSProperties = {
  fontFamily: tk("{primitives.fontfamily.base}"),
  fontSize: tk("{typography.body.large.fontsize}"),
  fontWeight: tk("{typography.body.large.fontweight}") as any,
  lineHeight: tk("{typography.body.large.lineheight}"),
  letterSpacing: tk("{typography.body.large.letterspacing}"),
};
const BODY_SMALL: React.CSSProperties = {
  fontFamily: tk("{primitives.fontfamily.base}"),
  fontSize: tk("{typography.body.small.fontsize}"),
  fontWeight: tk("{typography.body.small.fontweight}") as any,
  lineHeight: tk("{typography.body.small.lineheight}"),
  letterSpacing: tk("{typography.body.small.letterspacing}"),
};

// structure.sizes — communs aux trois vues (st1/st2/st3 référencent tous les
// tokens "info" pour les dimensions ; seules les couleurs varient par variant).
const BASE_MAX_WIDTH = tk("{components.stresstest.info.base.sizes.max-width}");
const BASE_GAP = tk("{components.stresstest.info.base.sizes.gap}");
const BASE_PADDING = tk("{components.stresstest.info.base.sizes.padding}");
const BASE_RADIUS = tk("{components.stresstest.info.base.sizes.border-radius}");
const BASE_BORDER_WIDTH = tk("{components.stresstest.info.base.sizes.border-width}");
const BASE_BORDER_COLOR = tk("{components.stresstest.info.base.colors.border}");
const HEAD_GAP = tk("{components.stresstest.info.head.sizes.gap}");
const TILESGRID_RADIUS = tk("{components.stresstest.info.tilesgrid.sizes.radius}");
const TILESGRID_GAP_COL = tk("{components.stresstest.info.tilesgrid.sizes.gap-col}");
const TILESGRID_GAP_ROWS = tk("{components.stresstest.info.tilesgrid.sizes.gap-rows}");
const USERINPUT_RADIUS = tk("{components.stresstest.info.userinput.sizes.border-radius}");
const USERINPUT_RADIUS_TAG = tk("{components.stresstest.info.userinput.sizes.border-radius-tag}");
const USERINPUT_PAD_LEFT = tk("{components.stresstest.info.userinput.sizes.padding-left}");
const USERINPUT_PAD_RIGHT = tk("{components.stresstest.info.userinput.sizes.padding-right}");
const USERINPUT_PAD_TOP = tk("{components.stresstest.info.userinput.sizes.padding-top}");
const USERINPUT_PAD_BOTTOM = tk("{components.stresstest.info.userinput.sizes.padding-bottom}");
const USERINPUT_PAD_X_TAG = tk("{components.stresstest.info.userinput.sizes.padding-x-tag}");
const USERINPUT_PAD_Y_TAG = tk("{components.stresstest.info.userinput.sizes.padding-y-tag}");
const USERINPUT_BG = tk("{components.stresstest.info.userinput.colors.background}");
const USERINPUT_BORDER = tk("{components.stresstest.info.userinput.colors.border}");
const USERINPUT_BORDER_WIDTH = tk("{components.stresstest.info.userinput.sizes.border-width}");
const USERINPUT_BG_TAG = tk("{components.stresstest.info.userinput.colors.background-tag}");
const USERINPUT_TEXT_TAG = tk("{components.stresstest.info.userinput.colors.text-color-tag}");
const TEXTCOLUMNS_GAP = tk("{components.stresstest.info.textcolumns.sizes.gap}");
const TEXTCOLUMNS_GAP_COL = tk("{components.stresstest.info.textcolumns.sizes.gap-col}");
const TEXTCOLUMNS_TITLE = tk("{components.stresstest.info.textcolumns.colors.title}");
const TEXTCOLUMNS_DESC = tk("{components.stresstest.info.textcolumns.colors.description}");
const TEXTCOLUMNS_LINK = tk("{components.stresstest.info.textcolumns.colors.link}");
const DIVIDER_HEIGHT = tk("{components.stresstest.info.divider.sizes.height}");
const DIVIDER_MAX_WIDTH = tk("{components.stresstest.info.divider.sizes.max-width}");
const DIVIDER_BG = tk("{components.stresstest.info.divider.colors.background}");
const TILELINKSWRAP_GAP_X = tk("{components.stresstest.info.tilelinkswrap.sizes.gap-x}");
const TILELINKSWRAP_GAP_Y = tk("{components.stresstest.info.tilelinkswrap.sizes.gap-y}");
const SCALEWRAP_HEIGHT = tk("{components.stresstest.info.scalewrap.sizes.height}");
const SCALEWRAP_RADIUS_TL = tk("{components.stresstest.info.scalewrap.sizes.radius-top-left}");
const SCALEWRAP_RADIUS_BL = tk("{components.stresstest.info.scalewrap.sizes.radius-bottom-left}");
const SCALEWRAP_RADIUS_TR = tk("{components.stresstest.info.scalewrap.sizes.radius-top-right}");
const SCALEWRAP_RADIUS_BR = tk("{components.stresstest.info.scalewrap.sizes.radius-bottom-right}");
const BADGE_RADIUS = tk("{components.stresstest.warning.badge.sizes.radius}");
const BADGE_SIZE = tk("{components.stresstest.warning.badge.sizes.size}");
const BADGE_ICON_SIZE = tk("{components.stresstest.warning.badge.sizes.icon-size}");
const BADGE_BORDER = tk("{components.stresstest.warning.badge.sizes.border}");

function baseContainerStyle(background: string, borderColor: string): React.CSSProperties {
  return {
    display: "flex",
    flexDirection: "column",
    width: "fit-content",
    height: "fit-content",
    maxWidth: BASE_MAX_WIDTH,
    justifyContent: "center",
    alignItems: "center",
    gap: BASE_GAP,
    padding: BASE_PADDING,
    borderRadius: BASE_RADIUS,
    backgroundColor: background,
    boxShadow: `inset 0 0 0 ${BASE_BORDER_WIDTH} ${borderColor}`,
  };
}

function Tile({
  columnStart,
  rowStart,
  columnSpan,
  rowSpan,
  height,
  background,
}: {
  columnStart: number;
  rowStart: number;
  columnSpan?: number;
  rowSpan?: number;
  height?: string;
  background: string;
}) {
  return (
    <div
      style={{
        gridColumnStart: columnStart,
        gridColumnEnd: columnSpan ? `span ${columnSpan}` : undefined,
        gridRowStart: rowStart,
        gridRowEnd: rowSpan ? `span ${rowSpan}` : undefined,
        borderRadius: TILESGRID_RADIUS,
        backgroundColor: background,
        height,
      }}
    />
  );
}

// Transcription littérale de `variants[]` (une entrée par variant, axe unique).
const TOKENS = {
  info: {
    baseBackground: tk("{components.stresstest.info.base.colors.background}"),
    text: tk("{components.stresstest.info.head.colors.text}"),
    tile: tk("{components.stresstest.info.tilesgrid.colors.tile}"),
  },
  success: {
    baseBackground: tk("{components.stresstest.info.base.colors.background}"),
    text: tk("{components.stresstest.info.head.colors.text}"),
    tile: tk("{components.stresstest.success.tilesgrid.colors.tile}"),
    scale1: tk("{components.stresstest.success.scalewrap.colors.scale-1}"),
    scale2: tk("{components.stresstest.success.scalewrap.colors.scale-2}"),
    scale3: tk("{components.stresstest.success.scalewrap.colors.scale-3}"),
    scale4: tk("{components.stresstest.success.scalewrap.colors.scale-4}"),
    scale5: tk("{components.stresstest.success.scalewrap.colors.scale-5}"),
    scale6: tk("{components.stresstest.success.scalewrap.colors.scale-6}"),
  },
  warning: {
    baseBackground: tk("{components.stresstest.info.base.colors.background}"),
    text: tk("{components.stresstest.info.head.colors.text}"),
    tile: tk("{components.stresstest.warning.tilesgrid.colors.tile}"),
    badgeBackground: tk("{components.stresstest.warning.badge.colors.background}"),
    badgeForeground: tk("{components.stresstest.warning.badge.colors.foreground}"),
  },
  scaleInfo: {
    scale1: tk("{components.stresstest.info.scalewrap.colors.scale-1}"),
    scale2: tk("{components.stresstest.info.scalewrap.colors.scale-2}"),
    scale3: tk("{components.stresstest.info.scalewrap.colors.scale-3}"),
    scale4: tk("{components.stresstest.info.scalewrap.colors.scale-4}"),
    scale5: tk("{components.stresstest.info.scalewrap.colors.scale-5}"),
    scale6: tk("{components.stresstest.info.scalewrap.colors.scale-6}"),
  },
};

function ScaleWrap({ scales }: { scales: string[] }) {
  return (
    <div style={{ alignSelf: "stretch", display: "flex", flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-start", alignItems: "center", height: SCALEWRAP_HEIGHT }}>
      {scales.map((color, i) => (
        <div
          key={i}
          style={{
            alignSelf: "stretch",
            flexGrow: 1,
            backgroundColor: color,
            borderTopLeftRadius: i === 0 ? SCALEWRAP_RADIUS_TL : undefined,
            borderBottomLeftRadius: i === 0 ? SCALEWRAP_RADIUS_BL : undefined,
            borderTopRightRadius: i === scales.length - 1 ? SCALEWRAP_RADIUS_TR : undefined,
            borderBottomRightRadius: i === scales.length - 1 ? SCALEWRAP_RADIUS_BR : undefined,
          }}
        />
      ))}
    </div>
  );
}

function TileLinksWrap() {
  return (
    <div style={{ alignSelf: "stretch", display: "flex", flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-start", alignItems: "center", gap: TILELINKSWRAP_GAP_X, rowGap: TILELINKSWRAP_GAP_Y }}>
      <TileLink href="#" variant="info" />
      <TileLink href="#" variant="info" />
      <TileLink href="#" variant="info" />
      <TileLink href="#" variant="info" />
      <TileLink href="#" variant="info" />
      <TileLink href="#" variant="info" />
      <TileLink href="#" variant="info" />
    </div>
  );
}

function Divider() {
  return <div style={{ alignSelf: "stretch", maxWidth: DIVIDER_MAX_WIDTH, height: DIVIDER_HEIGHT, backgroundColor: DIVIDER_BG }} />;
}

// --- Vue "v1" (variant info) : structure `st1` du contrat. ---
function InfoView() {
  const t = TOKENS.info;
  return (
    <div className="ucm-stresstest" data-variant="info" style={baseContainerStyle(t.baseBackground, BASE_BORDER_COLOR)}>
      <div style={{ alignSelf: "stretch", display: "flex", flexDirection: "column", justifyContent: "flex-start", alignItems: "flex-start", gap: HEAD_GAP, color: t.text }}>
        <span style={TITLE_MEDIUM}>Titre</span>
        <span style={{ alignSelf: "stretch", ...BODY_MEDIUM }}>
          Première variante du composant StressTest qui test l’imbrication de composants, les GRID, le wrap auto, le flew between, les paddings à différentes dimensions, les border radius à différentes dimensions.
        </span>
      </div>

      <Alert severity="info" variant="standard" titleText="Vous devez choisir" description="Choisissez entre les deux options disponibles" actionLabel="On fait ça" />

      <div style={{ alignSelf: "stretch", display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gridTemplateRows: "15px fit-content(100%) fit-content(100%) fit-content(100%) fit-content(100%)", columnGap: TILESGRID_GAP_COL, rowGap: TILESGRID_GAP_ROWS }}>
        <Tile columnStart={1} rowStart={1} background={t.tile} />
        <Tile columnStart={2} rowStart={1} background={t.tile} />
        <Tile columnStart={3} rowStart={1} background={t.tile} />
        <Tile columnStart={4} rowStart={1} background={t.tile} />
        <Tile columnStart={1} rowStart={2} height="15px" background={t.tile} />
        <Tile columnStart={2} rowStart={2} columnSpan={2} height="15px" background={t.tile} />
        <Tile columnStart={4} rowStart={2} height="15px" background={t.tile} />
        <Tile columnStart={1} rowStart={3} columnSpan={4} rowSpan={2} height="40px" background={t.tile} />
        <Tile columnStart={1} rowStart={5} height="15px" background={t.tile} />
        <Tile columnStart={2} rowStart={5} height="15px" background={t.tile} />
        <Tile columnStart={3} rowStart={5} height="15px" background={t.tile} />
        <Tile columnStart={4} rowStart={5} height="15px" background={t.tile} />
      </div>

      <div
        style={{
          alignSelf: "stretch",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: USERINPUT_RADIUS,
          backgroundColor: USERINPUT_BG,
          boxShadow: `inset 0 0 0 ${USERINPUT_BORDER_WIDTH} ${USERINPUT_BORDER}`,
          padding: `${USERINPUT_PAD_TOP} ${USERINPUT_PAD_RIGHT} ${USERINPUT_PAD_BOTTOM} ${USERINPUT_PAD_LEFT}`,
        }}
      >
        <Button color="success" variant="contained" size="medium" iconLeft iconLeftName="check" iconRight={false} label>
          Accepter
        </Button>
        <div style={{ borderRadius: USERINPUT_RADIUS_TAG, display: "flex", flexDirection: "row", justifyContent: "flex-start", alignItems: "flex-start", padding: `${USERINPUT_PAD_Y_TAG} ${USERINPUT_PAD_X_TAG}`, backgroundColor: USERINPUT_BG_TAG }}>
          <span style={{ ...LABEL_SMALL, color: USERINPUT_TEXT_TAG }}>ou</span>
        </div>
        <Button color="error" variant="contained" size="medium" iconLeft iconLeftName="xmark" iconRight={false} label>
          Refuser
        </Button>
      </div>

      <div style={{ alignSelf: "stretch", display: "flex", flexDirection: "row", justifyContent: "flex-start", alignItems: "flex-start", gap: TEXTCOLUMNS_GAP }}>
        {[
          { title: "Point 1", desc: "Ce qui est important de faire pour le point 1 c’est de suivre impérativement les règles du point 1", link: "Lien vers ressource 1" },
          { title: "Point 2", desc: "Ce qui est important de faire pour le point 2 c’est de suivre impérativement les règles du point 2", link: "Lien vers ressource 2" },
          { title: "Point 3", desc: "Ce qui est important de faire pour le point 3 c’est de suivre impérativement les règles du point 3", link: "Lien vers ressource 3" },
        ].map((col, i) => (
          <div key={i} style={{ flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", gap: TEXTCOLUMNS_GAP_COL }}>
            <span style={{ alignSelf: "stretch", ...BODY_LARGE, color: TEXTCOLUMNS_TITLE }}>{col.title}</span>
            <span style={{ alignSelf: "stretch", ...BODY_SMALL, color: TEXTCOLUMNS_DESC }}>{col.desc}</span>
            <span style={{ alignSelf: "stretch", ...LABEL_SMALL, color: TEXTCOLUMNS_LINK }}>{col.link}</span>
          </div>
        ))}
      </div>

      <Divider />
      <TileLinksWrap />
      <ScaleWrap scales={[TOKENS.scaleInfo.scale1, TOKENS.scaleInfo.scale2, TOKENS.scaleInfo.scale3, TOKENS.scaleInfo.scale4, TOKENS.scaleInfo.scale5, TOKENS.scaleInfo.scale6]} />
    </div>
  );
}

// --- Vue "v2" (variant success) : structure `st2` du contrat. ---
function SuccessView() {
  const t = TOKENS.success;
  return (
    <div className="ucm-stresstest" data-variant="success" style={baseContainerStyle(t.baseBackground, BASE_BORDER_COLOR)}>
      <div style={{ alignSelf: "stretch", display: "flex", flexDirection: "column", justifyContent: "flex-start", alignItems: "flex-start", gap: HEAD_GAP, color: t.text }}>
        <span style={TITLE_MEDIUM}>Titre</span>
        <span style={{ alignSelf: "stretch", ...BODY_MEDIUM }}>
          Seconde variante du composant StressTest qui test des variations d’affichage basées sur la 1ère variante et la configuration de composants enfants.
        </span>
      </div>

      <Alert severity="success" variant="outlined" titleText="Le projet est validé" description="Vous n’avez plus rien à faire" actionLabel="Génial" />

      <div style={{ alignSelf: "stretch", display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gridTemplateRows: "15px 15px 15px fit-content(100%) fit-content(100%)", columnGap: TILESGRID_GAP_COL, rowGap: TILESGRID_GAP_ROWS }}>
        <Tile columnStart={1} rowStart={1} rowSpan={2} background={t.tile} />
        <Tile columnStart={2} rowStart={1} background={t.tile} />
        <Tile columnStart={3} rowStart={1} background={t.tile} />
        <Tile columnStart={4} rowStart={1} background={t.tile} />
        <Tile columnStart={2} rowStart={2} background={t.tile} />
        <Tile columnStart={3} rowStart={2} background={t.tile} />
        <Tile columnStart={4} rowStart={2} rowSpan={2} background={t.tile} />
        <Tile columnStart={1} rowStart={3} background={t.tile} />
        <Tile columnStart={2} rowStart={3} background={t.tile} />
        <Tile columnStart={3} rowStart={3} background={t.tile} />
        <Tile columnStart={1} rowStart={4} height="15px" background={t.tile} />
        <Tile columnStart={2} rowStart={4} height="15px" background={t.tile} />
        <Tile columnStart={3} rowStart={4} columnSpan={2} height="15px" background={t.tile} />
        <Tile columnStart={1} rowStart={5} height="15px" background={t.tile} />
        <Tile columnStart={2} rowStart={5} height="15px" background={t.tile} />
        <Tile columnStart={3} rowStart={5} height="15px" background={t.tile} />
        <Tile columnStart={4} rowStart={5} height="15px" background={t.tile} />
      </div>

      <div style={{ alignSelf: "stretch", display: "flex", flexDirection: "row", justifyContent: "flex-start", alignItems: "flex-start", gap: TEXTCOLUMNS_GAP }}>
        <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", gap: TEXTCOLUMNS_GAP_COL }}>
          <span style={{ alignSelf: "stretch", ...BODY_LARGE, color: TEXTCOLUMNS_TITLE }}>Point 1</span>
          <span style={{ alignSelf: "stretch", ...BODY_MEDIUM, color: TEXTCOLUMNS_DESC }}>Ce qui est important de faire pour le point 1 c’est de suivre impérativement les règles du point 1</span>
        </div>
        <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", gap: TEXTCOLUMNS_GAP_COL }}>
          <span style={{ alignSelf: "stretch", ...BODY_LARGE, color: TEXTCOLUMNS_TITLE }}>Point 2</span>
          <span style={{ alignSelf: "stretch", ...BODY_SMALL, color: TEXTCOLUMNS_DESC }}>Ce qui est important de faire pour le point 2 c’est de suivre impérativement les règles du point 2</span>
          <span style={{ alignSelf: "stretch", ...LABEL_SMALL, color: TEXTCOLUMNS_LINK }}>Lien vers ressource 2</span>
        </div>
      </div>

      <Divider />
      <TileLinksWrap />
      <Divider />
      <ScaleWrap scales={[t.scale1, t.scale2, t.scale3, t.scale4, t.scale5, t.scale6]} />

      <div style={{ alignSelf: "stretch", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Button color="secondary" variant="text" size="medium" iconLeft={false} iconRight={false} label>
          Retour
        </Button>
        <Button color="success" variant="text" size="medium" iconLeft iconLeftName="ballot" iconRight={false} label={false} />
        <Button color="info" variant="outlined" size="medium" iconLeft iconLeftName="arrow-right-long" iconRight={false} label>
          Poursuivre
        </Button>
      </div>
    </div>
  );
}

// --- Vue "v3" (variant warning) : structure `st3` du contrat. ---
function WarningView() {
  const t = TOKENS.warning;
  return (
    <div className="ucm-stresstest" data-variant="warning" style={{ ...baseContainerStyle(t.baseBackground, BASE_BORDER_COLOR), position: "relative" }}>
      <div style={{ alignSelf: "stretch", display: "flex", flexDirection: "column", justifyContent: "flex-start", alignItems: "flex-start", gap: HEAD_GAP, color: t.text }}>
        <span style={TITLE_MEDIUM}>Titre</span>
        <span style={{ alignSelf: "stretch", ...BODY_MEDIUM }}>
          Troisième variante du composant StressTest qui test les éléments en position absolute, les rotations et la configuration de composants enfants.
        </span>
      </div>

      <Alert severity="warning" variant="standard" titleText="Attention" description="Ceci est un avertissement" actionLabel="J’ai compris" />

      <div style={{ alignSelf: "stretch", display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gridTemplateRows: "15px fit-content(100%) fit-content(100%) fit-content(100%) fit-content(100%)", columnGap: TILESGRID_GAP_COL, rowGap: TILESGRID_GAP_ROWS }}>
        <Tile columnStart={1} rowStart={1} background={t.tile} />
        <Tile columnStart={2} rowStart={1} background={t.tile} />
        <Tile columnStart={3} rowStart={1} background={t.tile} />
        <Tile columnStart={4} rowStart={1} background={t.tile} />
        <Tile columnStart={1} rowStart={2} height="15px" background={t.tile} />
        <Tile columnStart={2} rowStart={2} columnSpan={2} height="15px" background={t.tile} />
        <Tile columnStart={4} rowStart={2} height="15px" background={t.tile} />
        <Tile columnStart={1} rowStart={3} columnSpan={4} rowSpan={2} height="40px" background={t.tile} />
        <Tile columnStart={1} rowStart={5} height="15px" background={t.tile} />
        <Tile columnStart={2} rowStart={5} height="15px" background={t.tile} />
        <Tile columnStart={3} rowStart={5} height="15px" background={t.tile} />
        <Tile columnStart={4} rowStart={5} height="15px" background={t.tile} />
      </div>

      <Divider />
      <TileLinksWrap />

      {/* Layer "Badge", position absolute, hors flux (contraintes right/top). */}
      <div
        style={{
          position: "absolute",
          top: "13.63px",
          right: "13.63px",
          transform: "rotate(45deg)",
          width: BADGE_SIZE,
          height: BADGE_SIZE,
          borderRadius: BADGE_RADIUS,
          backgroundColor: t.badgeBackground,
          boxShadow: `inset 0 0 0 ${BADGE_BORDER} ${t.badgeForeground}`,
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <span
          aria-hidden="true"
          data-icon="skull"
          style={{ transform: "rotate(-45deg)", width: BADGE_ICON_SIZE, height: BADGE_ICON_SIZE, display: "inline-block", color: t.badgeForeground, fill: t.badgeForeground }}
        />
      </div>
    </div>
  );
}

export function StressTest({ variant = "info", className }: StressTestProps) {
  const content = variant === "success" ? <SuccessView /> : variant === "warning" ? <WarningView /> : <InfoView />;
  return <div className={className}>{content}</div>;
}

export default StressTest;
