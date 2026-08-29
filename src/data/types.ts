export type ResponseType = 'over' | 'under' | 'seeking';

export interface SensoryArea {
  id: string;
  name: string;
  responseType: ResponseType;
  label: string; // e.g. "Vision - Over-responsive"
}

export interface Statement {
  id: string;
  areaId: string;
  text: string;
  source?: string;
}

export interface Strategy {
  id: string;
  areaId: string;
  text: string;
  source?: string;
}

export interface AreaResult {
  area: SensoryArea;
  totalStatements: number;
  selectedCount: number;
  percentage: number;
  strategies: Strategy[];
  displayedStrategies: Strategy[];
  selectedStatementObjects: Statement[];
}

export interface AssessmentData {
  initials: string;
  phase: string;
  selectedStatements: string[];
  results: AreaResult[];
  username: string;
  password: string;
}
