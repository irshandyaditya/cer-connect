export type ColumnType = "claim" | "evidence" | "reasoning";

export type CardType = {
  id: string;
  text: string;
  column: ColumnType;
};

export type ConnectionType = {
  id: string;
  fromId: string;
  toId: string;
};

export type ConnectingFromType = {
  cardId: string;
  column: ColumnType;
} | null;

export type ColDef = {
  id: ColumnType;
  label: string;
  icon: string;
  canConnectTo: ColumnType | null;
};

export const COL_DEFS: ColDef[] = [
  { id: "claim", label: "Claim", icon: "✍️", canConnectTo: "evidence" },
  { id: "evidence", label: "Evidence", icon: "📋", canConnectTo: "reasoning" },
  { id: "reasoning", label: "Reasoning", icon: "💡", canConnectTo: null },
];