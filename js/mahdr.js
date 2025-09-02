/**
 * Meeting Management System (Mahdr.html)
 * Professional meeting minutes and procurement documentation
 */

class MeetingManager {
  constructor() {
    this.itemCount = 0;
    this.autoSaveInterval = null;
    this.statistics = { totalItems: 0, totalValue: 0, lastSaved: null };
    this.init();
  }

  async init() {
    this.setupEventListeners();
    this.populateDataLists();
    this.setCurrentDate();
    this.loadSavedData();
    this.addInitialRows();
    this.startAutoSave();
    this.hideLoadingOverlay();
  }

  setupEventListeners() {
    // Input validation and auto-calculation
    document.addEventListener('input', (e) => {
      if (e.target.tagName === 'INPUT') {
        this.validateField(e.target);
        if (e.target.type === 'number') {
          this.calculateTotal(e.target);
        }
      }
    });

    // Keyboard shortcuts for productivity
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
          case 's': e.preventDefault(); this.saveData(); break;
          case 'p': e.preventDefault(); window.print(); break;
          case '+': e.preventDefault(); this.addItemRow(); break;
          case 'Delete': e.preventDefault(); this.clearAllItems(); break;
        }
      }
    });

    // Table row interaction
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-item-btn')) {
        this.removeItemRow(e.target);
      }
    });
  }

  validateField(field) {
    const value = field.value.trim();
    const container = field.closest('.enhanced-input') || field.parentElement;
    
    if (container && container.classList) {
      container.classList.remove('error', 'success');
      
      if (field.hasAttribute('required') && !value) {
        container.classList.add('error');
        return false;
      }
      
      if (field.type === 'number' && value && (isNaN(value) || parseFloat(value) < 0)) {
        container.classList.add('error');
        return false;
      }
      
      if (field.type === 'email' && value && !this.isValidEmail(value)) {
        container.classList.add('error');
        return false;
      }
      
      if (value) container.classList.add('success');
    }
    return true;
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  populateDataLists() {
    try {
      // Populate suppliers list
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
      
      // Populate medical items list
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
      
      // Populate staff members list
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

  setCurrentDate() {
    const today = new Date().toISOString().split('T')[0];
    const meetingDate = document.getElementById('meetingDate');
    if (meetingDate && !meetingDate.value) {
      meetingDate.value = today;
    }
  }

  addInitialRows() {
    // Add 3 initial rows if table is empty
    const tbody = document.getElementById('itemsTableBody');
    if (tbody && tbody.children.length === 0) {
      for (let i = 0; i < 3; i++) {
        this.addItemRow();
      }
    }
  }

  addItemRow() {
    this.itemCount++;
    const tbody = document.getElementById('itemsTableBody');
    if (!tbody) return;
    
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <input type="text" 
               list="itemsList" 
               placeholder="اسم الصنف" 
               class="form-control table-input"
               data-autocomplete="items">
      </td>
      <td>
        <input type="number" 
               placeholder="0.00" 
               step="0.01" 
               class="form-control table-input price-input"
               oninput="meetingManager.calculateTotal(this)">
      </td>
      <td>
        <input type="number" 
               value="1" 
               min="1" 
               class="form-control table-input quantity-input"
               oninput="meetingManager.calculateTotal(this)">
      </td>
      <td>
        <input type="text" 
               list="suppliersList" 
               placeholder="اسم المورد" 
               class="form-control table-input"
               data-autocomplete="suppliers">
      </td>
      <td class="total-cell text-center font-weight-bold">0.00</td>
      <td class="text-center">
        <button type="button" 
                class="btn btn-sm btn-danger remove-item-btn" 
                title="حذف الصف">
          🗑️
        </button>
      </td>
    `;
    
    tbody.appendChild(tr);
    
    // Focus on the item input for immediate data entry
    const itemInput = tr.querySelector('input[list="itemsList"]');
    if (itemInput) itemInput.focus();
    
    this.updateStatistics();
    
    // Initialize autocomplete for new inputs
    setTimeout(() => {
      ProcurementUtils.initializeAutocompleteLists();
    }, 100);
  }

  removeItemRow(btn) {
    if (confirm('هل أنت متأكد من حذف هذا العنصر؟')) {
      const row = btn.closest('tr');
      if (row) {
        row.remove();
        this.calculateGrandTotal();
        this.updateStatistics();
        this.showMessage('تم حذف العنصر بنجاح', 'success');
      }
    }
  }

  calculateTotal(input) {
    const row = input.closest('tr');
    if (!row) return;
    
    const priceInput = row.querySelector('.price-input');
    const quantityInput = row.querySelector('.quantity-input');
    const totalCell = row.querySelector('.total-cell');
    
    const price = parseFloat(priceInput?.value) || 0;
    const quantity = parseFloat(quantityInput?.value) || 0;
    const total = price * quantity;
    
    if (totalCell) {
      totalCell.textContent = total.toFixed(2);
    }
    
    this.calculateGrandTotal();
    this.updateStatistics();
  }

  calculateGrandTotal() {
    let grandTotal = 0;
    document.querySelectorAll('.total-cell').forEach(cell => {
      grandTotal += parseFloat(cell.textContent) || 0;
    });
    
    const estimatedAmount = document.getElementById('estimatedAmount');
    if (estimatedAmount) {
      estimatedAmount.value = grandTotal.toFixed(2);
    }
    
    // Update summary statistics
    const totalDisplay = document.querySelector('.total-display');
    if (totalDisplay) {
      totalDisplay.textContent = `${grandTotal.toFixed(2)} ج.م`;
    }
    
    return grandTotal;
  }

  clearAllItems() {
    if (confirm('هل أنت متأكد من مسح جميع العناصر؟')) {
      const tbody = document.getElementById('itemsTableBody');
      if (tbody) {
        tbody.innerHTML = '';
        this.itemCount = 0;
        this.calculateGrandTotal();
        this.updateStatistics();
        this.showMessage('تم مسح جميع العناصر', 'success');
      }
    }
  }

  loadFromTaf() {
    try {
      const tafData = localStorage.getItem('tafData');
      if (tafData) {
        const data = JSON.parse(tafData);
        const tbody = document.getElementById('itemsTableBody');
        
        if (tbody && data.tableData && data.tableData.length > 0) {
          tbody.innerHTML = '';
          this.itemCount = 0;
          
          data.tableData.forEach(rowData => {
            this.addItemFromTaf(rowData);
          });
          
          this.calculateGrandTotal();
          this.showMessage('تم تحميل البيانات من نظام تفريغ الأسعار بنجاح', 'success');
        } else {
          this.showMessage('لا توجد بيانات صالحة في نظام تفريغ الأسعار', 'warning');
        }
      } else {
        this.showMessage('لا توجد بيانات محفوظة في نظام تفريغ الأسعار', 'warning');
      }
    } catch (error) {
      console.error('Error loading TAF data:', error);
      this.showMessage('حدث خطأ في تحميل البيانات', 'error');
    }
  }

  addItemFromTaf(rowData) {
    const tbody = document.getElementById('itemsTableBody');
    if (!tbody) return;
    
    const tr = document.createElement('tr');
    const item = rowData.item || '';
    const price = parseFloat(rowData.price1) || 0;
    const quantity = parseFloat(rowData.qty) || 1;
    const total = price * quantity;
    
    tr.innerHTML = `
      <td>
        <input type="text" value="${item}" class="form-control table-input">
      </td>
      <td>
        <input type="number" value="${price}" step="0.01" class="form-control table-input price-input" oninput="meetingManager.calculateTotal(this)">
      </td>
      <td>
        <input type="number" value="${quantity}" min="1" class="form-control table-input quantity-input" oninput="meetingManager.calculateTotal(this)">
      </td>
      <td>
        <input type="text" class="form-control table-input" list="suppliersList">
      </td>
      <td class="total-cell text-center font-weight-bold">${total.toFixed(2)}</td>
      <td class="text-center">
        <button type="button" class="btn btn-sm btn-danger remove-item-btn" title="حذف الصف">🗑️</button>
      </td>
    `;
    
    tbody.appendChild(tr);
    this.itemCount++;
  }

  saveData() {
    try {
      const data = this.collectFormData();
      localStorage.setItem('meetingData', JSON.stringify(data));
      this.statistics.lastSaved = new Date();
      this.showMessage('تم حفظ بيانات المحضر بنجاح', 'success');
    } catch (error) {
      console.error('Save error:', error);
      this.showMessage('حدث خطأ في حفظ البيانات', 'error');
    }
  }

  collectFormData() {
    const formData = {
      meetingDate: document.getElementById('meetingDate')?.value || '',
      estimatedAmount: document.getElementById('estimatedAmount')?.value || '',
      items: []
    };

    // Collect table data
    const rows = document.querySelectorAll('#itemsTableBody tr');
    rows.forEach(row => {
      const inputs = row.querySelectorAll('input');
      if (inputs.length >= 4) {
        formData.items.push({
          item: inputs[0].value,
          price: inputs[1].value,
          quantity: inputs[2].value,
          supplier: inputs[3].value,
          total: row.querySelector('.total-cell')?.textContent || '0.00'
        });
      }
    });

    // Collect other form fields
    const otherInputs = document.querySelectorAll('input:not(.table-input), textarea, select');
    otherInputs.forEach(input => {
      if (input.id) {
        formData[input.id] = input.value;
      }
    });

    formData.timestamp = new Date().toISOString();
    formData.statistics = this.statistics;
    
    return formData;
  }

  loadSavedData() {
    try {
      const savedData = localStorage.getItem('meetingData');
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

  populateFormData(data) {
    // Fill basic form fields
    Object.keys(data).forEach(key => {
      const element = document.getElementById(key);
      if (element && typeof data[key] === 'string') {
        element.value = data[key];
      }
    });

    // Fill table data
    if (data.items && data.items.length > 0) {
      const tbody = document.getElementById('itemsTableBody');
      if (tbody) {
        tbody.innerHTML = '';
        this.itemCount = 0;
        
        data.items.forEach(item => {
          this.addItemFromTaf(item);
        });
      }
    }

    this.calculateGrandTotal();
    this.updateStatistics();
  }

  startAutoSave() {
    this.autoSaveInterval = setInterval(() => {
      this.saveData();
    }, 60000); // Auto-save every minute
  }

  updateStatistics() {
    const rows = document.querySelectorAll('#itemsTableBody tr');
    this.statistics.totalItems = rows.length;
    this.statistics.totalValue = this.calculateGrandTotal();
    
    // Update UI if statistics elements exist
    const statsElements = {
      totalItems: this.statistics.totalItems,
      totalValue: `${this.statistics.totalValue.toFixed(2)} ج.م`
    };
    
    Object.entries(statsElements).forEach(([key, value]) => {
      const element = document.getElementById(key);
      if (element) element.textContent = value;
    });
  }

  clearForm() {
    if (confirm('هل أنت متأكد من مسح جميع البيانات؟')) {
      // Clear all inputs
      document.querySelectorAll('input, textarea, select').forEach(input => {
        if (input.type === 'checkbox' || input.type === 'radio') {
          input.checked = false;
        } else {
          input.value = '';
        }
      });
      
      // Clear table
      const tbody = document.getElementById('itemsTableBody');
      if (tbody) {
        tbody.innerHTML = '';
        this.itemCount = 0;
      }
      
      // Reset to initial state
      this.setCurrentDate();
      this.addInitialRows();
      this.updateStatistics();
      
      localStorage.removeItem('meetingData');
      this.showMessage('تم مسح جميع البيانات', 'success');
    }
  }

  hideLoadingOverlay() {
    setTimeout(() => {
      const overlay = document.getElementById('loadingOverlay');
      if (overlay) {
        overlay.style.display = 'none';
      }
    }, 1000);
  }

  showMessage(message, type = 'success') {
    if (window.ProcurementUtils?.showAlert) {
      window.ProcurementUtils.showAlert(message, type === 'error' ? 'danger' : type);
    } else {
      // Fallback message display
      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      toast.textContent = message;
      
      toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 24px;
        background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#fff3cd'};
        color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#856404'};
        border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : '#ffeaa7'};
        border-radius: 8px;
        z-index: 10000;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
      `;
      
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
      }, 100);
      
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }
  }
}

// Initialize and make globally available
let meetingManager;

document.addEventListener('DOMContentLoaded', function() {
  meetingManager = new MeetingManager();
});

// Global functions for backward compatibility
window.addItemRow = function() {
  if (meetingManager) meetingManager.addItemRow();
};

window.removeItemRow = function(btn) {
  if (meetingManager) meetingManager.removeItemRow(btn);
};

window.loadFromTaf = function() {
  if (meetingManager) meetingManager.loadFromTaf();
};

window.clearAllItems = function() {
  if (meetingManager) meetingManager.clearAllItems();
};

window.saveAndExport = function() {
  if (meetingManager) {
    meetingManager.saveData();
    setTimeout(() => window.print(), 1000);
  }
};