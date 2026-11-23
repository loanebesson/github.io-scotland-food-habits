// Interactive chart with Chart.js 4. Data comes from data.js (YEARS, PRODUCTS).
//
// Level 1: three different interactions on the chart itself
//   1. Hover      -> tooltip with the year and the value (options.plugins.tooltip)
//   2. Click point -> the point is highlighted and its details are shown (options.onClick)
//   3. Click legend -> show or hide the trend line (legend + dataset "hidden")
// Level 2: interactions from outside the chart
//   - the product buttons and the start-year slider (they change the data)
//   - the day / night button (it changes the chart colours)
//   - the back-to-top arrow (page navigation)
// The line is also drawn point by point (options.animation).

const buttonsBox = document.getElementById('product-buttons');
const slider = document.getElementById('start-year');
const sliderOutput = document.getElementById('start-year-output');
const summary = document.getElementById('chart-summary');
const detail = document.getElementById('chart-detail');
const note = document.getElementById('chart-note');
const canvas = document.getElementById('product-chart');

const DEFAULT_DETAIL = 'Click a point on the line for details.';
const state = { product: 'fruit', start: 0, selected: null, theme: 'light' };
const themeButton = document.getElementById('theme-toggle');
const topButton = document.getElementById('back-to-top');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let chart;

// Data for the displayed period.
function currentSeries() {
  const product = PRODUCTS[state.product];
  const values = product.values.slice(state.start);
  return { product, labels: YEARS.slice(state.start), values, trend: trendLine(values) };
}

// Least-squares trend line, drawn only where data exists.
function trendLine(values) {
  const points = values.map((v, i) => [i, v]).filter(([, v]) => v !== null);
  const n = points.length;
  const sx = points.reduce((s, [x]) => s + x, 0);
  const sy = points.reduce((s, [, y]) => s + y, 0);
  const sxy = points.reduce((s, [x, y]) => s + x * y, 0);
  const sxx = points.reduce((s, [x]) => s + x * x, 0);
  const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx);
  const intercept = (sy - slope * sx) / n;
  return values.map((_, i) => (i < points[0][0] ? null : Math.round((intercept + slope * i) * 10) / 10));
}

// Small plugin: writes the first and the last value on the line.
const endLabels = {
  id: 'endLabels',
  afterDatasetsDraw(c) {
    if (!c.isDatasetVisible(0)) return;
    const data = c.data.datasets[0].data;
    const points = c.getDatasetMeta(0).data;
    const first = data.findIndex((v) => v !== null);
    const last = data.length - 1;
    const { ctx } = c;
    ctx.save();
    ctx.font = 'bold 13px sans-serif';
    ctx.fillStyle = c.data.datasets[0].borderColor;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillText(`${data[first]}p`, points[first].x, points[first].y - 16);
    if (first !== last) {
      ctx.textAlign = 'left';
      ctx.fillText(`${data[last]}p`, points[last].x + 10, points[last].y);
    }
    ctx.restore();
  },
};

// Reading key under the chart (first and last known values).
function updateSummary({ product, labels, values }) {
  const known = values.map((v, i) => ({ v, year: labels[i] })).filter((p) => p.v !== null);
  const first = known[0];
  const last = known[known.length - 1];
  const change = Math.round((last.v / first.v - 1) * 100);
  const sign = change >= 0 ? '+' : '';
  summary.textContent = `${product.label}: from ${first.v}p in ${first.year} to ${last.v}p in ${last.year} (${sign}${change}% in cash terms).`;
  note.textContent = product.note || '';
}

function createChart() {
  const { product, labels, values, trend } = currentSeries();
  chart = new Chart(canvas, {
    type: 'line',
    plugins: [endLabels],
    data: {
      labels,
      datasets: [
        {
          label: product.label,
          data: values,
          borderColor: lineColor(product),
          backgroundColor: lineColor(product),
          borderWidth: 3,
          tension: 0.2,
          pointHoverRadius: 8,
          // Interaction 2: the clicked point is bigger and red.
          pointRadius: (c) => (c.dataIndex === state.selected ? 9 : 3),
          pointBackgroundColor: (c) => (c.dataIndex === state.selected ? '#b03a2e' : c.dataset.borderColor),
        },
        {
          label: 'Trend line', // Interaction 3: click on it in the legend to show or hide it
          data: trend,
          borderColor: '#7f7f7f',
          borderDash: [6, 4],
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 0,
          hidden: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { right: 36, top: 8 } },
      interaction: { mode: 'index', intersect: false },
      // The line appears point by point (disabled if the visitor prefers reduced motion).
      animation: reduceMotion ? false : {
        duration: 600,
        delay: (c) => (c.type === 'data' && c.mode === 'default' ? c.dataIndex * 35 : 0),
      },
      plugins: {
        title: { display: true, text: product.title, align: 'start', font: { size: 16, weight: 'bold' }, color: '#1b2a41' },
        legend: { position: 'bottom', labels: { usePointStyle: true } },
        tooltip: { // Interaction 1: hover
          callbacks: {
            title: (items) => items[0].label,
            label: (c) => `${c.dataset.label}: ${c.parsed.y}p per person per week`,
          },
        },
      },
      scales: {
        y: { beginAtZero: true, grid: {}, title: { display: true, text: 'Pence per person per week' } },
        x: { grid: {}, ticks: { maxRotation: 50 } },
      },
      onClick: (event, _elements, c) => { // Interaction 2: click on a point
        const hit = c.getElementsAtEventForMode(event, 'index', { intersect: false }, true)
          .find((e) => e.datasetIndex === 0);
        const data = c.data.datasets[0].data;
        if (!hit || data[hit.index] === null) return;
        const previous = data[hit.index - 1];
        const change = previous ? ` (${data[hit.index] >= previous ? '+' : ''}${Math.round((data[hit.index] / previous - 1) * 100)}% on the previous year)` : '';
        state.selected = hit.index;
        detail.textContent = `${c.data.labels[hit.index]}: ${data[hit.index]}p per person per week${change}.`;
        c.update('none');
      },
    },
  });
  updateSummary({ product, labels, values });
}

// Refresh the chart after an outside control changes the state.
function updateChart() {
  const series = currentSeries();
  const [main, trend] = chart.data.datasets;
  chart.data.labels = series.labels;
  main.label = series.product.label;
  main.data = series.values;
  main.borderColor = lineColor(series.product);
  main.backgroundColor = lineColor(series.product);
  trend.data = series.trend;
  chart.options.plugins.title.text = series.product.title;
  state.selected = null;
  detail.textContent = DEFAULT_DETAIL;
  canvas.setAttribute('aria-label', `Line chart: ${series.product.title}`);
  chart.update();
  updateSummary(series);
}

// External control 1: product buttons.
Object.entries(PRODUCTS).forEach(([key, product]) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = product.label;
  button.setAttribute('aria-pressed', key === state.product);
  button.addEventListener('click', () => {
    state.product = key;
    buttonsBox.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', b === button));
    updateChart();
  });
  buttonsBox.appendChild(button);
});

// External control 2: start-year slider.
slider.addEventListener('input', () => {
  state.start = Number(slider.value);
  sliderOutput.textContent = YEARS[state.start];
  updateChart();
});

// External control 3: day / night button. It changes the page colours and the chart colours.
function lineColor(product) {
  return state.theme === 'dark' ? product.colorDark : product.color;
}

function applyChartTheme() {
  const night = state.theme === 'dark';
  const text = night ? '#e8e6e1' : '#1b2a41';
  const grid = night ? '#3a4558' : '#d9d6cf';
  // Global defaults: axis labels, axis title, grid lines.
  Chart.defaults.color = text;
  Chart.defaults.borderColor = grid;
  // Options created with an explicit colour.
  chart.options.plugins.title.color = text;
  chart.options.plugins.legend.labels.color = text;
  const main = chart.data.datasets[0];
  main.borderColor = lineColor(PRODUCTS[state.product]);
  main.backgroundColor = main.borderColor;
  chart.update('none');
}

function applyTheme(theme) {
  state.theme = theme;
  const night = theme === 'dark';
  document.documentElement.dataset.theme = theme;
  if (themeButton) {
    themeButton.setAttribute('aria-pressed', night);
    themeButton.setAttribute('aria-label', night ? 'Switch to day mode' : 'Switch to night mode');
    themeButton.textContent = night ? '\u2600' : '\u263E';
  }
  try { localStorage.setItem('theme', theme); } catch (e) { /* storage not available */ }
  if (chart) applyChartTheme();
}

themeButton?.addEventListener('click', () => applyTheme(state.theme === 'dark' ? 'light' : 'dark'));

// External control 4: back-to-top arrow, shown after scrolling down.
window.addEventListener('scroll', () => { if (topButton) topButton.hidden = window.scrollY < 400; });
topButton?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
});

// Start: saved choice, otherwise the visitor's system preference.
let savedTheme = null;
try { savedTheme = localStorage.getItem('theme'); } catch (e) { /* storage not available */ }
state.theme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
createChart();
applyTheme(state.theme);
if (topButton) topButton.hidden = window.scrollY < 400;
