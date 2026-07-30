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
import buttonContract from "./components/Button/Button.contract.json";

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

function ButtonMatrix() {
  return (
    <div className="grid gap-3">
      {BUTTON_COLORS.map((color) => (
        <div
          className="rounded-xl border border-slate-200 p-4"
          key={color}
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="font-semibold capitalize text-slate-900">{color}</h3>
            <span className="text-xs text-slate-400">3 variantes · 3 tailles</span>
          </div>
          <div className="grid gap-3 xl:grid-cols-3">
            {BUTTON_VARIANTS.map((variant) => (
              <div className="grid gap-2" key={variant}>
                <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  {variant}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {BUTTON_SIZES.map((size) => (
                    <Button
                      color={color}
                      iconLeft={false}
                      iconRight={false}
                      key={size}
                      size={size}
                      variant={variant}
                    >
                      {size}
                    </Button>
                  ))}
                  <Button
                    color={color}
                    disabled
                    iconLeft={false}
                    iconRight={false}
                    size="small"
                    variant={variant}
                  >
                    disabled
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function AlertMatrix() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {ALERT_SEVERITIES.map((severity) => (
        <div className="rounded-xl border border-slate-200 p-4" key={severity}>
          <h3 className="mb-3 font-semibold capitalize text-slate-900">
            {severity}
          </h3>
          <div className="grid gap-3">
            {ALERT_VARIANTS.map((variant) => (
              <Alert
                action={false}
                key={variant}
                severity={severity}
                titleContent={`${severity} · ${variant}`}
                variant={variant}
              >
                Contenu de démonstration de l’alerte.
              </Alert>
            ))}
          </div>
        </div>
      ))}
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
                Une galerie interactive pour parcourir les contrats de composants,
                tester leurs props et vérifier leurs états directement dans le
                navigateur.
              </p>
            </div>
            <div className="flex gap-2 text-xs font-semibold text-slate-600">
              <span className="rounded-full bg-slate-100 px-3 py-1.5">2 composants</span>
              <span className="rounded-full bg-slate-100 px-3 py-1.5">Contrats 4.2</span>
            </div>
          </div>
          <div className="mt-8 grid gap-3 text-xs text-slate-500 sm:grid-cols-2">
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              Button exporté le {new Date(buttonContract.meta.exportedAt).toLocaleString("fr-FR")}
            </p>
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              Alert exporté le {new Date(alertContract.meta.exportedAt).toLocaleString("fr-FR")}
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
          <div>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className={eyebrowClassName}>Matrice complète</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-950">
                  Toutes les combinaisons visuelles du contrat
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Les boutons sont volontairement sans icône pour faciliter la comparaison.
              </p>
            </div>
            <ButtonMatrix />
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
          <div>
            <div className="mb-4">
              <p className={eyebrowClassName}>Matrice complète</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-950">
                Toutes les sévérités et variantes
              </h3>
            </div>
            <AlertMatrix />
          </div>
        </section>
      </div>
    </main>
  );
}
