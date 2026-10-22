import { Link } from "react-router-dom";
import "@/chronology/chron.css";
import { TestingNotice } from "@/chronology/components/TestingNotice";
import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarRange, ChevronDown, ChevronUp, Download, FileText, Image as ImageIcon, Globe, Lock, Pencil, Plus, Printer, RotateCcw, Sparkles, Trash2, Upload, X } from "lucide-react";
import { AGE_BANDS, TimelineSheet, type TimelineView } from "@/chronology/components/TimelineSheet";
import { TimelineSummary } from "@/chronology/components/TimelineSummary";
import { EventForm } from "@/chronology/components/EventForm";
import { QuickEntry } from "@/chronology/components/QuickEntry";
import { GuidedEntry } from "@/chronology/components/GuidedEntry";
import { Introduction } from "@/chronology/components/Introduction";
import { sampleTimeline } from "@/chronology/lib/sample";
import { reportCounts, wellbeingOf } from "@/chronology/lib/wellbeing";
import { ImportPreview } from "@/chronology/components/ImportPreview";
import { MonthYearInput } from "@/chronology/components/MonthYearInput";
import { Menu, MenuItem } from "@/chronology/components/Menu";
import {
  CATEGORIES, catById, displayLabel, downloadBlob, emptyPerson, eventKey, formatDate, newId, parseCSV, safeRef, templateCSV, toCSV, todayISO,
  type ImportResult, type Person, type TimelineEvent,
} from "@/chronology/lib/timeline";

type HtmlOpts = { notes: boolean; ids: boolean; towns: boolean };

export default function ChronologyTool() {
  const [person, setPerson] = useState<Person>(emptyPerson);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [dirty, setDirty] = useState(false);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [redact, setRedact] = useState<{ person: Person; clean: (e: TimelineEvent) => TimelineEvent } | null>(null);
  const [htmlOpts, setHtmlOpts] = useState<HtmlOpts | null>(null);
  const [editing, setEditing] = useState<TimelineEvent | "new" | null>(null);
  const [pending, setPending] = useState<{ name: string; result: ImportResult } | null>(null);
  const [toast, setToast] = useState("");
  const [dragging, setDragging] = useState(false);
  const [paper, setPaper] = useState<"a4" | "a3">("a4");
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState<TimelineView>("lanes");
  const [hideLow, setHideLow] = useState(false);
  const [simple, setSimple] = useState(false);
  const [focus, setFocus] = useState("all");
  const [fromY, setFromY] = useState("");
  const [toY, setToY] = useState("");
  const [mode, setMode] = useState<"intro" | "timeline" | "guided">("intro");
  const [showAdd, setShowAdd] = useState(false);
  const [showPerson, setShowPerson] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showEvents, setShowEvents] = useState(false);
  const [step, setStep] = useState(0);
  const [sticky, setSticky] = useState<{ category: string; type: string; significance: TimelineEvent["significance"] }>({ category: "", type: "", significance: "medium" });
  const [formSeq, setFormSeq] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  const hasData = events.length > 0 || !!person.label || !!person.dob || !!person.preparedBy;
  // Details stay tucked away once they're filled in; the form is only forced open on a blank sheet.
  const personOpen = showPerson || !hasData;
  const dobYear = person.dob ? Number(person.dob.slice(0, 4)) + (Number(person.dob.slice(5, 7)) - 1) / 12 : null;
  const yearSpan = useMemo<[number, number]>(() => {
    const ys = events.flatMap((e) => [e.start, e.end].filter(Boolean).map((d) => Number(d.slice(0, 4))));
    if (dobYear !== null) ys.push(Math.floor(dobYear));
    const now = new Date().getFullYear();
    return ys.length ? [Math.min(...ys), Math.max(...ys, Math.min(now, Math.max(...ys) + 1))] : [now - 5, now];
  }, [events, dobYear]);
  const yearOptions = Array.from({ length: yearSpan[1] - yearSpan[0] + 2 }, (_, i) => yearSpan[0] + i);
  const focusRange = useMemo<[number, number] | null>(() => {
    if (focus.startsWith("stage:") && dobYear !== null) {
      const b = AGE_BANDS[Number(focus.slice(6))];
      return b ? [dobYear + b.from, dobYear + b.to] : null;
    }
    if (focus === "range" && fromY && toY) {
      const a = Number(fromY), z = Number(toY);
      return [Math.min(a, z), Math.max(a, z) + 1];
    }
    return null;
  }, [focus, fromY, toY, dobYear]);

  useEffect(() => {
    if (!dirty || !hasData) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty, hasData]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  const sorted = useMemo(() => [...events].sort((a, b) => a.start.localeCompare(b.start)), [events]);
  const updatePerson = (p: Partial<Person>) => { setPerson((o) => ({ ...o, ...p })); setDirty(true); };
  const fileBase = () => `timeline_${safeRef(person.label)}_${todayISO()}`;

  const saveEvent = (ev: TimelineEvent) => { setEvents((o) => (o.some((x) => x.id === ev.id) ? o.map((x) => (x.id === ev.id ? ev : x)) : [...o, ev])); setDirty(true); };
  const stickyDraft = (): TimelineEvent => {
    const cat = sticky.category ? catById(sticky.category) : CATEGORIES[0];
    const type = (cat.types as readonly string[]).includes(sticky.type) ? sticky.type : cat.types[0];
    return { id: newId(), category: cat.id, type, label: "", location: "", start: "", startPrecision: "month", end: "", endPrecision: "month", ongoing: false, approximate: false, significance: sticky.significance, note: "" };
  };
  const addQuick = (ev: TimelineEvent) => { saveEvent(ev); setToast(`Added "${ev.label}".`); };

  const readFile = (file: File | undefined) => {
    if (fileRef.current) fileRef.current.value = "";
    if (!file) return;
    if (!/\.csv$/i.test(file.name) && file.type !== "text/csv") { setToast("Please choose a .csv file."); return; }
    const reader = new FileReader();
    reader.onload = () => setPending({ name: file.name, result: parseCSV(String(reader.result ?? "")) });
    reader.onerror = () => setToast("Could not read that file.");
    reader.readAsText(file);
  };

  const confirmImport = (how: "replace" | "merge") => {
    if (!pending) return;
    const { person: p, events: incoming } = pending.result;
    if (how === "replace" || !hasData) {
      setPerson(p ?? emptyPerson());
      setEvents(incoming);
      setToast(`Loaded ${incoming.length} event(s).`);
      setDirty(false);
    } else {
      const keys = new Set(events.map(eventKey));
      const fresh = incoming.filter((e) => { const k = eventKey(e); if (keys.has(k)) return false; keys.add(k); return true; });
      setEvents((o) => [...o, ...fresh]);
      if (p) setPerson((o) => ({ label: o.label || p.label, dob: o.dob || p.dob, dobPrecision: o.dob ? o.dobPrecision : p.dobPrecision, preparedBy: o.preparedBy || p.preparedBy }));
      setToast(`Added ${fresh.length} event(s); skipped ${incoming.length - fresh.length} exact duplicate(s).`);
      setDirty(true);
    }
    setPending(null);
    if (mode === "intro") setMode("timeline");
  };

  const exportCSV = () => { downloadBlob(toCSV(person, sorted), `${fileBase()}.csv`); setDirty(false); };

  const renderPng = async () => {
    const { toPng } = await import("html-to-image");
    const node = sheetRef.current!;
    const bg = getComputedStyle(node).backgroundColor;
    return toPng(node, { pixelRatio: 2, backgroundColor: bg, width: node.scrollWidth, height: node.scrollHeight });
  };

  const exportPNG = async () => {
    setBusy(true);
    try { const url = await renderPng(); const a = document.createElement("a"); a.href = url; a.download = `${fileBase()}.png`; a.click(); }
    catch { setToast("Could not create image."); } finally { setBusy(false); }
  };

  const exportSimplePDF = async () => {
    setBusy(true); setSimple(true);
    try {
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 80))));
      const { jsPDF } = await import("jspdf");
      const sheet = sheetRef.current;
      const body = sheet?.querySelector<HTMLElement>("[data-tl-body]");
      if (!sheet || !body) throw new Error("Report not ready");
      const img = new Image();
      await new Promise<void>(async (resolve, reject) => { img.onload = () => resolve(); img.onerror = reject; try { img.src = await renderPng(); } catch (err) { reject(err); } });
      const sr = sheet.getBoundingClientRect(), br = body.getBoundingClientRect(), R = 2;
      const bg = getComputedStyle(sheet).backgroundColor;
      const crop = (el: HTMLElement) => {
        const r = el.getBoundingClientRect();
        const c = document.createElement("canvas");
        c.width = Math.min(el.scrollWidth, 1400) * R; c.height = el.scrollHeight * R;
        const ctx = c.getContext("2d");
        if (!ctx) throw new Error("Cannot create report image");
        ctx.fillStyle = bg; ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(img, (r.left - sr.left) * R, (r.top - sr.top) * R, c.width, c.height, 0, 0, c.width, c.height);
        return c;
      };
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: paper });
      const pw = pdf.internal.pageSize.getWidth(), ph = pdf.internal.pageSize.getHeight(), m = 8, availW = pw - m * 2;
      const labels = sheet.querySelector<HTMLElement>("[data-report-labels]");
      const key = sheet.querySelector<HTMLElement>("[data-icon-key]");
      const panels = [labels, key].filter((el): el is HTMLElement => !!el).map(crop);
      const panelScale = availW / (1400 * R);
      const panelH = panels.reduce((n, c) => n + c.height * panelScale + 2, 0);
      const headH = 21, footH = 7, gap = 3;
      const availH = ph - m * 2 - headH - footH - panelH;
      const bw = body.scrollWidth * R, bh = body.scrollHeight * R;
      const lw = Number(body.dataset["labelW"] || 0) * R, contentW = bw - lw;
      const scaleFor = (k: number) => Math.min(availW / (lw + Math.ceil(contentW / k)), (availH - (k - 1) * gap) / (k * bh));
      let strips = 1;
      for (let k = 2; k <= 6; k++) if (scaleFor(k) > scaleFor(strips)) strips = k;
      const scale = scaleFor(strips), per = Math.ceil(contentW / strips);
      if (scale <= 0) throw new Error("Report too large");
      pdf.setFontSize(12); pdf.text(`Chronology overview: ${person.label || "-"}`, m, m + 5);
      pdf.setFontSize(8);
      pdf.text(`${person.dob ? `DOB: ${formatDate(person.dob, person.dobPrecision)} · ` : ""}Prepared by: ${person.preparedBy || "-"} · Date prepared: ${formatDate(todayISO(), "day")}`, m, m + 10);
      const visible = sorted.filter((e) => !hidden.has(e.category) && !(hideLow && e.significance === "low")).filter((e) => !focusRange || (Number(e.start.slice(0, 4)) < focusRange[1] && Number((e.end || e.start).slice(0, 4)) + 1 > focusRange[0]));
      const n = reportCounts(visible);
      pdf.text(`${n.homeMoves} home moves | ${n.educationChanges} education changes | ${n.significantEvents} high-significance events | ${n.unassessed} wellbeing impacts unassessed`, m, m + 15);
      let y = m + headH;
      for (let p = 0; p < strips; p++) {
        const w = Math.min(per, contentW - p * per), c = document.createElement("canvas");
        c.width = lw + w; c.height = bh;
        const ctx = c.getContext("2d");
        if (!ctx) throw new Error("Cannot create report image");
        ctx.fillStyle = bg; ctx.fillRect(0, 0, c.width, c.height);
        const bx = (br.left - sr.left) * R, by = (br.top - sr.top) * R;
        if (lw) ctx.drawImage(img, bx, by, lw, bh, 0, 0, lw, bh);
        ctx.drawImage(img, bx + lw + p * per, by, w, bh, lw, 0, w, bh);
        pdf.addImage(c.toDataURL("image/jpeg", 0.88), "JPEG", m, y, c.width * scale, bh * scale, undefined, "FAST");
        y += bh * scale + gap;
      }
      y = ph - m - footH - panelH;
      for (const c of panels) {
        pdf.addImage(c.toDataURL("image/jpeg", 0.9), "JPEG", m, y, c.width * panelScale, c.height * panelScale, undefined, "FAST");
        y += c.height * panelScale + 2;
      }
      pdf.setFontSize(7);
      pdf.text("Confidential. Contains sensitive personal information. Handle in line with your organisation's data protection policy.", m, ph - m);
      pdf.save(`${fileBase()}_overview.pdf`);
    } catch { setToast("Could not create PDF. Try focusing on a shorter period for a very large chronology."); }
    finally { setSimple(false); setBusy(false); }
  };

  const exportHTML = async (opts: HtmlOpts) => {
    setBusy(true);
    const realPerson = person, realSorted = sorted;
    try {
      const person = opts.ids ? realPerson : { ...realPerson, label: "Reference removed", dob: "", preparedBy: "" };
      const clean = (e: TimelineEvent) => ({ ...e, note: opts.notes ? e.note : "", wellbeingNote: opts.notes ? e.wellbeingNote : "", location: opts.towns ? e.location : "" });
      setRedact({ person, clean });
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      await new Promise((r) => setTimeout(r, 150));
      const { toJpeg } = await import("html-to-image");
      const snap = (n: HTMLElement) => toJpeg(n, { quality: 0.85, pixelRatio: 2, backgroundColor: getComputedStyle(n).backgroundColor, width: n.scrollWidth, height: n.scrollHeight });
      const tl = await snap(sheetRef.current!);
      const sm = summaryRef.current ? await snap(summaryRef.current) : "";
      const sheetEl = sheetRef.current!, sr = sheetEl.getBoundingClientRect();
      const W = sheetEl.scrollWidth, H = sheetEl.scrollHeight;
      const tips = [...sheetEl.querySelectorAll<HTMLElement>("[title]")].map((el) => {
        const r = el.getBoundingClientRect();
        return { t: el.getAttribute("title") || "", l: (r.left - sr.left) / W * 100, tp: (r.top - sr.top) / H * 100, w: r.width / W * 100, h: r.height / H * 100 };
      }).filter((t) => t.t && t.w > 0).sort((a, b) => b.w * b.h - a.w * a.h);
      setRedact(null);
      const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
      const visible = realSorted.filter((e) => !hidden.has(e.category)).map(clean);
      const rows = visible.map((e) => {
        const when = formatDate(e.start, e.startPrecision) + (e.end ? ` – ${formatDate(e.end, e.endPrecision)}` : e.ongoing ? " – ongoing" : "");
        return `<tr data-cat="${esc(e.category)}" data-sig="${e.significance}"><td>${e.approximate ? "c. " : ""}${esc(when)}</td><td>${esc(catById(e.category)?.name ?? e.category)}</td><td>${esc(e.type)}</td><td>${esc(displayLabel(e))}</td><td class="sig-${e.significance}">${e.significance}</td><td>${esc(wellbeingOf(e).label)}<br><small>Practitioner judgement</small>${e.wellbeingNote ? `<br>${esc(e.wellbeingNote).replace(/\n/g, "<br>")}` : ""}</td><td>${esc(e.note).replace(/\n/g, "<br>")}</td></tr>`;
      }).join("");
      const cats = CATEGORIES.filter((c) => !hidden.has(c.id)).map((c) => `<label><input type="checkbox" checked value="${c.id}"> ${esc(c.name)}</label>`).join("");
      const title = `Chronology: ${person.label || "-"}`;
      const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline'; script-src 'unsafe-inline'"><title>${esc(title)}</title>
<style>body{font-family:system-ui,sans-serif;margin:0;background:#faf8f6;color:#222}header,main{padding:16px 24px}header{background:#fff;border-bottom:1px solid #e5e0dc}h1{margin:0 0 4px;font-size:20px}.meta{color:#666;font-size:13px}.conf{background:#fdecee;color:#8a1c2b;padding:8px 24px;font-size:13px}.card{background:#fff;border:1px solid #e5e0dc;border-radius:12px;padding:12px;margin-bottom:16px}.scroll{overflow:auto;max-height:80vh}.scroll img{display:block;transform-origin:0 0}.tools{display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center;margin-bottom:10px;font-size:14px}input[type=search],select{padding:6px 8px;border:1px solid #ccc;border-radius:8px;font:inherit}button{padding:4px 10px;border:1px solid #ccc;border-radius:8px;background:#fff;cursor:pointer}table{width:100%;border-collapse:collapse;font-size:14px}th,td{text-align:left;padding:6px 8px;border-bottom:1px solid #eee;vertical-align:top}th{background:#f3efec;position:sticky;top:0}.sig-high{color:#b0122b;font-weight:600}.sig-low{color:#888}img.sum{max-width:100%}.tlw{position:relative;display:inline-block}.tip{position:absolute;cursor:help;border-radius:6px}.tip:hover,.tip:focus{outline:2px solid #b0122b;outline-offset:1px;z-index:5}.tip:hover::after,.tip:focus::after{content:attr(data-t);position:absolute;left:50%;top:100%;margin-top:6px;transform:translateX(-50%);background:#222;color:#fff;padding:6px 9px;border-radius:8px;font-size:12px;line-height:1.35;white-space:pre-line;width:max-content;max-width:280px;z-index:10;pointer-events:none;box-shadow:0 4px 12px rgba(0,0,0,.25)}@media print{.tools,.zoom{display:none}.scroll{max-height:none;overflow:visible}}</style></head><body>
<header><h1>${esc(title)}</h1><div class="meta">${person.dob ? `DOB: ${esc(formatDate(person.dob, person.dobPrecision))} · ` : ""}Prepared by: ${esc(person.preparedBy || "-")} · Date prepared: ${esc(formatDate(todayISO(), "day"))}</div></header>
<div class="conf">Confidential. Contains sensitive personal information. Handle in line with your organisation's data protection policy.</div>
<main><section class="card"><div class="tools zoom"><strong>Timeline</strong><button data-z="-">−</button><button data-z="0">Fit</button><button data-z="+">+</button></div><p class="meta" style="margin:0 0 8px">Hover over or tap any icon or event to see what it means.</p><div class="scroll"><div class="tlw"><img id="tl" src="${tl}" alt="Timeline">${tips.map((t) => `<span class="tip" tabindex="0" title="${esc(t.t)}" data-t="${esc(t.t)}" style="left:${t.l.toFixed(3)}%;top:${t.tp.toFixed(3)}%;width:${t.w.toFixed(3)}%;height:${t.h.toFixed(3)}%"></span>`).join("")}</div></div></section>
${sm ? `<section class="card"><strong>Summary</strong><img class="sum" src="${sm}" alt="Summary"></section>` : ""}
<section class="card"><div class="tools"><strong>Events (<span id="n">${visible.length}</span>)</strong><input type="search" id="q" placeholder="Search events and notes"><select id="sig"><option value="">All significance</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select>${cats}</div>
<div class="scroll"><table><thead><tr><th>Date</th><th>Area</th><th>Type</th><th>Event</th><th>Significance</th><th>Wellbeing impact</th><th>Note</th></tr></thead><tbody>${rows}</tbody></table></div></section></main>
<script>(function(){var img=document.getElementById('tl'),z=1;function fit(){var w=img.parentNode.clientWidth;z=Math.min(1,w/img.naturalWidth*2);ap()}function ap(){img.style.width=(img.naturalWidth/2*z)+'px'}img.onload=fit;if(img.complete)fit();document.querySelectorAll('[data-z]').forEach(function(b){b.onclick=function(){var d=b.dataset.z;if(d==='0')fit();else{z=Math.max(.2,Math.min(4,z*(d==='+'?1.25:.8)));ap()}}});
var q=document.getElementById('q'),s=document.getElementById('sig'),boxes=[].slice.call(document.querySelectorAll('.tools input[type=checkbox]'));function f(){var t=q.value.toLowerCase(),on=boxes.filter(function(b){return b.checked}).map(function(b){return b.value}),n=0;document.querySelectorAll('tbody tr').forEach(function(r){var ok=on.indexOf(r.dataset.cat)>-1&&(!s.value||r.dataset.sig===s.value)&&r.textContent.toLowerCase().indexOf(t)>-1;r.style.display=ok?'':'none';if(ok)n++});document.getElementById('n').textContent=n}q.oninput=f;s.onchange=f;boxes.forEach(function(b){b.onchange=f})})();</script></body></html>`;
      downloadBlob(html, `${fileBase()}.html`, "text/html;charset=utf-8");
    } catch { setToast("Could not create HTML file."); } finally { setRedact(null); setBusy(false); }
  };

  const print = () => {
    const node = sheetRef.current!;
    const pageWidthPx = (paper === "a4" ? 297 - 16 : 420 - 16) * 3.78;
    document.documentElement.style.setProperty("--print-scale", String(Math.min(1, pageWidthPx / node.scrollWidth)));
    const style = document.createElement("style");
    style.textContent = `@page { size: ${paper.toUpperCase()} landscape; margin: 8mm; }`;
    document.head.appendChild(style);
    window.print();
    setTimeout(() => style.remove(), 500);
  };

  const clearAll = () => {
    if (!confirm("Clear everything? Anything not exported will be lost.")) return;
    setPerson(emptyPerson()); setEvents([]); setDirty(false);
  };

  const [entryKey, setEntryKey] = useState(0);
  const startOver = () => {
    if ((events.length > 0 || person.label || person.dob || person.preparedBy) && !confirm("Start again? This clears the young person's details and every event. Anything not exported will be lost.")) return;
    setPerson(emptyPerson()); setEvents([]); setHidden(new Set()); setDirty(false);
    setEditing(null); setShowAdd(false); setShowSummary(false); setShowEvents(false); setShowPerson(false);
    setStep(0); setEntryKey((k) => k + 1); setMode("guided"); window.scrollTo(0, 0);
  };

  const loadSample = () => {
    if (events.length > 0 && !confirm("Load the sample timeline? Everything currently on screen will be replaced — export it first if you want to keep it.")) return;
    const s = sampleTimeline();
    setPerson(s.person); setEvents(s.events); setHidden(new Set()); setDirty(false);
    setToast("Sample timeline loaded — everything shown is fictional.");
  };

  const toggleCat = (id: string) => setHidden((h) => { const n = new Set(h); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const deleteEvent = (ev: TimelineEvent) => {
    if (!confirm(`Delete "${ev.label}"?`)) return;
    setEvents((o) => o.filter((x) => x.id !== ev.id)); setDirty(true);
  };
  const dateLabel = (e: TimelineEvent) => `${e.approximate ? "c. " : ""}${formatDate(e.start, e.startPrecision)}${e.ongoing ? " – ongoing" : e.end ? ` – ${formatDate(e.end, e.endPrecision)}` : ""}`;

  return (
    <div
      className="chron min-h-screen"
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={(e) => { if (e.currentTarget === e.target) setDragging(false); }}
      onDrop={(e) => { e.preventDefault(); setDragging(false); readFile(e.dataTransfer.files[0]); }}
    >
      <header className="no-print border-b bg-card">
        <div className="mx-auto max-w-7xl space-y-3 px-4 py-4">
          <Link to="/" className="inline-block text-sm font-medium text-muted-foreground hover:text-foreground">← All tools</Link>
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground"><CalendarRange size={20} /></span>
            <div className="min-w-0 flex-1 basis-48">
              <h1 className="text-xl font-extrabold sm:text-2xl">Chronology Builder</h1>
              <p className="text-xs text-muted-foreground">Build a clear timeline of a young person's history.</p>
            </div>
            <button type="button" className="btn ml-auto shrink-0" onClick={() => setMode("intro")}>Introduction</button>
            <button type="button" className="btn shrink-0" onClick={startOver}><RotateCcw size={15} />Start again</button>
          </div>
          <p role="note" className="flex items-start gap-2 rounded-xl bg-notice px-3 py-2 text-xs text-notice-foreground sm:text-sm">
            <Lock size={15} className="mt-0.5 shrink-0" />
            <span>Nothing you enter leaves this device or is saved. Closing this tab clears everything. Use Export CSV to keep a copy.</span>
          </p>
          <TestingNotice />
        </div>
      </header>

      <main className="no-print mx-auto max-w-7xl space-y-3 px-4 py-3">
        {personOpen ? (
          <section className="panel fade-in space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">Young person's details</h2>
              <button type="button" className="btn h-8 px-2.5" onClick={() => setShowPerson(false)}><X size={14} /> Hide</button>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="label" htmlFor="ref">Initials or reference (avoid full names)</label>
                <input id="ref" className="field" value={person.label} onChange={(e) => updatePerson({ label: e.target.value })} autoComplete="off" />
              </div>
              <MonthYearInput label="Date of birth" value={person.dob} onChange={(v) => updatePerson({ dob: v, dobPrecision: "month" })} />
              <div>
                <label className="label" htmlFor="prep">Prepared by</label>
                <input id="prep" className="field" value={person.preparedBy} onChange={(e) => updatePerson({ preparedBy: e.target.value })} autoComplete="off" />
              </div>
            </div>
          </section>
        ) : (
          <section className="panel flex flex-wrap items-center gap-x-4 gap-y-1 py-2.5 text-sm">
            <span className="font-semibold">{person.label || "No reference set"}</span>
            <span className="text-muted-foreground">{person.dob ? `Born ${formatDate(person.dob, person.dobPrecision)}` : "No date of birth"}</span>
            <span className="text-muted-foreground">{person.preparedBy ? `Prepared by ${person.preparedBy}` : "No preparer set"}</span>
            <button type="button" className="btn ml-auto h-8 px-2.5" aria-expanded={false} onClick={() => setShowPerson(true)}><Pencil size={14} /> Change details</button>
          </section>
        )}

        <section className="flex flex-wrap items-center gap-2">
          <Menu label="Save / Load" icon={<FileText size={15} />} badge={dirty && hasData ? <span className="h-2 w-2 rounded-full bg-warning" title="Unsaved changes" /> : null}>
            {(close) => (<>
              <MenuItem icon={<Download size={15} />} disabled={!hasData} hint={dirty && hasData ? "You have unsaved changes" : "Keep a copy on this device"} onClick={() => { close(); exportCSV(); }}>Export CSV</MenuItem>
              <MenuItem icon={<Upload size={15} />} hint="Or drag a CSV onto the page" onClick={() => { close(); fileRef.current?.click(); }}>Import CSV</MenuItem>
              <MenuItem icon={<FileText size={15} />} onClick={() => { close(); downloadBlob(templateCSV(), "timeline_template.csv"); }}>Download blank template</MenuItem>
              <MenuItem icon={<Sparkles size={15} />} hint="Fictional data for demonstrations and testing" onClick={() => { close(); loadSample(); }}>Load a sample timeline</MenuItem>
            </>)}
          </Menu>
          <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => readFile(e.target.files?.[0])} />
          <Menu label="Download / Print" icon={<Printer size={15} />}>
            {(close) => (<>
              <div className="px-2.5 pb-2 pt-1">
                <span className="label">Paper size</span>
                <select className="field" value={paper} onChange={(e) => setPaper(e.target.value as "a4" | "a3")} aria-label="Paper size">
                  <option value="a4">A4 landscape</option><option value="a3">A3 landscape</option>
                </select>
              </div>
              <MenuItem icon={<ImageIcon size={15} />} disabled={busy} onClick={() => { close(); exportPNG(); }}>Export PNG</MenuItem>
              <MenuItem icon={<FileText size={15} />} disabled={busy} hint="One-page summary report" onClick={() => { close(); exportSimplePDF(); }}>Export PDF report</MenuItem>
              <MenuItem icon={<Globe size={15} />} disabled={busy} hint="Full detail with dates and notes; opens offline in any browser" onClick={() => { close(); setHtmlOpts({ notes: true, ids: true, towns: true }); }}>Export detailed HTML</MenuItem>
              <MenuItem icon={<Printer size={15} />} onClick={() => { close(); print(); }}>Print</MenuItem>
            </>)}
          </Menu>
          {dirty && hasData && <span className="hidden text-xs text-warning sm:inline">Unsaved changes. Export CSV to keep them.</span>}
          <span className="flex-1" />
          <button type="button" className="btn" aria-expanded={showAdd} aria-controls="add-event-panel" onClick={() => setShowAdd((v) => !v)}>
            {showAdd ? <X size={15} /> : <Plus size={15} />} {showAdd ? "Hide add event form" : "Add an event"}
          </button>
          <button type="button" className="btn btn-primary" onClick={() => setMode("guided")}>Back to step by step</button>
          <button className="btn btn-danger" onClick={clearAll} disabled={!hasData}><Trash2 size={15} /> Clear all</button>
        </section>
        {showAdd && (
          <div id="add-event-panel">
            <QuickEntry onAdd={addQuick} onMore={() => setEditing("new")} />
          </div>
        )}

        <section className="panel space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex overflow-hidden rounded-full border" role="group" aria-label="Timeline style">
              {(["lanes", "story"] as const).map((v) => (
                <button key={v} className={`px-4 py-1.5 text-sm font-medium ${view === v ? "bg-primary text-primary-foreground" : "bg-card hover:bg-secondary"}`} onClick={() => setView(v)}>
                  {v === "lanes" ? "Category lanes" : "Story path"}
                </button>
              ))}
            </span>
            <span className="text-xs text-muted-foreground">Tap a category to show or hide it (also applies to downloads).</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const on = !hidden.has(c.id);
              return (
                <button key={c.id} type="button" aria-pressed={on} onClick={() => toggleCat(c.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors ${on ? "bg-card" : "bg-muted text-muted-foreground line-through opacity-70"}`}
                  style={on ? { borderColor: `var(--cat-${c.id})` } : undefined}>
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: `var(--cat-${c.id})` }} />
                  {c.name}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <label className="inline-flex items-center gap-2">
              <span className="font-medium">Focus</span>
              <select className="field w-auto" value={focus} onChange={(e) => {
                const v = e.target.value; setFocus(v);
                if (v === "range") { setFromY(String(yearSpan[0])); setToY(String(yearSpan[1])); }
              }}>
                <option value="all">Whole timeline</option>
                {dobYear !== null && AGE_BANDS.map((b, i) => <option key={b.name} value={`stage:${i}`}>{b.name} (age {b.from}–{b.to})</option>)}
                <option value="range">Choose years…</option>
              </select>
            </label>
            {focus === "range" && (
              <span className="inline-flex items-center gap-1">
                <select className="field w-auto" aria-label="From year" value={fromY} onChange={(e) => setFromY(e.target.value)}>
                  {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
                <span>to</span>
                <select className="field w-auto" aria-label="To year" value={toY} onChange={(e) => setToY(e.target.value)}>
                  {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </span>
            )}
            <button type="button" aria-pressed={hideLow} onClick={() => setHideLow((v) => !v)}
              className={`rounded-full border px-3 py-1 ${hideLow ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-secondary"}`}>
              Hide low importance
            </button>
            <span className="text-xs text-muted-foreground">What you see here is what goes into downloads.</span>
          </div>
        </section>

        {dragging && (
          <div className="rounded-xl border-2 border-dashed border-primary bg-accent/10 p-6 text-center text-sm">Drop CSV to import (read on this device only)</div>
        )}

        {!events.length && (
          <div className="panel space-y-3 text-center text-sm text-muted-foreground">
            <p>No events yet. Use "Add an event" above, or drag a CSV file anywhere onto this page to import it.</p>
            <button type="button" className="btn btn-primary" onClick={loadSample}><Sparkles size={15} /> Load a sample timeline</button>
          </div>
        )}
      </main>

      <div className="mx-auto max-w-7xl px-4 pb-4">
        <div className="overflow-x-auto rounded-xl border shadow-card">
          <TimelineSheet ref={sheetRef} person={redact?.person ?? person} events={redact ? events.map(redact.clean) : events} hidden={hidden} view={view} hideLow={hideLow} focus={focusRange} simple={simple} onSelect={(e) => setEditing(e)} />
        </div>
        {events.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button type="button" className="btn" aria-expanded={showSummary} aria-controls="summary-panel" onClick={() => setShowSummary((v) => !v)}>
              {showSummary ? <ChevronUp size={15} /> : <ChevronDown size={15} />} Summary
            </button>
            <button type="button" className="btn" aria-expanded={showEvents} aria-controls="events-panel" onClick={() => setShowEvents((v) => !v)}>
              {showEvents ? <ChevronUp size={15} /> : <ChevronDown size={15} />} Events ({sorted.length})
            </button>
            <span className="text-xs text-muted-foreground">Tucked away to save room on screen. Downloads always include both.</span>
          </div>
        )}
        {events.length > 0 && (
          <div id="summary-panel" className={showSummary ? "mt-3 fade-in overflow-x-auto rounded-xl border shadow-card" : "h-0 overflow-hidden"} aria-hidden={!showSummary} {...(showSummary ? {} : { inert: "" })}>
            <TimelineSummary ref={summaryRef} person={redact?.person ?? person} events={events.filter((e) => !hidden.has(e.category)).map(redact?.clean ?? ((e) => e))} />
          </div>
        )}
      </div>

      {sorted.length > 0 && showEvents && (
        <section id="events-panel" className="no-print fade-in mx-auto max-w-7xl px-4 pb-10">
          <h2 className="text-lg font-bold">Events ({sorted.length})</h2>
          <p className="mb-2 text-sm text-muted-foreground">Use Edit or Delete to correct an entry. You can also tap any event on the timeline to edit it.</p>
          <ul className="space-y-2 md:hidden">
            {sorted.map((e) => (
              <li key={e.id} className="panel flex flex-wrap items-start gap-3 border-l-4 p-3" style={{ borderLeftColor: `var(--cat-${e.category})` }}>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">{dateLabel(e)} · {catById(e.category).name}</p>
                  <p className="font-semibold">{displayLabel(e)}</p>
                  <p className="text-xs text-muted-foreground">{e.type} · <span className="capitalize">{e.significance}</span></p><p className="text-xs text-muted-foreground">Wellbeing: {wellbeingOf(e).label} · practitioner judgement</p>
                </div>
                <div className="flex w-full gap-2">
                  <button className="btn h-10 flex-1" aria-label={`Edit ${e.label}`} onClick={() => setEditing(e)}><Pencil size={15} /> Edit</button>
                  <button className="btn btn-danger h-10 flex-1" aria-label={`Delete ${e.label}`} onClick={() => deleteEvent(e)}><Trash2 size={15} /> Delete</button>
                </div>
              </li>
            ))}
          </ul>
          <div className="hidden overflow-x-auto rounded-xl border bg-card shadow-card md:block">
            <table className="w-full text-sm">
              <thead className="bg-muted text-left text-xs"><tr>
                <th className="px-3 py-2">Date</th><th className="px-3 py-2">Category</th><th className="px-3 py-2">Type</th><th className="px-3 py-2">Label</th><th className="px-3 py-2">Significance</th><th className="px-3 py-2" />
              </tr></thead>
              <tbody>
                {sorted.map((e) => (
                  <tr key={e.id} className="border-t align-top">
                    <td className="whitespace-nowrap px-3 py-2">{dateLabel(e)}</td>
                    <td className="px-3 py-2"><span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: `var(--cat-${e.category})` }} />{catById(e.category).name}</span></td>
                    <td className="px-3 py-2">{e.type}</td>
                    <td className="px-3 py-2">{displayLabel(e)}{e.note && <div className="whitespace-pre-wrap text-xs text-muted-foreground">{e.note}</div>}<div className="text-xs text-muted-foreground">Wellbeing: {wellbeingOf(e).label} · practitioner judgement{e.wellbeingNote && <p className="whitespace-pre-wrap">{e.wellbeingNote}</p>}</div></td>
                    <td className="px-3 py-2 capitalize">{e.significance}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-right">
                      <button className="btn h-8 px-2.5" aria-label={`Edit ${e.label}`} onClick={() => setEditing(e)}><Pencil size={14} /> Edit</button>{" "}
                      <button className="btn btn-danger h-8 px-2.5" aria-label={`Delete ${e.label}`} onClick={() => deleteEvent(e)}><Trash2 size={14} /> Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {mode === "intro" && (
        <Introduction
          hasData={hasData}
          onStart={() => setMode("guided")}
          onSkip={() => setMode("timeline")}
          onSample={() => { loadSample(); setMode("timeline"); }}
        />
      )}
      {mode === "guided" && (
        <GuidedEntry key={entryKey} onStartOver={startOver} person={person} onPerson={updatePerson} events={events} onAdd={addQuick} onUpdate={saveEvent} step={step} onStep={setStep}
          onEdit={(e) => setEditing(e)} onDelete={deleteEvent}
          onSample={() => { loadSample(); setMode("timeline"); }}
          onFinish={() => {
            setMode("timeline");
            setTimeout(() => sheetRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
          }} />
      )}
      {editing && (
        <EventForm
          key={editing === "new" ? `new-${formSeq}` : editing.id}
          initial={editing === "new" ? stickyDraft() : editing}
          onClose={() => setEditing(null)}
          onSave={(ev) => { saveEvent(ev); setEditing(null); }}
          onSaveAndAnother={(ev) => { saveEvent(ev); setSticky({ category: ev.category, type: ev.type, significance: ev.significance }); setFormSeq((n) => n + 1); }}
          onDelete={editing === "new" ? undefined : () => { setEvents((o) => o.filter((x) => x.id !== (editing as TimelineEvent).id)); setDirty(true); setEditing(null); }}
        />
      )}
      {htmlOpts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" role="dialog" aria-modal="true" aria-label="Interactive HTML options">
          <div className="w-full max-w-md rounded-xl bg-card p-5 shadow-card">
            <h2 className="text-lg font-semibold">Export interactive HTML</h2>
            <p className="mt-1 text-sm text-muted-foreground">Choose what to include in the file before saving it.</p>
            <div className="mt-4 space-y-3">
              {([
                ["notes", "Event notes", "Event notes and reasons for wellbeing judgements"],
                ["ids", "Identifying details", "Reference, date of birth and prepared by"],
                ["towns", "Towns and cities", "Where each placement was. Distances between homes are removed too"],
              ] as const).map(([k, label, hint]) => (
                <label key={k} className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3">
                  <input type="checkbox" className="mt-1 h-4 w-4" checked={htmlOpts[k]} onChange={(e) => setHtmlOpts({ ...htmlOpts, [k]: e.target.checked })} />
                  <span><span className="block text-sm font-medium">{label}</span><span className="block text-xs text-muted-foreground">{hint}</span></span>
                </label>
              ))}
            </div>
            {!htmlOpts.ids && <p className="mt-3 text-xs text-muted-foreground">Without the date of birth, the age bands won't appear on the timeline.</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="btn" onClick={() => setHtmlOpts(null)}>Cancel</button>
              <button type="button" className="btn btn-primary" disabled={busy} onClick={() => { const o = htmlOpts; setHtmlOpts(null); exportHTML(o); }}>Save HTML file</button>
            </div>
          </div>
        </div>
      )}
      {pending && (
        <ImportPreview fileName={pending.name} result={pending.result} hasExisting={hasData} onCancel={() => setPending(null)} onConfirm={confirmImport} />
      )}
      <footer className="no-print mx-auto max-w-7xl px-4 pb-8 pt-2 text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-4">
          <Link className="underline hover:text-foreground" to="/privacy">Privacy Policy</Link>
          <Link className="underline hover:text-foreground" to="/faq">FAQs</Link>
          <span>© {new Date().getFullYear()} SEMH.co.uk</span>
        </div>
      </footer>
      {toast && <div role="status" className={`no-print fixed ${mode === "guided" ? "top-20" : "bottom-4"} left-1/2 z-50 -translate-x-1/2 rounded-md bg-foreground px-4 py-2 text-sm text-background`}>{toast}</div>}
    </div>
  );
}
