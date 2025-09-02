/**
 * Estimation Management System (Moka.html)
 * Professional cost estimation and risk analysis
 */

class EstimationManager {
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
    this.populateDataLists();
    this.setCurrentDate();
    this.loadSavedData();
    this.addInitialRows();
    this.startAutoSave();
    this.hideLoadingOverlay();
  }

  setupEventListeners() {
    // Tax rate change listener
    const taxRateInput = document.getElementById('taxRate');
    if (taxRateInput) {
      taxRateInput.addEventListener('input', () => {
        this.updateAllCalculations();
        this.updateTaxDisplay();
      });
    }

    // Input validation and calculations
    document.addEventListener('input', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
        this.validateField(e.target);
        if (e.target.type === 'number') {
          this.calculateRow(e.target);
        }
      }
    });

    // Risk level change handler
    document.addEventListener('change', (e) => {
      if (e.target.tagName === 'SELECT' && e.target.closest('td')) {
        this.updateRiskColor(e.target);
      }
    });

    // Keyboard shortcuts for efficiency
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
          case 's': e.preventDefault(); this.saveData(); break;
          case 'p': e.preventDefault(); window.print(); break;
          case '+': e.preventDefault(); this.addEstimationRow(); break;
          case 'r': e.preventDefault(); this.generateRecommendations(); break;
        }
      }
    });

    // Table row management
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-row-btn')) {
        this.removeRow(e.target);
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
      
      if (value) container.classList.add('success');
    }
    return true;
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

      // Populate departments list
      if (window.APP_DATA?.DEPARTMENTS_DB) {
        const departmentsList = document.getElementById('departmentsList');
        if (departmentsList) {
          departmentsList.innerHTML = '';
          Object.keys(window.APP_DATA.DEPARTMENTS_DB).forEach(dept => {
            const option = document.createElement('option');
            option.value = dept;
            departmentsList.appendChild(option);
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
    const estimationDate = document.getElementById('estimationDate');
    const preparedDate = document.getElementById('preparedDate');
    
    if (estimationDate && !estimationDate.value) estimationDate.value = today;
    if (preparedDate && !preparedDate.value) preparedDate.value = today;
  }

  addInitialRows() {
    // Add 5 initial rows if table is empty
    const tbody = document.getElementById('estimationTableBody');
    if (tbody && tbody.children.length === 0) {
      for (let i = 0; i < 5; i++) {
        this.addEstimationRow();
      }
    }
  }

  addEstimationRow() {
    this.rowCount++;
    const tbody = document.getElementById('estimationTableBody');
    if (!tbody) return;
    
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="text-center">${this.rowCount}</td>
      <td>
        <input type="text" 
               list="itemsList" 
               placeholder="اسم الصنف" 
               class="table-input"
               data-autocomplete="items">
      </td>
      <td>
        <input type="text" 
               placeholder="الوحدة" 
               class="table-input">
      </td>
      <td>
        <input type="number" 
               value="1" 
               min="0" 
               step="1" 
               class="table-input quantity-input"
               oninput="estimationManager.calculateRow(this)">
      </td>
      <td>
        <input type="number" 
               placeholder="0.00" 
               step="0.01" 
               class="table-input price-input"
               oninput="estimationManager.calculateRow(this)">
      </td>
      <td class="calculated-cell text-center font-weight-bold">0.00</td>
      <td>
        <input type="number" 
               placeholder="0.00" 
               step="0.01" 
               class="table-input market-avg-input"
               oninput="estimationManager.calculateRow(this)">
      </td>
      <td class="calculated-cell text-center">0.00</td>
      <td class="calculated-cell text-center">0.00</td>
      <td>
        <select class="table-input risk-select" onchange="estimationManager.updateRiskColor(this)">
          <option value="منخفضة">منخفضة</option>
          <option value="متوسطة">متوسطة</option>
          <option value="عالية">عالية</option>
        </select>
      </td>
      <td>
        <input type="text" 
               placeholder="ملاحظات" 
               class="table-input notes-input">
      </td>
      <td class="text-center">
        <button type="button" 
                class="btn btn-sm btn-danger remove-row-btn" 
                title="حذف الصف">
          🗑️
        </button>
      </td>
    `;
    
    tbody.appendChild(tr);
    
    // Focus on the item input
    const itemInput = tr.querySelector('input[list="itemsList"]');
    if (itemInput) itemInput.focus();
    
    this.calculateEstimation();
    this.updateStatistics();
    
    // Initialize autocomplete for new inputs
    setTimeout(() => {
      ProcurementUtils.initializeAutocompleteLists();
    }, 100);
  }

  removeRow(btn) {
    if (confirm('هل أنت متأكد من حذف هذا العنصر؟')) {
      const row = btn.closest('tr');
      if (row) {
        row.remove();
        this.updateRowNumbers();
        this.calculateEstimation();
        this.updateStatistics();
        this.showMessage('تم حذف العنصر بنجاح', 'success');
      }
    }
  }

  updateRowNumbers() {
    const rows = document.querySelectorAll('#estimationTableBody tr');
    rows.forEach((row, index) => {
      row.cells[0].textContent = index + 1;
    });
    this.rowCount = rows.length;
  }

  calculateRow(input) {
    const row = input.closest('tr');
    if (!row) return;
    
    const qty = parseFloat(row.cells[3].querySelector('input').value) || 0;
    const price = parseFloat(row.cells[4].querySelector('input').value) || 0;
    const marketAvg = parseFloat(row.cells[6].querySelector('input').value) || 0;
    
    // Calculate total for this row
    const total = qty * price;
    row.cells[5].textContent = total.toFixed(2);
    
    // Calculate min/max estimates based on market average ±10%
    if (marketAvg > 0) {
      const minPrice = marketAvg * 0.9;
      const maxPrice = marketAvg * 1.1;
      row.cells[7].textContent = (minPrice * qty).toFixed(2);
      row.cells[8].textContent = (maxPrice * qty).toFixed(2);
    }
    
    this.calculateEstimation();
  }

  calculateEstimation() {
    let totalQty = 0, totalPrice = 0, totalMarket = 0, totalMin = 0, totalMax = 0;
    let lowRisk = 0, mediumRisk = 0, highRisk = 0;
    const rows = document.querySelectorAll('#estimationTableBody tr');
    
    rows.forEach(row => {
      const qty = parseFloat(row.cells[3].querySelector('input').value) || 0;
      const price = parseFloat(row.cells[4].querySelector('input').value) || 0;
      const total = parseFloat(row.cells[5].textContent) || 0;
      const marketAvg = parseFloat(row.cells[6].querySelector('input').value) || 0;
      const minVal = parseFloat(row.cells[7].textContent) || 0;
      const maxVal = parseFloat(row.cells[8].textContent) || 0;
      const risk = row.cells[9].querySelector('select').value;
      
      totalQty += qty;
      totalPrice += total;
      totalMarket += marketAvg * qty;
      totalMin += minVal;
      totalMax += maxVal;
      
      // Count risk levels
      switch(risk) {
        case 'منخفضة': lowRisk++; break;
        case 'متوسطة': mediumRisk++; break;
        case 'عالية': highRisk++; break;
      }
    });
    
    // Update table totals
    this.updateElement('grandTotal', totalPrice.toFixed(2));
    this.updateElement('avgMarketTotal', totalMarket.toFixed(2));
    this.updateElement('minExpectedTotal', totalMin.toFixed(2));
    this.updateElement('maxExpectedTotal', totalMax.toFixed(2));
    
    // Update summary statistics
    this.updateElement('totalItems', rows.length);
    this.updateElement('totalQuantity', totalQty);
    this.updateElement('avgUnitPrice', totalQty > 0 ? (totalPrice / totalQty).toFixed(2) + ' ج.م' : '0.00 ج.م');
    this.updateElement('estimationTotal', totalPrice.toFixed(2) + ' ج.م');
    
    // Update risk analysis
    this.updateElement('lowRiskItems', lowRisk);
    this.updateElement('mediumRiskItems', mediumRisk);
    this.updateElement('highRiskItems', highRisk);
    
    // Calculate overall risk
    let overallRisk = '-';
    if (highRisk > 0) overallRisk = 'عالية';
    else if (mediumRisk > 0) overallRisk = 'متوسطة';
    else if (lowRisk > 0) overallRisk = 'منخفضة';
    this.updateElement('overallRisk', overallRisk);
    
    // Update financial analysis
    this.updateElement('minTotalCost', totalMin.toFixed(2) + ' ج.م');
    this.updateElement('maxTotalCost', totalMax.toFixed(2) + ' ج.م');
    
    const savingsPercentage = totalMax > 0 ? ((totalMax - totalMin) / totalMax) * 100 : 0;
    this.updateElement('savingsPercentage', savingsPercentage.toFixed(1) + '%');
    
    const recommendedBudget = (totalPrice * (1 + this.TAX_RATE) + totalMarket) / 2;
    this.updateElement('recommendedBudget', recommendedBudget.toFixed(2) + ' ج.م');
    
    this.updateStatistics();
  }

  updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  updateRiskColor(select) {
    const cell = select.closest('td');
    const value = select.value;
    
    // Reset risk classes
    cell.classList.remove('risk-low', 'risk-medium', 'risk-high');
    
    // Apply appropriate risk styling
    switch(value) {
      case 'منخفضة':
        cell.classList.add('risk-low');
        cell.style.backgroundColor = '#d4edda';
        break;
      case 'متوسطة':
        cell.classList.add('risk-medium');
        cell.style.backgroundColor = '#fff3cd';
        break;
      case 'عالية':
        cell.classList.add('risk-high');
        cell.style.backgroundColor = '#f8d7da';
        break;
    }
    
    this.calculateEstimation();
  }

  generateRecommendations() {
    const total = parseFloat(document.getElementById('grandTotal')?.textContent) || 0;
    const overallRisk = document.getElementById('overallRisk')?.textContent || '-';
    const itemCount = document.querySelectorAll('#estimationTableBody tr').length;
    const lowRisk = parseInt(document.getElementById('lowRiskItems')?.textContent) || 0;
    const highRisk = parseInt(document.getElementById('highRiskItems')?.textContent) || 0;
    
    const recSection = document.getElementById('recommendationsSection');
    const recList = document.getElementById('recommendationsList');
    
    if (!recSection || !recList) return;
    
    recList.innerHTML = '';
    
    // Generate intelligent recommendations based on analysis
    const recommendations = [];
    
    if (total > 500000) {
      recommendations.push('💡 يُنصح بتقسيم المناقصة إلى مراحل متعددة لتقليل المخاطر المالية.');
    }
    
    if (overallRisk === 'عالية') {
      recommendations.push('⚠️ يجب مراجعة الأصناف ذات المخاطر العالية بعناية قبل الاعتماد النهائي.');
      recommendations.push('🔍 يُفضل طلب عينات أو مواصفات إضافية للأصناف عالية المخاطر.');
    }
    
    if (total < 50000) {
      recommendations.push('✅ يمكن إتمام عملية الشراء مباشرة لعدم تجاوز الحد المالي المحدد.');
    }
    
    if (itemCount > 20) {
      recommendations.push('📈 يُنصح بتجميع الأصناف المتشابهة في مجموعات لتسهيل المراجعة والاعتماد.');
    }
    
    if (overallRisk === 'منخفضة' && lowRisk > highRisk * 2) {
      recommendations.push('🎉 مقايسة ممتازة مع مخاطر منخفضة - يمكن المضي قدماً بثقة.');
    }
    
    if (total > 100000 && total <= 500000) {
      recommendations.push('💰 يُفضل الحصول على موافقات إضافية من الإدارة العليا للمبلغ.');
    }
    
    const savingsPercentage = parseFloat(document.getElementById('savingsPercentage')?.textContent) || 0;
    if (savingsPercentage > 15) {
      recommendations.push('💸 توجد فرصة ممتازة لتوفير التكاليف - يُنصح بالتفاوض على الأسعار.');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('📈 المقايسة جاهزة للمراجعة والاعتماد النهائي.');
    }
    
    // Display recommendations
    recommendations.forEach(rec => {
      const div = document.createElement('div');
      div.className = 'recommendation-item';
      div.style.cssText = `
        padding: 12px 16px;
        margin: 8px 0;
        background: #f8f9fa;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        border-right: 4px solid #007bff;
      `;
      div.textContent = rec;
      recList.appendChild(div);
    });
    
    recSection.style.display = 'block';
    this.showMessage('تم توليد التوصيات بنجاح', 'success');
  }

  loadData() {
    try {
      // Load from price analysis system (taf.html)
      const tafData = localStorage.getItem('tafData');
      if (tafData) {
        const data = JSON.parse(tafData);
        
        // Clear existing rows
        const tbody = document.getElementById('estimationTableBody');
        if (tbody) {
          tbody.innerHTML = '';
          this.rowCount = 0;
          
          if (data.tableData && data.tableData.length > 0) {
            data.tableData.forEach(rowData => {
              this.addEstimationRow();
              const lastRow = tbody.querySelector('tr:last-child');
              const inputs = lastRow.querySelectorAll('input');
              
              if (inputs.length >= 5) {
                inputs[0].value = rowData.item || '';
                inputs[1].value = rowData.unit || 'قطعة';
                inputs[2].value = parseFloat(rowData.qty) || 1;
                inputs[3].value = parseFloat(rowData.price1) || 0;
                
                // Calculate market average from available prices
                const prices = [
                  parseFloat(rowData.price1) || 0,
                  parseFloat(rowData.price2) || 0,
                  parseFloat(rowData.price3) || 0
                ].filter(p => p > 0);
                
                if (prices.length > 0) {
                  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
                  inputs[4].value = avgPrice.toFixed(2);
                }
                
                this.calculateRow(inputs[2]);
              }
            });
            
            this.showMessage('تم تحميل البيانات من نظام تفريغ الأسعار بنجاح', 'success');
          } else {
            this.showMessage('لا توجد بيانات صالحة في نظام تفريغ الأسعار', 'warning');
          }
        }
      } else {
        this.showMessage('لا توجد بيانات محفوظة في نظام تفريغ الأسعار', 'warning');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      this.showMessage('حدث خطأ في تحميل البيانات', 'error');
    }
  }

  saveData() {
    try {
      const data = this.collectFormData();
      localStorage.setItem('estimationData', JSON.stringify(data));
      this.statistics.lastSaved = new Date();
      this.showMessage('تم حفظ بيانات المقايسة بنجاح', 'success');
    } catch (error) {
      console.error('Save error:', error);
      this.showMessage('حدث خطأ في حفظ البيانات', 'error');
    }
  }

  collectFormData() {
    const formData = {
      estimationDate: document.getElementById('estimationDate')?.value || '',
      preparedBy: document.getElementById('preparedBy')?.value || '',
      reviewedBy: document.getElementById('reviewedBy')?.value || '',
      approvedBy: document.getElementById('approvedBy')?.value || '',
      preparedDate: document.getElementById('preparedDate')?.value || '',
      reviewedDate: document.getElementById('reviewedDate')?.value || '',
      approvedDate: document.getElementById('approvedDate')?.value || '',
      items: []
    };

    // Collect table data
    const rows = document.querySelectorAll('#estimationTableBody tr');
    rows.forEach(row => {
      const inputs = row.querySelectorAll('input, select');
      if (inputs.length >= 6) {
        formData.items.push({
          item: inputs[0].value,
          unit: inputs[1].value,
          quantity: inputs[2].value,
          price: inputs[3].value,
          marketAvg: inputs[4].value,
          risk: inputs[5].value,
          notes: inputs[6]?.value || '',
          total: row.cells[5].textContent,
          minEstimate: row.cells[7].textContent,
          maxEstimate: row.cells[8].textContent
        });
      }
    });

    formData.timestamp = new Date().toISOString();
    formData.statistics = this.statistics;
    
    return formData;
  }

  loadSavedData() {
    try {
      const savedData = localStorage.getItem('estimationData');
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
    const fields = ['estimationDate', 'preparedBy', 'reviewedBy', 'approvedBy', 'preparedDate', 'reviewedDate', 'approvedDate'];
    fields.forEach(fieldId => {
      const element = document.getElementById(fieldId);
      if (element && data[fieldId]) {
        element.value = data[fieldId];
      }
    });

    // Fill table data
    if (data.items && data.items.length > 0) {
      const tbody = document.getElementById('estimationTableBody');
      if (tbody) {
        tbody.innerHTML = '';
        this.rowCount = 0;
        
        data.items.forEach(item => {
          this.addEstimationRow();
          const lastRow = tbody.querySelector('tr:last-child');
          const inputs = lastRow.querySelectorAll('input, select');
          
          if (inputs.length >= 6) {
            inputs[0].value = item.item || '';
            inputs[1].value = item.unit || '';
            inputs[2].value = item.quantity || '';
            inputs[3].value = item.price || '';
            inputs[4].value = item.marketAvg || '';
            inputs[5].value = item.risk || 'منخفضة';
            if (inputs[6]) inputs[6].value = item.notes || '';
            
            this.calculateRow(inputs[2]);
            this.updateRiskColor(inputs[5]);
          }
        });
      }
    }

    this.calculateEstimation();
    this.updateStatistics();
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
      const tbody = document.getElementById('estimationTableBody');
      if (tbody) {
        tbody.innerHTML = '';
        this.rowCount = 0;
      }
      
      // Reset to initial state
      this.setCurrentDate();
      this.addInitialRows();
      
      // Hide recommendations
      const recSection = document.getElementById('recommendationsSection');
      if (recSection) recSection.style.display = 'none';
      
      localStorage.removeItem('estimationData');
      this.showMessage('تم مسح جميع البيانات', 'success');
    }
  }

  startAutoSave() {
    this.autoSaveInterval = setInterval(() => {
      this.saveData();
    }, 120000); // Auto-save every 2 minutes
  }

  updateStatistics() {
    const rows = document.querySelectorAll('#estimationTableBody tr');
    this.statistics.totalItems = rows.length;
    
    let totalValue = 0;
    rows.forEach(row => {
      const total = parseFloat(row.cells[5].textContent) || 0;
      totalValue += total;
    });
    this.statistics.totalValue = totalValue;
  }

  hideLoadingOverlay() {
    setTimeout(() => {
      const overlay = document.getElementById('loadingOverlay');
      if (overlay) {
        overlay.style.display = 'none';
      }
    }, 1000);
  }

  updateAllCalculations() {
    // Recalculate all rows when tax rate changes
    const tbody = document.getElementById('estimationTableBody');
    if (tbody) {
      const rows = tbody.querySelectorAll('tr');
      rows.forEach(row => {
        const firstInput = row.querySelector('input[type="number"]');
        if (firstInput) {
          this.calculateRow(firstInput);
        }
      });
    }
    this.updateTotals();
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
let estimationManager;

document.addEventListener('DOMContentLoaded', function() {
  estimationManager = new EstimationManager();
});

// Global functions for backward compatibility
window.addEstimationRow = function() {
  if (estimationManager) estimationManager.addEstimationRow();
};

window.removeRow = function(btn) {
  if (estimationManager) estimationManager.removeRow(btn);
};

window.loadData = function() {
  if (estimationManager) estimationManager.loadData();
};

window.generateRecommendations = function() {
  if (estimationManager) estimationManager.generateRecommendations();
};

window.clearForm = function() {
  if (estimationManager) estimationManager.clearForm();
};