/**
 * Financial Forecast - UI Rendering Layer
 * Core UI components and rendering helpers
 */

import { formatCurrency, formatDate, formatDateDisplay, formatPercent } from '../../../utils/helpers.js';

// ========================================
// Tab Management
// ========================================

/**
 * Initialize tab navigation
 * @param {Array} tabs - Array of tab configurations
 * @param {Function} onTabChange - Callback when tab changes
 */
export function initializeTabs(tabs, onTabChange) {
  const navTabs = document.querySelector('.nav-tabs');
  if (!navTabs) return;

  navTabs.innerHTML = '';

  tabs.forEach(tab => {
    const button = document.createElement('button');
    button.className = 'nav-tab';
    button.textContent = tab.label;
    button.dataset.tabId = tab.id;
    
    button.addEventListener('click', () => {
      setActiveTab(tab.id);
      if (onTabChange) onTabChange(tab.id);
    });

    navTabs.appendChild(button);
  });
}

/**
 * Set active tab
 * @param {string} tabId - Tab ID to activate
 */
export function setActiveTab(tabId) {
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(tab => {
    if (tab.dataset.tabId === tabId) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
}

// ========================================
// KPI Card Rendering
// ========================================

/**
 * Create a KPI card element
 * @param {Object} options - Card configuration
 * @returns {HTMLElement} KPI card element
 */
export function createKPICard({ label, value, isPositive = null }) {
  const card = document.createElement('div');
  card.className = 'kpi-card';

  const labelEl = document.createElement('div');
  labelEl.className = 'kpi-label';
  labelEl.textContent = label;

  const valueEl = document.createElement('div');
  valueEl.className = 'kpi-value';
  
  if (isPositive === true) {
    valueEl.classList.add('positive');
  } else if (isPositive === false) {
    valueEl.classList.add('negative');
  }
  
  valueEl.textContent = value;

  card.appendChild(labelEl);
  card.appendChild(valueEl);

  return card;
}

/**
 * Render KPI cards in a container
 * @param {string} containerId - Container element ID
 * @param {Array} cards - Array of card configurations
 */
export function renderKPICards(containerId, cards) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';

  cards.forEach(cardConfig => {
    const card = createKPICard(cardConfig);
    container.appendChild(card);
  });
}

// ========================================
// Table Rendering
// ========================================

/**
 * Create a table element
 * @param {Array} columns - Column configurations [{key, label}]
 * @param {Array} data - Array of data objects
 * @param {Object} options - Table options
 * @returns {HTMLElement} Table container
 */
export function createTable(columns, data, options = {}) {
  const container = document.createElement('div');
  container.className = 'table-container';

  const table = document.createElement('table');
  table.className = 'table';

  // Create header
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  
  columns.forEach(col => {
    const th = document.createElement('th');
    th.textContent = col.label;
    headerRow.appendChild(th);
  });
  
  if (options.actions) {
    const th = document.createElement('th');
    th.textContent = 'Actions';
    headerRow.appendChild(th);
  }
  
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Create body
  const tbody = document.createElement('tbody');
  
  data.forEach(row => {
    const tr = document.createElement('tr');
    
    columns.forEach(col => {
      const td = document.createElement('td');
      
      if (col.format) {
        td.textContent = col.format(row[col.key], row);
      } else {
        td.textContent = row[col.key] || '';
      }
      
      tr.appendChild(td);
    });
    
    if (options.actions) {
      const td = document.createElement('td');
      options.actions.forEach(action => {
        const button = document.createElement('button');
        button.className = 'btn-icon';
        button.innerHTML = action.icon;
        button.title = action.label;
        button.addEventListener('click', () => action.onClick(row));
        td.appendChild(button);
      });
      tr.appendChild(td);
    }
    
    tbody.appendChild(tr);
  });
  
  table.appendChild(tbody);
  container.appendChild(table);

  return container;
}

/**
 * Render table in container
 * @param {string} containerId - Container element ID
 * @param {Array} columns - Column configurations
 * @param {Array} data - Table data
 * @param {Object} options - Table options
 */
export function renderTable(containerId, columns, data, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';
  const table = createTable(columns, data, options);
  container.appendChild(table);
}

// ========================================
// Form Rendering
// ========================================

/**
 * Create a dynamic form row
 * @param {Object} data - Row data
 * @param {Function} onUpdate - Callback when data updates
 * @param {Function} onDelete - Callback when row deleted
 * @param {Array} frequencies - Available frequencies
 * @returns {HTMLElement} Form row element
 */
export function createDynamicRow(data, onUpdate, onDelete, frequencies = []) {
  const row = document.createElement('div');
  row.className = 'dynamic-row';
  row.dataset.id = data.id;

  // Checkbox
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'form-checkbox';
  checkbox.checked = data.active;
  checkbox.addEventListener('change', (e) => {
    onUpdate(data.id, { active: e.target.checked });
  });

  // Name input
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.className = 'form-input';
  nameInput.value = data.name || '';
  nameInput.placeholder = 'Name';
  nameInput.addEventListener('blur', (e) => {
    onUpdate(data.id, { name: e.target.value });
  });

  // Amount input
  const amountInput = document.createElement('input');
  amountInput.type = 'number';
  amountInput.className = 'form-input';
  amountInput.value = data.amount || 0;
  amountInput.step = '0.01';
  amountInput.placeholder = 'Amount';
  amountInput.addEventListener('blur', (e) => {
    onUpdate(data.id, { amount: parseFloat(e.target.value) || 0 });
  });

  // Frequency select
  const freqSelect = document.createElement('select');
  freqSelect.className = 'form-select';
  frequencies.forEach(freq => {
    const option = document.createElement('option');
    option.value = freq;
    option.textContent = freq;
    if (freq === data.frequency) option.selected = true;
    freqSelect.appendChild(option);
  });
  freqSelect.addEventListener('change', (e) => {
    onUpdate(data.id, { frequency: e.target.value });
  });

  // Start date input
  const startInput = document.createElement('input');
  startInput.type = 'date';
  startInput.className = 'form-input';
  startInput.value = data.startDate || '';
  startInput.addEventListener('change', (e) => {
    onUpdate(data.id, { startDate: e.target.value });
  });

  // End date input
  const endInput = document.createElement('input');
  endInput.type = 'date';
  endInput.className = 'form-input';
  endInput.value = data.endDate || '';
  endInput.addEventListener('change', (e) => {
    onUpdate(data.id, { endDate: e.target.value || null });
  });

  // Delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn-icon';
  deleteBtn.innerHTML = '🗑️';
  deleteBtn.title = 'Delete';
  deleteBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete this item?')) {
      onDelete(data.id);
      row.remove();
    }
  });

  row.appendChild(checkbox);
  row.appendChild(nameInput);
  row.appendChild(amountInput);
  row.appendChild(freqSelect);
  row.appendChild(startInput);
  row.appendChild(endInput);
  row.appendChild(deleteBtn);

  return row;
}

/**
 * Render dynamic rows in a container
 * @param {string} containerId - Container element ID
 * @param {Array} items - Array of items to render
 * @param {Function} onUpdate - Update callback
 * @param {Function} onDelete - Delete callback
 * @param {Array} frequencies - Available frequencies
 */
export function renderDynamicRows(containerId, items, onUpdate, onDelete, frequencies) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';

  items.forEach(item => {
    const row = createDynamicRow(item, onUpdate, onDelete, frequencies);
    container.appendChild(row);
  });
}

// ========================================
// Chart Rendering (Placeholder)
// ========================================

/**
 * Create a simple area chart using HTML/CSS
 * @param {string} containerId - Container element ID
 * @param {Array} data - Chart data [{week, balance}]
 * @param {Object} options - Chart options
 */
export function renderAreaChart(containerId, data, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';
  
  const chartDiv = document.createElement('div');
  chartDiv.className = 'chart-wrapper';
  chartDiv.style.position = 'relative';
  chartDiv.style.width = '100%';
  chartDiv.style.height = options.height || '400px';

  // Find min and max for scaling
  const values = data.map(d => d.balance);
  const maxVal = Math.max(...values);
  const minVal = Math.min(...values, 0);
  const range = maxVal - minVal;

  // Create SVG
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.setAttribute('viewBox', '0 0 1000 400');
  svg.setAttribute('preserveAspectRatio', 'none');

  // Create path
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  
  let pathData = '';
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 1000;
    const y = 400 - ((d.balance - minVal) / range) * 380;
    return { x, y };
  });

  if (points.length > 0) {
    pathData = `M ${points[0].x} ${points[0].y}`;
    points.slice(1).forEach(p => {
      pathData += ` L ${p.x} ${p.y}`;
    });
    
    // Close the path to create filled area
    pathData += ` L 1000 400 L 0 400 Z`;
  }

  path.setAttribute('d', pathData);
  path.setAttribute('fill', 'rgba(59, 130, 246, 0.2)');
  path.setAttribute('stroke', '#3B82F6');
  path.setAttribute('stroke-width', '2');

  svg.appendChild(path);
  chartDiv.appendChild(svg);

  // Add simple legend
  const legend = document.createElement('div');
  legend.style.marginTop = '10px';
  legend.style.fontSize = '14px';
  legend.style.color = '#6B7280';
  legend.innerHTML = `
    <strong>Cash Balance Projection</strong><br>
    Current: ${formatCurrency(data[0]?.balance || 0)} → 
    Week ${data.length}: ${formatCurrency(data[data.length - 1]?.balance || 0)}
  `;

  container.appendChild(chartDiv);
  container.appendChild(legend);
}

// ========================================
// Calendar Rendering
// ========================================

/**
 * Create a calendar month view
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @param {Function} getDayData - Function to get data for each day
 * @returns {HTMLElement} Calendar element
 */
export function createCalendar(year, month, getDayData) {
  const calendar = document.createElement('div');
  calendar.className = 'calendar';

  // Header
  const header = document.createElement('div');
  header.className = 'calendar-header';
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
  
  header.innerHTML = `<h3>${monthNames[month]} ${year}</h3>`;
  calendar.appendChild(header);

  // Day labels
  const dayLabels = document.createElement('div');
  dayLabels.className = 'calendar-grid';
  ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
    const label = document.createElement('div');
    label.textContent = day;
    label.style.fontWeight = 'bold';
    label.style.textAlign = 'center';
    dayLabels.appendChild(label);
  });
  calendar.appendChild(dayLabels);

  // Days grid
  const grid = document.createElement('div');
  grid.className = 'calendar-grid';

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    grid.appendChild(empty);
  }

  // Day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const date = formatDate(new Date(year, month, day));
    const dayData = getDayData ? getDayData(date) : null;
    
    const dayCell = document.createElement('div');
    dayCell.className = 'calendar-day';
    
    if (dayData) {
      if (dayData.profit > 0) {
        dayCell.classList.add('profit');
      } else if (dayData.profit < 0) {
        dayCell.classList.add('loss');
      }
      
      dayCell.innerHTML = `
        <div>${day}</div>
        <div style="font-size: 0.75rem;">${formatCurrency(dayData.profit, false)}</div>
      `;
    } else {
      dayCell.textContent = day;
    }
    
    grid.appendChild(dayCell);
  }

  calendar.appendChild(grid);

  return calendar;
}

/**
 * Render calendar in container
 * @param {string} containerId - Container element ID
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @param {Function} getDayData - Function to get data for each day
 */
export function renderCalendar(containerId, year, month, getDayData) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';
  const calendar = createCalendar(year, month, getDayData);
  container.appendChild(calendar);
}

// ========================================
// Utility Functions
// ========================================

/**
 * Show loading spinner in container
 * @param {string} containerId - Container element ID
 */
export function showLoading(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '<div style="text-align: center; padding: 2rem;">Loading...</div>';
}

/**
 * Show error message in container
 * @param {string} containerId - Container element ID
 * @param {string} message - Error message
 */
export function showError(containerId, message) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `<div style="color: #EF4444; padding: 1rem;">${message}</div>`;
}

/**
 * Clear container
 * @param {string} containerId - Container element ID
 */
export function clearContainer(containerId) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = '';
  }
}
