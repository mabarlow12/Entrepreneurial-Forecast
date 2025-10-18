/**
 * Financial Forecast - Day Trading Module
 * Track trades, daily P&L, and trading performance
 */

import { trading } from '../core/data.js';
import { formatCurrency, formatDate, getCurrentDate } from '../../../utils/helpers.js';
import { createTable, renderCalendar } from '../core/ui.js';

/**
 * Main render function for trading module
 */
export function renderTrading() {
  const mainContent = document.getElementById('mainContent');
  if (!mainContent) return;

  mainContent.innerHTML = `
    <div class="card mb-xl">
      <h2 class="section-title mb-lg">Day Trading</h2>

      <!-- Trade Input Form -->
      <div class="card mb-lg" style="background: #F9FAFB;">
        <h3 class="font-semibold mb-md">Log New Trade</h3>
        <div class="grid-3col mb-md">
          <div>
            <label class="form-label">Date</label>
            <input type="date" id="trade-date" class="form-input" value="${getCurrentDate()}">
        </div>
    `;
    
    container.appendChild(summary);
    container.appendChild(table);
  }
}    <div>
            <label class="form-label">Asset/Symbol</label>
            <input type="text" id="trade-asset" class="form-input" placeholder="AAPL">
          </div>
          <div>
            <label class="form-label">Position Size</label>
            <input type="number" id="trade-size" class="form-input" placeholder="100" step="1">
          </div>
        </div>
        
        <div class="grid-4col mb-md">
          <div>
            <label class="form-label">Entry Price</label>
            <input type="number" id="trade-entry" class="form-input" placeholder="150.00" step="0.01">
          </div>
          <div>
            <label class="form-label">Exit Price</label>
            <input type="number" id="trade-exit" class="form-input" placeholder="155.00" step="0.01">
          </div>
          <div>
            <label class="form-label">Stop Loss</label>
            <input type="number" id="trade-sl" class="form-input" placeholder="148.00" step="0.01">
          </div>
          <div>
            <label class="form-label">Take Profit</label>
            <input type="number" id="trade-tp" class="form-input" placeholder="160.00" step="0.01">
          </div>
        </div>

        <button class="btn btn-primary" id="logTradeBtn">Log Trade</button>
      </div>

      <!-- Daily P&L Calendar -->
      <h3 class="subsection-title">Monthly Trading Calendar</h3>
      <div id="trading-calendar" class="mb-xl"></div>

      <!-- Trade Log Table -->
      <h3 class="subsection-title">Trade Log</h3>
      <div id="trade-log-table"></div>
    </div>
  `;

  // Render sections
  renderTradingCalendar();
  renderTradeLog();

  // Log trade button
  document.getElementById('logTradeBtn')?.addEventListener('click', handleLogTrade);
}

/**
 * Handle logging a new trade
 */
function handleLogTrade() {
  const date = document.getElementById('trade-date')?.value;
  const asset = document.getElementById('trade-asset')?.value;
  const positionSize = parseFloat(document.getElementById('trade-size')?.value) || 0;
  const entryPrice = parseFloat(document.getElementById('trade-entry')?.value) || 0;
  const exitPrice = parseFloat(document.getElementById('trade-exit')?.value) || 0;
  const stopLoss = parseFloat(document.getElementById('trade-sl')?.value) || 0;
  const takeProfit = parseFloat(document.getElementById('trade-tp')?.value) || 0;

  if (!asset || positionSize === 0 || entryPrice === 0 || exitPrice === 0) {
    alert('Please fill in all required fields (Asset, Position Size, Entry, Exit)');
    return;
  }

  trading.add({
    date,
    asset,
    positionSize,
    entryPrice,
    exitPrice,
    stopLoss,
    takeProfit
  });

  // Clear form
  document.getElementById('trade-asset').value = '';
  document.getElementById('trade-size').value = '';
  document.getElementById('trade-entry').value = '';
  document.getElementById('trade-exit').value = '';
  document.getElementById('trade-sl').value = '';
  document.getElementById('trade-tp').value = '';

  // Refresh displays
  renderTradingCalendar();
  renderTradeLog();

  alert('Trade logged successfully!');
}

/**
 * Render trading calendar with daily P&L
 */
function renderTradingCalendar() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  // Function to get P&L for a specific date
  const getDayData = (date) => {
    const dailyPL = trading.getDailyPL(date);
    return dailyPL !== 0 ? { profit: dailyPL } : null;
  };

  renderCalendar('trading-calendar', year, month, getDayData);
}

/**
 * Render trade log table
 */
function renderTradeLog() {
  const trades = trading.getAll();

  // Sort by date descending
  const sortedTrades = [...trades].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );

  const columns = [
    { 
      key: 'date', 
      label: 'Date',
      format: (val) => formatDate(val)
    },
    { key: 'asset', label: 'Asset' },
    { 
      key: 'entryPrice', 
      label: 'Entry',
      format: (val) => `$${val.toFixed(2)}`
    },
    { 
      key: 'exitPrice', 
      label: 'Exit',
      format: (val) => `$${val.toFixed(2)}`
    },
    { 
      key: 'stopLoss', 
      label: 'Stop Loss',
      format: (val) => val > 0 ? `$${val.toFixed(2)}` : 'N/A'
    },
    { 
      key: 'takeProfit', 
      label: 'Take Profit',
      format: (val) => val > 0 ? `$${val.toFixed(2)}` : 'N/A'
    },
    { 
      key: 'positionSize', 
      label: 'Size',
      format: (val) => val.toFixed(0)
    },
    { 
      key: 'profitLoss', 
      label: 'P&L',
      format: (val) => {
        const formatted = formatCurrency(val);
        return `<span style="color: ${val >= 0 ? '#10B981' : '#EF4444'}">${formatted}</span>`;
      }
    }
  ];

  const table = createTable(columns, sortedTrades, {
    actions: [
      {
        icon: '🗑️',
        label: 'Delete',
        onClick: (row) => {
          if (confirm('Delete this trade?')) {
            trading.delete(row.id);
            renderTradingCalendar();
            renderTradeLog();
          }
        }
      }
    ]
  });

  const container = document.getElementById('trade-log-table');
  if (container) {
    container.innerHTML = '';
    
    // Add summary stats
    const totalPL = trading.getTotalPL();
    const summary = document.createElement('div');
    summary.className = 'mb-md';
    summary.innerHTML = `
      <div class="grid-2col">
        <div class="kpi-card">
          <div class="kpi-label">Total P&L</div>
          <div class="kpi-value ${totalPL >= 0 ? 'positive' : 'negative'}">
            ${formatCurrency(totalPL)}
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Total Trades</div>
          <div class="kpi-value">${trades.length}</div>
        </div>
