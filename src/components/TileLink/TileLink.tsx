import { useState, type AnchorHTMLAttributes } from "react";
import { Icone } from "../../Icone";

/** `{chemin.du.token}` → `var(--chemin-du-token)`, comme style-dictionary.config.mjs. */
function token(reference: string): string {
  const chemin = reference.slice(1, -1);
  return `var(--${chemin
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")})`;
}

type Variant = "info" | "success";
type State = "default" | "hover";

/** Transcrit `variants[]` : une entrée par combinaison `variant|state`. */
const VARIANTS: Record<string, { background: string; foreground: string }> = {
  "info|default": { background: "{components.tilelink.colors.info.default.background}", foreground: "{components.tilelink.colors.info.default.foreground}" },
  "info|hover": { background: "{components.tilelink.colors.info.hover.background}", foreground: "{components.tilelink.colors.info.hover.foreground}" },
  "success|default": { background: "{components.tilelink.colors.success.default.background}", foreground: "{components.tilelink.colors.success.default.foreground}" },
  "success|hover": { background: "{components.tilelink.colors.success.hover.background}", foreground: "{components.tilelink.colors.success.hover.foreground}" },
};

const WIDTH = token("{components.tilelink.sizes.width}");
const HEIGHT = token("{components.tilelink.sizes.height}");
const ICON_SIZE = token("{components.tilelink.sizes.icon}");

export interface TileLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant: Variant;
  /** Nom d'icône (kit Font Awesome), modifiable ; replie sur l'icône du contrat. */
  chessName?: string;
  onMouseEnter?: React.MouseEventHandler<HTMLAnchorElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLAnchorElement>;
}

export function TileLink({
  variant,
  chessName = "chess",
  onMouseEnter,
  onMouseLeave,
  style,
  ...rest
}: TileLinkProps) {
  const [hovered, setHovered] = useState(false);
  const state: State = hovered ? "hover" : "default";
  const entry = VARIANTS[`${variant}|${state}`];

  return (
    <a
      {...rest}
      onMouseEnter={(event) => {
        setHovered(true);
        onMouseEnter?.(event);
      }}
      onMouseLeave={(event) => {
        setHovered(false);
        onMouseLeave?.(event);
      }}
      style={{
        display: "flex",
        flexDirection: "row",
        width: WIDTH,
        height: HEIGHT,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: token(entry.background),
        color: token(entry.foreground),
        textDecoration: "none",
        ...style,
      }}
    >
      <Icone nom={chessName} taille={ICON_SIZE} />
    </a>
  );
}
