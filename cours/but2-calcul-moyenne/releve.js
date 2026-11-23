// GabouLearn — lecture d'un relevé de notes ScoDoc (PDF généré par ReportLab) directement dans le navigateur.
// Aucune bibliothèque, aucun envoi : le fichier est lu en local (ASCII85 + Flate, texte Helvetica en clair).
(function (root) {
  'use strict';

  // ------------------------------------------------------------------ décodage PDF
  function a85(bytes) {
    const out = [];
    let tup = [], i = 0;
    const s = bytes;
    let start = 0, end = s.length;
    while (start < end && s[start] <= 32) start++;
    if (s[start] === 60 && s[start + 1] === 126) start += 2; // <~
    for (i = start; i < end; i++) {
      const c = s[i];
      if (c <= 32) continue;
      if (c === 126) break; // ~>
      if (c === 122 && !tup.length) { out.push(0, 0, 0, 0); continue; } // z
      tup.push(c - 33);
      if (tup.length === 5) {
        let v = 0; for (const t of tup) v = v * 85 + t;
        out.push((v >>> 24) & 255, (v >>> 16) & 255, (v >>> 8) & 255, v & 255);
        tup = [];
      }
    }
    if (tup.length) {
      const n = tup.length;
      while (tup.length < 5) tup.push(84);
      let v = 0; for (const t of tup) v = v * 85 + t;
      const b = [(v >>> 24) & 255, (v >>> 16) & 255, (v >>> 8) & 255, v & 255];
      out.push(...b.slice(0, n - 1));
    }
    return new Uint8Array(out);
  }
  async function inflate(bytes) {
    const ds = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate'));
    return new Uint8Array(await new Response(ds).arrayBuffer());
  }
  const W1252 = new TextDecoder('windows-1252');

  async function contentStreams(buf) {
    const u8 = new Uint8Array(buf);
    const txt = new TextDecoder('latin1').decode(u8);
    const out = [];
    const re = /<<((?:(?!>>)[\s\S])*?)>>\s*stream\r?\n/g;
    let m;
    while ((m = re.exec(txt))) {
      const dict = m[1];
      const startS = re.lastIndex;
      const endS = txt.indexOf('endstream', startS);
      if (endS < 0) break;
      re.lastIndex = endS;
      if (/Image|DCTDecode|FontFile/.test(dict)) continue;
      let data = u8.slice(startS, endS);
      try {
        if (/ASCII85Decode/.test(dict)) data = a85(data);
        if (/FlateDecode/.test(dict)) data = await inflate(data);
      } catch { continue; }
      out.push(data);
    }
    return out;
  }

  // ------------------------------------------------------------------ texte positionné
  function cells(stream, page) {
    const s = new TextDecoder('latin1').decode(stream);
    const res = [];
    let i = 0;
    const stack = [];
    let tx = 0, ty = 0;
    let nums = [];
    let inBT = false, bx = 0, by = 0, parts = [], lineDy = 0;
    const flush = () => { if (parts.length) res.push({ page, x: bx, y: by, text: parts.join(' ').replace(/\s+/g, ' ').trim() }); parts = []; };
    while (i < s.length) {
      const c = s[i];
      if (c === '(') { // chaîne littérale
        let depth = 1, j = i + 1; const bytes = [];
        while (j < s.length && depth) {
          const ch = s[j];
          if (ch === '\\') {
            const n = s[j + 1];
            if (/[0-7]/.test(n)) { let o = n; let k = j + 2; while (k < j + 4 && /[0-7]/.test(s[k])) o += s[k++]; bytes.push(parseInt(o, 8)); j = k; continue; }
            const map = { n: 10, r: 13, t: 9, b: 8, f: 12 };
            bytes.push(map[n] != null ? map[n] : n.charCodeAt(0)); j += 2; continue;
          }
          if (ch === '(') depth++;
          if (ch === ')') { depth--; if (!depth) break; }
          bytes.push(ch.charCodeAt(0)); j++;
        }
        nums.push({ str: W1252.decode(new Uint8Array(bytes)) });
        i = j + 1; continue;
      }
      if (/\s/.test(c)) { i++; continue; }
      if (c === '[' || c === ']') { nums.push(c); i++; continue; }
      let j = i; while (j < s.length && !/[\s()\[\]<>/]/.test(s[j])) j++;
      if (c === '/' ) { j = i + 1; while (j < s.length && !/[\s()\[\]<>/]/.test(s[j])) j++; nums.push(s.slice(i, j)); i = j; continue; }
      if (j === i) { i++; continue; }
      const tok = s.slice(i, j); i = j;
      if (/^[-+.\d]/.test(tok)) { nums.push(parseFloat(tok)); continue; }
      const n = nums.filter((x) => typeof x === 'number');
      switch (tok) {
        case 'q': stack.push([tx, ty]); break;
        case 'Q': if (stack.length) [tx, ty] = stack.pop(); break;
        case 'cm': if (n.length >= 6) { tx += n[n.length - 2]; ty += n[n.length - 1]; } break;
        case 'BT': inBT = true; bx = tx; by = ty; parts = []; lineDy = 0; break;
        case 'Tm': if (n.length >= 6) { bx = tx + n[n.length - 2]; by = ty + n[n.length - 1]; } break;
        case 'Td': case 'TD': if (n.length >= 2) { bx += 0; } break;
        case 'Tj': case "'": case '"': { const str = nums.filter((x) => x && x.str != null).map((x) => x.str).join(''); if (inBT) parts.push(str); break; }
        case 'TJ': { const str = nums.filter((x) => x && x.str != null).map((x) => x.str).join(''); if (inBT) parts.push(str); break; }
        case 'ET': inBT = false; flush(); break;
        default: break;
      }
      nums = [];
    }
    return res;
  }

  function rows(allCells) {
    const out = [];
    const byPage = {};
    allCells.forEach((c) => (byPage[c.page] = byPage[c.page] || []).push(c));
    for (const p of Object.keys(byPage).map(Number).sort((a, b) => a - b)) {
      const cs = byPage[p].filter((c) => c.text).sort((a, b) => b.y - a.y || a.x - b.x);
      let cur = null;
      for (const c of cs) {
        if (cur && Math.abs(cur.y - c.y) <= 7) cur.cells.push(c);
        else { cur = { page: p, y: c.y, cells: [c] }; out.push(cur); }
      }
    }
    out.forEach((r) => r.cells.sort((a, b) => a.x - b.x));
    return out;
  }

  // ------------------------------------------------------------------ interprétation du relevé
  const num = (t) => { const x = parseFloat(String(t).replace(',', '.')); return Number.isFinite(x) ? x : null; };
  function interpret(rws) {
    const lines = rws.map((r) => r.cells.map((c) => c.text));
    const flat = lines.map((l) => l.join(' | '));
    const R = { formation: null, semestre: null, regime: null, parcours: null, annee: null, ues: [], details: [] };
    for (const l of flat) {
      let m;
      if ((m = l.match(/Formation:\s*([^|]+)/))) {
        R.formation = m[1].trim();
        const s = R.formation.match(/semestre\s*(\d)/i); if (s) R.semestre = +s[1];
        R.regime = /\bFA\b|altern/i.test(R.formation) ? 'FA' : 'FI';
      }
      if ((m = l.match(/Ann[ée]e scolaire:\s*([\d -]+)/))) R.annee = m[1].trim();
    }
    // blocs d'UE : une ligne « UEx.y… note », suivie d'une ligne « Rang: r / n min moy max ECTS: a / b »
    let ue = null;
    let section = 'ue';
    for (let i = 0; i < lines.length; i++) {
      const cells = lines[i];
      const line = cells.join(' ');
      if (/^Ressources\b/.test(line) || /^Situations d'apprentissage/.test(line)) { section = 'detail'; ue = null; continue; }
      if (section === 'ue') {
        const um = line.match(/^(UE\s?\d\.\d[A-Z]?)\s+([^-]+?)\s+-/);
        if (um) {
          const last = num(cells[cells.length - 1]);
          ue = { code: um[1].replace(/\s/g, ''), name: um[2].trim(), note: last, rang: null, n: null, min: null, moy: null, max: null, ects: null, items: [] };
          R.ues.push(ue);
          if (!R.parcours) { const pm = ue.code.match(/\d\.\d([A-Z])$/); if (pm) R.parcours = pm[1]; }
          continue;
        }
        if (ue && /^Rang/.test(line)) {
          const rm = line.match(/Rang:\s*(\d+)\s*\/\s*(\d+)/);
          if (rm) { ue.rang = +rm[1]; ue.n = +rm[2]; }
          const nums = line.replace(/Rang:\s*\d+\s*\/\s*\d+/, '').replace(/ECTS:.*$/, '').match(/\d+[.,]\d+/g) || [];
          [ue.min, ue.moy, ue.max] = nums.slice(0, 3).map(num);
          const em = line.match(/ECTS:\s*([\d.]+)\s*\/\s*([\d.]+)/); if (em) ue.ects = num(em[2]);
          continue;
        }
        if (ue && cells.length >= 2) {
          // « R3.01 R3.01 Développement Web | 10.0 | 13.34 » ou « S3.B.1 SAE3.B.01 Serv appli | 20.0 | ~ »
          const coef = num(cells[cells.length - 2]);
          const noteTxt = cells[cells.length - 1].trim();
          const label = cells.slice(0, -2).join(' ').trim();
          if (coef != null && label && !/^Unit|^Promotion|^Coef/.test(label)) {
            const code = label.split(/\s+/)[0];
            const nm = label.replace(/^\S+\s+/, '').replace(new RegExp('^' + code.replace('.', '\\.') + '\\s+'), '');
            ue.items.push({ code, label: nm, coef, note: noteTxt === '~' || noteTxt === '' ? null : /^ABS/i.test(noteTxt) ? 0 : num(noteTxt) });
          }
        }
      }
    }
    return R;
  }

  async function parse(buf) {
    const streams = await contentStreams(buf);
    const all = [];
    streams.forEach((st, p) => all.push(...cells(st, p)));
    const rw = rows(all);
    return Object.assign(interpret(rw), { _rows: rw.map((r) => r.cells.map((c) => c.text)) });
  }

  // ------------------------------------------------------------------ calculs
  function recompute(R) {
    R.ues.forEach((u) => {
      const done = u.items.filter((it) => it.note != null);
      const w = done.reduce((a, it) => a + it.coef, 0);
      u.calc = w ? done.reduce((a, it) => a + it.note * it.coef, 0) / w : null;
      u.coefDone = w; u.coefTot = u.items.reduce((a, it) => a + it.coef, 0);
    });
    const ok = R.ues.filter((u) => u.note != null && u.ects);
    const we = ok.reduce((a, u) => a + u.ects, 0);
    R.moyenne = we ? ok.reduce((a, u) => a + u.note * u.ects, 0) / we : null;
    R.ectsTot = we;
    return R;
  }

  // inverse de la loi normale (Acklam) et répartition
  function qnorm(p) {
    const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
    const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
    const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
    const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
    const pl = 0.02425;
    if (p < pl) { const q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    if (p > 1 - pl) { const q = Math.sqrt(-2 * Math.log(1 - p)); return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    const q = p - 0.5, r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  }
  function pnorm(z) { // Abramowitz-Stegun 7.1.26
    const t = 1 / (1 + 0.3275911 * Math.abs(z) / Math.SQRT2);
    const e = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-z * z / 2);
    return z >= 0 ? (1 + e) / 2 : (1 - e) / 2;
  }

  // Estimation du rang au semestre : chaque UE ~ loi normale (moyenne promo, écart-type déduit du rang),
  // UE corrélées (elles partagent ressources, SAÉ et alternance), moyenne du semestre pondérée par les ECTS.
  function estimateRank(R, rho) {
    const us = R.ues.filter((u) => u.note != null && u.rang && u.n && u.moy != null && u.ects);
    if (!us.length) return null;
    const n = Math.max(...us.map((u) => u.n));
    const W = us.reduce((a, u) => a + u.ects, 0);
    const sd = us.map((u) => {
      const p = Math.min(Math.max((u.rang - 0.5) / u.n, 0.5 / u.n), 1 - 0.5 / u.n);
      const z = qnorm(1 - p);
      let s = Math.abs(z) > 0.25 ? (u.note - u.moy) / z : null;
      const zTop = qnorm(1 - 1 / (u.n + 1));
      const sRange = u.max != null && u.max > u.moy ? (u.max - u.moy) / zTop : null;
      if (!(s > 0)) s = sRange;
      if (s && sRange) s = Math.min(Math.max(s, sRange * 0.5), sRange * 2);
      return s || 2;
    });
    const w = us.map((u) => u.ects / W);
    const mean = us.reduce((a, u, i) => a + w[i] * u.moy, 0);
    const x = us.reduce((a, u, i) => a + w[i] * u.note, 0);
    let v = 0;
    for (let i = 0; i < us.length; i++) for (let j = 0; j < us.length; j++) v += w[i] * w[j] * sd[i] * sd[j] * (i === j ? 1 : rho);
    const z = (x - mean) / Math.sqrt(v);
    const rank = Math.min(n, Math.max(1, Math.round(n * (1 - pnorm(z)) + 0.5)));
    return { rank, n, mean, x };
  }

  function estimate(R) {
    const mid = estimateRank(R, 0.75);
    if (!mid) return null;
    if (mid.n < 15) { // petit groupe (souvent FA) : le modèle n'a pas de sens, on garde le rang moyen des UE
      const us0 = R.ues.filter((u) => u.rang && u.n && u.ects);
      const W0 = us0.reduce((a, u) => a + u.ects, 0);
      const avg0 = us0.reduce((a, u) => a + u.rang * u.ects, 0) / W0;
      return { small: true, rank: Math.round(avg0), n: mid.n, from: Math.min(...us0.map((u) => u.rang)), to: Math.max(...us0.map((u) => u.rang)), avgRank: avg0, promoMean: mid.mean };
    }
    const lo = estimateRank(R, 0.95), hi = estimateRank(R, 0.5);
    const us = R.ues.filter((u) => u.rang && u.n && u.ects);
    const W = us.reduce((a, u) => a + u.ects, 0);
    const avgRank = us.reduce((a, u) => a + u.rang * u.ects, 0) / W;
    return { rank: mid.rank, n: mid.n, from: Math.min(lo.rank, hi.rank), to: Math.max(lo.rank, hi.rank), avgRank, promoMean: mid.mean, best: Math.min(...us.map((u) => u.rang)), worst: Math.max(...us.map((u) => u.rang)) };
  }

  const api = { parse, recompute, estimate };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Releve = api;
})(typeof window !== 'undefined' ? window : globalThis);
