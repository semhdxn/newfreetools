import type { ClassroomLayout } from "@/types/floorplan";

/**
 * Shared "furniture" pieces drawn on every classroom layout — the teaching
 * board at the front and the door. Both are visually amplified so pupils
 * can immediately orient themselves on the floor plan:
 *
 *  - Board: taller body, soft glow, chalk/marker tray underline, larger
 *    "BOARD" caption, and a small "Front of room" pointer.
 *  - Door:  larger swinging-door icon with a hinge arc, frame, handle, and
 *    a high-contrast pill caption.
 *
 * Used by both <FloorplanPicker> (interactive) and <FloorplanReview>
 * (read-only) so the child sees the same orientation in both stages.
 */

export function Board({
  layout,
  scale = 1,
}: {
  layout: ClassroomLayout;
  /**
   * Visual amplification factor (>= 1). Lets parent components enlarge
   * the board / captions when the SVG is rendered at a small CSS size,
   * keeping orientation cues prominent at every viewport width.
   */
  scale?: number;
}) {
  const { board } = layout;
  // Beef up the visible footprint without changing the underlying layout
  // coordinates (which are used for seat-position maths elsewhere).
  const padX = 6 * scale;
  const padY = 6 * scale;
  const x = board.x - padX;
  const y = board.y - padY;
  const w = board.width + padX * 2;
  const h = Math.max(board.height + padY * 2, 38 * scale);
  const cx = x + w / 2;
  const trayY = y + h + 6;
  const trayW = w * 0.75;
  // Place the "Front of room" hint above the board, but if the board sits
  // very close to the top edge of the canvas, drop the hint *below* the
  // tray instead so it never collides with the canvas border or with
  // door labels that may sit in the same top strip.
  const hintFontSize = 13 * scale;
  const minTopGap = 6 + hintFontSize; // halo + glyph height
  const hintAbove = y >= minTopGap;
  const hintY = hintAbove
    ? y - 10 * scale
    : trayY + 8 + hintFontSize;

  return (
    <g
      pointerEvents="none"
      aria-hidden
      className="motion-safe:animate-[board-enter_0.55s_cubic-bezier(0.22,1,0.36,1)_both]"
      style={{ transformBox: "fill-box", transformOrigin: "center" }}
    >
      {/* Soft drop-shadow / glow behind the board so it pops off the room. */}
      <rect
        x={x - 3}
        y={y - 3}
        width={w + 6}
        height={h + 6}
        rx={8}
        className="fill-foreground/20"
      />
      {/* The board itself */}
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={6}
        className="fill-foreground stroke-foreground"
        strokeWidth={2}
      />
      {/* Chalk / marker tray running below the board */}
      <rect
        x={cx - trayW / 2}
        y={trayY}
        width={trayW}
        height={6}
        rx={2}
        className="fill-muted-foreground/70"
      />
      {/* Caption — white text on the dark board with a subtle dark halo so
          glyph edges stay crisp even when the SVG is scaled down on phones. */}
      <text
        x={cx}
        y={y + h / 2 + 8}
        textAnchor="middle"
        fontSize={22 * scale}
        className="fill-background stroke-foreground font-extrabold tracking-[0.18em]"
        strokeWidth={0.6 * scale}
        style={{ paintOrder: "stroke fill" }}
      >
        BOARD
      </text>
      {/* "Front of room" hint above the board — given a light halo so it
          reads against both the room background and the board glow. */}
      <text
        x={cx}
        y={hintY}
        textAnchor="middle"
        fontSize={hintFontSize}
        className="fill-foreground stroke-background font-semibold uppercase tracking-[0.15em]"
        strokeWidth={3 * scale}
        style={{ paintOrder: "stroke fill" }}
      >
        Front of room
      </text>
    </g>
  );
}

export function Door({
  layout,
  scale = 1,
}: {
  layout: ClassroomLayout;
  /** See <Board>. */
  scale?: number;
}) {
  const { door, width: W, height: H, board } = layout;
  // Bigger door so it reads from across the room. We anchor a small frame
  // around the door point and draw a hinge-swing arc inside it.
  const dw = 56 * scale;
  const dh = 36 * scale;
  const x = door.x - dw / 2;
  const y = door.y - dh / 2;
  // Decide which side the swing arc opens toward — away from the nearest wall.
  const openLeft = door.x > W / 2;
  // Caption pill placement.
  // The pill is a fixed-size rounded rect; we test 4 candidate positions
  // (above, below, left, right of the door rectangle) and pick the first
  // one that (a) stays inside the room canvas and (b) does not intersect
  // the board's bounding box. Order is biased toward the room interior
  // so the pill points away from the nearest wall, mirroring the swing
  // direction of the door leaf.
  const pillW = 60 * scale;
  const pillH = 26 * scale;
  const gap = 12 * scale;
  // Inflate the board's bounding box a little so the pill keeps a small
  // visual breathing margin from BOARD / "Front of room" labels.
  const boardPad = 14 * scale;
  const boardBox = {
    x1: board.x - boardPad,
    y1: board.y - boardPad - 18 * scale, // include the "Front of room" hint
    x2: board.x + board.width + boardPad,
    y2: board.y + board.height + boardPad + 14, // include the chalk tray
  };
  type PillPos = { cx: number; cy: number };
  const candidates: { side: "above" | "below" | "left" | "right"; pos: PillPos }[] = [
    { side: "above", pos: { cx: door.x, cy: y - gap - pillH / 2 } },
    { side: "below", pos: { cx: door.x, cy: y + dh + gap + pillH / 2 } },
    { side: "left",  pos: { cx: x - gap - pillW / 2, cy: door.y } },
    { side: "right", pos: { cx: x + dw + gap + pillW / 2, cy: door.y } },
  ];
  const margin = 4;
  const fits = (p: PillPos) => {
    const x1 = p.cx - pillW / 2;
    const y1 = p.cy - pillH / 2;
    const x2 = p.cx + pillW / 2;
    const y2 = p.cy + pillH / 2;
    if (x1 < margin || y1 < margin || x2 > W - margin || y2 > H - margin) return false;
    const intersectsBoard =
      x2 > boardBox.x1 && x1 < boardBox.x2 && y2 > boardBox.y1 && y1 < boardBox.y2;
    return !intersectsBoard;
  };
  // Preference order: away from the nearest wall first, then below, then
  // above, then the remaining horizontal side.
  const interiorVertical: "above" | "below" = door.y > H / 2 ? "above" : "below";
  const interiorHorizontal: "left" | "right" = door.x > W / 2 ? "left" : "right";
  const order: ("above" | "below" | "left" | "right")[] = [
    interiorVertical,
    interiorHorizontal,
    interiorVertical === "below" ? "above" : "below",
    interiorHorizontal === "right" ? "left" : "right",
  ];
  const chosen =
    order
      .map((side) => candidates.find((c) => c.side === side)!)
      .find((c) => fits(c.pos)) ?? candidates[0];
  const capCX = chosen.pos.cx;
  const capCY = chosen.pos.cy;

  return (
    <g
      pointerEvents="none"
      aria-hidden
      className="motion-safe:animate-[door-enter_0.5s_cubic-bezier(0.22,1,0.36,1)_0.18s_both]"
      style={{ transformBox: "fill-box", transformOrigin: "center" }}
    >
      {/* Door frame */}
      <rect
        x={x - 2}
        y={y - 2}
        width={dw + 4}
        height={dh + 4}
        rx={5}
        className="fill-card stroke-accent-foreground"
        strokeWidth={2}
      />
      {/* Door leaf */}
      <rect
        x={x}
        y={y}
        width={dw}
        height={dh}
        rx={3}
        className="fill-accent stroke-accent-foreground"
        strokeWidth={2}
      />
      {/* Hinge swing arc — a quarter circle showing which way the door opens */}
      <path
        d={
          openLeft
            ? // Hinge on right edge, swings to left
              `M ${x + dw} ${y + dh} A ${dw} ${dw} 0 0 0 ${x} ${y + dh}`
            : // Hinge on left edge, swings to right
              `M ${x} ${y + dh} A ${dw} ${dw} 0 0 1 ${x + dw} ${y + dh}`
        }
        className="stroke-accent-foreground"
        strokeWidth={1.25}
        strokeDasharray="3 3"
        fill="none"
        opacity={0.6}
      />
      {/* Handle */}
      <circle
        cx={openLeft ? x + 6 : x + dw - 6}
        cy={y + dh / 2}
        r={2.5}
        className="fill-accent-foreground"
      />
      {/* High-contrast caption pill so "DOOR" reads at a glance. The pill
          gets a contrasting outline and the text uses a halo via
          paint-order so it stays legible at small viewport widths. */}
      <rect
        x={capCX - pillW / 2}
        y={capCY - pillH / 2}
        width={pillW}
        height={pillH}
        rx={13 * scale}
        className="fill-accent-foreground stroke-background"
        strokeWidth={1.5 * scale}
      />
      <text
        x={capCX}
        y={capCY + 5 * scale}
        textAnchor="middle"
        fontSize={16 * scale}
        className="fill-accent stroke-accent-foreground font-extrabold tracking-[0.18em]"
        strokeWidth={0.5 * scale}
        style={{ paintOrder: "stroke fill" }}
      >
        DOOR
      </text>
    </g>
  );
}