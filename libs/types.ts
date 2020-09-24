export type NodeType = "root" | "node" | "leaf";

export interface NodeConfig {
  id: string;
  type: NodeType;
  level: number;
  statistics: Statistics;
}

export interface Statistics {
  all: number;
  selected: number;
}

export interface KeyConfig {
  resourceKey: string;
  subNodeKey: string;
}

export interface SerialConfig {
  resourceSerial: string;
  groupSerial: string;
}
