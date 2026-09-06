/**
 * La galerie : chaque sonde reconstruite, rendue dans ses combinaisons, pour
 * être comparée à l'écran avec la maquette.
 *
 * Les listes ci-dessous sont écrites en toutes lettres. Rien ici ne lit un
 * contrat au moment du rendu : ce dépôt consomme des artefacts, il n'en
 * interprète aucun. Une combinaison qui disparaît d'un contrat disparaît de la
 * sonde, et cette page suit à la main — c'est le prix, assumé, de n'avoir
 * aucun moteur local.
 */
import { useState } from "react";

import { Alert } from "../components/Alert/index.ts";
import type { AlertSeverity, AlertVariant } from "../components/Alert/index.ts";
import { Button } from "../components/Button/index.ts";
import type {
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from "../components/Button/index.ts";
import { StressTest } from "../components/StressTest/index.ts";
import type { StressTestVariant } from "../components/StressTest/index.ts";
import { TileLink } from "../components/TileLink/index.ts";
import type { TileLinkVariant } from "../components/TileLink/index.ts";

const BUTTON_COLORS: ButtonColor[] = [
  "primary",
  "secondary",
  "info",
  "success",
  "warning",
  "error",
];
const BUTTON_VARIANTS: ButtonVariant[] = ["contained", "outlined", "text"];
const BUTTON_SIZES: ButtonSize[] = ["big", "medium", "small"];
const ALERT_SEVERITIES: AlertSeverity[] = ["info", "success", "warning", "error"];
const ALERT_VARIANTS: AlertVariant[] = ["standard", "outlined"];
const TILELINK_VARIANTS: TileLinkVariant[] = ["info", "success"];
const STRESSTEST_VARIANTS: StressTestVariant[] = ["info", "success", "warning"];

/** Une case de la grille : son étiquette, puis ce qu'elle montre. */
function Case({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <figure className="case">
      <figcaption>{titre}</figcaption>
      <div className="scene">{children}</div>
    </figure>
  );
}

function Section({
  titre,
  aide,
  controles,
  children,
}: {
  titre: string;
  aide: string;
  controles?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2>{titre}</h2>
      <p className="aide">{aide}</p>
      {controles ? <div className="controles">{controles}</div> : null}
      <div className="grille">{children}</div>
    </section>
  );
}

function Bascule({
  actif,
  libelle,
  onChange,
}: {
  actif: boolean;
  libelle: string;
  onChange: (actif: boolean) => void;
}) {
  return (
    <label>
      <input
        checked={actif}
        onChange={(evenement) => onChange(evenement.currentTarget.checked)}
        type="checkbox"
      />
      {libelle}
    </label>
  );
}

function Boutons() {
  const [label, setLabel] = useState(true);
  const [iconLeft, setIconLeft] = useState(false);
  const [iconRight, setIconRight] = useState(false);
  const [disabled, setDisabled] = useState(false);

  return (
    <Section
      aide="Six couleurs, trois variantes, trois tailles. Survoler, focaliser au clavier puis presser pour voir les états."
      titre="Button"
      controles={
        <>
          <Bascule actif={label} libelle="label" onChange={setLabel} />
          <Bascule actif={iconLeft} libelle="iconLeft" onChange={setIconLeft} />
          <Bascule actif={iconRight} libelle="iconRight" onChange={setIconRight} />
          <Bascule actif={disabled} libelle="disabled" onChange={setDisabled} />
        </>
      }
    >
      {BUTTON_VARIANTS.map((variant) =>
        BUTTON_SIZES.map((size) => (
          <Case key={`${variant}-${size}`} titre={`${variant} · ${size}`}>
            {BUTTON_COLORS.map((color) => (
              <Button
                color={color}
                disabled={disabled}
                iconLeft={iconLeft}
                iconRight={iconRight}
                key={color}
                label={label}
                size={size}
                variant={variant}
              >
                {color}
              </Button>
            ))}
          </Case>
        )),
      )}
    </Section>
  );
}

function Alertes() {
  const [icon, setIcon] = useState(true);
  const [title, setTitle] = useState(true);
  const [action, setAction] = useState(true);

  return (
    <Section
      aide="Quatre sévérités, deux variantes, trois zones masquables et un Button composé."
      titre="Alert"
      controles={
        <>
          <Bascule actif={icon} libelle="icon" onChange={setIcon} />
          <Bascule actif={title} libelle="title" onChange={setTitle} />
          <Bascule actif={action} libelle="action" onChange={setAction} />
        </>
      }
    >
      {ALERT_VARIANTS.map((variant) =>
        ALERT_SEVERITIES.map((severity) => (
          <Case key={`${variant}-${severity}`} titre={`${variant} · ${severity}`}>
            <Alert
              action={action}
              icon={icon}
              severity={severity}
              title={title}
              variant={variant}
            />
          </Case>
        )),
      )}
    </Section>
  );
}

function Tuiles() {
  return (
    <Section
      aide="Deux variantes, l'état hover, et une icône remplaçable qu'aucun booléen ne masque."
      titre="TileLink"
    >
      {TILELINK_VARIANTS.map((variant) => (
        <Case key={variant} titre={variant}>
          <TileLink href="#" variant={variant} />
        </Case>
      ))}
    </Section>
  );
}

function Tests() {
  return (
    <Section
      aide="Trois vues aux arbres différents : grille, spans, enveloppement, bornes de taille, padding par côté et onze dépendances composées."
      titre="StressTest"
    >
      {STRESSTEST_VARIANTS.map((variant) => (
        <Case key={variant} titre={variant}>
          <StressTest variant={variant} />
        </Case>
      ))}
    </Section>
  );
}

export function App() {
  return (
    <main>
      <header>
        <h1>Galerie des sondes</h1>
        <p>
          Quatre composants reconstruits depuis les contrats de{" "}
          <code>components/</code>, peints par les variables CSS produites depuis{" "}
          <code>tokens.json</code>. Ce sont des sondes jetables : elles servent à
          comparer un export à la maquette, jamais à être réutilisées.
        </p>
      </header>
      <Boutons />
      <Alertes />
      <Tuiles />
      <Tests />
    </main>
  );
}
