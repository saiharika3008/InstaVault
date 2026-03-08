import { useState, useEffect, useRef } from "react";

const EMOJI_OPTIONS = ["🌸", "✨", "🌿", "🎨", "💫", "🍂", "🌊", "🦋", "🍓", "🌙", "🎀", "🌺", "🏖", "🍕", "✈️", "👗", "💄", "📸", "🎵", "🏋️", "🌮", "🧁", "🍜", "🍷", "🐾", "🌻", "🎬", "📚", "💎", "🛍", "🎯", "🏠", "🌈", "🧘", "🎪", "🍦", "🌅", "🎭", "🧸", "🪴", "🫶", "🌶", "🧋", "🎸", "🛋", "🌃", "🦚"];
const COLOR_OPTIONS = ["#f9c784", "#f0826c", "#c9a8f0", "#84c9a8", "#f09ab8", "#90b0e8", "#e8c860", "#f0a878", "#a8d8a8", "#f4a261", "#e76f51", "#457b9d", "#e9c46a", "#2a9d8f", "#e63946", "#a8dadc", "#6d6875", "#b5838d"];
const SORT_OPTIONS = [{ value: "manual", label: "Manual (drag)" }, { value: "date_new", label: "Newest first" }, { value: "date_old", label: "Oldest first" }, { value: "name", label: "A → Z" }];
const POST_SORT_OPTIONS = [{ value: "manual", label: "Manual" }, { value: "pinned", label: "Pinned first" }, { value: "date_new", label: "Newest" }, { value: "date_old", label: "Oldest" }];
const TRASH_DAYS = 30;
const STORAGE_WARN = 50;
const TAG_COLORS = ["#f9c784", "#c9a8f0", "#84c9a8", "#f09ab8", "#90b0e8", "#e8c860", "#f0a878", "#f4a261", "#a8dadc", "#b5838d"];
const AVATAR_EMOJIS = ["🌸", "✨", "🦋", "🌿", "💫", "🎨", "🌊", "🍓", "🌙", "🎀", "👗", "💄", "📸", "🌻", "💎", "🧁", "🌈", "🧘", "🦚", "🫶"];
const LIGHT = { bg: "linear-gradient(135deg,#fff8f5 0%,#fef0ea 30%,#fdedf5 65%,#fff5f0 100%)", bgSolid: "#fff5f0", surface: "rgba(255,255,255,0.65)", border: "rgba(220,155,165,0.28)", text: "#3a1520", muted: "#b07880", sidebar: "rgba(255,248,245,0.82)", input: "rgba(255,248,246,0.75)", navHover: "rgba(200,80,100,0.07)", navActive: "rgba(200,80,100,0.1)", navActiveBorder: "rgba(200,80,100,0.3)", accent: "#c04060" };
const DARK = { bg: "linear-gradient(135deg,#1a0f12 0%,#1e1218 40%,#1a1020 100%)", bgSolid: "#1a0f12", surface: "rgba(40,20,28,0.75)", border: "rgba(180,80,110,0.22)", text: "#f5e8ec", muted: "#a07888", sidebar: "rgba(32,15,22,0.88)", input: "rgba(38,18,26,0.8)", navHover: "rgba(180,60,90,0.12)", navActive: "rgba(180,60,90,0.18)", navActiveBorder: "rgba(180,60,90,0.4)", accent: "#e07090" };

function useLocalStorage(key, initial) {
  const [state, setState] = useState(() => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : initial; } catch { return initial; } });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(state)); } catch { } }, [key, state]);
  return [state, setState];
}
function isUrl(s) { try { return Boolean(new URL(s)); } catch { return false; } }
function isIgUrl(s) { try { return new URL(s).hostname.includes("instagram.com"); } catch { return false; } }
function getIgUser(url) { try { const p = new URL(url).pathname.split("/").filter(Boolean); return p[0] ? `@${p[0]}` : null; } catch { return null; } }
function getPalette(id) {
  const p = [{ bg: "rgba(255,210,218,0.35)", dot: "#f09ab8" }, { bg: "rgba(255,220,210,0.35)", dot: "#f0a878" }, { bg: "rgba(255,200,215,0.35)", dot: "#e87898" }, { bg: "rgba(255,215,220,0.35)", dot: "#f0b8c8" }, { bg: "rgba(255,205,212,0.35)", dot: "#e89098" }, { bg: "rgba(255,218,208,0.35)", dot: "#f0a890" }];
  let h = 0; for (let c of id) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff; return p[Math.abs(h) % p.length];
}
function daysAgo(ts) { return Math.floor((Date.now() - ts) / (1000 * 60 * 60 * 24)); }
function getTagColor(tag) { let h = 0; for (let c of tag) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff; return TAG_COLORS[Math.abs(h) % TAG_COLORS.length]; }
function parseTags(caption = "") { const tags = []; const re = /#(\w+)/g; let m; while ((m = re.exec(caption)) !== null) tags.push(m[1].toLowerCase()); return [...new Set(tags)]; }
function stripTags(caption = "") { return caption.replace(/#\w+/g, "").trim(); }


// ── SVG NAV ICONS ──
function NavIcon({ type, color, size = 20 }) {
  const s = { stroke: color, fill: "none", strokeWidth: "1.9", strokeLinecap: "round", strokeLinejoin: "round" };
  const p = { ...s, width: size, height: size, viewBox: "0 0 24 24" };
  if (type === "home") return <svg {...p}><path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1v-9.5z" /><path d="M9 21V13h6v8" /></svg>;
  if (type === "boards") return <svg {...p}><rect x="3" y="3" width="8" height="8" rx="2" /><rect x="13" y="3" width="8" height="8" rx="2" /><rect x="3" y="13" width="8" height="8" rx="2" /><rect x="13" y="13" width="8" height="8" rx="2" /></svg>;
  if (type === "saved") return <svg {...p}><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" /></svg>;
  if (type === "tags") return <svg {...p}><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><circle cx="7" cy="7" r="1.5" fill={color} stroke="none" /></svg>;
  if (type === "trash") return <svg {...p}><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" /></svg>;
  if (type === "journal") return <svg {...p}><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="9" y1="12" x2="13" y2="12" /></svg>;
  if (type === "settings") return <svg {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>;
  if (type === "signout") return <svg {...p}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;
  if (type === "search") return <svg {...p} strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
  if (type === "newboard") return <svg {...p}><rect x="3" y="3" width="8" height="8" rx="2" /><rect x="13" y="3" width="8" height="8" rx="2" /><rect x="3" y="13" width="8" height="8" rx="2" /><line x1="16" y1="14" x2="16" y2="20" /><line x1="13" y1="17" x2="19" y2="17" /></svg>;
  return null;
}

// Subtle muted post thumbnail icon
function PostThumbIcon({ board }) {
  const c = "rgba(80,30,50,0.2)";
  const s = { stroke: c, fill: "none", strokeWidth: "1.4", strokeLinecap: "round", strokeLinejoin: "round" };
  const icons = {
    Aesthetic: <svg width="48" height="48" viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="4" /><line x1="12" y1="2" x2="12" y2="5" /><line x1="12" y1="19" x2="12" y2="22" /><line x1="2" y1="12" x2="5" y2="12" /><line x1="19" y1="12" x2="22" y2="12" /></svg>,
    Fashion: <svg width="48" height="48" viewBox="0 0 24 24" {...s}><path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10a2 2 0 002 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z" /></svg>,
    Food: <svg width="48" height="48" viewBox="0 0 24 24" {...s}><path d="M18 8h1a4 4 0 010 8h-1" /><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" /></svg>,
    Travel: <svg width="48" height="48" viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>,
    Beauty: <svg width="48" height="48" viewBox="0 0 24 24" {...s}><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>,
    Wellness: <svg width="48" height="48" viewBox="0 0 24 24" {...s}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
  };
  return <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.9 }}>{icons[board] || icons.Aesthetic}</div>;
}

function LogoMark({ size = 28, color = "#c04060", strokeWidth = 1.9 }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 6-9 13-9 13S3 16 3 10a9 9 0 0118 0z" />
    <path d="M12 7 Q10.5 5.5 9 6.5 Q8 7.5 9 9 Q10 10 12 11 Q14 10 15 9 Q16 7.5 15 6.5 Q13.5 5.5 12 7z" />
  </svg>);
}
function BoardAvatar({ icon, color, size = 22 }) {
  if (color) return <div style={{ width: size, height: size, borderRadius: "50%", background: color, flexShrink: 0 }} />;
  return <span style={{ fontSize: size * 0.82, lineHeight: 1, flexShrink: 0 }}>{icon || "🌸"}</span>;
}
function IgIcon({ size = 16, fill = "#c04060" }) { return (<svg width={size} height={size} viewBox="0 0 24 24" fill={fill}><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>); }
function TagPill({ tag, onClick, small }) {
  const bg = getTagColor(tag);
  return (<span onClick={onClick ? () => onClick(tag) : undefined} style={{ display: "inline-flex", alignItems: "center", padding: small ? "2px 7px" : "3px 9px", borderRadius: 99, background: bg + "33", color: bg, fontSize: small ? 10 : 11, fontWeight: 700, cursor: onClick ? "pointer" : "default", border: `1px solid ${bg}55`, userSelect: "none" }}>#{tag}</span>);
}

const ONBOARDING_STEPS = [
  { emoji: "🗂️", title: "Create boards", desc: "Organise your inspiration into boards — fashion, food, travel, anything. Give each one a name, emoji or colour." },
  { emoji: "💾", title: "Save posts", desc: "Paste any Instagram link to save it. Add a screenshot thumbnail with Ctrl+V, and a caption so you remember why you saved it." },
  { emoji: "🏷️", title: "Add tags", desc: "Tag your posts with #hashtags in the caption or tag field. Click any tag to filter posts across all your boards." },
  { emoji: "🔒", title: "Lock boards", desc: "Add a 4-digit PIN to any board to keep it private. It locks every time you close the app." },
  { emoji: "🌙", title: "Dark mode & more", desc: "Find dark mode, your profile, journal, and settings in the profile menu. Enjoy your vault ✨" },
];
function OnboardingModal({ onClose }) {
  const [step, setStep] = useState(0); const s = ONBOARDING_STEPS[step];
  return (<div className="modal-bg"><div className="modal" style={{ width: 380, textAlign: "center" }}>
    <div style={{ fontSize: 48, marginBottom: 12 }}>{s.emoji}</div>
    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 21, color: "#3a2e28", marginBottom: 10 }}>{s.title}</div>
    <div style={{ fontSize: 13.5, color: "#b09070", lineHeight: 1.7, marginBottom: 22 }}>{s.desc}</div>
    <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 20 }}>
      {ONBOARDING_STEPS.map((_, i) => (<div key={i} style={{ width: i === step ? 20 : 7, height: 7, borderRadius: 99, background: i === step ? "#f0826c" : "#ede6dc", transition: "all 0.25s" }} />))}
    </div>
    <div style={{ display: "flex", gap: 10 }}>
      {step > 0 && <button className="btn-cancel" onClick={() => setStep(p => p - 1)}>Back</button>}
      {step < ONBOARDING_STEPS.length - 1
        ? <button className="btn-create" style={{ border: "none", cursor: "pointer" }} onClick={() => setStep(p => p + 1)}>Next →</button>
        : <button className="btn-create" style={{ border: "none", cursor: "pointer" }} onClick={onClose}>Get started ✨</button>}
    </div>
  </div></div>);
}

function PinBoxes({ value, onChange, error }) {
  const refs = [useRef(), useRef(), useRef(), useRef()];
  const handle = (i, v) => { if (!/^\d*$/.test(v)) return; const n = [...value]; n[i] = v.slice(-1); onChange(n); if (v && i < 3) refs[i + 1].current?.focus(); };
  const handleKey = (i, e) => { if (e.key === "Backspace" && !value[i] && i > 0) { refs[i - 1].current.focus(); const n = [...value]; n[i - 1] = ""; onChange(n); } };
  return (<div style={{ display: "flex", gap: 12, justifyContent: "center" }}>{value.map((d, i) => (<input key={i} ref={refs[i]} type="password" inputMode="numeric" maxLength={1} value={d} autoFocus={i === 0} onChange={e => handle(i, e.target.value)} onKeyDown={e => handleKey(i, e)} style={{ width: 52, height: 56, borderRadius: 14, border: `2px solid ${error ? "#f0826c" : d ? "#f0a878" : "#ede6dc"}`, background: d ? "#fff5ee" : "#fdf8f3", textAlign: "center", fontSize: 22, fontFamily: "'Nunito',sans-serif", fontWeight: 700, color: "#3a2e28", outline: "none" }} />))}</div>);
}
function ChangePinModal({ mode, boards, step, currentPin, newPin, error, onCurrentPin, onNewPin, onClose, onChangePinError }) {
  const [curBoxes, setCurBoxes] = useState(["", "", "", ""]);
  const [newBoxes, setNewBoxes] = useState(["", "", "", ""]);
  const [confBoxes, setConfBoxes] = useState(["", "", "", ""]);
  const [localStep, setLocalStep] = useState('current');
  const [localError, setLocalError] = useState('');
  const [removeConfirm, setRemoveConfirm] = useState(false);

  const correctPin = boards[0]?.pin || "";

  const handleCurrent = (val) => {
    setCurBoxes(val);
    if (val.every(d => d !== "")) {
      const entered = val.join("");
      if (entered === correctPin) {
        setLocalError('');
        if (mode === 'remove') { setRemoveConfirm(true); }
        else { setLocalStep('new'); }
      } else {
        setLocalError('Wrong PIN. Please try again.');
        setTimeout(() => { setCurBoxes(["", "", "", ""]); setLocalError(''); }, 1200);
      }
    }
  };

  const handleNew = (val) => {
    setNewBoxes(val);
    if (val.every(d => d !== "")) setLocalStep('confirm');
  };

  const handleConfirm = (val, onSave) => {
    setConfBoxes(val);
    if (val.every(d => d !== "")) {
      if (val.join("") === newBoxes.join("")) {
        onSave(newBoxes.join(""));
      } else {
        setLocalError("PINs don't match. Try again.");
        setTimeout(() => { setConfBoxes(["", "", "", ""]); setLocalError(''); }, 1200);
      }
    }
  };

  return (<div className="modal-bg" onClick={onClose}><div className="modal" style={{ width: 320, textAlign: "center" }} onClick={e => e.stopPropagation()}>
    <div style={{ fontSize: 32, marginBottom: 10 }}>{mode === 'remove' ? '🔓' : '🔑'}</div>
    {mode === 'change' && (<>
      {localStep === 'current' && (<>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, color: "#3a2e28", marginBottom: 6 }}>Change PIN</div>
        <div style={{ fontSize: 13, color: "#b09070", marginBottom: 20 }}>Enter your current PIN</div>
        <PinBoxes value={curBoxes} onChange={handleCurrent} error={!!localError} />
        {localError && <div style={{ fontSize: 12, color: "#f0826c", marginTop: 10, fontWeight: 600 }}>{localError}</div>}
      </>)}
      {localStep === 'new' && (<>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, color: "#3a2e28", marginBottom: 6 }}>New PIN</div>
        <div style={{ fontSize: 13, color: "#b09070", marginBottom: 20 }}>Enter your new 4-digit PIN</div>
        <PinBoxes value={newBoxes} onChange={handleNew} error={false} />
      </>)}
      {localStep === 'confirm' && (<>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, color: "#3a2e28", marginBottom: 6 }}>Confirm PIN</div>
        <div style={{ fontSize: 13, color: "#b09070", marginBottom: 20 }}>Re-enter your new PIN to confirm</div>
        <PinBoxes value={confBoxes} onChange={(val) => handleConfirm(val, (newP) => { boards.forEach(b => onChangePinError(b.id, newP)); onClose(); })} error={!!localError} />
        {localError && <div style={{ fontSize: 12, color: "#f0826c", marginTop: 10, fontWeight: 600 }}>{localError}</div>}
      </>)}
    </>)}
    {mode === 'remove' && (<>
      {!removeConfirm && (<>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, color: "#3a2e28", marginBottom: 6 }}>Remove PIN</div>
        <div style={{ fontSize: 13, color: "#b09070", marginBottom: 20 }}>Enter your current PIN to continue</div>
        <PinBoxes value={curBoxes} onChange={handleCurrent} error={!!localError} />
        {localError && <div style={{ fontSize: 12, color: "#f0826c", marginTop: 10, fontWeight: 600 }}>{localError}</div>}
      </>)}
      {removeConfirm && (<>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, color: "#3a2e28", marginBottom: 8 }}>Remove PIN?</div>
        <div style={{ fontSize: 13, color: "#b09070", marginBottom: 24, lineHeight: 1.6 }}>All locked boards will become regular boards. Are you sure?</div>
        <div style={{ display: "flex", gap: 9 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1.5px solid #ede6dc", background: "transparent", color: "#b09070", fontFamily: "'Nunito',sans-serif", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>No, keep PIN</button>
          <button onClick={() => { boards.forEach(b => onChangePinError(b.id, null)); onClose(); }} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: "#e63946", color: "white", fontFamily: "'Nunito',sans-serif", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Yes, remove</button>
        </div>
      </>)}
    </>)}
    <button className="btn-cancel" style={{ width: "100%", marginTop: 14 }} onClick={onClose}>Cancel</button>
  </div></div>);
}

function PinModal({ title, subtitle, onSubmit, onClose, error }) {
  const [pin, setPin] = useState(["", "", "", ""]);
  return (<div className="modal-bg" onClick={onClose}><div className="modal" style={{ width: 320, textAlign: "center" }} onClick={e => e.stopPropagation()}>
    <div style={{ fontSize: 36, marginBottom: 12 }}>🔒</div>
    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, color: "#3a2e28", marginBottom: 6 }}>{title}</div>
    <div style={{ fontSize: 13, color: "#b09070", marginBottom: 24 }}>{subtitle}</div>
    <PinBoxes value={pin} onChange={n => { setPin(n); if (n.every(d => d !== "")) onSubmit(n.join("")); }} error={!!error} />
    {error && <div style={{ fontSize: 12, color: "#f0826c", marginTop: 12, fontWeight: 600 }}>{error}</div>}
    <button className="btn-cancel" style={{ width: "100%", marginTop: 16 }} onClick={onClose}>Cancel</button>
  </div></div>);
}
function ConfirmModal({ title, subtitle, onConfirm, onClose }) {
  return (<div className="modal-bg" onClick={onClose}><div className="modal" style={{ width: 340, textAlign: "center" }} onClick={e => e.stopPropagation()}>
    <div style={{ fontSize: 36, marginBottom: 12 }}>🗑️</div>
    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 19, color: "#3a2e28", marginBottom: 8 }}>{title}</div>
    <div style={{ fontSize: 13, color: "#b09070", marginBottom: 24, lineHeight: 1.6 }}>{subtitle}</div>
    <div className="modal-btns"><button className="btn-cancel" onClick={onClose}>Cancel</button><button onClick={onConfirm} style={{ flex: 2, padding: "11px", borderRadius: 12, border: "none", background: "#e63946", color: "#fff", fontFamily: "'Nunito',sans-serif", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Delete</button></div>
  </div></div>);
}

const LANDING_TILES = [
  { emoji: "🌸", cap: "golden hour aesthetic", board: "Aesthetic", bg: "rgba(255,210,220,0.4)" },
  { emoji: "🍜", cap: "ramen recipe inspo", board: "Food", bg: "rgba(253,225,200,0.4)" },
  { emoji: "👗", cap: "winter layering 2026", board: "Fashion", bg: "rgba(255,215,225,0.4)" },
  { emoji: "🌿", cap: "morning routine goals", board: "Wellness", bg: "rgba(210,240,220,0.4)" },
  { emoji: "✈️", cap: "bali travel diary", board: "Travel", bg: "rgba(210,225,255,0.4)" },
  { emoji: "💄", cap: "soft glam for dinner", board: "Beauty", bg: "rgba(255,205,220,0.4)" },
  { emoji: "🍓", cap: "strawberry matcha", board: "Food", bg: "rgba(255,210,215,0.4)" },
  { emoji: "🌙", cap: "night sky photography", board: "Aesthetic", bg: "rgba(220,210,255,0.4)" },
  { emoji: "🏖", cap: "santorini 2026", board: "Travel", bg: "rgba(255,235,200,0.4)" },
  { emoji: "🧁", cap: "pink velvet cupcakes", board: "Food", bg: "rgba(255,215,225,0.4)" },
  { emoji: "👠", cap: "ballet flat obsession", board: "Fashion", bg: "rgba(255,200,215,0.4)" },
  { emoji: "🌻", cap: "sunflower field day", board: "Aesthetic", bg: "rgba(255,240,200,0.4)" },
  { emoji: "🎨", cap: "colour palette inspo", board: "Aesthetic", bg: "rgba(230,210,255,0.4)" },
  { emoji: "🌅", cap: "golden hour in paris", board: "Travel", bg: "rgba(255,225,200,0.4)" },
  { emoji: "🧘", cap: "yoga flow routine", board: "Wellness", bg: "rgba(210,235,255,0.4)" },
  { emoji: "💎", cap: "jewelry styling guide", board: "Fashion", bg: "rgba(210,240,245,0.4)" },
  { emoji: "🍷", cap: "wine & cheese night", board: "Food", bg: "rgba(245,210,220,0.4)" },
  { emoji: "🌊", cap: "ocean therapy", board: "Travel", bg: "rgba(200,230,255,0.4)" },
  { emoji: "🎀", cap: "coquette aesthetic", board: "Aesthetic", bg: "rgba(255,210,230,0.4)" },
  { emoji: "🫶", cap: "self-care sunday", board: "Wellness", bg: "rgba(255,220,230,0.4)" },
];
const LANDING_COLS = [
  [0, 3, 6, 9, 12, 15, 18],
  [1, 4, 7, 10, 13, 16, 19],
  [2, 5, 8, 11, 14, 17, 0],
  [3, 6, 9, 12, 15, 18, 1],
  [4, 7, 10, 13, 16, 19, 2],
].map(idxs => idxs.map(i => LANDING_TILES[i % LANDING_TILES.length]));
const TILE_HEIGHTS = [170, 140, 190, 155, 180, 145, 165];

function ScrollColumn({ tiles, speed, offsetTop }) {
  const ref = useRef(null); const pos = useRef(0); const raf = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const halfH = el.scrollHeight / 2;
    const tick = () => { pos.current += speed; if (pos.current >= halfH) pos.current = 0; el.style.transform = `translateY(-${pos.current}px)`; raf.current = requestAnimationFrame(tick); };
    raf.current = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf.current);
  }, [speed]);
  const doubled = [...tiles, ...tiles];
  return (<div style={{ flex: 1, overflow: "hidden", marginTop: offsetTop }}>
    <div ref={ref} style={{ display: "flex", flexDirection: "column", gap: 10, willChange: "transform" }}>
      {doubled.map((tile, i) => (<div key={i} style={{ borderRadius: 14, background: tile.bg, border: "1px solid rgba(220,140,155,0.15)", height: TILE_HEIGHTS[i % TILE_HEIGHTS.length], flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
        <span style={{ fontSize: 30, position: "relative", zIndex: 1 }}>{tile.emoji}</span>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "8px 10px", background: "linear-gradient(transparent,rgba(200,100,120,0.07))" }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: "rgba(80,20,30,0.5)", lineHeight: 1.4 }}>{tile.cap}</div>
          <div style={{ fontSize: 8, fontWeight: 600, color: "rgba(180,70,90,0.4)", marginTop: 1 }}>{tile.board}</div>
        </div>
      </div>))}
    </div>
  </div>);
}

function LandingPage({ onEnter }) {
  const [showAbout, setShowAbout] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const speeds = [0.4, 0.28, 0.5, 0.35, 0.22];
  const offsets = [0, 30, 55, 18, 42];
  return (<div style={{ width: "100vw", height: "100vh", position: "relative", overflow: "hidden", background: "#fff5f5", fontFamily: "'Nunito',sans-serif" }}>
    {/* Scrolling masonry */}
    <div style={{ position: "absolute", inset: 0, display: "flex", gap: 10, padding: 10, alignItems: "flex-start" }}>
      {LANDING_COLS.map((col, i) => <ScrollColumn key={i} tiles={col} speed={speeds[i]} offsetTop={offsets[i]} />)}
    </div>
    {/* Overlay */}
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 75% 65% at 50% 48%, rgba(255,245,247,0.93) 0%, rgba(255,240,244,0.72) 50%, transparent 100%), linear-gradient(to bottom, rgba(255,245,247,0.28) 0%, rgba(255,240,244,0.12) 40%, rgba(255,235,240,0.62) 75%, rgba(255,232,238,0.97) 100%)", pointerEvents: "none" }} />
    {/* Navbar */}
    <nav style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 36px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#ffd8e0,#f09098)", boxShadow: "0 3px 12px rgba(200,80,100,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}><LogoMark size={20} /></div>
        <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 600, color: "#3a1520" }}>Insta<em style={{ fontStyle: "italic", color: "#c04060" }}>Vault</em></span>
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button onClick={() => setShowAbout(true)} style={{ padding: "8px 18px", borderRadius: 99, border: "none", background: "transparent", color: "#b07880", fontFamily: "'Nunito',sans-serif", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>About</button>
        <button onClick={onEnter} style={{ padding: "8px 22px", borderRadius: 99, border: "1.5px solid rgba(200,80,100,0.28)", background: "rgba(255,255,255,0.75)", backdropFilter: "blur(8px)", color: "#c04060", fontFamily: "'Nunito',sans-serif", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Log in</button>
        <button onClick={onEnter} style={{ padding: "8px 22px", borderRadius: 99, border: "none", background: "linear-gradient(135deg,#f9c0c8,#f07090)", color: "#fff", fontFamily: "'Nunito',sans-serif", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(200,80,100,0.3)" }}>Sign up free</button>
      </div>
    </nav>
    {/* Hero */}
    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-52%)", zIndex: 10, textAlign: "center", width: 540 }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(10px)", border: "1px solid rgba(220,140,155,0.25)", borderRadius: 99, padding: "5px 16px", fontSize: 11, fontWeight: 700, color: "#c04060", letterSpacing: "0.04em", marginBottom: 18 }}>✨ Your personal inspiration vault</div>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 54, fontWeight: 700, color: "#3a1520", lineHeight: 1.1, marginBottom: 14, letterSpacing: -1 }}>Save what inspires <em style={{ fontStyle: "italic", color: "#c04060" }}>you.</em></div>
      <div style={{ fontSize: 15.5, color: "#a07080", lineHeight: 1.7, marginBottom: 30, fontWeight: 400 }}>Organise your favourite Instagram posts into beautiful boards.<br />Fashion, food, travel, aesthetic — all in one private space.</div>
      <div style={{ display: "flex", gap: 11, justifyContent: "center", marginBottom: 24 }}>
        <button onClick={onEnter} style={{ padding: "13px 36px", borderRadius: 99, border: "none", background: "linear-gradient(135deg,#f9c0c8,#f07090)", color: "#fff", fontFamily: "'Nunito',sans-serif", fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 24px rgba(200,80,100,0.32)" }}>Get started — it's free</button>
        <button onClick={onEnter} style={{ padding: "13px 36px", borderRadius: 99, border: "1.5px solid rgba(200,80,100,0.28)", background: "rgba(255,255,255,0.7)", backdropFilter: "blur(10px)", color: "#c04060", fontFamily: "'Nunito',sans-serif", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>Log in</button>
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
        {["🗂️ Beautiful boards", "🏷️ Smart tags", "🔒 PIN locked", "🌙 Dark mode", "📓 Board journal"].map(p => (<div key={p} style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)", border: "1px solid rgba(220,140,155,0.2)", borderRadius: 99, padding: "5px 13px", fontSize: 11, fontWeight: 600, color: "#a07080" }}>{p}</div>))}
      </div>
    </div>
    {/* Footer */}
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 20, padding: "14px 36px", background: "linear-gradient(to top,rgba(255,232,238,0.98),transparent)", fontSize: 11.5, color: "#c09090", fontWeight: 600 }}>
      <span>© InstaVault 2026</span>
      <span style={{ color: "#e0c0c8" }}>·</span>
      <span style={{ cursor: "pointer" }} onClick={() => { }}>Privacy</span>
      <span style={{ color: "#e0c0c8" }}>·</span>
      <span style={{ cursor: "pointer" }} onClick={() => setShowTerms(true)}>Terms</span>
      <span style={{ color: "#e0c0c8" }}>·</span>
      <span>Made with ♥ by <span style={{ color: "#e07090", fontWeight: 700 }}>Harika</span></span>
    </div>
    {/* About Modal */}
    {showAbout && (<div onClick={() => setShowAbout(false)} style={{ position: "absolute", inset: 0, zIndex: 50, background: "rgba(60,10,25,0.2)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "rgba(255,250,250,0.93)", backdropFilter: "blur(20px)", border: "1px solid rgba(220,140,155,0.3)", borderRadius: 20, padding: 32, width: 460, boxShadow: "0 24px 60px rgba(180,60,80,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
          <div style={{ width: 44, height: 44, borderRadius: 13, background: "linear-gradient(135deg,#ffd8e0,#f09098)", boxShadow: "0 4px 14px rgba(200,80,100,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}><LogoMark size={26} /></div>
          <div><div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 600, color: "#3a1520" }}>Insta<em style={{ fontStyle: "italic", color: "#c04060" }}>Vault</em></div><div style={{ fontSize: 11.5, color: "#b07880", marginTop: 1 }}>2026 · Designed & built by Harika</div></div>
          <button onClick={() => setShowAbout(false)} style={{ marginLeft: "auto", background: "none", border: "none", fontSize: 20, color: "#c09090", cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>
        {[["📌", "What is InstaVault?", "A personal Instagram inspiration organiser. Save posts into beautifully organised boards — like Pinterest, but yours."], ["🗂️", "Boards", "Create boards for any vibe — fashion, food, travel, aesthetic. Name them, give them an emoji or colour, and lock with a PIN."], ["💾", "Saving Posts", "Paste any Instagram link. Add a screenshot thumbnail, caption, and tags so you can find it later."], ["🏷️", "Tags", "Tag posts with #hashtags. Click any tag to filter across all boards instantly."], ["📓", "Journal", "Each board has its own private diary with dated entries."], ["🔒", "Privacy", "Your vault is yours alone. Everything you save stays private, secure, and never shared."]].map(([icon, title, desc]) => (<div key={title} style={{ display: "flex", gap: 11, marginBottom: 14 }}><span style={{ fontSize: 17, flexShrink: 0, marginTop: 1 }}>{icon}</span><div><div style={{ fontSize: 13, fontWeight: 700, color: "#3a1520", marginBottom: 2 }}>{title}</div><div style={{ fontSize: 12, color: "#a07880", lineHeight: 1.65 }}>{desc}</div></div></div>))}
        <button onClick={() => { setShowAbout(false); onEnter(); }} style={{ width: "100%", marginTop: 8, padding: "11px", borderRadius: 11, border: "none", background: "linear-gradient(135deg,#f9c0c8,#f07090)", color: "#fff", fontFamily: "'Nunito',sans-serif", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(200,80,100,0.25)" }}>Get started — it's free ✨</button>
      </div>
    </div>)}
    {/* Terms Modal */}
    {showTerms && (<div onClick={() => setShowTerms(false)} style={{ position: "absolute", inset: 0, zIndex: 50, background: "rgba(60,10,25,0.2)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "rgba(255,250,250,0.93)", backdropFilter: "blur(20px)", border: "1px solid rgba(220,140,155,0.3)", borderRadius: 20, padding: 32, width: 500, maxHeight: "80vh", boxShadow: "0 24px 60px rgba(180,60,80,0.15)", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 600, color: "#3a1520" }}>Terms of Use</div>
          <button onClick={() => setShowTerms(false)} style={{ background: "none", border: "none", fontSize: 20, color: "#c09090", cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>
        <div style={{ overflowY: "auto", flex: 1, paddingRight: 4 }}>
          {[["1. Acceptance", "By accessing or using InstaVault, you agree to be bound by these Terms of Use. If you do not agree, please do not use the app."], ["2. Use of the App", "InstaVault is a personal inspiration organiser. You may use it to save and organise content for personal, non-commercial purposes only."], ["3. Your Content", "You are solely responsible for the content you save. We do not claim ownership over any posts, images, or links you store. All saved data remains on your device."], ["4. Intellectual Property", "InstaVault, its logo, design, and code are the intellectual property of Harika. You may not copy or distribute any part of the app without permission."], ["5. Privacy", "Your boards and saved posts are stored locally on your device. We do not collect, transmit, or sell your personal data."], ["6. Disclaimer", "InstaVault is provided as-is, without warranties of any kind. We are not liable for any loss of data or damages arising from your use of the app."], ["7. Changes to Terms", "We may update these terms from time to time. Continued use of the app after changes constitutes acceptance of the revised terms."], ["8. Contact", "For questions or concerns, please reach out via the feedback option in your profile menu."]].map(([title, text]) => (<div key={title} style={{ marginBottom: 16 }}><div style={{ fontSize: 12.5, fontWeight: 700, color: "#3a1520", marginBottom: 4 }}>{title}</div><div style={{ fontSize: 12, color: "#a07880", lineHeight: 1.7 }}>{text}</div></div>))}
          <div style={{ fontSize: 10.5, color: "#c0a0a8", marginTop: 8 }}>Last updated: January 2026</div>
        </div>
        <button onClick={() => setShowTerms(false)} style={{ width: "100%", marginTop: 16, padding: "11px", borderRadius: 11, border: "1.5px solid rgba(220,140,155,0.3)", background: "transparent", color: "#b07880", fontFamily: "'Nunito',sans-serif", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Close</button>
      </div>
    </div>)}
  </div>);
}


function SplashScreen({ onDone }) {
  const [gone, setGone] = useState(false);
  useEffect(() => { const t = setTimeout(() => { setGone(true); setTimeout(onDone, 500); }, 2600); return () => clearTimeout(t); }, []);
  return (<div style={{ position: "fixed", inset: 0, zIndex: 999, background: "linear-gradient(135deg,#fff5f7,#ffe8ee)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transition: "opacity 0.5s ease", opacity: gone ? 0 : 1, pointerEvents: "none" }}>
    {[300, 210].map((r, i) => (<div key={r} style={{ position: "absolute", width: r, height: r, borderRadius: "50%", border: "1.5px solid rgba(200,100,130,0.22)", animation: `splashRingIn 0.7s ease-out ${0.15 + i * 0.15}s both, splashRingPulse 3s ease-in-out ${1 + i * 0.3}s infinite` }} />))}
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22, zIndex: 2 }}>
      <div style={{ position: "relative", animation: "splashBoxPop 0.65s cubic-bezier(0.34,1.56,0.64,1) 0.2s both, splashFloat 3.5s ease-in-out 1.4s infinite" }}>
        <div style={{ width: 96, height: 96, borderRadius: 28, background: "linear-gradient(135deg,#fef2f5,#fde4ea)", border: "1.5px solid rgba(220,140,160,0.2)", boxShadow: "0 16px 48px rgba(240,130,108,0.22)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ animation: "splashPinDrop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.7s both" }}>
            <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="#c04060" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 6-9 13-9 13S3 16 3 10a9 9 0 0118 0z" />
              <g style={{ animation: "splashHeartPulse 0.6s ease-out 1.1s both", transformOrigin: "12px 9px" }}>
                <path d="M12 7 Q10.5 5.5 9 6.5 Q8 7.5 9 9 Q10 10 12 11 Q14 10 15 9 Q16 7.5 15 6.5 Q13.5 5.5 12 7z" />
              </g>
            </svg>
          </div>
        </div>
        {[["22px", "18px", "#f9c0c8", "splashSp1"], ["18px", "22px", "#f0826c", "splashSp2"], ["22px", "6px", "#c04060", "splashSp3"], ["6px", "18px", "#f9c784", "splashSp4"]].map(([t, l, bg, anim], i) => (
          <div key={i} style={{ position: "absolute", top: t, left: l, width: i % 2 === 0 ? 6 : 5, height: i % 2 === 0 ? 6 : 5, borderRadius: "50%", background: bg, animation: `${anim} 1.2s ease-out ${1 + i * 0.07}s both` }} />
        ))}
      </div>
      <div style={{ textAlign: "center", animation: "splashTitleUp 0.5s ease-out 1.3s both" }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 36, fontWeight: 600, color: "#3a1520" }}>Insta<span style={{ fontStyle: "italic", color: "#c04060" }}>Vault</span></div>
        <div style={{ fontSize: 14, color: "#c09090", fontWeight: 500, marginTop: 8, animation: "splashTagFade 0.5s ease-out 1.7s both", opacity: 0 }}>Your inspiration, beautifully kept ✨</div>
      </div>
    </div>
  </div>);
}
function ProfileModal({ onClose, dark, onToggleDark, profile, onSaveProfile, onSignOut, categories, items, journal, deletedItems, deletedBoards }) {
  const T = dark ? DARK : LIGHT;
  const [page, setPage] = useState("main");
  const [name, setName] = useState(profile.name || "");
  const [email, setEmail] = useState(profile.email || "");
  const [avatarType, setAvatarType] = useState(profile.avatarType || "letter");
  const [avatarEmoji, setAvatarEmoji] = useState(profile.avatarEmoji || "🌸");
  const [avatarImg, setAvatarImg] = useState(profile.avatarImg || null);
  const fileRef = useRef();

  const AvatarPreview = ({ size = 68, n = name, type = avatarType, emoji = avatarEmoji, img = avatarImg }) => {
    if (type === "image" && img) return <img src={img} alt="" style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", boxShadow: "0 4px 16px rgba(240,130,108,0.28)" }} />;
    if (type === "emoji") return <div style={{ width: size, height: size, borderRadius: "50%", background: "linear-gradient(135deg,#fef2f5,#fde4ea)", border: "1.5px solid rgba(220,140,160,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.44 }}>{emoji}</div>;
    return <div style={{ width: size, height: size, borderRadius: "50%", background: "linear-gradient(135deg,#f9c784,#f0826c)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.38, fontWeight: 700, color: "white", boxShadow: "0 4px 16px rgba(240,130,108,0.28)" }}>{(n || "?").charAt(0).toUpperCase()}</div>;
  };

  if (page === "about") return (<div className="modal-bg" onClick={onClose}><div className="modal" style={{ background: T.surface, width: 420, maxHeight: "85vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
    <button onClick={() => setPage("main")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: T.muted, marginBottom: 14, fontFamily: "'Nunito',sans-serif" }}>← Back</button>
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
      <div style={{ width: 46, height: 46, borderRadius: 13, background: "linear-gradient(135deg,#fef2f5,#fde4ea)", border: "1.5px solid rgba(220,140,160,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}><LogoMark size={28} /></div>
      <div><div style={{ fontFamily: "'Playfair Display',serif", fontSize: 21, fontWeight: 600, color: T.text }}>Insta<span style={{ fontStyle: "italic", color: "#c04060" }}>Vault</span></div><div style={{ fontSize: 12, color: T.muted }}>2026 · Built by Harika</div></div>
    </div>
    {[["📌", "What is InstaVault?", "A personal Instagram inspiration organiser. Save posts and reels into beautifully organised boards — like Pinterest, but yours."],
    ["🗂️", "Boards", "Create boards for any vibe — fashion, food, travel, aesthetic. Name them, give them an emoji or colour, and lock with a PIN."],
    ["💾", "Saving Posts", "Paste any Instagram link. Add a screenshot thumbnail (Ctrl+V), caption, and tags so you can find it later."],
    ["🏷️", "Tags", "Tag posts with #hashtags. Click any tag to filter across all boards."],
    ["📓", "Journal", "Each board has its own diary with dated entries."],
    ["🔒", "Privacy", "Your vault is yours alone. Everything you save stays private, secure, and never shared."],
    ["🗑️", "Recently Deleted", "Deleted items stay 30 days before permanent removal."],
    ["👤", "Built by", "Designed and built by Harika using React and Vite."]
    ].map(([icon, title, desc]) => (<div key={title} style={{ marginBottom: 14 }}><div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}><span style={{ fontSize: 16 }}>{icon}</span><div style={{ fontWeight: 700, fontSize: 13, color: T.text }}>{title}</div></div><div style={{ fontSize: 12.5, color: T.muted, lineHeight: 1.65, paddingLeft: 23 }}>{desc}</div></div>))}
  </div></div>);

  if (page === "edit") return (<div className="modal-bg" onClick={onClose}><div className="modal" style={{ background: T.surface, width: 380 }} onClick={e => e.stopPropagation()}>
    <button onClick={() => setPage("main")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: T.muted, marginBottom: 13, fontFamily: "'Nunito',sans-serif" }}>← Back</button>
    <div className="modal-title" style={{ color: T.text }}>Edit Profile</div>
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
      <AvatarPreview size={54} />
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        <div style={{ display: "flex", gap: 5 }}>
          {[["letter", "Aa"], ["emoji", "😊"], ["image", "📷"]].map(([type, label]) => (<button key={type} onClick={() => setAvatarType(type)} style={{ padding: "4px 9px", borderRadius: 7, border: `1.5px solid ${avatarType === type ? "#f0826c" : "#ede6dc"}`, background: avatarType === type ? "#fff5ee" : "transparent", color: avatarType === type ? "#c04060" : "#b09070", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>{label}</button>))}
        </div>
        {avatarType === "emoji" && <div style={{ display: "flex", gap: 4, flexWrap: "wrap", maxWidth: 200 }}>{AVATAR_EMOJIS.map(e => (<button key={e} onClick={() => setAvatarEmoji(e)} style={{ width: 28, height: 28, borderRadius: 7, border: `2px solid ${avatarEmoji === e ? "#f0826c" : "#ede6dc"}`, background: avatarEmoji === e ? "#fff5ee" : "transparent", fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{e}</button>))}</div>}
        {avatarType === "image" && <button onClick={() => fileRef.current.click()} style={{ padding: "5px 11px", borderRadius: 7, border: "1px solid #ede6dc", background: "#fdf8f3", color: "#b07850", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>Upload photo</button>}
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { if (e.target.files[0]) { const r = new FileReader(); r.onload = ev => setAvatarImg(ev.target.result); r.readAsDataURL(e.target.files[0]); } }} />
      </div>
    </div>
    <input className="modal-input" style={{ background: T.input, color: T.text, borderColor: T.border }} placeholder="Display name" value={name} onChange={e => setName(e.target.value)} />
    <input className="modal-input" style={{ background: T.input, color: T.text, borderColor: T.border, marginBottom: 14 }} placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
    <div className="modal-btns"><button className="btn-cancel" onClick={() => setPage("main")}>Cancel</button><button className="btn-create" style={{ border: "none", cursor: "pointer" }} onClick={() => { onSaveProfile({ name, email, avatarType, avatarEmoji, avatarImg }); setPage("main"); }}>Save</button></div>
  </div></div>);

  return (<div className="modal-bg" onClick={onClose}><div className="modal" style={{ background: T.surface, width: 360 }} onClick={e => e.stopPropagation()}>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 18 }}>
      <AvatarPreview size={66} n={profile.name} type={profile.avatarType} emoji={profile.avatarEmoji} img={profile.avatarImg} />
      <div style={{ textAlign: "center" }}><div style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, color: T.text }}>{profile.name || "Your Name"}</div><div style={{ fontSize: 12, color: T.muted }}>{profile.email || "Edit profile to add email"}</div></div>
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      {[["✏️", "Edit Profile", () => setPage("edit")], ["ℹ️", "About InstaVault", () => setPage("about")], ["🔔", "Notifications", onClose], ["❓", "Help & Feedback", onClose]].map(([icon, label, action]) => (<button key={label} onClick={action} style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 12px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.input, cursor: "pointer", fontFamily: "'Nunito',sans-serif", fontSize: 13, color: T.text, textAlign: "left" }}><span style={{ fontSize: 16 }}>{icon}</span>{label}</button>))}
      <button onClick={onToggleDark} style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 12px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.input, cursor: "pointer", fontFamily: "'Nunito',sans-serif", fontSize: 13, color: T.text, textAlign: "left" }}>
        <span style={{ fontSize: 16 }}>{dark ? "☀️" : "🌙"}</span>{dark ? "Light Mode" : "Dark Mode"}
        <div style={{ marginLeft: "auto", width: 36, height: 20, borderRadius: 99, background: dark ? "#f0826c" : "#ede6dc", position: "relative", flexShrink: 0 }}><div style={{ position: "absolute", top: 2, left: dark ? 17 : 2, width: 16, height: 16, borderRadius: "50%", background: "white", transition: "left 0.2s" }} /></div>
      </button>
      <button onClick={() => {
        const data = { categories, items, journal, profile, deletedItems, deletedBoards, exportedAt: new Date().toISOString(), version: "iv1" };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = `InstaVault-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click(); URL.revokeObjectURL(url);
      }} style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 12px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.input, cursor: "pointer", fontFamily: "'Nunito',sans-serif", fontSize: 13, color: T.text, textAlign: "left" }}>
        <span style={{ fontSize: 16 }}>💾</span>Export Backup
      </button>
      <button style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 12px", borderRadius: 10, border: "1px solid rgba(220,140,155,0.3)", background: "rgba(255,235,240,0.6)", cursor: "pointer", fontFamily: "'Nunito',sans-serif", fontSize: 13, color: "#c04060", marginTop: 2 }} onClick={onSignOut || onClose}><span style={{ fontSize: 16 }}>🚪</span>Sign Out</button>
    </div>
  </div></div>);
}

function IconPicker({ icon, color, onIconChange, onColorChange }) {
  const [tab, setTab] = useState("emoji");
  const barRef = useRef();
  const hueToHex = (h) => { const f = n => { const k = (n + h / 60) % 6; return Math.round(255 * (1 - Math.max(Math.min(k, 4 - k, 1), 0))); }; return "#" + [f(5), f(3), f(1)].map(v => v.toString(16).padStart(2, "0")).join(""); };
  const [barThumbPct, setBarThumbPct] = useState(null);
  const handleBarClick = (e) => { const r = barRef.current.getBoundingClientRect(); const pct = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)); setBarThumbPct(pct); const col = hueToHex(Math.round(pct * 360)); onColorChange(col); };
  const handleBarMove = (e) => { if (e.buttons !== 1) return; const r = barRef.current.getBoundingClientRect(); const pct = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)); setBarThumbPct(pct); const col = hueToHex(Math.round(pct * 360)); onColorChange(col); };
  return (<div style={{ marginBottom: 13 }}>
    <div style={{ display: "flex", gap: 4, marginBottom: 8, background: "#fdf8f3", borderRadius: 8, padding: 3 }}>
      {["emoji", "color"].map(t => (<button key={t} type="button" onClick={() => setTab(t)} style={{ flex: 1, padding: "5px", borderRadius: 6, border: "none", background: tab === t ? "#fff" : "transparent", color: tab === t ? "#3a2e28" : "#b09070", fontFamily: "'Nunito',sans-serif", fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}>{t === "emoji" ? "😊 Emoji" : "🎨 Colour"}</button>))}
    </div>
    {tab === "emoji" ? (<div style={{ display: "grid", gridTemplateColumns: "repeat(8,1fr)", gap: 5, maxHeight: 148, overflowY: "auto" }}>{EMOJI_OPTIONS.map(e => (<button key={e} type="button" onClick={() => onIconChange(e)} style={{ width: 36, height: 36, borderRadius: 8, border: `2px solid ${icon === e && !color ? "#f0826c" : "#ede6dc"}`, background: icon === e && !color ? "#fff5ee" : "#fdf8f3", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{e}</button>))}</div>)
      : (<div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(9,1fr)", gap: 7, marginBottom: 12 }}>{COLOR_OPTIONS.map(c => (<button key={c} type="button" onClick={() => { onColorChange(c); setBarThumbPct(null); }} style={{ width: 32, height: 32, borderRadius: "50%", background: c, border: `3px solid ${color === c ? "#3a2e28" : "transparent"}`, cursor: "pointer", transition: "transform 0.12s" }} />))}</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#b09070", marginBottom: 6 }}>Or pick any colour</div>
        <div ref={barRef} onMouseDown={handleBarClick} onMouseMove={handleBarMove} style={{ width: "100%", height: 24, borderRadius: 12, background: "linear-gradient(90deg,hsl(0,100%,50%),hsl(30,100%,50%),hsl(60,100%,50%),hsl(120,100%,50%),hsl(180,100%,50%),hsl(240,100%,50%),hsl(300,100%,50%),hsl(360,100%,50%))", cursor: "crosshair", marginBottom: 10, border: "1px solid rgba(0,0,0,0.08)", position: "relative", userSelect: "none" }}>
          {barThumbPct !== null && <div style={{ position: "absolute", top: "50%", left: `calc(${barThumbPct * 100}% - 10px)`, transform: "translateY(-50%)", width: 20, height: 20, borderRadius: "50%", background: color || "transparent", border: "2.5px solid white", boxShadow: "0 1px 8px rgba(0,0,0,0.35)", pointerEvents: "none" }} />}
        </div>
        {color && <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: color, border: "1.5px solid rgba(0,0,0,0.1)", flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }} />
          <span style={{ fontSize: 11, color: "#b09070", fontWeight: 600 }}>Selected colour</span>
        </div>}
      </div>)}
  </div>);
}

function BoardModal({ initial, onSave, onClose, existingNames }) {
  const editing = !!initial;
  const [name, setName] = useState(initial?.name || "");
  const [icon, setIcon] = useState(initial?.icon || "🌸");
  const [color, setColor] = useState(initial?.color || "");
  const [lockOn, setLockOn] = useState(!!initial?.pin);
  const [pin, setPin] = useState(["", "", "", ""]);
  const [changingPin, setChangingPin] = useState(false);
  const [nameErr, setNameErr] = useState("");
  const [coverImg, setCoverImg] = useState(initial?.coverImg || null);
  const coverRef = useRef();

  const handleSubmit = (e) => {
    e.preventDefault(); if (!name.trim()) { setNameErr("Board name is required."); return; }
    const dup = existingNames.filter(n => editing ? n.toLowerCase() !== initial.name.toLowerCase() : true).find(n => n.toLowerCase() === name.trim().toLowerCase());
    if (dup) { setNameErr("A board with this name already exists."); return; }
    let newPin = initial?.pin || null;
    if (lockOn) { if (!editing || changingPin) { if (pin.every(d => d !== "")) newPin = pin.join(""); } else newPin = initial?.pin || null; } else newPin = null;
    onSave({ name: name.trim(), icon: color ? "" : icon, color: color || null, pin: newPin, coverImg: coverImg || null });
  };
  return (<div className="modal-bg" onClick={onClose}><div className="modal" style={{ width: 440, maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
    <div className="modal-title">{editing ? "Edit Board" : "Create a new board"}</div>
    <IconPicker icon={icon} color={color} onIconChange={v => { setIcon(v); setColor(""); }} onColorChange={v => { setColor(v); setIcon(""); }} />
    <form onSubmit={handleSubmit}>
      <input className="modal-input" autoFocus placeholder="Board name" value={name} onChange={e => { setName(e.target.value); setNameErr(""); }} />
      {nameErr && <div style={{ fontSize: 12, color: "#e63946", marginTop: -6, marginBottom: 9, fontWeight: 600 }}>⚠️ {nameErr}</div>}
      <div style={{ marginBottom: 13 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#8a7060", marginBottom: 7 }}>🖼 Custom cover <span style={{ fontWeight: 400, color: "#c4a888" }}>(optional — auto uses last saved post)</span></div>
        {coverImg ? (<div style={{ position: "relative", borderRadius: 9, overflow: "hidden", height: 75, marginBottom: 5 }}>
          <img src={coverImg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <button type="button" onClick={() => setCoverImg(null)} style={{ position: "absolute", top: 5, right: 5, width: 20, height: 20, borderRadius: 99, background: "rgba(0,0,0,0.5)", border: "none", color: "white", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>) : (<button type="button" onClick={() => coverRef.current.click()} style={{ padding: "5px 13px", borderRadius: 8, border: "1px solid #ede6dc", background: "#fdf8f3", color: "#b07850", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>Upload cover</button>)}
        <input ref={coverRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { if (e.target.files[0]) { const r = new FileReader(); r.onload = ev => setCoverImg(ev.target.result); r.readAsDataURL(e.target.files[0]); } }} />
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", marginBottom: 7 }}>
        <div><div style={{ fontSize: 13, fontWeight: 700, color: "#3a2e28" }}>🔒 Lock this board</div><div style={{ fontSize: 11, color: "#b09070" }}>Protect with a 4-digit PIN</div></div>
        <div onClick={() => setLockOn(p => !p)} style={{ width: 44, height: 24, borderRadius: 99, background: lockOn ? "#f0826c" : "#ede6dc", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}><div style={{ position: "absolute", top: 3, left: lockOn ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: "white", transition: "left 0.2s" }} /></div>
      </div>
      {lockOn && (<div style={{ marginBottom: 13 }}>
        {editing && initial?.pin && !changingPin
          ? (<div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={() => setChangingPin(true)} style={{ flex: 1, padding: "5px 13px", borderRadius: 8, border: "1px solid #ede6dc", background: "#fdf8f3", color: "#b07850", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>Change PIN</button>
            <button type="button" onClick={() => { setLockOn(false); setChangingPin(false); }} style={{ flex: 1, padding: "5px 13px", borderRadius: 8, border: "1px solid rgba(230,57,70,0.25)", background: "transparent", color: "#e63946", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>Remove PIN</button>
          </div>)
          : (<><div style={{ fontSize: 12, color: "#b09070", marginBottom: 9, textAlign: "center" }}>{editing && changingPin ? "New PIN" : "Set 4-digit PIN"}</div><PinBoxes value={pin} onChange={setPin} error={false} />{editing && changingPin && <button type="button" onClick={() => setChangingPin(false)} style={{ marginTop: 6, fontSize: 11, color: "#b09070", background: "none", border: "none", cursor: "pointer", fontFamily: "'Nunito',sans-serif", display: "block", width: "100%", textAlign: "center" }}>← Keep existing PIN</button>}</>)
        }
      </div>)}
      <div className="modal-btns"><button type="button" className="btn-cancel" onClick={onClose}>Cancel</button><button type="submit" className="btn-create">{editing ? "Save Changes" : "Create Board ✨"}</button></div>
    </form>
  </div></div>);
}

function JournalModal({ board, journal, onSave, onClose, dark }) {
  const T = dark ? DARK : LIGHT;
  const entries = (journal[board.id] || []).slice().sort((a, b) => b.ts - a.ts);
  const [text, setText] = useState("");
  const [selMode, setSelMode] = useState(false);
  const [selIds, setSelIds] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  const addEntry = () => { if (!text.trim()) return; const e = { id: Date.now().toString(), ts: Date.now(), text: text.trim() }; onSave(board.id, [...entries.slice().reverse(), e]); setText(""); };
  const toggleSel = (id) => setSelIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const deleteSelected = () => { onSave(board.id, entries.filter(e => !selIds.includes(e.id)).slice().reverse()); setSelIds([]); setSelMode(false); };
  return (<div className="modal-bg" onClick={onClose}><div className="modal" style={{ background: T.surface, width: 500, maxHeight: "82vh", display: "flex", flexDirection: "column" }} onClick={e => e.stopPropagation()}>
    <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
      <span style={{ fontSize: 19 }}>📓</span>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, color: T.text, flex: 1 }}>{board.name}</div>
      <button onClick={() => { setSelMode(p => !p); setSelIds([]); }} style={{ padding: "3px 10px", borderRadius: 7, border: `1.5px solid ${selMode ? "#c04060" : T.border}`, background: selMode ? "rgba(192,64,96,0.08)" : "transparent", color: selMode ? "#c04060" : T.muted, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>{selMode ? "✓ Selecting" : "Select"}</button>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 19, color: T.muted, lineHeight: 1, marginLeft: 4 }}>×</button>
    </div>
    {selMode && selIds.length > 0 && (<div style={{ display: "flex", gap: 7, alignItems: "center", background: T.input, border: `1.5px solid ${T.border}`, borderRadius: 9, padding: "6px 10px", marginBottom: 10 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{selIds.length} selected</span>
      <button onClick={deleteSelected} style={{ padding: "3px 10px", borderRadius: 7, border: "1px solid #f5c5d8", background: "#fff0f5", color: "#e63946", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>Delete</button>
      <button onClick={() => { setSelIds([]); setSelMode(false); }} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: T.muted, padding: 0 }}>Cancel</button>
    </div>)}
    {!selMode && (<div style={{ display: "flex", gap: 7, marginBottom: 12 }}>
      <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Write a new entry…" style={{ flex: 1, padding: "9px 11px", borderRadius: 10, border: `1.5px solid ${T.border}`, background: T.input, fontFamily: "'Nunito',sans-serif", fontSize: 13, color: T.text, outline: "none", resize: "none", minHeight: 64, lineHeight: 1.6 }} />
      <button onClick={addEntry} disabled={!text.trim()} style={{ alignSelf: "flex-end", padding: "7px 12px", borderRadius: 9, border: "none", background: text.trim() ? "linear-gradient(135deg,#f9c784,#f0826c)" : "#e8d8cc", color: text.trim() ? "#fff" : "#b8a898", fontFamily: "'Nunito',sans-serif", fontSize: 12, fontWeight: 700, cursor: text.trim() ? "pointer" : "not-allowed", whiteSpace: "nowrap" }}>Add</button>
    </div>)}
    <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 9 }}>
      {entries.length === 0 ? (<div style={{ textAlign: "center", padding: "28px 20px", color: T.muted }}><div style={{ fontSize: 30, marginBottom: 7 }}>📝</div><div style={{ fontSize: 13 }}>No entries yet.</div></div>)
        : entries.map(entry => {
          const isSel = selIds.includes(entry.id);
          return (<div key={entry.id} onClick={selMode ? () => toggleSel(entry.id) : undefined}
            style={{ background: isSel ? (dark ? "rgba(240,130,108,0.12)" : "rgba(240,130,108,0.07)") : T.bg, borderRadius: 10, padding: "11px 13px", border: `1px solid ${isSel ? "#f0826c" : T.border}`, cursor: selMode ? "pointer" : "default", position: "relative", transition: "border-color 0.15s" }}>
            {selMode && <div style={{ position: "absolute", top: 10, right: 10, width: 18, height: 18, borderRadius: "50%", background: isSel ? "#f0826c" : "rgba(200,190,185,0.4)", border: `2px solid ${isSel ? "#f0826c" : "#c8b8b0"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "white" }}>{isSel ? "✓" : ""}</div>}
            <div style={{ fontSize: 10.5, color: T.muted, marginBottom: 5, fontWeight: 600 }}>{new Date(entry.ts).toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}</div>
            {editId === entry.id
              ? <><textarea value={editText} onChange={e => setEditText(e.target.value)} style={{ width: "100%", padding: "6px 8px", borderRadius: 7, border: `1.5px solid ${T.border}`, background: T.surface, fontFamily: "'Nunito',sans-serif", fontSize: 13, color: T.text, outline: "none", resize: "none", minHeight: 60, lineHeight: 1.6, boxSizing: "border-box" }} /><div style={{ display: "flex", gap: 6, marginTop: 6 }}><button onClick={() => { if (editText.trim()) onSave(board.id, entries.map(e => e.id === entry.id ? { ...e, text: editText.trim() } : e).slice().reverse()); setEditId(null); }} style={{ padding: "3px 10px", borderRadius: 7, border: "none", background: "#f0826c", color: "white", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>Save</button><button onClick={() => setEditId(null)} style={{ padding: "3px 10px", borderRadius: 7, border: `1px solid ${T.border}`, background: "transparent", color: T.muted, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>Cancel</button></div></>
              : <div style={{ fontSize: 13, color: T.text, lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{entry.text}</div>}
            {!selMode && editId !== entry.id && (<div style={{ display: "flex", gap: 8, marginTop: 7 }}>
              <button onClick={() => { setEditId(entry.id); setEditText(entry.text); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: T.muted, padding: 0 }}>✏️ Edit</button>
              <button onClick={() => onSave(board.id, entries.filter(e => e.id !== entry.id).slice().reverse())} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#e63946", padding: 0 }}>🗑 Delete</button>
            </div>)}
          </div>);
        })}
    </div>
  </div></div>);
}

function EditPostModal({ item, onSave, onClose, dark }) {
  const T = dark ? DARK : LIGHT;
  const [caption, setCaption] = useState(item.caption || "");
  const [tags, setTags] = useState((item.tags || []).join(" "));
  const [imgData, setImgData] = useState(item.imgUrl || null);
  const fileRef = useRef();
  const readFile = (file) => { const r = new FileReader(); r.onload = ev => setImgData(ev.target.result); r.readAsDataURL(file); };
  const handlePaste = (e) => { const its = e.clipboardData?.items; if (!its) return; for (let it of its) { if (it.type.startsWith("image/")) { e.preventDefault(); readFile(it.getAsFile()); return; } } };
  const allTags = [...new Set([...parseTags(caption), ...tags.split(/[\s,]+/).map(t => t.replace(/^#/, "").toLowerCase()).filter(Boolean)])];
  return (<div className="modal-bg" onClick={onClose}><div className="modal" style={{ background: T.surface, width: 400 }} onClick={e => e.stopPropagation()} onPaste={handlePaste}>
    <div className="modal-title" style={{ color: T.text }}>Edit Post</div>
    {imgData && (isUrl(imgData) || imgData.startsWith("data:")) ? (<div style={{ position: "relative", borderRadius: 10, overflow: "hidden", marginBottom: 11 }}>
      <img src={imgData} alt="" style={{ width: "100%", maxHeight: 160, objectFit: "cover", display: "block" }} />
      <button onClick={() => setImgData("")} style={{ position: "absolute", top: 6, right: 6, width: 22, height: 22, borderRadius: 99, background: "rgba(0,0,0,0.5)", border: "none", color: "white", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
    </div>) : (<div style={{ border: `1.5px dashed ${T.border}`, borderRadius: 10, padding: "12px", textAlign: "center", marginBottom: 11 }}>
      <div style={{ fontSize: 12, color: T.muted, marginBottom: 6 }}>No thumbnail</div>
      <div style={{ display: "flex", gap: 7, justifyContent: "center" }}>
        <button type="button" onClick={() => fileRef.current.click()} style={{ padding: "4px 11px", borderRadius: 7, border: `1px solid ${T.border}`, background: T.input, color: T.muted, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>Upload</button>
        <span style={{ fontSize: 11, color: T.muted, alignSelf: "center" }}>or Ctrl+V</span>
      </div>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { if (e.target.files[0]) readFile(e.target.files[0]); }} />
    </div>)}
    <textarea className="modal-input" placeholder="Caption…" value={caption} onChange={e => setCaption(e.target.value)} style={{ resize: "vertical", minHeight: 60, fontFamily: "'Nunito',sans-serif", lineHeight: 1.6, marginBottom: 7 }} />
    <input className="modal-input" placeholder="Tags: outfit aesthetic travel" value={tags} onChange={e => setTags(e.target.value)} style={{ marginBottom: allTags.length ? 7 : 11 }} />
    {allTags.length > 0 && <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12 }}>{allTags.map(t => <TagPill key={t} tag={t} small />)}</div>}
    <div className="modal-btns"><button className="btn-cancel" onClick={onClose}>Cancel</button><button className="btn-create" style={{ border: "none", cursor: "pointer" }} onClick={() => onSave(item.id, { caption, imgUrl: imgData || "", tags: allTags })}>Save</button></div>
  </div></div>);
}

function MoveModal({ itemIds, categories, currentCatId, onMove, onClose, dark }) {
  const T = dark ? DARK : LIGHT; const others = categories.filter(c => c.id !== currentCatId); const count = itemIds.length;
  return (<div className="modal-bg" onClick={onClose}><div className="modal" style={{ background: T.surface, width: 340 }} onClick={e => e.stopPropagation()}>
    <div className="modal-title" style={{ color: T.text }}>Move {count} post{count !== 1 ? "s" : ""} to…</div>
    {others.length === 0 ? (<p style={{ fontSize: 13, color: T.muted, marginBottom: 12 }}>No other boards available.</p>) : (
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>{others.map(cat => (<button key={cat.id} onClick={() => onMove(itemIds, cat.id)} style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 12px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.input, cursor: "pointer", fontFamily: "'Nunito',sans-serif", fontSize: 13.5, color: T.text, textAlign: "left" }}><BoardAvatar icon={cat.icon} color={cat.color} size={20} />{cat.name}</button>))}</div>
    )}
    <button className="btn-cancel" style={{ width: "100%", marginTop: 11 }} onClick={onClose}>Cancel</button>
  </div></div>);
}
function AddPostForm({ onAdd, dark }) {
  const T = dark ? DARK : LIGHT;
  const [link, setLink] = useState(""); const [caption, setCaption] = useState(""); const [tags, setTags] = useState(""); const [imgData, setImgData] = useState(null); const [expanded, setExpanded] = useState(false);
  const fileRef = useRef();
  const handleSubmit = (e) => { e.preventDefault(); if (!link.trim()) return; const allTags = [...new Set([...parseTags(caption), ...tags.split(/[\s,]+/).map(t => t.replace(/^#/, "").toLowerCase()).filter(Boolean)])]; onAdd({ link: link.trim(), imgUrl: imgData || "", caption: caption.trim(), tags: allTags }); setLink(""); setCaption(""); setTags(""); setImgData(null); setExpanded(false); };
  const readFile = (file) => { const r = new FileReader(); r.onload = ev => { setImgData(ev.target.result); setExpanded(true); }; r.readAsDataURL(file); };
  const handlePaste = (e) => { const its = e.clipboardData?.items; if (!its) return; for (let it of its) { if (it.type.startsWith("image/")) { e.preventDefault(); readFile(it.getAsFile()); return; } } };
  return (<form style={{ background: T.surface, borderRadius: 12, border: `1.5px solid ${T.border}`, overflow: "hidden", marginBottom: 14 }} onSubmit={handleSubmit} onPaste={handlePaste}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px" }}>
      <span style={{ fontSize: 14, flexShrink: 0, width: 15, display: "flex", alignItems: "center" }}>{isIgUrl(link) ? <IgIcon size={14} /> : "🔗"}</span>
      <input style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontFamily: "'Nunito',sans-serif", fontSize: 12.5, color: T.text }} placeholder="Paste an Instagram link…" value={link} onChange={e => { setLink(e.target.value); if (e.target.value) setExpanded(true); else setExpanded(false); }} />
      {link && <button type="button" onClick={() => setExpanded(p => !p)} style={{ padding: "3px 7px", borderRadius: 6, border: `1px solid ${T.border}`, background: T.input, color: T.muted, fontSize: 10.5, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito',sans-serif", flexShrink: 0 }}>📎{expanded ? "▲" : "▼"}</button>}
      <button type="submit" disabled={!link.trim()} style={{ padding: "6px 14px", borderRadius: 99, border: "none", background: link.trim() ? "linear-gradient(135deg,#f9c784,#f0826c)" : "#e8d8cc", color: link.trim() ? "#fff" : "#b8a898", fontFamily: "'Nunito',sans-serif", fontSize: 12, fontWeight: 700, cursor: link.trim() ? "pointer" : "not-allowed", flexShrink: 0 }}>Save</button>
    </div>
    {expanded && (<>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 12px 8px" }}>
        {imgData ? (<div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}><img src={imgData} alt="" style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 7, border: "1.5px solid #f0a878", flexShrink: 0 }} /><span style={{ fontSize: 11.5, color: "#84c9a8", fontWeight: 600 }}>✓ Ready</span><button type="button" onClick={() => setImgData(null)} style={{ marginLeft: "auto", background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: 17 }}>×</button></div>)
          : (<div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
            <input placeholder="📋  Click here then Ctrl+V" onPaste={handlePaste} style={{ flex: 1, border: `1.5px solid ${T.border}`, borderRadius: 9, padding: "6px 10px", background: T.input, fontFamily: "'Nunito',sans-serif", fontSize: 11.5, color: T.text, outline: "none" }} onFocus={e => e.target.style.borderColor = "#f0a878"} onBlur={e => e.target.style.borderColor = T.border} />
            <button type="button" onClick={() => fileRef.current.click()} style={{ padding: "5px 9px", borderRadius: 7, border: `1px solid ${T.border}`, background: T.input, color: T.muted, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito',sans-serif", flexShrink: 0 }}>Upload</button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { if (e.target.files[0]) readFile(e.target.files[0]); }} />
          </div>)}
      </div>
      <div style={{ padding: "0 12px 7px", display: "flex", gap: 6 }}>
        <span style={{ fontSize: 12, flexShrink: 0, paddingTop: 2 }}>✏️</span>
        <input style={{ flex: 1, border: `1px solid ${T.border}`, background: T.input, borderRadius: 7, padding: "5px 9px", outline: "none", fontFamily: "'Nunito',sans-serif", fontSize: 12, color: T.text }} placeholder="Caption (optional)…" value={caption} onChange={e => setCaption(e.target.value)} />
      </div>
      <div style={{ padding: "0 12px 9px", display: "flex", gap: 6 }}>
        <span style={{ fontSize: 12, flexShrink: 0, paddingTop: 2 }}>🏷️</span>
        <input style={{ flex: 1, border: `1px solid ${T.border}`, background: T.input, borderRadius: 7, padding: "5px 9px", outline: "none", fontFamily: "'Nunito',sans-serif", fontSize: 12, color: T.text }} placeholder="Tags: outfit aesthetic (or #hashtags in caption)" value={tags} onChange={e => setTags(e.target.value)} />
      </div>
    </>)}
  </form>);
}

function PostCard({ item, onDelete, onEdit, onMove, onTogglePin, selected, onSelect, bulkMode, animDelay, dark, onTagClick, onSelectBoard }) {
  const T = dark ? DARK : LIGHT;
  const pal = getPalette(item.id);
  const hasThumb = item.imgUrl && (isUrl(item.imgUrl) || item.imgUrl.startsWith("data:"));
  const isIG = isIgUrl(item.link); const isLink = isUrl(item.link);
  const igUser = isIG ? getIgUser(item.link) : null;
  const [copied, setCopied] = useState(false);
  const copyLink = () => { navigator.clipboard?.writeText(item.link).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); };
  const displayTags = item.tags || parseTags(item.caption || "");
  const cleanCaption = item.caption ? stripTags(item.caption) : item.caption;
  return (<div style={{ borderRadius: 12, overflow: "visible", position: "relative", transition: "transform 0.18s,box-shadow 0.18s", willChange: "transform", boxShadow: selected ? "0 0 0 3px #f0826c" : "0 2px 7px rgba(0,0,0,0.07)", border: `1.5px solid ${selected ? "#f0826c" : T.border}`, background: selected ? (dark ? "rgba(240,130,108,0.08)" : "rgba(240,130,108,0.05)") : (dark ? T.surface : pal.bg) }} draggable={!bulkMode} onDragStart={e => e.dataTransfer.setData("postId", item.id)} onClick={bulkMode ? (() => onSelect && onSelect(item.id)) : undefined} onMouseEnter={e => { if (!bulkMode) { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(180,80,110,0.18)"; } }} onMouseLeave={e => { if (!bulkMode) { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 7px rgba(0,0,0,0.07)"; } }}>
    {bulkMode && <div style={{ position: "absolute", bottom: 7, left: 7, width: 20, height: 20, borderRadius: "50%", background: selected ? "#f0826c" : "rgba(255,255,255,0.85)", border: `2px solid ${selected ? "#f0826c" : "#c8b8b0"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "white", zIndex: 3, pointerEvents: "none", boxShadow: "0 1px 4px rgba(0,0,0,0.12)" }}>{selected ? "✓" : ""}</div>}
    {item.pinned && <div style={{ position: "absolute", top: -5, left: bulkMode ? 30 : 9, fontSize: 12, zIndex: 2 }}>📌</div>}
    {hasThumb && (<div style={{ position: "relative", overflow: "hidden", background: "#f5ece4", maxHeight: 175, borderRadius: "10px 10px 0 0", cursor: bulkMode ? "pointer" : (isLink ? "pointer" : "default") }} onClick={e => { if (bulkMode) { e.stopPropagation(); onSelect && onSelect(item.id); return; } isLink && window.open(item.link, "_blank", "noopener"); }}>
      <img src={item.imgUrl} alt="" style={{ width: "100%", display: "block", objectFit: "cover" }} onError={e => e.target.parentElement.style.display = "none"} />
      {isLink && <div style={{ position: "absolute", top: 7, right: 7, background: "rgba(0,0,0,0.55)", borderRadius: 99, padding: "3px 8px", display: "flex", alignItems: "center", gap: 4, backdropFilter: "blur(4px)" }}>
        {isIG ? <IgIcon size={11} fill="white" /> : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>}
        <span style={{ fontSize: 9.5, color: "white", fontWeight: 700 }}>{isIG ? (igUser || "Open") : "Open"}</span>
      </div>}
    </div>)}
    <div style={{ padding: "8px 9px 7px", borderRadius: hasThumb ? "0 0 10px 10px" : "10px" }}>
      {!hasThumb && <div style={{ width: 5, height: 5, borderRadius: 99, background: pal.dot, marginBottom: 5 }} />}
      {isLink ? (<a href={bulkMode ? "#" : item.link} target={bulkMode ? "_self" : "_blank"} rel="noopener noreferrer" onClick={e => { if (bulkMode) { e.preventDefault(); onSelect && onSelect(item.id); } }} style={{ color: "#b05020", fontSize: 11, fontWeight: 600, textDecoration: "none", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {isIG && igUser ? <span style={{ display: "flex", alignItems: "center", gap: 4 }}><IgIcon size={10} fill="#c4511a" />{igUser}</span> : `🔗 ${item.link.replace("https://", "").substring(0, 32)}`}
      </a>) : (<p style={{ fontSize: 11.5, color: T.text, lineHeight: 1.55, wordBreak: "break-word" }}>{item.link}</p>)}
      {!cleanCaption && !isLink && <p style={{ fontSize: 11, color: T.muted, lineHeight: 1.5, marginTop: 3, fontStyle: "italic", opacity: 0.5 }}>Untitled post</p>}
      {cleanCaption && <p style={{ fontSize: 11, color: T.text, lineHeight: 1.5, marginTop: 3, wordBreak: "break-word" }}>{cleanCaption}</p>}
      {displayTags.length > 0 && (<div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginTop: 4 }}>{displayTags.map(t => <TagPill key={t} tag={t} onClick={onTagClick} small />)}</div>)}
      {onSelectBoard && <button onClick={e => { e.stopPropagation(); onSelectBoard(item.categoryId); }} style={{ marginTop: 5, width: "100%", fontSize: 10, fontWeight: 700, color: "#c04060", background: "rgba(192,64,96,0.07)", border: "none", borderRadius: 6, padding: "4px 0", cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>Go to board →</button>}
      <div style={{ marginTop: 7, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
        <span style={{ fontSize: 10, color: T.muted, fontWeight: 600 }}>{item.date}</span>
        <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
          {/* Pin */}
          <button onClick={() => onTogglePin(item.id)} title={item.pinned ? "Unpin" : "Pin"}
            style={{ width: 26, height: 26, borderRadius: 7, border: `1px solid ${item.pinned ? "rgba(192,64,96,0.4)" : T.border}`, background: item.pinned ? "rgba(192,64,96,0.1)" : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.14s" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill={item.pinned ? "#c04060" : "none"} stroke={item.pinned ? "#c04060" : T.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
          </button>
          {/* Copy */}
          <button onClick={copyLink} title="Copy link"
            style={{ width: 26, height: 26, borderRadius: 7, border: `1px solid ${copied ? "rgba(132,201,168,0.5)" : T.border}`, background: copied ? "rgba(132,201,168,0.12)" : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.14s" }}>
            {copied
              ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#84c9a8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" /></svg>
            }
          </button>
          {/* Edit */}
          <button onClick={() => onEdit(item)} title="Edit"
            style={{ width: 26, height: 26, borderRadius: 7, border: `1px solid ${T.border}`, background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.14s" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
          </button>
          {/* Move */}
          <button onClick={() => onMove(item)} title="Move to board"
            style={{ width: 26, height: 26, borderRadius: 7, border: `1px solid ${T.border}`, background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.14s" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5l7 7-7 7" /></svg>
          </button>
          {/* Delete */}
          <button onClick={() => onDelete(item.id)} title="Delete"
            style={{ width: 26, height: 26, borderRadius: 7, border: "1px solid rgba(230,57,70,0.25)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.14s" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#e63946" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" /></svg>
          </button>
        </div>
      </div>
    </div>
  </div>);
}

function DashboardPage({ categories, items, onSelectBoard, onNewBoard, dark, searchQuery, profile }) {
  const T = dark ? DARK : LIGHT;
  const accentColor = dark ? "#e07090" : "#c04060";
  const filteredBoards = searchQuery.trim() ? categories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())) : categories;
  const filteredPosts = searchQuery.trim() ? items.filter(i => { const q = searchQuery.toLowerCase(); return (i.caption || "").toLowerCase().includes(q) || (i.link || "").toLowerCase().includes(q) || (i.tags || []).some(t => t.includes(q)); }) : [];
  const showSearch = searchQuery.trim().length > 0;
  const lockedCatIdsDb = categories.filter(c => c.pin).map(c => c.id);
  const recentItems = items.filter(i => !lockedCatIdsDb.includes(i.categoryId)).slice().sort((a, b) => b.id.localeCompare(a.id)).slice(0, 8);
  const pinnedBoard = categories.find(c => items.some(i => i.categoryId === c.id && i.pinned));
  const totalPosts = items.length;
  const totalTags = [...new Set(items.flatMap(i => i.tags || []))].length;
  const thisWeek = items.filter(i => { try { const d = new Date(Number(i.id)); return (Date.now() - d.getTime()) < 7 * 24 * 60 * 60 * 1000; } catch { return false; } }).length;
  const hour = new Date().getHours();
  const timeGreet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const greetEmoji = profile?.avatarType === "emoji" ? profile.avatarEmoji : profile?.avatarType === "image" ? "✨" : "✨";

  // Board card accent colours cycling
  const CARD_ACCENTS = [["#f9c0c8", "#f09098"], ["#c8d8f8", "#a8b8f0"], ["#b8e8c8", "#98d8a8"], ["#f8d8a8", "#f0b880"], ["#e8c8f8", "#d0a8f0"], ["#f8c8b8", "#f0a898"]];

  const BoardCard = ({ cat, ci }) => {
    const count = items.filter(i => i.categoryId === cat.id).length;
    const recent = items.filter(i => i.categoryId === cat.id && i.imgUrl && (isUrl(i.imgUrl) || i.imgUrl.startsWith("data:"))).slice(-1)[0];
    const pinnedCount = items.filter(i => i.categoryId === cat.id && i.pinned).length;
    const topTags = [...new Set(items.filter(i => i.categoryId === cat.id).flatMap(i => i.tags || []))].slice(0, 2);
    const [c1, c2] = CARD_ACCENTS[ci % CARD_ACCENTS.length];
    return (<div style={{ borderRadius: 13, overflow: "hidden", cursor: "pointer", border: `1.5px solid ${T.border}`, background: T.surface, backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", transition: "transform 0.2s,box-shadow 0.2s", animation: "fadeUp 0.3s ease both", animationDelay: `${ci * 0.04}s`, boxShadow: `0 4px 16px rgba(200,80,100,0.07)`, position: "relative" }} onClick={() => onSelectBoard(cat)}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(200,80,100,0.13)"; }} onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(200,80,100,0.07)"; }}>
      {/* top colour stripe */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2.5, background: `linear-gradient(90deg,${c1},${c2})`, zIndex: 2 }} />
      <div style={{ height: 88, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", background: cat.coverImg ? "none" : cat.color ? `linear-gradient(135deg,${cat.color}55,${cat.color}33)` : `linear-gradient(135deg,${c1}55,${c2}33)` }}>
        {cat.coverImg ? <img src={cat.coverImg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : recent ? <img src={recent.imgUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <BoardAvatar icon={cat.icon} color={cat.color} size={32} />}
        {cat.pin && <div style={{ position: "absolute", top: 6, right: 6, fontSize: 11, background: "rgba(255,255,255,0.8)", borderRadius: 99, padding: "1px 4px" }}>🔒</div>}
        {pinnedCount > 0 && <div style={{ position: "absolute", top: 6, left: 6, fontSize: 9, background: "rgba(60,10,25,0.3)", color: "white", borderRadius: 99, padding: "1px 5px", fontWeight: 700 }}>📌{pinnedCount}</div>}
      </div>
      <div style={{ padding: "8px 10px 10px" }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 12.5, fontWeight: 600, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cat.name}</div>
        <div style={{ fontSize: 10, color: T.muted, marginTop: 1 }}>{count} post{count !== 1 ? "s" : ""}</div>

      </div>
    </div>);
  };

  return (<div>
    {!showSearch && (<>
      {/* Hero */}
      <div style={{ position: "relative", overflow: "hidden", background: T.surface, backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: `1px solid ${T.border}`, borderRadius: 16, padding: "20px 22px 18px", marginBottom: 14, boxShadow: "0 4px 20px rgba(200,80,100,0.06)" }}>
        {/* decorative orbs */}
        <div style={{ position: "absolute", right: -30, top: -30, width: 140, height: 140, borderRadius: "50%", background: "radial-gradient(circle,rgba(249,192,200,0.4),rgba(255,180,200,0.15),transparent)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: 70, bottom: -20, width: 90, height: 90, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,200,210,0.3),transparent)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", left: -20, top: "50%", width: 80, height: 80, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,210,220,0.22),transparent)", pointerEvents: "none" }} />
        {/* dot grid */}
        <div style={{ position: "absolute", right: 22, bottom: 16, display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 4, opacity: 0.15, pointerEvents: "none" }}>
          {Array(15).fill(0).map((_, i) => <div key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: accentColor }} />)}
        </div>
        <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.11em", textTransform: "uppercase", color: accentColor, marginBottom: 4, opacity: 0.85, position: "relative" }}>{timeGreet}</div>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 600, color: T.text, lineHeight: 1.2, marginBottom: 6, position: "relative" }}>
          Welcome back, <em style={{ fontStyle: "italic", color: accentColor }}>{profile?.name || "there"}</em> {greetEmoji}
        </div>
        <div style={{ width: 36, height: 2, background: `linear-gradient(90deg,${accentColor}88,transparent)`, borderRadius: 99, marginBottom: 8, position: "relative" }} />
        <div style={{ fontSize: 12.5, color: T.muted, lineHeight: 1.65, position: "relative", maxWidth: 360 }}>
          {totalPosts > 0 ? `You have ${totalPosts} saved post${totalPosts !== 1 ? "s" : ""} across ${categories.length} board${categories.length !== 1 ? "s" : ""}.` : "Start saving your first post below ✨"}
        </div>
      </div>

      {/* Stats */}
      {categories.length > 0 && (<div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {[["🗂️", categories.length, "Boards"], ["💾", totalPosts, "Posts saved"], ["🏷️", totalTags, "Tags used"], ["✨", thisWeek, "This week"]].map(([icon, n, label]) => (
          <div key={label} className="stat-card" style={{ flex: 1, background: T.surface, backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", border: `1px solid ${T.border}`, borderRadius: 11, padding: "10px 12px", textAlign: "center", boxShadow: "0 2px 10px rgba(200,80,100,0.05)" }}>
            <div style={{ fontSize: 14, marginBottom: 2 }}>{icon}</div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 19, fontWeight: 600, color: T.text }}>{n}</div>
            <div style={{ fontSize: 8.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: T.muted, marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>)}

      {/* Featured pinned board */}
      {pinnedBoard && (<div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.muted, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>📌 Pinned Board<div style={{ flex: 1, height: 1, background: T.border }} /></div>
        <div onClick={() => onSelectBoard(pinnedBoard)} style={{ background: T.surface, backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", border: `1.5px solid ${T.border}`, borderRadius: 13, overflow: "hidden", display: "flex", height: 88, cursor: "pointer", boxShadow: "0 4px 16px rgba(200,80,100,0.07)", position: "relative", transition: "transform 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: "linear-gradient(180deg,#f9c0c8,#f09098)" }} />
          <div style={{ width: 110, flexShrink: 0, background: "linear-gradient(135deg,rgba(255,195,210,0.55),rgba(255,175,200,0.4))", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            {pinnedBoard.coverImg ? <img src={pinnedBoard.coverImg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <BoardAvatar icon={pinnedBoard.icon} color={pinnedBoard.color} size={36} />}
          </div>
          <div style={{ padding: "13px 15px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: accentColor, marginBottom: 3, opacity: 0.8 }}>Featured · {items.filter(i => i.categoryId === pinnedBoard.id).length} posts</div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 600, color: T.text, marginBottom: 3 }}>{pinnedBoard.name}</div>
            <div style={{ fontSize: 10.5, color: T.muted }}>{items.filter(i => i.categoryId === pinnedBoard.id && i.pinned).length} pinned{items.filter(i => i.categoryId === pinnedBoard.id).flatMap(i => i.tags || []).slice(0, 3).map(t => ` #${t}`).join("")}</div>
          </div>
        </div>
      </div>)}

      {/* Boards grid */}
      <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.muted, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>My Boards<div style={{ flex: 1, height: 1, background: T.border }} /></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 11, marginBottom: recentItems.length > 0 ? 18 : 0 }}>
        {categories.filter(c => !c.pin).map((cat, ci) => <BoardCard key={cat.id} cat={cat} ci={ci} />)}
        <div style={{ borderRadius: 13, overflow: "hidden", cursor: "pointer", border: `1.5px dashed ${T.border}`, background: "transparent", transition: "all 0.2s", boxShadow: "none" }} onClick={onNewBoard}
          onMouseEnter={e => { e.currentTarget.style.background = T.navHover; e.currentTarget.style.transform = "translateY(-3px)"; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.transform = "translateY(0)"; }}>
          <div style={{ height: 88, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 26, color: accentColor, opacity: 0.6 }}>＋</span></div>
          <div style={{ padding: "8px 10px 10px" }}><div style={{ fontSize: 12.5, fontWeight: 700, color: accentColor }}>New Board</div></div>
        </div>
      </div>

      {/* Recently saved feed */}
      {recentItems.length > 0 && (<div>
        <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.muted, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>Recently Saved<div style={{ flex: 1, height: 1, background: T.border }} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(90px,1fr))", gap: 7 }}>
          {recentItems.map((item, idx) => {
            const hasThumb = item.imgUrl && (isUrl(item.imgUrl) || item.imgUrl.startsWith("data:"));
            const board = categories.find(c => c.id === item.categoryId);
            const isIG = isIgUrl(item.link); const igUser = isIG ? getIgUser(item.link) : null;
            const [c1, c2] = CARD_ACCENTS[idx % CARD_ACCENTS.length];
            return (<div key={item.id} style={{ borderRadius: 9, overflow: "hidden", border: `1px solid ${T.border}`, background: T.surface, backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", animation: "fadeUp 0.3s ease both", animationDelay: `${idx * 0.03}s`, boxShadow: "0 2px 8px rgba(200,80,100,0.05)", position: "relative" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${c1},${c2})`, zIndex: 2 }} />
              <div style={{ height: 56, background: `linear-gradient(135deg,${c1}55,${c2}33)`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                {hasThumb ? <img src={item.imgUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 18 }}>{board?.icon || "🌸"}</span>}
              </div>
              <div style={{ padding: "5px 7px 6px" }}>
                <div style={{ fontSize: 8.5, color: T.text, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.caption || (isIG && igUser ? igUser : item.link.replace("https://", "").substring(0, 16))}</div>
                {board && <div style={{ fontSize: 7.5, color: accentColor, fontWeight: 700, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", opacity: 0.8 }}>{board.name}</div>}
              </div>
            </div>);
          })}
        </div>
      </div>)}
    </>)}

    {/* Search results */}
    {showSearch && (<>
      {filteredBoards.length > 0 && (<><div style={{ fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 9 }}>Boards ({filteredBoards.length})</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 11, marginBottom: 22 }}>{filteredBoards.map((cat, ci) => <BoardCard key={cat.id} cat={cat} ci={ci} />)}</div></>)}
      {filteredPosts.length > 0 && (<><div style={{ fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 9 }}>Posts ({filteredPosts.length})</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 22 }}>
          {[filteredPosts.filter((_, i) => i % 2 === 0), filteredPosts.filter((_, i) => i % 2 !== 0)].map((col, ci) => (<div key={ci} style={{ display: "flex", flexDirection: "column", gap: 8 }}>{col.map((item, idx) => <PostCard key={item.id} item={item} onDelete={() => { }} onEdit={() => { }} onMove={() => { }} onTogglePin={() => { }} animDelay={idx * 0.03} dark={dark} />)}</div>))}
        </div></>)}
      {filteredBoards.length === 0 && filteredPosts.length === 0 && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 20px", gap: 12, textAlign: "center" }}>
          <div style={{ fontSize: 38, opacity: 0.3 }}>🔍</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, color: T.text }}>No results for "{searchQuery}"</div>
          <div style={{ fontSize: 13, color: T.muted }}>Try searching for a board name, caption, or tag.</div>
        </div>
      )}
      {filteredBoards.length === 0 && filteredPosts.length === 0 && (<div style={{ textAlign: "center", padding: "50px 20px" }}><div style={{ fontSize: 34, marginBottom: 9 }}>🔍</div><div style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, color: T.text, marginBottom: 5 }}>No results for "{searchQuery}"</div><div style={{ fontSize: 12.5, color: T.muted }}>Try a different search term.</div></div>)}
    </>)}
  </div>);
}

function Homepage({ categories, items, onSelectBoard, onNewBoard, dark, searchQuery, profile, onClearSearch, onDeleteItem, onEditItem, onMoveItem, onTogglePinItem, onTagClick, vaultSort, onVaultSort, bulkMode, onBulkMode, selectedPosts, onSelectPost, onBulkDelete, onBulkMove }) {
  const T = dark ? DARK : LIGHT;
  const accentColor = dark ? "#e07090" : "#c04060";
  const lockedCatIds = categories.filter(c => c.pin).map(c => c.id);
  const publicItems = items.filter(i => !lockedCatIds.includes(i.categoryId));
  const allPosts = searchQuery.trim()
    ? publicItems.filter(i => { const q = searchQuery.toLowerCase().replace(/^#/, ""); return (i.caption || "").toLowerCase().includes(q) || (i.link || "").toLowerCase().includes(q) || (i.tags || []).some(t => t.toLowerCase().includes(q)); })
    : vaultSort === "shuffle" ? [...publicItems].sort(() => Math.random() - 0.5)
      : vaultSort === "newest" ? [...publicItems].sort((a, b) => b.id.localeCompare(a.id))
        : vaultSort === "oldest" ? [...publicItems].sort((a, b) => a.id.localeCompare(b.id))
          : vaultSort === "boards" ? [...publicItems].sort((a, b) => { const ca = categories.find(c => c.id === a.categoryId)?.name || ""; const cb = categories.find(c => c.id === b.categoryId)?.name || ""; return ca.localeCompare(cb); })
            : vaultSort === "tags" ? [...publicItems].sort((a, b) => { const ta = (a.tags || [])[0] || ""; const tb = (b.tags || [])[0] || ""; return ta.localeCompare(tb); })
              : [...publicItems].sort(() => Math.random() - 0.5);
  const totalBoards = categories.filter(c => !c.pin).length;
  const totalPosts = publicItems.length;
  const cols = Array.from({ length: 4 }, () => []);
  allPosts.forEach((p, i) => cols[i % 4].push(p));
  const colStyle = { flex: 1, display: "flex", flexDirection: "column", gap: 13, overflow: "visible" };
  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "26px 28px 16px" }}>
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 27, fontWeight: 600, color: T.text, marginBottom: 4 }}>
          Your Vault
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13.5, fontWeight: 500, color: T.muted }}>{totalPosts} saved post{totalPosts !== 1 ? "s" : ""} · {totalBoards} board{totalBoards !== 1 ? "s" : ""}</span>
          <button onClick={() => { if (bulkMode) { onBulkMode(false); } else { onBulkMode(true); } }} style={{ padding: "4px 12px", borderRadius: 8, border: `1.5px solid ${bulkMode ? "#c04060" : T.border}`, background: bulkMode ? "rgba(192,64,96,0.08)" : "transparent", color: bulkMode ? "#c04060" : T.muted, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>{bulkMode ? "✓ Selecting" : "Select"}</button>
          {!searchQuery.trim() && <select value={vaultSort} onChange={e => onVaultSort(e.target.value)} style={{ marginLeft: "auto", padding: "4px 10px", borderRadius: 8, border: `1.5px solid ${T.border}`, background: T.surface, color: T.text, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Nunito',sans-serif", outline: "none" }}>
            <option value="shuffle">Default</option>
            <option value="newest">Latest first</option>
            <option value="oldest">Oldest first</option>
            <option value="boards">By board</option>
            <option value="tags">By tags</option>
          </select>}
        </div>
        {bulkMode && selectedPosts.length > 0 && (
          <div style={{ display: "flex", gap: 7, alignItems: "center", background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 9, padding: "7px 12px", marginTop: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{selectedPosts.length} selected</span>
            <button onClick={onBulkMove} style={{ padding: "4px 10px", borderRadius: 7, border: `1px solid ${T.border}`, background: T.input, color: T.muted, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>Move</button>
            <button onClick={onBulkDelete} style={{ padding: "4px 10px", borderRadius: 7, border: "1px solid #f5c5d8", background: "#fff0f5", color: "#e63946", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>Delete</button>
            <button onClick={() => onBulkMode(false)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: T.muted, padding: 0 }}>Cancel</button>
          </div>
        )}
      </div>
      {allPosts.length === 0 && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 20px", gap: 14, textAlign: "center" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#fde4ea,#f8b0c4)", display: "flex", alignItems: "center", justifyContent: "center", animation: "float 3s ease-in-out infinite", boxShadow: "0 8px 22px rgba(192,64,96,0.18)" }}><LogoMark size={32} /></div>
          {searchQuery.trim() ? (
            <>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, color: T.text }}>No results for "{searchQuery}"</div>
              <div style={{ fontSize: 13, color: T.muted, maxWidth: 220, lineHeight: 1.65 }}>Try a different search term.</div>
              <button onClick={() => onClearSearch()} style={{ padding: "7px 18px", borderRadius: 99, background: "rgba(192,64,96,0.1)", color: accentColor, border: "none", fontFamily: "'Nunito',sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Clear search</button>
            </>
          ) : (
            <>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, color: T.text }}>Your vault is empty</div>
              <div style={{ fontSize: 13, color: T.muted, maxWidth: 220, lineHeight: 1.65 }}>Open a board and paste an Instagram link to save your first post.</div>
              {categories.length === 0 && <button onClick={onNewBoard} style={{ padding: "8px 20px", borderRadius: 99, background: "linear-gradient(135deg,#fde4ea,#f8b0c4)", color: "#fff", border: "none", fontFamily: "'Nunito',sans-serif", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 3px 12px rgba(192,64,96,0.25)" }}>Create a board</button>}
            </>
          )}
        </div>
      )}
      {allPosts.length > 0 && (
        <div style={{ display: "flex", gap: 13, alignItems: "flex-start", overflow: "visible", padding: "4px" }}>
          {cols.map((col, ci) => (
            <div key={ci} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 13, overflow: "visible" }}>
              {col.map((item, ii) => {
                const goToBoard = (catId) => { const c = categories.find(x => x.id === catId); if (c) onSelectBoard(c); };
                return (<PostCard key={item.id} item={item} onDelete={onDeleteItem} onEdit={onEditItem} onMove={onMoveItem} onTogglePin={onTogglePinItem} animDelay={ii * 0.04} dark={dark} onTagClick={onTagClick} onSelectBoard={goToBoard} bulkMode={bulkMode} selected={selectedPosts.includes(item.id)} onSelect={onSelectPost} />);
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


function TrashView({ deletedItems, deletedBoards, onRestoreItem, onRestoreBoard, onPermDeleteItem, onPermDeleteBoard, onEmpty, dark }) {
  const T = dark ? DARK : LIGHT;
  return (<div>
    <div style={{ marginBottom: 18, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
      <div><div style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 600, color: T.text }}>🗑️ Recently Deleted</div><div style={{ fontSize: 11.5, color: T.muted, marginTop: 3 }}>Items permanently deleted after {TRASH_DAYS} days</div></div>
      {(deletedBoards.length + deletedItems.length) > 0 && <button onClick={onEmpty} style={{ padding: "5px 12px", borderRadius: 8, border: "1px solid #f5c5d8", background: "#fff0f5", color: "#e63946", fontSize: 11.5, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>Empty Trash</button>}
    </div>
    {(deletedBoards.length + deletedItems.length) === 0 ? (<div style={{ textAlign: "center", padding: "55px 20px" }}><div style={{ fontSize: 34, marginBottom: 9 }}>✨</div><div style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, color: T.text, marginBottom: 4 }}>Trash is empty</div></div>) : (
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {deletedBoards.map(cat => {
          const boardItems = deletedItems.filter(i => i.categoryId === cat.id); return (<div key={cat.id} style={{ background: T.surface, borderRadius: 12, border: `1.5px solid ${T.border}`, overflow: "hidden" }}>
            <div style={{ padding: "11px 14px", display: "flex", alignItems: "center", gap: 10 }}>
              <BoardAvatar icon={cat.icon} color={cat.color} size={26} />
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 700, fontSize: 12.5, color: T.text }}>{cat.name} <span style={{ fontSize: 10.5, color: T.muted, fontWeight: 400 }}>Board · {boardItems.length} post{boardItems.length !== 1 ? "s" : ""}</span></div><div style={{ fontSize: 10.5, color: T.muted, marginTop: 1 }}>{daysAgo(cat.deletedAt) === 0 ? "Today" : `${daysAgo(cat.deletedAt)}d ago`} · {TRASH_DAYS - daysAgo(cat.deletedAt)}d left</div></div>
              <button onClick={() => onRestoreBoard(cat.id)} style={{ padding: "4px 9px", borderRadius: 7, border: "1px solid #84c9a8", background: "#f0f8f5", color: "#2a9d8f", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>Restore all</button>
              <button onClick={() => onPermDeleteBoard(cat.id)} style={{ padding: "4px 9px", borderRadius: 7, border: "1px solid #f5c5d8", background: "#fff0f5", color: "#e63946", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>Delete</button>
            </div>
            {boardItems.length > 0 && (<div style={{ borderTop: `1px solid ${T.border}`, padding: "7px 14px", display: "flex", gap: 6, overflowX: "auto" }}>{boardItems.map(it => (<div key={it.id} style={{ flexShrink: 0, width: 44, height: 44, borderRadius: 6, overflow: "hidden", background: T.input, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {it.imgUrl && (isUrl(it.imgUrl) || it.imgUrl.startsWith("data:")) ? <img src={it.imgUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 8.5, color: T.muted, textAlign: "center", padding: 2, lineHeight: 1.2 }}>{(it.caption || it.link || "").substring(0, 16)}</span>}
            </div>))}</div>)}
          </div>);
        })}
        {deletedItems.filter(i => !deletedBoards.find(b => b.id === i.categoryId)).map(item => (<div key={item.id} style={{ background: T.surface, borderRadius: 12, border: `1.5px solid ${T.border}`, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          {item.imgUrl && (isUrl(item.imgUrl) || item.imgUrl.startsWith("data:")) && <img src={item.imgUrl} alt="" style={{ width: 38, height: 38, objectFit: "cover", borderRadius: 6, flexShrink: 0 }} />}
          <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 12, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.caption || item.link}</div><div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>{daysAgo(item.deletedAt) === 0 ? "Today" : `${daysAgo(item.deletedAt)}d ago`} · {TRASH_DAYS - daysAgo(item.deletedAt)}d left</div></div>
          <button onClick={() => onRestoreItem(item.id)} style={{ padding: "4px 9px", borderRadius: 7, border: "1px solid #84c9a8", background: "#f0f8f5", color: "#2a9d8f", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>Restore</button>
          <button onClick={() => onPermDeleteItem(item.id)} style={{ padding: "4px 9px", borderRadius: 7, border: "1px solid #f5c5d8", background: "#fff0f5", color: "#e63946", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>Delete</button>
        </div>))}
      </div>
    )}
  </div>);
}
export default function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const [splashDone, setSplashDone] = useState(false);
  const [appVisible, setAppVisible] = useState(false);
  const [categories, setCategories] = useLocalStorage("iv_cats", []);
  const [items, setItems] = useLocalStorage("iv_items", []);
  const [deletedItems, setDeletedItems] = useLocalStorage("iv_trash_items", []);
  const [deletedBoards, setDeletedBoards] = useLocalStorage("iv_trash_boards", []);
  const [dark, setDark] = useLocalStorage("iv_dark", false);
  const [profile, setProfile] = useLocalStorage("iv_profile", { name: "", email: "", avatarType: "letter" });
  const [journal, setJournal] = useLocalStorage("iv_journal", {});
  const [showOnboarding, setShowOnboarding] = useLocalStorage("iv_onboarded", true);
  const [view, setView] = useState("dashboard");
  const [unlockedIds, setUnlockedIds] = useState([]);
  const [vaultUnlocked, setVaultUnlocked] = useState(false);
  const [activeTagView, setActiveTagView] = useState(null);
  const [prevView, setPrevView] = useState(null);
  const [journalSort, setJournalSort] = useState("recent");
  const [vaultSort, setVaultSort] = useState("shuffle");
  const [journalPreview, setJournalPreview] = useState(null);
  const [showAddCat, setShowAddCat] = useState(false);
  const [editBoardData, setEditBoardData] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sbExpanded, setSbExpanded] = useState(false);
  const [sortBy, setSortBy] = useState("manual");
  const [postSort, setPostSort] = useState("manual");
  const [pinModal, setPinModal] = useState(null);
  const [pinError, setPinError] = useState("");
  const [confirmModal, setConfirmModal] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editPost, setEditPost] = useState(null);
  const [movePost, setMovePost] = useState(null);
  const [bulkMode, setBulkMode] = useState(false);
  const [boardSelectMode, setBoardSelectMode] = useState(false);
  const [tagSelectMode, setTagSelectMode] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [changePinModal, setChangePinModal] = useState(null); // {mode:'change'|'remove', boards:[...]}
  const [changePinStep, setChangePinStep] = useState('current'); // 'current'|'new'|'confirm'
  const [changePinCurrent, setChangePinCurrent] = useState('');
  const [changePinNew, setChangePinNew] = useState('');
  const [changePinError, setChangePinError] = useState('');
  const [selectedBoards, setSelectedBoards] = useState([]);
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [activeTag, setActiveTag] = useState(null);
  const [storageWarned, setStorageWarned] = useState(false);
  const searchRef = useRef();
  const dragCat = useRef(null); const dragCatOver = useRef(null);
  const T = dark ? DARK : LIGHT;

  useEffect(() => { setDeletedItems(p => p.filter(i => daysAgo(i.deletedAt) < TRASH_DAYS)); setDeletedBoards(p => p.filter(i => daysAgo(i.deletedAt) < TRASH_DAYS)); }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const h = (e) => {
      if (e.key === "/" && e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key === "Escape") { setSearchQuery(""); setActiveTag(null); setActiveTagView(null); setBulkMode(false); setSelectedPosts([]); setView("dashboard"); }
    };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, []);

  // Storage warning
  useEffect(() => { if (items.length >= STORAGE_WARN && !storageWarned) setStorageWarned(true); }, [items.length]);

  const handleSplashDone = () => { setSplashDone(true); setTimeout(() => setAppVisible(true), 60); };

  const sortedCats = [...categories].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "date_new") return b.createdAt - a.createdAt;
    if (sortBy === "date_old") return a.createdAt - b.createdAt;
    return (a.order ?? 999) - (b.order ?? 999);
  });

  const getCatDrag = (cat) => ({
    onDragStart: () => { dragCat.current = cat.id; },
    onDragOver: (e) => { e.preventDefault(); dragCatOver.current = cat.id; },
    onDrop: () => {
      if (!dragCat.current || dragCat.current === dragCatOver.current) return;
      const upd = [...categories]; const fi = upd.findIndex(c => c.id === dragCat.current); const ti = upd.findIndex(c => c.id === dragCatOver.current);
      const tmp = upd[fi].order ?? fi; upd[fi] = { ...upd[fi], order: upd[ti].order ?? ti }; upd[ti] = { ...upd[ti], order: tmp };
      setCategories(upd); dragCat.current = null; dragCatOver.current = null;
    },
    onDragEnd: () => { dragCat.current = null; dragCatOver.current = null; },
  });

  const addCategory = (data) => { const cat = { id: Date.now().toString(), ...data, icon: data.color ? "" : data.icon || "🌸", createdAt: Date.now(), order: categories.length }; setCategories(p => [...p, cat]); setView(cat.id); if (data.pin) setUnlockedIds(p => [...p, cat.id]); setShowAddCat(false); };
  const saveEditBoard = (data) => { setCategories(p => p.map(c => c.id === editBoardData.id ? { ...c, ...data, icon: data.color ? "" : data.icon || c.icon } : c)); if (data.pin) setUnlockedIds(p => p.includes(editBoardData.id) ? p : [...p, editBoardData.id]); if (!data.pin) setUnlockedIds(p => p.filter(id => id !== editBoardData.id)); setEditBoardData(null); };

  const requestDeleteCat = (cat) => setConfirmModal({
    title: `Delete "${cat.name}"?`, subtitle: "Board and all posts move to Recently Deleted for 30 days.", onConfirm: () => {
      setDeletedBoards(p => [...p, { ...cat, deletedAt: Date.now() }]);
      setDeletedItems(p => [...p, ...items.filter(i => i.categoryId === cat.id).map(i => ({ ...i, deletedAt: Date.now() }))]);
      setCategories(p => p.filter(c => c.id !== cat.id)); setItems(p => p.filter(i => i.categoryId !== cat.id));
      if (view === cat.id) setView("home"); setConfirmModal(null);
    }
  });

  const requestDeleteItem = (itemId) => setConfirmModal({
    title: "Delete this post?", subtitle: "Moves to Recently Deleted for 30 days.", onConfirm: () => {
      const item = items.find(i => i.id === itemId); setDeletedItems(p => [...p, { ...item, deletedAt: Date.now() }]); setItems(p => p.filter(i => i.id !== itemId)); setConfirmModal(null);
    }
  });

  const requestBulkDelete = () => setConfirmModal({
    title: `Delete ${selectedPosts.length} posts?`, subtitle: "They move to Recently Deleted for 30 days.", onConfirm: () => {
      const toDelete = items.filter(i => selectedPosts.includes(i.id)).map(i => ({ ...i, deletedAt: Date.now() }));
      setDeletedItems(p => [...p, ...toDelete]); setItems(p => p.filter(i => !selectedPosts.includes(i.id))); setSelectedPosts([]); setBulkMode(false); setConfirmModal(null);
    }
  });

  const handleSelectBoard = (cat, from) => { if (cat.pin && !unlockedIds.includes(cat.id)) { setPinModal({ boardId: cat.id }); setPinError(""); return; } setActiveTag(null); setActiveTagView(null); setPrevView(from || view); setView(cat.id); };
  const handlePinSubmit = (entered) => {
    const cat = categories.find(c => c.id === pinModal.boardId);
    if (!cat) { setPinError("Board not found."); return; }
    if (entered === cat.pin) {
      if (pinModal.vaultMode) {
        setVaultUnlocked(true);
        setUnlockedIds(p => [...new Set([...p, ...lockedBoards.map(c => c.id)])]);
        setView("locked");
      } else {
        setUnlockedIds(p => [...p, cat.id]);
        setView(cat.id);
      }
      setPinModal(null); setPinError("");
    } else setPinError("Wrong PIN. Try again.");
  };

  const addItem = ({ link, imgUrl, caption, tags }) => { const allTags = [...new Set([...(tags || []), ...parseTags(caption || "")])]; setItems(p => [...p, { id: Date.now().toString(), link, imgUrl, caption: caption || "", tags: allTags, categoryId: view, date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }), pinned: false, order: p.filter(i => i.categoryId === view).length }]); };
  const saveEditPost = (id, changes) => { const allTags = [...new Set([...(changes.tags || []), ...parseTags(changes.caption || "")])]; setItems(p => p.map(i => i.id === id ? { ...i, ...changes, tags: allTags } : i)); setEditPost(null); };
  const movePostsToBoard = (ids, catId) => { setItems(p => p.map(i => ids.includes(i.id) ? { ...i, categoryId: catId } : i)); setMovePost(null); setSelectedPosts([]); setBulkMode(false); };
  const togglePin = (id) => setItems(p => p.map(i => i.id === id ? { ...i, pinned: !i.pinned } : i));
  const saveJournal = (boardId, entries) => setJournal(p => ({ ...p, [boardId]: entries }));

  const selected = categories.find(c => c.id === view);
  const isLocked = selected?.pin && !unlockedIds.includes(view);

  let visibleItems = items.filter(i => i.categoryId === view);
  if (activeTag) visibleItems = visibleItems.filter(i => (i.tags || parseTags(i.caption || "")).includes(activeTag));
  if (searchQuery.trim() && view !== "home") { const q = searchQuery.toLowerCase(); visibleItems = visibleItems.filter(i => (i.caption || "").toLowerCase().includes(q) || (i.link || "").toLowerCase().includes(q) || (i.tags || []).some(t => t.includes(q))); }
  if (postSort === "pinned") visibleItems = [...visibleItems].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  else if (postSort === "date_new") visibleItems = [...visibleItems].sort((a, b) => b.id.localeCompare(a.id));
  else if (postSort === "date_old") visibleItems = [...visibleItems].sort((a, b) => a.id.localeCompare(b.id));
  else visibleItems = [...visibleItems.filter(i => i.pinned), ...visibleItems.filter(i => !i.pinned)];

  const col1 = visibleItems.filter((_, i) => i % 2 === 0); const col2 = visibleItems.filter((_, i) => i % 2 !== 0);

  const handlePostDrop = (e, targetId) => { const srcId = e.dataTransfer.getData("postId"); if (!srcId || srcId === targetId) return; const catItems = items.filter(i => i.categoryId === view); const others = items.filter(i => i.categoryId !== view); const si = catItems.findIndex(i => i.id === srcId); const ti = catItems.findIndex(i => i.id === targetId); if (si < 0 || ti < 0) return; const reordered = [...catItems]; const [moved] = reordered.splice(si, 1); reordered.splice(ti, 0, moved); setItems([...others, ...reordered.map((it, idx) => ({ ...it, order: idx }))]); };

  const ProfileAvatar = ({ size = 28 }) => {
    if (profile.avatarType === "image" && profile.avatarImg) return <img src={profile.avatarImg} alt="" style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0, cursor: "pointer" }} />;
    if (profile.avatarType === "emoji") return <div style={{ width: size, height: size, borderRadius: "50%", background: "linear-gradient(135deg,#fef2f5,#fde4ea)", border: "1.5px solid rgba(220,140,160,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.44, flexShrink: 0, cursor: "pointer" }}>{profile.avatarEmoji || "🌸"}</div>;
    return <div style={{ width: size, height: size, borderRadius: "50%", background: "linear-gradient(135deg,#f9c784,#f0826c)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.38, fontWeight: 700, color: "white", flexShrink: 0, cursor: "pointer", boxShadow: "0 2px 7px rgba(240,130,108,0.25)" }}>{(profile.name || "?").charAt(0).toUpperCase()}</div>;
  };

  const SidebarRow = ({ cat, locked }) => {
    const isUnlocked = unlockedIds.includes(cat.id); const count = items.filter(i => i.categoryId === cat.id).length; const d = getCatDrag(cat);
    return (<div className={`cat-item${view === cat.id ? " cat-active" : ""}${locked && !isUnlocked ? " cat-locked" : ""}`}
      draggable onDragStart={d.onDragStart} onDragOver={d.onDragOver} onDrop={d.onDrop} onDragEnd={d.onDragEnd}
      onClick={() => handleSelectBoard(cat)}>
      <span style={{ fontSize: 10, color: dark ? "#5a4a38" : "#d4c4b0", cursor: "grab", flexShrink: 0 }}>⠿</span>
      <BoardAvatar icon={cat.icon} color={cat.color} size={16} />
      <span className="cat-name">{cat.name}</span>
      {locked && !isUnlocked && <span style={{ fontSize: 10 }}>🔒</span>}
      {locked && isUnlocked && <span style={{ fontSize: 10, color: "#84c9a8" }}>🔓</span>}
      {!locked && count > 0 && <span className="cat-count">{count}</span>}
      <button className="cat-edit" onClick={e => { e.stopPropagation(); setEditBoardData(cat); }}>✏️</button>
      <button className="cat-del" onClick={e => { e.stopPropagation(); requestDeleteCat(cat); }}>×</button>
    </div>);
  };

  const unlockedBoards = sortedCats.filter(c => !c.pin);
  const lockedBoards = sortedCats.filter(c => c.pin);

  return (<>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Nunito:wght@300;400;500;600;700&display=swap');
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
      body{font-family:'Nunito',sans-serif;background:${T.bg};color:${T.text};overflow:hidden;transition:background 0.3s,color 0.3s;min-height:100vh;}
      @keyframes splashPop{from{opacity:0;transform:scale(0.72);}to{opacity:1;transform:scale(1);}}
      @keyframes pulseRing{0%,100%{transform:scale(1);opacity:0.5;}50%{transform:scale(1.07);opacity:0.2;}}
      @keyframes appReveal{from{opacity:0;transform:scale(0.98);}to{opacity:1;transform:scale(1);}}
      @keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
      @keyframes splashRingIn{from{opacity:0;transform:scale(0.3);}to{opacity:1;transform:scale(1);}}
      @keyframes splashRingPulse{0%,100%{opacity:0.5;transform:scale(1);}50%{opacity:0.9;transform:scale(1.03);}}
      @keyframes splashBoxPop{0%{opacity:0;transform:scale(0.6);}70%{transform:scale(1.08);}100%{opacity:1;transform:scale(1);}}
      @keyframes splashFloat{0%,100%{transform:translateY(0);}50%{transform:translateY(-6px);}}
      @keyframes splashPinDrop{0%{opacity:0;transform:translateY(-16px) scale(0.8);}60%{transform:translateY(3px) scale(1.05);}80%{transform:translateY(-1px) scale(0.98);}100%{opacity:1;transform:translateY(0) scale(1);}}
      @keyframes splashHeartPulse{0%{transform:scale(1);}40%{transform:scale(1.3);}70%{transform:scale(0.9);}100%{transform:scale(1);}}
      @keyframes splashTitleUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
      @keyframes splashTagFade{from{opacity:0;}to{opacity:1;}}
      @keyframes splashSp1{0%{opacity:0;transform:translate(0,0) scale(0);}30%{opacity:1;transform:translate(22px,-18px) scale(1);}100%{opacity:0;transform:translate(32px,-32px) scale(0.3);}}
      @keyframes splashSp2{0%{opacity:0;transform:translate(0,0) scale(0);}30%{opacity:1;transform:translate(-18px,-20px) scale(1);}100%{opacity:0;transform:translate(-28px,-36px) scale(0.3);}}
      @keyframes splashSp3{0%{opacity:0;transform:translate(0,0) scale(0);}30%{opacity:1;transform:translate(24px,10px) scale(1);}100%{opacity:0;transform:translate(38px,16px) scale(0.3);}}
      @keyframes splashSp4{0%{opacity:0;transform:translate(0,0) scale(0);}30%{opacity:1;transform:translate(-22px,8px) scale(1);}100%{opacity:0;transform:translate(-36px,14px) scale(0.3);}}
      @keyframes petalBloom{0%,100%{opacity:.2;transform:translateX(-50%) rotate(var(--r)) scale(.75);}50%{opacity:1;transform:translateX(-50%) rotate(var(--r)) scale(1);}}
      .petal-spinner{position:relative;width:44px;height:44px;}
      .petal-spinner .sp{position:absolute;width:8px;height:17px;border-radius:4px;background:linear-gradient(180deg,#f9c0c8,#c04060);top:0;left:50%;transform-origin:50% 22px;animation:petalBloom 1.3s ease-in-out infinite;}
      .petal-spinner .sp:nth-child(1){--r:0deg;animation-delay:0s;}
      .petal-spinner .sp:nth-child(2){--r:60deg;animation-delay:.21s;}
      .petal-spinner .sp:nth-child(3){--r:120deg;animation-delay:.43s;}
      .petal-spinner .sp:nth-child(4){--r:180deg;animation-delay:.65s;}
      .petal-spinner .sp:nth-child(5){--r:240deg;animation-delay:.87s;}
      .petal-spinner .sp:nth-child(6){--r:300deg;animation-delay:1.09s;}
      @keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-8px);}}
      @keyframes popIn{from{opacity:0;transform:scale(0.93) translateY(8px);}to{opacity:1;transform:scale(1) translateY(0);}}
      @keyframes slideIn{from{opacity:0;transform:translateX(-100%);}to{opacity:1;transform:translateX(0);}}
      .app{display:flex;height:100vh;width:100vw;overflow:hidden;opacity:0;}
      .app.visible{opacity:1;animation:appReveal 0.45s ease both;}
      .sidebar{width:62px;flex-shrink:0;background:${T.sidebar};backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-right:1px solid ${T.border};display:flex;flex-direction:column;height:100vh;overflow:hidden;z-index:50;transition:width 0.22s cubic-bezier(0.4,0,0.2,1),background 0.3s;box-shadow:2px 0 18px rgba(180,80,110,0.05);}
      .sidebar.sb-expanded{width:220px;}
      .sidebar-logo-row{height:58px;display:flex;align-items:center;gap:11px;padding:0 13px;flex-shrink:0;border-bottom:1px solid ${T.border};}
      .sidebar-logo-btn{width:34px;height:34px;border-radius:10px;background:linear-gradient(135deg,#fde4ea,#f8b0c4);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;box-shadow:0 3px 10px rgba(192,64,96,0.25);}
      .sidebar-brand-name{font-family:'Playfair Display',serif;font-size:15px;font-weight:600;color:${T.text};white-space:nowrap;opacity:0;transition:opacity 0.14s;pointer-events:none;flex-shrink:0;}
      .sidebar.sb-expanded .sidebar-brand-name{opacity:1;}
      .sidebar-brand-name em{font-style:italic;color:#c04060;}
      .sb-nav{flex:1;display:flex;flex-direction:column;gap:2px;padding:12px 9px;overflow-y:auto;overflow-x:hidden;}
      .sb-nav::-webkit-scrollbar{width:2px;}
      .sb-nav-item{display:flex;align-items:center;gap:12px;padding:10px 9px;border-radius:10px;cursor:pointer;border:1px solid transparent;transition:background 0.14s;white-space:nowrap;overflow:hidden;flex-shrink:0;}
      button{cursor:pointer;}
      a{cursor:pointer;}
      [role="button"]{cursor:pointer;}
      select{cursor:pointer;}
      .cat-item{cursor:pointer;}
      .tag-pill-btn{cursor:pointer;}
      .sb-nav-item:hover{background:rgba(192,64,96,0.07);}
      .sb-nav-active{background:rgba(192,64,96,0.1) !important;border-color:rgba(192,64,96,0.25) !important;}
      .sb-nav-icon{flex-shrink:0;width:20px;display:flex;align-items:center;justify-content:center;}
      .sb-nav-label{font-size:13.5px;font-weight:600;color:${T.text};opacity:0;transition:opacity 0.12s;flex-shrink:0;}
      .sidebar.sb-expanded .sb-nav-label{opacity:1;}
      .sb-nav-active .sb-nav-label{color:#c04060 !important;}
      .sb-boards-label{font-size:9px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${T.muted};padding:8px 9px 3px;white-space:nowrap;opacity:0;transition:opacity 0.12s;}
      .sidebar.sb-expanded .sb-boards-label{opacity:1;}
      .cat-item{display:flex;align-items:center;gap:6px;padding:5px 9px;border-radius:9px;cursor:pointer;border:1px solid transparent;transition:all 0.15s;margin-bottom:1px;user-select:none;white-space:nowrap;overflow:hidden;}
      .cat-item:hover{background:${T.navHover};}
      .cat-active{background:${T.navActive} !important;border-color:${T.navActiveBorder} !important;}
      .cat-locked{opacity:0.72;}
      .cat-name{font-size:12px;font-weight:600;color:${T.text};flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;opacity:0;transition:opacity 0.12s;}
      .sidebar.sb-expanded .cat-name{opacity:1;}
      .cat-active .cat-name{color:#c04060;}
      .cat-count{font-size:9px;font-weight:700;background:${dark ? "#3a2a1a" : "rgba(192,64,96,0.1)"};color:${dark ? "#f0a070" : "#c04060"};padding:1px 5px;border-radius:99px;flex-shrink:0;opacity:0;transition:opacity 0.12s;}
      .sidebar.sb-expanded .cat-count{opacity:1;}
      .cat-del,.cat-edit{background:transparent;border:none;font-size:10px;line-height:1;display:none;align-items:center;justify-content:center;cursor:pointer;padding:1px;flex-shrink:0;border-radius:3px;}
      .cat-item:hover .cat-del,.cat-item:hover .cat-edit{display:flex;}
      .cat-del:hover{color:#e63946;}.cat-edit:hover{color:#c04060;}
      .sb-bottom{padding:0 9px 12px;flex-shrink:0;}
      .sb-divider{height:1px;background:${T.border};margin:6px 0 8px;}
      .sidebar-nav-item{display:flex;align-items:center;gap:12px;padding:10px 9px;border-radius:10px;cursor:pointer;font-size:13.5px;font-weight:600;color:${T.muted};transition:background 0.15s;margin-bottom:2px;border:1px solid transparent;white-space:nowrap;overflow:hidden;}
      .sidebar-nav-item:hover{background:rgba(192,64,96,0.07);}
      .sidebar-nav-active{background:rgba(192,64,96,0.1) !important;border-color:rgba(192,64,96,0.25) !important;color:#c04060 !important;}
      .sidebar-nav-label{opacity:0;transition:opacity 0.12s;flex-shrink:0;}
      .sidebar.sb-expanded .sidebar-nav-label{opacity:1;}
      .btn-add-board{width:100%;display:flex;align-items:center;justify-content:center;gap:5px;padding:7px;border-radius:9px;border:1.5px dashed ${T.border};background:transparent;color:${T.muted};font-size:12px;font-weight:700;cursor:pointer;font-family:'Nunito',sans-serif;transition:all 0.15s;margin-bottom:4px;white-space:nowrap;overflow:hidden;}
      .btn-add-board:hover{background:${T.navHover};border-color:rgba(192,64,96,0.4);color:#c04060;}
      .sidebar-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px 6px;gap:8px;text-align:center;}
      .sidebar-empty-logo{width:34px;height:34px;border-radius:10px;background:linear-gradient(135deg,#f9c0c8,#e06080);display:flex;align-items:center;justify-content:center;animation:float 3s ease-in-out infinite;}
      .sidebar-empty p{font-size:11.5px;font-weight:600;color:${T.muted};opacity:0;transition:opacity 0.12s;}
      .sidebar.sb-expanded .sidebar-empty p{opacity:1;}
      .sidebar-empty small{font-size:10px;color:${T.muted};line-height:1.5;opacity:0;}
      .sidebar.sb-expanded .sidebar-empty small{opacity:0.7;}
      .main{flex:1;display:flex;flex-direction:column;height:100vh;overflow:hidden;}
      .topbar{display:flex;background:${T.sidebar};backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid ${T.border};height:58px;padding:0 16px 0 22px;align-items:center;gap:10px;flex-shrink:0;}
      .topbar-search{flex:1;display:flex;align-items:center;gap:9px;background:${T.surface};border:1.5px solid ${T.border};border-radius:99px;padding:9px 18px;cursor:text;backdrop-filter:blur(8px);min-width:0;}
      .topbar-search input{flex:1;border:none;background:transparent;outline:none;font-family:'Nunito',sans-serif;font-size:13.5px;font-weight:500;color:${T.text};}
      .topbar-search input::placeholder{color:${T.muted};}
      .content-body{flex:1;overflow-y:auto;overflow-x:visible;padding:22px 28px 0;}
      .content-body::-webkit-scrollbar{width:4px;}
      .content-body::-webkit-scrollbar-thumb{background:${T.border};border-radius:99px;}
      .masonry{display:grid;grid-template-columns:1fr 1fr;gap:8px;align-items:start;}
      .masonry-col{display:flex;flex-direction:column;gap:8px;overflow:visible;}
      .modal-bg{position:fixed;inset:0;background:rgba(60,10,25,0.22);z-index:200;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);}
      .modal{background:${T.surface};backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-radius:18px;padding:22px;width:400px;max-width:calc(100vw - 32px);box-shadow:0 24px 60px rgba(100,20,40,0.18);animation:popIn 0.22s ease both;}
      .modal-title{font-family:'Playfair Display',serif;font-size:18px;color:${T.text};margin-bottom:13px;}
      .modal-input{width:100%;padding:9px 12px;border-radius:9px;border:1.5px solid ${T.border};background:${T.input};font-family:'Nunito',sans-serif;font-size:13px;color:${T.text};outline:none;margin-bottom:8px;transition:border-color 0.15s;display:block;}
      .modal-input:focus{border-color:#f0a878;}
      .modal-input::placeholder{color:${T.muted};}
      .modal-btns{display:flex;gap:8px;}
      .btn-cancel{flex:1;padding:9px;border-radius:9px;border:1.5px solid ${T.border};background:transparent;color:${T.muted};font-family:'Nunito',sans-serif;font-size:13px;font-weight:600;cursor:pointer;}
      .btn-cancel:hover{background:${T.navHover};}
      .btn-create{flex:2;padding:9px;border-radius:9px;border:none;background:linear-gradient(135deg,#f9c784,#f0826c);color:#fff;font-family:'Nunito',sans-serif;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 4px 12px rgba(240,130,108,0.22);}
      .btn-create:hover{opacity:0.88;}.stat-card{position:relative;overflow:hidden;}.stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(249,192,200,0.7),transparent);}
      .sidebar-overlay{display:none;}
      @media(max-width:680px){
        .sidebar{position:fixed;top:0;left:0;bottom:0;transform:translateX(-100%);box-shadow:4px 0 22px rgba(0,0,0,0.15);}
        .sidebar.open{transform:translateX(0);animation:slideIn 0.25s ease both;}
        .topbar{display:flex;}
        .content-body{padding:13px 12px 0;}
        .masonry{gap:7px;}
      }
      @media(max-width:400px){.masonry{grid-template-columns:1fr;}}
    `}</style>

    {!hasEntered && <LandingPage onEnter={() => setHasEntered(true)} />}
    {hasEntered && !splashDone && <SplashScreen onDone={handleSplashDone} />}
    {showOnboarding && splashDone && <OnboardingModal onClose={() => setShowOnboarding(false)} />}

    {hasEntered && <div className={`app${appVisible ? " visible" : ""}`}>
      <div className={`sidebar-overlay${sidebarOpen ? " open" : ""}`} onClick={() => setSidebarOpen(false)} />

      {sidebarOpen && <aside className={`sidebar${sbExpanded ? " sb-expanded" : ""}`}
        onMouseEnter={() => setSbExpanded(true)}
        onMouseLeave={() => setSbExpanded(false)}
      >
        {/* Logo row */}
        <div className="sidebar-logo-row">
          <div className="sidebar-logo-btn" onClick={() => setView("dashboard")}><LogoMark size={18} /></div>
          <span className="sidebar-brand-name">Insta<em>Vault</em></span>
        </div>

        {/* Nav items */}
        <div className="sb-nav">
          {/* Top nav */}
          {[
            { key: "home", type: "home", label: "Home" },
            { key: "myboards", type: "boards", label: "My Boards" },
            { key: "tags", type: "tags", label: "Tags" },
            { key: "journal", type: "journal", label: "Journal" },
            { key: "__newboard", type: "newboard", label: "New Board" },
          ].map(({ key, type, label }) => (
            <div key={key}
              className={`sb-nav-item${view === key ? " sb-nav-active" : ""}`}
              onClick={() => { if (key === "__newboard") { setShowAddCat(true); } else { setView(key); setActiveTag(null); setActiveTagView(null); setSearchQuery(""); } }}
            >
              <div className="sb-nav-icon"><NavIcon type={type} color={view === key ? "#c04060" : T.muted} size={20} /></div>
              <span className="sb-nav-label">{label}</span>
            </div>
          ))}

          {/* Locked boards — single PIN-protected row */}
          {lockedBoards.length > 0 && (<>
            <div className="sb-boards-label" style={{ marginTop: 4 }}>Locked</div>
            <div className={`sb-nav-item${view === "locked" ? " sb-nav-active" : ""}`}
              onClick={() => {
                if (vaultUnlocked) {
                  setVaultUnlocked(false);
                  const inLockedBoard = lockedBoards.some(c => c.id === view);
                  if (view === "locked" || inLockedBoard) setView("dashboard");
                } else {
                  const first = lockedBoards[0];
                  if (first) { setPinModal({ boardId: first.id, vaultMode: true }); setPinError(""); }
                }
              }}
            >
              <div className="sb-nav-icon">
                {vaultUnlocked
                  ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#84c9a8" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0114 0" />
                  </svg>
                  : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                }
              </div>
              <span className="sb-nav-label" style={{ color: vaultUnlocked ? "#84c9a8" : T.text }}>{vaultUnlocked ? "Lock Boards" : "Locked Boards"}</span>
              <span style={{ marginLeft: "auto", fontSize: 9, fontWeight: 700, background: "rgba(192,64,96,0.1)", color: "#c04060", padding: "1px 5px", borderRadius: 99, flexShrink: 0, opacity: sbExpanded ? 1 : 0, transition: "opacity 0.12s" }}>{lockedBoards.length}</span>
            </div>

          </>)}
        </div>

        {/* Bottom section */}
        <div className="sb-bottom">
          <div className="sb-divider" />
          <div className={`sidebar-nav-item${view === "trash" ? " sidebar-nav-active" : ""}`} onClick={() => { setView("trash"); setActiveTag(null); setActiveTagView(null); setSearchQuery(""); }}>
            <div className="sb-nav-icon"><NavIcon type="trash" color={view === "trash" ? "#c04060" : T.muted} size={20} /></div>
            <span className="sidebar-nav-label">Recently Deleted</span>
            {(deletedItems.length + deletedBoards.length) > 0 && <span style={{ marginLeft: "auto", background: "rgba(192,64,96,0.1)", color: "#c04060", fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 99, opacity: sbExpanded ? 1 : 0, transition: "opacity 0.12s" }}>{deletedItems.length + deletedBoards.length}</span>}
          </div>
          <div className={`sidebar-nav-item${view === "settings" ? " sidebar-nav-active" : ""}`} onClick={() => { setView("settings"); setActiveTag(null); setActiveTagView(null); setSearchQuery(""); }}>
            <div className="sb-nav-icon"><NavIcon type="settings" color={view === "settings" ? "#c04060" : T.muted} size={20} /></div>
            <span className="sidebar-nav-label">Settings</span>
          </div>
          <div className="sidebar-nav-item" onClick={() => { setHasEntered(false); setSplashDone(false); setAppVisible(false); }}>
            <div className="sb-nav-icon"><NavIcon type="signout" color="#c05068" size={20} /></div>
            <span className="sidebar-nav-label" style={{ color: "#c05068" }}>Sign Out</span>
          </div>
        </div>
      </aside>}

      <main className="main">
        <div className="topbar">
          {/* Wide search */}
          <div className="topbar-search">
            <NavIcon type="search" color={T.muted} size={16} />
            <input ref={searchRef} value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder={
                view === "dashboard" ? "Search boards & posts… (press /)" :
                  view === "home" ? "Search saved posts… (press /)" :
                    view === "saved" ? "Search saved posts… (press /)" :
                      view === "tags" ? "Search tags… (press /)" :
                        view === "journal" ? "Search boards… (press /)" :
                          view === "myboards" ? "Search boards… (press /)" :
                            view === "locked" ? "Search boards… (press /)" :
                              "Search in this board… (press /)"
              } />
            {searchQuery && <button onClick={() => setSearchQuery("")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: T.muted, lineHeight: 1, padding: 0, flexShrink: 0 }}>×</button>}
            {!searchQuery && <span style={{ fontSize: 10, fontWeight: 700, color: T.muted, background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", border: `1px solid ${T.border}`, borderRadius: 5, padding: "2px 6px", flexShrink: 0, opacity: .7 }}>/</span>}
          </div>
          {/* Profile avatar — top right */}
          <button onClick={() => setShowProfile(true)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0 }}><ProfileAvatar size={32} /></button>
        </div>

        <div className="content-body">
          {/* Storage warning */}
          {storageWarned && items.length >= STORAGE_WARN && (<div style={{ background: "#fffbf0", border: "1px solid #f0c050", borderRadius: 9, padding: "7px 12px", fontSize: 11.5, color: "#8a6a00", display: "flex", alignItems: "center", gap: 7, marginBottom: 11 }}>
            ⚠️ {items.length} posts saved. Browsers store ~5MB — delete old posts to stay safe.
            <button onClick={() => setStorageWarned(false)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#c4a020", lineHeight: 1, padding: 0 }}>×</button>
          </div>)}

          {/* Main content */}
          {view === "trash" ? (<TrashView deletedItems={deletedItems} deletedBoards={deletedBoards} dark={dark}
            onRestoreItem={id => { const it = deletedItems.find(i => i.id === id); const { deletedAt, ...rest } = it; setItems(p => [...p, rest]); setDeletedItems(p => p.filter(i => i.id !== id)); }}
            onRestoreBoard={id => { const cat = deletedBoards.find(c => c.id === id); const { deletedAt, ...rest } = cat; setCategories(p => [...p, rest]); const bi = deletedItems.filter(i => i.categoryId === id).map(i => { const { deletedAt, ...r } = i; return r; }); setItems(p => [...p, ...bi]); setDeletedItems(p => p.filter(i => i.categoryId !== id)); setDeletedBoards(p => p.filter(c => c.id !== id)); }}
            onPermDeleteItem={id => setDeletedItems(p => p.filter(i => i.id !== id))}
            onPermDeleteBoard={id => { setDeletedBoards(p => p.filter(c => c.id !== id)); setDeletedItems(p => p.filter(i => i.categoryId !== id)); }}
            onEmpty={() => { setDeletedItems([]); setDeletedBoards([]); }}
          />) : view === "dashboard" ? (<DashboardPage categories={sortedCats} items={items} onSelectBoard={handleSelectBoard} onNewBoard={() => setShowAddCat(true)} dark={dark} searchQuery={searchQuery} profile={profile} />
          ) : view === "locked" ? (<div style={{ padding: "26px 28px 16px", height: "100%", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 600, color: T.text }}>Locked Boards</div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c04060" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
              <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
                <button onClick={() => { setChangePinModal({ mode: 'change', boards: lockedBoards }); setChangePinStep('current'); setChangePinCurrent(''); setChangePinNew(''); setChangePinError(''); }} style={{ fontSize: 11, fontWeight: 700, color: "#c04060", background: "rgba(192,64,96,0.08)", border: "1.5px solid rgba(192,64,96,0.2)", borderRadius: 8, padding: "4px 12px", cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>🔑 Change PIN</button>
                <button onClick={() => { setChangePinModal({ mode: 'remove', boards: lockedBoards }); setChangePinStep('current'); setChangePinCurrent(''); setChangePinError(''); }} style={{ fontSize: 11, fontWeight: 700, color: "#e63946", background: "rgba(230,57,70,0.06)", border: "1.5px solid rgba(230,57,70,0.2)", borderRadius: 8, padding: "4px 12px", cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>🗑 Remove PIN</button>
                <button onClick={() => { setBoardSelectMode(p => !p); setSelectedBoards([]); }} style={{ fontSize: 11, fontWeight: 700, color: boardSelectMode ? "#c04060" : T.muted, background: boardSelectMode ? "rgba(192,64,96,0.08)" : "transparent", border: `1.5px solid ${boardSelectMode ? "#c04060" : T.border}`, borderRadius: 8, padding: "4px 12px", cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>{boardSelectMode ? "✓ Selecting" : "Select"}</button>

              </div>
            </div>
            {boardSelectMode && selectedBoards.length > 0 && (<div style={{ display: "flex", gap: 7, alignItems: "center", background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 9, padding: "7px 12px", marginBottom: 12 }}><span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{selectedBoards.length} selected</span><button onClick={() => { selectedBoards.forEach(id => { const c = lockedBoards.find(x => x.id === id); if (c) requestDeleteCat(c); }); setSelectedBoards([]); setBoardSelectMode(false); }} style={{ padding: "4px 10px", borderRadius: 7, border: "1px solid #f5c5d8", background: "#fff0f5", color: "#e63946", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>Delete</button><button onClick={() => { setSelectedBoards([]); setBoardSelectMode(false); }} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: T.muted, padding: 0 }}>Cancel</button></div>)}
            <div style={{ fontSize: 13, color: T.muted, fontWeight: 500, marginBottom: 20 }}>{lockedBoards.length} board{lockedBoards.length !== 1 ? "s" : ""} · unlocked</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 14 }}>
              {lockedBoards.map((cat, ci) => {
                const count = items.filter(i => i.categoryId === cat.id).length;
                const ACCENTS = [["#f9c0c8", "#f09098"], ["#e8c8f8", "#d0a8f0"], ["#c8d8f8", "#a8b8f0"], ["#f8d8a8", "#f0b880"]];
                const [c1, c2] = ACCENTS[ci % ACCENTS.length];
                return (<div key={cat.id}
                  style={{ borderRadius: 14, overflow: "hidden", cursor: "pointer", border: `1.5px solid ${boardSelectMode && selectedBoards.includes(cat.id) ? "#f0826c" : T.border}`, background: T.surface, transition: "transform 0.18s,box-shadow 0.18s", position: "relative" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(180,80,110,0.14)"; const bar = e.currentTarget.querySelector(".board-action-bar"); if (bar) bar.style.opacity = "1"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; const bar = e.currentTarget.querySelector(".board-action-bar"); if (bar) bar.style.opacity = "0"; }}
                  onClick={() => boardSelectMode ? setSelectedBoards(p => p.includes(cat.id) ? p.filter(x => x !== cat.id) : [...p, cat.id]) : handleSelectBoard(cat)}
                >
                  <div style={{ height: 5, background: `linear-gradient(90deg,${c1},${c2})` }} />
                  <div style={{ padding: "14px 14px 10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <BoardAvatar icon={cat.icon} color={cat.color} size={20} />
                      <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 14, fontWeight: 600, color: T.text, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cat.name}</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                    </div>
                    <div style={{ fontSize: 12, color: T.muted, fontWeight: 500, marginBottom: 6 }}>{count} post{count !== 1 ? "s" : ""}</div>
                    <div className="board-action-bar" style={{ display: "flex", gap: 4, opacity: 0, transition: "opacity 0.15s" }}>
                      <button onClick={e => { e.stopPropagation(); setEditBoardData(cat); }} style={{ flex: 1, fontSize: 10, fontWeight: 700, color: "#c04060", background: "rgba(192,64,96,0.08)", border: "1px solid rgba(192,64,96,0.15)", borderRadius: 6, padding: "3px 0", cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>✏️ Edit</button>
                      <button onClick={e => { e.stopPropagation(); requestDeleteCat(cat); }} style={{ flex: 1, fontSize: 10, fontWeight: 700, color: "#e63946", background: "rgba(230,57,70,0.06)", border: "1px solid rgba(230,57,70,0.15)", borderRadius: 6, padding: "3px 0", cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>🗑 Delete</button>
                    </div>
                  </div>
                </div>);
              })}
            </div>
          </div>)
            : view === "myboards" ? (<div style={{ padding: "26px 28px 16px", height: "100%", overflowY: "auto" }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 600, color: T.text, flex: 1 }}>My Boards</div>
                <button onClick={() => { setBoardSelectMode(p => !p); setSelectedBoards([]); }} style={{ padding: "5px 13px", borderRadius: 8, border: `1.5px solid ${boardSelectMode ? "#c04060" : T.border}`, background: boardSelectMode ? "rgba(192,64,96,0.08)" : "transparent", color: boardSelectMode ? "#c04060" : T.muted, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>
                  {boardSelectMode ? "✓ Selecting" : "Select"}
                </button>
              </div>
              {boardSelectMode && selectedBoards.length > 0 && (
                <div style={{ display: "flex", gap: 7, alignItems: "center", background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 9, padding: "7px 12px", marginBottom: 14 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{selectedBoards.length} selected</span>
                  <button onClick={() => { selectedBoards.forEach(id => { const c = categories.find(x => x.id === id); if (c) requestDeleteCat(c); }); setSelectedBoards([]); setBoardSelectMode(false); }} style={{ padding: "4px 10px", borderRadius: 7, border: "1px solid #f5c5d8", background: "#fff0f5", color: "#e63946", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>Delete</button>
                  <button onClick={() => { setSelectedBoards([]); setBoardSelectMode(false); }} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: T.muted, padding: 0 }}>Cancel</button>
                </div>
              )}
              <div style={{ fontSize: 13, color: T.muted, fontWeight: 500, marginBottom: 20 }}>{categories.filter(c => !c.pin).length} board{categories.filter(c => !c.pin).length !== 1 ? "s" : ""}</div>
              {categories.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 20px", gap: 14, textAlign: "center" }}>
                  <div style={{ width: 64, height: 64, borderRadius: 16, background: "linear-gradient(135deg,#fde4ea,#f8b0c4)", display: "flex", alignItems: "center", justifyContent: "center", animation: "float 3s ease-in-out infinite", boxShadow: "0 8px 22px rgba(192,64,96,0.18)" }}><LogoMark size={28} /></div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, color: T.text }}>No boards yet</div>
                  <div style={{ fontSize: 13, color: T.muted, maxWidth: 220, lineHeight: 1.65 }}>Create your first board to start saving posts.</div>
                  <button onClick={() => setShowAddCat(true)} style={{ padding: "9px 22px", borderRadius: 99, background: "linear-gradient(135deg,#fde4ea,#f8b0c4)", color: "#fff", border: "none", fontFamily: "'Nunito',sans-serif", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 3px 12px rgba(192,64,96,0.25)" }}>＋ New Board</button>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 14 }}>
                  {sortedCats.filter(c => !c.pin).map((cat, ci) => {
                    const count = items.filter(i => i.categoryId === cat.id).length;
                    const ACCENTS = [["#f9c0c8", "#f09098"], ["#c8d8f8", "#a8b8f0"], ["#b8e8c8", "#98d8a8"], ["#f8d8a8", "#f0b880"], ["#e8c8f8", "#d0a8f0"], ["#f8c8b8", "#f0a898"]];
                    const [c1, c2] = ACCENTS[ci % ACCENTS.length];
                    const isSelBoard = selectedBoards.includes(cat.id);
                    return (
                      <div key={cat.id} style={{ borderRadius: 14, overflow: "hidden", border: `1.5px solid ${isSelBoard ? "#f0826c" : T.border}`, background: T.surface, transition: "transform 0.18s,box-shadow 0.18s", cursor: "pointer", position: "relative" }}
                        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(180,80,110,0.14)"; const bar = e.currentTarget.querySelector(".board-action-bar"); if (bar) bar.style.opacity = "1"; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; const bar = e.currentTarget.querySelector(".board-action-bar"); if (bar) bar.style.opacity = "0"; }}
                        onClick={() => boardSelectMode ? setSelectedBoards(p => p.includes(cat.id) ? p.filter(x => x !== cat.id) : [...p, cat.id]) : handleSelectBoard(cat)}
                      >
                        {isSelBoard && <div style={{ position: "absolute", top: 6, right: 6, width: 18, height: 18, borderRadius: "50%", background: "#f0826c", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "white", zIndex: 3 }}>✓</div>}
                        <div style={{ height: 5, background: `linear-gradient(90deg,${c1},${c2})` }} />
                        <div style={{ padding: "14px 14px 10px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                            <BoardAvatar icon={cat.icon} color={cat.color} size={20} />
                            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 14, fontWeight: 600, color: T.text, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cat.name}</span>
                          </div>
                          <div style={{ fontSize: 12, color: T.muted, fontWeight: 500, marginBottom: 6 }}>{count} post{count !== 1 ? "s" : ""}</div>
                          <div className="board-action-bar" style={{ display: "flex", gap: 4, opacity: 0, transition: "opacity 0.15s" }}>
                            <button onClick={e => { e.stopPropagation(); setEditBoardData(cat); }} style={{ flex: 1, fontSize: 10, fontWeight: 700, color: "#c04060", background: "rgba(192,64,96,0.08)", border: "1px solid rgba(192,64,96,0.15)", borderRadius: 6, padding: "3px 0", cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>✏️ Edit</button>
                            <button onClick={e => { e.stopPropagation(); requestDeleteCat(cat); }} style={{ flex: 1, fontSize: 10, fontWeight: 700, color: "#e63946", background: "rgba(230,57,70,0.06)", border: "1px solid rgba(230,57,70,0.15)", borderRadius: 6, padding: "3px 0", cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>🗑 Delete</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div onClick={() => setShowAddCat(true)}
                    style={{ borderRadius: 14, border: `1.5px dashed ${T.border}`, background: "transparent", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: "24px 14px", cursor: "pointer", transition: "background 0.15s,border-color 0.15s", minHeight: 90 }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(192,64,96,0.04)"; e.currentTarget.style.borderColor = "rgba(192,64,96,0.35)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = T.border; }}
                  >
                    <span style={{ fontSize: 22, opacity: 0.35 }}>＋</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: T.muted }}>New Board</span>
                  </div>
                </div>
              )}
            </div>)
              : view === "home" ? (<Homepage categories={sortedCats} items={items} onSelectBoard={handleSelectBoard} onNewBoard={() => setShowAddCat(true)} dark={dark} searchQuery={searchQuery} profile={profile} onClearSearch={() => setSearchQuery("")} onDeleteItem={requestDeleteItem} onEditItem={setEditPost} onMoveItem={i => setMovePost(i)} onTogglePinItem={togglePin} onTagClick={t => { setView("tags"); setActiveTagView(t); }} vaultSort={vaultSort} onVaultSort={setVaultSort} bulkMode={bulkMode} onBulkMode={v => { setBulkMode(v); if (!v) setSelectedPosts([]); }} selectedPosts={selectedPosts} onSelectPost={id => setSelectedPosts(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])} onBulkDelete={() => { selectedPosts.forEach(id => requestDeleteItem(id)); setSelectedPosts([]); setBulkMode(false); }} onBulkMove={() => setMovePost({ bulk: true })} />)
                : view === "saved" ? (() => {
                  const lockedIds = categories.filter(c => c.pin).map(c => c.id);
                  const savedQ = searchQuery.trim().toLowerCase();
                  const savedPosts = [...items].filter(i => !lockedIds.includes(i.categoryId)).sort((a, b) => b.id.localeCompare(a.id)).filter(i => !savedQ || ((i.caption || "").toLowerCase().includes(savedQ.replace(/^#/, "")) || (i.tags || []).some(t => t.toLowerCase().includes(savedQ.replace(/^#/, "")))));
                  const savedCols = Array.from({ length: 4 }, (_, ci) => savedPosts.filter((_, i) => i % 4 === ci));
                  return (<div style={{ padding: "26px 28px 16px", height: "100%", overflowY: "auto" }}>
                    <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
                      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 600, color: T.text, flex: 1 }}>Recently Saved</div>
                      <button onClick={() => { setBulkMode(v => { if (v) setSelectedPosts([]); return !v; }); }} style={{ padding: "5px 13px", borderRadius: 8, border: `1.5px solid ${bulkMode ? "#c04060" : T.border}`, background: bulkMode ? "rgba(192,64,96,0.08)" : "transparent", color: bulkMode ? "#c04060" : T.muted, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>{bulkMode ? "✓ Selecting" : "Select"}</button>
                    </div>
                    {bulkMode && selectedPosts.length > 0 && (<div style={{ display: "flex", gap: 7, alignItems: "center", background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 9, padding: "7px 12px", marginBottom: 10 }}><span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{selectedPosts.length} selected</span><button onClick={() => { selectedPosts.forEach(id => requestDeleteItem(id)); setSelectedPosts([]); setBulkMode(false); }} style={{ padding: "4px 10px", borderRadius: 7, border: "1px solid #f5c5d8", background: "#fff0f5", color: "#e63946", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>Delete</button><button onClick={() => setMovePost({ bulk: true })} style={{ padding: "4px 10px", borderRadius: 7, border: `1px solid ${T.border}`, background: T.input, color: T.muted, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>Move</button><button onClick={() => { setSelectedPosts([]); setBulkMode(false); }} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: T.muted, padding: 0 }}>Cancel</button></div>)}
                    <div style={{ fontSize: 13, color: T.muted, fontWeight: 500, marginBottom: 20 }}>{savedPosts.length} posts · newest first</div>
                    {items.filter(i => !lockedIds.includes(i.categoryId)).length === 0 ? (<div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 20px", gap: 12, textAlign: "center" }}><div style={{ fontSize: 40, opacity: 0.3 }}>🔖</div><div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, color: T.text }}>Nothing saved yet</div><div style={{ fontSize: 13, color: T.muted }}>Posts you save will appear here.</div></div>)
                      : savedPosts.length === 0 ? (<div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 20px", gap: 12, textAlign: "center" }}><div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, color: T.text }}>No results for "{searchQuery}"</div><button onClick={() => setSearchQuery("")} style={{ padding: "6px 16px", borderRadius: 99, background: "rgba(192,64,96,0.1)", color: "#c04060", border: "none", fontFamily: "'Nunito',sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Clear</button></div>) : (
                        <div style={{ display: "flex", gap: 13, alignItems: "flex-start", overflow: "visible", padding: "4px" }}>
                          {savedCols.map((col, ci) => (
                            <div key={ci} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 13, overflow: "visible" }}>
                              {col.map((item, ii) => {
                                const goToBoard = (catId) => { const c = categories.find(x => x.id === catId); if (c) handleSelectBoard(c); };
                                return (<PostCard key={item.id} item={item} onDelete={requestDeleteItem} onEdit={setEditPost} onMove={i => setMovePost(i)} onTogglePin={togglePin} animDelay={ii * 0.04} dark={dark} onTagClick={t => { setView("tags"); setActiveTagView(t); }} onSelectBoard={goToBoard} bulkMode={bulkMode} selected={selectedPosts.includes(item.id)} onSelect={id => setSelectedPosts(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])} />);
                              })}
                            </div>
                          ))}
                        </div>)}
                  </div>);
                })()
                  : view === "tags" ? (
                    activeTagView ? (() => {
                      const taggedPosts = items.filter(i => (i.tags || []).includes(activeTagView));
                      const tagCols = Array.from({ length: 4 }, (_, ci) => taggedPosts.filter((_, i) => i % 4 === ci));
                      const bg = getTagColor(activeTagView);
                      return (<div style={{ padding: "26px 28px 16px", height: "100%", overflowY: "auto" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
                          <button onClick={() => setActiveTagView(null)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 99, border: `1.5px solid ${T.border}`, background: T.surface, color: T.muted, fontFamily: "'Nunito',sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                            All Tags
                          </button>
                          <span style={{ display: "inline-flex", alignItems: "center", padding: "6px 16px", borderRadius: 99, background: bg.bg, border: `1.5px solid ${bg.border}`, fontSize: 14, fontWeight: 700, color: bg.text }}>#{activeTagView}</span>
                          <span style={{ fontSize: 13, color: T.muted }}>{taggedPosts.length} post{taggedPosts.length !== 1 ? "s" : ""}</span>
                          <button onClick={() => { setBulkMode(v => { if (v) setSelectedPosts([]); return !v; }); }} style={{ marginLeft: "auto", padding: "5px 13px", borderRadius: 8, border: `1.5px solid ${bulkMode ? "#c04060" : T.border}`, background: bulkMode ? "rgba(192,64,96,0.08)" : "transparent", color: bulkMode ? "#c04060" : T.muted, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>{bulkMode ? "✓ Selecting" : "Select"}</button>
                        </div>
                        {bulkMode && selectedPosts.length > 0 && (<div style={{ display: "flex", gap: 7, alignItems: "center", background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 9, padding: "7px 12px", marginBottom: 10 }}><span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{selectedPosts.length} selected</span><button onClick={() => { selectedPosts.forEach(id => requestDeleteItem(id)); setSelectedPosts([]); setBulkMode(false); }} style={{ padding: "4px 10px", borderRadius: 7, border: "1px solid #f5c5d8", background: "#fff0f5", color: "#e63946", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>Delete</button><button onClick={() => setMovePost({ bulk: true })} style={{ padding: "4px 10px", borderRadius: 7, border: `1px solid ${T.border}`, background: T.input, color: T.muted, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>Move</button><button onClick={() => { setSelectedPosts([]); setBulkMode(false); }} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: T.muted, padding: 0 }}>Cancel</button></div>)}
                        {taggedPosts.length === 0 ? (
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 20px", gap: 12, textAlign: "center" }}>
                            <div style={{ fontSize: 38, opacity: 0.3 }}>🏷️</div>
                            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, color: T.text }}>No posts with #{activeTagView}</div>
                          </div>
                        ) : (
                          <div style={{ display: "flex", gap: 13, alignItems: "flex-start", overflow: "visible", padding: "4px" }}>
                            {tagCols.map((col, ci) => (
                              <div key={ci} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 13, overflow: "visible" }}>
                                {col.map((item, ii) => {
                                  const goToBoard = (catId) => { const c = categories.find(x => x.id === catId); if (c) handleSelectBoard(c); };
                                  return (<PostCard key={item.id} item={item} onDelete={requestDeleteItem} onEdit={setEditPost} onMove={i => setMovePost(i)} onTogglePin={togglePin} animDelay={ii * 0.04} dark={dark} onTagClick={t => { setActiveTagView(t); }} onSelectBoard={goToBoard} bulkMode={bulkMode} selected={selectedPosts.includes(item.id)} onSelect={id => setSelectedPosts(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])} />);
                                })}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>);
                    })()
                      : (() => {
                        const tagQ = searchQuery.trim().toLowerCase();
                        const allTags = [...new Set(items.flatMap(i => i.tags || []))].filter(t => !tagQ || t.toLowerCase().includes(tagQ));
                        return (<div style={{ padding: "26px 28px 16px", height: "100%", overflowY: "auto" }}>
                          <div style={{ display: "flex", alignItems: "center", marginBottom: 4, gap: 8 }}>
                            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 600, color: T.text, flex: 1 }}>Tags</div>
                            <button onClick={() => { setTagSelectMode(p => !p); setSelectedTags([]); }} style={{ padding: "4px 12px", borderRadius: 8, border: `1.5px solid ${tagSelectMode ? "#c04060" : T.border}`, background: tagSelectMode ? "rgba(192,64,96,0.08)" : "transparent", color: tagSelectMode ? "#c04060" : T.muted, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>{tagSelectMode ? "✓ Selecting" : "Select"}</button>
                          </div>
                          <div style={{ fontSize: 13, color: T.muted, fontWeight: 500, marginBottom: tagSelectMode && selectedTags.length > 0 ? 10 : 20 }}>{[...new Set(items.flatMap(i => i.tags || []))].length} unique tags</div>
                          {tagSelectMode && selectedTags.length > 0 && (<div style={{ display: "flex", gap: 7, alignItems: "center", background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 9, padding: "7px 12px", marginBottom: 14 }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{selectedTags.length} tag{selectedTags.length !== 1 ? "s" : ""} selected</span>
                            <button onClick={() => { setItems(p => p.map(it => ({ ...it, tags: (it.tags || []).filter(t => !selectedTags.includes(t)) }))); setSelectedTags([]); setTagSelectMode(false); }} style={{ padding: "4px 10px", borderRadius: 7, border: "1px solid #f5c5d8", background: "#fff0f5", color: "#e63946", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>Delete</button>
                            <button onClick={() => { setSelectedTags([]); setTagSelectMode(false); }} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: T.muted, padding: 0 }}>Cancel</button>
                          </div>)}
                          {[...new Set(items.flatMap(i => i.tags || []))].length === 0 ? (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 20px", gap: 12, textAlign: "center" }}><div style={{ fontSize: 40, opacity: 0.3 }}>🏷️</div><div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, color: T.text }}>No tags yet</div><div style={{ fontSize: 13, color: T.muted }}>Add tags to your posts to see them here.</div></div>
                          ) : (
                            <>
                              {tagQ && allTags.length === 0 && <div style={{ fontSize: 13, color: T.muted, padding: "40px 0", textAlign: "center" }}>No tags matching "{searchQuery}"</div>}
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "flex-start" }}>
                                {allTags.map(tag => {
                                  const count = items.filter(i => (i.tags || []).includes(tag)).length;
                                  const bg = getTagColor(tag);
                                  const isTagSel = tagSelectMode && selectedTags.includes(tag);
                                  return (<div key={tag} onClick={() => tagSelectMode ? setSelectedTags(p => p.includes(tag) ? p.filter(x => x !== tag) : [...p, tag]) : setActiveTagView(tag)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 99, background: isTagSel ? "#f0826c" : bg.bg, border: `1.5px solid ${isTagSel ? "#f0826c" : bg.border}`, cursor: "pointer", transition: "transform 0.15s,box-shadow 0.15s,background 0.15s", position: "relative" }} onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.04)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(180,80,110,0.13)"; }} onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; }}>
                                    {isTagSel && <span style={{ fontSize: 11, color: "white", fontWeight: 700, marginRight: -2 }}>✓</span>}
                                    <span style={{ fontSize: 13.5, fontWeight: 700, color: isTagSel ? "white" : bg.text }}>#{tag}</span>
                                    <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(0,0,0,0.08)", padding: "1px 6px", borderRadius: 99, color: isTagSel ? "white" : bg.text }}>{count}</span>
                                  </div>);
                                })}
                              </div>
                            </>
                          )}
                        </div>);
                      })()
                  )
                    : view === "settings" ? (() => {
                      return (<div style={{ padding: "26px 28px 16px", height: "100%", overflowY: "auto" }}>
                        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 600, color: T.text, marginBottom: 4 }}>Settings</div>
                        <div style={{ fontSize: 13, color: T.muted, fontWeight: 500, marginBottom: 24 }}>Manage your account and preferences</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 420 }}>
                          <div style={{ borderRadius: 13, border: `1.5px solid ${T.border}`, background: T.surface, overflow: "hidden" }}>
                            <div style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: "0.07em", textTransform: "uppercase", borderBottom: `1px solid ${T.border}` }}>Account</div>
                            <button onClick={() => setShowProfile(true)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", background: "transparent", border: "none", cursor: "pointer", fontFamily: "'Nunito',sans-serif", fontSize: 13, color: T.text, textAlign: "left" }}>
                              <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#fde4ea,#f8b0c4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg></div>
                              <div style={{ flex: 1 }}><div style={{ fontWeight: 700 }}>Edit Profile</div><div style={{ fontSize: 11, color: T.muted, marginTop: 1 }}>{profile.name || "Set your name"} · {profile.email || ""}</div></div>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                            </button>
                          </div>
                          <div style={{ borderRadius: 13, border: `1.5px solid ${T.border}`, background: T.surface, overflow: "hidden" }}>
                            <div style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: "0.07em", textTransform: "uppercase", borderBottom: `1px solid ${T.border}` }}>Appearance</div>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px" }}>
                              <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#e8d8f8,#c8a8e8)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ fontSize: 17 }}>{dark ? "☀️" : "🌙"}</span></div>
                              <div style={{ flex: 1, fontWeight: 700, fontSize: 13, color: T.text }}>{dark ? "Switch to Light Mode" : "Switch to Dark Mode"}</div>
                              <div onClick={() => setDark(d => !d)} style={{ width: 44, height: 24, borderRadius: 99, background: dark ? "#f0826c" : "#ede6dc", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}><div style={{ position: "absolute", top: 3, left: dark ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: "white", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }} /></div>
                            </div>
                          </div>
                          <div style={{ borderRadius: 13, border: `1.5px solid ${T.border}`, background: T.surface, overflow: "hidden" }}>
                            <div style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: "0.07em", textTransform: "uppercase", borderBottom: `1px solid ${T.border}` }}>Data</div>
                            <button onClick={() => { const data = { categories, items, journal, profile, deletedItems, deletedBoards, exportedAt: new Date().toISOString(), version: "iv1" }; const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `InstaVault-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click(); URL.revokeObjectURL(url); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", background: "transparent", border: "none", borderBottom: `1px solid ${T.border}`, cursor: "pointer", fontFamily: "'Nunito',sans-serif", fontSize: 13, color: T.text, textAlign: "left" }}>
                              <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#b8e8d0,#88c8a8)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg></div>
                              <div style={{ flex: 1 }}><div style={{ fontWeight: 700 }}>Export Backup</div><div style={{ fontSize: 11, color: T.muted, marginTop: 1 }}>Download all your data as JSON</div></div>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                            </button>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", fontSize: 12 }}>
                              <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#f8e8c8,#e8c888)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg></div>
                              <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 13, color: T.text }}>Storage</div><div style={{ color: T.muted, marginTop: 1 }}>{items.length} posts · {categories.length} boards</div></div>
                            </div>
                          </div>
                          <div style={{ borderRadius: 13, border: `1.5px solid ${T.border}`, background: T.surface, overflow: "hidden" }}>
                            <div style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: "0.07em", textTransform: "uppercase", borderBottom: `1px solid ${T.border}` }}>Support</div>
                            <button onClick={() => setShowProfile(true)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", background: "transparent", border: "none", borderBottom: `1px solid ${T.border}`, cursor: "pointer", fontFamily: "'Nunito',sans-serif", fontSize: 13, color: T.text, textAlign: "left" }}>
                              <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#c8d8f8,#a8b8e8)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg></div>
                              <div style={{ flex: 1 }}><div style={{ fontWeight: 700 }}>Help & Feedback</div><div style={{ fontSize: 11, color: T.muted, marginTop: 1 }}>About InstaVault, tips and info</div></div>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                            </button>
                            <button onClick={() => setView("trash")} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", background: "transparent", border: "none", cursor: "pointer", fontFamily: "'Nunito',sans-serif", fontSize: 13, color: T.text, textAlign: "left" }}>
                              <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#f8d0c8,#e8a098)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6M14 11v6" /></svg></div>
                              <div style={{ flex: 1 }}><div style={{ fontWeight: 700 }}>Recently Deleted</div><div style={{ fontSize: 11, color: T.muted, marginTop: 1 }}>{deletedItems.length + deletedBoards.length} item{(deletedItems.length + deletedBoards.length) !== 1 ? "s" : ""} in trash</div></div>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                            </button>
                          </div>
                          <button onClick={() => { setHasEntered(false); setSplashDone(false); setAppVisible(false); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", borderRadius: 13, border: "1.5px solid rgba(230,57,70,0.2)", background: "rgba(230,57,70,0.03)", cursor: "pointer", fontFamily: "'Nunito',sans-serif", fontSize: 13, color: "#e63946", textAlign: "left" }}>
                            <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(230,57,70,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e63946" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg></div>
                            <div style={{ fontWeight: 700 }}>Sign Out</div>
                          </button>
                        </div>
                      </div>);
                    })()
                      : view === "journal" ? (() => {
                        const jQ = searchQuery.trim().toLowerCase();
                        const jCatsRaw = categories.filter(c => !jQ || c.name.toLowerCase().includes(jQ));
                        const jSort = journalSort || "recent";
                        const jCats = jSort === "alpha"
                          ? [...jCatsRaw].sort((a, b) => a.name.localeCompare(b.name))
                          : jSort === "hasNotes"
                            ? [...jCatsRaw].sort((a, b) => { const ae = journal[a.id]; const be = journal[b.id]; const ah = Array.isArray(ae) ? ae.length > 0 : !!ae; const bh = Array.isArray(be) ? be.length > 0 : !!be; return bh - ah; })
                            : [...jCatsRaw].sort((a, b) => {
                              const getTs = cat => { const e = journal[cat.id]; if (!e) return 0; if (Array.isArray(e)) return Math.max(...e.map(x => x.ts || 0), 0); return e.ts || 0; };
                              return getTs(b) - getTs(a);
                            });
                        return (<div style={{ padding: "26px 28px 16px", height: "100%", overflowY: "auto" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 600, color: T.text, flex: 1 }}>Journal</div>
                            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                              <select value={jSort} onChange={e => setJournalSort(e.target.value)} style={{ padding: "4px 10px", borderRadius: 8, border: `1.5px solid ${T.border}`, background: T.surface, color: T.text, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Nunito',sans-serif", outline: "none" }}>
                                <option value="recent">Recent</option>
                                <option value="hasNotes">Has Notes</option>
                                <option value="alpha">A–Z</option>
                              </select>
                              <button onClick={() => { setBoardSelectMode(p => !p); setSelectedBoards([]); }} style={{ padding: "4px 12px", borderRadius: 7, border: `1.5px solid ${boardSelectMode ? "#c04060" : T.border}`, background: boardSelectMode ? "rgba(192,64,96,0.08)" : "transparent", color: boardSelectMode ? "#c04060" : T.muted, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>{boardSelectMode ? "✓ Selecting" : "Select"}</button>
                            </div>
                          </div>
                          <div style={{ fontSize: 13, color: T.muted, fontWeight: 500, marginBottom: 20 }}>Notes and thoughts for each board</div>
                          {boardSelectMode && selectedBoards.length > 0 && (<div style={{ display: "flex", gap: 7, alignItems: "center", background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 9, padding: "7px 12px", marginBottom: 14 }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{selectedBoards.length} board{selectedBoards.length !== 1 ? "s" : ""} selected</span>
                            <button onClick={() => { selectedBoards.forEach(id => { const c = categories.find(x => x.id === id); if (c) requestDeleteCat(c); }); setSelectedBoards([]); setBoardSelectMode(false); }} style={{ padding: "4px 10px", borderRadius: 7, border: "1px solid #f5c5d8", background: "#fff0f5", color: "#e63946", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>Delete Boards</button>
                            <button onClick={() => { selectedBoards.forEach(id => { setJournal(p => ({ ...p, [id]: [] })); }); setSelectedBoards([]); setBoardSelectMode(false); }} style={{ padding: "4px 10px", borderRadius: 7, border: `1px solid ${T.border}`, background: T.input, color: T.muted, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>Clear Notes</button>
                            <button onClick={() => { setSelectedBoards([]); setBoardSelectMode(false); }} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: T.muted, padding: 0 }}>Cancel</button>
                          </div>)}
                          {categories.length === 0 ? (<div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 20px", gap: 12, textAlign: "center" }}><div style={{ fontSize: 40, opacity: 0.3 }}>📓</div><div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, color: T.text }}>No boards yet</div><div style={{ fontSize: 13, color: T.muted }}>Create a board to start journalling.</div></div>)
                            : jCats.length === 0 ? (<div style={{ fontSize: 13, color: T.muted, padding: "40px 0", textAlign: "center" }}>No boards matching "{searchQuery}"</div>) : (
                              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {jCats.map(cat => {
                                  const rawEntry = journal[cat.id];
                                  const entryText = Array.isArray(rawEntry)
                                    ? rawEntry.map(e => e.text || "").filter(Boolean).join("\n")
                                    : typeof rawEntry === "string" ? rawEntry
                                      : rawEntry?.text || rawEntry?.content || "";
                                  const entryCount = Array.isArray(rawEntry) ? rawEntry.filter(e => e.text || e.content).length : entryText ? 1 : 0;
                                  const isSelJ = selectedBoards.includes(cat.id);
                                  return (<div key={cat.id}
                                    onClick={() => boardSelectMode ? setSelectedBoards(p => p.includes(cat.id) ? p.filter(x => x !== cat.id) : [...p, cat.id]) : setJournalPreview(cat.id)}
                                    style={{ padding: "14px 18px", borderRadius: 14, border: `1.5px solid ${isSelJ ? "#f0826c" : T.border}`, background: isSelJ ? (dark ? "rgba(240,130,108,0.08)" : "rgba(240,130,108,0.05)") : T.surface, cursor: "pointer", transition: "box-shadow 0.15s,transform 0.15s", position: "relative" }}
                                    onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 20px rgba(180,80,110,0.1)"; e.currentTarget.style.transform = "translateY(-2px)"; const bar = e.currentTarget.querySelector(".j-action-bar"); if (bar) bar.style.opacity = "1"; }}
                                    onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; const bar = e.currentTarget.querySelector(".j-action-bar"); if (bar) bar.style.opacity = "0"; }}>
                                    {isSelJ && <div style={{ position: "absolute", top: 10, right: 10, width: 20, height: 20, borderRadius: "50%", background: "#f0826c", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "white", zIndex: 3 }}>✓</div>}
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                      <BoardAvatar icon={cat.icon} color={cat.color} size={18} />
                                      <span style={{ fontSize: 14, fontWeight: 700, color: T.text, flex: 1 }}>{cat.name}</span>
                                      {entryCount > 0
                                        ? <span style={{ fontSize: 11, fontWeight: 700, color: dark ? "#e07090" : "#c04060", background: "rgba(192,64,96,0.08)", padding: "3px 10px", borderRadius: 99 }}>{entryCount} {entryCount === 1 ? "entry" : "entries"}</span>
                                        : <span style={{ fontSize: 11, color: T.muted, opacity: 0.6 }}>No notes yet</span>
                                      }
                                      <button onClick={e => { e.stopPropagation(); if (boardSelectMode) { setSelectedBoards(p => p.includes(cat.id) ? p.filter(x => x !== cat.id) : [...p, cat.id]); } else { setView(cat.id); } }} style={{ padding: "4px 12px", borderRadius: 7, border: `1.5px solid ${T.border}`, background: "transparent", color: T.muted, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito',sans-serif", whiteSpace: "nowrap", marginLeft: 4 }}>
                                        {boardSelectMode ? (selectedBoards.includes(cat.id) ? "✓ Selected" : "Select") : "Open Board →"}
                                      </button>
                                    </div>
                                    <div className="j-action-bar" style={{ display: "flex", gap: 6, marginTop: 10, opacity: 0, transition: "opacity 0.15s" }}>
                                      <button onClick={e => { e.stopPropagation(); setJournalPreview(cat.id); }} style={{ flex: 1, padding: "5px 0", borderRadius: 7, border: `1px solid ${T.border}`, background: T.input, color: T.text, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>✏️ Edit Notes</button>
                                      <button onClick={e => { e.stopPropagation(); setConfirmModal({ title: `Clear notes for "${cat.name}"?`, subtitle: "All journal entries for this board will be deleted.", onConfirm: () => { setJournal(p => ({ ...p, [cat.id]: [] })); setConfirmModal(null); } }); }} style={{ flex: 1, padding: "5px 0", borderRadius: 7, border: "1px solid #f5c5d8", background: "#fff0f5", color: "#e63946", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>🗑 Clear Notes</button>
                                      <button onClick={e => { e.stopPropagation(); requestDeleteCat(cat); }} style={{ flex: 1, padding: "5px 0", borderRadius: 7, border: "1px solid rgba(230,57,70,0.2)", background: "rgba(230,57,70,0.04)", color: "#e63946", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>🗑 Delete Board</button>
                                    </div>
                                  </div>);
                                })}
                              </div>)}
                        </div>);
                      })()
                        : isLocked ? (<div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "55%", gap: 12, textAlign: "center", padding: 40 }}>
                          <div style={{ fontSize: 42 }}>🔒</div>
                          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 19, color: T.text }}>{selected.name} is locked</div>
                          <div style={{ fontSize: 12, color: T.muted, maxWidth: 190, lineHeight: 1.65 }}>Enter your PIN to unlock this board.</div>
                          <button className="btn-create" style={{ borderRadius: 10, padding: "8px 22px", fontSize: 13, border: "none", cursor: "pointer", marginTop: 3 }} onClick={() => { setPinModal({ boardId: selected.id }); setPinError(""); }}>Enter PIN 🔓</button>
                        </div>) : selected ? (<>
                          {/* Board header */}
                          <div style={{ marginBottom: 11 }}>
                            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 7 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                                {prevView && prevView !== selected?.id && ['myboards', 'locked', 'dashboard', 'home', 'saved', 'tags', 'journal'].includes(prevView) && (
                                  <button onClick={() => { setView(prevView); setPrevView(null); }} style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 8, border: `1.5px solid ${T.border}`, background: "transparent", color: T.muted, fontSize: 11.5, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito',sans-serif", flexShrink: 0 }}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                                    Back
                                  </button>
                                )}
                                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 21, fontWeight: 600, color: T.text, display: "flex", alignItems: "center", gap: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  <BoardAvatar icon={selected.icon} color={selected.color} size={22} />{selected.name}{selected.pin && <span style={{ fontSize: 11, color: "#84c9a8" }}>🔓</span>}
                                </div>
                              </div>
                              <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
                                {/* Sort dropdown */}
                                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                                  <select value={postSort} onChange={e => setPostSort(e.target.value)}
                                    style={{ appearance: "none", WebkitAppearance: "none", border: `1.5px solid ${T.border}`, background: T.surface, borderRadius: 9, color: T.text, fontFamily: "'Nunito',sans-serif", fontSize: 12.5, fontWeight: 600, padding: "7px 28px 7px 12px", outline: "none", cursor: "pointer", boxShadow: "0 1px 4px rgba(180,80,110,0.06)" }}>
                                    {POST_SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                  </select>
                                  <svg style={{ position: "absolute", right: 9, pointerEvents: "none" }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                                </div>
                                {/* Journal button */}
                                <button onClick={() => setShowJournal(true)}
                                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 9, border: `1.5px solid ${T.border}`, background: T.surface, color: T.text, fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "'Nunito',sans-serif", boxShadow: "0 1px 4px rgba(180,80,110,0.06)", whiteSpace: "nowrap" }}>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="9" y1="12" x2="13" y2="12" /></svg>
                                  Journal
                                </button>
                                {/* Select button */}
                                <button onClick={() => { setBulkMode(v => { if (v) setSelectedPosts([]); return !v; }); }}
                                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 9, border: `1.5px solid ${bulkMode ? "#c04060" : T.border}`, background: bulkMode ? "rgba(192,64,96,0.1)" : T.surface, color: bulkMode ? "#c04060" : T.text, fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "'Nunito',sans-serif", boxShadow: "0 1px 4px rgba(180,80,110,0.06)", whiteSpace: "nowrap" }}>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{bulkMode ? <polyline points="20 6 9 17 4 12" /> : <><rect x="3" y="3" width="5" height="5" rx="1" /><rect x="10" y="3" width="5" height="5" rx="1" /><rect x="17" y="3" width="4" height="5" rx="1" /><rect x="3" y="10" width="5" height="5" rx="1" /></>}</svg>
                                  {bulkMode ? "✓ Selecting" : "Select"}
                                </button>
                              </div>
                            </div>
                            <div style={{ fontSize: 11, color: T.muted, marginTop: 3 }}>{visibleItems.length} post{visibleItems.length !== 1 ? "s" : ""}{activeTag && <span> · filtered by <TagPill tag={activeTag} small /> <button onClick={() => setActiveTag(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: T.muted, padding: 0, marginLeft: 2 }}>×</button></span>}</div>
                          </div>
                          {/* Bulk action bar */}
                          {bulkMode && selectedPosts.length > 0 && (<div style={{ display: "flex", alignItems: "center", gap: 7, background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 9, padding: "7px 12px", marginBottom: 11 }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{selectedPosts.length} selected</span>
                            <button onClick={() => setMovePost({ bulk: true })} style={{ padding: "4px 10px", borderRadius: 7, border: `1px solid ${T.border}`, background: T.input, color: T.muted, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>Move</button>
                            <button onClick={requestBulkDelete} style={{ padding: "4px 10px", borderRadius: 7, border: "1px solid #f5c5d8", background: "#fff0f5", color: "#e63946", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>Delete</button>
                            <button onClick={() => { setSelectedPosts([]); setBulkMode(false); }} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: T.muted, padding: 0 }}>Cancel</button>
                          </div>)}
                          <AddPostForm onAdd={addItem} dark={dark} />
                          <div className="masonry" onDragOver={e => e.preventDefault()}>
                            {visibleItems.length === 0 ? (
                              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "55px 20px", gap: 13, textAlign: "center", gridColumn: "1/-1" }}>
                                <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#fde8d8,#fdf0e0)", display: "flex", alignItems: "center", justifyContent: "center", animation: "float 3s ease-in-out infinite", boxShadow: "0 8px 22px rgba(240,160,112,0.17)" }}><BoardAvatar icon={selected.icon} color={selected.color} size={34} /></div>
                                {activeTag || searchQuery ? (<><div style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, color: T.text }}>No posts found</div><div style={{ fontSize: 12, color: T.muted }}>Try clearing your filter.</div><button onClick={() => { setActiveTag(null); setSearchQuery(""); }} style={{ padding: "5px 14px", borderRadius: 8, border: `1px solid ${T.border}`, background: T.input, color: T.muted, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>Clear filter</button></>)
                                  : (<><div style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, color: T.text }}>This board is empty</div><div style={{ fontSize: 12, color: T.muted, maxWidth: 200, lineHeight: 1.6 }}>Paste an Instagram link above to save your first post.</div></>)}
                              </div>
                            ) : [col1, col2].map((col, ci) => (<div key={ci} className="masonry-col">{col.map((item, idx) => (<div key={item.id} onDragOver={e => e.preventDefault()} onDrop={e => handlePostDrop(e, item.id)}><PostCard item={item} onDelete={requestDeleteItem} onEdit={setEditPost} onMove={i => setMovePost(i)} onTogglePin={togglePin} selected={selectedPosts.includes(item.id)} onSelect={id => setSelectedPosts(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])} bulkMode={bulkMode} animDelay={idx * 0.04} dark={dark} onTagClick={setActiveTag} /></div>))}</div>))}
                          </div>
                        </>) : null}


        </div>
        <div style={{ flexShrink: 0, padding: "10px 24px", borderTop: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, background: T.surface }}>
          <span style={{ fontSize: 11, color: T.muted }}>Made with ♥ by <span style={{ color: "#f0826c", fontWeight: 700 }}>Harika</span></span>
          <span style={{ fontSize: 11, color: T.border }}>·</span>
          <span style={{ fontSize: 11, color: T.muted }}>© InstaVault 2026</span>
        </div>
      </main>
    </div>}

    {hasEntered && showAddCat && <BoardModal onSave={addCategory} onClose={() => setShowAddCat(false)} existingNames={categories.map(c => c.name)} />}
    {hasEntered && editBoardData && <BoardModal initial={editBoardData} onSave={saveEditBoard} onClose={() => setEditBoardData(null)} existingNames={categories.map(c => c.name)} />}
    {hasEntered && showProfile && <ProfileModal onClose={() => setShowProfile(false)} dark={dark} onToggleDark={() => setDark(p => !p)} profile={profile} onSaveProfile={p => { setProfile(p); }} categories={categories} items={items} journal={journal} deletedItems={deletedItems} deletedBoards={deletedBoards} onSignOut={() => { setShowProfile(false); setHasEntered(false); setSplashDone(false); setAppVisible(false); }} />}
    {hasEntered && showJournal && selected && <JournalModal board={selected} journal={journal} onSave={saveJournal} onClose={() => setShowJournal(false)} dark={dark} />}
    {hasEntered && journalPreview && (() => { const previewBoard = categories.find(c => c.id === journalPreview); return previewBoard ? <JournalModal board={previewBoard} journal={journal} onSave={saveJournal} onClose={() => setJournalPreview(null)} dark={dark} /> : null; })()}
    {hasEntered && changePinModal && <ChangePinModal mode={changePinModal.mode} boards={changePinModal.boards} onChangePinError={(boardId, newPin) => { setCategories(p => p.map(c => c.id === boardId ? { ...c, pin: newPin } : c)); }} onClose={() => setChangePinModal(null)} />}
    {hasEntered && pinModal && <PinModal title="Enter PIN" subtitle="This board is protected." onSubmit={handlePinSubmit} onClose={() => { setPinModal(null); setPinError(""); }} error={pinError} />}
    {hasEntered && confirmModal && <ConfirmModal title={confirmModal.title} subtitle={confirmModal.subtitle} onConfirm={confirmModal.onConfirm} onClose={() => setConfirmModal(null)} />}
    {hasEntered && editPost && <EditPostModal item={editPost} onSave={saveEditPost} onClose={() => setEditPost(null)} dark={dark} />}
    {hasEntered && movePost && <MoveModal itemIds={movePost.bulk ? selectedPosts : Array.isArray(movePost) ? movePost.map(i => i.id) : [movePost.id]} categories={categories} currentCatId={view} onMove={movePostsToBoard} onClose={() => setMovePost(null)} dark={dark} />}
  </>);
}
