/**
 * Financial Forecast - Data Layer (FIXED VERSION)
 * CRUD operations for all modules with validation
 */

import * as storage from './storage.js';
import { generateId, isValidCategory } from '../../../utils/helpers.js';

// ✅ NEW: Valid categories for validation
const VALID_CATEGORIES = ['personal', 'business'];

// ========================================
// Income Operations
// ========================================

export const income = {
  getAll(category = null) {
    // ✅ FIXED: Validate category
    if (category && !isValidCategory(category, VALID_CATEGORIES)) {
      console.warn(`Invalid category: ${category}`);
      return [];
    }
    
    const personal = storage.getProperty('overview', 'income.personal') || [];
    const business = storage.getProperty('overview', 'income.business') || [];
    
    if (category === 'personal') return personal;
    if (category === 'business') return business;
    
    return [...personal, ...business];
  },

  add(incomeData, category = 'personal') {
    // ✅ FIXED: Validate category before adding
    if (!isValidCategory(category, VALID_CATEGORIES)) {
      console.error(`Invalid category: ${category}. Must be 'personal' or 'business'`);
      return null;
    }
    
    const arrayPath = `income.${category}`;
    return storage.addItem('overview', arrayPath, {
      id: generateId(),
      active: true,
      name: '',
      amount: 0,
      frequency: 'Monthly',
      startDate: new Date().toISOString().split('T')[0],
      endDate: null,
      ...incomeData
    });
  },

  update(id, updates, category = 'personal') {
    if (!isValidCategory(category, VALID_CATEGORIES)) {
      console.error(`Invalid category: ${category}`);
      return null;
    }
    
    const arrayPath = `income.${category}`;
    return storage.updateItem('overview', arrayPath, id, updates);
  },

  delete(id, category = 'personal') {
    if (!isValidCategory(category, VALID_CATEGORIES)) {
      console.error(`Invalid category: ${category}`);
      return false;
    }
    
    const arrayPath = `income.${category}`;
    return storage.deleteItem('overview', arrayPath, id);
  },

  getActive(category = null) {
    return this.getAll(category).filter(item => item.active);
  }
};

// ========================================
// Expense Operations
// ========================================

export const expenses = {
  getAll(category = null) {
    if (category && !isValidCategory(category, VALID_CATEGORIES)) {
      console.warn(`Invalid category: ${category}`);
      return [];
    }
    
    const personal = storage.getProperty('overview', 'expenses.personal') || [];
    const business = storage.getProperty('overview', 'expenses.business') || [];
    
    if (category === 'personal') return personal;
    if (category === 'business') return business;
    
    return [...personal, ...business];
  },

  add(expenseData, category = 'personal') {
    if (!isValidCategory(category, VALID_CATEGORIES)) {
      console.error(`Invalid category: ${category}`);
      return null;
    }
    
    const arrayPath = `expenses.${category}`;
    return storage.addItem('overview', arrayPath, {
      id: generateId(),
      active: true,
      name: '',
      amount: 0,
      frequency: 'Monthly',
      startDate: new Date().toISOString().split('T')[0],
      endDate: null,
      ...expenseData
    });
  },

  update(id, updates, category = 'personal') {
