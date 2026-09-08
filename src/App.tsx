import { useState } from "react";
import { Case, Section, Bascule } from "./galerie";
import { Button } from "./components/Button/Button";
import { TileLink } from "./components/TileLink/TileLink";
import { Alert } from "./components/Alert/Alert";
import { StressTest } from "./components/StressTest/StressTest";

const COLORS = ["secondary", "primary", "info", "success", "warning", "error"] as const;
const VARIANTS = ["contained", "outlined", "text"] as const;
const SIZES = ["small", "medium", "big"] as const;

function Menu<T extends string>({
  libelle,
  valeur,
  options,
  onChange,
}: {
  libelle: string;
  valeur: T;
  options: readonly T[];
  onChange: (valeur: T) => void;
}) {
  return (
    <label>
      {libelle}{" "}
      <select value={valeur} onChange={(event) => onChange(event.currentTarget.value as T)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function SectionButton() {
  const [color, setColor] = useState<(typeof COLORS)[number]>("primary");
  const [variant, setVariant] = useState<(typeof VARIANTS)[number]>("contained");
  const [size, setSize] = useState<(typeof SIZES)[number]>("medium");
  const [disabled, setDisabled] = useState(false);
  const [icons, setIcons] = useState(true);

  return (
    <Section
      titre="Button"
      aide="Six couleurs, trois variantes, trois tailles. Survol, focus clavier et appui viennent du navigateur."
      controles={
        <>
          <Menu libelle="Couleur" valeur={color} options={COLORS} onChange={setColor} />
          <Menu libelle="Variante" valeur={variant} options={VARIANTS} onChange={setVariant} />
          <Menu libelle="Taille" valeur={size} options={SIZES} onChange={setSize} />
          <Bascule actif={disabled} libelle="Désactivé" onChange={setDisabled} />
          <Bascule actif={icons} libelle="Icônes" onChange={setIcons} />
        </>
      }
    >
      <Case titre={`${color} / ${variant} / ${size}`}>
        <Button color={color} variant={variant} size={size} disabled={disabled} iconLeft={icons} iconRight={icons}>
          Suivant
        </Button>
      </Case>
    </Section>
  );
}

const TILELINK_VARIANTS = ["info", "success"] as const;

function SectionTileLink() {
  const [variant, setVariant] = useState<(typeof TILELINK_VARIANTS)[number]>("info");

  return (
    <Section
      titre="TileLink"
      aide="Deux variantes. L'état de survol vient du navigateur."
      controles={<Menu libelle="Variante" valeur={variant} options={TILELINK_VARIANTS} onChange={setVariant} />}
    >
      <Case titre={variant}>
        <TileLink variant={variant} href="#" />
      </Case>
    </Section>
  );
}

const SEVERITIES = ["info", "success", "warning", "error"] as const;
const ALERT_VARIANTS = ["standard", "outlined"] as const;

function SectionAlert() {
  const [severity, setSeverity] = useState<(typeof SEVERITIES)[number]>("info");
  const [variant, setVariant] = useState<(typeof ALERT_VARIANTS)[number]>("standard");
  const [icon, setIcon] = useState(true);
  const [title, setTitle] = useState(true);
  const [action, setAction] = useState(true);

  return (
    <Section
      titre="Alert"
      aide="Quatre sévérités, deux variantes. Compose le bouton Button dans son emplacement d'action."
      controles={
        <>
          <Menu libelle="Sévérité" valeur={severity} options={SEVERITIES} onChange={setSeverity} />
          <Menu libelle="Variante" valeur={variant} options={ALERT_VARIANTS} onChange={setVariant} />
          <Bascule actif={icon} libelle="Icône" onChange={setIcon} />
          <Bascule actif={title} libelle="Titre" onChange={setTitle} />
          <Bascule actif={action} libelle="Action" onChange={setAction} />
        </>
      }
    >
      <Case titre={`${severity} / ${variant}`}>
        <Alert severity={severity} variant={variant} icon={icon} title={title} action={action} />
      </Case>
    </Section>
  );
}

const STRESSTEST_VARIANTS = ["info", "success", "warning"] as const;

function SectionStressTest() {
  const [variant, setVariant] = useState<(typeof STRESSTEST_VARIANTS)[number]>("info");

  return (
    <Section
      titre="StressTest"
      aide="Layout complexe qui stress-teste l'exporter : imbrication, grilles, wrap, position absolue. Chaque variante a sa propre structure."
      controles={<Menu libelle="Variante" valeur={variant} options={STRESSTEST_VARIANTS} onChange={setVariant} />}
    >
      <Case titre={variant}>
        <StressTest variant={variant} />
      </Case>
    </Section>
  );
}

export function App() {
  return (
    <main>
      <header>
        <h1>Galerie des sondes</h1>
        <p>
          Quatre composants reconstruits à froid depuis leurs contrats UCM :
          Button, TileLink, Alert, StressTest.
        </p>
      </header>
      <SectionButton />
      <SectionTileLink />
      <SectionAlert />
      <SectionStressTest />
    </main>
  );
}
