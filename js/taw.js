/**
 * Supply Order Management System
 * Professional order processing with validation
 */

class SupplyOrderManager {
  constructor() {
    this.rowCount = 0;
    this.TAX_RATE = 0.15;
    this.statistics = { totalItems: 0, subtotal: 0, taxAmount: 0, grandTotal: 0 };
    this.init();
  }

  async init() {
    this.setupEventListeners();
    this.populateDataLists();
    this.setCurrentDate();
    this.loadFromMainForm();
    this.updateStatistics();
  }

  setupEventListeners() {
    document.addEventListener('input', (e) => {
      if (e.target.tagName === 'INPUT') {
        this.validateField(e.target);
        if (e.target.closest('#itemsTable')) {
          this.updateRow(e.target);
        }
        if (e.target.id === 'supplierName') {
          this.fillSupplierInfo(e.target.value);
        }
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
          case 's': e.preventDefault(); this.saveData(); break;
          case 'p': e.preventDefault(); window.print(); break;
          case 'n': e.preventDefault(); this.addRow(); break;
        }
      }
    });
  }

  populateDataLists() {
    try {
      if (window.APP_DATA?.SUPPLIERS_DB) {
        const suppliersList = document.getElementById('suppliersList');
        if (suppliersList) {
          suppliersList.innerHTML = '';
          Object.keys(window.APP_DATA.SUPPLIERS_DB).forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            suppliersList.appendChild(option);
          });
        }
      }

      if (window.APP_DATA?.MEDICAL_ITEMS_DB) {
        const itemsList = document.getElementById('itemsList');
        if (itemsList) {
          itemsList.innerHTML = '';
          Object.keys(window.APP_DATA.MEDICAL_ITEMS_DB).forEach(item => {
            const option = document.createElement('option');
            option.value = item;
            itemsList.appendChild(option);
          });
        }
      }

      if (window.APP_DATA?.STAFF_DB) {
        const staffList = document.getElementById('staffList');
        if (staffList) {
          staffList.innerHTML = '';
          Object.values(window.APP_DATA.STAFF_DB).forEach(staff => {
            const option = document.createElement('option');
            option.value = staff.name;
            staffList.appendChild(option);
          });
        }
      }
    } catch (error) {
      console.error('Error loading data lists:', error);
      this.showMessage('خطأ في تحميل البيانات', 'error');
    }
  }

  validateField(field) {
    const value = field.value.trim();
    const container = field.closest('.enhanced-input') || field.parentElement;
    
    container.classList.remove('error', 'success');
    
    if (field.hasAttribute('required') && !value) {
      container.classList.add('error');
      return false;
    }
    
    if (field.type === 'number' && value && (isNaN(value) || parseFloat(value) < 0)) {
      container.classList.add('error');
      return false;
    }
    
    container.classList.add('success');
    return true;
  }

  setCurrentDate() {
    const today = new Date().toISOString().split('T')[0];
    const orderDate = document.getElementById('orderDate');
    if (orderDate && !orderDate.value) {
      orderDate.value = today;
    }
  }

  fillSupplierInfo(supplierName) {
    if (window.APP_DATA?.SUPPLIERS_DB && window.APP_DATA.SUPPLIERS_DB[supplierName]) {
      const supplier = window.APP_DATA.SUPPLIERS_DB[supplierName];
      
      const addressField = document.getElementById('supplierAddress');
      const phoneField = document.getElementById('supplierPhone');
      const taxIdField = document.getElementById('taxId');
      
      if (addressField) addressField.value = supplier.address || '';
      if (phoneField) phoneField.value = supplier.phone || '';
      if (taxIdField) taxIdField.value = supplier.taxId || '';
    }
  }

  addRow(item = '', unit = '', qty = 1, price = 0, notes = '') {
    this.rowCount++;
    const tbody = document.querySelector('#itemsTable tbody');
    const tr = document.createElement('tr');
    
    tr.innerHTML = `
      <td>${this.rowCount}</td>
      <td><input type="text" list="itemsList" placeholder="اسم الصنف" value="${item}" onchange="ProcurementUtils.initializeAutocompleteLists()"></td>
      <td><input type="text" placeholder="الوحدة" value="${unit}"></td>
      <td><input type="number" min="1" placeholder="الكمية" value="${qty}" oninput="supplyOrderManager.updateRow(this)"></td>
      <td><input type="number" step="0.01" placeholder="سعر الوحدة" value="${price}" oninput="supplyOrderManager.updateRow(this)"></td>
      <td class="subtotal">0.00</td>
      <td class="tax-amount">0.00</td>
      <td class="total-amount">0.00</td>
      <td><input type="text" placeholder="ملاحظات" value="${notes}"></td>
      <td>
        <button type="button" class="btn btn-sm btn-danger" onclick="supplyOrderManager.removeRow(this)" title="حذف الصف">
          🗑️
        </button>
      </td>
    `;
    
    tbody.appendChild(tr);
    this.updateRow(tr.querySelector('input[type="number"]'));
    
    // Initialize autocomplete for the new row
    setTimeout(() => {
      ProcurementUtils.initializeAutocompleteLists();
    }, 100);
  }

  removeRow(button) {
    const row = button.closest('tr');
    if (row) {
      row.remove();
      this.updateRowNumbers();
      this.updateStatistics();
    }
  }

  updateRowNumbers() {
    const rows = document.querySelectorAll('#itemsTable tbody tr');
    rows.forEach((row, index) => {
      const firstCell = row.cells[0];
      if (firstCell) {
        firstCell.textContent = index + 1;
      }
    });
    this.rowCount = rows.length;
  }

  updateRow(input) {
    const row = input.closest('tr');
    const quantity = parseFloat(row.cells[3].querySelector('input').value) || 0;
    const unitPrice = parseFloat(row.cells[4].querySelector('input').value) || 0;
    
    const subtotal = quantity * unitPrice;
    const taxAmount = subtotal * this.TAX_RATE;
    const total = subtotal + taxAmount;
    
    row.cells[5].textContent = subtotal.toFixed(2);
    row.cells[6].textContent = taxAmount.toFixed(2);
    row.cells[7].textContent = total.toFixed(2);
    
    this.updateStatistics();
  }

  updateStatistics() {
    const rows = document.querySelectorAll('#itemsTable tbody tr');
    let totalItems = 0;
    let subtotal = 0;
    let taxAmount = 0;
    let grandTotal = 0;
    
    rows.forEach(row => {
      const quantity = parseFloat(row.cells[3].querySelector('input')?.value) || 0;
      const unitPrice = parseFloat(row.cells[4].querySelector('input')?.value) || 0;
      const rowSubtotal = quantity * unitPrice;
      const rowTax = rowSubtotal * this.TAX_RATE;
      
      totalItems += quantity;
      subtotal += rowSubtotal;
      taxAmount += rowTax;
      grandTotal += rowSubtotal + rowTax;
    });
    
    this.statistics = { totalItems, subtotal, taxAmount, grandTotal };
    
    // Update UI elements
    document.getElementById('totalItems').textContent = totalItems;
    document.getElementById('subtotal').textContent = subtotal.toFixed(2) + ' ج.م';
    document.getElementById('taxAmount').textContent = taxAmount.toFixed(2) + ' ج.م';
    document.getElementById('grandTotal').textContent = grandTotal.toFixed(2) + ' ج.م';
    document.getElementById('totalFinal').textContent = grandTotal.toFixed(2);
  }

  clearTable() {
    if (confirm('هل أنت متأكد من مسح جميع البيانات؟')) {
      const tbody = document.querySelector('#itemsTable tbody');
      tbody.innerHTML = '';
      this.rowCount = 0;
      this.updateStatistics();
      this.showMessage('تم مسح جميع البيانات بنجاح', 'success');
    }
  }

  loadFromMainForm() {
    try {
      const savedData = localStorage.getItem('mainFormData');
      if (savedData) {
        const data = JSON.parse(savedData);
        
        // Fill supplier information
        const supplierField = document.getElementById('supplierName');
        if (supplierField && data.supplier1) {
          supplierField.value = data.supplier1;
          this.fillSupplierInfo(data.supplier1);
        }
        
        const orderDateField = document.getElementById('orderDate');
        if (orderDateField && data.date) {
          orderDateField.value = data.date;
        }
        
        // Fill signatures
        const signatures = ['officer', 'head', 'approved'];
        if (data.footer) {
          signatures.forEach((sig, index) => {
            const field = document.getElementById(sig);
            if (field && data.footer[index]) {
              field.value = data.footer[index];
            }
          });
        }
        
        // Fill table data
        if (data.table && data.table.length > 0) {
          data.table.forEach(row => {
            if (row.length >= 5) {
              this.addRow(row[1] || '', row[2] || '', row[3] || 0, row[4] || 0, row[8] || '');
            }
          });
        }
        
        this.showMessage('تم تحميل البيانات من النموذج الرئيسي', 'success');
      }
    } catch (error) {
      console.error('Error loading data from main form:', error);
    }
  }

  saveData() {
    try {
      const data = {
        supplierName: document.getElementById('supplierName').value,
        supplierAddress: document.getElementById('supplierAddress').value,
        supplierPhone: document.getElementById('supplierPhone').value,
        orderDate: document.getElementById('orderDate').value,
        taxId: document.getElementById('taxId').value,
        orderNumber: document.getElementById('orderNumber').value,
        items: [],
        signatures: {
          officer: document.getElementById('officer').value,
          head: document.getElementById('head').value,
          approved: document.getElementById('approved').value
        },
        statistics: this.statistics,
        timestamp: new Date().toISOString()
      };
      
      // Collect table data
      const rows = document.querySelectorAll('#itemsTable tbody tr');
      rows.forEach(row => {
        const inputs = row.querySelectorAll('input');
        if (inputs.length >= 5) {
          data.items.push({
            item: inputs[0].value,
            unit: inputs[1].value,
            quantity: parseFloat(inputs[2].value) || 0,
            unitPrice: parseFloat(inputs[3].value) || 0,
            notes: inputs[4].value
          });
        }
      });
      
      localStorage.setItem('supplyOrderData', JSON.stringify(data));
      this.showMessage('تم حفظ أمر التوريد بنجاح', 'success');
    } catch (error) {
      console.error('Error saving data:', error);
      this.showMessage('حدث خطأ في الحفظ: ' + error.message, 'error');
    }
  }

  loadData() {
    try {
      const savedData = localStorage.getItem('supplyOrderData');
      if (savedData) {
        const data = JSON.parse(savedData);
        
        // Fill form fields
        Object.keys(data).forEach(key => {
          const field = document.getElementById(key);
          if (field && typeof data[key] === 'string') {
            field.value = data[key];
          }
        });
        
        // Fill signatures
        if (data.signatures) {
          Object.keys(data.signatures).forEach(key => {
            const field = document.getElementById(key);
            if (field) field.value = data.signatures[key];
          });
        }
        
        // Fill table
        if (data.items) {
          const tbody = document.querySelector('#itemsTable tbody');
          tbody.innerHTML = '';
          this.rowCount = 0;
          
          data.items.forEach(item => {
            this.addRow(item.item, item.unit, item.quantity, item.unitPrice, item.notes);
          });
        }
        
        this.showMessage('تم تحميل البيانات المحفوظة', 'success');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      this.showMessage('حدث خطأ في تحميل البيانات', 'error');
    }
  }

  showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.style.display = show ? 'flex' : 'none';
    }
  }

  showMessage(message, type) {
    const alertId = type === 'success' ? 'alertSuccess' : 
                   type === 'warning' ? 'alertWarning' : 'alertError';
    const alertElement = document.getElementById(alertId);
    
    if (alertElement) {
      alertElement.textContent = message;
      alertElement.style.display = 'block';
      
      setTimeout(() => {
        alertElement.style.display = 'none';
      }, 4000);
    } else if (window.ProcurementUtils?.showAlert) {
      window.ProcurementUtils.showAlert(message, type === 'error' ? 'danger' : type);
    }
  }
}

// Initialize and make globally available
let supplyOrderManager;

document.addEventListener('DOMContentLoaded', function() {
  supplyOrderManager = new SupplyOrderManager();
  // Initialize entity configuration
  if (window.Utils && Utils.initializeEntityConfig) {
    Utils.initializeEntityConfig();
  }
});

// Global functions for backward compatibility
window.addRow = function() {
  if (supplyOrderManager) supplyOrderManager.addRow();
};

window.clearTable = function() {
  if (supplyOrderManager) supplyOrderManager.clearTable();
};

window.saveData = function() {
  if (supplyOrderManager) supplyOrderManager.saveData();
};

window.loadData = function() {
  if (supplyOrderManager) supplyOrderManager.loadData();
};

window.loadFromMain = function() {
  if (supplyOrderManager) supplyOrderManager.loadFromMainForm();
};

window.printOrder = function() {
  window.print();
};