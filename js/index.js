/**
 * Login Management System
 * Professional authentication with security features
 */

class LoginManager {
  constructor() {
    this.maxAttempts = 5;
    this.lockoutTime = 15 * 60 * 1000; // 15 minutes
    this.checkExistingSession();
    this.initializeEvents();
    this.preventNavigation();
  }

  checkExistingSession() {
    // Check if user is already logged in
    const isLoggedIn = localStorage.getItem('userLoggedIn');
    if (isLoggedIn === 'true') {
      // Redirect to main page if already logged in
      window.location.href = 'main.html';
      return;
    }
  }

  preventNavigation() {
    // Disable right-click context menu for security
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    });

    // Disable F12, Ctrl+Shift+I, Ctrl+U, Ctrl+Shift+C
    document.addEventListener('keydown', (e) => {
      if (e.key === 'F12' || 
          (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C')) ||
          (e.ctrlKey && e.key === 'u')) {
        e.preventDefault();
        return false;
      }
    });

    // Disable text selection for security
    document.addEventListener('selectstart', (e) => {
      e.preventDefault();
      return false;
    });
  }

  initializeEvents() {
    // Form submission handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLogin();
      });
    }

    // Show/hide password functionality
    const showPasswordBtn = document.getElementById('showPassword');
    if (showPasswordBtn) {
      showPasswordBtn.addEventListener('click', () => this.togglePassword());
    }

    // Auto-focus on username field
    document.addEventListener('DOMContentLoaded', () => {
      const usernameField = document.getElementById('username');
      if (usernameField) usernameField.focus();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) loginForm.dispatchEvent(new Event('submit'));
      }
    });

    // Check lockout status on page load
    this.checkLockoutStatus();
  }

  async handleLogin() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    // Validation
    if (!username || !password) {
      this.showError('يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }

    // Check lockout status
    if (this.isAccountLocked()) {
      this.showError('تم تجميد الحساب مؤقتاً. حاول مرة أخرى لاحقاً');
      return;
    }

    this.setLoading(true);

    try {
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (this.authenticate(username, password)) {
        this.clearAttempts();
        // Set logged in status
        localStorage.setItem('userLoggedIn', 'true');
        localStorage.setItem('loginTimestamp', Date.now().toString());
        localStorage.setItem('currentUser', username);
        
        this.showSuccess('تم تسجيل الدخول بنجاح');
        
        // Redirect after success message
        setTimeout(() => {
          window.location.href = 'main.html';
        }, 1500);
      } else {
        this.handleFailedAttempt();
      }
    } catch (error) {
      this.showError('حدث خطأ في الشبكة. حاول مرة أخرى');
    } finally {
      this.setLoading(false);
    }
  }

  authenticate(username, password) {
    // Enhanced authentication with multiple valid credentials
    const validCredentials = [
      { username: 'admin', password: '1234' },
      { username: 'manager', password: '5678' },
      { username: 'user', password: '9999' },
      { username: 'مدير', password: '1234' },
      { username: 'مستخدم', password: '9999' }
    ];

    return validCredentials.some(cred => 
      cred.username.toLowerCase() === username.toLowerCase() && 
      cred.password === password
    );
  }

  handleFailedAttempt() {
    const attempts = this.getAttempts() + 1;
    localStorage.setItem('loginAttempts', attempts.toString());

    const remainingAttempts = this.maxAttempts - attempts;
    
    if (remainingAttempts > 0) {
      this.showError(`بيانات خاطئة. المحاولات المتبقية: ${remainingAttempts}`);
    } else {
      localStorage.setItem('lockoutTimestamp', Date.now().toString());
      this.showError('تم تجميد الحساب لمدة 15 دقيقة بسبب المحاولات الفاشلة');
      document.getElementById('loginBtn').disabled = true;
    }
  }

  getAttempts() {
    return parseInt(localStorage.getItem('loginAttempts') || '0', 10);
  }

  clearAttempts() {
    localStorage.removeItem('loginAttempts');
    localStorage.removeItem('lockoutTimestamp');
  }

  isAccountLocked() {
    const timestamp = localStorage.getItem('lockoutTimestamp');
    if (!timestamp) return false;

    const lockoutTime = parseInt(timestamp, 10);
    const currentTime = Date.now();
    
    if (currentTime - lockoutTime < this.lockoutTime) {
      return true;
    } else {
      // Lockout period expired
      this.clearAttempts();
      return false;
    }
  }

  checkLockoutStatus() {
    if (this.isAccountLocked()) {
      const timestamp = parseInt(localStorage.getItem('lockoutTimestamp'), 10);
      const remainingTime = this.lockoutTime - (Date.now() - timestamp);
      const minutes = Math.ceil(remainingTime / (60 * 1000));
      
      this.showError(`الحساب مجمد. المتبقي: ${minutes} دقيقة`);
      document.getElementById('loginBtn').disabled = true;
      
      // Auto-enable after lockout period
      setTimeout(() => {
        this.clearAttempts();
        document.getElementById('loginBtn').disabled = false;
        this.clearMessages();
      }, remainingTime);
    }
  }

  togglePassword() {
    const passwordField = document.getElementById('password');
    const showBtn = document.getElementById('showPassword');
    
    if (passwordField.type === 'password') {
      passwordField.type = 'text';
      showBtn.textContent = '🙈';
    } else {
      passwordField.type = 'password';
      showBtn.textContent = '👁️';
    }
  }

  setLoading(loading) {
    const btn = document.getElementById('loginBtn');
    const spinner = btn.querySelector('.spinner');
    const text = btn.querySelector('.btn-text');
    
    btn.disabled = loading;
    
    if (loading) {
      spinner.style.display = 'inline-block';
      text.textContent = 'جاري التحقق...';
    } else {
      spinner.style.display = 'none';
      text.textContent = 'تسجيل الدخول';
    }
  }

  showSuccess(message) {
    this.showMessage(message, 'success');
  }

  showError(message) {
    this.showMessage(message, 'error');
  }

  showMessage(message, type) {
    this.clearMessages();
    
    const messageEl = document.createElement('div');
    messageEl.className = `login-message ${type}`;
    messageEl.innerHTML = `
      <span class="message-icon">${type === 'success' ? '✅' : '❌'}</span>
      <span class="message-text">${message}</span>
    `;
    
    const container = document.querySelector('.login-container');
    container.appendChild(messageEl);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (messageEl.parentNode) {
        messageEl.remove();
      }
    }, 5000);
  }

  clearMessages() {
    const messages = document.querySelectorAll('.login-message');
    messages.forEach(msg => msg.remove());
  }
}

// Initialize and make globally available
let loginManager;

document.addEventListener('DOMContentLoaded', function() {
  loginManager = new LoginManager();
});

// Global functions for backward compatibility
window.togglePassword = function() {
  if (loginManager) loginManager.togglePassword();
};