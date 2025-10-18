/**
 * Financial Forecast - Income Module
 * Manage income sources (personal and business)
 */

import { income } from '../core/data.js';
import { getConfig } from '../core/storage.js';
import { renderDynamicRows } from '../core/ui.js';

/**
 * Main render function for income module
 */
export function renderIncome() {
  const mainContent = document.getElementById('mainContent');
  if (!mainContent) return;

  // Get frequencies from config
  const frequencies = getConfig('ui.frequencies') || [
    'Daily', 'Weekly', 'Bi-weekly', 'Monthly', 'Quarterly', 'Annually', 'One-time'
  ];

  mainContent.innerHTML = `
    <div class="card">
      <div class="section-header">
        <h2 class="section-title">Income Sources</h2>
        <button class="btn btn-success" id="addIncomeBtn">+ Add Income</button>
      </div>

      <!-- Personal Income -->
      <h3 class="subsection-title personal">Personal Income</h3>
      <div id="personal-income-list"></div>

      <!-- Business Income -->
      <h3 class="subsection-title business">Business Income</h3>
      <div id="business-income-list"></div>
    </div>
  `;

  // Render income lists
  renderIncomeList('personal', frequencies);
  renderIncomeList('business', frequencies);

  // Add button handler
  document.getElementById('addIncomeBtn')?.addEventListener('click', () => {
    const category = prompt('Enter category (personal or business):', 'personal');
    if (category === 'personal' || category === 'business') {
      income.add({
        name: 'New Income Source',
        amount: 0,
        frequency: 'Monthly'
      }, category);
      renderIncomeList(category, frequencies);
    }
  });
}

/**
 * Render income list for a category
 */
function renderIncomeList(category, frequencies) {
  const items = income.getAll(category);
  const containerId = `${category}-income-list`;

  renderDynamicRows(
    containerId,
    items,
    (id, updates) => {
      income.update(id, updates, category);
    },
    (id) => {
      income.delete(id, category);
    },
    frequencies
  );
}
