/**
 * Financial Forecast - Expenses Module
 * Manage expenses (personal and business)
 */

import { expenses } from '../core/data.js';
import { getConfig } from '../core/storage.js';
import { renderDynamicRows } from '../core/ui.js';

/**
 * Main render function for expenses module
 */
export function renderExpenses() {
  const mainContent = document.getElementById('mainContent');
  if (!mainContent) return;

  // Get frequencies from config
  const frequencies = getConfig('ui.frequencies') || [
    'Daily', 'Weekly', 'Bi-weekly', 'Monthly', 'Quarterly', 'Annually', 'One-time'
  ];

  mainContent.innerHTML = `
    <div class="card">
      <div class="section-header">
        <h2 class="section-title">Expenses</h2>
        <button class="btn btn-success" id="addExpenseBtn">+ Add Expense</button>
      </div>

      <!-- Personal Expenses -->
      <h3 class="subsection-title personal">Personal Expenses</h3>
      <div id="personal-expenses-list"></div>

      <!-- Business Expenses -->
      <h3 class="subsection-title business">Business Expenses</h3>
      <div id="business-expenses-list"></div>
    </div>
  `;

  // Render expense lists
  renderExpenseList('personal', frequencies);
  renderExpenseList('business', frequencies);

  // Add button handler
  document.getElementById('addExpenseBtn')?.addEventListener('click', () => {
    const category = prompt('Enter category (personal or business):', 'personal');
    if (category === 'personal' || category === 'business') {
      expenses.add({
        name: 'New Expense',
        amount: 0,
        frequency: 'Monthly'
      }, category);
      renderExpenseList(category, frequencies);
    }
  });
}

/**
 * Render expense list for a category
 */
function renderExpenseList(category, frequencies) {
  const items = expenses.getAll(category);
  const containerId = `${category}-expenses-list`;

  renderDynamicRows(
    containerId,
    items,
    (id, updates) => {
      expenses.update(id, updates, category);
    },
    (id) => {
      expenses.delete(id, category);
    },
    frequencies
  );
}
