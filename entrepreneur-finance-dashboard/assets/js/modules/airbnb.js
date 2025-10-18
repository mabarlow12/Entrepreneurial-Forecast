/**
 * Financial Forecast - Airbnb Module
 * Manage Airbnb listings, bookings, and labor costs
 */

import { airbnb } from '../core/data.js';
import { formatCurrency, formatDate, getCurrentDate } from '../../../utils/helpers.js';
import { calculateVariance } from '../core/calculations.js';
import { createTable } from '../core/ui.js';

/**
 * Main render function for Airbnb module
 */
export function renderAirbnb() {
  const mainContent = document.getElementById('mainContent');
  if (!mainContent) return;

  mainContent.innerHTML = `
    <div class="card">
      <div class="section-header">
        <h2 class="section-title">Airbnb Management</h2>
        <button class="btn btn-primary" id="connectApiBtn">Connect/Update Airbnb API</button>
      </div>

      <!-- Listing Performance -->
      <h3 class="subsection-title">Listing Performance</h3>
      <div id="listings-container" class="mb-xl"></div>

      <!-- Labor & Operating Expenses -->
      <h3 class="subsection-title">Labor & Operating Expenses</h3>
      <div class="mb-md">
        <button class="btn btn-success" id="addLaborBtn">+ Add Labor Cost</button>
      </div>
      <div id="labor-costs-table"></div>
    </div>
  `;

  // Render sections
  renderListings();
  renderLaborCosts();

  // API button handler
  document.getElementById('connectApiBtn')?.addEventListener('click', () => {
    alert('API integration is not yet implemented. This would connect to Airbnb API for automatic data sync.');
  });

  // Add labor cost button
  document.getElementById('addLaborBtn')?.addEventListener('click', () => {
    showAddLaborForm();
  });
}

/**
 * Render listing performance cards
 */
function renderListings() {
  const listings = airbnb.getListings();
  const container = document.getElementById('listings-container');
  
  if (!container) return;

  container.innerHTML = '';
  container.className = 'grid-3col';

  listings.forEach(listing => {
    const variance = calculateVariance(listing.forecastedRevenue, listing.actualRevenue);
    const variancePercent = listing.forecastedRevenue > 0 
      ? ((variance / listing.forecastedRevenue) * 100).toFixed(1)
      : 0;

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h4 class="font-semibold mb-md">${listing.name} - ${listing.unit}</h4>
      
      <div class="mb-sm">
        <label class="form-label">Forecasted Revenue</label>
        <input 
          type="number" 
          class="form-input" 
          value="${listing.forecastedRevenue}"
          data-listing-id="${listing.id}"
          data-field="forecast"
          step="0.01"
        >
      </div>

      <div class="mb-sm">
        <label class="form-label">Actual Revenue</label>
        <input 
          type="number" 
          class="form-input" 
          value="${listing.actualRevenue}"
          data-listing-id="${listing.id}"
          data-field="actual"
          step="0.01"
        >
      </div>

      <div class="mt-md">
        <div class="text-sm text-secondary">Variance</div>
        <div class="text-lg font-bold ${variance >= 0 ? 'text-success' : 'text-danger'}">
          ${formatCurrency(variance)} (${variancePercent}%)
        </div>
      </div>

      <div class="mt-sm text-sm text-secondary">
        Occupancy: ${listing.occupancyRate}%
      </div>
    `;

    // Add event listeners for inputs
    const inputs = card.querySelectorAll('input[data-listing-id]');
    inputs.forEach(input => {
      input.addEventListener('blur', (e) => {
        const listingId = e.target.dataset.listingId;
        const field = e.target.dataset.field;
        const value = parseFloat(e.target.value) || 0;

        if (field === 'forecast') {
          airbnb.updateForecast(listingId, value);
        } else if (field === 'actual') {
          airbnb.updateActual(listingId, value);
        }

        renderListings(); // Refresh to update variance
      });
    });

    container.appendChild(card);
  });
}

/**
 * Render labor costs table
 */
function renderLaborCosts() {
  const costs = airbnb.getLaborCosts();

  const columns = [
    { 
      key: 'date', 
      label: 'Date',
      format: (val) => formatDate(val)
    },
    { key: 'description', label: 'Description' },
    { 
      key: 'amount', 
      label: 'Amount',
      format: (val) => formatCurrency(val)
    }
  ];

  const table = createTable(columns, costs, {
    actions: [
      {
        icon: '🗑️',
        label: 'Delete',
        onClick: (row) => {
          if (confirm('Delete this labor cost?')) {
            airbnb.deleteLaborCost(row.id);
            renderLaborCosts();
          }
        }
      }
    ]
  });

  const container = document.getElementById('labor-costs-table');
  if (container) {
    container.innerHTML = '';
    container.appendChild(table);
  }
}

/**
 * Show form to add labor cost
 */
function showAddLaborForm() {
  const date = prompt('Enter date (YYYY-MM-DD):', getCurrentDate());
  if (!date) return;

  const description = prompt('Enter description:');
  if (!description) return;

  const amount = prompt('Enter amount:');
  if (!amount) return;

  airbnb.addLaborCost({
    date,
    description,
    amount: parseFloat(amount) || 0
  });

  renderLaborCosts();
}
