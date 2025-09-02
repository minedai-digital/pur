/**
 * Request Management System (Talab.html)
 * Professional purchase request handling
 */

class RequestManager {
  constructor() {
    this.autoSaveInterval = null;
    this.statistics = { totalRequests: 0, totalValue: 0, lastSaved: null };
    this.init();
  }

  async init() {
    this.setupEventListeners();
    this.populateDataLists();
    this.setCurrentDate();
    this.loadSavedData();
    this.startAutoSave();
    this.hideLoadingOverlay();
  }

  setupEventListeners() {
    // Input validation and auto-save
    document.addEventListener('input', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        this.validateField(e.target);
        
        // Auto-generate request on amount or description change
        if (e.target.id === 'requestAmount' || e.target.id === 'requestDescription') {
          this.updateRequestPreview();
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
          case 'g': e.preventDefault(); this.generateRequest(); break;
        }
      }
    });

    // Payment method change handler
    document.addEventListener('change', (e) => {
      if (e.target.name === 'paymentMethod') {
        this.handlePaymentMethodChange(e.target.value);
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
      
      if (field.type === 'number' && value && (isNaN(value) || parseFloat(value) <= 0)) {
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

  populateDataLists() {
    try {
      // Populate suppliers for payee name autocomplete
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

      // Populate departments
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

      // Populate staff members for signatures
      if (window.APP_DATA?.STAFF_DB) {
        const staffInputs = document.querySelectorAll('#applicantName, #approverName');
        staffInputs.forEach(input => {
          if (!input.list) {
            const dataList = document.createElement('datalist');
            dataList.id = `${input.id}List`;
            Object.values(window.APP_DATA.STAFF_DB).forEach(staff => {
              const option = document.createElement('option');
              option.value = staff.name;
              dataList.appendChild(option);
            });
            document.body.appendChild(dataList);
            input.setAttribute('list', dataList.id);
          }
        });
      }
    } catch (error) {
      console.error('Data loading error:', error);
      this.showMessage('خطأ في تحميل البيانات الأساسية', 'error');
    }
  }

  setCurrentDate() {
    const today = new Date().toISOString().split('T')[0];
    const requestDate = document.getElementById('requestDate');
    if (requestDate && !requestDate.value) {
      requestDate.value = today;
    }
  }

  handlePaymentMethodChange(method) {
    const payeeNameField = document.getElementById('payeeName');
    if (payeeNameField && method) {
      // Add specific placeholder based on payment method
      switch(method) {
        case 'cash':
          payeeNameField.placeholder = 'اسم المستلم للمبلغ النقدي';
          break;
        case 'check':
          payeeNameField.placeholder = 'اسم المستفيد من الشيك';
          break;
        case 'transfer':
          payeeNameField.placeholder = 'اسم صاحب الحساب البنكي';
          break;
        default:
          payeeNameField.placeholder = 'اسم المستفيد';
      }
    }
  }

  updateRequestPreview() {
    const amount = document.getElementById('requestAmount')?.value || '';
    const description = document.getElementById('requestDescription')?.value || '';
    
    // Update workflow status if elements exist
    const workflowStep = document.querySelector('.step-indicator.active');
    if (workflowStep && amount && description) {
      // Move to next step
      workflowStep.classList.remove('active');
      const nextStep = workflowStep.parentElement.nextElementSibling?.querySelector('.step-indicator');
      if (nextStep) nextStep.classList.add('active');
    }
  }

  loadData() {
    try {
      const tafData = localStorage.getItem('tafData');
      if (tafData) {
        const data = JSON.parse(tafData);
        let totalAmount = 0;
        
        if (data.tableData && data.tableData.length > 0) {
          data.tableData.forEach(item => {
            const qty = parseFloat(item.qty) || 1;
            const price1 = parseFloat(item.price1) || 0;
            const price2 = parseFloat(item.price2) || 0;
            const price3 = parseFloat(item.price3) || 0;
            
            // Get the best price (lowest non-zero price)
            const prices = [price1, price2, price3].filter(p => p > 0);
            if (prices.length > 0) {
              const minPrice = Math.min(...prices);
              totalAmount += qty * minPrice * 1.15; // Add VAT
            }
          });
        }
        
        if (totalAmount > 0) {
          document.getElementById('requestAmount').value = totalAmount.toFixed(2);
          document.getElementById('requestDescription').value = 'توريد مستلزمات طبية حسب المناقصة والمواصفات المعتمدة';
          
          // Set default payment method
          const cashPayment = document.getElementById('cashPayment');
          if (cashPayment) cashPayment.checked = true;
          
          this.showMessage('تم تحميل البيانات من تفريغ الأسعار بنجاح', 'success');
          this.updateRequestPreview();
        } else {
          this.showMessage('لا توجد بيانات صالحة في تفريغ الأسعار', 'warning');
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
      const errors = this.validateFormData(data);
      
      if (errors.length > 0) {
        this.showMessage(`يرجى إكمال الحقول التالية: ${errors.join('، ')}`, 'warning');
        return false;
      }
      
      localStorage.setItem('requestData', JSON.stringify(data));
      this.statistics.lastSaved = new Date();
      this.showMessage('تم حفظ طلب الشراء بنجاح', 'success');
      return true;
    } catch (error) {
      console.error('Save error:', error);
      this.showMessage('حدث خطأ في حفظ البيانات', 'error');
      return false;
    }
  }

  collectFormData() {
    return {
      // Basic request information
      requestAmount: document.getElementById('requestAmount')?.value || '',
      requestDate: document.getElementById('requestDate')?.value || '',
      department: document.getElementById('department')?.value || '',
      requestDescription: document.getElementById('requestDescription')?.value || '',
      
      // Payment information
      paymentMethod: document.querySelector('input[name="paymentMethod"]:checked')?.value || '',
      payeeName: document.getElementById('payeeName')?.value || '',
      
      // Applicant information
      applicantName: document.getElementById('applicantName')?.value || '',
      applicantPosition: document.getElementById('applicantPosition')?.value || '',
      applicantPhone: document.getElementById('applicantPhone')?.value || '',
      applicantEmail: document.getElementById('applicantEmail')?.value || '',
      
      // Approval information
      applicantSignature: document.getElementById('applicantSignature')?.value || '',
      approverName: document.getElementById('approverName')?.value || '',
      
      // Metadata
      timestamp: new Date().toISOString(),
      statistics: this.statistics
    };
  }

  validateFormData(data) {
    const errors = [];
    
    // Required fields validation
    if (!data.requestAmount || parseFloat(data.requestAmount) <= 0) {
      errors.push('مبلغ الصرف المطلوب');
    }
    if (!data.requestDescription.trim()) {
      errors.push('وصف الطلب');
    }
    if (!data.applicantName.trim()) {
      errors.push('اسم مقدم الطلب');
    }
    if (!data.requestDate) {
      errors.push('تاريخ الطلب');
    }
    if (!data.department) {
      errors.push('القسم المطلوب');
    }
    
    // Email validation if provided
    if (data.applicantEmail && !this.isValidEmail(data.applicantEmail)) {
      errors.push('البريد الإلكتروني صحيح');
    }
    
    // Phone validation if provided
    if (data.applicantPhone && !this.isValidPhone(data.applicantPhone)) {
      errors.push('رقم الهاتف صحيح');
    }
    
    return errors;
  }

  loadSavedData() {
    try {
      const savedData = localStorage.getItem('requestData');
      if (savedData) {
        const data = JSON.parse(savedData);
        this.populateFormData(data);
        this.showMessage('تم تحميل البيانات المحفوظة', 'success');
      }
    } catch (error) {
      console.error('Load error:', error);
      this.showMessage('حدث خطأ في تحميل البيانات المحفوظة', 'error');
    }
  }

  populateFormData(data) {
    // Fill basic form fields
    const fields = [
      'requestAmount', 'requestDate', 'department', 'requestDescription',
      'payeeName', 'applicantName', 'applicantPosition', 'applicantPhone',
      'applicantEmail', 'applicantSignature', 'approverName'
    ];
    
    fields.forEach(fieldId => {
      const element = document.getElementById(fieldId);
      if (element && data[fieldId]) {
        element.value = data[fieldId];
      }
    });
    
    // Set payment method radio button
    if (data.paymentMethod) {
      const paymentRadio = document.querySelector(`input[name="paymentMethod"][value="${data.paymentMethod}"]`);
      if (paymentRadio) paymentRadio.checked = true;
    }
    
    // Update statistics if available
    if (data.statistics) {
      this.statistics = { ...this.statistics, ...data.statistics };
    }
    
    this.updateRequestPreview();
  }

  clearForm() {
    if (confirm('هل أنت متأكد من مسح جميع البيانات؟')) {
      // Clear all form inputs
      document.querySelectorAll('input[type="text"], input[type="number"], input[type="email"], input[type="tel"], input[type="date"], textarea, select').forEach(input => {
        input.value = '';
      });
      
      // Clear radio buttons and checkboxes
      document.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(input => {
        input.checked = false;
      });
      
      // Reset to defaults
      this.setCurrentDate();
      
      // Remove saved data
      localStorage.removeItem('requestData');
      
      // Reset workflow
      document.querySelectorAll('.step-indicator').forEach((step, index) => {
        step.classList.toggle('active', index === 0);
      });
      
      this.showMessage('تم مسح جميع البيانات', 'success');
    }
  }

  generateRequest() {
    // Validate required fields first
    const data = this.collectFormData();
    const errors = this.validateFormData(data);
    
    if (errors.length > 0) {
      this.showMessage(`يرجى إكمال الحقول المطلوبة: ${errors.join('، ')}`, 'warning');
      
      // Focus on first missing field
      const firstErrorField = document.getElementById(
        errors.includes('مبلغ الصرف المطلوب') ? 'requestAmount' :
        errors.includes('وصف الطلب') ? 'requestDescription' :
        errors.includes('اسم مقدم الطلب') ? 'applicantName' :
        errors.includes('تاريخ الطلب') ? 'requestDate' :
        errors.includes('القسم المطلوب') ? 'department' : ''
      );
      
      if (firstErrorField) {
        firstErrorField.focus();
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      return;
    }
    
    // Save the data
    if (this.saveData()) {
      // Update statistics
      this.statistics.totalRequests++;
      this.statistics.totalValue += parseFloat(data.requestAmount) || 0;
      
      // Show success message with details
      const amount = parseFloat(data.requestAmount).toFixed(2);
      const applicant = data.applicantName;
      this.showMessage(`تم إعداد طلب الشراء بنجاح: ${amount} ريال - ${applicant}`, 'success');
      
      // Auto-print after short delay
      setTimeout(() => {
        window.print();
      }, 1500);
    }
  }

  startAutoSave() {
    this.autoSaveInterval = setInterval(() => {
      const amount = document.getElementById('requestAmount')?.value;
      const description = document.getElementById('requestDescription')?.value;
      
      // Only auto-save if there's meaningful content
      if (amount || (description && description.length > 10)) {
        this.saveData();
      }
    }, 90000); // Auto-save every 1.5 minutes
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
      // Enhanced message display with better styling
      const messageDiv = document.createElement('div');
      messageDiv.className = `alert alert-${type === 'error' ? 'danger' : type === 'warning' ? 'warning' : 'success'} fade-in`;
      messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        max-width: 400px;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-weight: 500;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
      `;
      messageDiv.innerHTML = `
        <span style="margin-right: 8px;">
          ${type === 'success' ? '✅' : type === 'error' ? '❌' : '⚠️'}
        </span>
        <span>${message}</span>
      `;
      
      const container = document.querySelector('.request-header') || document.querySelector('.container');
      container.appendChild(messageDiv);
      
      // Animate in
      setTimeout(() => {
        messageDiv.style.opacity = '1';
        messageDiv.style.transform = 'translateX(0)';
      }, 100);
      
      // Animate out and remove
      setTimeout(() => {
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateX(100%)';
        setTimeout(() => messageDiv.remove(), 300);
      }, 4000);
    }
  }
}

// Initialize and make globally available
let requestManager;

document.addEventListener('DOMContentLoaded', function() {
  requestManager = new RequestManager();
});

// Global functions for backward compatibility
window.loadData = function() {
  if (requestManager) requestManager.loadData();
};

window.saveData = function() {
  if (requestManager) requestManager.saveData();
};

window.generateRequest = function() {
  if (requestManager) requestManager.generateRequest();
};

window.clearForm = function() {
  if (requestManager) requestManager.clearForm();
};

window.toggleMenu = function() {
  const navLinks = document.querySelector('.nav-links');
  if (navLinks) {
    navLinks.classList.toggle('active');
  }
};