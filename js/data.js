/**
 * Data Management System for Procurement Application
 * Centralized data structures and constants
 */

// Application Configuration
const APP_CONFIG = {
    VERSION: '2.0.0',
    TAX_RATE: 0.14, // 14% VAT
    CURRENCY: 'جنيه مصري',
    DATE_FORMAT: 'YYYY-MM-DD',
    DECIMAL_PLACES: 2,
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    SUPPORTED_FILE_TYPES: ['application/json', 'text/csv'],
    AUTO_SAVE_INTERVAL: 30000, // 30 seconds
    SESSION_TIMEOUT: 30 * 60 * 1000 // 30 minutes
};

// Suppliers Database with enhanced information
const SUPPLIERS_DB = {
    'شركة الأدوية المصرية المتحدة': {
        id: 'SUP001',
        address: 'القاهرة - مصر الجديدة - شارع النزهة 15',
        phone: '0223456789',
        mobile: '01234567890',
        fax: '0223456790',
        email: 'info@egyptianpharmaco.com',
        taxNumber: '123456789',
        commercialRecord: 'CR123456',
        bankAccount: 'EG380003000012345678901',
        specialization: 'أدوية وأجهزة طبية',
        rating: 4.5,
        isActive: true,
        registrationDate: '2020-01-15',
        lastUpdate: '2024-01-15'
    },
    'شركة المستلزمات الطبية المتقدمة': {
        id: 'SUP002',
        address: 'الإسكندرية - العطارين - شارع النصر 25',
        phone: '0334567890',
        mobile: '01987654321',
        fax: '0334567891',
        email: 'sales@medicaladvanced.com',
        taxNumber: '987654321',
        commercialRecord: 'CR987654',
        bankAccount: 'EG380003000098765432109',
        specialization: 'مستلزمات طبية ومعدات',
        rating: 4.2,
        isActive: true,
        registrationDate: '2019-06-10',
        lastUpdate: '2024-01-10'
    },
    'مؤسسة التوريدات الصحية الحديثة': {
        id: 'SUP003',
        address: 'الجيزة - الدقي - شارع التحرير 40',
        phone: '0235678901',
        mobile: '01122334455',
        fax: '0235678902',
        email: 'orders@modernhealth.com',
        taxNumber: '456789123',
        commercialRecord: 'CR456789',
        bankAccount: 'EG380003000045678912345',
        specialization: 'توريدات طبية شاملة',
        rating: 4.7,
        isActive: true,
        registrationDate: '2018-03-20',
        lastUpdate: '2024-01-20'
    },
    'شركة الشفاء للأدوية والمستلزمات': {
        id: 'SUP004',
        address: 'طنطا - شارع الجلاء 30',
        phone: '0403456789',
        mobile: '01556677889',
        fax: '0403456790',
        email: 'info@alshifaa.com',
        taxNumber: '789123456',
        commercialRecord: 'CR789123',
        bankAccount: 'EG380003000078912345678',
        specialization: 'أدوية متخصصة',
        rating: 4.3,
        isActive: true,
        registrationDate: '2021-05-15',
        lastUpdate: '2024-01-05'
    },
    'شركة النيل للتجهيزات الطبية': {
        id: 'SUP005',
        address: 'أسوان - شارع السوق 12',
        phone: '0973456789',
        mobile: '01223344556',
        fax: '0973456790',
        email: 'sales@nilemedical.com',
        taxNumber: '321654987',
        commercialRecord: 'CR321654',
        bankAccount: 'EG380003000032165498765',
        specialization: 'أجهزة ومعدات طبية',
        rating: 4.1,
        isActive: true,
        registrationDate: '2020-08-10',
        lastUpdate: '2024-01-12'
    }
};

// Medical Items Database with comprehensive details
const MEDICAL_ITEMS_DB = {
    // Pharmaceuticals - أدوية
    'باراسيتامول 500 مج': {
        id: 'DRUG001',
        category: 'أدوية',
        subcategory: 'مسكنات',
        unit: 'قرص',
        standardPack: 1000,
        description: 'مسكن للألم وخافض للحرارة',
        specifications: 'تركيز 500 مج، مطابق للمواصفات المصرية',
        shelf_life: '36 شهر',
        storage_conditions: 'يحفظ في مكان جاف وبارد',
        typical_price: 0.25,
        min_price: 0.20,
        max_price: 0.35,
        suppliers: ['SUP001', 'SUP004'],
        isActive: true
    },
    'أموكسيسيلين 500 مج كبسولة': {
        id: 'DRUG002',
        category: 'أدوية',
        subcategory: 'مضادات حيوية',
        unit: 'كبسولة',
        standardPack: 100,
        description: 'مضاد حيوي واسع المجال',
        specifications: 'تركيز 500 مج، معتمد من وزارة الصحة',
        shelf_life: '24 شهر',
        storage_conditions: 'يحفظ في درجة حرارة الغرفة',
        typical_price: 2.50,
        min_price: 2.00,
        max_price: 3.00,
        suppliers: ['SUP001', 'SUP003', 'SUP004'],
        isActive: true
    },
    'أنسولين طويل المفعول': {
        id: 'DRUG003',
        category: 'أدوية',
        subcategory: 'أدوية مزمنة',
        unit: 'قلم',
        standardPack: 10,
        description: 'أنسولين لعلاج السكري',
        specifications: '300 وحدة دولية، مبرد',
        shelf_life: '18 شهر',
        storage_conditions: 'يحفظ مبرداً 2-8 درجة مئوية',
        typical_price: 85.00,
        min_price: 75.00,
        max_price: 95.00,
        suppliers: ['SUP001', 'SUP003'],
        isActive: true
    },

    // Medical Supplies - مستلزمات طبية
    'محقن يستعمل لمرة واحدة 5 مل': {
        id: 'MED001',
        category: 'مستلزمات طبية',
        subcategory: 'أدوات حقن',
        unit: 'قطعة',
        standardPack: 1000,
        description: 'محقن طبي معقم للاستعمال مرة واحدة',
        specifications: '5 مل، بلاستيك طبي، إبرة 21G',
        shelf_life: '60 شهر',
        storage_conditions: 'يحفظ في مكان جاف ونظيف',
        typical_price: 0.75,
        min_price: 0.60,
        max_price: 0.90,
        suppliers: ['SUP002', 'SUP003', 'SUP005'],
        isActive: true
    },
    'شاش طبي معقم 10×10 سم': {
        id: 'MED002',
        category: 'مستلزمات طبية',
        subcategory: 'ضمادات',
        unit: 'قطعة',
        standardPack: 100,
        description: 'شاش طبي معقم للجروح والضمادات',
        specifications: '100% قطن، معقم بأشعة جاما',
        shelf_life: '60 شهر',
        storage_conditions: 'يحفظ في عبوة محكمة الغلق',
        typical_price: 1.25,
        min_price: 1.00,
        max_price: 1.50,
        suppliers: ['SUP002', 'SUP003'],
        isActive: true
    },
    'قفازات طبية لاتكس مقاس متوسط': {
        id: 'MED003',
        category: 'مستلزمات طبية',
        subcategory: 'حماية شخصية',
        unit: 'صندوق',
        standardPack: 10,
        description: 'قفازات طبية لاتكس للفحص والجراحة',
        specifications: 'خالية من البودرة، مقاس M، 100 قطعة/صندوق',
        shelf_life: '60 شهر',
        storage_conditions: 'يحفظ بعيداً عن الضوء والحرارة',
        typical_price: 45.00,
        min_price: 40.00,
        max_price: 55.00,
        suppliers: ['SUP002', 'SUP003', 'SUP005'],
        isActive: true
    },

    // Medical Equipment - أجهزة طبية
    'جهاز قياس ضغط الدم الزئبقي': {
        id: 'EQP001',
        category: 'أجهزة طبية',
        subcategory: 'أجهزة قياس',
        unit: 'قطعة',
        standardPack: 1,
        description: 'جهاز قياس ضغط الدم الزئبقي المحمول',
        specifications: 'دقة عالية، مقياس زئبقي، حقيبة جلدية',
        shelf_life: '120 شهر',
        storage_conditions: 'يحفظ في مكان جاف',
        typical_price: 450.00,
        min_price: 400.00,
        max_price: 500.00,
        suppliers: ['SUP005', 'SUP003'],
        isActive: true
    },
    'ترمومتر رقمي طبي': {
        id: 'EQP002',
        category: 'أجهزة طبية',
        subcategory: 'أجهزة قياس',
        unit: 'قطعة',
        standardPack: 20,
        description: 'ترمومتر رقمي لقياس درجة الحرارة',
        specifications: 'شاشة LCD، دقة ±0.1°، مقاوم للماء',
        shelf_life: '60 شهر',
        storage_conditions: 'يحفظ في درجة حرارة الغرفة',
        typical_price: 35.00,
        min_price: 30.00,
        max_price: 42.00,
        suppliers: ['SUP005', 'SUP002'],
        isActive: true
    },

    // Laboratory Supplies - مستلزمات مختبر
    'أنابيب اختبار زجاجية': {
        id: 'LAB001',
        category: 'مستلزمات مختبر',
        subcategory: 'أدوات تحليل',
        unit: 'صندوق',
        standardPack: 5,
        description: 'أنابيب اختبار زجاجية للتحاليل المخبرية',
        specifications: 'زجاج بوروسيليكات، 15 مل، 144 قطعة/صندوق',
        shelf_life: 'غير محدود',
        storage_conditions: 'يحفظ في صناديق محمية من الكسر',
        typical_price: 85.00,
        min_price: 75.00,
        max_price: 95.00,
        suppliers: ['SUP005', 'SUP003'],
        isActive: true
    }
};

// Staff Database with roles and permissions
const STAFF_DB = {
    'د. أحمد محمد علي': {
        id: 'STF001',
        position: 'مدير المستشفى',
        department: 'الإدارة العليا',
        phone: '01234567890',
        email: 'director@hospital.gov.eg',
        permissions: ['approve_purchases', 'view_reports', 'manage_staff'],
        signature_authority: 'unlimited',
        isActive: true
    },
    'د. فاطمة حسن محمود': {
        id: 'STF002',
        position: 'رئيس قسم الصيدلة',
        department: 'الصيدلة',
        phone: '01987654321',
        email: 'pharmacy@hospital.gov.eg',
        permissions: ['approve_drugs', 'manage_inventory'],
        signature_authority: '50000',
        isActive: true
    },
    'محمد أحمد السيد': {
        id: 'STF003',
        position: 'مدير المشتريات',
        department: 'المشتريات والتوريدات',
        phone: '01122334455',
        email: 'purchasing@hospital.gov.eg',
        permissions: ['create_orders', 'manage_suppliers', 'price_analysis'],
        signature_authority: '100000',
        isActive: true
    },
    'نورا عبد الله إبراهيم': {
        id: 'STF004',
        position: 'المدير المالي',
        department: 'الشؤون المالية',
        phone: '01556677889',
        email: 'finance@hospital.gov.eg',
        permissions: ['approve_payments', 'financial_reports', 'budget_management'],
        signature_authority: '200000',
        isActive: true
    },
    'د. محمود عبد الرحمن': {
        id: 'STF005',
        position: 'رئيس قسم المختبر',
        department: 'المختبر',
        phone: '01223344556',
        email: 'lab@hospital.gov.eg',
        permissions: ['approve_lab_supplies'],
        signature_authority: '30000',
        isActive: true
    },
    'سامية أحمد محمد': {
        id: 'STF006',
        position: 'مسؤول المخازن',
        department: 'المخازن',
        phone: '01334455667',
        email: 'stores@hospital.gov.eg',
        permissions: ['manage_inventory', 'receive_goods'],
        signature_authority: '25000',
        isActive: true
    },
    'عمرو سعد الدين': {
        id: 'STF007',
        position: 'محاسب أول',
        department: 'المحاسبة',
        phone: '01445566778',
        email: 'accounting@hospital.gov.eg',
        permissions: ['process_invoices', 'financial_records'],
        signature_authority: '15000',
        isActive: true
    },
    'هند محمد عبدالله': {
        id: 'STF008',
        position: 'سكرتير المدير',
        department: 'الإدارة العليا',
        phone: '01556677889',
        email: 'secretary@hospital.gov.eg',
        permissions: ['schedule_meetings', 'document_management'],
        signature_authority: '0',
        isActive: true
    }
};

// Hospital Departments
const DEPARTMENTS = {
    'الطوارئ': {
        id: 'DEPT001',
        head: 'STF001',
        budget_limit: 500000,
        specialization: 'خدمات طوارئ'
    },
    'الجراحة العامة': {
        id: 'DEPT002',
        head: 'STF001',
        budget_limit: 750000,
        specialization: 'عمليات جراحية'
    },
    'الباطنة': {
        id: 'DEPT003',
        head: 'STF001',
        budget_limit: 400000,
        specialization: 'أمراض باطنية'
    },
    'الأطفال': {
        id: 'DEPT004',
        head: 'STF001',
        budget_limit: 350000,
        specialization: 'طب الأطفال'
    },
    'النساء والتوليد': {
        id: 'DEPT005',
        head: 'STF001',
        budget_limit: 450000,
        specialization: 'أمراض النساء والولادة'
    },
    'المختبر': {
        id: 'DEPT006',
        head: 'STF005',
        budget_limit: 200000,
        specialization: 'التحاليل الطبية'
    },
    'الأشعة': {
        id: 'DEPT007',
        head: 'STF001',
        budget_limit: 300000,
        specialization: 'التصوير الطبي'
    },
    'الصيدلة': {
        id: 'DEPT008',
        head: 'STF002',
        budget_limit: 800000,
        specialization: 'الأدوية والمستحضرات'
    }
};

// Procurement Categories and Rules
const PROCUREMENT_RULES = {
    direct_purchase: {
        limit: 5000,
        approval_level: 'department_head'
    },
    limited_tender: {
        limit: 50000,
        approval_level: 'purchasing_manager',
        min_suppliers: 3
    },
    public_tender: {
        limit: Infinity,
        approval_level: 'director',
        min_suppliers: 5,
        committee_required: true
    }
};

// Form Validation Rules
const VALIDATION_RULES = {
    required_fields: {
        supplier_name: 'اسم المورد مطلوب',
        item_name: 'اسم الصنف مطلوب',
        quantity: 'الكمية مطلوبة',
        price: 'السعر مطلوب',
        date: 'التاريخ مطلوب'
    },
    field_formats: {
        phone: /^01[0-9]{9}$/,
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        tax_number: /^[0-9]{9}$/,
        price: /^\d+(\.\d{1,2})?$/
    },
    field_ranges: {
        quantity: { min: 0.01, max: 999999 },
        price: { min: 0.01, max: 9999999 },
        discount: { min: 0, max: 100 }
    }
};

// Status Constants
const STATUS = {
    DRAFT: 'مسودة',
    PENDING: 'قيد المراجعة',
    APPROVED: 'معتمد',
    REJECTED: 'مرفوض',
    COMPLETED: 'مكتمل',
    CANCELLED: 'ملغى'
};

// Priority Levels
const PRIORITY = {
    LOW: 'عادي',
    MEDIUM: 'متوسط',
    HIGH: 'عاجل',
    CRITICAL: 'طارئ'
};

// Document Types
const DOCUMENT_TYPES = {
    PURCHASE_ORDER: 'أمر شراء',
    PRICE_ANALYSIS: 'تحليل أسعار',
    MEETING_MINUTES: 'محضر اجتماع',
    REQUEST_FORM: 'طلب صرف',
    ESTIMATION: 'مقايسة تقديرية',
    COMMITTEE_FORMATION: 'تشكيل لجنة',
    TAX_INFO: 'بيانات ضريبية'
};

// Export all data for use in other files
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = {
        APP_CONFIG,
        SUPPLIERS_DB,
        MEDICAL_ITEMS_DB,
        STAFF_DB,
        DEPARTMENTS,
        PROCUREMENT_RULES,
        VALIDATION_RULES,
        STATUS,
        PRIORITY,
        DOCUMENT_TYPES
    };
} else {
    // Browser environment - make available globally
    window.APP_DATA = {
        APP_CONFIG,
        SUPPLIERS_DB,
        MEDICAL_ITEMS_DB,
        STAFF_DB,
        DEPARTMENTS,
        PROCUREMENT_RULES,
        VALIDATION_RULES,
        STATUS,
        PRIORITY,
        DOCUMENT_TYPES
    };
}