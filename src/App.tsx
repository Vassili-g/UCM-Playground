import { useState } from "react";

import { Alert } from "./components/Alert/index.ts";
import type {
  AlertSeverity,
  AlertVariant,
} from "./components/Alert/index.ts";
import { Button } from "./components/Button/index.ts";
import type {
  ButtonColor,
  ButtonIconName,
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from "./components/Button/index.ts";
import alertContract from "./components/Alert/Alert.contract.json";
import { StressTest } from "./components/StressTest/index.ts";
import { TileLink } from "./components/TileLink/index.ts";
import type {
  TileLinkIconName,
  TileLinkVariant,
} from "./components/TileLink/index.ts";
import buttonContract from "./components/Button/Button.contract.json";
import stressTestContract from "./components/StressTest/StressTest.contract.json";
import tileLinkContract from "./components/TileLink/TileLink.contract.json";

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
const ALERT_SEVERITIES: AlertSeverity[] = [
  "info",
  "success",
  "warning",
  "error",
];
const ALERT_VARIANTS: AlertVariant[] = ["standard", "outlined"];
const TILELINK_VARIANTS: TileLinkVariant[] = ["info", "success"];
const TYPOGRAPHY_TYPES = ["display", "headline", "title", "body", "label"] as const;
const TYPOGRAPHY_NAMES = ["large", "medium", "small"] as const;
type TypographyType = (typeof TYPOGRAPHY_TYPES)[number];
type TypographyName = (typeof TYPOGRAPHY_NAMES)[number];

const selectClassName =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200";
const panelClassName =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";
const eyebrowClassName =
  "text-xs font-semibold uppercase tracking-[0.18em] text-slate-500";

function Toggle({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
      <input
        checked={checked}
        className="h-4 w-4 accent-slate-800"
        onChange={(event) => onChange(event.currentTarget.checked)}
        type="checkbox"
      />
      {label}
    </label>
  );
}

function Field({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-slate-700">
      {label}
      {children}
    </label>
  );
}

function ButtonControls() {
  const [color, setColor] = useState<ButtonColor>("primary");
  const [variant, setVariant] = useState<ButtonVariant>("contained");
  const [size, setSize] = useState<ButtonSize>("medium");
  const [disabled, setDisabled] = useState(false);
  const [label, setLabel] = useState(true);
  const [iconLeft, setIconLeft] = useState(true);
  const [iconRight, setIconRight] = useState(true);
  const [text, setText] = useState("Tester le bouton");
  const [leftName, setLeftName] = useState<ButtonIconName>("arrow-left-long");
  const [rightName, setRightName] = useState<ButtonIconName>(
    "arrow-right-long",
  );

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]">
      <div className={panelClassName}>
        <p className={eyebrowClassName}>Bac à sable</p>
        <h3 className="mt-2 text-lg font-semibold text-slate-950">
          Tester l’API Button
        </h3>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <Field label="Color">
            <select
              className={selectClassName}
              value={color}
              onChange={(event) => setColor(event.currentTarget.value as ButtonColor)}
            >
              {BUTTON_COLORS.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </Field>
          <Field label="Variant">
            <select
              className={selectClassName}
              value={variant}
              onChange={(event) =>
                setVariant(event.currentTarget.value as ButtonVariant)
              }
            >
              {BUTTON_VARIANTS.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </Field>
          <Field label="Size">
            <select
              className={selectClassName}
              value={size}
              onChange={(event) => setSize(event.currentTarget.value as ButtonSize)}
            >
              {BUTTON_SIZES.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Libellé">
            <input
              className={selectClassName}
              value={text}
              onChange={(event) => setText(event.currentTarget.value)}
            />
          </Field>
          <Field label="Nom d’icône gauche">
            <input
              className={selectClassName}
              value={leftName}
              onChange={(event) => setLeftName(event.currentTarget.value)}
            />
          </Field>
          <Field label="Nom d’icône droite">
            <input
              className={selectClassName}
              value={rightName}
              onChange={(event) => setRightName(event.currentTarget.value)}
            />
          </Field>
        </div>
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3">
          <Toggle checked={label} label="label" onChange={setLabel} />
          <Toggle checked={iconLeft} label="iconLeft" onChange={setIconLeft} />
          <Toggle
            checked={iconRight}
            label="iconRight"
            onChange={setIconRight}
          />
          <Toggle checked={disabled} label="disabled" onChange={setDisabled} />
        </div>
      </div>
      <div className={`${panelClassName} flex min-h-56 flex-col justify-between`}>
        <div>
          <p className={eyebrowClassName}>Aperçu vivant</p>
          <p className="mt-2 text-sm text-slate-500">
            Survole, focalise au clavier, presse puis relâche le bouton pour
            observer les états du contrat.
          </p>
        </div>
        <div className="flex min-h-24 items-center justify-center rounded-xl bg-slate-50 p-4">
          <Button
            aria-label="Bouton de démonstration"
            color={color}
            disabled={disabled}
            iconLeft={iconLeft}
            iconLeftName={leftName || null}
            iconRight={iconRight}
            iconRightName={rightName || null}
            label={label}
            size={size}
            variant={variant}
          >
            {text}
          </Button>
        </div>
      </div>
    </div>
  );
}

function AlertControls() {
  const [severity, setSeverity] = useState<AlertSeverity>("info");
  const [variant, setVariant] = useState<AlertVariant>("standard");
  const [icon, setIcon] = useState(true);
  const [title, setTitle] = useState(true);
  const [action, setAction] = useState(true);

  const actionProps: ButtonProps = {
    children: "Voir le détail",
    color: severity,
    iconLeft: false,
    iconRight: false,
    size: "small",
    variant: "text",
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]">
      <div className={panelClassName}>
        <p className={eyebrowClassName}>Bac à sable</p>
        <h3 className="mt-2 text-lg font-semibold text-slate-950">
          Tester l’API Alert
        </h3>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Severity">
            <select
              className={selectClassName}
              value={severity}
              onChange={(event) =>
                setSeverity(event.currentTarget.value as AlertSeverity)
              }
            >
              {ALERT_SEVERITIES.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </Field>
          <Field label="Variant">
            <select
              className={selectClassName}
              value={variant}
              onChange={(event) =>
                setVariant(event.currentTarget.value as AlertVariant)
              }
            >
              {ALERT_VARIANTS.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3">
          <Toggle checked={icon} label="icon" onChange={setIcon} />
          <Toggle checked={title} label="title" onChange={setTitle} />
          <Toggle checked={action} label="action" onChange={setAction} />
        </div>
      </div>
      <div className={`${panelClassName} flex min-h-56 items-center`}>
        <Alert
          action={action}
          actionProps={actionProps}
          icon={icon}
          severity={severity}
          title={title}
          titleContent="Titre de l’alerte"
          variant={variant}
        >
          Un message court qui montre le contenu informatif du composant.
        </Alert>
      </div>
    </div>
  );
}

function TileLinkControls() {
  const [variant, setVariant] = useState<TileLinkVariant>("info");
  const [chessName, setChessName] = useState<TileLinkIconName>("chess");

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]">
      <div className={panelClassName}>
        <p className={eyebrowClassName}>Bac à sable</p>
        <h3 className="mt-2 text-lg font-semibold text-slate-950">
          Tester l’API TileLink
        </h3>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Variant">
            <select
              className={selectClassName}
              value={variant}
              onChange={(event) =>
                setVariant(event.currentTarget.value as TileLinkVariant)
              }
            >
              {TILELINK_VARIANTS.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </Field>
          <Field label="Nom d’icône">
            <input
              className={selectClassName}
              value={chessName}
              onChange={(event) => setChessName(event.currentTarget.value)}
            />
          </Field>
        </div>
        <p className="mt-5 text-sm leading-6 text-slate-500">
          L’icône est <strong>modifiable sans être masquable</strong> : le contrat
          publie <code>chessName</code> sans booléen de visibilité. Vider le
          champ rend le glyphe de repli nommé par Figma.
        </p>
      </div>
      <div className={`${panelClassName} flex min-h-56 flex-col justify-between`}>
        <div>
          <p className={eyebrowClassName}>Aperçu vivant</p>
          <p className="mt-2 text-sm text-slate-500">
            Survole la tuile pour observer l’état <code>hover</code> du contrat.
            Son <code>structure.sizing</code> cite deux variables : la tuile
            porte son propre carré, sans cadre pour le lui donner.
          </p>
        </div>
        <div className="flex min-h-24 items-center justify-center rounded-xl bg-slate-50 p-4">
          <TileLink
            aria-label="Tuile de démonstration"
            chessName={chessName || null}
            href="#tilelink-heading"
            variant={variant}
          />
        </div>
      </div>
    </div>
  );
}

function StressTestShowcase() {
  return (
    <div className="grid gap-5">
      <div className={panelClassName}>
        <p className={eyebrowClassName}>Aperçu vivant</p>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
          Le composant n’a qu’une variante : il n’y a rien à régler, seulement à
          observer. Il enchaîne une grille CSS à pistes et à fusions, deux
          conteneurs qui enveloppent (<code>wrap</code>), un padding détaillé
          côté par côté, un divider borné en largeur, et trois composants
          composés — une <code>Alert</code>, deux <code>Button</code> et sept{" "}
          <code>TileLink</code>.
        </p>
        <div className="mt-5 overflow-x-auto rounded-xl bg-slate-50 p-4">
          <StressTest
            alertProps={{
              actionProps: {
                children: "Voir le détail",
                color: "info",
                iconLeft: false,
                iconRight: false,
                size: "small",
                variant: "text",
              },
              children:
                "Les pièces déposées sont conservées pendant toute l’instruction du dossier.",
              severity: "info",
              titleContent: "Dépôt de pièces",
              variant: "standard",
            }}
            columns={[
              {
                title: "Point 1",
                description:
                  "Ce qui est important de faire pour le point 1 c’est de suivre impérativement les règles du point 1",
                link: "Lien vers ressource 1",
              },
              {
                title: "Point 2",
                description:
                  "Ce qui est important de faire pour le point 2 c’est de suivre impérativement les règles du point 2",
                link: "Lien vers ressource 2",
              },
              {
                title: "Point 3",
                description:
                  "Ce qui est important de faire pour le point 3 c’est de suivre impérativement les règles du point 3",
                link: "Lien vers ressource 3",
              },
            ]}
            firstActionProps={{
              children: "Choisir un fichier",
              color: "primary",
              iconLeft: false,
              iconRight: false,
              size: "small",
              variant: "contained",
            }}
            secondActionProps={{
              children: "Coller une URL",
              color: "secondary",
              iconLeft: false,
              iconRight: false,
              size: "small",
              variant: "outlined",
            }}
            tagContent="ou"
            tileLinks={[
              { href: "#stresstest-heading", variant: "info" },
              { href: "#stresstest-heading", variant: "success" },
              { href: "#stresstest-heading", variant: "info" },
              { href: "#stresstest-heading", variant: "success" },
              { href: "#stresstest-heading", variant: "info" },
              { href: "#stresstest-heading", variant: "success" },
              { href: "#stresstest-heading", variant: "info" },
            ]}
            titleContent="Titre"
          >
            Description de l’élément sur quelques lignes, idéalement deux au
            maximum.
          </StressTest>
        </div>
      </div>
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
          Ce que le test froid a trouvé
        </p>
        <ul className="mt-3 grid list-disc gap-2 pl-5 text-sm leading-6 text-amber-900">
          <li>
            <strong>
              Seule la première ligne de la grille a une hauteur.
            </strong>{" "}
            La piste 1 est <code>FIXED</code> et vaut <code>15px</code> — c’est
            l’exception que <code>meta.warnings</code> annonce. Les pistes 2 à 5
            valent <code>fit-content(100%)</code> et aucune tuile ne publie de{" "}
            <code>size</code> : ces quatre lignes tombent donc à zéro. Le
            composant les rend telles quelles, sans inventer de hauteur.
          </li>
        </ul>
        <p className="mt-3 text-sm leading-6 text-amber-900">
          Rien à corriger dans Figma : les tuiles y sont bien en <em>Fill</em>.
          Sous une piste qui <em>hug</em>, Figma n’expose pas ce remplissage et
          ne rend que la taille résolue — c’est au moteur d’export de la publier,
          comme il publie déjà celle d’une piste <code>FIXED</code>.
        </p>
      </div>
    </div>
  );
}

function TypographySandbox() {
  const [type, setType] = useState<TypographyType>("body");
  const [name, setName] = useState<TypographyName>("large");
  const className = `ucm-type-${type}-${name}`;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className={eyebrowClassName}>Bac à sable</p>
      <h2 className="mt-2 text-2xl font-bold text-slate-950">
        Typographies
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
        Choisis un text style exporté pour vérifier sa famille, sa taille, sa
        graisse, son interlettrage et sa hauteur de ligne.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Type">
          <select
            className={selectClassName}
            value={type}
            onChange={(event) => setType(event.currentTarget.value as TypographyType)}
          >
            {TYPOGRAPHY_TYPES.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </Field>
        <Field label="Nom">
          <select
            className={selectClassName}
            value={name}
            onChange={(event) => setName(event.currentTarget.value as TypographyName)}
          >
            {TYPOGRAPHY_NAMES.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </Field>
      </div>
      <div className="mt-5 rounded-xl bg-slate-50 p-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          {type} / {name}
        </p>
        <p className={`ucm-typography-sample ${className}`}>
          La typographie rend le système lisible.
        </p>
      </div>
    </div>
  );
}

export function App() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className={eyebrowClassName}>Unified Component Model</p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
                UCM Playground
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                Des bacs à sable pour tester les contrats de composants et les
                styles typographiques exportés directement dans le navigateur.
              </p>
            </div>
            <div className="flex gap-2 text-xs font-semibold text-slate-600">
              <span className="rounded-full bg-slate-100 px-3 py-1.5">4 composants</span>
              <span className="rounded-full bg-slate-100 px-3 py-1.5">
                Contrats {stressTestContract.meta.contractVersion} et {tileLinkContract.meta.contractVersion}
              </span>
            </div>
          </div>
          <div className="mt-8 grid gap-3 text-xs text-slate-500 sm:grid-cols-2 lg:grid-cols-4">
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              Button exporté le {new Date(buttonContract.meta.exportedAt).toLocaleString("fr-FR")}
            </p>
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              Alert exporté le {new Date(alertContract.meta.exportedAt).toLocaleString("fr-FR")}
            </p>
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              TileLink exporté le {new Date(tileLinkContract.meta.exportedAt).toLocaleString("fr-FR")}
            </p>
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              StressTest exporté le {new Date(stressTestContract.meta.exportedAt).toLocaleString("fr-FR")}
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-10 lg:px-8">
        <section aria-labelledby="button-heading" className="grid gap-5">
          <div>
            <p className={eyebrowClassName}>Composant 01</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950" id="button-heading">
              Button
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Six couleurs, trois variantes, trois tailles, deux icônes
              modifiables et les états hover, focus, press et disabled.
            </p>
          </div>
          <ButtonControls />
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
              Ce que le test froid a trouvé
            </p>
            <p className="mt-3 text-sm leading-6 text-amber-900">
              <strong>
                En <code>primary</code> / <code>contained</code> /{" "}
                <code>hover</code>, l’icône de droite devient noire.
              </strong>{" "}
              C’est le seul des 90 variants dont la vue exacte (<code>v4</code>)
              omet <code>label/icon-2</code> de{" "}
              <code>paintPlacements.fills.foreground</code> : le contrat ne
              désigne pas ce calque, le rendu ne le peint donc pas. Dans Figma,
              le vecteur y porte sa couleur sans variable — l’export l’a laissée
              tomber, en silence.
            </p>
          </div>
        </section>

        <section aria-labelledby="alert-heading" className="grid gap-5">
          <div>
            <p className={eyebrowClassName}>Composant 02</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950" id="alert-heading">
              Alert
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Quatre niveaux de sévérité, deux variantes, trois zones masquables
              et un bouton composé configurable.
            </p>
          </div>
          <AlertControls />
        </section>

        <section aria-labelledby="tilelink-heading" className="grid gap-5">
          <div>
            <p className={eyebrowClassName}>Composant 03</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950" id="tilelink-heading">
              TileLink
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Deux variantes, l’état hover, et une icône remplaçable qu’aucun
              booléen ne masque — ce que la 5.0 a rendu exprimable.
            </p>
          </div>
          <TileLinkControls />
        </section>

        <section aria-labelledby="stresstest-heading" className="grid gap-5">
          <div>
            <p className={eyebrowClassName}>Composant 04</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950" id="stresstest-heading">
              StressTest
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Une seule variante, mais tout ce qu’un contrat doit savoir écrire :
              grille, spans, enveloppement, bornes de taille, padding par côté et
              dix dépendances composées.
            </p>
          </div>
          <StressTestShowcase />
        </section>

        <TypographySandbox />
      </div>
    </main>
  );
}
