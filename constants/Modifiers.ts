export type ModifierId = "reveal" | "shuffle" | "skip";

export interface ModifierDefinition {
  id: ModifierId;
  label: string;
  description: string;
}

export const MODIFIERS: ModifierDefinition[] = [
  {
    id: "reveal",
    label: "Revelar",
    description: "Revela todas as cartas por 1 segundo.",
  },
  {
    id: "shuffle",
    label: "Embaralhar",
    description: "Embaralha as cartas restantes.",
  },
  {
    id: "skip",
    label: "Pular",
    description: "Ignora a próxima penalidade de erro.",
  },
];
