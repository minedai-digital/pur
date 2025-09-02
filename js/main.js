/**
 * Main Form Management System
 * Professional form handling with advanced features
 */

class MainFormManager {
  constructor() {
    this.rowCount = 0;
    this.autoSaveInterval = null;
    this.statistics = { totalItems: 0, totalValue: 0, lastSaved: null };
    this.init();
  }

  async init() {
    this.setupEventListeners();
    this.populateDataLists();
    this.setCurrentDate();
    this.loadSavedData();
    this.setupValidation();
    this.startAutoSave();
    this.updateStatistics();
  }

  setupEventListeners() {
    // Input validation and auto-update
    document.addEventListener('input', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
        this.validateField(e.target);
        this.updateStatistics();
        
        // Update supplier headers when supplier names change
        if (e.target.id && e.target.id.includes('supplier')) {
          this.updateSupplierHeaders();
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
          case 'Delete': e.preventDefault(); this.clearTable(); break;
        }
      }
    });

    // Table row management
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-row')) {
        this.removeRow(e.target);
      }
    });
  }

  setupValidation() {
    const requiredFields = document.querySelectorAll('[required]');
    requiredFields.forEach(field => {
      field.addEventListener('blur', () => this.validateField(field));
    });
  }

  populateDataLists() {
    try {
      // Populate suppliers
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

      // Populate medical items
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

      // Populate staff
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
      console.error('Data loading error:', error);
      this.showMessage('خطأ في تحميل البيانات الأساسية', 'error');
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
    const dateField = document.getElementById('date');
    const committeeDateField = document.getElementById('committeeDate');
    
    if (dateField && !dateField.value) dateField.value = today;
    if (committeeDateField && !committeeDateField.value) committeeDateField.value = today;
  }

  updateSupplierHeaders() {
    ['supplier1', 'supplier2', 'supplier3'].forEach((id, index) => {
      const supplierName = document.getElementById(id)?.value || '';
      const header = document.getElementById(`th-${id}`);
      if (header) {
        header.textContent = supplierName || `المورد ${index + 1}`;
      }
    });
  }

  addRow(itemData = null) {
    this.rowCount++;
    const tbody = document.querySelector('#itemsTable tbody');
    const tr = document.createElement('tr');
    
    tr.innerHTML = `
      <td>${this.rowCount}</td>
      <td><input type="text" list="itemsList" placeholder="اسم الصنف" value="${itemData?.item || ''}" onchange="ProcurementUtils.initializeAutocompleteLists()"></td>
      <td><input type="text" placeholder="الوحدة" value="${itemData?.unit || ''}"></td>
      <td><input type="number" min="1" placeholder="الكمية" value="${itemData?.quantity || 1}" oninput="mainFormManager.updateRowTotals(this)"></td>
      <td><input type="number" step="0.01" placeholder="السعر" value="${itemData?.price1 || ''}" oninput="mainFormManager.updateRowTotals(this)"></td>
      <td><input type="number" step="0.01" placeholder="السعر" value="${itemData?.price2 || ''}" oninput="mainFormManager.updateRowTotals(this)"></td>
      <td><input type="number" step="0.01" placeholder="السعر" value="${itemData?.price3 || ''}" oninput="mainFormManager.updateRowTotals(this)"></td>
      <td><input type="text" placeholder="ملاحظات" value="${itemData?.notes || ''}"></td>
      <td>
        <button type="button" class="btn btn-sm btn-danger remove-row" title="حذف الصف">
          🗑️
        </button>
      </td>
    `;
    
    tbody.appendChild(tr);
    this.updateStatistics();
    
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

  updateRowTotals(input) {
    const row = input.closest('tr');
    const quantity = parseFloat(row.cells[3].querySelector('input').value) || 0;
    const prices = [
      parseFloat(row.cells[4].querySelector('input').value) || 0,
      parseFloat(row.cells[5].querySelector('input').value) || 0,
      parseFloat(row.cells[6].querySelector('input').value) || 0
    ];
    
    // Update totals
    this.updateGrandTotals();
  }

  updateGrandTotals() {
    const rows = document.querySelectorAll('#itemsTable tbody tr');
    let totals = [0, 0, 0];
    
    rows.forEach(row => {
      const quantity = parseFloat(row.cells[3].querySelector('input').value) || 0;
      for (let i = 0; i < 3; i++) {
        const price = parseFloat(row.cells[4 + i].querySelector('input').value) || 0;
        totals[i] += quantity * price;
      }
    });
    
    ['total1', 'total2', 'total3'].forEach((id, index) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = totals[index].toFixed(2);
      }
    });
  }

  clearTable() {
    if (confirm('هل أنت متأكد من مسح جميع البيانات؟')) {
      const tbody = document.querySelector('#itemsTable tbody');
      tbody.innerHTML = '';
      this.rowCount = 0;
      this.updateGrandTotals();
      this.updateStatistics();
      this.showMessage('تم مسح جميع البيانات', 'success');
    }
  }

  saveData() {
    try {
      const data = this.collectFormData();
      localStorage.setItem('mainFormData', JSON.stringify(data));
      this.statistics.lastSaved = new Date();
      this.showMessage('تم حفظ البيانات بنجاح', 'success');
    } catch (error) {
      console.error('Save error:', error);
      this.showMessage('حدث خطأ في حفظ البيانات', 'error');
    }
  }

  loadSavedData() {
    try {
      const savedData = localStorage.getItem('mainFormData');
      if (savedData) {
        const data = JSON.parse(savedData);
        this.populateFormData(data);
        this.showMessage('تم تحميل البيانات المحفوظة', 'success');
      }
    } catch (error) {
      console.error('Load error:', error);
      this.showMessage('حدث خطأ في تحميل البيانات', 'error');
    }
  }

  collectFormData() {
    return {
      date: document.getElementById('date').value,
      supplier1: document.getElementById('supplier1').value,
      supplier2: document.getElementById('supplier2').value,
      supplier3: document.getElementById('supplier3').value,
      committeeDate: document.getElementById('committeeDate').value,
      taxRate: document.getElementById('taxRate').value,
      table: Array.from(document.querySelectorAll('#itemsTable tbody tr')).map(tr => {
        return Array.from(tr.querySelectorAll('input')).map(inp => inp.value);
      }),
      footer: Array.from(document.querySelectorAll('.signatures-section input')).map(inp => inp.value),
      timestamp: new Date().toISOString()
    };
  }

  populateFormData(data) {
    // Fill basic fields
    if (data.date) document.getElementById('date').value = data.date;
    if (data.supplier1) document.getElementById('supplier1').value = data.supplier1;
    if (data.supplier2) document.getElementById('supplier2').value = data.supplier2;
    if (data.supplier3) document.getElementById('supplier3').value = data.supplier3;
    if (data.committeeDate) document.getElementById('committeeDate').value = data.committeeDate;
    if (data.taxRate) document.getElementById('taxRate').value = data.taxRate;
    
    // Fill table data
    if (data.table && data.table.length > 0) {
      const tbody = document.querySelector('#itemsTable tbody');
      tbody.innerHTML = '';
      this.rowCount = 0;
      
      data.table.forEach(rowData => {
        if (rowData.length >= 8) {
          this.addRow({
            item: rowData[1],
            unit: rowData[2],
            quantity: rowData[3],
            price1: rowData[4],
            price2: rowData[5],
            price3: rowData[6],
            notes: rowData[7]
          });
        }
      });
    }
    
    // Update headers and totals
    this.updateSupplierHeaders();
    this.updateGrandTotals();
  }

  exportData() {
    try {
      const data = this.collectFormData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `main-form-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      this.showMessage('تم تصدير البيانات بنجاح', 'success');
    } catch (error) {
      console.error('Export error:', error);
      this.showMessage('حدث خطأ في تصدير البيانات', 'error');
    }
  }

  importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (event) => {
      const file = event.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          this.populateFormData(data);
          this.showMessage('تم تحميل البيانات بنجاح', 'success');
        } catch (error) {
          console.error('Load error:', error);
          this.showMessage('خطأ في قراءة الملف', 'error');
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  }

  startAutoSave() {
    this.autoSaveInterval = setInterval(() => {
      this.saveData();
    }, 60000); // Auto-save every minute
  }

  updateStatistics() {
    const rows = document.querySelectorAll('#itemsTable tbody tr');
    this.statistics.totalItems = rows.length;
    
    let totalValue = 0;
    rows.forEach(row => {
      const quantity = parseFloat(row.cells[3].querySelector('input').value) || 0;
      const price = parseFloat(row.cells[4].querySelector('input').value) || 0;
      totalValue += quantity * price;
    });
    this.statistics.totalValue = totalValue;
    
    // Update UI statistics
    const statElements = {
      'totalItems': this.statistics.totalItems,
      'completedRows': rows.length,
      'totalValue': `${totalValue.toFixed(2)} ج.م`
    };
    
    Object.entries(statElements).forEach(([key, value]) => {
      const element = document.querySelector(`.stat-card h3:contains("${key}") + .stat-value`);
      if (element) element.textContent = value;
    });
  }

  showMessage(message, type = 'success') {
    if (window.ProcurementUtils?.showAlert) {
      window.ProcurementUtils.showAlert(message, type === 'error' ? 'danger' : type);
    } else {
      console.log(`${type.toUpperCase()}: ${message}`);
    }
  }
}

// Initialize and make globally available
let mainFormManager;

document.addEventListener('DOMContentLoaded', function() {
  mainFormManager = new MainFormManager();
});

// Global functions for backward compatibility
window.addRow = function() {
  if (mainFormManager) mainFormManager.addRow();
};

window.clearTable = function() {
  if (mainFormManager) mainFormManager.clearTable();
};

window.saveAndGo = function() {
  if (mainFormManager) {
    mainFormManager.saveData();
    setTimeout(() => {
      window.location.href = 'taf.html';
    }, 1000);
  }
};