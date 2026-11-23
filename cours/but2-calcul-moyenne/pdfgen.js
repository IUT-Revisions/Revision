// GabouLearn — mini générateur PDF (A4, Helvetica / Helvetica-Bold, rectangles, traits), sans bibliothèque.
// Le PDF est fabriqué dans le navigateur puis proposé au téléchargement.
(function (root) {
  'use strict';
  // largeurs Helvetica (AFM, 1/1000 em) pour les caractères 32 à 126
  const WD = [278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556, 1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556, 333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584];
  // encodage WinAnsi (windows-1252)
  const ENC = (() => {
    const m = new Map(); const dec = new TextDecoder('windows-1252');
    for (let b = 32; b < 256; b++) { const c = dec.decode(new Uint8Array([b])); if (c && c !== '�') m.set(c, b); }
    return m;
  })();
  const SUB = { '≈': '~', '→': '->', '←': '<-', '✓': 'v', '✗': 'x', '−': '-', '×': 'x', '≥': '>=', '≤': '<=', ' ': ' ', ' ': ' ' };
  const toAnsi = (s) => [...String(s)].map((c) => (ENC.has(c) ? c : SUB[c] ?? (c.normalize('NFD')[0] && ENC.has(c.normalize('NFD')[0]) ? c.normalize('NFD')[0] : ''))).join('');
  const width = (s, size, bold) => {
    let w = 0;
    for (const c of toAnsi(s)) { const code = c.charCodeAt(0); const base = code >= 32 && code <= 126 ? WD[code - 32] : (c.normalize('NFD')[0].charCodeAt(0) <= 126 ? WD[Math.max(0, c.normalize('NFD')[0].charCodeAt(0) - 32)] : 556); w += base; }
    return (w / 1000) * size * (bold ? 1.06 : 1);
  };
  const esc = (s) => toAnsi(s).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  const n = (x) => (Math.round(x * 100) / 100).toString();
  const rgb = (c) => c.map(n).join(' ');

  function create(info) {
    const pages = [[]];
    const cur = () => pages[pages.length - 1];
    return {
      page() { pages.push([]); },
      rect(x, y, w, h, color) { cur().push(`${rgb(color)} rg ${n(x)} ${n(y)} ${n(w)} ${n(h)} re f`); },
      line(x1, y1, x2, y2, color, lw = 0.7) { cur().push(`${rgb(color)} RG ${n(lw)} w ${n(x1)} ${n(y1)} m ${n(x2)} ${n(y2)} l S`); },
      text(x, y, s, o = {}) {
        const size = o.size || 10;
        let xx = x;
        if (o.align === 'right') xx = x - width(s, size, o.bold);
        cur().push(`BT /${o.bold ? 'F2' : 'F1'} ${n(size)} Tf ${rgb(o.color || [0.11, 0.14, 0.2])} rg ${n(xx)} ${n(y)} Td (${esc(s)}) Tj ET`);
      },
      wrap(s, maxW, size, bold) {
        const out = [];
        for (const para of String(s).split(/\r?\n/)) {
          let line = '';
          for (const word of para.split(/\s+/)) {
            const t = line ? line + ' ' + word : word;
            if (width(t, size, bold) > maxW && line) { out.push(line); line = word; } else line = t;
          }
          out.push(line);
        }
        return out;
      },
      bytes() {
        const objs = [];
        const add = (s) => { objs.push(s); return objs.length; };
        const catalog = add(null), pagesId = add(null);
        const f1 = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
        const f2 = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
        const kids = [];
        for (const ops of pages) {
          const content = ops.join('\n');
          const cId = add(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
          kids.push(add(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 ${f1} 0 R /F2 ${f2} 0 R >> >> /Contents ${cId} 0 R >>`));
        }
        objs[catalog - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
        objs[pagesId - 1] = `<< /Type /Pages /Kids [${kids.map((k) => `${k} 0 R`).join(' ')}] /Count ${kids.length} >>`;
        const d = new Date(); const pd = `D:${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
        const infoId = add(`<< /Title (${esc(info.title || 'GabouLearn')}) /Author (${esc(info.author || 'GabouLearn')}) /Creator (GabouLearn - gaboulearn.fr) /Producer (GabouLearn) /CreationDate (${pd}) >>`);
        let out = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
        const offs = [];
        objs.forEach((o, i) => { offs.push(out.length); out += `${i + 1} 0 obj\n${o}\nendobj\n`; });
        const xref = out.length;
        out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offs.map((o) => String(o).padStart(10, '0') + ' 00000 n \n').join('')}`;
        out += `trailer\n<< /Size ${objs.length + 1} /Root ${catalog} 0 R /Info ${infoId} 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
        const b = new Uint8Array(out.length);
        for (let i = 0; i < out.length; i++) b[i] = ENC.has(out[i]) ? ENC.get(out[i]) : out.charCodeAt(i) & 255;
        return b;
      },
      download(name) {
        const url = URL.createObjectURL(new Blob([this.bytes()], { type: 'application/pdf' }));
        const a = document.createElement('a'); a.href = url; a.download = name; document.body.append(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
      },
    };
  }

  // « sceau » GabouLearn : empreinte SHA-256 du contenu du plan (permet de voir si un plan a été retouché)
  async function seal(payload) {
    try {
      const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('GabouLearn|' + payload));
      const hex = [...new Uint8Array(d)].slice(0, 6).map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
      return `GL-${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 12)}`;
    } catch { return 'GL-' + Date.now().toString(36).toUpperCase(); }
  }

  const api = { create, seal, width };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GabouPDF = api;
})(typeof window !== 'undefined' ? window : globalThis);
