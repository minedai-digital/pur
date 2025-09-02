/**
 * Shared JavaScript Utilities for Procurement Application
 * Version 2.0 - Enhanced functionality and error handling
 */

class ProcurementUtils {
  
  /**
   * Application Configuration and Constants
   */
  static get CONFIG() {
    return window.APP_DATA?.APP_CONFIG || {
      TAX_RATE: 0.14,
      CURRENCY: 'جنيه مصري',
      DATE_FORMAT: 'YYYY-MM-DD'
    };
  }

  /**
   * Data Management Functions
   */
  
  // Get suppliers data
  static getSuppliers() {
    return window.APP_DATA?.SUPPLIERS_DB || {};
  }

  // Get medical items data
  static getMedicalItems() {
    return window.APP_DATA?.MEDICAL_ITEMS_DB || {};
  }

  // Get staff data
  static getStaff() {
    return window.APP_DATA?.STAFF_DB || {};
  }

  /**
   * Validation Functions
   */
  
  static validateRequired(value, fieldName) {
    if (!value || value.toString().trim() === '') {
      return `${fieldName} مطلوب`;
    }
    return null;
  }

  static validateNumber(value, fieldName, min = 0, max = Number.MAX_SAFE_INTEGER) {
    const num = parseFloat(value);
    if (isNaN(num)) {
      return `${fieldName} يجب أن يكون رقم صحيح`;
    }
    if (num < min) {
      return `${fieldName} يجب أن يكون أكبر من ${min}`;
    }
    if (num > max) {
      return `${fieldName} يجب أن يكون أقل من ${max}`;
    }
    return null;
  }

  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'البريد الإلكتروني غير صحيح';
    }
    return null;
  }

  static validatePhone(phone) {
    const phoneRegex = /^01[0-9]{9}$/;
    if (!phoneRegex.test(phone)) {
      return 'رقم الهاتف غير صحيح (يجب أن يبدأ بـ 01 ويحتوي على 11 رقم)';
    }
    return null;
  }

  /**
   * Calculation Functions
   */
  
  static calculateTotal(quantity, price) {
    return (parseFloat(quantity) || 0) * (parseFloat(price) || 0);
  }

  static calculateTax(amount, taxRate = this.CONFIG.TAX_RATE) {
    return (parseFloat(amount) || 0) * (parseFloat(taxRate) || 0);
  }

  static calculateTotalWithTax(amount, taxRate = this.CONFIG.TAX_RATE) {
    const baseAmount = parseFloat(amount) || 0;
    const tax = this.calculateTax(baseAmount, taxRate);
    return baseAmount + tax;
  }

  static formatCurrency(amount) {
    const num = parseFloat(amount) || 0;
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 2
    }).format(num);
  }

  static formatNumber(number, decimals = 2) {
    const num = parseFloat(number) || 0;
    return num.toFixed(decimals);
  }

  /**
   * Date and Time Functions
   */
  
  static getCurrentDate() {
    return new Date().toISOString().split('T')[0];
  }

  static formatDate(date, format = 'DD/MM/YYYY') {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    
    switch (format) {
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`;
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      default:
        return d.toLocaleDateString('ar-EG');
    }
  }

  static getHijriDate() {
    // Simplified Hijri date calculation - in production, use proper library
    const gregorianDate = new Date();
    const hijriYear = gregorianDate.getFullYear() - 579;
    return `${gregorianDate.getDate()}/${gregorianDate.getMonth() + 1}/${hijriYear}`;
  }

  /**
   * UI Helper Functions
   */
  
  static showAlert(message, type = 'info', duration = 4000) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} fade-in`;
    alertDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      max-width: 400px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    alertDiv.textContent = message;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
      if (alertDiv.parentNode) {
        alertDiv.style.opacity = '0';
        setTimeout(() => alertDiv.remove(), 300);
      }
    }, duration);
  }

  static showLoading(show = true, element = document.body) {
    if (show) {
      element.classList.add('loading');
    } else {
      element.classList.remove('loading');
    }
  }

  static confirmAction(message, callback) {
    if (confirm(message)) {
      callback();
    }
  }

  /**
   * Form Helper Functions
   */
  
  static populateSelect(selectElement, options, valueKey = 'value', textKey = 'text') {
    selectElement.innerHTML = '<option value="">اختر...</option>';
    
    options.forEach(option => {
      const optionElement = document.createElement('option');
      optionElement.value = option[valueKey] || option;
      optionElement.textContent = option[textKey] || option;
      selectElement.appendChild(optionElement);
    });
  }

  static populateDataList(dataListElement, options) {
    dataListElement.innerHTML = '';
    
    options.forEach(option => {
      const optionElement = document.createElement('option');
      optionElement.value = typeof option === 'string' ? option : option.value;
      dataListElement.appendChild(optionElement);
    });
  }

  static clearForm(formElement) {
    const inputs = formElement.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      if (input.type === 'checkbox' || input.type === 'radio') {
        input.checked = false;
      } else {
        input.value = '';
      }
    });
  }

  static getFormData(formElement) {
    const formData = {};
    const inputs = formElement.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
      if (input.name) {
        if (input.type === 'checkbox') {
          formData[input.name] = input.checked;
        } else if (input.type === 'radio' && input.checked) {
          formData[input.name] = input.value;
        } else if (input.type !== 'radio') {
          formData[input.name] = input.value;
        }
      }
    });
    
    return formData;
  }

  static setFormData(formElement, data) {
    Object.keys(data).forEach(key => {
      const input = formElement.querySelector(`[name="${key}"]`);
      if (input) {
        if (input.type === 'checkbox') {
          input.checked = data[key];
        } else {
          input.value = data[key];
        }
      }
    });
  }

  /**
   * Table Helper Functions
   */
  
  static addTableRow(tableBody, rowData, rowTemplate) {
    const row = document.createElement('tr');
    row.innerHTML = rowTemplate;
    
    if (rowData) {
      const inputs = row.querySelectorAll('input, select, textarea');
      inputs.forEach((input, index) => {
        if (rowData[index] !== undefined) {
          input.value = rowData[index];
        }
      });
    }
    
    tableBody.appendChild(row);
    return row;
  }

  static removeTableRow(button, callback) {
    this.confirmAction('هل أنت متأكد من حذف هذا الصف؟', () => {
      const row = button.closest('tr');
      row.remove();
      if (callback) callback();
    });
  }

  static updateRowNumbers(tableBody) {
    const rows = tableBody.querySelectorAll('tr');
    rows.forEach((row, index) => {
      const numberCell = row.cells[0];
      if (numberCell) {
        numberCell.textContent = index + 1;
      }
    });
  }

  /**
   * Data Storage Functions
   */
  
  static saveToLocalStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      this.showAlert('حدث خطأ في حفظ البيانات', 'danger');
      return false;
    }
  }

  static loadFromLocalStorage(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      this.showAlert('حدث خطأ في تحميل البيانات', 'danger');
      return null;
    }
  }

  static exportToJSON(data, filename) {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `export_${this.getCurrentDate()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      this.showAlert('تم تصدير البيانات بنجاح', 'success');
    } catch (error) {
      console.error('Error exporting data:', error);
      this.showAlert('حدث خطأ في تصدير البيانات', 'danger');
    }
  }

  static importFromFile(callback) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (event) => {
      const file = event.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          callback(data);
          this.showAlert('تم استيراد البيانات بنجاح', 'success');
        } catch (error) {
          console.error('Error importing file:', error);
          this.showAlert('خطأ في قراءة الملف', 'danger');
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  }

  /**
   * Print Functions
   */
  
  static printPage(title) {
    const originalTitle = document.title;
    if (title) {
      document.title = title;
    }
    
    window.print();
    
    document.title = originalTitle;
  }

  /**
   * Auto-save Functions
   */
  
  static setupAutoSave(key, getDataFunction, interval = 30000) {
    return setInterval(() => {
      try {
        const data = getDataFunction();
        if (data) {
          this.saveToLocalStorage(key, {
            ...data,
            autoSavedAt: new Date().toISOString()
          });
          console.log(`Auto-saved data to ${key} at ${new Date().toLocaleTimeString('ar-EG')}`);
        }
      } catch (error) {
        console.error('Auto-save error:', error);
      }
    }, interval);
  }

  /**
   * Navigation Helper
   */
  
  static setupNavigation() {
    // Mobile menu toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (navToggle && navLinks) {
      navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
      });
    }

    // Active page highlighting
    const currentPage = window.location.pathname.split('/').pop();
    const navItems = document.querySelectorAll('.nav-links a');
    
    navItems.forEach(item => {
      if (item.getAttribute('href') === currentPage) {
        item.classList.add('active');
      }
    });
    
    // Add global toggle function for backward compatibility
    window.toggleMenu = function() {
      const navLinks = document.querySelector('.nav-links');
      if (navLinks) {
        navLinks.classList.toggle('active');
      }
    };
  }

  /**
   * Keyboard Shortcuts
   */
  
  static setupKeyboardShortcuts(shortcuts) {
    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey || event.metaKey) {
        const key = event.key.toLowerCase();
        
        if (shortcuts[key]) {
          event.preventDefault();
          shortcuts[key]();
        }
      }
    });
  }

  /**
   * Error Handling
   */
  
  static handleError(error, userMessage = 'حدث خطأ غير متوقع') {
    console.error('Application Error:', error);
    this.showAlert(userMessage, 'danger');
    
    // In production, you might want to send error to logging service
    // this.logError(error);
  }

  /**
   * Utility Functions
   */
  
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  static generateId() {
    return 'id_' + Math.random().toString(36).substr(2, 9);
  }

  static copyToClipboard(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        this.showAlert('تم نسخ النص', 'success', 2000);
      });
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.showAlert('تم نسخ النص', 'success', 2000);
    }
  }

  /**
   * Enhanced Autocomplete system with database integration
   */
  
  static setupAutocomplete(inputElement, dataSource, options = {}) {
    const {
      minLength = 1,
      maxResults = 10,
      matchType = 'contains', // 'contains', 'starts', 'exact'
      onSelect = null,
      customFilter = null
    } = options;
    
    // Create autocomplete container
    const container = document.createElement('div');
    container.className = 'autocomplete-container';
    container.style.cssText = `
      position: relative;
      display: inline-block;
      width: 100%;
    `;
    
    // Create dropdown
    const dropdown = document.createElement('div');
    dropdown.className = 'autocomplete-dropdown';
    dropdown.style.cssText = `
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid #ddd;
      border-top: none;
      border-radius: 0 0 8px 8px;
      max-height: 200px;
      overflow-y: auto;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      display: none;
    `;
    
    // Style the input
    inputElement.style.cssText += `
      width: 100%;
      box-sizing: border-box;
    `;
    
    // Wrap input in container
    inputElement.parentNode.insertBefore(container, inputElement);
    container.appendChild(inputElement);
    container.appendChild(dropdown);
    
    let currentIndex = -1;
    
    // Filter function
    const filterData = (query) => {
      if (!query || query.length < minLength) return [];
      
      query = query.toLowerCase().trim();
      let filtered = [];
      
      if (customFilter) {
        filtered = customFilter(dataSource, query);
      } else {
        filtered = dataSource.filter(item => {
          const text = (typeof item === 'string' ? item : item.text || item.name || '').toLowerCase();
          switch (matchType) {
            case 'starts':
              return text.startsWith(query);
            case 'exact':
              return text === query;
            case 'contains':
            default:
              return text.includes(query);
          }
        });
      }
      
      return filtered.slice(0, maxResults);
    };
    
    // Render dropdown
    const renderDropdown = (items) => {
      dropdown.innerHTML = '';
      currentIndex = -1;
      
      if (items.length === 0) {
        dropdown.style.display = 'none';
        return;
      }
      
      items.forEach((item, index) => {
        const option = document.createElement('div');
        option.className = 'autocomplete-option';
        option.style.cssText = `
          padding: 12px 16px;
          cursor: pointer;
          border-bottom: 1px solid #f0f0f0;
          transition: background-color 0.2s;
          direction: rtl;
          text-align: right;
        `;
        
        const text = typeof item === 'string' ? item : item.text || item.name || '';
        option.textContent = text;
        
        option.addEventListener('mouseenter', () => {
          clearSelection();
          option.style.backgroundColor = '#e3f2fd';
          currentIndex = index;
        });
        
        option.addEventListener('mouseleave', () => {
          option.style.backgroundColor = '';
        });
        
        option.addEventListener('click', () => {
          selectItem(item);
        });
        
        dropdown.appendChild(option);
      });
      
      dropdown.style.display = 'block';
    };
    
    // Clear selection
    const clearSelection = () => {
      const options = dropdown.querySelectorAll('.autocomplete-option');
      options.forEach(opt => opt.style.backgroundColor = '');
    };
    
    // Select item
    const selectItem = (item) => {
      const text = typeof item === 'string' ? item : item.text || item.name || '';
      inputElement.value = text;
      dropdown.style.display = 'none';
      
      if (onSelect) {
        onSelect(item, inputElement);
      }
      
      // Trigger input event for validation
      inputElement.dispatchEvent(new Event('input', { bubbles: true }));
    };
    
    // Input event listener
    inputElement.addEventListener('input', (e) => {
      const query = e.target.value;
      const filteredItems = filterData(query);
      renderDropdown(filteredItems);
    });
    
    // Keyboard navigation
    inputElement.addEventListener('keydown', (e) => {
      const options = dropdown.querySelectorAll('.autocomplete-option');
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (dropdown.style.display === 'none') {
            const query = inputElement.value;
            const filteredItems = filterData(query);
            renderDropdown(filteredItems);
          } else {
            currentIndex = Math.min(currentIndex + 1, options.length - 1);
            clearSelection();
            if (options[currentIndex]) {
              options[currentIndex].style.backgroundColor = '#e3f2fd';
            }
          }
          break;
          
        case 'ArrowUp':
          e.preventDefault();
          currentIndex = Math.max(currentIndex - 1, -1);
          clearSelection();
          if (currentIndex >= 0 && options[currentIndex]) {
            options[currentIndex].style.backgroundColor = '#e3f2fd';
          }
          break;
          
        case 'Enter':
          e.preventDefault();
          if (currentIndex >= 0 && options[currentIndex]) {
            const item = filterData(inputElement.value)[currentIndex];
            selectItem(item);
          }
          break;
          
        case 'Escape':
          dropdown.style.display = 'none';
          currentIndex = -1;
          break;
      }
    });
    
    // Click outside to close
    document.addEventListener('click', (e) => {
      if (!container.contains(e.target)) {
        dropdown.style.display = 'none';
      }
    });
    
    return {
      updateData: (newData) => {
        dataSource = newData;
      },
      destroy: () => {
        container.parentNode.insertBefore(inputElement, container);
        container.remove();
      }
    };
  }

  /**
   * Initialize autocomplete for all data inputs
   */
  static initializeAutocompleteLists() {
    // Supplier autocomplete
    const supplierInputs = document.querySelectorAll('input[list="suppliersList"], #supplierName, #supplier1, #supplier2, #supplier3');
    if (supplierInputs.length && window.APP_DATA?.SUPPLIERS_DB) {
      const suppliers = Object.keys(window.APP_DATA.SUPPLIERS_DB);
      supplierInputs.forEach(input => {
        if (!input.dataset.autocompleteInitialized) {
          this.setupAutocomplete(input, suppliers, {
            onSelect: (supplier, inputElement) => {
              // Auto-fill supplier details if available
              const supplierData = window.APP_DATA.SUPPLIERS_DB[supplier];
              if (supplierData && inputElement.id.includes('supplier')) {
                this.autoFillSupplierDetails(inputElement, supplierData);
              }
            }
          });
          input.dataset.autocompleteInitialized = 'true';
        }
      });
    }
    
    // Medical items autocomplete
    const itemInputs = document.querySelectorAll('input[list="itemsList"], input[placeholder*="اسم الصنف"], input[placeholder*="الصنف"]');
    if (itemInputs.length && window.APP_DATA?.MEDICAL_ITEMS_DB) {
      const items = Object.keys(window.APP_DATA.MEDICAL_ITEMS_DB);
      itemInputs.forEach(input => {
        if (!input.dataset.autocompleteInitialized) {
          this.setupAutocomplete(input, items, {
            onSelect: (item, inputElement) => {
              const itemData = window.APP_DATA.MEDICAL_ITEMS_DB[item];
              if (itemData && inputElement.closest('tr')) {
                this.autoFillItemDetails(inputElement, itemData);
              }
            }
          });
          input.dataset.autocompleteInitialized = 'true';
        }
      });
    }
    
    // Staff autocomplete
    const staffInputs = document.querySelectorAll('input[list="staffList"], input[placeholder*="اسم"], input[placeholder*="المختص"], input[placeholder*="رئيس"], input[placeholder*="المعتمد"]');
    if (staffInputs.length && window.APP_DATA?.STAFF_DB) {
      const staff = Object.values(window.APP_DATA.STAFF_DB).map(s => s.name);
      staffInputs.forEach(input => {
        if (!input.dataset.autocompleteInitialized) {
          this.setupAutocomplete(input, staff);
          input.dataset.autocompleteInitialized = 'true';
        }
      });
    }
  }
  
  /**
   * Auto-fill supplier details
   */
  static autoFillSupplierDetails(inputElement, supplierData) {
    const form = inputElement.closest('form') || document;
    
    // Try to find and fill related fields
    const addressField = form.querySelector('#supplierAddress, input[placeholder*="عنوان"]');
    const phoneField = form.querySelector('#supplierPhone, input[placeholder*="تليفون"], input[placeholder*="هاتف"]');
    const taxField = form.querySelector('#taxId, input[placeholder*="ضريبي"]');
    
    if (addressField && supplierData.address) addressField.value = supplierData.address;
    if (phoneField && supplierData.phone) phoneField.value = supplierData.phone;
    if (taxField && supplierData.taxId) taxField.value = supplierData.taxId;
  }
  
  /**
   * Auto-fill item details
   */
  static autoFillItemDetails(inputElement, itemData) {
    const row = inputElement.closest('tr');
    if (!row) return;
    
    const unitField = row.querySelector('input[placeholder*="وحدة"], select option, td:nth-child(3) input');
    const priceFields = row.querySelectorAll('input[type="number"], input[placeholder*="سعر"]');
    
    if (unitField && itemData.unit) {
      if (unitField.tagName === 'SELECT') {
        unitField.value = itemData.unit;
      } else {
        unitField.value = itemData.unit;
      }
    }
    
    if (priceFields.length && itemData.averagePrice) {
      priceFields.forEach(field => {
        if (!field.value || field.value === '0') {
          field.value = itemData.averagePrice;
        }
      });
    }
  }

  /**
   * Entity Configuration Management
   */
  
  static initializeEntityConfig() {
    // Set default entity name if not already set
    const entityNameInput = document.getElementById('entityName');
    if (entityNameInput && !entityNameInput.value) {
      entityNameInput.value = 'الإدارة الصحية بسمنود';
    }
    
    const entityDeptInput = document.getElementById('entityDepartment');
    if (entityDeptInput && !entityDeptInput.value) {
      entityDeptInput.value = 'إدارة العقود والمشتريات';
    }
    
    // Add event listeners to update print headers when entity info changes
    if (entityNameInput) {
      entityNameInput.addEventListener('input', () => {
        this.updatePrintHeaders();
      });
    }
    
    if (entityDeptInput) {
      entityDeptInput.addEventListener('input', () => {
        this.updatePrintHeaders();
      });
    }
    
    // Initial update
    this.updatePrintHeaders();
  }
  
  static updatePrintHeaders() {
    const entityName = document.getElementById('entityName')?.value || 'الإدارة الصحية بسمنود';
    const entityDept = document.getElementById('entityDepartment')?.value || 'إدارة العقود والمشتريات';
    
    // Update all print headers on the page
    const printEntityElements = document.querySelectorAll('.print-entity-name');
    printEntityElements.forEach(element => {
      element.innerHTML = `المملكة العربية السعودية<br>${entityName}<br>${entityDept}`;
    });
  }
  
  static getEntityConfig() {
    return {
      entityName: document.getElementById('entityName')?.value || 'الإدارة الصحية بسمنود',
      entityDepartment: document.getElementById('entityDepartment')?.value || 'إدارة العقود والمشتريات'
    };
  }

  /**
   * Authentication Functions
   */
  
  static logout() {
    // Clear any stored session data
    if (typeof(Storage) !== "undefined") {
      localStorage.removeItem('userSession');
      sessionStorage.clear();
    }
    
    // Show confirmation
    const confirmed = confirm('هل أنت متأكد من تسجيل الخروج؟');
    if (confirmed) {
      this.showAlert('تم تسجيل الخروج بنجاح', 'success', 2000);
      
      // Redirect to login page and clear login fields
      setTimeout(() => {
        // Navigate to login page
        window.location.href = 'index.html';
        
        // Clear login form fields after redirect
        setTimeout(() => {
          const usernameField = document.getElementById('username');
          const passwordField = document.getElementById('password');
          if (usernameField) usernameField.value = '';
          if (passwordField) passwordField.value = '';
        }, 100);
      }, 1500);
    }
  }

  /**
   * Menu Toggle Function
   */
  
  static toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
      navLinks.classList.toggle('active');
    }
  }

  /**
   * Initialization
   */
  
  static init() {
    // Set up navigation
    this.setupNavigation();
    
    // Initialize entity configuration
    this.initializeEntityConfig();
    
    // Initialize autocomplete for all data inputs
    this.initializeAutocompleteLists();
    
    // Set current date in date inputs
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
      if (!input.value) {
        input.value = this.getCurrentDate();
      }
    });

    // Set up common keyboard shortcuts
    this.setupKeyboardShortcuts({
      's': () => {
        const saveButton = document.querySelector('.btn-save, [onclick*="save"]');
        if (saveButton) saveButton.click();
      },
      'p': () => {
        const printButton = document.querySelector('.btn-print, [onclick*="print"]');
        if (printButton) printButton.click();
      }
    });

    // Handle uncaught errors
    window.addEventListener('error', (event) => {
      this.handleError(event.error, 'حدث خطأ في التطبيق');
    });

    console.log('ProcurementUtils initialized successfully');
  }
}

// Auto-initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    ProcurementUtils.init();
    
    // Re-initialize autocomplete when new elements are added dynamically
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Small delay to ensure elements are fully rendered
          setTimeout(() => {
            ProcurementUtils.initializeAutocompleteLists();
          }, 100);
        }
      });
    });
    
    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
} else {
  ProcurementUtils.init();
}

// Make utilities globally available
window.ProcurementUtils = ProcurementUtils;

// Global function for backward compatibility
window.initAutocomplete = function() {
  ProcurementUtils.initializeAutocompleteLists();
};

// Global logout function
window.logout = function() {
  ProcurementUtils.logout();
};

// Global menu toggle function
window.toggleMenu = function() {
  ProcurementUtils.toggleMenu();
};