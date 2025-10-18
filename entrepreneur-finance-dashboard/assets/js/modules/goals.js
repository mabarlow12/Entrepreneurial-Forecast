/**
 * Financial Forecast - Goals Module
 * Salary replacement goals and milestones
 */

import { goals } from '../core/data.js';
import { formatCurrency, formatDate } from '../../../utils/helpers.js';

/**
 * Main render function for goals module
 */
export function renderGoals() {
  const mainContent = document.getElementById('mainContent');
  if (!mainContent) return;

  const salaryData = goals.getSalaryReplacement();
  const milestones = goals.getMilestones();

  mainContent.innerHTML = `
    <div class="card">
      <h2 class="section-title mb-xl">Salary Replacement Goal</h2>

      <!-- Current Progress -->
      <div class="grid-2col mb-xl">
        <div class="kpi-card">
          <div class="kpi-label">Target Monthly Income</div>
          <div class="kpi-value">${formatCurrency(salaryData.targetMonthlyIncome || 0)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Current Monthly Income</div>
          <div class="kpi-value positive">${formatCurrency(salaryData.currentMonthlyIncome || 0)}</div>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="mb-xl">
        <div class="kpi-label mb-sm">Progress: ${salaryData.progressPercent || 0}%</div>
        <div style="width: 100%; height: 30px; background: #E5E7EB; border-radius: 8px; overflow: hidden;">
          <div style="width: ${salaryData.progressPercent || 0}%; height: 100%; background: #10B981; transition: width 0.3s;"></div>
        </div>
        <div class="text-sm text-secondary mt-sm">
          Projected Date: ${formatDate(salaryData.projectedDate || '')}
        </div>
      </div>

      <!-- Milestones -->
      <h3 class="subsection-title">Milestones</h3>
      <div id="milestones-list"></div>
    </div>
  `;

  renderMilestones(milestones);
}

/**
 * Render milestones list
 */
function renderMilestones(milestones) {
  const container = document.getElementById('milestones-list');
  if (!container) return;

  container.innerHTML = '';

  milestones.forEach(milestone => {
    const card = document.createElement('div');
    card.className = 'card mb-md';
    card.style.background = milestone.completed ? '#F0FDF4' : '#FFFFFF';
    card.style.borderLeft = milestone.completed ? '4px solid #10B981' : '4px solid #E5E7EB';

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h4 class="font-semibold mb-sm">
            ${milestone.completed ? '✅ ' : ''}${milestone.name}
          </h4>
          <div class="text-sm text-secondary">
            Target: ${formatCurrency(milestone.targetAmount)} by ${formatDate(milestone.targetDate)}
          </div>
          ${milestone.completed ? `
            <div class="text-sm text-success mt-sm">
              Completed: ${formatDate(milestone.completedDate)}
            </div>
          ` : ''}
        </div>
        <div>
          ${!milestone.completed ? `
            <button class="btn btn-success btn-sm" onclick="window.completeMilestone('${milestone.id}')">
              Mark Complete
            </button>
          ` : ''}
        </div>
      </div>
    `;

    container.appendChild(card);
  });

  // Add global function for completing milestones
  window.completeMilestone = (id) => {
    const milestone = milestones.find(m => m.id === id);
    if (milestone && confirm(`Mark "${milestone.name}" as complete?`)) {
      goals.updateMilestone(id, {
        completed: true,
        completedDate: new Date().toISOString().split('T')[0]
      });
      renderGoals();
    }
  };
}
