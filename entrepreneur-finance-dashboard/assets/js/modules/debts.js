/**
 * Financial Forecast - Debts Module
 * Manage debt payments (personal and business)
 */

import { debts } from '../core/data.js';
import { getConfig } from '../core/storage.js';
import { formatCurrency } from '../../../utils/helpers.js';

/**
 * Main render function for debts module
 */
export function renderDebts() {
  const mainContent = document.getElementById('mainContent');
  if (!mainContent) return;

  // Get frequencies from config
  const frequencies = getConfig('ui.frequencies') || [
    'Daily', 'Weekly', 'Bi-weekly', 'Monthly', 'Quarterly', 'Annually'
  ];

  mainContent.innerHTML = `
    <div class="card">
      <div class="section-header">
        <h2 class="section-title">Debts</h2>
        <button class="btn btn-success" id="addDebtBtn">+ Add Debt</button>
      </div>

      <!-- Personal Debts -->
      <h3 class="subsection-title personal">Personal Debt</h3>
      <div id="personal-debts-list"></div>

      <!-- Business Debts -->
      <h3 class="subsection-title business">Business Debt</h3>
      <div id="business-debts-list"></div>
    </div>
  `;

  // Render debt lists
  renderDebtList('personal', frequencies);
  renderDebtList('business', frequencies);

  // Add button handler
  document.getElementById('addDebtBtn')?.addEventListener('click', () => {
    const category = prompt('Enter category (personal or business):', 'personal');
    if (category === 'personal' || category === 'business') {
      debts.add({
        name: 'New Debt',
        totalAmount: 0,
        paymentAmount: 0,
        frequency: 'Monthly',
        interestRate: 0
      }, category);
      renderDebtList(category, frequencies);
    }
  });
}

/**
 * Render debt list for a category
 */
function renderDebtList(category, frequencies) {
  const items = debts.getAll(category);
  const containerId = `${category}-debts-list`;
  const container = document.getElementById(containerId);
  
  if (!container) return;

  container.innerHTML = '';

  items.forEach(debt => {
    const row = createDebtRow(debt, category, frequencies);
    container.appendChild(row);
  });
}

/**
 * Create a debt row element
 */
function createDebtRow(data, category, frequencies) {
  const row = document.createElement('div');
  row.className = 'dynamic-row';
  row.dataset.id = data.id;

  // Checkbox
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'form-checkbox';
  checkbox.checked = data.active;
  checkbox.addEventListener('change', (e) => {
    debts.update(data.id, { active: e.target.checked }, category);
  });

  // Name input
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.className = 'form-input';
  nameInput.value = data.name || '';
  nameInput.placeholder = 'Debt Name';
  nameInput.addEventListener('blur', (e) => {
    debts.update(data.id, { name: e.target.value }, category);
  });

  // Total Amount input
  const totalInput = document.createElement('input');
  totalInput.type = 'number';
  totalInput.className = 'form-input';
  totalInput.value = data.totalAmount || 0;
  totalInput.step = '0.01';
  totalInput.placeholder = 'Total Amount';
  totalInput.addEventListener('blur', (e) => {
    debts.update(data.id, { totalAmount: parseFloat(e.target.value) || 0 }, category);
  });

  // Payment Amount input
  const paymentInput = document.createElement('input');
  paymentInput.type = 'number';
  paymentInput.className = 'form-input';
  paymentInput.value = data.paymentAmount || 0;
  paymentInput.step = '0.01';
  paymentInput.placeholder = 'Payment';
  paymentInput.addEventListener('blur', (e) => {
    debts.update(data.id, { paymentAmount: parseFloat(e.target.value) || 0 }, category);
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
    debts.update(data.id, { frequency: e.target.value }, category);
  });

  // Interest Rate input
  const interestInput = document.createElement('input');
  interestInput.type = 'number';
  interestInput.className = 'form-input';
  interestInput.value = data.interestRate || 0;
  interestInput.step = '0.1';
  interestInput.placeholder = 'Rate %';
  interestInput.addEventListener('blur', (e) => {
    debts.update(data.id, { interestRate: parseFloat(e.target.value) || 0 }, category);
  });

  // Delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn-icon';
  deleteBtn.innerHTML = '🗑️';
  deleteBtn.title = 'Delete';
  deleteBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete this debt?')) {
      debts.delete(data.id, category);
      row.remove();
    }
  });

  row.appendChild(checkbox);
  row.appendChild(nameInput);
  row.appendChild(totalInput);
  row.appendChild(paymentInput);
  row.appendChild(freqSelect);
  row.appendChild(interestInput);
  row.appendChild(deleteBtn);

  return row;
}
