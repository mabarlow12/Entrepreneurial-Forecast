/**
 * Financial Forecast - Storage Layer (FIXED VERSION)
 * In-memory data storage (NO localStorage/sessionStorage)
 */

// ✅ FIXED: Use relative path from project root
import { deepClone } from '../../../utils/helpers.js';

// ========================================
// In-Memory Data Store
// ========================================

const dataStore = {
  overview: null,
  airbnb: null,
  trading: null,
  content: null,
  goals: null,
  config: null
};

// ========================================
// Storage API
// ========================================

export function initializeData(module, data) {
  if (!dataStore.hasOwnProperty(module)) {
    console.warn(`Unknown module: ${module}`);
    return false;
  }
  
  dataStore[module] = deepClone(data);
  console.log(`✓ Initialized ${module} data`);
  return true;
}

// ✅ FIXED: Added better null handling
export function getData(module) {
  if (!dataStore.hasOwnProperty(module)) {
    console.warn(`Unknown module: ${module}`);
    return null;
  }
  
  if (!dataStore[module]) {
    console.warn(`Module ${module} not initialized yet`);
    return null;
  }
  
  return deepClone(dataStore[module]);
}

export function setData(module, data) {
  if (!dataStore.hasOwnProperty(module)) {
    console.warn(`Unknown module: ${module}`);
    return false;
  }
  
  // ✅ FIXED: Validate data exists
  if (data === null || data === undefined) {
    console.warn(`Cannot set null/undefined data for ${module}`);
    return false;
  }
  
  dataStore[module] = deepClone(data);
  console.log(`✓ Updated ${module} data`);
  return true;
}

export function getProperty(module, property) {
  const data = getData(module);
  if (!data) return null;
  
  const keys = property.split('.');
  let value = data;
  
  for (const key of keys) {
    if (value && value.hasOwnProperty(key)) {
      value = value[key];
    } else {
      return null;
    }
  }
  
  return deepClone(value);
}

export function setProperty(module, property, value) {
  const data = getData(module);
  if (!data) return false;
  
  const keys = property.split('.');
  let target = data;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!target[key]) {
      target[key] = {};
    }
    target = target[key];
  }
  
  target[keys[keys.length - 1]] = deepClone(value);
  setData(module, data);
  return true;
}

export function addItem(module, arrayProperty, item) {
  const array = getProperty(module, arrayProperty);
  
  if (!Array.isArray(array)) {
    console.warn(`Property ${arrayProperty} is not an array`);
    return null;
  }
  
  const newItem = {
    id: item.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ...deepClone(item)
  };
  
  array.push(newItem);
  setProperty(module, arrayProperty, array);
  
  return newItem;
}

export function updateItem(module, arrayProperty, itemId, updates) {
  const array = getProperty(module, arrayProperty);
  
  if (!Array.isArray(array)) {
    console.warn(`Property ${arrayProperty} is not an array`);
    return null;
  }
  
  const index = array.findIndex(item => item.id === itemId);
  
  if (index === -1) {
    console.warn(`Item with id ${itemId} not found`);
    return null;
  }
  
  array[index] = {
    ...array[index],
    ...deepClone(updates)
  };
  
  setProperty(module, arrayProperty, array);
  
  return array[index];
}

export function deleteItem(module, arrayProperty, itemId) {
  const array = getProperty(module, arrayProperty);
  
  if (!Array.isArray(array)) {
    console.warn(`Property ${arrayProperty} is not an array`);
    return false;
  }
  
  const index = array.findIndex(item => item.id === itemId);
  
  if (index === -1) {
    console.warn(`Item with id ${itemId} not found`);
    return false;
  }
  
  array.splice(index, 1);
  setProperty(module, arrayProperty, array);
  
  return true;
}

export function getItemById(module, arrayProperty, itemId) {
  const array = getProperty(module, arrayProperty);
  
  if (!Array.isArray(array)) {
    return null;
  }
  
  const item = array.find(item => item.id === itemId);
  return item ? deepClone(item) : null;
}

export function filterItems(module, arrayProperty, filterFn) {
  const array = getProperty(module, arrayProperty);
  
  if (!Array.isArray(array)) {
    return [];
  }
  
  return array.filter(filterFn);
}

// ========================================
// Config Management
// ========================================

// ✅ FIXED: Use absolute path from root
export async function loadConfig() {
  if (dataStore.config) {
    return deepClone(dataStore.config);
  }
  
  try {
    const response = await fetch('/config.json');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const config = await response.json();
    dataStore.config = config;
    console.log('✓ Config loaded successfully');
    return deepClone(config);
  } catch (error) {
    console.error('Failed to load config:', error);
    // ✅ FIXED: Return default config instead of null
    return {
      app: { name: 'Financial Forecast', version: '1.0.0', defaultTab: 'dashboard' },
      modules: {},
      tabs: [],
      ui: { frequencies: [], currencySymbol: '$' },
      forecast: { weeksAhead: 63 }
    };
  }
}

export function getConfig(path) {
  if (!dataStore.config) {
    console.warn('Config not loaded yet');
    return null;
  }
  
  const keys = path.split('.');
  let value = dataStore.config;
  
  for (const key of keys) {
    if (value && value.hasOwnProperty(key)) {
      value = value[key];
    } else {
      return null;
    }
  }
  
  return deepClone(value);
}

// ========================================
// Data Loading from JSON
// ========================================

// ✅ FIXED: Better path handling and error messages
export async function loadFromJSON(module, filepath) {
  try {
    // ✅ Ensure absolute path
    const absolutePath = filepath.startsWith('/') ? filepath : `/${filepath}`;
    const response = await fetch(absolutePath);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    initializeData(module, data);
    console.log(`✓ Loaded ${module} from ${filepath}`);
    return data;
  } catch (error) {
    console.error(`Failed to load ${module} data from ${filepath}:`, error);
    // ✅ FIXED: Initialize with empty structure instead of null
    initializeData(module, {});
    return null;
  }
}

export async function loadAllData() {
  const config = await loadConfig();
  
  if (!config || !config.modules) {
    console.error('Cannot load data without valid config');
    return false;
  }
  
  const modules = config.modules;
  const loadPromises = [];
  
  for (const [moduleName, moduleConfig] of Object.entries(modules)) {
    if (moduleConfig.enabled && moduleConfig.dataSource) {
      loadPromises.push(
        loadFromJSON(moduleName, moduleConfig.dataSource)
      );
    }
  }
  
  try {
    await Promise.all(loadPromises);
    console.log('✓ All data loaded successfully');
    return true;
  } catch (error) {
    console.error('Error loading data:', error);
    return false;
  }
}

// ========================================
// Export/Import
// ========================================

export function exportAllData() {
  const exportData = {
    timestamp: new Date().toISOString(),
    data: {}
  };
  
  for (const [module, data] of Object.entries(dataStore)) {
    if (data && module !== 'config') {
      exportData.data[module] = data;
    }
  }
  
  return JSON.stringify(exportData, null, 2);
}

export function downloadData(filename = 'financial-forecast-data.json') {
  try {
    const dataStr = exportAllData();
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    console.log(`✓ Data exported to ${filename}`);
    return true;
  } catch (error) {
    console.error('Export failed:', error);
    return false;
  }
}

export function clearAllData() {
  for (const module in dataStore) {
    if (module !== 'config') {
      dataStore[module] = null;
    }
  }
  console.log('✓ All data cleared');
}

// ========================================
// Debug Utilities
// ========================================

export function _debugGetStore() {
  return deepClone(dataStore);
}

export function _debugLogStore() {
  console.log('=== Data Store ===');
  console.log(dataStore);
}
