/**
 * Price Analysis Management System
 * Professional price comparison and analysis
 */

class PriceAnalysisManager {
  constructor() {
    this.rowCount = 0;
    this.autoSaveInterval = null;
    this.statistics = { totalItems: 0, totalValue: 0, lastSaved: null };
    this.init();
  }

  // Get current tax rate from input field
  get TAX_RATE() {
    return (parseFloat(document.getElementById('taxRate')?.value) || 14) / 100;
  }

  async init() {
    this.setupEventListeners();
    this.populateSupplierData();
    this.loadSavedData();
    this.setCurrentDate();
    this.updateTotals();
    this.startAutoSave();
    this.addInitialRows();
  }

  setupEventListeners() {
    // Tax rate change listener
    const taxRateInput = document.getElementById('taxRate');
    if (taxRateInput) {
      taxRateInput.addEventListener('input', () => {
        this.updateTotals();
        this.updateTaxDisplay();
      });
    }

    document.addEventListener('input', (e) => {
      if (e.target.tagName === 'INPUT') {
        this.validateField(e.target);
        if (e.target.type === 'number') {
          this.updateRow(e.target);
        }
        if (e.target.id && e.target.id.includes('supplier') && e.target.id.includes('Name')) {
          this.updateSupplierHeaders();
        }
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
          case 's': e.preventDefault(); this.saveData(); break;
          case 'p': e.preventDefault(); window.print(); break;
          case 'n': e.preventDefault(); this.addEmptyRow(); break;
        }
      }
    });
  }

  populateSupplierData() {
    try {
      const mainData = localStorage.getItem('mainFormData');
      if (mainData) {
        const parsedData = JSON.parse(mainData);
        
        // Fill supplier names
        ['supplier1', 'supplier2', 'supplier3'].forEach((supplier, index) => {
          const nameField = document.getElementById(`supplier${index + 1}Name`);
          if (nameField && parsedData[supplier]) {
            nameField.value = parsedData[supplier];
          }
        });
        
        // Fill date
        const dateField = document.getElementById('orderDate');
        if (dateField && parsedData.date) {
          dateField.value = parsedData.date;
        }
        
        this.updateSupplierHeaders();
      }
    } catch (error) {
      console.error('Error loading supplier data:', error);
    }
  }

  loadSavedData() {
    try {
      const mainData = localStorage.getItem('mainFormData');
      if (mainData) {
        const parsedData = JSON.parse(mainData);
        if (parsedData.table && parsedData.table.length > 0) {
          parsedData.table.forEach(rowData => this.addRowFromMain(rowData));
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  addRowFromMain(rowData) {
    this.rowCount++;
    const tbody = document.querySelector('#itemsTable tbody');
    const tr = document.createElement('tr');
    const item = rowData.item || rowData[1] || '';
    const unit = rowData.unit || rowData[2] || '';
    const qty = parseFloat(rowData.qty || rowData[3]) || 1;
    const price1 = parseFloat(rowData.price1 || rowData[4]) || 0;
    const price2 = parseFloat(rowData.price2 || rowData[5]) || 0;
    const price3 = parseFloat(rowData.price3 || rowData[6]) || 0;

    tr.innerHTML = `
      <td>${this.rowCount}</td>
      <td><input type="text" list="itemsList" placeholder="اسم الصنف" value="${item}" onchange="ProcurementUtils.initializeAutocompleteLists()"></td>
      <td><input type="text" placeholder="الوحدة" value="${unit}"></td>
      <td><input type="number" min="1" placeholder="الكمية" value="${qty}" oninput="priceAnalysisManager.updateRow(this)"></td>
      <td><input type="number" step="0.01" placeholder="السعر" value="${price1}" oninput="priceAnalysisManager.updateRow(this)"></td>
      <td class="price-after-tax">0.00</td>
      <td><input type="number" step="0.01" placeholder="السعر" value="${price2}" oninput="priceAnalysisManager.updateRow(this)"></td>
      <td class="price-after-tax">0.00</td>
      <td><input type="number" step="0.01" placeholder="السعر" value="${price3}" oninput="priceAnalysisManager.updateRow(this)"></td>
      <td class="price-after-tax">0.00</td>
      <td>
        <button type="button" class="btn btn-sm btn-danger" onclick="priceAnalysisManager.removeRow(this)" title="حذف الصف">
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

  addEmptyRow() {
    this.rowCount++;
    const tbody = document.querySelector('#itemsTable tbody');
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${this.rowCount}</td>
      <td><input type="text" list="itemsList" placeholder="اسم الصنف" onchange="ProcurementUtils.initializeAutocompleteLists()"></td>
      <td><input type="text" placeholder="الوحدة"></td>
      <td><input type="number" min="1" placeholder="الكمية" value="1" oninput="priceAnalysisManager.updateRow(this)"></td>
      <td><input type="number" step="0.01" placeholder="السعر" oninput="priceAnalysisManager.updateRow(this)"></td>
      <td class="price-after-tax">0.00</td>
      <td><input type="number" step="0.01" placeholder="السعر" oninput="priceAnalysisManager.updateRow(this)"></td>
      <td class="price-after-tax">0.00</td>
      <td><input type="number" step="0.01" placeholder="السعر" oninput="priceAnalysisManager.updateRow(this)"></td>
      <td class="price-after-tax">0.00</td>
      <td>
        <button type="button" class="btn btn-sm btn-danger" onclick="priceAnalysisManager.removeRow(this)" title="حذف الصف">
          🗑️
        </button>
      </td>
    `;

    tbody.appendChild(tr);
    
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
      this.updateTotals();
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
    
    // Update prices after tax for each supplier
    [4, 6, 8].forEach((cellIndex, supplierIndex) => {
      const priceInput = row.cells[cellIndex].querySelector('input');
      const price = parseFloat(priceInput.value) || 0;
      const total = quantity * price;
      const afterTax = total * (1 + this.TAX_RATE);
      
      const afterTaxCell = row.cells[cellIndex + 1];
      afterTaxCell.textContent = afterTax.toFixed(2);
      
      // Highlight best price
      afterTaxCell.classList.remove('highlight');
    });
    
    this.highlightBestPrice(row);
    this.updateTotals();
  }

  highlightBestPrice(row) {
    const afterTaxCells = [row.cells[5], row.cells[7], row.cells[9]];
    const values = afterTaxCells.map(cell => parseFloat(cell.textContent) || 0);
    const validValues = values.filter(v => v > 0);
    
    if (validValues.length > 0) {
      const minValue = Math.min(...validValues);
      afterTaxCells.forEach((cell, index) => {
        cell.classList.remove('highlight');
        if (values[index] === minValue && values[index] > 0) {
          cell.classList.add('highlight');
        }
      });
    }
  }

  updateSupplierHeaders() {
    ['supplier1', 'supplier2', 'supplier3'].forEach((id, index) => {
      const nameInput = document.getElementById(`${id}Name`);
      const header = document.getElementById(`th-${id}`);
      
      if (nameInput && header) {
        header.textContent = nameInput.value || `المورد ${index + 1}`;
      }
    });
  }

  updateTotals() {
    try {
      const rows = document.querySelectorAll('#itemsTable tbody tr');
      let totals = [0, 0, 0, 0, 0, 0]; // before tax, after tax for each supplier
      
      rows.forEach(row => {
        const quantity = parseFloat(row.cells[3].querySelector('input').value) || 0;
        const price1 = parseFloat(row.cells[4].querySelector('input').value) || 0;
        const price2 = parseFloat(row.cells[6].querySelector('input').value) || 0;
        const price3 = parseFloat(row.cells[8].querySelector('input').value) || 0;
        
        const total1 = quantity * price1;
        const total2 = quantity * price2;
        const total3 = quantity * price3;
        
        totals[0] += total1;
        totals[1] += total1 * (1 + this.TAX_RATE);
        totals[2] += total2;
        totals[3] += total2 * (1 + this.TAX_RATE);
        totals[4] += total3;
        totals[5] += total3 * (1 + this.TAX_RATE);
      });

      // Update footer totals
      document.getElementById('total1').textContent = totals[0].toFixed(2);
      document.getElementById('total1After').textContent = totals[1].toFixed(2);
      document.getElementById('total2').textContent = totals[2].toFixed(2);
      document.getElementById('total2After').textContent = totals[3].toFixed(2);
      document.getElementById('total3').textContent = totals[4].toFixed(2);
      document.getElementById('total3After').textContent = totals[5].toFixed(2);

      this.highlightMinPrices();
      this.updateAnalysisSummary(totals);
    } catch (error) {
      console.error('Error updating totals:', error);
    }
  }

  highlightMinPrices() {
    document.querySelectorAll('.highlight').forEach(cell => {
      cell.classList.remove('highlight');
    });

    const rows = document.querySelectorAll('#itemsTable tbody tr');
    rows.forEach(row => {
      this.highlightBestPrice(row);
    });
  }

  updateAnalysisSummary(totals) {
    const afterTaxTotals = [totals[1], totals[3], totals[5]];
    const validTotals = afterTaxTotals.filter(t => t > 0);
    
    if (validTotals.length > 0) {
      const minTotal = Math.min(...validTotals);
      const maxTotal = Math.max(...validTotals);
      const savings = maxTotal - minTotal;
      const savingsPercentage = maxTotal > 0 ? ((savings / maxTotal) * 100).toFixed(1) : 0;
      
      const bestSupplierIndex = afterTaxTotals.indexOf(minTotal);
      const supplierNames = [
        document.getElementById('supplier1Name').value || 'المورد الأول',
        document.getElementById('supplier2Name').value || 'المورد الثاني',
        document.getElementById('supplier3Name').value || 'المورد الثالث'
      ];
      
      // Update summary cards
      document.getElementById('totalAnalyzedItems').textContent = document.querySelectorAll('#itemsTable tbody tr').length;
      document.getElementById('bestSupplierName').textContent = supplierNames[bestSupplierIndex];
      document.getElementById('totalSavings').textContent = `${savings.toFixed(2)} ج.م`;
      document.getElementById('savingsPercentage').textContent = `${savingsPercentage}%`;
    }
  }

  clearTable() {
    if (confirm('هل أنت متأكد من مسح جميع البيانات؟')) {
      const tbody = document.querySelector('#itemsTable tbody');
      tbody.innerHTML = '';
      this.rowCount = 0;
      this.updateTotals();
      this.showMessage('تم مسح جميع البيانات', 'success');
    }
  }

  loadFromMain() {
    this.populateSupplierData();
    this.loadSavedData();
    this.updateTotals();
    this.showMessage('تم تحميل البيانات من النموذج الرئيسي', 'success');
  }

  addInitialRows() {
    // Add 3 empty rows if no data exists
    const tbody = document.querySelector('#itemsTable tbody');
    if (tbody.children.length === 0) {
      for (let i = 0; i < 3; i++) {
        this.addEmptyRow();
      }
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
    const dateField = document.getElementById('orderDate');
    if (dateField && !dateField.value) {
      dateField.value = today;
    }
  }

  saveData() {
    try {
      const data = {
        suppliers: {
          supplier1: document.getElementById('supplier1Name').value,
          supplier2: document.getElementById('supplier2Name').value,
          supplier3: document.getElementById('supplier3Name').value
        },
        orderDate: document.getElementById('orderDate').value,
        items: [],
        signatures: {
          officer: document.getElementById('officer').value,
          head: document.getElementById('head').value,
          approved: document.getElementById('approved').value,
          committee1: document.getElementById('committee1').value,
          committee2: document.getElementById('committee2').value,
          committee3: document.getElementById('committee3').value
        },
        ...this.statistics,
        savedAt: new Date().toISOString()
      };

      // Collect table data
      const rows = document.querySelectorAll('#itemsTable tbody tr');
      rows.forEach(row => {
        const inputs = row.querySelectorAll('input');
        if (inputs.length >= 6) {
          data.items.push({
            item: inputs[0].value,
            unit: inputs[1].value,
            quantity: parseFloat(inputs[2].value) || 0,
            price1: parseFloat(inputs[3].value) || 0,
            price2: parseFloat(inputs[4].value) || 0,
            price3: parseFloat(inputs[5].value) || 0
          });
        }
      });

      localStorage.setItem('tafData', JSON.stringify(data));
      this.statistics.lastSaved = new Date();
      this.showMessage('تم حفظ البيانات بنجاح', 'success');
    } catch (error) {
      console.error('Error saving data:', error);
      this.showMessage('حدث خطأ في حفظ البيانات', 'error');
    }
  }

  startAutoSave() {
    this.autoSaveInterval = setInterval(() => {
      this.saveData();
    }, 120000); // Auto-save every 2 minutes
  }

  performAnalysis() {
    try {
      this.updateTotals();
      const totals = [
        parseFloat(document.getElementById('total1After').textContent),
        parseFloat(document.getElementById('total2After').textContent),
        parseFloat(document.getElementById('total3After').textContent)
      ];

      const winner = totals.indexOf(Math.min(...totals.filter(t => t > 0)));
      const supplierNames = [
        document.getElementById('supplier1Name').value || 'المورد الأول',
        document.getElementById('supplier2Name').value || 'المورد الثاني',
        document.getElementById('supplier3Name').value || 'المورد الثالث'
      ];

      this.showMessage(`أفضل عرض: ${supplierNames[winner]}`, 'success');
    } catch (error) {
      this.showMessage('حدث خطأ في تحليل الأسعار', 'error');
    }
  }

  updateTaxDisplay() {
    // Update any tax rate displays in the UI
    const taxRatePercent = (this.TAX_RATE * 100).toFixed(1);
    document.querySelectorAll('.tax-display').forEach(element => {
      element.textContent = `${taxRatePercent}%`;
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
let priceAnalysisManager;

document.addEventListener('DOMContentLoaded', function() {
  priceAnalysisManager = new PriceAnalysisManager();
  // Initialize entity configuration
  if (window.Utils && Utils.initializeEntityConfig) {
    Utils.initializeEntityConfig();
  }
});

// Global functions for backward compatibility
window.addEmptyRow = function() {
  if (priceAnalysisManager) priceAnalysisManager.addEmptyRow();
};

window.removeRow = function(btn) {
  if (priceAnalysisManager) priceAnalysisManager.removeRow(btn);
};

window.clearTable = function() {
  if (priceAnalysisManager) priceAnalysisManager.clearTable();
};

window.saveData = function() {
  if (priceAnalysisManager) priceAnalysisManager.saveData();
};

window.performAnalysis = function() {
  if (priceAnalysisManager) priceAnalysisManager.performAnalysis();
};

window.loadFromMain = function() {
  if (priceAnalysisManager) priceAnalysisManager.loadFromMain();
};