/* charts.js */
(function () {
  'use strict';
  const SR = window.SpellRight = window.SpellRight || {};

  const VW = 500, VH = 130;
  const PAD = { top:12, right:10, bottom:28, left:32 };
  const PW  = VW - PAD.left - PAD.right;
  const PH  = VH - PAD.top  - PAD.bottom;

  function mapY(v, max) { return max === 0 ? PAD.top + PH : PAD.top + PH - (v / max) * PH; }
  function mapX(i, n)   { return n <= 1 ? PAD.left + PW / 2 : PAD.left + (i / (n - 1)) * PW; }

  function gridLines(max) {
    return [0, 0.5, 1].map((f) => {
      const y = PAD.top + PH - f * PH;
      return `<line x1="${PAD.left}" y1="${y.toFixed(1)}" x2="${VW - PAD.right}" y2="${y.toFixed(1)}"
          stroke="var(--border-subtle)" stroke-width="1" stroke-dasharray="4 3"/>
        <text class="chart-axis-label" x="${(PAD.left - 5).toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="end">${Math.round(f * max)}</text>`;
    }).join('');
  }

  SR.Charts = {
    line(container, values, opts) {
      opts = opts || {};
      if (!values || values.length === 0) {
        container.innerHTML = '<div class="chart-empty">No data yet — start practising!</div>'; return;
      }
      const n = values.length, max = opts.maxY || Math.max.apply(null, values.concat(1));
      const labels = opts.labels || values.map((_, i) => String(i + 1));
      const pts = values.map((v, i) => [mapX(i, n), mapY(v, max)]);
      const linePath = pts.map(([x, y], i) => (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1)).join(' ');
      const areaPath = linePath
        + ' L' + pts[pts.length-1][0].toFixed(1) + ',' + (PAD.top + PH).toFixed(1)
        + ' L' + pts[0][0].toFixed(1) + ',' + (PAD.top + PH).toFixed(1) + ' Z';
      const step = n > 7 ? Math.ceil(n / 7) : 1;
      const xlabels = labels.map((lbl, i) => {
        if (i % step !== 0 && i !== n - 1) return '';
        return `<text class="chart-axis-label" x="${mapX(i,n).toFixed(1)}" y="${(VH-4).toFixed(1)}" text-anchor="middle">${lbl}</text>`;
      }).join('');
      const dots = n <= 14 ? pts.map(([x,y]) =>
        `<circle class="chart-dot" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.5"/>`).join('') : '';
      container.innerHTML = `<svg viewBox="0 0 ${VW} ${VH}" xmlns="http://www.w3.org/2000/svg" class="chart-svg">
        ${gridLines(max)}<path class="chart-area" d="${areaPath}"/>
        <path class="chart-line" d="${linePath}"/>${dots}${xlabels}</svg>`;
    },

    bar(container, data) {
      if (!data || data.length === 0) {
        container.innerHTML = '<div class="chart-empty">No data yet — start practising!</div>'; return;
      }
      const n = data.length, max = Math.max.apply(null, data.map((d) => d.value).concat(1));
      const barW = Math.max(4, (PW / n) - 4);
      const xOff = (PW / n - barW) / 2;
      const bars = data.map((d, i) => {
        const bh = Math.max(0, (d.value / max) * PH);
        const bx = PAD.left + (i / n) * PW + xOff;
        const by = PAD.top + PH - bh;
        return `<rect class="chart-bar" x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${barW.toFixed(1)}" height="${bh.toFixed(1)}" rx="3"/>`;
      }).join('');
      const step = n > 7 ? Math.ceil(n / 7) : 1;
      const xlabels = data.map((d, i) => {
        if (i % step !== 0 && i !== n - 1) return '';
        const x = PAD.left + (i / n) * PW + (PW / n) / 2;
        return `<text class="chart-axis-label" x="${x.toFixed(1)}" y="${(VH-4).toFixed(1)}" text-anchor="middle">${d.label}</text>`;
      }).join('');
      container.innerHTML = `<svg viewBox="0 0 ${VW} ${VH}" xmlns="http://www.w3.org/2000/svg" class="chart-svg">
        ${gridLines(max)}${bars}${xlabels}</svg>`;
    },
  };
})();
