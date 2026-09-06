export type Language = 'ar' | 'fr' | 'en';

export interface LanguageOption {
  code: Language;
  label: string;
  flag: string;
  dir: 'rtl' | 'ltr';
  locale: string;
  currency: string;
}

export const LANGUAGES: Record<Language, LanguageOption> = {
  ar: { code: 'ar', label: 'العربية', flag: '🇩🇿', dir: 'rtl', locale: 'ar-DZ', currency: 'دج' },
  fr: { code: 'fr', label: 'Français', flag: '🇫🇷', dir: 'ltr', locale: 'fr-DZ', currency: 'DA' },
  en: { code: 'en', label: 'English', flag: '🇬🇧', dir: 'ltr', locale: 'en-DZ', currency: 'DZD' },
};

export type CategoryKey = 'برجر' | 'بيتزا' | 'وجبات' | 'مشروبات' | 'تحلية';

export const CATEGORY_KEYS: CategoryKey[] = ['برجر', 'بيتزا', 'وجبات', 'مشروبات', 'تحلية'];

export const CATEGORY_TRANSLATIONS: Record<Language, Record<CategoryKey, string>> = {
  ar: { 'برجر': 'برجر', 'بيتزا': 'بيتزا', 'وجبات': 'وجبات', 'مشروبات': 'مشروبات', 'تحلية': 'تحلية' },
  fr: { 'برجر': 'Burgers', 'بيتزا': 'Pizzas', 'وجبات': 'Repas', 'مشروبات': 'Boissons', 'تحلية': 'Desserts' },
  en: { 'برجر': 'Burgers', 'بيتزا': 'Pizzas', 'وجبات': 'Meals', 'مشروبات': 'Drinks', 'تحلية': 'Desserts' },
};

export interface TranslationStrings {
  // App / Header
  restaurantName: string;
  restaurantSubtitle: string;
  restaurantTagline: string;
  restaurantAddress: string;
  restaurantPhone: string;
  posSystem: string;
  adminPanel: string;
  toggleTheme: string;
  languageLabel: string;

  // POS Screen
  searchPlaceholder: string;
  loadingMenu: string;
  noItems: string;

  // Cart
  currentOrder: string;
  itemCount: (count: number, pieces: number) => string;
  clearAll: string;
  emptyCartTitle: string;
  emptyCartDesc: string;
  addNote: string;
  notePlaceholder: string;
  orderType: string;
  paymentMethod: string;
  taxLabel: string;
  discountLabel: string;
  subtotal: string;
  tax: (rate: number) => string;
  discount: string;
  total: string;
  checkout: string;
  processing: string;
  manageTables: string;
  tableNumber: string;
  selectTable: string;
  table: string;
  availableTable: string;
  occupiedTable: string;
  availableTables: string;
  occupiedTables: string;
  settleBill: string;
  settling: string;
  tableRequired: string;
  tableOrderSaved: string;
  noOccupiedTables: string;
  backToPos: string;
  kitchenDisplay: string;
  kitchenOrders: string;
  noKitchenOrders: string;
  markAsReady: string;
  markingReady: string;
  orderReady: string;
  orderPending: string;
  orderPreparing: string;
  addMoreItems: string;
  orderTypeLabel: string;
  orderDetails: string;
  editOrderInPos: string;
  orderStatus: string;
  activeOrder: string;
  itemsLabel: string;

  // Order types
  dineIn: string;
  takeaway: string;
  delivery: string;

  // Payment
  cash: string;
  card: string;

  // Receipt
  printReceipt: string;
  close: string;
  orderNumber: string;
  date: string;
  item: string;
  qty: string;
  price: string;
  thankYou: string;
  enjoyMeal: string;
  electronicallyGenerated: string;
  logoLetter: string;

  // Admin Dashboard
  dashboard: string;
  todaySummary: string;
  menuManagement: string;
  orderHistory: string;
  todaySales: string;
  orderCount: string;
  itemsSold: string;
  todayOrders: string;
  noOrdersToday: string;
  menuItems: (count: number) => string;
  addItem: string;
  editItem: string;
  newItem: string;
  name: string;
  category: string;
  priceLabel: string;
  imageUrl: string;
  description: string;
  namePlaceholder: string;
  descPlaceholder: string;
  save: string;
  saving: string;
  cancel: string;
  available: string;
  hidden: string;
  deleteConfirm: string;
  noOrdersHistory: string;
  loading: string;
  itemsCount: (count: number) => string;
  customerMenu: string;
  customerOrder: string;
  submitCustomerOrder: string;
  orderSubmitted: string;
  tableOrder: (table: number) => string;
  generateTableQr: string;
  tableQrCodes: string;
  scanToOrder: string;
  printQrCodes: string;

  // Errors
  errorPrefix: string;
  orderNumberError: string;
}

export const TRANSLATIONS: Record<Language, TranslationStrings> = {
  ar: {
    restaurantName: 'مطعم الجزائر',
    restaurantSubtitle: 'نظام نقاط البيع',
    restaurantTagline: 'مطعم الجزائر · الجزائر العاصمة',
    restaurantAddress: 'مطعم الجزائر · الجزائر العاصمة',
    restaurantPhone: 'هاتف: 0550 12 34 56',
    posSystem: 'نظام نقاط البيع',
    adminPanel: 'لوحة التحكم',
    toggleTheme: 'تبديل الوضع',
    languageLabel: 'اللغة',

    searchPlaceholder: 'ابحث عن صنف...',
    loadingMenu: 'جاري تحميل القائمة...',
    noItems: 'لا توجد أصناف',

    currentOrder: 'الطلب الحالي',
    itemCount: (count, pieces) => `${count} صنف · ${pieces} قطعة`,
    clearAll: 'مسح الكل',
    emptyCartTitle: 'لا توجد أصناف في الطلب بعد',
    emptyCartDesc: 'اضغط على الأصناف لإضافتها',
    addNote: 'إضافة ملاحظة',
    notePlaceholder: 'ملاحظة: بدون بصل، إضافة جبن...',
    orderType: 'نوع الطلب',
    paymentMethod: 'طريقة الدفع',
    taxLabel: 'الضريبة (%)',
    discountLabel: 'خصم (دج)',
    subtotal: 'المجموع الفرعي',
    tax: (rate) => `الضريبة (${rate}%)`,
    discount: 'الخصم',
    total: 'الإجمالي',
    checkout: 'إتمام الطلب وطباعة الفاتورة',
    processing: 'جاري المعالجة...',
    manageTables: 'إدارة الطاولات',
    tableNumber: 'رقم الطاولة',
    selectTable: 'اختر طاولة',
    table: 'طاولة',
    availableTable: 'متاحة',
    occupiedTable: 'مشغولة',
    availableTables: 'الطاولات المتاحة',
    occupiedTables: 'الطاولات المشغولة',
    settleBill: 'تسوية الحساب',
    settling: 'جاري التسوية...',
    tableRequired: 'يرجى اختيار طاولة للطلب داخل المطعم',
    tableOrderSaved: 'تم حفظ الطلب على الطاولة',
    noOccupiedTables: 'لا توجد طاولات مشغولة',
    backToPos: 'العودة إلى نقطة البيع',
    kitchenDisplay: 'شاشة المطبخ',
    kitchenOrders: 'الطلبات قيد التحضير',
    noKitchenOrders: 'لا توجد طلبات قيد التحضير',
    markAsReady: 'تم التجهيز',
    markingReady: 'جاري التحديث...',
    orderReady: 'جاهز',
    orderPending: 'قيد الانتظار',
    orderPreparing: 'قيد التحضير',
    addMoreItems: 'إضافة أصناف',
    orderTypeLabel: 'نوع الطلب',
    orderDetails: 'تفاصيل الطلب',
    editOrderInPos: 'تعديل الطلب في نقطة البيع',
    orderStatus: 'حالة الطلب',
    activeOrder: 'طلب نشط',
    itemsLabel: 'الأصناف',

    dineIn: 'في المطعم',
    takeaway: 'سفري',
    delivery: 'توصيل',

    cash: 'كاش',
    card: 'بطاقة',

    printReceipt: 'طباعة الفاتورة',
    close: 'إغلاق',
    orderNumber: 'رقم الطلب:',
    date: 'التاريخ:',
    item: 'الصنف',
    qty: 'كمية',
    price: 'السعر',
    thankYou: 'شكراً لزيارتكم',
    enjoyMeal: 'نتمنى لكم وجبة شهية',
    electronicallyGenerated: 'تم إنشاء هذه الفاتورة إلكترونياً',
    logoLetter: 'ر',

    dashboard: 'لوحة التحكم',
    todaySummary: 'ملخص اليوم',
    menuManagement: 'إدارة القائمة',
    orderHistory: 'سجل الطلبات',
    todaySales: 'إجمالي مبيعات اليوم',
    orderCount: 'عدد الطلبات',
    itemsSold: 'عدد الأصناف المباعة',
    todayOrders: 'طلبات اليوم',
    noOrdersToday: 'لا توجد طلبات بعد اليوم',
    menuItems: (count) => `قائمة الأصناف (${count})`,
    addItem: 'إضافة صنف',
    editItem: 'تعديل صنف',
    newItem: 'صنف جديد',
    name: 'الاسم',
    category: 'التصنيف',
    priceLabel: 'السعر (دج)',
    imageUrl: 'رابط الصورة',
    description: 'الوصف',
    namePlaceholder: 'اسم الصنف',
    descPlaceholder: 'وصف مختصر',
    save: 'حفظ',
    saving: 'جاري الحفظ...',
    cancel: 'إلغاء',
    available: 'متاح',
    hidden: 'مخفي',
    deleteConfirm: 'هل أنت متأكد من حذف هذا الصنف؟',
    noOrdersHistory: 'لا توجد طلبات في السجل',
    loading: 'جاري التحميل...',
    itemsCount: (count) => `${count} أصناف`,
    customerMenu: 'قائمة الطلب للزبون',
    customerOrder: 'طلبك',
    submitCustomerOrder: 'إرسال الطلب',
    orderSubmitted: 'تم إرسال طلبك إلى المطبخ',
    tableOrder: (table) => `طلب الطاولة ${table}`,
    generateTableQr: 'إنشاء رموز QR للطاولات',
    tableQrCodes: 'رموز QR للطاولات',
    scanToOrder: 'امسح للطلب من طاولتك',
    printQrCodes: 'طباعة الرموز',

    errorPrefix: 'حدث خطأ: ',
    orderNumberError: 'فشل في إنشاء رقم الطلب',
  },

  fr: {
    restaurantName: 'Restaurant El Djazair',
    restaurantSubtitle: 'Système de point de vente',
    restaurantTagline: 'Restaurant El Djazair · Alger',
    restaurantAddress: 'Restaurant El Djazair · Alger',
    restaurantPhone: 'Tél: 0550 12 34 56',
    posSystem: 'Système de caisse',
    adminPanel: 'Tableau de bord',
    toggleTheme: 'Changer le thème',
    languageLabel: 'Langue',

    searchPlaceholder: 'Rechercher un article...',
    loadingMenu: 'Chargement du menu...',
    noItems: 'Aucun article',

    currentOrder: 'Commande en cours',
    itemCount: (count, pieces) => `${count} article(s) · ${pieces} pièce(s)`,
    clearAll: 'Tout effacer',
    emptyCartTitle: 'Aucun article dans la commande',
    emptyCartDesc: 'Cliquez sur les articles pour les ajouter',
    addNote: 'Ajouter une note',
    notePlaceholder: 'Note: sans oignon, fromage supplémentaire...',
    orderType: 'Type de commande',
    paymentMethod: 'Mode de paiement',
    taxLabel: 'Taxe (%)',
    discountLabel: 'Remise (DA)',
    subtotal: 'Sous-total',
    tax: (rate) => `Taxe (${rate}%)`,
    discount: 'Remise',
    total: 'Total',
    checkout: 'Finaliser et imprimer le reçu',
    processing: 'Traitement...',
    manageTables: 'Gestion des tables',
    tableNumber: 'Numéro de table',
    selectTable: 'Choisir une table',
    table: 'Table',
    availableTable: 'Disponible',
    occupiedTable: 'Occupée',
    availableTables: 'Tables disponibles',
    occupiedTables: 'Tables occupées',
    settleBill: 'Régler l’addition',
    settling: 'Règlement...',
    tableRequired: 'Veuillez choisir une table pour une commande sur place',
    tableOrderSaved: 'Commande enregistrée à la table',
    noOccupiedTables: 'Aucune table occupée',
    backToPos: 'Retour à la caisse',
    kitchenDisplay: 'Écran de cuisine',
    kitchenOrders: 'Commandes en préparation',
    noKitchenOrders: 'Aucune commande en préparation',
    markAsReady: 'Marquer comme prête',
    markingReady: 'Mise à jour...',
    orderReady: 'Prête',
    orderPending: 'En attente',
    orderPreparing: 'En préparation',
    addMoreItems: 'Ajouter des articles',
    orderTypeLabel: 'Type de commande',
    orderDetails: 'Détails de la commande',
    editOrderInPos: 'Modifier dans la caisse',
    orderStatus: 'État de la commande',
    activeOrder: 'Commande active',
    itemsLabel: 'Articles',

    dineIn: 'Sur place',
    takeaway: 'À emporter',
    delivery: 'Livraison',

    cash: 'Espèces',
    card: 'Carte',

    printReceipt: 'Imprimer le reçu',
    close: 'Fermer',
    orderNumber: 'N° commande:',
    date: 'Date:',
    item: 'Article',
    qty: 'Qté',
    price: 'Prix',
    thankYou: 'Merci de votre visite',
    enjoyMeal: 'Bon appétit',
    electronicallyGenerated: 'Reçu généré électroniquement',
    logoLetter: 'R',

    dashboard: 'Tableau de bord',
    todaySummary: "Résumé du jour",
    menuManagement: 'Gestion du menu',
    orderHistory: 'Historique des commandes',
    todaySales: "Ventes du jour",
    orderCount: 'Nombre de commandes',
    itemsSold: 'Articles vendus',
    todayOrders: "Commandes d'aujourd'hui",
    noOrdersToday: 'Aucune commande aujourd\'hui',
    menuItems: (count) => `Articles du menu (${count})`,
    addItem: 'Ajouter un article',
    editItem: 'Modifier l\'article',
    newItem: 'Nouvel article',
    name: 'Nom',
    category: 'Catégorie',
    priceLabel: 'Prix (DA)',
    imageUrl: 'URL de l\'image',
    description: 'Description',
    namePlaceholder: "Nom de l'article",
    descPlaceholder: 'Brève description',
    save: 'Enregistrer',
    saving: 'Enregistrement...',
    cancel: 'Annuler',
    available: 'Disponible',
    hidden: 'Masqué',
    deleteConfirm: 'Êtes-vous sûr de vouloir supprimer cet article ?',
    noOrdersHistory: 'Aucune commande dans l\'historique',
    loading: 'Chargement...',
    itemsCount: (count) => `${count} article(s)`,
    customerMenu: 'Menu client',
    customerOrder: 'Votre commande',
    submitCustomerOrder: 'Envoyer la commande',
    orderSubmitted: 'Votre commande a été envoyée en cuisine',
    tableOrder: (table) => `Commande table ${table}`,
    generateTableQr: 'Générer les QR des tables',
    tableQrCodes: 'QR des tables',
    scanToOrder: 'Scannez pour commander à votre table',
    printQrCodes: 'Imprimer les QR',

    errorPrefix: 'Erreur: ',
    orderNumberError: 'Échec de la création du numéro de commande',
  },

  en: {
    restaurantName: 'El Djazair Restaurant',
    restaurantSubtitle: 'Point of Sale System',
    restaurantTagline: 'El Djazair Restaurant · Algiers',
    restaurantAddress: 'El Djazair Restaurant · Algiers',
    restaurantPhone: 'Tel: 0550 12 34 56',
    posSystem: 'Point of Sale System',
    adminPanel: 'Dashboard',
    toggleTheme: 'Toggle theme',
    languageLabel: 'Language',

    searchPlaceholder: 'Search for an item...',
    loadingMenu: 'Loading menu...',
    noItems: 'No items found',

    currentOrder: 'Current Order',
    itemCount: (count, pieces) => `${count} item(s) · ${pieces} piece(s)`,
    clearAll: 'Clear all',
    emptyCartTitle: 'No items in the order yet',
    emptyCartDesc: 'Click on items to add them',
    addNote: 'Add a note',
    notePlaceholder: 'Note: no onions, extra cheese...',
    orderType: 'Order type',
    paymentMethod: 'Payment method',
    taxLabel: 'Tax (%)',
    discountLabel: 'Discount (DZD)',
    subtotal: 'Subtotal',
    tax: (rate) => `Tax (${rate}%)`,
    discount: 'Discount',
    total: 'Total',
    checkout: 'Complete Order & Print Receipt',
    processing: 'Processing...',
    manageTables: 'Table Management',
    tableNumber: 'Table number',
    selectTable: 'Select a table',
    table: 'Table',
    availableTable: 'Available',
    occupiedTable: 'Occupied',
    availableTables: 'Available tables',
    occupiedTables: 'Occupied tables',
    settleBill: 'Settle bill',
    settling: 'Settling...',
    tableRequired: 'Please select a table for a dine-in order',
    tableOrderSaved: 'Order saved to table',
    noOccupiedTables: 'No occupied tables',
    backToPos: 'Back to POS',
    kitchenDisplay: 'Kitchen Display',
    kitchenOrders: 'Orders in preparation',
    noKitchenOrders: 'No orders in preparation',
    markAsReady: 'Mark as Ready',
    markingReady: 'Updating...',
    orderReady: 'Ready',
    orderPending: 'Pending',
    orderPreparing: 'Preparing',
    addMoreItems: 'Add more items',
    orderTypeLabel: 'Order type',
    orderDetails: 'Order details',
    editOrderInPos: 'Edit Order in POS',
    orderStatus: 'Order status',
    activeOrder: 'Active order',
    itemsLabel: 'Items',

    dineIn: 'Dine-in',
    takeaway: 'Takeaway',
    delivery: 'Delivery',

    cash: 'Cash',
    card: 'Card',

    printReceipt: 'Print Receipt',
    close: 'Close',
    orderNumber: 'Order No:',
    date: 'Date:',
    item: 'Item',
    qty: 'Qty',
    price: 'Price',
    thankYou: 'Thank you for your visit',
    enjoyMeal: 'Enjoy your meal',
    electronicallyGenerated: 'This receipt was generated electronically',
    logoLetter: 'R',

    dashboard: 'Dashboard',
    todaySummary: "Today's Summary",
    menuManagement: 'Menu Management',
    orderHistory: 'Order History',
    todaySales: "Today's Sales",
    orderCount: 'Order Count',
    itemsSold: 'Items Sold',
    todayOrders: "Today's Orders",
    noOrdersToday: 'No orders today yet',
    menuItems: (count) => `Menu Items (${count})`,
    addItem: 'Add Item',
    editItem: 'Edit Item',
    newItem: 'New Item',
    name: 'Name',
    category: 'Category',
    priceLabel: 'Price (DZD)',
    imageUrl: 'Image URL',
    description: 'Description',
    namePlaceholder: 'Item name',
    descPlaceholder: 'Brief description',
    save: 'Save',
    saving: 'Saving...',
    cancel: 'Cancel',
    available: 'Available',
    hidden: 'Hidden',
    deleteConfirm: 'Are you sure you want to delete this item?',
    noOrdersHistory: 'No orders in history',
    loading: 'Loading...',
    itemsCount: (count) => `${count} item(s)`,
    customerMenu: 'Customer Menu',
    customerOrder: 'Your Order',
    submitCustomerOrder: 'Submit Order',
    orderSubmitted: 'Your order was sent to the kitchen',
    tableOrder: (table) => `Table ${table} order`,
    generateTableQr: 'Generate Table QR Codes',
    tableQrCodes: 'Table QR Codes',
    scanToOrder: 'Scan to order from your table',
    printQrCodes: 'Print QR Codes',

    errorPrefix: 'Error: ',
    orderNumberError: 'Failed to create order number',
  },
};
