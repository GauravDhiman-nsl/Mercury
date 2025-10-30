document.addEventListener('DOMContentLoaded', () => {
  new MercuryChart('#mercury-balance-chart', { id: 'mercury-balance' });
});



document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('iconToggle');
  const leftIconEl  = toggle.querySelector('.left-icon');
  const rightIconEl = toggle.querySelector('.right-icon');

  const leftSVG  = toggle.dataset.leftSvg;
  const rightSVG = toggle.dataset.rightSvg;

  if (leftSVG)  leftIconEl.innerHTML  = leftSVG;
  else if (toggle.dataset.leftIcon)  leftIconEl.classList.add(toggle.dataset.leftIcon);

  if (rightSVG) rightIconEl.innerHTML = rightSVG;
  else if (toggle.dataset.rightIcon) rightIconEl.classList.add(toggle.dataset.rightIcon);
  const setChecked = (checked) => {
    toggle.setAttribute('aria-checked', checked);
    toggle.dispatchEvent(new CustomEvent('togglechange', {
      detail: { checked }
    }));
  };

  toggle.addEventListener('click', () => {
    const currently = toggle.getAttribute('aria-checked') === 'true';
    setChecked(!currently);
  });

  toggle.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault(); 
      const currently = toggle.getAttribute('aria-checked') === 'true';
      setChecked(!currently);
    }
  });

  if (toggle.hasAttribute('data-active')) {
    setChecked(true);
  }
});



document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('iconToggle');
  const leftIconEl  = toggle.querySelector('.left-icon');
  const rightIconEl = toggle.querySelector('.right-icon');

  const leftSVG  = toggle.dataset.leftSvg;
  const rightSVG = toggle.dataset.rightSvg;

  if (leftSVG)  leftIconEl.innerHTML  = leftSVG;
  else if (toggle.dataset.leftIcon)  leftIconEl.classList.add(toggle.dataset.leftIcon);

  if (rightSVG) rightIconEl.innerHTML = rightSVG;
  else if (toggle.dataset.rightIcon) rightIconEl.classList.add(toggle.dataset.rightIcon);

  const setChecked = (checked) => {
    toggle.setAttribute('aria-checked', checked);
    // custom event for external listeners
    toggle.dispatchEvent(new CustomEvent('togglechange', {
      detail: { checked }
    }));
  };

  toggle.addEventListener('click', () => {
    const currently = toggle.getAttribute('aria-checked') === 'true';
    setChecked(!currently);
  });

  toggle.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();              
      const currently = toggle.getAttribute('aria-checked') === 'true';
      setChecked(!currently);
    }
  });

  if (toggle.hasAttribute('data-active')) {
    setChecked(true);
  }
});


/**
 * Money Movement Slider
 * - Only previous & current month
 * - Dynamic data per month
 * - Smooth transitions with .prev-month / .current-month classes
 */
document.addEventListener('DOMContentLoaded', () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonthIndex = today.getMonth(); // Oct 2025 → 9

  let year = currentYear;
  let monthIndex = currentMonthIndex;

  const display = document.getElementById('currentMonth');
  const prevBtn = document.querySelector('.nav-btn.prev');
  const nextBtn = document.querySelector('.nav-btn.next');
  const grid = document.querySelector('.money-grid');

  // DATA: Previous & Current Month
  const data = {
    current: {
      in: { total: 107773.59, avg: 0, sources: [
        { name: 'Google', amount: 48007.96, icon: 'img' },
        { name: 'Orange, Inc.', amount: 24763.63, avatar: 'orange' },
        { name: 'Milgram Brokerage', amount: 24210.79, avatar: 'mb' },
        { name: 'Office Stop Co.', amount: 6721.18, avatar: 'os' }
      ]},
      out: { total: -209882.31, avg: -64200, sources: [
        { name: 'Gusto (Payroll)', amount: -89453.18, avatar: 'gp' },
        { name: 'Google', amount: -47366.03, icon: 'img' },
        { name: 'Milgram Brokerage', amount: -30850.82, avatar: 'mb' },
        { name: 'Orange, Inc.', amount: -29919.16, avatar: 'orange' }
      ]}
    },
    previous: {
      in: { total: 98765.42, avg: 0, sources: [
        { name: 'Google', amount: 45210.33, icon: 'img' },
        { name: 'Orange, Inc.', amount: 23100.12, avatar: 'orange' },
        { name: 'Milgram Brokerage', amount: 22000.00, avatar: 'mb' },
        { name: 'Office Stop Co.', amount: 8455.97, avatar: 'os' }
      ]},
      out: { total: -195432.10, avg: -61200, sources: [
        { name: 'Gusto (Payroll)', amount: -85000.00, avatar: 'gp' },
        { name: 'Google', amount: -45000.00, icon: 'img' },
        { name: 'Milgram Brokerage', amount: -30000.00, avatar: 'mb' },
        { name: 'Orange, Inc.', amount: -28000.00, avatar: 'orange' }
      ]}
    }
  };

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const formatAmount = (val) => {
    if (val >= 0) return formatter.format(val);
    return `-${formatter.format(Math.abs(val))}`;
  };

  const renderSources = (listEl, sources) => {
    listEl.innerHTML = sources.map(s => `
      <div class="source-item">
        <dd class="source-name">
          ${s.icon === 'img' 
            ? `<img src="https://www.google.com/favicon.ico" alt="" width="16" height="16">` 
            : `<span class="avatar ${s.avatar}">${s.name.split(' ').map(w => w[0]).join('').substring(0,2)}</span>`
          }
          ${s.name}
        </dd>
        <dd class="source-amount ${s.amount < 0 ? 'negative' : ''}">${formatAmount(s.amount)}</dd>
      </div>
    `).join('');
  };

  const updateData = () => {
    const isCurrent = year === currentYear && monthIndex === currentMonthIndex;
    const key = isCurrent ? 'current' : 'previous';
    const d = data[key];

    // Add class for transition
    grid.classList.add('fade');
    setTimeout(() => grid.classList.remove('fade'), 300);

    // Update totals
    document.querySelector('[data-amount="in-total"]').textContent = formatAmount(d.in.total);
    document.querySelector('[data-amount="out-total"]').textContent = formatAmount(d.out.total);
    document.querySelector('[data-amount="in-avg"]').textContent = formatAmount(d.in.avg);
    document.querySelector('[data-amount="out-avg"]').textContent = formatAmount(d.out.avg);

    // Update sources
    renderSources(document.querySelector('[data-sources="in"]'), d.in.sources);
    renderSources(document.querySelector('[data-sources="out"]'), d.out.sources);

    // Update ARIA
    document.querySelector('.money-card.in').setAttribute('aria-label', `Income: ${formatAmount(d.in.total)}`);
    document.querySelector('.money-card.out').setAttribute('aria-label', `Expenses: ${formatAmount(d.out.total)}`);
  };

  const updateMonth = () => {
    display.textContent = `${months[monthIndex]} ${year}`;
    prevBtn.disabled = year === currentYear && monthIndex === currentMonthIndex - 1;
    nextBtn.disabled = year === currentYear && monthIndex === currentMonthIndex;
    updateData();
  };

  prevBtn.onclick = () => {
    if (monthIndex === currentMonthIndex - 1 && year === currentYear) return;
    monthIndex--;
    if (monthIndex < 0) { monthIndex = 11; year--; }
    updateMonth();
  };

  nextBtn.onclick = () => {
    if (year === currentYear && monthIndex === currentMonthIndex) return;
    monthIndex++;
    if (monthIndex > 11) { monthIndex = 0; year++; }
    updateMonth();
  };

  // Init
  updateMonth();
});



document.addEventListener('DOMContentLoaded', function () {
    const tabs = document.querySelectorAll('.tab');
    const tabPanels = document.querySelectorAll('[role="tabpanel"]');

    tabs.forEach(tab => {
        tab.addEventListener('click', function (event) {
            // Deactivate all tabs and hide all panels
            tabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
                t.setAttribute('tabindex', '-1');
            });
            tabPanels.forEach(p => {
                p.hidden = true;
            });

            // Activate the clicked tab
            const clickedTab = event.currentTarget;
            clickedTab.classList.add('active');
            clickedTab.setAttribute('aria-selected', 'true');
            clickedTab.setAttribute('tabindex', '0');

            // Show the corresponding tab panel
            const controlledPanelId = clickedTab.getAttribute('aria-controls');
            const controlledPanel = document.getElementById(controlledPanelId);
            if (controlledPanel) {
                controlledPanel.hidden = false;
                controlledPanel.focus();
            }
        });
    });
});




document.addEventListener('DOMContentLoaded', function () {
    // Get all necessary elements from the DOM
    const toggleButton = document.getElementById('wizard-toggle-btn');
    const wizardCard = document.getElementById('wizard-card');
    const collapseHeader = document.getElementById('wizard-header-collapse');
    const tabs = document.querySelectorAll('.wizard-tabs .tab-btn');

    // --- Element Checks ---
    if (!toggleButton || !wizardCard || !collapseHeader) {
        console.error("Wizard component is missing required elements. Please check HTML IDs.");
        return; // Stop the script if essential elements are missing
    }

    const openIcon = toggleButton.querySelector('.icon-open');
    const closeIcon = toggleButton.querySelector('.icon-close');

    // --- Functions ---
    const showWizard = () => {
        wizardCard.hidden = false;
        openIcon.hidden = true;
        closeIcon.hidden = false;
        toggleButton.setAttribute('aria-expanded', 'true');
    };
    
    const hideWizard = () => {
        wizardCard.hidden = true;
        openIcon.hidden = false;
        closeIcon.hidden = true;
        toggleButton.setAttribute('aria-expanded', 'false');
    };

    const toggleWizard = () => {
        if (wizardCard.hidden) {
            showWizard();
        } else {
            hideWizard();
        }
    };
    
    // --- Event Listeners ---
    toggleButton.addEventListener('click', toggleWizard);
    
    // The header should ONLY close the wizard
    collapseHeader.addEventListener('click', hideWizard);

    // Tab switching logic (remains the same)
    if (tabs.length > 0) {
        tabs.forEach(tab => {
            tab.addEventListener('click', (event) => {
                tabs.forEach(t => t.classList.remove('active'));
                event.currentTarget.classList.add('active');
            });
        });
    }
});

