#!/usr/bin/env node
// ゴジラ — AGY CLI statusline (Neo-Tokyo Edition)
// Two lines: identity band + telemetry bars (context / quota buckets).
// Intelligent model-aware quota: shows Gemini buckets for Gemini models,
// 3p buckets for Claude/OSS models.
'use strict';
const fs = require('fs');
const path = require('path');

// --- Neo-Tokyo palette (Exact match to Claude Code theme) ---------------------
const E = String.fromCharCode(27) + '[';
const C = {
  mag:    E + '38;2;255;0;135m',    // Hot neon magenta (#FF0087)
  magHi:  E + '38;2;255;145;205m',  // Bright pinkish magenta (#FF91CD)
  magLo:  E + '38;2;122;24;74m',    // Dim magenta track (#7A184A)
  cyan:   E + '38;2;0;240;255m',    // Electric cyan (#00F0FF)
  cyanLo: E + '38;2;20;92;104m',    // Dim cyan track (#145C68)
  green:  E + '38;2;0;255;102m',    // Neon green (#00FF66)
  yellow: E + '38;2;255;230;0m',    // Laser yellow (#FFE600)
  yelLo:  E + '38;2;110;98;18m',    // Dim yellow track (#6E6212)
  red:    E + '38;2;255;23;68m',    // Neon warning red (#FF1744)
  redLo:  E + '38;2;110;22;40m',    // Dim red track (#6E1628)
  violet: E + '38;2;176;38;255m',   // Cyber purple (#B026FF)
  slate:  E + '38;2;73;84;112m',    // Muted border slate (#495470)
  ice:    E + '38;2;240;244;248m',  // Pure white/ice foreground (#F0F4F8)
  r:      E + '0m',
};
const BS = String.fromCharCode(92);
const SEP = C.slate + '\u2502' + C.r;
const DOT = C.slate + '\u00b7' + C.r;

// --- Helpers -----------------------------------------------------------------
const clamp = (n) => Math.max(0, Math.min(100, Number(n) || 0));

function bar(pct, width) {
  width = width || 10;
  const p = clamp(pct);
  const filled = Math.min(width, Math.round((p / 100) * width));
  let on = C.mag, off = C.magLo;
  if (p >= 90) { on = C.red; off = C.redLo; }
  else if (p >= 75) { on = C.yellow; off = C.yelLo; }
  return on + '\u2588'.repeat(filled) + off + '\u2591'.repeat(width - filled) + C.r;
}

function pctText(pct) {
  const p = clamp(pct);
  const col = p >= 90 ? C.red : p >= 75 ? C.yellow : C.ice;
  return col + String(Math.round(p)).padStart(3) + '%' + C.r;
}

function until(timeVal) {
  if (!timeVal) return '';
  let targetMs = 0;
  if (typeof timeVal === 'number') {
    targetMs = timeVal < 1e11 ? timeVal * 1000 : timeVal;
  } else if (typeof timeVal === 'string') {
    const parsed = Date.parse(timeVal);
    if (!isNaN(parsed)) targetMs = parsed;
    else {
      const num = Number(timeVal);
      if (!isNaN(num)) targetMs = num < 1e11 ? num * 1000 : num;
    }
  }
  if (!targetMs) return '';
  const ms = targetMs - Date.now();
  if (ms <= 0) return '';
  const m = Math.floor(ms / 60000);
  const d = Math.floor(m / 1440);
  const h = Math.floor((m % 1440) / 60);
  const mm = m % 60;
  if (d > 0) return d + 'd' + h + 'h';
  if (h > 0) return h + 'h' + String(mm).padStart(2, '0') + 'm';
  return mm + 'm';
}

function untilSecs(secs) {
  if (!secs || secs <= 0) return '';
  const m = Math.floor(secs / 60);
  const d = Math.floor(m / 1440);
  const h = Math.floor((m % 1440) / 60);
  const mm = m % 60;
  if (d > 0) return d + 'd' + h + 'h';
  if (h > 0) return h + 'h' + String(mm).padStart(2, '0') + 'm';
  return mm + 'm';
}

function gitBranch(startDir) {
  try {
    let dir = startDir;
    for (let i = 0; i < 12 && dir; i++) {
      const g = path.join(dir, '.git');
      let head = null;
      try {
        const st = fs.statSync(g);
        if (st.isDirectory()) {
          head = path.join(g, 'HEAD');
        } else if (st.isFile()) {
          const m = /^gitdir:\s*(.+)$/m.exec(fs.readFileSync(g, 'utf8'));
          if (m) head = path.join(path.resolve(dir, m[1].trim()), 'HEAD');
        }
      } catch (e) { /* continue walking up */ }
      if (head && fs.existsSync(head)) {
        const txt = fs.readFileSync(head, 'utf8').trim();
        const ref = /^ref:\s*refs\/heads\/(.+)$/.exec(txt);
        return ref ? ref[1] : txt.slice(0, 7);
      }
      const up = path.dirname(dir);
      if (up === dir) break;
      dir = up;
    }
  } catch (e) { /* ignore */ }
  return null;
}

function prettyDir(dir) {
  if (!dir) return '';
  const home = process.env.USERPROFILE || process.env.HOME || '';
  let d = dir;
  if (home && d.toLowerCase().startsWith(home.toLowerCase())) {
    d = '~' + d.slice(home.length);
  }
  const parts = d.split(/[\\/]/).filter(Boolean);
  if (parts.length <= 3) return parts.join(BS);
  return [parts[0], '\u2026'].concat(parts.slice(-2)).join(BS);
}

function loadAgySettings() {
  try {
    const p = path.join(process.env.USERPROFILE || 'C:\\Users\\eljon', '.gemini', 'antigravity-cli', 'settings.json');
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, 'utf8'));
    }
  } catch (e) {}
  return {};
}

// --- Model provider detection ------------------------------------------------
function detectProvider(modelStr) {
  if (!modelStr) return 'gemini';
  const m = modelStr.toLowerCase();
  if (m.includes('claude') || m.includes('opus') || m.includes('sonnet') || m.includes('haiku')) return '3p';
  if (m.includes('gpt') || m.includes('o1') || m.includes('o3') || m.includes('o4')) return '3p';
  if (m.includes('llama') || m.includes('mistral') || m.includes('deepseek') || m.includes('qwen') || m.includes('command')) return '3p';
  // Default: Gemini
  return 'gemini';
}

// --- Render Statusline -------------------------------------------------------
function render(d) {
  d = d || {};
  const settings = loadAgySettings();

  // Model & Effort resolution
  let rawModel = '';
  if (d.model) {
    if (typeof d.model === 'string') rawModel = d.model;
    else if (d.model.display_name) rawModel = d.model.display_name;
    else if (d.model.id) rawModel = d.model.id;
    else if (d.model.name) rawModel = d.model.name;
  }
  if (!rawModel && settings.model) {
    rawModel = settings.model;
  }
  if (!rawModel) rawModel = 'Gemini 3.8 Flash';

  let modelName = rawModel;
  let effort = '';
  if (d.effort) {
    effort = typeof d.effort === 'string' ? d.effort : (d.effort.level || '');
  }
  const effortMatch = /\(([^)]+)\)$/.exec(rawModel);
  if (effortMatch) {
    modelName = rawModel.replace(/\s*\([^)]+\)$/, '').trim();
    if (!effort) effort = effortMatch[1].toLowerCase();
  }

  // Detect provider from model name
  const provider = detectProvider(rawModel);

  // Workspace & Git VCS
  const cwd = (d.workspace && (d.workspace.current_dir || d.workspace.project_dir)) ||
              d.current_dir || d.project_dir || d.cwd || process.cwd();
  const branch = (d.vcs && d.vcs.branch) || d.branch || gitBranch(cwd);

  // Cost
  const cost = (d.cost && (typeof d.cost.total_cost_usd === 'number' ? d.cost.total_cost_usd : d.cost.total_usd)) ||
               d.total_usd || 0;

  // Plan tier badge
  const planTier = d.plan_tier || '';

  // ---- Line 1: Identity band -----------------------------------------------
  const l1 = [];
  // 1. Japanese Godzilla brand
  l1.push(C.mag + '\u30b4\u30b8\u30e9' + C.r);

  // 2. Model & reasoning effort badge
  let badge = C.magHi + '\u26a1 ' + modelName + C.r;
  if (effort) badge += ' ' + C.slate + '\u00b7' + C.r + ' ' + C.violet + effort + C.r;
  if (d.fast_mode) badge += ' ' + C.yellow + '\u25b8fast' + C.r;
  if (d.thinking && (d.thinking.enabled || d.thinking === true)) badge += ' ' + C.cyanLo + '\u2736' + C.r;
  l1.push(badge);

  // 3. Location & branch
  if (cwd) {
    let loc = C.cyan + '\󰉉 ' + prettyDir(cwd) + C.r;
    if (branch) loc += '  ' + C.mag + '\ue0a0 ' + branch + C.r;
    l1.push(loc);
  }

  // 4. Session cost (if applicable)
  if (typeof cost === 'number' && cost > 0) {
    l1.push(C.yellow + '$' + cost.toFixed(2) + C.r);
  }

  // ---- Line 2: Telemetry bars ----------------------------------------------
  const l2 = [];

  // Context window bar
  const ctx = d.context_window || d.context || {};
  let ctxPct = ctx.used_percentage;
  if (typeof ctxPct !== 'number' && typeof ctx.current_usage === 'number' && typeof ctx.context_window_size === 'number' && ctx.context_window_size > 0) {
    ctxPct = (ctx.current_usage / ctx.context_window_size) * 100;
  }
  // Also handle total_input_tokens + total_output_tokens / context_window_size
  if (typeof ctxPct !== 'number' && ctx.context_window_size > 0) {
    const totalUsed = (ctx.total_input_tokens || 0) + (ctx.total_output_tokens || 0);
    if (totalUsed > 0) {
      ctxPct = (totalUsed / ctx.context_window_size) * 100;
    }
  }
  if (typeof ctxPct === 'number') {
    const size = ctx.context_window_size
      ? C.slate + '/' + Math.round(ctx.context_window_size / 1000) + 'k' + C.r
      : '';
    l2.push(C.slate + 'CTX' + C.r + ' ' + bar(ctxPct) + ' ' + pctText(ctxPct) + size);
  } else {
    l2.push(C.slate + 'CTX' + C.r + ' ' + bar(0) + ' ' + pctText(0) + C.slate + '/1000k' + C.r);
  }

  // ----- Intelligent quota bars: pick the right buckets for the active model --
  if (d.quota && typeof d.quota === 'object' && !Array.isArray(d.quota)) {
    // AGY sends: { "3p-5h": {...}, "3p-weekly": {...}, "gemini-5h": {...}, "gemini-weekly": {...} }
    // Each bucket: { remaining_fraction: 0..1, reset_time: ISO string, reset_in_seconds: N }
    const prefix = provider; // "gemini" or "3p"
    const fiveHourKey = prefix + '-5h';
    const weeklyKey = prefix + '-weekly';
    const fiveHour = d.quota[fiveHourKey];
    const weekly = d.quota[weeklyKey];

    // Provider badge on the bar label
    const provLabel = provider === '3p' ? C.violet + '3P' + C.r : C.cyan + 'GM' + C.r;

    for (const [shortLabel, bucket] of [['5H', fiveHour], ['WK', weekly]]) {
      if (!bucket) continue;
      let usedPct = 0;
      if (typeof bucket.remaining_fraction === 'number') {
        usedPct = (1 - bucket.remaining_fraction) * 100;
      } else if (typeof bucket.used_percentage === 'number') {
        usedPct = bucket.used_percentage;
      } else if (typeof bucket.used_fraction === 'number') {
        usedPct = bucket.used_fraction * 100;
      }
      const reset = until(bucket.reset_time) || untilSecs(bucket.reset_in_seconds);
      const tail = reset ? ' ' + C.slate + '\󰑐' + reset + C.r : '';
      l2.push(provLabel + C.slate + ' ' + shortLabel + C.r + ' ' + bar(usedPct) + ' ' + pctText(usedPct) + tail);
    }

    // If both provider types have usage, show the other provider's weekly as a dim summary
    const otherPrefix = provider === 'gemini' ? '3p' : 'gemini';
    const otherWeekly = d.quota[otherPrefix + '-weekly'];
    if (otherWeekly && typeof otherWeekly.remaining_fraction === 'number') {
      const otherPct = (1 - otherWeekly.remaining_fraction) * 100;
      if (otherPct > 0.5) {
        const otherLabel = otherPrefix === '3p' ? C.slate + '3P' + C.r : C.slate + 'GM' + C.r;
        const otherReset = until(otherWeekly.reset_time) || untilSecs(otherWeekly.reset_in_seconds);
        const otherTail = otherReset ? ' ' + C.slate + '\󰑐' + otherReset + C.r : '';
        l2.push(otherLabel + C.slate + ' WK' + C.r + ' ' + bar(otherPct) + ' ' + pctText(otherPct) + otherTail);
      }
    }
  }

  const out = [l1.join('  ' + SEP + '  ')];
  if (l2.length) {
    out.push(C.slate + '\u2570' + C.r + ' ' + l2.join('  ' + DOT + '  '));
  }
  return out.join('\n');
}

// --- Entrypoint -------------------------------------------------------------
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (c) => { input += c; });
process.stdin.on('end', () => {
  let parsed = {};
  if (input && input.trim()) {
    try {
      parsed = JSON.parse(input.replace(/^\uFEFF/, ''));
      try {
        fs.writeFileSync('C:/Users/eljon/.gemini/antigravity-cli/last_statusline_input.json', input, 'utf8');
      } catch (e) {}
    } catch (e) {}
  }
  let out;
  try {
    out = render(parsed);
  } catch (e) {
    out = C.mag + '\u30b4\u30b8\u30e9' + C.r;
  }
  process.stdout.write(out);
});
