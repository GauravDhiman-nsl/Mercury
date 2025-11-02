// Mercury/js/custom-chart.js (graph-only: injects SVG paths, handles interactions)
class MercuryChart {
  constructor(containerInput, config = {}) {
    if (typeof containerInput === 'string') {
      this.container = document.querySelector(containerInput);
    } else if (containerInput instanceof HTMLElement) {
      this.container = containerInput;
    } else {
      console.error('Invalid container input');
      return;
    }

    if (!this.container) {
      console.error('Container not found');
      return;
    }

    this.uniqueId = config.id || 'mercury-balance'; // Fixed for static IDs

    this.config = {
      data: [],
      currentBalance: 5097429.63,

      colors: {
        chartLine: '#6366f1',
        areaGradientStart: '#8b5cf6',
        areaGradientOpacityStart: 0.1,
        areaGradientOpacityEnd: 0,
        purpleLine: '#8b5cf6',
        green: '#10b981',
        red: '#ef4444'
      },

      chartWidth: 400,
      chartHeight: 120,
      effectiveChartHeight: 100,
      markerRadiusOuter: 3,
      markerRadiusInner: 1.5,
      strokeWidthLine: 2,
      strokeWidthVLine: 1,

      currencyLocale: 'en-US',
      dateFormat: { month: 'long', day: 'numeric', year: 'numeric' },

      snapToNearestDay: true,

      knownPoints: {
        oct10: { balance: 4491555.41, delta: -102076.3 }
      }
    };

    Object.assign(this.config, config);

    if (this.config.data.length === 0) {
      this.generateSampleData();
    }

    this.initGraph();
  }

  generateSampleData() {
    const baseDate = new Date(2025, 9, 2); // Oct 2
    const numDays = 21; // To Oct 22
    this.config.data = [];
    const startValue = this.config.currentBalance - 1700000; // Total change
    for (let i = 0; i < numDays; i++) {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() + i);
      // Curvy: multi-sine for smooth waves
      const wiggle1 = Math.sin(i * Math.PI / 3) * 20000; // Main wave
      const wiggle2 = Math.sin(i * Math.PI / 1.5 + 1) * 8000; // Secondary curve
      const linear = startValue + (1700000 * i / (numDays - 1));
      this.config.data.push({
        date,
        value: linear + wiggle1 + wiggle2
      });
    }
    // Exact point for Oct 10 (day 8)
    this.config.data[8].value = this.config.knownPoints.oct10.balance;
  }

  initGraph() {
    this.setupSVG();
    this.attachEvents();
    this.updateDisplay(8, true); // Initial on Oct 10
  }

  setupSVG() {
    const svg = this.container.querySelector('#mercury-balance-chart');
    if (!svg) return;

    svg.innerHTML = `
      <defs>
        <linearGradient id="mercury-balance-areaGradient" gradientUnits="userSpaceOnUse" x1="0" y1="120" x2="0" y2="0">
          <stop offset="0" stop-color="#8b5cf6" stop-opacity="0.1"/>
          <stop offset="1" stop-color="#8b5cf6" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="none" />
      <path class="area" id="mercury-balance-area" d="" fill="url(#mercury-balance-areaGradient)" />
      <path id="mercury-balance-line" d="" stroke="#6366f1" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      <line id="mercury-balance-vline" x1="0" y1="120" x2="0" y2="120" stroke="#8b5cf6" stroke-width="1" visibility="hidden" />
      <circle id="mercury-balance-marker-outer" cx="0" cy="0" r="3" fill="white" stroke="#8b5cf6" stroke-width="1" visibility="hidden"/>
      <circle id="mercury-balance-marker-inner" cx="0" cy="0" r="1.5" fill="#8b5cf6" visibility="hidden"/>
      <line class="axis" x1="0" y1="120" x2="400" y2="120" stroke="#e5e7eb" stroke-width="1" />
    `;

    this.renderPaths();
  }

  renderPaths() {
    const { data } = this.config;
    const numDays = data.length;
    const minY = Math.min(...data.map(d => d.value));
    const maxY = Math.max(...data.map(d => d.value));
    const rangeY = maxY - minY || 1;
    const xScale = this.config.chartWidth / (numDays - 1);
    const yScale = this.config.effectiveChartHeight / rangeY;

    this.points = data.map((d, i) => ({
      x: i * xScale,
      y: this.config.chartHeight - ((d.value - minY) * yScale)
    }));

    const lineD = `M ${this.points[0].x} ${this.points[0].y}` + this.points.slice(1).map(p => ` L ${p.x} ${p.y}`).join('');
    const areaD = lineD + ` L ${this.points[numDays - 1].x} 120 L 0 120 Z`;

    const lineEl = document.getElementById('mercury-balance-line');
    const areaEl = document.getElementById('mercury-balance-area');
    if (lineEl) lineEl.setAttribute('d', lineD);
    if (areaEl) areaEl.setAttribute('d', areaD);
  }

  formatChange(num, abbrev = true) {
    const opts = { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2 };
    let str = num.toLocaleString(this.config.currencyLocale, opts);
    if (!abbrev) {
      if (str.match(/\.00$/)) str = str.replace(/\.00$/, '');
      return str;
    }
    const abs = Math.abs(num);
    let val, unit;
    if (abs >= 1000000) {
      val = (abs / 1000000).toFixed(1);
      unit = 'M';
    } else if (abs >= 1000) {
      val = Math.round(abs / 1000);
      unit = 'k';
    } else {
      if (str.match(/\.00$/)) str = str.replace(/\.00$/, '');
      return str;
    }
    const sign = num < 0 ? '-' : '';
    return sign + '$' + val + unit;
  }

  getDateString(date) {
    return date.toLocaleDateString(this.config.currencyLocale, this.config.dateFormat);
  }

  updateDisplay(dayIndex = null, isHover = false) {
    const balanceEl = document.getElementById('mercury-balance-balance');
    const periodText = document.getElementById('mercury-balance-period-text');
    const dateText = document.getElementById('mercury-balance-date-text');
    const defaultChanges = document.getElementById('mercury-balance-default-changes');
    const hoverChange = document.getElementById('mercury-balance-hover-change');
    const totalVal = document.getElementById('mercury-balance-total-val');
    const dailyDefaultVal = document.getElementById('mercury-balance-daily-default-val');
    const hoverArrow = document.getElementById('mercury-balance-hover-arrow');
    const hoverDelta = document.getElementById('mercury-balance-hover-delta');
    const vline = document.getElementById('mercury-balance-vline');
    const markerOuter = document.getElementById('mercury-balance-marker-outer');
    const markerInner = document.getElementById('mercury-balance-marker-inner');

    const { data } = this.config;
    const numDays = data.length;

    if (!isHover) {
      balanceEl.textContent = this.config.currentBalance.toLocaleString(this.config.currencyLocale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      periodText.style.display = 'inline';
      dateText.style.display = 'none';
      defaultChanges.style.display = 'flex';
      hoverChange.style.display = 'none';
      vline.setAttribute('visibility', 'hidden');
      markerOuter.setAttribute('visibility', 'hidden');
      markerInner.setAttribute('visibility', 'hidden');

      const totalD = data[numDays - 1].value - data[0].value;
      const lastD = data[numDays - 1].value - data[numDays - 2].value;
      totalVal.textContent = this.formatChange(totalD, true);
      dailyDefaultVal.textContent = this.formatChange(lastD, true);
    } else {
      const point = this.points[dayIndex];
      const bal = data[dayIndex].value;
      const dateStr = this.getDateString(data[dayIndex].date);
      balanceEl.textContent = bal.toLocaleString(this.config.currencyLocale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      periodText.style.display = 'none';
      dateText.style.display = 'inline';
      dateText.textContent = dateStr;
      defaultChanges.style.display = 'none';
      hoverChange.style.display = 'flex';

      const prevBal = dayIndex === 0 ? bal : data[dayIndex - 1].value;
      const del = bal - prevBal;
      const delStr = this.formatChange(del, false);
      const arrowChar = del > 0 ? '▲' : del < 0 ? '▼' : '';
      const changeClass = del > 0 ? 'positive' : del < 0 ? 'negative' : '';
      hoverArrow.textContent = arrowChar;
      hoverDelta.textContent = delStr;
      hoverChange.className = `change ${changeClass}`;

      vline.setAttribute('x1', point.x);
      vline.setAttribute('x2', point.x);
      vline.setAttribute('y1', 120);
      vline.setAttribute('y2', point.y);
      vline.setAttribute('visibility', 'visible');
      markerOuter.setAttribute('cx', point.x);
      markerOuter.setAttribute('cy', point.y);
      markerOuter.setAttribute('visibility', 'visible');
      markerInner.setAttribute('cx', point.x);
      markerInner.setAttribute('cy', point.y);
      markerInner.setAttribute('visibility', 'visible');
    }
  }

  attachEvents() {
    const svg = document.getElementById('mercury-balance-chart');
    if (!svg) return;
    let hoverTimeout;

    const handleMouseMove = (e) => {
      clearTimeout(hoverTimeout);
      const rect = svg.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const xScale = this.config.chartWidth / (this.config.data.length - 1);
      let dayIndex = Math.floor(mouseX / xScale);
      dayIndex = Math.max(0, Math.min(this.config.data.length - 1, dayIndex));
      this.updateDisplay(dayIndex, true);
    };

    const handleMouseLeave = () => {
      hoverTimeout = setTimeout(() => {
        this.updateDisplay(null, false);
      }, 100);
    };

    svg.addEventListener('mousemove', handleMouseMove, { passive: true });
    svg.addEventListener('mouseleave', handleMouseLeave, { passive: true });
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MercuryChart;
} else {
  window.MercuryChart = MercuryChart;
}