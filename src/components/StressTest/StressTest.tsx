import type { CSSProperties, HTMLAttributes } from "react";
import { Alert } from "../Alert/Alert";
import { Button } from "../Button/Button";
import { TileLink } from "../TileLink/TileLink";
import type { StressTestVariant } from "../../generated/contracts/StressTest";

function tokenVar(ref: string): string {
  return `var(--${ref.slice(1, -1).replace(/\./g, "-")})`;
}

function insideBorder(color: string, width: string): string {
  return `inset 0 0 0 ${tokenVar(width)} ${tokenVar(color)}`;
}

type TextStyle = {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing: string;
};

const TEXT_STYLES: Record<string, TextStyle> = {
  "title.medium": {
    fontFamily: tokenVar("{primitives.fontfamily.base}"),
    fontSize: tokenVar("{typography.title.medium.fontsize}"),
    fontWeight: tokenVar("{typography.title.medium.fontweight}"),
    lineHeight: tokenVar("{typography.title.medium.lineheight}"),
    letterSpacing: tokenVar("{typography.title.medium.letterspacing}"),
  },
  "body.medium": {
    fontFamily: tokenVar("{primitives.fontfamily.base}"),
    fontSize: tokenVar("{typography.body.medium.fontsize}"),
    fontWeight: tokenVar("{typography.body.medium.fontweight}"),
    lineHeight: tokenVar("{typography.body.medium.lineheight}"),
    letterSpacing: tokenVar("{typography.body.medium.letterspacing}"),
  },
  "body.large": {
    fontFamily: tokenVar("{primitives.fontfamily.base}"),
    fontSize: tokenVar("{typography.body.large.fontsize}"),
    fontWeight: tokenVar("{typography.body.large.fontweight}"),
    lineHeight: tokenVar("{typography.body.large.lineheight}"),
    letterSpacing: tokenVar("{typography.body.large.letterspacing}"),
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

function textStyle(name: keyof typeof TEXT_STYLES): CSSProperties {
  return TEXT_STYLES[name] as CSSProperties;
}

function Head() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignSelf: "stretch",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        gap: tokenVar("{components.stresstest.info.head.sizes.gap}"),
      }}
    >
      <span
        style={{
          ...textStyle("title.medium"),
          color: tokenVar("{components.stresstest.info.head.colors.text}"),
        }}
      >
        Titre
      </span>
      <span
        style={{
          ...textStyle("body.medium"),
          alignSelf: "stretch",
          color: tokenVar("{components.stresstest.info.head.colors.text}"),
        }}
      >
        Description de l’élément sur quelques lignes, idéalement deux au maximum.
      </span>
    </div>
  );
}

interface TilePlacement {
  columnStart: number;
  rowStart: number;
  columnSpan?: number;
  rowSpan?: number;
  height?: string;
}

const TILES_INFO: TilePlacement[] = [
  { columnStart: 1, rowStart: 1 },
  { columnStart: 2, rowStart: 1 },
  { columnStart: 3, rowStart: 1 },
  { columnStart: 4, rowStart: 1 },
  { columnStart: 1, rowStart: 2, height: "15px" },
  { columnStart: 2, rowStart: 2, columnSpan: 2, height: "15px" },
  { columnStart: 4, rowStart: 2, height: "15px" },
  { columnStart: 1, rowStart: 3, columnSpan: 4, rowSpan: 2, height: "40px" },
  { columnStart: 1, rowStart: 5, height: "15px" },
  { columnStart: 2, rowStart: 5, height: "15px" },
  { columnStart: 3, rowStart: 5, height: "15px" },
  { columnStart: 4, rowStart: 5, height: "15px" },
];

const TILES_SUCCESS: TilePlacement[] = [
  { columnStart: 1, rowStart: 1, rowSpan: 2 },
  { columnStart: 2, rowStart: 1 },
  { columnStart: 3, rowStart: 1 },
  { columnStart: 4, rowStart: 1 },
  { columnStart: 2, rowStart: 2 },
  { columnStart: 3, rowStart: 2 },
  { columnStart: 4, rowStart: 2, rowSpan: 2 },
  { columnStart: 1, rowStart: 3 },
  { columnStart: 2, rowStart: 3 },
  { columnStart: 3, rowStart: 3 },
  { columnStart: 1, rowStart: 4, height: "15px" },
  { columnStart: 2, rowStart: 4, height: "15px" },
  { columnStart: 3, rowStart: 4, columnSpan: 2, height: "15px" },
  { columnStart: 1, rowStart: 5, height: "15px" },
  { columnStart: 2, rowStart: 5, height: "15px" },
  { columnStart: 3, rowStart: 5, height: "15px" },
  { columnStart: 4, rowStart: 5, height: "15px" },
];

function TilesGrid({ variant }: { variant: StressTestVariant }) {
  const isSuccess = variant === "success";
  const rowSizes = isSuccess
    ? ["15px", "15px", "15px", "fit-content(100%)", "fit-content(100%)"]
    : ["15px", "fit-content(100%)", "fit-content(100%)", "fit-content(100%)", "fit-content(100%)"];
  const tiles = isSuccess ? TILES_SUCCESS : TILES_INFO;
  const tileColor = isSuccess
    ? tokenVar("{components.stresstest.success.tilesgrid.colors.tile}")
    : tokenVar("{components.stresstest.info.tilesgrid.colors.tile}");

  return (
    <div
      style={{
        display: "grid",
        alignSelf: "stretch",
        gridTemplateColumns: "1fr 1fr 1fr 1fr",
        gridTemplateRows: rowSizes.join(" "),
        columnGap: tokenVar("{components.stresstest.info.tilesgrid.sizes.gap-col}"),
        rowGap: tokenVar("{components.stresstest.info.tilesgrid.sizes.gap-rows}"),
      }}
    >
      {tiles.map((tile, index) => (
        <div
          key={index}
          style={{
            gridColumnStart: tile.columnStart,
            gridColumnEnd: tile.columnStart + (tile.columnSpan ?? 1),
            gridRowStart: tile.rowStart,
            gridRowEnd: tile.rowStart + (tile.rowSpan ?? 1),
            borderRadius: tokenVar("{components.stresstest.info.tilesgrid.sizes.radius}"),
            backgroundColor: tileColor,
            height: tile.height,
          }}
        />
      ))}
    </div>
  );
}

interface ColumnContent {
  point: string;
  description: string;
  descriptionStyle: keyof typeof TEXT_STYLES;
  link?: string;
}

const COLUMNS_INFO: ColumnContent[] = [
  {
    point: "Point 1",
    description:
      "Ce qui est important de faire pour le point 1 c’est de suivre impérativement les règles du point 1",
    descriptionStyle: "body.small",
    link: "Lien vers ressource 1",
  },
  {
    point: "Point 2",
    description:
      "Ce qui est important de faire pour le point 2 c’est de suivre impérativement les règles du point 2",
    descriptionStyle: "body.small",
    link: "Lien vers ressource 2",
  },
  {
    point: "Point 3",
    description:
      "Ce qui est important de faire pour le point 3 c’est de suivre impérativement les règles du point 3",
    descriptionStyle: "body.small",
    link: "Lien vers ressource 3",
  },
];

const COLUMNS_SUCCESS: ColumnContent[] = [
  {
    point: "Point 1",
    description:
      "Ce qui est important de faire pour le point 1 c’est de suivre impérativement les règles du point 1",
    descriptionStyle: "body.medium",
  },
  {
    point: "Point 2",
    description:
      "Ce qui est important de faire pour le point 2 c’est de suivre impérativement les règles du point 2",
    descriptionStyle: "body.small",
    link: "Lien vers ressource 2",
  },
];

function TextColumns({ variant }: { variant: StressTestVariant }) {
  const columns = variant === "success" ? COLUMNS_SUCCESS : COLUMNS_INFO;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignSelf: "stretch",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        gap: tokenVar("{components.stresstest.info.textcolumns.sizes.gap}"),
      }}
    >
      {columns.map((column, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "flex-start",
            gap: tokenVar("{components.stresstest.info.textcolumns.sizes.gap-col}"),
          }}
        >
          <span
            style={{
              ...textStyle("body.large"),
              alignSelf: "stretch",
              color: tokenVar("{components.stresstest.info.textcolumns.colors.title}"),
            }}
          >
            {column.point}
          </span>
          <span
            style={{
              ...textStyle(column.descriptionStyle),
              alignSelf: "stretch",
              color: tokenVar("{components.stresstest.info.textcolumns.colors.description}"),
            }}
          >
            {column.description}
          </span>
          {column.link !== undefined && (
            <span
              style={{
                ...textStyle("label.small"),
                alignSelf: "stretch",
                color: tokenVar("{components.stresstest.info.textcolumns.colors.link}"),
              }}
            >
              {column.link}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function Divider() {
  return (
    <div
      style={{
        alignSelf: "stretch",
        height: tokenVar("{components.stresstest.info.divider.sizes.height}"),
        maxWidth: tokenVar("{components.stresstest.info.divider.sizes.max-width}"),
        backgroundColor: tokenVar("{components.stresstest.info.divider.colors.background}"),
      }}
    />
  );
}

interface TileLinkContent {
  variant: "info" | "success";
  chessName?: string;
}

const TILELINKS_INFO: TileLinkContent[] = [
  { variant: "info" },
  { variant: "info", chessName: "circle-9" },
  { variant: "info", chessName: "duck" },
  { variant: "info", chessName: "oil-temperature" },
  { variant: "info", chessName: "fence" },
  { variant: "info", chessName: "wheat" },
  { variant: "info", chessName: "candle-holder" },
];

const TILELINKS_SUCCESS: TileLinkContent[] = [
  { variant: "success", chessName: "chess-king-piece" },
  { variant: "info", chessName: "circle-arrow-up" },
  { variant: "info", chessName: "dumbbell" },
  { variant: "info", chessName: "oil-can-drip" },
  { variant: "info", chessName: "ferris-wheel" },
  { variant: "info", chessName: "whale" },
  { variant: "success", chessName: "candy" },
];

function tileLinksWrapStyle(): CSSProperties {
  return {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    alignSelf: "stretch",
    justifyContent: "flex-start",
    alignItems: "center",
    columnGap: tokenVar("{components.stresstest.info.tilelinkswrap.sizes.gap-x}"),
    rowGap: tokenVar("{components.stresstest.info.tilelinkswrap.sizes.gap-y}"),
  };
}

const SCALE_COLORS_INFO = [
  "{components.stresstest.info.scalewrap.colors.scale-1}",
  "{components.stresstest.info.scalewrap.colors.scale-2}",
  "{components.stresstest.info.scalewrap.colors.scale-3}",
  "{components.stresstest.info.scalewrap.colors.scale-4}",
  "{components.stresstest.info.scalewrap.colors.scale-5}",
  "{components.stresstest.info.scalewrap.colors.scale-6}",
] as const;

const SCALE_COLORS_SUCCESS = [
  "{components.stresstest.success.scalewrap.colors.scale-1}",
  "{components.stresstest.success.scalewrap.colors.scale-2}",
  "{components.stresstest.success.scalewrap.colors.scale-3}",
  "{components.stresstest.success.scalewrap.colors.scale-4}",
  "{components.stresstest.success.scalewrap.colors.scale-5}",
  "{components.stresstest.success.scalewrap.colors.scale-6}",
] as const;

function ScaleWrap({ variant }: { variant: StressTestVariant }) {
  const isSuccess = variant === "success";
  const scaleColors = isSuccess ? SCALE_COLORS_SUCCESS : SCALE_COLORS_INFO;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        alignSelf: "stretch",
        justifyContent: "flex-start",
        alignItems: "center",
        height: tokenVar("{components.stresstest.info.scalewrap.sizes.height}"),
      }}
    >
      {scaleColors.map((colorRef, index) => {
        const step = index + 1;
        return (
          <div
            key={step}
            style={{
              alignSelf: "stretch",
              flexGrow: 1,
              backgroundColor: tokenVar(colorRef),
              borderTopLeftRadius:
                step === 1 ? tokenVar("{components.stresstest.info.scalewrap.sizes.radius-top-left}") : undefined,
              borderBottomLeftRadius:
                step === 1
                  ? tokenVar("{components.stresstest.info.scalewrap.sizes.radius-bottom-left}")
                  : undefined,
              borderTopRightRadius:
                step === 6 ? tokenVar("{components.stresstest.info.scalewrap.sizes.radius-top-right}") : undefined,
              borderBottomRightRadius:
                step === 6
                  ? tokenVar("{components.stresstest.info.scalewrap.sizes.radius-bottom-right}")
                  : undefined,
            }}
          />
        );
      })}
    </div>
  );
}

function actionsWrapStyle(): CSSProperties {
  return {
    display: "flex",
    flexDirection: "row",
    alignSelf: "stretch",
    justifyContent: "space-between",
    alignItems: "center",
  };
}

interface StressTestContractProps {
  variant?: StressTestVariant;
}

export interface StressTestProps
  extends Omit<HTMLAttributes<HTMLDivElement>, keyof StressTestContractProps>,
    StressTestContractProps {}

export function StressTest({ variant = "info", style, ...rest }: StressTestProps) {
  const isSuccess = variant === "success";
  const tilelinks = isSuccess ? TILELINKS_SUCCESS : TILELINKS_INFO;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "fit-content",
        height: "fit-content",
        maxWidth: tokenVar("{components.stresstest.info.base.sizes.max-width}"),
        justifyContent: "center",
        alignItems: "center",
        gap: tokenVar("{components.stresstest.info.base.sizes.gap}"),
        padding: tokenVar("{components.stresstest.info.base.sizes.padding}"),
        borderRadius: tokenVar("{components.stresstest.info.base.sizes.border-radius}"),
        boxShadow: insideBorder(
          "{components.stresstest.info.base.colors.border}",
          "{components.stresstest.info.base.sizes.border-width}",
        ),
        ...style,
      }}
      {...rest}
    >
      <Head />
      <Alert
        style={{ alignSelf: "stretch" }}
        action
        title
        icon
        severity={isSuccess ? "success" : "info"}
        variant={isSuccess ? "outlined" : "standard"}
      />
      <TilesGrid variant={variant} />

      {!isSuccess && (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignSelf: "stretch",
            justifyContent: "space-between",
            alignItems: "center",
            borderRadius: tokenVar("{components.stresstest.info.userinput.sizes.border-radius}"),
            paddingLeft: tokenVar("{components.stresstest.info.userinput.sizes.padding-left}"),
            paddingRight: tokenVar("{components.stresstest.info.userinput.sizes.padding-right}"),
            paddingTop: tokenVar("{components.stresstest.info.userinput.sizes.padding-top}"),
            paddingBottom: tokenVar("{components.stresstest.info.userinput.sizes.padding-bottom}"),
            backgroundColor: tokenVar("{components.stresstest.info.userinput.colors.background}"),
            boxShadow: insideBorder(
              "{components.stresstest.info.userinput.colors.border}",
              "{components.stresstest.info.userinput.sizes.border-width}",
            ),
          }}
        >
          <Button
            color="success"
            variant="contained"
            iconLeft
            iconRight={false}
            label
            size="medium"
            iconLeftName="check"
          >
            Accepter
          </Button>
          <div
            style={{
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
            }}
          >
            <span
              style={{
                ...textStyle("label.small"),
                color: tokenVar("{components.stresstest.info.userinput.colors.text-color-tag}"),
              }}
            >
              ou
            </span>
          </div>
          <Button
            color="error"
            variant="contained"
            iconLeft
            iconRight={false}
            label
            size="medium"
            iconLeftName="xmark"
          >
            Refuser
          </Button>
        </div>
      )}

      <TextColumns variant={variant} />
      <Divider />

      <div style={tileLinksWrapStyle()}>
        <TileLink variant={tilelinks[0].variant} chessName={tilelinks[0].chessName} />
        <TileLink variant={tilelinks[1].variant} chessName={tilelinks[1].chessName} />
        <TileLink variant={tilelinks[2].variant} chessName={tilelinks[2].chessName} />
        <TileLink variant={tilelinks[3].variant} chessName={tilelinks[3].chessName} />
        <TileLink variant={tilelinks[4].variant} chessName={tilelinks[4].chessName} />
        <TileLink variant={tilelinks[5].variant} chessName={tilelinks[5].chessName} />
        <TileLink variant={tilelinks[6].variant} chessName={tilelinks[6].chessName} />
      </div>

      {isSuccess && <Divider />}

      <ScaleWrap variant={variant} />

      {isSuccess && (
        <div style={actionsWrapStyle()}>
          <Button
            color="secondary"
            variant="text"
            iconLeft={false}
            iconRight={false}
            label
            size="medium"
          >
            Retour
          </Button>
          <Button
            color="success"
            variant="text"
            iconLeft
            iconRight={false}
            label={false}
            size="medium"
            iconLeftName="ballot"
          />
          <Button
            color="info"
            variant="outlined"
            iconLeft
            iconRight={false}
            label
            size="medium"
            iconLeftName="arrow-right-long"
          >
            Poursuivre
          </Button>
        </div>
      )}
    </div>
  );
}
