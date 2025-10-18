/**
 * Financial Forecast - Overview/Dashboard Module
 * Main dashboard with KPIs, projections, and cash flow
 */

import { income, expenses, debts, overview } from '../core/data.js';
import { 
  calculateDashboardMetrics,
  projectCashBalance,
  get5WeekOutlook
} from '../core/calculations.js';
import { formatCurrency, formatDate } from '../../../utils/helpers.js';
import { 
  renderKPICards,
  createTable,
  renderAreaChart,
  showLoading 
} from '../core/ui.js';

/**
 * Main render function for dashboard
 */
export function renderDashboard() {
  const mainContent = document.getElementById('mainContent');
  if (!mainContent) return;

  showLoading('mainContent');

  // Get all data
  const overviewData = overview.getData();
  if (!overviewData) {
    mainContent.innerHTML = '<div class="card"><p>No data available</p></div>';
    return;
  }

  // Build dashboard HTML structure
  mainContent.innerHTML = `
    <div id="dashboard-container">
      <!-- Key Metrics Section -->
      <div class="metrics-grid">
        <div class="metrics-column">
          <div id="kpi-current-cash"></div>
          <div id="kpi-avg-weekly"></div>
        </div>
        <div class="metrics-column">
          <div id="kpi-cash-dec"></div>
          <div id="kpi-tax-owed"></div>
        </div>
      </div>
      
      <div id="kpi-cash-after-tax" class="mb-xl"></div>

      <!-- Tax Payment Strategy -->
      <div class="card mb-xl">
        <h3 class="card-title">Tax Payment Strategy</h3>
        <p class="card-body">
          Based on your projected cash balance of ${formatCurrency(0)} in December 2026 
          and tax liability of ${formatCurrency(overviewData.taxOwed || 0)} due in April 2027, 
          you should set aside approximately ${formatCurrency((overviewData.taxOwed || 0) / 12)} 
          per month to ensure sufficient funds for tax payment.
        </p>
      </div>

      <!-- 5-Week Cash Flow Outlook -->
      <div class="card mb-xl">
        <h3 class="card-title mb-lg">5-Week Cash Flow Outlook</h3>
        <div id="cash-flow-table"></div>
      </div>

      <!-- Cash Balance Projection Chart -->
      <div class="card mb-xl">
        <h3 class="card-title mb-lg">Cash Balance Projection</h3>
        <div id="cash-projection-chart"></div>
      </div>

      <!-- Debt Summary -->
      <div class="grid-2col">
        <div id="debt-personal-card"></div>
        <div id="debt-business-card"></div>
      </div>
    </div>
  `;

  // Render all sections
  renderKPISection(overviewData);
  render5WeekOutlook(overviewData);
  renderCashProjection(overviewData);
  renderDebtSummary(overviewData);
}

/**
 * Render KPI cards
 */
function renderKPISection(data) {
  // Calculate metrics
  const metrics = calculateDashboardMetrics(data);

  // Current Cash
  renderKPICards('kpi-current-cash', [{
    label: 'Current Cash',
    value: formatCurrency(metrics.currentCash),
    isPositive: metrics.currentCash > 0
  }]);

  // Average Weekly Flow
  renderKPICards('kpi-avg-weekly', [{
    label: 'Avg Weekly Flow',
    value: formatCurrency(metrics.avgWeeklyCashFlow),
    isPositive: metrics.avgWeeklyCashFlow > 0
  }]);

  // Cash (Dec 2026)
  renderKPICards('kpi-cash-dec', [{
    label: 'Cash (Dec 2026)',
    value: formatCurrency(metrics.cashDec2026),
    isPositive: metrics.cashDec2026 > 0
  }]);

  // Tax Owed (Apr 2027)
  renderKPICards('kpi-tax-owed', [{
    label: 'Tax Owed (Apr 2027)',
    value: formatCurrency(metrics.taxOwed),
    isPositive: false
  }]);

  // Cash After Tax
  renderKPICards('kpi-cash-after-tax', [{
    label: 'Cash After Tax',
    value: formatCurrency(metrics.cashAfterTax),
    isPositive: metrics.cashAfterTax > 0
  }]);
}

/**
 * Render 5-week cash flow outlook table
 */
function render5WeekOutlook(data) {
  const allIncome = [...(data.income?.personal || []), ...(data.income?.business || [])];
  const allExpenses = [...(data.expenses?.personal || []), ...(data.expenses?.business || [])];
  const allDebts = [...(data.debts?.personal || []), ...(data.debts?.business || [])];

  const outlook = get5WeekOutlook({
    startingCash: data.currentCash || 0,
    income: allIncome,
    expenses: allExpenses,
    debts: allDebts,
    startDate: formatDate(new Date())
  });

  const columns = [
    { key: 'week', label: 'Week' },
    { 
      key: 'weekStart', 
      label: 'Date',
      format: (val) => formatDate(val)
    },
    { 
      key: 'income', 
      label: 'Income',
      format: (val) => formatCurrency(val)
    },
    { 
      key: 'expenses', 
      label: 'Expenses',
      format: (val) => formatCurrency(val)
    },
    { 
      key: 'debt', 
      label: 'Debt',
      format: (val) => formatCurrency(val)
    },
    { 
      key: 'cashFlow', 
      label: 'Cash Flow',
      format: (val) => formatCurrency(val)
    },
    {
