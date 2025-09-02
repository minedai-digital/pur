/**
 * Tax Management System (Custom.html)
 * Professional tax calculation and compliance management
 */

class TaxManager {
  constructor() {
    this.autoSaveInterval = null;
    this.statistics = { totalValue: 0, taxValue: 0, lastSaved: null };
    this.defaultTaxRate = 15; // 15% VAT
    this.init();
  }

  async init() {
    this.setupEventListeners();
    this.setCurrentDate();
    this.setDefaults();
    this.loadSavedData();
    this.calculateTax();
    this.startAutoSave();
    this.hideLoadingOverlay();
  }

  setupEventListeners() {
    // Input validation and auto-calculation
    document.addEventListener('input', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        this.validateField(e.target);
        
        // Auto-calculate when tax-related fields change
        if (e.target.id === 'workValue' || e.target.id === 'taxRate') {
          this.calculateTax();
        }
      }
    });
    
    // Keyboard shortcuts for efficiency
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
          case 's': e.preventDefault(); this.saveData(); break;
          case 'p': e.preventDefault(); window.print(); break;
          case 'n': e.preventDefault(); this.clearForm(); break;
          case 'c': e.preventDefault(); this.calculateTax(); break;
        }
      }
    });

    // Tax rate preset buttons (if any)
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('tax-rate-btn')) {
        const rate = parseFloat(e.target.dataset.rate) || this.defaultTaxRate;
        document.getElementById('taxRate').value = rate;
        this.calculateTax();
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
      
      if (field.type === 'tel' && value && !this.isValidPhone(value)) {
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

  isValidPhone(phone) {
    const phoneRegex = /^[0-9+\-\s()]{7,}$/;
    return phoneRegex.test(phone);
  }

  setCurrentDate() {
    const today = new Date().toISOString().split('T')[0];
    const signatureDate = document.getElementById('signatureDate');
    const contractDate = document.getElementById('contractDate');
    const issueDate = document.getElementById('issueDate');
    
    if (signatureDate && !signatureDate.value) signatureDate.value = today;
    if (contractDate && !contractDate.value) contractDate.value = today;
    if (issueDate && !issueDate.value) issueDate.value = today;
  }

  setDefaults() {
    // Set default values for key fields
    const entityName = document.getElementById('entityName');
    const taxRate = document.getElementById('taxRate');
    const declaration = document.getElementById('declaration');
    
    if (entityName && !entityName.value) {
      entityName.value = 'مستشفى الملك فهد المركزي بجازان';
    }
    
    if (taxRate && !taxRate.value) {
      taxRate.value = this.defaultTaxRate;
    }
    
    if (declaration && !declaration.value) {
      declaration.value = 'أقر أنا المورد الموقع أدناه بأن جميع البيانات المذكورة أعلاه صحيحة ودقيقة وأنني أتحمل المسؤولية القانونية عن أي خطأ في هذه البيانات.';
    }
  }

  calculateTax() {
    const workValue = parseFloat(document.getElementById('workValue')?.value) || 0;
    const taxRate = parseFloat(document.getElementById('taxRate')?.value) || this.defaultTaxRate;
    
    // Calculate tax amount
    const taxValue = (workValue * taxRate) / 100;
    const totalValue = workValue + taxValue;
    
    // Update display elements
    this.updateElement('baseValue', workValue.toFixed(2) + ' ريال سعودي');
    this.updateElement('taxValue', taxValue.toFixed(2) + ' ريال سعودي');
    this.updateElement('totalValue', totalValue.toFixed(2) + ' ريال سعودي');
    this.updateElement('taxRateDisplay', taxRate + '%');
    
    // Update tax breakdown if elements exist
    this.updateElement('taxAmount', taxValue.toFixed(2));
    this.updateElement('grandTotal', totalValue.toFixed(2));
    
    // Update statistics
    this.statistics.totalValue = totalValue;
    this.statistics.taxValue = taxValue;
    
    // Update visual indicators
    this.updateTaxIndicators(taxRate, taxValue);
    
    // Auto-save after calculation
    this.saveData();
  }

  updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  updateTaxIndicators(taxRate, taxValue) {
    // Update tax compliance indicators
    const complianceLevel = this.assessTaxCompliance(taxRate);
    const complianceElement = document.querySelector('.tax-compliance-indicator');
    
    if (complianceElement) {
      complianceElement.className = `tax-compliance-indicator ${complianceLevel.class}`;
      complianceElement.textContent = complianceLevel.text;
    }
    
    // Update tax summary
    const summaryElement = document.querySelector('.tax-summary');
    if (summaryElement) {
      summaryElement.innerHTML = `
        <div class="tax-summary-item">
          <span>معدل الضريبة:</span>
          <span class="tax-rate-value">${taxRate}%</span>
        </div>
        <div class="tax-summary-item">
          <span>مبلغ الضريبة:</span>
          <span class="tax-amount-value">${taxValue.toFixed(2)} ريال</span>
        </div>
        <div class="tax-summary-item">
          <span>حالة الامتثال:</span>
          <span class="compliance-status ${complianceLevel.class}">${complianceLevel.text}</span>
        </div>
      `;
    }
  }

  assessTaxCompliance(taxRate) {
    // Assess tax compliance based on Saudi VAT regulations
    if (taxRate === 15) {
      return { class: 'compliant', text: 'متوافق مع اللوائح' };
    } else if (taxRate === 0) {
      return { class: 'exempt', text: 'معفى من الضريبة' };
    } else if (taxRate > 0 && taxRate < 15) {
      return { class: 'reduced', text: 'معدل مخفض' };
    } else {
      return { class: 'non-compliant', text: 'يحتاج مراجعة' };
    }
  }

  generateTaxReport() {
    const formData = this.collectFormData();
    const errors = this.validateTaxData(formData);
    
    if (errors.length > 0) {
      this.showMessage(`يرجى إكمال البيانات التالية: ${errors.join('، ')}`, 'warning');
      return;
    }
    
    // Save data first
    this.saveData();
    
    // Generate comprehensive tax report
    const report = this.compileTaxReport(formData);
    
    // Update statistics
    this.statistics.totalReports = (this.statistics.totalReports || 0) + 1;
    
    this.showMessage('تم إعداد التقرير الضريبي بنجاح', 'success');
    
    // Auto-print after short delay
    setTimeout(() => {
      window.print();
    }, 1000);
    
    return report;
  }

  validateTaxData(data) {
    const errors = [];
    
    if (!data.workValue || parseFloat(data.workValue) <= 0) {
      errors.push('قيمة العمل');
    }
    if (!data.supplierName) {
      errors.push('اسم المورد');
    }
    if (!data.taxNumber) {
      errors.push('الرقم الضريبي');
    }
    if (!data.contractDate) {
      errors.push('تاريخ العقد');
    }
    
    return errors;
  }

  compileTaxReport(data) {
    return {
      reportId: this.generateReportId(),
      timestamp: new Date().toISOString(),
      supplierInfo: {
        name: data.supplierName,
        taxNumber: data.taxNumber,
        address: data.supplierAddress,
        phone: data.supplierPhone
      },
      contractInfo: {
        number: data.contractNumber,
        date: data.contractDate,
        value: parseFloat(data.workValue)
      },
      taxCalculation: {
        baseAmount: parseFloat(data.workValue),
        taxRate: parseFloat(data.taxRate),
        taxAmount: this.statistics.taxValue,
        totalAmount: this.statistics.totalValue
      },
      compliance: this.assessTaxCompliance(parseFloat(data.taxRate)),
      signature: {
        date: data.signatureDate,
        declaration: data.declaration
      }
    };
  }

  generateReportId() {
    const prefix = 'TAX';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  saveData() {
    try {
      const formData = this.collectFormData();
      formData.savedAt = new Date().toISOString();
      formData.statistics = this.statistics;
      
      localStorage.setItem('taxFormData', JSON.stringify(formData));
      this.statistics.lastSaved = new Date();
      console.log('Tax data saved successfully');
    } catch (error) {
      console.error('Error saving tax data:', error);
      this.showMessage('حدث خطأ في حفظ البيانات', 'error');
    }
  }

  collectFormData() {
    const formData = {};
    const inputs = document.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
      if (input.id) {
        if (input.type === 'checkbox') {
          formData[input.id] = input.checked;
        } else if (input.type === 'radio' && input.checked) {
          formData[input.name] = input.value;
        } else if (input.type !== 'radio') {
          formData[input.id] = input.value;
        }
      }
    });
    
    return formData;
  }

  loadData() {
    this.loadSavedData();
  }

  loadSavedData() {
    try {
      const savedData = localStorage.getItem('taxFormData');
      if (savedData) {
        const formData = JSON.parse(savedData);
        this.populateFormData(formData);
        this.calculateTax();
        this.showMessage('تم تحميل البيانات المحفوظة بنجاح', 'success');
      }
    } catch (error) {
      console.error('Error loading tax data:', error);
      this.showMessage('حدث خطأ في تحميل البيانات', 'error');
    }
  }

  populateFormData(formData) {
    // Fill form inputs
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      if (input.id && formData[input.id] !== undefined) {
        if (input.type === 'checkbox') {
          input.checked = formData[input.id];
        } else {
          input.value = formData[input.id];
        }
      }
    });
    
    // Update statistics if available
    if (formData.statistics) {
      this.statistics = { ...this.statistics, ...formData.statistics };
    }
  }

  clearForm() {
    if (confirm('هل أنت متأكد من مسح جميع البيانات؟')) {
      // Clear all inputs except defaults
      const inputs = document.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        if (input.type === 'checkbox' || input.type === 'radio') {
          input.checked = false;
        } else {
          input.value = '';
        }
      });
      
      // Restore defaults
      this.setCurrentDate();
      this.setDefaults();
      this.calculateTax();
      
      // Clear saved data
      localStorage.removeItem('taxFormData');
      
      this.showMessage('تم مسح جميع البيانات', 'success');
    }
  }

  exportTaxData() {
    try {
      const formData = this.collectFormData();
      const report = this.compileTaxReport(formData);
      
      const exportData = {
        formData,
        report,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
      
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `tax-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      this.showMessage('تم تصدير البيانات الضريبية بنجاح', 'success');
    } catch (error) {
      console.error('Export error:', error);
      this.showMessage('حدث خطأ في تصدير البيانات', 'error');
    }
  }

  importTaxData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (event) => {
      const file = event.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importData = JSON.parse(e.target.result);
          
          if (importData.formData) {
            this.populateFormData(importData.formData);
            this.calculateTax();
            this.showMessage('تم استيراد البيانات الضريبية بنجاح', 'success');
          } else {
            this.showMessage('تنسيق الملف غير صحيح', 'error');
          }
        } catch (error) {
          console.error('Import error:', error);
          this.showMessage('خطأ في قراءة الملف', 'error');
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  }

  validateTaxNumber(taxNumber) {
    // Saudi VAT number validation (15 digits)
    const saudiVATRegex = /^3[0-9]{14}$/;
    return saudiVATRegex.test(taxNumber);
  }

  generateTaxSummary() {
    const data = this.collectFormData();
    const summary = {
      totalContracts: 1,
      totalValue: this.statistics.totalValue,
      totalTax: this.statistics.taxValue,
      averageTaxRate: parseFloat(data.taxRate) || this.defaultTaxRate,
      complianceStatus: this.assessTaxCompliance(parseFloat(data.taxRate) || this.defaultTaxRate)
    };
    
    return summary;
  }

  startAutoSave() {
    this.autoSaveInterval = setInterval(() => {
      const workValue = document.getElementById('workValue')?.value;
      const supplierName = document.getElementById('supplierName')?.value;
      
      // Only auto-save if there's meaningful content
      if (workValue && parseFloat(workValue) > 0 || supplierName) {
        this.saveData();
      }
    }, 30000); // Auto-save every 30 seconds
  }

  stopAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
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
      // Enhanced message display
      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      toast.textContent = message;
      
      toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 24px;
        background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : type === 'warning' ? '#fff3cd' : '#d1ecf1'};
        color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : type === 'warning' ? '#856404' : '#0c5460'};
        border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : type === 'warning' ? '#ffeaa7' : '#bee5eb'};
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
        setTimeout(() => {
          if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
          }
        }, 300);
      }, 3000);
    }
  }
}

// Initialize and make globally available
let taxManager;

document.addEventListener('DOMContentLoaded', function() {
  taxManager = new TaxManager();
});

// Global functions for backward compatibility
window.toggleMenu = function() {
  const navLinks = document.querySelector('.nav-links');
  if (navLinks) {
    navLinks.classList.toggle('active');
  }
};

window.printForm = function() {
  window.print();
};

window.saveForm = function() {
  if (taxManager) taxManager.saveData();
};

window.clearForm = function() {
  if (taxManager) taxManager.clearForm();
};

window.calculateTax = function() {
  if (taxManager) taxManager.calculateTax();
};

window.generateTaxReport = function() {
  if (taxManager) taxManager.generateTaxReport();
};

window.exportTaxData = function() {
  if (taxManager) taxManager.exportTaxData();
};

window.importTaxData = function() {
  if (taxManager) taxManager.importTaxData();
};