(function() {
  const heightInput = document.getElementById('height');
  const heightInInput = document.getElementById('heightIn');
  const heightInchesRow = document.getElementById('heightInchesRow');
  const weightInput = document.getElementById('weight');
  const heightUnitSwitch = document.getElementById('heightUnitSwitch');
  const weightUnitSwitch = document.getElementById('weightUnitSwitch');
  const bmiNumberEl = document.getElementById('bmiNumber');
  const bmiCategoryEl = document.getElementById('bmiCategory');
  const themeToggle = document.getElementById('themeToggle');

  let heightUnit = 'cm';
  let weightUnit = 'kg';

  const RULER_MIN = 14, RULER_MAX = 40;
  const SVG_LEFT = 14, SVG_RIGHT = 386;

  function xForBmi(b) {
    const clamped = Math.min(Math.max(b, RULER_MIN), RULER_MAX);
    const t = (clamped - RULER_MIN) / (RULER_MAX - RULER_MIN);
    return SVG_LEFT + t * (SVG_RIGHT - SVG_LEFT);
  }

  function setupBands() {
    const bands = [
      { id: 'bandUnder', from: RULER_MIN, to: 18.5 },
      { id: 'bandHealthy', from: 18.5, to: 25 },
      { id: 'bandOver', from: 25, to: 30 },
      { id: 'bandObese', from: 30, to: RULER_MAX }
    ];
    bands.forEach(b => {
      const el = document.getElementById(b.id);
      const x1 = xForBmi(b.from);
      const x2 = xForBmi(b.to);
      el.setAttribute('x', x1);
      el.setAttribute('width', Math.max(x2 - x1, 0));
    });

    const ticksG = document.getElementById('ticks');
    ticksG.innerHTML = '';
    [15, 18.5, 25, 30, 35, 40].forEach(v => {
      const x = xForBmi(v);
      const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      tick.setAttribute('x1', x); tick.setAttribute('x2', x);
      tick.setAttribute('y1', 24); tick.setAttribute('y2', 30);
      tick.setAttribute('stroke', 'var(--ink-soft)');
      tick.setAttribute('stroke-width', '1');
      ticksG.appendChild(tick);

      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', x); label.setAttribute('y', 42);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('class', 'tick-label');
      label.textContent = v;
      ticksG.appendChild(label);
    });
  }

  function category(bmi) {
    if (bmi < 18.5) return { name: 'Underweight', range: 'Below 18.5', color: 'var(--zone-under)' };
    if (bmi < 25) return { name: 'Healthy range', range: '18.5 – 24.9', color: 'var(--zone-healthy)' };
    if (bmi < 30) return { name: 'Overweight', range: '25 – 29.9', color: 'var(--zone-over)' };
    return { name: 'Obesity range', range: '30 and above', color: 'var(--zone-obese)' };
  }

  function getHeightMeters() {
    if (heightUnit === 'cm') {
      const cm = parseFloat(heightInput.value) || 0;
      return cm / 100;
    } else {
      const ft = parseFloat(heightInput.value) || 0;
      const inch = parseFloat(heightInInput.value) || 0;
      const totalInches = ft * 12 + inch;
      return totalInches * 0.0254;
    }
  }

  function getWeightKg() {
    const w = parseFloat(weightInput.value) || 0;
    return weightUnit === 'kg' ? w : w * 0.453592;
  }

  function render() {
    const h = getHeightMeters();
    const w = getWeightKg();
    let bmi = 0;
    if (h > 0 && w > 0) bmi = w / (h * h);

    const display = bmi > 0 ? bmi.toFixed(1) : '—';
    bmiNumberEl.textContent = display;

    if (bmi > 0) {
      const cat = category(bmi);
      bmiCategoryEl.innerHTML = '<strong>' + cat.name + '</strong>' + cat.range;
      bmiNumberEl.style.color = cat.color;

      const x = xForBmi(bmi);
      document.getElementById('pin').setAttribute('transform', 'translate(' + x + ',14)');
      document.getElementById('pinText').textContent = display;
      document.getElementById('pin').style.opacity = 1;
    } else {
      bmiCategoryEl.innerHTML = '<strong>Enter your details</strong>to see where you land';
      document.getElementById('pin').style.opacity = 0.15;
    }
  }

  function switchUnit(group, unit, buttons) {
    buttons.forEach(b => b.classList.toggle('active', b.dataset.unit === unit));
  }

  heightUnitSwitch.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      const newUnit = btn.dataset.unit;
      if (newUnit === heightUnit) return;
      // convert existing value
      const currentM = getHeightMeters();
      heightUnit = newUnit;
      switchUnit('height', newUnit, heightUnitSwitch.querySelectorAll('button'));
      if (newUnit === 'ft') {
        heightInchesRow.classList.remove('hidden');
        const totalInches = currentM / 0.0254;
        heightInput.value = Math.floor(totalInches / 12);
        heightInInput.value = Math.round(totalInches % 12);
      } else {
        heightInchesRow.classList.add('hidden');
        heightInput.value = Math.round(currentM * 100);
      }
      render();
    });
  });

  weightUnitSwitch.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      const newUnit = btn.dataset.unit;
      if (newUnit === weightUnit) return;
      const currentKg = getWeightKg();
      weightUnit = newUnit;
      switchUnit('weight', newUnit, weightUnitSwitch.querySelectorAll('button'));
      weightInput.value = newUnit === 'kg' ? Math.round(currentKg * 10) / 10 : Math.round(currentKg / 0.453592 * 10) / 10;
      render();
    });
  });

  [heightInput, heightInInput, weightInput].forEach(el => {
    el.addEventListener('input', render);
  });

  // theme toggle (local to this session only)
  let dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  function applyTheme() {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    themeToggle.textContent = dark ? 'light' : 'dark';
  }
  themeToggle.addEventListener('click', () => { dark = !dark; applyTheme(); });
  applyTheme();

  setupBands();
  render();
  window.addEventListener('resize', () => { setupBands(); render(); });
})();
