import type { HTMLAttributes, ReactNode } from "react";
import { Icone } from "../../Icone";
import { Button, type ButtonProps } from "../Button/Button";

/** `{chemin.du.token}` → `var(--chemin-du-token)`, comme style-dictionary.config.mjs. */
function token(reference: string): string {
  const chemin = reference.slice(1, -1);
  return `var(--${chemin
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")})`;
}

type Severity = "info" | "success" | "warning" | "error";
type Variant = "standard" | "outlined";

interface VariantEntry {
  background?: string;
  icon: string;
  foreground: string;
  border?: string;
  iconName: string;
}

/** Transcrit `variants[]` : une entrée par combinaison `severity|variant`. */
const VARIANTS: Record<string, VariantEntry> = {
  "info|standard": { background: "{components.alert.colors.info.standard.background}", icon: "{components.alert.colors.info.standard.icon}", foreground: "{components.alert.colors.info.standard.foreground}", iconName: "circle-info" },
  "info|outlined": { icon: "{components.alert.colors.info.outlined.icon}", foreground: "{components.alert.colors.info.outlined.foreground}", border: "{components.alert.colors.info.outlined.border}", iconName: "circle-info" },
  "success|standard": { background: "{components.alert.colors.success.standard.background}", icon: "{components.alert.colors.success.standard.icon}", foreground: "{components.alert.colors.success.standard.foreground}", iconName: "circle-check" },
  "success|outlined": { icon: "{components.alert.colors.success.outlined.icon}", foreground: "{components.alert.colors.success.outlined.foreground}", border: "{components.alert.colors.success.outlined.border}", iconName: "circle-check" },
  "warning|standard": { background: "{components.alert.colors.warning.standard.background}", icon: "{components.alert.colors.warning.standard.icon}", foreground: "{components.alert.colors.warning.standard.foreground}", iconName: "triangle-exclamation" },
  "warning|outlined": { icon: "{components.alert.colors.warning.outlined.icon}", foreground: "{components.alert.colors.warning.outlined.foreground}", border: "{components.alert.colors.warning.outlined.border}", iconName: "triangle-exclamation" },
  "error|standard": { background: "{components.alert.colors.error.standard.background}", icon: "{components.alert.colors.error.standard.icon}", foreground: "{components.alert.colors.error.standard.foreground}", iconName: "triangle-exclamation" },
  "error|outlined": { icon: "{components.alert.colors.error.outlined.icon}", foreground: "{components.alert.colors.error.outlined.foreground}", border: "{components.alert.colors.error.outlined.border}", iconName: "triangle-exclamation" },
};

const ICON_SIZE = token("{components.icons.sizes.base}");
const BORDER_WIDTH = token("{layouts.stroke.outline}");

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  severity: Severity;
  variant: Variant;
  /** Affiche ou masque l'icône. */
  icon?: boolean;
  /** Affiche ou masque le titre. */
  title?: boolean;
  /** Affiche ou masque le bouton d'action. */
  action?: boolean;
  /** Contenu du titre, remplaçable. */
  titleContent?: ReactNode;
  /** Contenu de la description, remplaçable. */
  children?: ReactNode;
  /** Props transmises au bouton d'action, par défaut celles de l'échantillon. */
  actionButtonProps?: Partial<ButtonProps>;
}

export function Alert({
  severity,
  variant,
  icon = true,
  title = true,
  action = true,
  titleContent = "Titre",
  children = "Description",
  actionButtonProps,
  style,
  ...rest
}: AlertProps) {
  const entry = VARIANTS[`${severity}|${variant}`];

  return (
    <div
      {...rest}
      style={{
        display: "flex",
        flexDirection: "row",
        width: "stretch",
        height: "fit-content",
        justifyContent: "flex-start",
        alignItems: "center",
        gap: token("{components.alert.sizes.gap}"),
        padding: `${token("{components.alert.sizes.padding-y}")} ${token("{components.alert.sizes.padding-x}")}`,
        borderRadius: token("{components.alert.sizes.border-radius}"),
        backgroundColor: entry.background ? token(entry.background) : undefined,
        boxShadow: entry.border ? `inset 0 0 0 ${BORDER_WIDTH} ${token(entry.border)}` : undefined,
        ...style,
      }}
    >
      {icon ? <Icone nom={entry.iconName} taille={ICON_SIZE} couleur={token(entry.icon)} /> : null}
      <div style={{ display: "flex", flexGrow: 1, flexDirection: "column", justifyContent: "center", alignItems: "flex-start" }}>
        {title ? (
          <span
            style={{
              color: token(entry.foreground),
              fontFamily: token("{primitives.fontfamily.base}"),
              fontSize: token("{typography.body.large.fontsize}"),
              fontWeight: token("{typography.body.large.fontweight}") as unknown as number,
              lineHeight: token("{typography.body.large.lineheight}"),
              letterSpacing: token("{typography.body.large.letterspacing}"),
            }}
          >
            {titleContent}
          </span>
        ) : null}
        <span
          style={{
            color: token(entry.foreground),
            fontFamily: token("{primitives.fontfamily.base}"),
            fontSize: token("{typography.body.small.fontsize}"),
            fontWeight: token("{typography.body.small.fontweight}") as unknown as number,
            lineHeight: token("{typography.body.small.lineheight}"),
            letterSpacing: token("{typography.body.small.letterspacing}"),
          }}
        >
          {children}
        </span>
      </div>
      {action ? (
        <div style={{ display: "flex", alignSelf: "stretch", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
          <Button
            color={severity}
            variant="text"
            size="small"
            iconLeft={false}
            iconRight={false}
            label
            {...actionButtonProps}
          >
            {actionButtonProps?.children ?? "Action"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
