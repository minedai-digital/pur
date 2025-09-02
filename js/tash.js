/**
 * Committee Management System (Tash.html)
 * Professional committee formation and management
 */

class CommitteeManager {
  constructor() {
    this.memberCount = 3;
    this.autoSaveInterval = null;
    this.statistics = { totalCommittees: 0, lastSaved: null };
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
    // Auto-save on input changes
    document.addEventListener('input', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        this.validateField(e.target);
        this.validateAndSave();
      }
    });

    // Keyboard shortcuts for efficiency
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
          case 's': e.preventDefault(); this.saveData(); break;
          case 'p': e.preventDefault(); window.print(); break;
          case '+': e.preventDefault(); this.addMember(); break;
          case 'n': e.preventDefault(); this.clearForm(); break;
        }
      }
    });

    // Member management
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-member-btn')) {
        this.removeMember(e.target);
      }
    });

    // Committee type change handler
    document.addEventListener('change', (e) => {
      if (e.target.id === 'committeeType') {
        this.updateRequestText(e.target.value);
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
      // Populate staff members for autocomplete
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

        // Add autocomplete to member inputs
        const memberInputs = document.querySelectorAll('#committeeMembers input[type="text"]');
        memberInputs.forEach(input => {
          if (!input.hasAttribute('list')) {
            input.setAttribute('list', 'staffList');
          }
        });
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
    } catch (error) {
      console.error('Data loading error:', error);
      this.showMessage('خطأ في تحميل البيانات الأساسية', 'error');
    }
  }

  validateAndSave() {
    // Debounced auto-save
    clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
      this.saveData();
    }, 2000);
  }

  setCurrentDate() {
    const today = new Date().toISOString().split('T')[0];
    const requestDate = document.getElementById('requestDate');
    const submissionDate = document.getElementById('submissionDate');
    
    if (requestDate && !requestDate.value) requestDate.value = today;
    if (submissionDate && !submissionDate.value) submissionDate.value = today;
  }

  updateRequestText(committeeType) {
    const requestText = document.getElementById('requestText');
    if (!requestText) return;

    const defaultTexts = {
      'فحص أسعار': 'الرجاء التكرم من سيادتكم بالموافقة على تشكيل لجنة لفحص الأسعار والتأكد من صحة ورقة الأسعار الواردة ببنود المقايسة، والتأكد من أنها أقل الأسعار ومطابقتها للمواصفات الفنية وأصل الصناعة.',
      'فحص عينات': 'الرجاء التكرم من سيادتكم بالموافقة على تشكيل لجنة لفحص العينات والتأكد من مطابقتها للمواصفات الفنية المطلوبة وجودة المنتجات المقدمة.',
      'استلام وتسليم': 'الرجاء التكرم من سيادتكم بالموافقة على تشكيل لجنة لاستلام وتسليم المواد والتأكد من مطابقتها للمواصفات والكميات المطلوبة.',
      'فحص عروض': 'الرجاء التكرم من سيادتكم بالموافقة على تشكيل لجنة لفحص العروض المقدمة وتقييمها وفقاً للمعايير المحددة.',
      'تقييم أداء': 'الرجاء التكرم من سيادتكم بالموافقة على تشكيل لجنة لتقييم أداء المورّدين والمتعاقدين وفقاً للمعايير المعتمدة.'
    };

    if (defaultTexts[committeeType]) {
      requestText.value = defaultTexts[committeeType];
    }
  }

  addMember() {
    this.memberCount++;
    const membersContainer = document.getElementById('committeeMembers');
    if (!membersContainer) return;
    
    const memberDiv = document.createElement('div');
    memberDiv.className = 'committee-member';
    memberDiv.style.cssText = `
      display: flex;
      align-items: center;
      gap: 1rem;
      margin: 0.75rem 0;
      padding: 0.75rem;
      background: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #e9ecef;
    `;
    
    memberDiv.innerHTML = `
      <div class="member-number" style="
        width: 2.5rem;
        height: 2.5rem;
        background: var(--primary-color);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 0.9rem;
      ">${this.memberCount}</div>
      <div class="enhanced-input" style="flex: 1;">
        <input type="text" 
               class="form-control" 
               placeholder="اسم العضو" 
               list="staffList"
               data-autocomplete="staff">
      </div>
      <div class="member-role" style="
        background: var(--info-color);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 500;
        min-width: 60px;
        text-align: center;
      ">عضو</div>
      <button type="button" 
              class="btn btn-sm btn-danger remove-member-btn" 
              title="حذف العضو"
              style="border-radius: 50%; width: 2rem; height: 2rem; padding: 0;">×</button>
    `;
    
    membersContainer.appendChild(memberDiv);
    
    // Focus on the new input
    const newInput = memberDiv.querySelector('input');
    if (newInput) {
      newInput.focus();
      
      // Initialize autocomplete for the new input
      setTimeout(() => {
        ProcurementUtils.initializeAutocompleteLists();
      }, 100);
    }
    
    this.showMessage('تم إضافة عضو جديد للجنة', 'success');
  }

  removeMember(btn) {
    if (this.memberCount <= 1) {
      this.showMessage('يجب أن تحتوي اللجنة على عضو واحد على الأقل', 'warning');
      return;
    }

    if (confirm('هل أنت متأكد من حذف هذا العضو؟')) {
      const memberDiv = btn.closest('.committee-member');
      if (memberDiv) {
        memberDiv.remove();
        this.updateMemberNumbers();
        this.showMessage('تم حذف العضو من اللجنة', 'success');
      }
    }
  }

  updateMemberNumbers() {
    const members = document.querySelectorAll('#committeeMembers .committee-member');
    members.forEach((member, index) => {
      const numberDiv = member.querySelector('.member-number');
      if (numberDiv) {
        numberDiv.textContent = index + 1;
      }
      
      // Update role for first member (chairman)
      const roleDiv = member.querySelector('.member-role');
      if (roleDiv && index === 0) {
        roleDiv.textContent = 'رئيساً';
        roleDiv.classList.add('chairman');
        roleDiv.style.background = 'var(--warning-color)';
      } else if (roleDiv) {
        roleDiv.textContent = 'عضو';
        roleDiv.classList.remove('chairman');
        roleDiv.style.background = 'var(--info-color)';
      }
    });
    
    this.memberCount = members.length;
  }

  loadFromSystem() {
    try {
      // Try to load committee templates or previous data
      const savedCommittees = localStorage.getItem('committeeTemplates');
      if (savedCommittees) {
        const templates = JSON.parse(savedCommittees);
        if (templates.length > 0) {
          const template = templates[0]; // Use first template
          this.populateFromTemplate(template);
          this.showMessage('تم تحميل قالب اللجنة بنجاح', 'success');
        } else {
          this.showMessage('لا توجد قوالب محفوظة', 'warning');
        }
      } else {
        // Load default committee members from staff database
        if (window.APP_DATA?.STAFF_DB) {
          const staffMembers = Object.values(window.APP_DATA.STAFF_DB);
          if (staffMembers.length >= 3) {
            const defaultMembers = staffMembers.slice(0, 3);
            this.populateDefaultMembers(defaultMembers);
            this.showMessage('تم تحميل أعضاء افتراضيين من قاعدة البيانات', 'success');
          } else {
            this.showMessage('عدد الموظفين في النظام غير كافٍ لتشكيل لجنة', 'warning');
          }
        } else {
          this.showMessage('لا توجد بيانات متاحة في النظام', 'warning');
        }
      }
    } catch (error) {
      console.error('Error loading from system:', error);
      this.showMessage('حدث خطأ في تحميل البيانات من النظام', 'error');
    }
  }

  populateFromTemplate(template) {
    if (template.members && template.members.length > 0) {
      // Clear existing members except first 3
      const membersContainer = document.getElementById('committeeMembers');
      const existingMembers = membersContainer.querySelectorAll('.committee-member');
      
      template.members.forEach((member, index) => {
        if (index < existingMembers.length) {
          const input = existingMembers[index].querySelector('input');
          if (input) input.value = member.name;
        } else {
          this.addMember();
          const newMember = membersContainer.querySelector('.committee-member:last-child input');
          if (newMember) newMember.value = member.name;
        }
      });
    }
  }

  populateDefaultMembers(staffMembers) {
    const memberInputs = document.querySelectorAll('#committeeMembers input[type="text"]');
    staffMembers.forEach((staff, index) => {
      if (index < memberInputs.length) {
        memberInputs[index].value = staff.name;
      }
    });
  }

  saveData() {
    try {
      const data = this.collectFormData();
      localStorage.setItem('committeeFormData', JSON.stringify(data));
      this.statistics.lastSaved = new Date();
      
      // Also save as template if committee is complete
      if (this.isCommitteeComplete(data)) {
        this.saveAsTemplate(data);
      }
      
      console.log('Committee data saved successfully');
    } catch (error) {
      console.error('Error saving committee data:', error);
      this.showMessage('حدث خطأ في حفظ البيانات', 'error');
    }
  }

  collectFormData() {
    const data = {
      hospitalName: document.getElementById('hospitalName')?.value || '',
      hospitalName2: document.getElementById('hospitalName2')?.value || '',
      requestDate: document.getElementById('requestDate')?.value || '',
      committeeType: document.getElementById('committeeType')?.value || '',
      requestText: document.getElementById('requestText')?.value || '',
      submitterName: document.getElementById('submitterName')?.value || '',
      submitterPosition: document.getElementById('submitterPosition')?.value || '',
      approverName: document.getElementById('approverName')?.value || '',
      approverPosition: document.getElementById('approverPosition')?.value || '',
      submissionDate: document.getElementById('submissionDate')?.value || '',
      requestNumber: document.getElementById('requestNumber')?.value || '',
      members: [],
      timestamp: new Date().toISOString(),
      statistics: this.statistics
    };
    
    // Collect committee members
    document.querySelectorAll('#committeeMembers .committee-member input').forEach((input, index) => {
      if (input.value.trim()) {
        data.members.push({
          name: input.value.trim(),
          position: index + 1,
          role: index === 0 ? 'رئيساً' : 'عضو'
        });
      }
    });
    
    return data;
  }

  isCommitteeComplete(data) {
    return data.committeeType && 
           data.members.length >= 3 && 
           data.submitterName && 
           data.approverName;
  }

  saveAsTemplate(data) {
    try {
      const templates = JSON.parse(localStorage.getItem('committeeTemplates') || '[]');
      
      const template = {
        name: `قالب لجنة ${data.committeeType}`,
        type: data.committeeType,
        members: data.members,
        createdAt: new Date().toISOString()
      };
      
      // Avoid duplicate templates
      const existingIndex = templates.findIndex(t => t.type === data.committeeType);
      if (existingIndex >= 0) {
        templates[existingIndex] = template;
      } else {
        templates.push(template);
      }
      
      localStorage.setItem('committeeTemplates', JSON.stringify(templates));
    } catch (error) {
      console.error('Error saving template:', error);
    }
  }

  loadData() {
    this.loadSavedData();
  }

  loadSavedData() {
    try {
      const savedData = localStorage.getItem('committeeFormData');
      if (savedData) {
        const data = JSON.parse(savedData);
        this.populateFormData(data);
        this.showMessage('تم تحميل البيانات المحفوظة', 'success');
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
      this.showMessage('حدث خطأ في تحميل البيانات المحفوظة', 'error');
    }
  }

  populateFormData(data) {
    // Fill basic form fields
    const fields = [
      'hospitalName', 'hospitalName2', 'requestDate', 'committeeType',
      'requestText', 'submitterName', 'submitterPosition', 'approverName',
      'approverPosition', 'submissionDate', 'requestNumber'
    ];
    
    fields.forEach(fieldId => {
      const element = document.getElementById(fieldId);
      if (element && data[fieldId]) {
        element.value = data[fieldId];
      }
    });
    
    // Fill committee members
    if (data.members && data.members.length > 0) {
      // Clear existing members
      const membersContainer = document.getElementById('committeeMembers');
      const existingMembers = membersContainer.querySelectorAll('.committee-member');
      
      data.members.forEach((member, index) => {
        if (index < existingMembers.length) {
          const input = existingMembers[index].querySelector('input');
          if (input) input.value = member.name;
        } else {
          this.addMember();
          const newInput = membersContainer.querySelector('.committee-member:last-child input');
          if (newInput) newInput.value = member.name;
        }
      });
      
      this.updateMemberNumbers();
    }
    
    // Update statistics if available
    if (data.statistics) {
      this.statistics = { ...this.statistics, ...data.statistics };
    }
  }

  clearForm() {
    if (confirm('هل أنت متأكد من مسح جميع البيانات؟')) {
      // Clear all form fields
      document.querySelectorAll('input, textarea, select').forEach(field => {
        if (field.id === 'hospitalName' || field.id === 'hospitalName2') {
          field.value = 'مستشفى الملك فهد المركزي بجازان';
        } else if (field.id === 'requestText') {
          field.value = 'الرجاء التكرم من سيادتكم بالموافقة على تشكيل لجنة للتأكد من صحة ورقة الأسعار الواردة ببنود المقايسة، والتأكد من أنها أقل الأسعار ومطابقتها للمواصفات الفنية وأصل الصناعة، على أن تقع على اللجنة مسؤولية التحقق من الأسعار.';
        } else {
          field.value = '';
        }
      });
      
      // Reset committee members to default 3
      const membersContainer = document.getElementById('committeeMembers');
      const members = membersContainer.querySelectorAll('.committee-member');
      
      // Keep first 3 members, remove others
      members.forEach((member, index) => {
        if (index >= 3) {
          member.remove();
        } else {
          const input = member.querySelector('input');
          if (input) input.value = '';
        }
      });
      
      this.memberCount = 3;
      this.updateMemberNumbers();
      this.setCurrentDate();
      
      localStorage.removeItem('committeeFormData');
      this.showMessage('تم مسح جميع البيانات', 'success');
    }
  }

  generateCommitteeReport() {
    const data = this.collectFormData();
    
    if (!this.isCommitteeComplete(data)) {
      this.showMessage('يرجى إكمال جميع البيانات المطلوبة قبل إنشاء التقرير', 'warning');
      return;
    }
    
    this.saveData();
    this.statistics.totalCommittees++;
    
    this.showMessage(`تم إنشاء تقرير تشكيل لجنة ${data.committeeType} بنجاح`, 'success');
    
    // Auto-print after short delay
    setTimeout(() => {
      window.print();
    }, 1000);
  }

  startAutoSave() {
    this.autoSaveInterval = setInterval(() => {
      this.saveData();
    }, 60000); // Auto-save every minute
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
      toast.innerHTML = `
        <span style="margin-right: 8px;">
          ${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}
        </span>
        <span>${message}</span>
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
let committeeManager;

document.addEventListener('DOMContentLoaded', function() {
  committeeManager = new CommitteeManager();
});

// Global functions for backward compatibility
window.addMember = function() {
  if (committeeManager) committeeManager.addMember();
};

window.loadFromSystem = function() {
  if (committeeManager) committeeManager.loadFromSystem();
};

window.saveData = function() {
  if (committeeManager) committeeManager.saveData();
};

window.clearForm = function() {
  if (committeeManager) committeeManager.clearForm();
};

window.printForm = function() {
  window.print();
};

window.toggleMenu = function() {
  const navLinks = document.querySelector('.nav-links');
  if (navLinks) {
    navLinks.classList.toggle('active');
  }
};