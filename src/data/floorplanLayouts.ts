import type {
  ClassroomLayout,
  ColumnPosition,
  RowPosition,
  Seat,
  SeatAttributes,
  RecordedSelection,
  FloorplanSelections,
} from "@/types/floorplan";

const W = 800;
const H = 520;
const SEAT_R = 18;

function rowPositionFor(rowIndex: number, totalRows: number): RowPosition {
  if (totalRows <= 1) return "front";
  const t = rowIndex / (totalRows - 1);
  if (t < 0.34) return "front";
  if (t < 0.67) return "middle";
  return "back";
}

/**
 * Geometry-driven column classification.
 *
 * Walks every seat in the layout, groups them into rows by y-coordinate
 * (tolerant of curved rows like the horseshoe / theater layouts), then
 * splits each row into contiguous "blocks" wherever the gap between two
 * adjacent seats is large enough to be either a marked aisle or a missing
 * seat. Within each block we apply the rule:
 *
 *   - "middle"     — a seat with another seat immediately to its left AND
 *                    right inside the same block.
 *   - "left"       — left edge of an interior block (i.e. there's another
 *                    block / aisle to its left).
 *   - "right"      — right edge of an interior block.
 *   - "left-edge"  — leftmost seat of the leftmost block in the row.
 *   - "right-edge" — rightmost seat of the rightmost block in the row.
 *
 * Singleton blocks (one isolated seat surrounded by gaps) get the
 * appropriate edge label or fall back to a left/right based on which side
 * of the room they sit on. We never invent "middle" for an isolated seat —
 * the user's definition requires real seats both sides.
 *
 * Seats sitting inside a declared aisle column keep the explicit "aisle"
 * label set by the layout function before this pass runs.
 */
function assignColumnPositions(seats: Seat[], roomWidth: number) {
  if (seats.length === 0) return;

  // Bucket seats into rows. Tolerance must absorb the vertical curl of
  // curved layouts (theater rows / horseshoe arcs) while still keeping
  // distinct rows in their own bucket.
  const ROW_TOL = SEAT_R * 2.5;
  const sortedByY = [...seats].sort((a, b) => a.y - b.y);
  const rows: Seat[][] = [];
  let current: Seat[] = [];
  let rowAnchor = sortedByY[0].y;
  for (const seat of sortedByY) {
    if (Math.abs(seat.y - rowAnchor) <= ROW_TOL) {
      current.push(seat);
    } else {
      rows.push(current);
      current = [seat];
      rowAnchor = seat.y;
    }
  }
  if (current.length) rows.push(current);

    // Each row may use its own seat spacing (e.g. theater curve vs grid),
    // so compute the typical step from the row's own gaps and treat any
    // gap notably bigger than that as an aisle / missing-seat split.
    for (const row of rows) {
      const sorted = [...row].sort((a, b) => a.x - b.x);

      let splitGap = Infinity;
      if (sorted.length >= 2) {
        const gaps: number[] = [];
        for (let i = 1; i < sorted.length; i++) gaps.push(sorted[i].x - sorted[i - 1].x);
        const sortedGaps = [...gaps].sort((a, b) => a - b);
        const median = sortedGaps[Math.floor(sortedGaps.length / 2)];
        // Split when a gap is at least 1.6× the row's typical spacing AND
        // bigger than one seat-width (avoids splitting tightly packed rows
        // that have minor jitter in their step size).
        splitGap = Math.max(median * 1.6, SEAT_R * 2.2);
      }

      // Build blocks of contiguous seats.
      const blocks: Seat[][] = [[sorted[0]]];
      for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i - 1];
        const seat = sorted[i];
        if (seat.x - prev.x > splitGap) {
          blocks.push([seat]);
        } else {
          blocks[blocks.length - 1].push(seat);
        }
      }

    blocks.forEach((block, blockIdx) => {
      const isLeftmostBlock = blockIdx === 0;
      const isRightmostBlock = blockIdx === blocks.length - 1;

      block.forEach((seat, seatIdx) => {
        // Don't override an explicit "aisle" tag set by the layout.
        if (seat.attributes.columnPosition === "aisle") return;

        const isFirstInBlock = seatIdx === 0;
        const isLastInBlock = seatIdx === block.length - 1;
        const isSingleton = block.length === 1;

        let pos: ColumnPosition;
        if (isSingleton) {
          if (blocks.length === 1) {
            // Whole row is one isolated seat — call it by room side.
            pos = seat.x < roomWidth / 2 ? "left" : "right";
          } else if (isLeftmostBlock) {
            pos = "left-edge";
          } else if (isRightmostBlock) {
            pos = "right-edge";
          } else {
            pos = seat.x < roomWidth / 2 ? "left" : "right";
          }
        } else if (isFirstInBlock) {
          pos = isLeftmostBlock ? "left-edge" : "left";
        } else if (isLastInBlock) {
          pos = isRightmostBlock ? "right-edge" : "right";
        } else {
          // Has neighbours both sides inside the block.
          pos = "middle";
        }

        seat.attributes.columnPosition = pos;
      });
    });
  }
}

function distance(ax: number, ay: number, bx: number, by: number) {
  return Math.hypot(ax - bx, ay - by);
}

function buildAttributes(
  seatX: number,
  seatY: number,
  rowIndex: number,
  totalRows: number,
  colIndex: number,
  totalCols: number,
  doorX: number,
  doorY: number,
  aisleCols: number[] = [],
): SeatAttributes {
  const distanceFromBoard = rowIndex + 1;
  const nearBoard = rowIndex === 0;
  const nearDoor = distance(seatX, seatY, doorX, doorY) < SEAT_R * 4.5;
  // Column position is filled in by assignColumnPositions() once every seat
  // in the layout exists. We seed it as "aisle" if this seat sits in a
  // declared aisle column so the post-pass can preserve that tag, otherwise
  // a placeholder that will be overwritten.
  const columnPosition: ColumnPosition = aisleCols.includes(colIndex)
    ? "aisle"
    : "middle";
  return {
    rowPosition: rowPositionFor(rowIndex, totalRows),
    columnPosition,
    distanceFromBoard,
    nearDoor,
    nearBoard,
  };
}

function straightGrid(): ClassroomLayout {
  const rows = 5;
  const cols = 6;
  const startX = 130;
  const startY = 150;
  const stepX = 95;
  const stepY = 70;
  const door = { x: 60, y: H - 60, label: "Door" };
  const seats: Seat[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = startX + c * stepX;
      const y = startY + r * stepY;
      seats.push({ id: `r${r}c${c}`, x, y, attributes: buildAttributes(x, y, r, rows, c, cols, door.x, door.y) });
    }
  }
  return {
    name: "Straight Grid",
    description: "Classic 5 rows × 6 seats facing the board.",
    width: W, height: H,
    board: { x: 200, y: 50, width: 400, height: 30 },
    door, seats,
  };
}

function centerAisle(): ClassroomLayout {
  const rows = 5;
  const leftCols = 3;
  const rightCols = 3;
  const totalCols = leftCols + rightCols + 1;
  const aisleCols = [3];
  const startY = 150;
  const stepY = 70;
  const seatStep = 80;
  const aisleGap = 80;
  const leftStartX = 140;
  const door = { x: W - 50, y: 70, label: "Door" };
  const seats: Seat[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < leftCols; c++) {
      const x = leftStartX + c * seatStep;
      const y = startY + r * stepY;
      seats.push({ id: `L-r${r}c${c}`, x, y, attributes: buildAttributes(x, y, r, rows, c, totalCols, door.x, door.y, aisleCols) });
    }
    for (let c = 0; c < rightCols; c++) {
      const colIndex = leftCols + 1 + c;
      const x = leftStartX + (leftCols - 1) * seatStep + aisleGap + (c + 1) * seatStep;
      const y = startY + r * stepY;
      seats.push({ id: `R-r${r}c${c}`, x, y, attributes: buildAttributes(x, y, r, rows, colIndex, totalCols, door.x, door.y, aisleCols) });
    }
  }
  return {
    name: "Center Aisle",
    description: "Two columns of seats split by a central walking aisle.",
    width: W, height: H,
    board: { x: 200, y: 50, width: 400, height: 30 },
    door, seats,
    decorations: [{
      kind: "rect",
      x: leftStartX + (leftCols - 1) * seatStep + seatStep / 2,
      y: 130,
      width: aisleGap - seatStep / 2,
      height: rows * stepY,
    }],
  };
}

function twoPods(): ClassroomLayout {
  const rows = 5;
  const podCols = 3;
  const totalCols = podCols * 2 + 1;
  const aisleCols = [podCols];
  const stepX = 70;
  const stepY = 70;
  const startY = 130;
  const podGap = 140;
  const leftStartX = 130;
  const rightStartX = leftStartX + (podCols - 1) * stepX + podGap;
  const door = { x: W / 2, y: H - 40, label: "Door" };
  const seats: Seat[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < podCols; c++) {
      const x = leftStartX + c * stepX;
      const y = startY + r * stepY;
      seats.push({ id: `LP-r${r}c${c}`, x, y, attributes: buildAttributes(x, y, r, rows, c, totalCols, door.x, door.y, aisleCols) });
    }
    for (let c = 0; c < podCols; c++) {
      const colIndex = podCols + 1 + c;
      const x = rightStartX + c * stepX;
      const y = startY + r * stepY;
      seats.push({ id: `RP-r${r}c${c}`, x, y, attributes: buildAttributes(x, y, r, rows, colIndex, totalCols, door.x, door.y, aisleCols) });
    }
  }
  return {
    name: "Two Pods",
    description: "Two clustered seating pods with a wide central walkway.",
    width: W, height: H,
    board: { x: 200, y: 50, width: 400, height: 30 },
    door, seats,
  };
}

function horseshoe(): ClassroomLayout {
  const door = { x: 60, y: 70, label: "Door" };
  const seats: Seat[] = [];
  const rings = [
    { rowIndex: 2, count: 12, rx: 320, ry: 200, cx: W / 2, cy: 220 },
    { rowIndex: 1, count: 10, rx: 230, ry: 150, cx: W / 2, cy: 230 },
    { rowIndex: 0, count: 8,  rx: 140, ry: 100, cx: W / 2, cy: 240 },
  ];
  const totalRows = 3;
  const startAngle = Math.PI * 1.15;
  const endAngle = Math.PI * -0.15;
  rings.forEach((ring) => {
    for (let i = 0; i < ring.count; i++) {
      const t = i / (ring.count - 1);
      const angle = startAngle + (endAngle - startAngle) * t;
      const x = ring.cx + Math.cos(angle) * ring.rx;
      const y = ring.cy + Math.sin(angle) * ring.ry;
      seats.push({ id: `H-r${ring.rowIndex}i${i}`, x, y, attributes: buildAttributes(x, y, ring.rowIndex, totalRows, i, ring.count, door.x, door.y) });
    }
  });
  return {
    name: "Horseshoe",
    description: "U-shaped seating curving around the board for discussion.",
    width: W, height: H,
    board: { x: W / 2 - 120, y: 30, width: 240, height: 26 },
    door, seats,
  };
}

function theaterRows(): ClassroomLayout {
  const rows = 3;
  const cols = 10;
  const door = { x: W - 50, y: H - 50, label: "Door" };
  const seats: Seat[] = [];
  const baseY = [180, 290, 400];
  const curve = 30;
  const startX = 90;
  const endX = W - 90;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const t = c / (cols - 1);
      const x = startX + (endX - startX) * t;
      const offset = curve * (1 - 4 * (t - 0.5) ** 2);
      const y = baseY[r] - offset;
      seats.push({ id: `T-r${r}c${c}`, x, y, attributes: buildAttributes(x, y, r, rows, c, cols, door.x, door.y) });
    }
  }
  return {
    name: "Theater Rows",
    description: "Three long curved rows like a small lecture theater.",
    width: W, height: H,
    board: { x: W / 2 - 180, y: 50, width: 360, height: 30 },
    door, seats,
  };
}

function mixedClusters(): ClassroomLayout {
  const door = { x: 50, y: H / 2, label: "Door" };
  const seats: Seat[] = [];
  const tables = [
    { cx: 220, cy: 170, rowIndex: 0 },
    { cx: 420, cy: 160, rowIndex: 0 },
    { cx: 620, cy: 180, rowIndex: 0 },
    { cx: 230, cy: 380, rowIndex: 2 },
    { cx: 430, cy: 390, rowIndex: 2 },
    { cx: 630, cy: 380, rowIndex: 2 },
  ];
  const totalRows = 3;
  const seatsPerTable = 5;
  const tableR = 55;
  tables.forEach((tbl, ti) => {
    for (let i = 0; i < seatsPerTable; i++) {
      const angle = (i / seatsPerTable) * Math.PI * 2 - Math.PI / 2;
      const x = tbl.cx + Math.cos(angle) * tableR;
      const y = tbl.cy + Math.sin(angle) * tableR;
      const colIndex = tbl.cx < W / 3 ? 0 : tbl.cx < (2 * W) / 3 ? 1 : 2;
      seats.push({ id: `C-t${ti}s${i}`, x, y, attributes: buildAttributes(x, y, tbl.rowIndex, totalRows, colIndex, 3, door.x, door.y) });
    }
  });
  return {
    name: "Mixed Clusters",
    description: "Round-table groups encouraging small-group collaboration.",
    width: W, height: H,
    board: { x: W / 2 - 140, y: 40, width: 280, height: 28 },
    door, seats,
    decorations: tables.map((tbl) => ({
      kind: "rect" as const,
      x: tbl.cx - 32, y: tbl.cy - 32, width: 64, height: 64,
    })),
  };
}

export const FLOORPLAN_LAYOUTS: ClassroomLayout[] = [
  straightGrid(),
  centerAisle(),
  twoPods(),
  horseshoe(),
  theaterRows(),
  mixedClusters(),
];

// Run the geometry-driven column classifier across every layout so that
// missing seats and multi-aisle splits are handled uniformly.
for (const layout of FLOORPLAN_LAYOUTS) {
  assignColumnPositions(layout.seats, layout.width);
}

export const SEAT_RADIUS = SEAT_R;

/** Build flat list of recorded selections for one pass. */
export function buildRecorded(
  layouts: ClassroomLayout[],
  selections: FloorplanSelections,
): RecordedSelection[] {
  const out: RecordedSelection[] = [];
  layouts.forEach((layout, idx) => {
    const ids = new Set(selections[idx] ?? []);
    if (ids.size === 0) return;
    layout.seats.forEach((seat) => {
      if (ids.has(seat.id)) {
        out.push({
          classroomIndex: idx,
          classroomName: layout.name,
          seatId: seat.id,
          attributes: seat.attributes,
        });
      }
    });
  });
  return out;
}

export function aggregateStats(recorded: RecordedSelection[]) {
  return {
    total: recorded.length,
    front: recorded.filter((r) => r.attributes.rowPosition === "front").length,
    middle: recorded.filter((r) => r.attributes.rowPosition === "middle").length,
    back: recorded.filter((r) => r.attributes.rowPosition === "back").length,
    // Horizontal centre column of the room (any row).
    centerColumn: recorded.filter((r) => r.attributes.columnPosition === "middle").length,
    // Heart of the room: middle row AND middle column.
    centerRoom: recorded.filter(
      (r) => r.attributes.rowPosition === "middle" && r.attributes.columnPosition === "middle",
    ).length,
    nearDoor: recorded.filter((r) => r.attributes.nearDoor).length,
    nearBoard: recorded.filter((r) => r.attributes.nearBoard).length,
  };
}