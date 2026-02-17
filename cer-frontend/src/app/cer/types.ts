export type ColumnType = "claim" | "evidence" | "reasoning";

export type CardType = {
  id: string;
  content: string;
  column: ColumnType;
};

export type ConnectionType = {
  id: string;
  fromId: string;
  toId: string;
};
