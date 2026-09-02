export type RowPosition = "front" | "middle" | "back";
export type ColumnPosition =
  | "left-edge"
  | "left"
  | "middle"
  | "right"
  | "right-edge"
  | "aisle";

export interface SeatAttributes {
  rowPosition: RowPosition;
  columnPosition: ColumnPosition;
  distanceFromBoard: number;
  nearDoor: boolean;
  nearBoard: boolean;
}

export interface Seat {
  id: string;
  /** SVG x coordinate (center) */
  x: number;
  /** SVG y coordinate (center) */
  y: number;
  attributes: SeatAttributes;
}

export interface DoorMarker {
  x: number;
  y: number;
  label?: string;
}

export interface BoardMarker {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ClassroomLayout {
  name: string;
  description: string;
  width: number;
  height: number;
  board: BoardMarker;
  door: DoorMarker;
  seats: Seat[];
  decorations?: Array<
    | { kind: "rect"; x: number; y: number; width: number; height: number; label?: string }
    | { kind: "line"; x1: number; y1: number; x2: number; y2: number }
  >;
}

/** Map of classroom index -> array of selected seat ids */
export type FloorplanSelections = Record<number, string[]>;

export interface RecordedSelection {
  classroomIndex: number;
  classroomName: string;
  seatId: string;
  attributes: SeatAttributes;
}
