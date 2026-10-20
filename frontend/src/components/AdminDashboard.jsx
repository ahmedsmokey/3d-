import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  DollarSign,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  Truck,
  RotateCcw,
  Search,
  Filter,
  ArrowUpRight,
  Sparkles,
  Database,
  X,
  Upload,
  Image as ImageIcon,
  Loader2,
  Layers,
  Flame,
  Cpu,
  Wind,
  Radio,
  Zap,
  Activity,
  HardDrive,
  Box,
  Wrench,
  Tag,
  Percent,
  FolderPlus,
  Star,
  Building2,
  Printer,
  UserCheck,
  ShieldCheck,
  Check
} from 'lucide-react';
import {
  fetchDashboardStats,
  fetchAdminOrders,
  fetchCustomers,
  fetchProducts,
  fetchCategories,
  fetchBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  fetchPrinters,
  createPrinter,
  updatePrinter,
  deletePrinter,
  createProduct,
  updateProduct,
  deleteProduct,
  createCategory,
  updateCategory,
  deleteCategory,
  updateOrderStatus,
  deleteOrder,
  uploadProductImage,
  uploadProductImages,
  fetchBanners,
  createBanner,
  deleteBanner,
  toggleProductDeal,
  batchUpdateDeals,
  fetchEmployees,
  createEmployee,
  deleteEmployee,
  fetchAccounts,
  createAccount,
  deleteAccount,
  fetchRoles,
  createRole,
  deleteRole,
  toggleUserActiveStatus
} from '../api';

const CATEGORY_ICON_OPTIONS = [
  { name: 'Tool', label_ar: 'أدوات وصيانة', label_en: 'Tools & Parts', icon: Wrench },
  { name: 'Flame', label_ar: 'فوهات ورؤوس تسخين', label_en: 'Nozzles / Hotends', icon: Flame },
  { name: 'Layers', label_ar: 'ألواح وأسطح طباعة', label_en: 'Build Plates', icon: Layers },
  { name: 'Cpu', label_ar: 'معالجات ولوحات', label_en: 'Mainboards & MCU', icon: Cpu },
  { name: 'Wind', label_ar: 'مراوح وتبريد', label_en: 'Cooling Fans', icon: Wind },
  { name: 'Radio', label_ar: 'حساسات ومستشعرات', label_en: 'Sensors / BLTouch', icon: Radio },
  { name: 'Zap', label_ar: 'طاقة ومحركات', label_en: 'Motors & Power', icon: Zap },
  { name: 'Activity', label_ar: 'مغذيات وإكسترودر', label_en: 'Extruders', icon: Activity },
  { name: 'HardDrive', label_ar: 'شاشات وذاكرة', label_en: 'Displays & Storage', icon: HardDrive },
  { name: 'Box', label_ar: 'هياكل وملحقات', label_en: 'Chassis & Frames', icon: Box },
];

export const getCategoryIconComponent = (iconName) => {
  const match = CATEGORY_ICON_OPTIONS.find((i) => i.name === iconName);
  if (match) return match.icon;
  if (iconName === 'Tool') return Wrench;
  return Layers;
};

export default function AdminDashboard({
  lang,
  t,
  banners: externalBanners = [],
  onBackToStore,
  onCategoriesUpdated,
  onBrandsUpdated,
  onPrintersUpdated,
  onProductsUpdated,
  onBannersUpdated
}) {
  const [activeTab, setActiveTab] = useState('overview'); // overview, products, categories, brands, printers, orders, customers
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [printers, setPrinters] = useState([]);
  const [banners, setBanners] = useState(externalBanners || []);
  const [loading, setLoading] = useState(true);

  // Hero Banner Management States
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [bannerDimensions, setBannerDimensions] = useState(null);
  const [bannerTitle, setBannerTitle] = useState('');
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [bannerError, setBannerError] = useState(null);
  const bannerFileInputRef = useRef(null);

  useEffect(() => {
    if (externalBanners && externalBanners.length >= 0) {
      setBanners(externalBanners);
    }
  }, [externalBanners]);

  // Search & Filter in Tables
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [brandSearch, setBrandSearch] = useState('');
  const [printerSearch, setPrinterSearch] = useState('');
  const [printerBrandFilter, setPrinterBrandFilter] = useState('');

  // Modals
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isAddBrandOpen, setIsAddBrandOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [isAddPrinterOpen, setIsAddPrinterOpen] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState(null);

  // Deals Management States
  const [dealTransferProductId, setDealTransferProductId] = useState('');
  const [dealTransferDiscount, setDealTransferDiscount] = useState(25);
  const [dealTransferPrice, setDealTransferPrice] = useState('');
  const [dealTransferDesc, setDealTransferDesc] = useState('عرض خاص');
  const [dealSearch, setDealSearch] = useState('');
  const [editingDealProduct, setEditingDealProduct] = useState(null);
  const [isProcessingDeal, setIsProcessingDeal] = useState(false);

  // Image Uploading States
  const [isUploadingAddImage, setIsUploadingAddImage] = useState(false);
  const [isUploadingEditImage, setIsUploadingEditImage] = useState(false);
  const [variantUploadLoadingAdd, setVariantUploadLoadingAdd] = useState(null);
  const [variantUploadLoadingEdit, setVariantUploadLoadingEdit] = useState(null);

  // New category form
  const [categoryForm, setCategoryForm] = useState({
    name_ar: '',
    name_en: '',
    slug: '',
    icon_name: 'Tool',
    description_ar: '',
    description_en: '',
    slugModified: false
  });

  // Brand form
  const [brandForm, setBrandForm] = useState({
    name: '',
    slug: '',
    description: '',
    logo_url: '',
    slugModified: false
  });

  // Printer model form
  const [printerForm, setPrinterForm] = useState({
    name: '',
    slug: '',
    brand: '',
    technology: 'FDM',
    image_url: '',
    slugModified: false
  });

  // Multi-image URL inputs
  const [newImageUrlAdd, setNewImageUrlAdd] = useState('');
  const [newImageUrlEdit, setNewImageUrlEdit] = useState('');

  // New product form
  const [productForm, setProductForm] = useState({
    name_ar: '',
    name_en: '',
    slug: '',
    category: '',
    sku: '',
    price: '',
    original_price: '',
    stock_quantity: 10,
    description_ar: '',
    description_en: '',
    image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'],
    has_variants: false,
    variants: [],
    is_universal: false,
    is_featured: false,
    is_deal: false,
    deal_discount_percentage: 0,
    deal_description: ''
  });

  // Accounts, Employees, Roles State
  const [employees, setEmployees] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [roles, setRoles] = useState([]);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [employeeRoleFilter, setEmployeeRoleFilter] = useState('all');
  const [employeeActiveFilter, setEmployeeActiveFilter] = useState('all');
  const [employeeSuperFilter, setEmployeeSuperFilter] = useState('all');
  const [accountSearch, setAccountSearch] = useState('');
  const [accountStaffFilter, setAccountStaffFilter] = useState('all');
  const [accountActiveFilter, setAccountActiveFilter] = useState('all');
  const [accountRoleFilter, setAccountRoleFilter] = useState('all');
  const [roleSearch, setRoleSearch] = useState('');

  // Modals
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);

  // Form states
  const [newEmployeeForm, setNewEmployeeForm] = useState({ name: '', email: '', phone: '+964', role_id: '' });
  const [newAccountForm, setNewAccountForm] = useState({ name: '', email: '', phone: '-', is_staff: false, role_id: '' });
  const [newRoleForm, setNewRoleForm] = useState({ name: '', code: '', permissions_summary: 'صلاحية 3 أقسام' });

  // Bulk selection states
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [employeeBulkAction, setEmployeeBulkAction] = useState('delete');
  const [selectedAccountIds, setSelectedAccountIds] = useState([]);
  const [accountBulkAction, setAccountBulkAction] = useState('delete');
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);
  const [roleBulkAction, setRoleBulkAction] = useState('delete');

  const loadData = async () => {
    setLoading(true);
    const [statsData, ordersData, customersData, prodsData, catsData, brandsData, printersData, bannersData, employeesData, accountsData, rolesData] = await Promise.all([
      fetchDashboardStats(),
      fetchAdminOrders(),
      fetchCustomers(),
      fetchProducts(),
      fetchCategories(),
      fetchBrands(),
      fetchPrinters(),
      fetchBanners(),
      fetchEmployees(),
      fetchAccounts(),
      fetchRoles()
    ]);
    setStats(statsData);
    setOrders(ordersData);
    setCustomers(customersData);
    setProducts(prodsData);
    setCategories(catsData);
    setBrands(brandsData);
    setPrinters(printersData);
    setBanners(bannersData || []);
    setEmployees(employeesData || []);
    setAccounts(accountsData || []);
    setRoles(rolesData || []);
    if (onCategoriesUpdated) onCategoriesUpdated(catsData);
    if (onBrandsUpdated) onBrandsUpdated(brandsData);
    if (onPrintersUpdated) onPrintersUpdated(printersData);
    if (onProductsUpdated) onProductsUpdated(prodsData);
    if (onBannersUpdated) onBannersUpdated(bannersData || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleActive = async (userId) => {
    try {
      const res = await toggleUserActiveStatus(userId);
      if (res.success) {
        setEmployees(prev => prev.map(u => u.id === userId ? { ...u, is_active: res.is_active } : u));
        setAccounts(prev => prev.map(u => u.id === userId ? { ...u, is_active: res.is_active } : u));
      }
    } catch (err) {
      alert('خطأ أثناء تعديل الحالة: ' + err.message);
    }
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    try {
      const res = await createEmployee(newEmployeeForm);
      if (res.success) {
        setEmployees(prev => [...prev, res.employee]);
        setShowAddEmployeeModal(false);
        setNewEmployeeForm({ name: '', email: '', phone: '+964', role_id: '' });
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الموظف؟')) return;
    try {
      await deleteEmployee(id);
      setEmployees(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    try {
      const res = await createAccount(newAccountForm);
      if (res.success) {
        setAccounts(prev => [...prev, res.account]);
        setShowAddAccountModal(false);
        setNewAccountForm({ name: '', email: '', phone: '-', is_staff: false, role_id: '' });
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteAccount = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الحساب؟')) return;
    try {
      await deleteAccount(id);
      setAccounts(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    try {
      const res = await createRole(newRoleForm);
      if (res.success) {
        setRoles(prev => [...prev, res.role]);
        setShowAddRoleModal(false);
        setNewRoleForm({ name: '', code: '', permissions_summary: 'صلاحية 3 أقسام' });
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteRole = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الدور؟')) return;
    try {
      await deleteRole(id);
      setRoles(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleExecuteAccountBulkAction = async () => {
    if (accountBulkAction !== 'delete') {
      alert(lang === 'ar' ? 'يرجى اختيار إجراء صالح' : 'Please select a valid action');
      return;
    }
    if (selectedAccountIds.length === 0) {
      alert(lang === 'ar' ? 'يرجى تحديد حساب واحد على الأقل عبر مربعات الاختيار' : 'Please select at least one account');
      return;
    }
    const count = selectedAccountIds.length;
    if (!window.confirm(lang === 'ar' ? `هل أنت متأكد من حذف (${count}) حسابات محددة نهائياً؟` : `Are you sure you want to delete (${count}) selected accounts?`)) {
      return;
    }
    try {
      await deleteAccount(selectedAccountIds);
      setAccounts(prev => prev.filter(a => !selectedAccountIds.includes(a.id)));
      setEmployees(prev => prev.filter(e => !selectedAccountIds.includes(e.id)));
      setSelectedAccountIds([]);
    } catch (err) {
      alert(lang === 'ar' ? `فشل حذف الحسابات: ${err.message}` : `Failed: ${err.message}`);
    }
  };

  const handleExecuteEmployeeBulkAction = async () => {
    if (employeeBulkAction !== 'delete') {
      alert(lang === 'ar' ? 'يرجى اختيار إجراء صالح' : 'Please select a valid action');
      return;
    }
    if (selectedEmployeeIds.length === 0) {
      alert(lang === 'ar' ? 'يرجى تحديد موظف واحد على الأقل عبر مربعات الاختيار' : 'Please select at least one employee');
      return;
    }
    const count = selectedEmployeeIds.length;
    if (!window.confirm(lang === 'ar' ? `هل أنت متأكد من حذف (${count}) موظفين محددين؟` : `Are you sure you want to delete (${count}) selected employees?`)) {
      return;
    }
    try {
      await deleteEmployee(selectedEmployeeIds);
      setEmployees(prev => prev.filter(e => !selectedEmployeeIds.includes(e.id)));
      setAccounts(prev => prev.filter(a => !selectedEmployeeIds.includes(a.id)));
      setSelectedEmployeeIds([]);
    } catch (err) {
      alert(lang === 'ar' ? `فشل حذف الموظفين: ${err.message}` : `Failed: ${err.message}`);
    }
  };

  const handleExecuteRoleBulkAction = async () => {
    if (roleBulkAction !== 'delete') {
      alert(lang === 'ar' ? 'يرجى اختيار إجراء صالح' : 'Please select a valid action');
      return;
    }
    if (selectedRoleIds.length === 0) {
      alert(lang === 'ar' ? 'يرجى تحديد دور واحد على الأقل عبر مربعات الاختيار' : 'Please select at least one role');
      return;
    }
    const count = selectedRoleIds.length;
    if (!window.confirm(lang === 'ar' ? `هل أنت متأكد من حذف (${count}) أدوار محددة؟` : `Are you sure you want to delete (${count}) selected roles?`)) {
      return;
    }
    try {
      await deleteRole(selectedRoleIds);
      setRoles(prev => prev.filter(r => !selectedRoleIds.includes(r.id)));
      setSelectedRoleIds([]);
    } catch (err) {
      alert(lang === 'ar' ? `فشل حذف الأدوار: ${err.message}` : `Failed: ${err.message}`);
    }
  };

  const handleBannerFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBannerError(null);
    setBannerFile(file);

    const objectUrl = URL.createObjectURL(file);
    setBannerPreview(objectUrl);

    const img = new Image();
    img.onload = () => {
      setBannerDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      setBannerDimensions(null);
    };
    img.src = objectUrl;
  };

  const handleCreateBannerSubmit = async (e) => {
    e.preventDefault();
    if (!bannerFile) {
      alert(lang === 'ar' ? 'يرجى اختيار صورة لرفعها أولاً' : 'Please select an image to upload first');
      return;
    }

    setIsUploadingBanner(true);
    setBannerError(null);

    try {
      const formData = new FormData();
      formData.append('image', bannerFile);
      if (bannerTitle.trim()) {
        formData.append('title', bannerTitle.trim());
      }
      formData.append('order', banners.length);

      const created = await createBanner(formData);
      const updated = [...banners, created];
      setBanners(updated);
      if (onBannersUpdated) onBannersUpdated(updated);

      setBannerFile(null);
      setBannerPreview(null);
      setBannerDimensions(null);
      setBannerTitle('');
      if (bannerFileInputRef.current) {
        bannerFileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Banner upload error:', err);
      setBannerError(err.message || (lang === 'ar' ? 'فشل رفع لافتة العرض' : 'Failed to upload banner'));
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const handleDeleteBanner = async (banner) => {
    const confirmMsg = lang === 'ar'
      ? `هل أنت متأكد من حذف هذه اللافتة؟\nسيتم إزالتها فوراً من واجهة المتجر.`
      : `Are you sure you want to delete this banner?\nIt will be removed immediately from the storefront.`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await deleteBanner(banner.id);
      const updated = banners.filter((b) => b.id !== banner.id);
      setBanners(updated);
      if (onBannersUpdated) onBannersUpdated(updated);
    } catch (err) {
      console.error('Failed to delete banner:', err);
      alert(lang === 'ar' ? `فشل حذف اللافتة: ${err.message}` : `Failed to delete banner: ${err.message}`);
    }
  };

  // Handle Order Status Change
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      if (selectedOrderDetails && selectedOrderDetails.id === orderId) {
        setSelectedOrderDetails((prev) => ({ ...prev, status: newStatus }));
      }
      // reload stats
      const s = await fetchDashboardStats();
      setStats(s);
    } catch (err) {
      alert(lang === 'ar' ? 'فشل تحديث حالة الطلب' : 'Failed to update order status');
    }
  };

  // Handle Delete Order (Especially Cancelled Invoices)
  const handleDeleteOrder = async (orderId, orderNum) => {
    const shortNum = orderNum ? `#${orderNum.substring(0, 8)}` : '';
    const confirmMsg = lang === 'ar'
      ? `هل أنت متأكد من حذف الفاتورة ${shortNum} نهائياً؟ لا يمكن التراجع عن هذا الإجراء.`
      : `Are you sure you want to permanently delete order ${shortNum}? This action cannot be undone.`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await deleteOrder(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      if (selectedOrderDetails?.id === orderId) {
        setSelectedOrderDetails(null);
      }
      const s = await fetchDashboardStats();
      setStats(s);
    } catch (err) {
      alert(lang === 'ar' ? `فشل حذف الفاتورة: ${err.message}` : `Failed to delete order: ${err.message}`);
    }
  };

  // Handle Create Product
  const handleCreateProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const generatedSlug = productForm.slug || productForm.name_en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const catId = productForm.category ? parseInt(productForm.category, 10) : (categories[0]?.id || 1);
      const imagesList = productForm.images && productForm.images.length > 0
        ? productForm.images
        : (productForm.image_url ? [productForm.image_url] : []);

      const hasVars = Boolean(productForm.has_variants && productForm.variants && productForm.variants.length > 0);
      const cleanedVariants = hasVars
        ? productForm.variants.filter((v) => v.name && v.name.trim()).map((v, i) => ({
            id: v.id || i + 1,
            name: v.name.trim(),
            name_ar: v.name_ar ? v.name_ar.trim() : v.name.trim(),
            price: v.price !== '' && v.price != null ? parseFloat(v.price) : parseFloat(productForm.price),
            in_stock: v.in_stock !== false,
            image_url: v.image_url ? v.image_url.trim() : ''
          }))
        : [];

      const payload = {
        ...productForm,
        slug: generatedSlug || `prod-${Date.now()}`,
        category: catId,
        price: parseFloat(productForm.price) || 0,
        original_price: productForm.original_price ? (parseFloat(productForm.original_price) || null) : null,
        stock_quantity: parseInt(productForm.stock_quantity, 10) || 0,
        image_url: imagesList[0] || '',
        images: imagesList,
        has_variants: cleanedVariants.length > 0,
        variants: cleanedVariants
      };
      await createProduct(payload);
      setIsAddProductOpen(false);
      setProductForm({
        name_ar: '',
        name_en: '',
        slug: '',
        category: '',
        sku: '',
        price: '',
        original_price: '',
        stock_quantity: 10,
        description_ar: '',
        description_en: '',
        image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
        images: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'],
        has_variants: false,
        variants: [],
        is_universal: false,
        is_featured: false
      });
      setNewImageUrlAdd('');
      loadData();
    } catch (err) {
      let msg = err.message || '';
      try {
        const parsed = JSON.parse(err.message);
        if (typeof parsed === 'object') {
          msg = Object.entries(parsed)
            .map(([field, errors]) => {
              const text = Array.isArray(errors) ? errors.join(', ') : errors;
              return `${field}: ${text}`;
            })
            .join('\n');
        }
      } catch (_) {}
      alert(lang === 'ar' ? `حدث خطأ أثناء إضافة المنتج:\n${msg}` : `Error adding product:\n${msg}`);
    }
  };

  // Handle File Upload from Device (supports batch selection)
  const handleFileUpload = async (fileList, target) => {
    if (!fileList || fileList.length === 0) return;
    try {
      if (target === 'add') setIsUploadingAddImage(true);
      if (target === 'edit') setIsUploadingEditImage(true);

      const filesArray = Array.from(fileList);
      const res = await uploadProductImages(filesArray);
      const newUrls = (res.images && res.images.length > 0) ? res.images : (res.image_url ? [res.image_url] : []);

      if (newUrls.length > 0) {
        if (target === 'add') {
          setProductForm((prev) => {
            const currentImages = prev.images || (prev.image_url ? [prev.image_url] : []);
            const updated = [...currentImages, ...newUrls.filter((u) => !currentImages.includes(u))];
            return {
              ...prev,
              images: updated,
              image_url: updated[0] || ''
            };
          });
        } else if (target === 'edit') {
          setEditingProduct((prev) => {
            const currentImages = prev.images || (prev.image_url ? [prev.image_url] : []);
            const updated = [...currentImages, ...newUrls.filter((u) => !currentImages.includes(u))];
            return {
              ...prev,
              images: updated,
              image_url: updated[0] || ''
            };
          });
        }
      }
    } catch (err) {
      alert(lang === 'ar' ? `فشل رفع الصور: ${err.message}` : `Image upload failed: ${err.message}`);
    } finally {
      if (target === 'add') setIsUploadingAddImage(false);
      if (target === 'edit') setIsUploadingEditImage(false);
    }
  };

  // Handle Variant Image Upload from Device
  const handleVariantFileUpload = async (file, vIdx, target) => {
    if (!file) return;
    try {
      if (target === 'add') setVariantUploadLoadingAdd(vIdx);
      if (target === 'edit') setVariantUploadLoadingEdit(vIdx);

      const res = await uploadProductImage(file);
      const uploadedUrl = res.image_url || (res.images && res.images[0]) || '';

      if (uploadedUrl) {
        if (target === 'add') {
          setProductForm((prev) => {
            const updated = [...(prev.variants || [])];
            if (updated[vIdx]) {
              updated[vIdx] = { ...updated[vIdx], image_url: uploadedUrl };
            }
            return { ...prev, variants: updated };
          });
        } else if (target === 'edit') {
          setEditingProduct((prev) => {
            const updated = [...(prev.variants || [])];
            if (updated[vIdx]) {
              updated[vIdx] = { ...updated[vIdx], image_url: uploadedUrl };
            }
            return { ...prev, variants: updated };
          });
        }
      }
    } catch (err) {
      alert(lang === 'ar' ? `فشل رفع صورة المقاس: ${err.message}` : `Failed to upload variant image: ${err.message}`);
    } finally {
      if (target === 'add') setVariantUploadLoadingAdd(null);
      if (target === 'edit') setVariantUploadLoadingEdit(null);
    }
  };

  // Gallery image helpers
  const handleSetPrimaryImage = (imgUrl, target) => {
    if (target === 'add') {
      setProductForm((prev) => {
        const remaining = (prev.images || []).filter((u) => u !== imgUrl);
        return {
          ...prev,
          image_url: imgUrl,
          images: [imgUrl, ...remaining]
        };
      });
    } else if (target === 'edit') {
      setEditingProduct((prev) => {
        const remaining = (prev.images || []).filter((u) => u !== imgUrl);
        return {
          ...prev,
          image_url: imgUrl,
          images: [imgUrl, ...remaining]
        };
      });
    }
  };

  const handleRemoveImage = (imgUrl, target) => {
    if (target === 'add') {
      setProductForm((prev) => {
        const updated = (prev.images || []).filter((u) => u !== imgUrl);
        return {
          ...prev,
          images: updated,
          image_url: updated[0] || ''
        };
      });
    } else if (target === 'edit') {
      setEditingProduct((prev) => {
        const updated = (prev.images || []).filter((u) => u !== imgUrl);
        return {
          ...prev,
          images: updated,
          image_url: updated[0] || ''
        };
      });
    }
  };

  const handleAddImageUrl = (url, target) => {
    if (!url || !url.trim()) return;
    const cleanUrl = url.trim();
    if (target === 'add') {
      setProductForm((prev) => {
        const current = prev.images || (prev.image_url ? [prev.image_url] : []);
        if (current.includes(cleanUrl)) return prev;
        const updated = [...current, cleanUrl];
        return { ...prev, images: updated, image_url: updated[0] || '' };
      });
      setNewImageUrlAdd('');
    } else if (target === 'edit') {
      setEditingProduct((prev) => {
        const current = prev.images || (prev.image_url ? [prev.image_url] : []);
        if (current.includes(cleanUrl)) return prev;
        const updated = [...current, cleanUrl];
        return { ...prev, images: updated, image_url: updated[0] || '' };
      });
      setNewImageUrlEdit('');
    }
  };

  // Handle Edit Product
  const handleEditProductSubmit = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      const catId = typeof editingProduct.category === 'object'
        ? (editingProduct.category?.id || editingProduct.category_id)
        : (parseInt(editingProduct.category, 10) || editingProduct.category);

      const imagesList = editingProduct.images && editingProduct.images.length > 0
        ? editingProduct.images
        : (editingProduct.image_url ? [editingProduct.image_url] : []);

      const hasVars = Boolean(editingProduct.has_variants && editingProduct.variants && editingProduct.variants.length > 0);
      const cleanedVariants = hasVars
        ? editingProduct.variants.filter((v) => v.name && v.name.trim()).map((v, i) => ({
            id: v.id || i + 1,
            name: v.name.trim(),
            name_ar: v.name_ar ? v.name_ar.trim() : v.name.trim(),
            price: v.price !== '' && v.price != null ? parseFloat(v.price) : parseFloat(editingProduct.price),
            in_stock: v.in_stock !== false,
            image_url: v.image_url ? v.image_url.trim() : ''
          }))
        : [];

      await updateProduct(editingProduct.id, {
        name_ar: editingProduct.name_ar,
        name_en: editingProduct.name_en,
        category: catId,
        price: parseFloat(editingProduct.price),
        stock_quantity: parseInt(editingProduct.stock_quantity, 10),
        image_url: imagesList[0] || '',
        images: imagesList,
        has_variants: cleanedVariants.length > 0,
        variants: cleanedVariants,
        description_ar: editingProduct.description_ar || '',
        description_en: editingProduct.description_en || ''
      });
      setEditingProduct(null);
      setNewImageUrlEdit('');
      loadData();
    } catch (err) {
      let msg = err.message || '';
      try {
        const parsed = JSON.parse(err.message);
        if (typeof parsed === 'object') {
          msg = Object.entries(parsed)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('\n');
        }
      } catch (_) {}
      alert(lang === 'ar' ? `فشل تعديل المنتج:\n${msg}` : `Failed to update product:\n${msg}`);
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async (id) => {
    if (!window.confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذه القطعة؟' : 'Are you sure you want to delete this part?')) return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      loadData();
    } catch (err) {
      alert(lang === 'ar' ? 'تعذر الحذف' : 'Failed to delete');
    }
  };

  // Handle Toggle Product in Hero Slider
  const handleToggleProductHero = async (product) => {
    try {
      const newStatus = !product.is_featured;
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, is_featured: newStatus } : p))
      );
      await updateProduct(product.id, { is_featured: newStatus });
      await loadData();
    } catch (err) {
      alert(lang === 'ar' ? `فشل تحديث لافتة العرض: ${err.message}` : `Failed to update hero banner: ${err.message}`);
      await loadData();
    }
  };

  // Handle Create Category
  const handleCreateCategorySubmit = async (e) => {
    e.preventDefault();
    if (!categoryForm.name_ar.trim() || !categoryForm.name_en.trim()) {
      alert(lang === 'ar' ? 'يرجى إدخال اسم التصنيف بالعربية والإنجليزية' : 'Please enter category name in Arabic and English');
      return;
    }
    try {
      const generatedSlug = categoryForm.slug?.trim() || categoryForm.name_en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const payload = {
        name_ar: categoryForm.name_ar.trim(),
        name_en: categoryForm.name_en.trim(),
        slug: generatedSlug || `cat-${Date.now()}`,
        icon_name: categoryForm.icon_name || 'Tool',
        description_ar: categoryForm.description_ar.trim(),
        description_en: categoryForm.description_en.trim()
      };
      await createCategory(payload);
      setIsAddCategoryOpen(false);
      setCategoryForm({
        name_ar: '',
        name_en: '',
        slug: '',
        icon_name: 'Tool',
        description_ar: '',
        description_en: '',
        slugModified: false
      });
      await loadData();
    } catch (err) {
      alert(lang === 'ar' ? `فشل إضافة التصنيف: ${err.message}` : `Failed to create category: ${err.message}`);
    }
  };

  // Handle Edit Category
  const handleEditCategorySubmit = async (e) => {
    e.preventDefault();
    if (!editingCategory) return;
    if (!editingCategory.name_ar.trim() || !editingCategory.name_en.trim()) {
      alert(lang === 'ar' ? 'يرجى إدخال اسم التصنيف بالعربية والإنجليزية' : 'Please enter category name in Arabic and English');
      return;
    }
    try {
      const generatedSlug = editingCategory.slug?.trim() || editingCategory.name_en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      await updateCategory(editingCategory.id, {
        name_ar: editingCategory.name_ar.trim(),
        name_en: editingCategory.name_en.trim(),
        slug: generatedSlug,
        icon_name: editingCategory.icon_name || 'Tool',
        description_ar: editingCategory.description_ar || '',
        description_en: editingCategory.description_en || ''
      });
      setEditingCategory(null);
      await loadData();
    } catch (err) {
      alert(lang === 'ar' ? `فشل تعديل التصنيف: ${err.message}` : `Failed to update category: ${err.message}`);
    }
  };

  // Handle Delete Category
  const handleDeleteCategory = async (cat) => {
    const hasProducts = (cat.products_count || 0) > 0;
    const confirmMsg = hasProducts
      ? (lang === 'ar'
          ? `⚠️ تنبيه هام:\nالتصنيف "${cat.name_ar}" يحتوي على (${cat.products_count}) من المنتجات المعروضة في المتجر!\nحذف هذا التصنيف سيؤدي إلى حذف كافة المنتجات التابعة له أيضاً.\n\nهل أنت متأكد من رغبتك في حذف هذا التصنيف؟`
          : `⚠️ Warning:\nCategory "${cat.name_en}" contains (${cat.products_count}) products!\nDeleting this category will cascade-delete its associated products.\n\nAre you sure you want to proceed?`)
      : (lang === 'ar'
          ? `هل أنت متأكد من حذف التصنيف "${cat.name_ar}"؟`
          : `Are you sure you want to delete category "${cat.name_en}"?`);

    if (!window.confirm(confirmMsg)) return;

    try {
      await deleteCategory(cat.id);
      await loadData();
    } catch (err) {
      alert(lang === 'ar' ? `فشل حذف التصنيف: ${err.message}` : `Failed to delete category: ${err.message}`);
    }
  };

  // Handle Create Brand
  const handleCreateBrandSubmit = async (e) => {
    e.preventDefault();
    if (!brandForm.name.trim()) {
      alert(lang === 'ar' ? 'يرجى كتابة اسم الشركة' : 'Please enter brand name');
      return;
    }
    try {
      const generatedSlug = brandForm.slug?.trim() || brandForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const payload = {
        name: brandForm.name.trim(),
        slug: generatedSlug || `brand-${Date.now()}`,
        description: brandForm.description.trim(),
        logo_url: brandForm.logo_url.trim()
      };
      await createBrand(payload);
      setIsAddBrandOpen(false);
      setBrandForm({
        name: '',
        slug: '',
        description: '',
        logo_url: '',
        slugModified: false
      });
      await loadData();
    } catch (err) {
      alert(lang === 'ar' ? `فشل إضافة الشركة: ${err.message}` : `Failed to create brand: ${err.message}`);
    }
  };

  // Handle Edit Brand
  const handleEditBrandSubmit = async (e) => {
    e.preventDefault();
    if (!editingBrand || !editingBrand.name.trim()) {
      alert(lang === 'ar' ? 'يرجى كتابة اسم الشركة' : 'Please enter brand name');
      return;
    }
    try {
      const generatedSlug = editingBrand.slug?.trim() || editingBrand.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      await updateBrand(editingBrand.id, {
        name: editingBrand.name.trim(),
        slug: generatedSlug,
        description: editingBrand.description || '',
        logo_url: editingBrand.logo_url || ''
      });
      setEditingBrand(null);
      await loadData();
    } catch (err) {
      alert(lang === 'ar' ? `فشل تعديل الشركة: ${err.message}` : `Failed to update brand: ${err.message}`);
    }
  };

  // Handle Delete Brand
  const handleDeleteBrand = async (brand) => {
    const hasPrinters = (brand.printers_count || 0) > 0;
    const confirmMsg = hasPrinters
      ? (lang === 'ar'
          ? `⚠️ تنبيه هام:\nالشركة "${brand.name}" مرتبطة بـ (${brand.printers_count}) من موديلات الطابعات!\nحذف هذه الشركة سيؤدي إلى حذف الموديلات التابعة لها أيضاً.\n\nهل أنت متأكد من الحذف؟`
          : `⚠️ Warning:\nBrand "${brand.name}" has (${brand.printers_count}) associated printer models!\nDeleting will cascade-delete those models.\n\nAre you sure you want to proceed?`)
      : (lang === 'ar'
          ? `هل أنت متأكد من حذف الشركة "${brand.name}"؟`
          : `Are you sure you want to delete brand "${brand.name}"?`);

    if (!window.confirm(confirmMsg)) return;

    try {
      await deleteBrand(brand.id);
      await loadData();
    } catch (err) {
      alert(lang === 'ar' ? `فشل حذف الشركة: ${err.message}` : `Failed to delete brand: ${err.message}`);
    }
  };

  // Handle Create Printer
  const handleCreatePrinterSubmit = async (e) => {
    e.preventDefault();
    if (!printerForm.name.trim()) {
      alert(lang === 'ar' ? 'يرجى كتابة اسم موديل الطابعة' : 'Please enter printer model name');
      return;
    }
    const brandId = printerForm.brand ? parseInt(printerForm.brand, 10) : (brands[0]?.id || null);
    if (!brandId) {
      alert(lang === 'ar' ? 'يرجى تحديد الشركة المصنعة' : 'Please select manufacturer brand');
      return;
    }
    try {
      const selectedBrandObj = brands.find((b) => b.id === brandId);
      const brandPrefix = selectedBrandObj ? selectedBrandObj.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '';
      const baseSlug = printerForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const generatedSlug = printerForm.slug?.trim() || (brandPrefix ? `${brandPrefix}-${baseSlug}` : baseSlug);

      const payload = {
        name: printerForm.name.trim(),
        slug: generatedSlug || `printer-${Date.now()}`,
        brand: brandId,
        technology: printerForm.technology || 'FDM',
        image_url: printerForm.image_url.trim()
      };
      await createPrinter(payload);
      setIsAddPrinterOpen(false);
      setPrinterForm({
        name: '',
        slug: '',
        brand: '',
        technology: 'FDM',
        image_url: '',
        slugModified: false
      });
      await loadData();
    } catch (err) {
      alert(lang === 'ar' ? `فشل إضافة موديل الطابعة: ${err.message}` : `Failed to create printer model: ${err.message}`);
    }
  };

  // Handle Edit Printer
  const handleEditPrinterSubmit = async (e) => {
    e.preventDefault();
    if (!editingPrinter || !editingPrinter.name.trim()) {
      alert(lang === 'ar' ? 'يرجى كتابة اسم موديل الطابعة' : 'Please enter printer model name');
      return;
    }
    try {
      const brandId = editingPrinter.brand ? parseInt(editingPrinter.brand, 10) : editingPrinter.brand;
      const selectedBrandObj = brands.find((b) => b.id === brandId);
      const brandPrefix = selectedBrandObj ? selectedBrandObj.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '';
      const baseSlug = editingPrinter.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const generatedSlug = editingPrinter.slug?.trim() || (brandPrefix ? `${brandPrefix}-${baseSlug}` : baseSlug);

      await updatePrinter(editingPrinter.id, {
        name: editingPrinter.name.trim(),
        slug: generatedSlug,
        brand: brandId,
        technology: editingPrinter.technology || 'FDM',
        image_url: editingPrinter.image_url || ''
      });
      setEditingPrinter(null);
      await loadData();
    } catch (err) {
      alert(lang === 'ar' ? `فشل تعديل موديل الطابعة: ${err.message}` : `Failed to update printer model: ${err.message}`);
    }
  };

  // Handle Delete Printer
  const handleDeletePrinter = async (printer) => {
    const hasParts = (printer.compatible_parts_count || 0) > 0;
    const confirmMsg = hasParts
      ? (lang === 'ar'
          ? `⚠️ تنبيه:\nموديل الطابعة "${printer.name}" مرتبط بـ (${printer.compatible_parts_count}) من قطع الغيار!\nهل أنت متأكد من رغبتك في حذف هذا الموديل؟`
          : `⚠️ Warning:\nPrinter "${printer.name}" is linked to (${printer.compatible_parts_count}) spare parts!\nAre you sure you want to delete this printer model?`)
      : (lang === 'ar'
          ? `هل أنت متأكد من حذف موديل الطابعة "${printer.name}"؟`
          : `Are you sure you want to delete printer model "${printer.name}"?`);

    if (!window.confirm(confirmMsg)) return;

    try {
      await deletePrinter(printer.id);
      await loadData();
    } catch (err) {
      alert(lang === 'ar' ? `فشل حذف موديل الطابعة: ${err.message}` : `Failed to delete printer model: ${err.message}`);
    }
  };

  const filteredCategories = categories.filter(
    (c) =>
      c.name_ar?.includes(categorySearch) ||
      c.name_en?.toLowerCase().includes(categorySearch.toLowerCase()) ||
      c.slug?.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const filteredBrands = brands.filter(
    (b) =>
      b.name?.toLowerCase().includes(brandSearch.toLowerCase()) ||
      b.slug?.toLowerCase().includes(brandSearch.toLowerCase()) ||
      b.description?.toLowerCase().includes(brandSearch.toLowerCase())
  );

  const filteredPrinters = printers.filter((p) => {
    const matchesBrand = printerBrandFilter ? String(p.brand) === String(printerBrandFilter) : true;
    const matchesSearch =
      p.name?.toLowerCase().includes(printerSearch.toLowerCase()) ||
      p.brand_name?.toLowerCase().includes(printerSearch.toLowerCase()) ||
      p.slug?.toLowerCase().includes(printerSearch.toLowerCase());
    return matchesBrand && matchesSearch;
  });

  const filteredProducts = products.filter(
    (p) =>
      p.name_en?.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.name_ar?.includes(productSearch) ||
      p.sku?.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredOrders = orders.filter(
    (o) =>
      o.customer_name?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.order_number?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.city?.toLowerCase().includes(orderSearch.toLowerCase())
  );

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      !employeeSearch ||
      emp.name?.toLowerCase().includes(employeeSearch.toLowerCase()) ||
      emp.email?.toLowerCase().includes(employeeSearch.toLowerCase()) ||
      emp.phone?.includes(employeeSearch);
    const matchesRole = employeeRoleFilter === 'all' || emp.role_code === employeeRoleFilter;
    const matchesActive =
      employeeActiveFilter === 'all' ||
      (employeeActiveFilter === 'active' ? emp.is_active : !emp.is_active);
    const matchesSuper =
      employeeSuperFilter === 'all' ||
      (employeeSuperFilter === 'yes' ? emp.is_superuser : !emp.is_superuser);
    return matchesSearch && matchesRole && matchesActive && matchesSuper;
  });

  const filteredAccounts = accounts.filter((acc) => {
    const matchesSearch =
      !accountSearch ||
      acc.name?.toLowerCase().includes(accountSearch.toLowerCase()) ||
      acc.email?.toLowerCase().includes(accountSearch.toLowerCase()) ||
      acc.phone?.includes(accountSearch);
    const matchesStaff =
      accountStaffFilter === 'all' ||
      (accountStaffFilter === 'yes' ? acc.is_staff : !acc.is_staff);
    const matchesActive =
      accountActiveFilter === 'all' ||
      (accountActiveFilter === 'active' ? acc.is_active : !acc.is_active);
    const matchesRole = accountRoleFilter === 'all' || acc.role_code === accountRoleFilter;
    return matchesSearch && matchesStaff && matchesActive && matchesRole;
  });

  const filteredRoles = roles.filter((r) => {
    return (
      !roleSearch ||
      r.name?.toLowerCase().includes(roleSearch.toLowerCase()) ||
      r.code?.toLowerCase().includes(roleSearch.toLowerCase()) ||
      r.permissions_summary?.toLowerCase().includes(roleSearch.toLowerCase())
    );
  });

  return (
    <div className="admin-wrapper animate-fade">
      {/* Top Admin Header Bar */}
      <div className="admin-topbar">
        <div className="container admin-topbar-content">
          <div className="admin-title-group">
            <div className="admin-badge-icon glow-orange">
              <LayoutDashboard size={22} className="text-orange" />
            </div>
            <div>
              <h2 className="admin-main-heading">
                {lang === 'ar' ? 'لوحة تحكم إدارة المتجر' : 'Store Admin Dashboard'}
              </h2>
              <span className="admin-sub-badge">
                <Database size={12} /> Django REST Framework Engine
              </span>
            </div>
          </div>

          <button className="btn btn-secondary back-to-store-btn" onClick={onBackToStore}>
            {lang === 'ar' ? '← العودة لواجهة المتجر' : '← Back to Storefront'}
          </button>
        </div>
      </div>

      <div className="container admin-main-layout">
        {/* Sidebar Tabs */}
        <aside className="admin-sidebar glass-panel">
          <button
            className={`admin-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <LayoutDashboard size={19} />
            <span>{lang === 'ar' ? 'الداشبورد والإحصائيات' : 'Overview & Analytics'}</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ShoppingBag size={19} className="text-orange" />
            <span>{lang === 'ar' ? 'إدارة الطلبات والشحن' : 'Orders & Shipments'}</span>
            <span className="admin-count-pill" style={{ background: '#ff6b00', color: '#fff', fontWeight: 800 }}>
              {orders.length}
            </span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <Package size={19} />
            <span>{lang === 'ar' ? 'إدارة المنتجات وقطع الغيار' : 'Parts & Products'}</span>
            <span className="admin-count-pill">{products.length}</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'hero_slider' ? 'active' : ''}`}
            onClick={() => setActiveTab('hero_slider')}
          >
            <Sparkles size={19} className="text-orange" />
            <span>{lang === 'ar' ? 'لافتة العرض (Hero Banner)' : 'Hero Banner Showcase'}</span>
            <span className="admin-count-pill" style={{ background: '#00ae42', color: '#fff', fontWeight: 800 }}>
              {banners.length}
            </span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'deals' ? 'active' : ''}`}
            onClick={() => setActiveTab('deals')}
          >
            <Tag size={19} className="text-orange" />
            <span>{lang === 'ar' ? 'قسم العروض والتخفيضات' : 'Deals & Offers'}</span>
            <span className="admin-count-pill" style={{ background: '#ff6b00', color: '#fff', fontWeight: 800 }}>
              {products.filter((p) => p.is_deal).length}
            </span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            <Layers size={19} />
            <span>{lang === 'ar' ? 'تصنيفات قطع الغيار' : 'Spare Parts Categories'}</span>
            <span className="admin-count-pill">{categories.length}</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'brands' ? 'active' : ''}`}
            onClick={() => setActiveTab('brands')}
          >
            <Building2 size={19} />
            <span>{lang === 'ar' ? 'الشركات المصنعة' : 'Brands & Makers'}</span>
            <span className="admin-count-pill">{brands.length}</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'printers' ? 'active' : ''}`}
            onClick={() => setActiveTab('printers')}
          >
            <Printer size={19} />
            <span>{lang === 'ar' ? 'موديلات الطابعات' : 'Printer Models'}</span>
            <span className="admin-count-pill">{printers.length}</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'customers' ? 'active' : ''}`}
            onClick={() => setActiveTab('customers')}
          >
            <Users size={19} />
            <span>{lang === 'ar' ? 'العملاء وقاعدة البيانات' : 'Customers'}</span>
            <span className="admin-count-pill">{customers.length}</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'employees' ? 'active' : ''}`}
            onClick={() => setActiveTab('employees')}
          >
            <UserCheck size={19} />
            <span>{lang === 'ar' ? 'الموظفين' : 'Employees'}</span>
            <span className="admin-count-pill" style={{ background: '#ec4899', color: '#fff', fontWeight: 800 }}>
              {employees.length}
            </span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'accounts' ? 'active' : ''}`}
            onClick={() => setActiveTab('accounts')}
          >
            <Users size={19} />
            <span>{lang === 'ar' ? 'الحسابات والزبائن' : 'Accounts & Customers'}</span>
            <span className="admin-count-pill" style={{ background: '#3b82f6', color: '#fff', fontWeight: 800 }}>
              {accounts.length}
            </span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'roles' ? 'active' : ''}`}
            onClick={() => setActiveTab('roles')}
          >
            <ShieldCheck size={19} />
            <span>{lang === 'ar' ? 'الأدوار والصلاحيات' : 'Roles & Permissions'}</span>
            <span className="admin-count-pill" style={{ background: '#8b5cf6', color: '#fff', fontWeight: 800 }}>
              {roles.length}
            </span>
          </button>
        </aside>

        {/* Content Area */}
        <main className="admin-content-area">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="overview-tab-view animate-fade">
              {/* KPI Stat Cards */}
              <div className="kpi-grid">
                <div
                  className="kpi-card glass-panel"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setActiveTab('orders')}
                  title={lang === 'ar' ? 'اضغط لعرض المبيعات والطلبات' : 'Click to view orders'}
                >
                  <div className="kpi-header">
                    <span className="kpi-title">{lang === 'ar' ? 'إجمالي المبيعات' : 'Total Revenue'}</span>
                    <div className="kpi-icon-box bg-orange-soft">
                      <DollarSign size={20} className="text-orange" />
                    </div>
                  </div>
                  <div className="kpi-value">{Number(stats?.kpis?.total_revenue || 0).toLocaleString()} د.ع</div>
                  <div className="kpi-trend text-green">
                    <ArrowUpRight size={14} /> {lang === 'ar' ? 'مبيعات مؤكدة' : 'Confirmed Sales'}
                  </div>
                </div>

                <div
                  className="kpi-card glass-panel"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setActiveTab('orders')}
                  title={lang === 'ar' ? 'اضغط لعرض الطلبات' : 'Click to view orders'}
                >
                  <div className="kpi-header">
                    <span className="kpi-title">{lang === 'ar' ? 'عدد الطلبات' : 'Total Orders'}</span>
                    <div className="kpi-icon-box bg-orange-soft">
                      <ShoppingBag size={20} className="text-orange" />
                    </div>
                  </div>
                  <div className="kpi-value">{stats?.kpis?.total_orders ?? orders.length}</div>
                  <div className="kpi-trend text-blue">
                    {lang === 'ar' ? 'عرض كافة الطلبات ↗' : 'View all orders ↗'}
                  </div>
                </div>

                <div className="kpi-card glass-panel">
                  <div className="kpi-header">
                    <span className="kpi-title">{lang === 'ar' ? 'قطع الغيار المسجلة' : 'Catalog Products'}</span>
                    <div className="kpi-icon-box bg-orange-soft">
                      <Package size={20} className="text-orange" />
                    </div>
                  </div>
                  <div className="kpi-value">{products.length}</div>
                  <div className="kpi-trend text-muted">
                    {categories.length} {lang === 'ar' ? 'تصنيف مختلف' : 'Categories'}
                  </div>
                </div>

                <div className="kpi-card glass-panel">
                  <div className="kpi-header">
                    <span className="kpi-title">{lang === 'ar' ? 'تنبيهات المخزون' : 'Low Stock Alerts'}</span>
                    <div className="kpi-icon-box bg-red-soft">
                      <AlertTriangle size={20} className="text-red" />
                    </div>
                  </div>
                  <div className="kpi-value text-red">{stats?.kpis?.low_stock_count || 0}</div>
                  <div className="kpi-trend text-red">
                    {lang === 'ar' ? 'قطع بحاجة لتوريد عاجل' : 'Needs restock (< 15)'}
                  </div>
                </div>
              </div>

              {/* Visual Breakdown Cards */}
              <div className="charts-split-grid">
                {/* Orders Distribution Chart */}
                <div className="chart-card glass-panel">
                  <h4 className="chart-title">
                    {lang === 'ar' ? 'توزيع الطلبات حسب المرحلة' : 'Orders by Fulfillment Status'}
                  </h4>
                  <div className="status-bars-list">
                    {stats?.status_distribution &&
                      Object.entries(stats.status_distribution).map(([stKey, stCount]) => {
                        const total = stats.kpis.total_orders || 1;
                        const pct = Math.round((stCount / total) * 100);
                        return (
                          <div key={stKey} className="status-bar-row">
                            <div className="status-bar-labels">
                              <span className="status-name">{stKey}</span>
                              <span className="status-count">{stCount} ({pct}%)</span>
                            </div>
                            <div className="status-track">
                              <div
                                className={`status-fill fill-${stKey.toLowerCase()}`}
                                style={{ width: `${Math.max(pct, stCount > 0 ? 8 : 0)}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Categories Breakdown */}
                <div className="chart-card glass-panel">
                  <h4 className="chart-title">
                    {lang === 'ar' ? 'توزيع القطع حسب الأقسام' : 'Parts by Category'}
                  </h4>
                  <div className="category-bars-list">
                    {stats?.category_distribution?.map((c) => {
                      const totalProds = products.length || 1;
                      const pct = Math.round((c.count / totalProds) * 100);
                      return (
                        <div key={c.slug} className="status-bar-row">
                          <div className="status-bar-labels">
                            <span className="status-name">{lang === 'ar' ? c.name_ar : c.name_en}</span>
                            <span className="status-count">{c.count} قطع</span>
                          </div>
                          <div className="status-track">
                            <div
                              className="status-fill fill-orange"
                              style={{ width: `${Math.max(pct, c.count > 0 ? 10 : 0)}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Critical Stock Alert Table */}
              {stats?.low_stock_alerts && stats.low_stock_alerts.length > 0 && (
                <div className="alert-section glass-panel">
                  <div className="alert-section-header">
                    <AlertTriangle size={18} className="text-red" />
                    <h4>{lang === 'ar' ? 'قطع ذات مخزون منخفض بحاجة للتوريد' : 'Critical Stock Depletion Alert'}</h4>
                  </div>
                  <div className="table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>SKU</th>
                          <th>{lang === 'ar' ? 'اسم القطعة' : 'Part Name'}</th>
                          <th>{lang === 'ar' ? 'المخزون المتبقي' : 'Available Stock'}</th>
                          <th>{lang === 'ar' ? 'السعر' : 'Price'}</th>
                          <th>{lang === 'ar' ? 'إجراء' : 'Action'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.low_stock_alerts.map((item) => (
                          <tr key={item.id}>
                            <td><code>{item.sku}</code></td>
                            <td><strong>{lang === 'ar' ? item.name_ar : item.name_en}</strong></td>
                            <td>
                              <span className="stock-alert-badge">{item.stock} قطع متبقية</span>
                            </td>
                            <td>{Number(item.price).toLocaleString()} د.ع</td>
                            <td>
                              <button
                                className="btn-sm btn-outline-orange"
                                onClick={() => {
                                  const prod = products.find((p) => p.id === item.id);
                                  if (prod) setEditingProduct(prod);
                                }}
                              >
                                {lang === 'ar' ? 'تعديل المخزون' : 'Restock'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PRODUCTS MANAGEMENT */}
          {activeTab === 'products' && (
            <div className="products-tab-view animate-fade">
              <div className="table-actions-header">
                <div className="search-box-admin">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder={lang === 'ar' ? 'بحث بالاسم أو SKU...' : 'Search parts or SKU...'}
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                  />
                </div>

                <button
                  className="btn btn-primary add-part-btn"
                  onClick={() => setIsAddProductOpen(true)}
                >
                  <Plus size={18} />
                  <span>{lang === 'ar' ? 'إضافة قطعة جديدة' : 'Add New Spare Part'}</span>
                </button>
              </div>

              <div className="glass-panel table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>{lang === 'ar' ? 'الصورة' : 'Image'}</th>
                      <th>SKU</th>
                      <th>{lang === 'ar' ? 'الاسم' : 'Name'}</th>
                      <th>{lang === 'ar' ? 'القسم' : 'Category'}</th>
                      <th>{lang === 'ar' ? 'السعر' : 'Price'}</th>
                      <th>{lang === 'ar' ? 'العروض' : 'Deal'}</th>
                      <th>{lang === 'ar' ? 'المخزون' : 'Stock'}</th>
                      <th>{lang === 'ar' ? 'إجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <img src={p.image_url} alt="" className="table-thumb" />
                        </td>
                        <td><code>{p.sku}</code></td>
                        <td>
                          <strong>{lang === 'ar' ? p.name_ar : p.name_en}</strong>
                        </td>
                        <td>{lang === 'ar' ? p.category_name_ar : p.category_name_en}</td>
                        <td className="text-orange font-bold">{Number(p.price).toLocaleString()} د.ع</td>
                        <td>
                          {p.is_deal ? (
                            <span className="bambu-badge-sale" style={{ fontSize: '0.74rem', padding: '2px 8px' }}>
                              -%{p.deal_discount_percentage || 20}
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="btn-quick-deal-pill"
                              onClick={() => {
                                setDealTransferProductId(String(p.id));
                                const orig = parseFloat(p.original_price || p.price) || 0;
                                setDealTransferPrice((orig * 0.75).toFixed(2));
                                setDealTransferDiscount(25);
                                setActiveTab('deals');
                              }}
                              title={lang === 'ar' ? 'تحويل إلى قسم العروض' : 'Transfer to Deals'}
                            >
                              <Tag size={11} />
                              <span>{lang === 'ar' ? '+ نقل للعروض' : 'Make Deal'}</span>
                            </button>
                          )}
                        </td>
                        <td>
                          <span className={`stock-pill ${p.stock_quantity <= 15 ? 'low' : 'ok'}`}>
                            {p.stock_quantity}
                          </span>
                        </td>
                        <td>
                          <div className="table-btn-group">
                            <button
                              className="icon-action-btn edit"
                              onClick={() => {
                                const imgList = (p.images && p.images.length > 0) ? [...p.images] : (p.image_url ? [p.image_url] : []);
                                setEditingProduct({
                                  ...p,
                                  images: imgList,
                                  image_url: imgList[0] || p.image_url || '',
                                  has_variants: Boolean(p.has_variants || (p.variants && p.variants.length > 0)),
                                  variants: p.variants && Array.isArray(p.variants) ? [...p.variants] : [],
                                  description_ar: p.description_ar || '',
                                  description_en: p.description_en || ''
                                });
                              }}
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              className="icon-action-btn delete"
                              onClick={() => handleDeleteProduct(p.id)}
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="orders-tab-view animate-fade">
              <div className="table-actions-header">
                <div className="search-box-admin">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder={lang === 'ar' ? 'بحث برقم الطلب أو اسم العميل أو المدينة...' : 'Search by order #, customer or city...'}
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="glass-panel table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>{lang === 'ar' ? 'رقم الطلب' : 'Order #'}</th>
                      <th>{lang === 'ar' ? 'العميل' : 'Customer'}</th>
                      <th>{lang === 'ar' ? 'الهاتف' : 'Phone'}</th>
                      <th>{lang === 'ar' ? 'المدينة' : 'City'}</th>
                      <th>{lang === 'ar' ? 'الإجمالي' : 'Total'}</th>
                      <th>{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                      <th>{lang === 'ar' ? 'التفاصيل والإجراء' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((o) => (
                      <tr key={o.id}>
                        <td><code>#{o.order_number?.substring(0, 8)}</code></td>
                        <td><strong>{o.customer_name}</strong></td>
                        <td>{o.customer_phone}</td>
                        <td>{o.city}</td>
                        <td className="text-orange font-bold">{Number(o.total_amount).toLocaleString()} د.ع</td>
                        <td>
                          <select
                            className={`order-status-select select-${o.status?.toLowerCase()}`}
                            value={o.status}
                            onChange={(e) => handleStatusChange(o.id, e.target.value)}
                          >
                            <option value="PENDING">PENDING (قيد الانتظار)</option>
                            <option value="PROCESSING">PROCESSING (جاري التجهيز)</option>
                            <option value="SHIPPED">SHIPPED (تم الشحن)</option>
                            <option value="DELIVERED">DELIVERED (تم التسليم)</option>
                            <option value="CANCELLED">CANCELLED (ملغي)</option>
                          </select>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              type="button"
                              className="btn-sm btn-secondary"
                              onClick={() => setSelectedOrderDetails(o)}
                            >
                              {lang === 'ar' ? 'عرض الفاتورة' : 'View'}
                            </button>
                            {o.status === 'CANCELLED' && (
                              <button
                                type="button"
                                className="icon-action-btn delete"
                                onClick={() => handleDeleteOrder(o.id, o.order_number)}
                                title={lang === 'ar' ? 'حذف الفاتورة الملغية' : 'Delete Cancelled Order'}
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: CUSTOMERS */}
          {activeTab === 'customers' && (
            <div className="customers-tab-view animate-fade">
              <div className="glass-panel table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>{lang === 'ar' ? 'اسم العميل' : 'Customer Name'}</th>
                      <th>{lang === 'ar' ? 'الهاتف' : 'Phone'}</th>
                      <th>{lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}</th>
                      <th>{lang === 'ar' ? 'المدينة' : 'City'}</th>
                      <th>{lang === 'ar' ? 'عدد الطلبات' : 'Total Orders'}</th>
                      <th>{lang === 'ar' ? 'إجمالي المشتريات' : 'Total Spent'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c, i) => (
                      <tr key={i}>
                        <td><strong>{c.name}</strong></td>
                        <td>{c.phone}</td>
                        <td>{c.email || '—'}</td>
                        <td>{c.city}</td>
                        <td>
                          <span className="badge badge-orange">{c.orders_count} طلبات</span>
                        </td>
                        <td className="text-orange font-bold">{Number(c.total_spent || 0).toLocaleString()} د.ع</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: EMPLOYEES (الموظفين) */}
          {activeTab === 'employees' && (
            <div className="accounts-management-view animate-fade">
              {/* Breadcrumbs & Header */}
              <div className="admin-subpage-header">
                <div className="admin-crumb-trail">
                  <span className="crumb-home">Home</span>
                  <span className="crumb-slash">/</span>
                  <span className="crumb-app">Accounts</span>
                  <span className="crumb-slash">/</span>
                  <span className="crumb-current-page">{lang === 'ar' ? 'الموظفين' : 'Employees'}</span>
                </div>
                <div className="admin-subpage-title-row">
                  <h1 className="admin-page-main-title">{lang === 'ar' ? 'الموظفين' : 'Employees'}</h1>
                  <button
                    type="button"
                    className="admin-orange-add-btn"
                    onClick={() => setShowAddEmployeeModal(true)}
                  >
                    <Plus size={16} />
                    <span>{lang === 'ar' ? 'Add موظف' : 'Add Employee'}</span>
                  </button>
                </div>
              </div>

              {/* Filters Row */}
              <div className="admin-filters-bar">
                <div className="admin-filter-group">
                  <select
                    className="admin-select-filter"
                    value={employeeRoleFilter}
                    onChange={(e) => setEmployeeRoleFilter(e.target.value)}
                  >
                    <option value="all">role</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.code}>{r.name}</option>
                    ))}
                  </select>

                  <select
                    className="admin-select-filter"
                    value={employeeActiveFilter}
                    onChange={(e) => setEmployeeActiveFilter(e.target.value)}
                  >
                    <option value="all">is active</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>

                  <select
                    className="admin-select-filter"
                    value={employeeSuperFilter}
                    onChange={(e) => setEmployeeSuperFilter(e.target.value)}
                  >
                    <option value="all">superuser status</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>

                  <div className="admin-search-wrapper">
                    <input
                      type="text"
                      className="admin-search-field"
                      placeholder="Search"
                      value={employeeSearch}
                      onChange={(e) => setEmployeeSearch(e.target.value)}
                    />
                    <button type="button" className="admin-search-btn">Search</button>
                  </div>
                </div>
              </div>

              {/* Bulk Action Bar */}
              <div className="admin-action-bar">
                <select
                  className="admin-bulk-select"
                  value={employeeBulkAction}
                  onChange={(e) => setEmployeeBulkAction(e.target.value)}
                >
                  <option value="delete">{lang === 'ar' ? 'حذف الموظفين المحددين' : 'Delete selected employees'}</option>
                  <option value="">---------</option>
                </select>
                <button
                  type="button"
                  className="admin-go-btn"
                  onClick={handleExecuteEmployeeBulkAction}
                >
                  Go
                </button>
                <span className="admin-selected-count" dir="ltr">
                  {selectedEmployeeIds.length} of {filteredEmployees.length} selected
                </span>
              </div>

              {/* Table Card */}
              <div className="admin-accounts-table-card">
                <table className="admin-accounts-table">
                  <thead>
                    <tr>
                      <th style={{ width: 40 }}>
                        <input
                          type="checkbox"
                          className="admin-checkbox"
                          checked={filteredEmployees.length > 0 && filteredEmployees.every(emp => selectedEmployeeIds.includes(emp.id))}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedEmployeeIds(filteredEmployees.map(emp => emp.id));
                            } else {
                              setSelectedEmployeeIds([]);
                            }
                          }}
                        />
                      </th>
                      <th className="cyan-th">{lang === 'ar' ? 'الموظف' : 'Employee'}</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>{lang === 'ar' ? 'الدور' : 'Role'}</th>
                      <th>{lang === 'ar' ? 'الأكتيف' : 'Active'}</th>
                      <th style={{ textAlign: 'center', width: 60 }}>{lang === 'ar' ? 'حذف' : 'Delete'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map((emp) => (
                      <tr key={emp.id} className={selectedEmployeeIds.includes(emp.id) ? 'selected-row' : ''}>
                        <td>
                          <input
                            type="checkbox"
                            className="admin-checkbox"
                            checked={selectedEmployeeIds.includes(emp.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedEmployeeIds(prev => [...prev, emp.id]);
                              } else {
                                setSelectedEmployeeIds(prev => prev.filter(id => id !== emp.id));
                              }
                            }}
                          />
                        </td>
                        <td><span className="cyan-user-link">{emp.name}</span></td>
                        <td>{emp.email}</td>
                        <td dir="ltr" style={{ textAlign: 'start' }}>{emp.phone}</td>
                        <td>
                          <span className={`pill-role ${emp.role_code === 'OWNER' || emp.role_name === 'مالك' ? 'pill-owner' : 'pill-staff'}`}>
                            {emp.role_name}
                          </span>
                        </td>
                        <td>
                          <label className="admin-switch">
                            <input
                              type="checkbox"
                              checked={emp.is_active}
                              onChange={() => handleToggleActive(emp.id)}
                            />
                            <span className="admin-slider"></span>
                          </label>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className="admin-trash-btn"
                            onClick={() => handleDeleteEmployee(emp.id)}
                            title="حذف"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="admin-table-footer-count">
                {lang === 'ar' ? 'الموظفين' : 'Employees'} {filteredEmployees.length}
              </div>
            </div>
          )}

          {/* TAB: ACCOUNTS & CUSTOMERS (الحسابات والزبائن) */}
          {activeTab === 'accounts' && (
            <div className="accounts-management-view animate-fade">
              <div className="admin-subpage-header">
                <div className="admin-crumb-trail">
                  <span className="crumb-home">Home</span>
                  <span className="crumb-slash">/</span>
                  <span className="crumb-app">Accounts</span>
                  <span className="crumb-slash">/</span>
                  <span className="crumb-current-page">{lang === 'ar' ? 'الحسابات والزبائن' : 'Accounts & Customers'}</span>
                </div>
                <div className="admin-subpage-title-row">
                  <h1 className="admin-page-main-title">{lang === 'ar' ? 'الحسابات والزبائن' : 'Accounts & Customers'}</h1>
                  <button
                    type="button"
                    className="admin-orange-add-btn"
                    onClick={() => setShowAddAccountModal(true)}
                  >
                    <Plus size={16} />
                    <span>{lang === 'ar' ? 'Add حساب' : 'Add Account'}</span>
                  </button>
                </div>
              </div>

              {/* Date tabs */}
              <div className="admin-date-tabs">
                <button className="date-tab-btn active">&lsaquo; All dates</button>
                <button className="date-tab-btn">August 2026</button>
                <button className="date-tab-btn">September 2026</button>
              </div>

              {/* Filters Row */}
              <div className="admin-filters-bar">
                <div className="admin-filter-group">
                  <select
                    className="admin-select-filter"
                    value={accountStaffFilter}
                    onChange={(e) => setAccountStaffFilter(e.target.value)}
                  >
                    <option value="all">is staff member</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>

                  <select
                    className="admin-select-filter"
                    value={accountActiveFilter}
                    onChange={(e) => setAccountActiveFilter(e.target.value)}
                  >
                    <option value="all">is active</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>

                  <select
                    className="admin-select-filter"
                    value={accountRoleFilter}
                    onChange={(e) => setAccountRoleFilter(e.target.value)}
                  >
                    <option value="all">role</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.code}>{r.name}</option>
                    ))}
                  </select>

                  <div className="admin-search-wrapper">
                    <input
                      type="text"
                      className="admin-search-field"
                      placeholder="Search"
                      value={accountSearch}
                      onChange={(e) => setAccountSearch(e.target.value)}
                    />
                    <button type="button" className="admin-search-btn">Search</button>
                  </div>
                </div>
              </div>

              {/* Bulk Action Bar */}
              <div className="admin-action-bar">
                <select
                  className="admin-bulk-select"
                  value={accountBulkAction}
                  onChange={(e) => setAccountBulkAction(e.target.value)}
                >
                  <option value="delete">{lang === 'ar' ? 'حذف الحسابات المحددة' : 'Delete selected accounts'}</option>
                  <option value="">---------</option>
                </select>
                <button
                  type="button"
                  className="admin-go-btn"
                  onClick={handleExecuteAccountBulkAction}
                >
                  Go
                </button>
                <span className="admin-selected-count" dir="ltr">
                  {selectedAccountIds.length} of {filteredAccounts.length} selected
                </span>
              </div>

              {/* Table Card */}
              <div className="admin-accounts-table-card">
                <table className="admin-accounts-table">
                  <thead>
                    <tr>
                      <th style={{ width: 40 }}>
                        <input
                          type="checkbox"
                          className="admin-checkbox"
                          checked={filteredAccounts.length > 0 && filteredAccounts.every(acc => selectedAccountIds.includes(acc.id))}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAccountIds(filteredAccounts.map(acc => acc.id));
                            } else {
                              setSelectedAccountIds([]);
                            }
                          }}
                        />
                      </th>
                      <th className="cyan-th">{lang === 'ar' ? 'الاسم' : 'Name'}</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>{lang === 'ar' ? 'الدور' : 'Role'}</th>
                      <th>Is staff member</th>
                      <th>{lang === 'ar' ? 'الأكتيف' : 'Active'}</th>
                      <th style={{ textAlign: 'center', width: 60 }}>{lang === 'ar' ? 'حذف' : 'Delete'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAccounts.map((acc) => (
                      <tr key={acc.id} className={selectedAccountIds.includes(acc.id) ? 'selected-row' : ''}>
                        <td>
                          <input
                            type="checkbox"
                            className="admin-checkbox"
                            checked={selectedAccountIds.includes(acc.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedAccountIds(prev => [...prev, acc.id]);
                              } else {
                                setSelectedAccountIds(prev => prev.filter(id => id !== acc.id));
                              }
                            }}
                          />
                        </td>
                        <td><span className="cyan-user-link">{acc.name}</span></td>
                        <td>{acc.email}</td>
                        <td dir="ltr" style={{ textAlign: 'start' }}>{acc.phone}</td>
                        <td>
                          {acc.role_name && acc.role_name !== 'بلا دور' ? (
                            <span className={`pill-role ${acc.role_code === 'OWNER' || acc.role_name === 'مالك' ? 'pill-owner' : 'pill-staff'}`}>
                              {acc.role_name}
                            </span>
                          ) : (
                            <span className="pill-role-none">{lang === 'ar' ? 'بلا دور' : 'No role'}</span>
                          )}
                        </td>
                        <td>
                          {acc.is_staff ? (
                            <span className="circle-icon check-circle">
                              <Check size={13} strokeWidth={3} />
                            </span>
                          ) : (
                            <span className="circle-icon x-circle">
                              <X size={13} strokeWidth={3} />
                            </span>
                          )}
                        </td>
                        <td>
                          <label className="admin-switch">
                            <input
                              type="checkbox"
                              checked={acc.is_active}
                              onChange={() => handleToggleActive(acc.id)}
                            />
                            <span className="admin-slider"></span>
                          </label>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className="admin-trash-btn"
                            onClick={() => handleDeleteAccount(acc.id)}
                            title="حذف"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="admin-table-footer-count">
                {lang === 'ar' ? 'الحسابات والزبائن' : 'Accounts & Customers'} {filteredAccounts.length}
              </div>
            </div>
          )}

          {/* TAB: ROLES & PERMISSIONS (الأدوار والصلاحيات) */}
          {activeTab === 'roles' && (
            <div className="accounts-management-view animate-fade">
              <div className="admin-subpage-header">
                <div className="admin-crumb-trail">
                  <span className="crumb-home">Home</span>
                  <span className="crumb-slash">/</span>
                  <span className="crumb-app">Accounts</span>
                  <span className="crumb-slash">/</span>
                  <span className="crumb-current-page">{lang === 'ar' ? 'الأدوار والصلاحيات' : 'Roles & Permissions'}</span>
                </div>
                <div className="admin-subpage-title-row">
                  <h1 className="admin-page-main-title">{lang === 'ar' ? 'الأدوار والصلاحيات' : 'Roles & Permissions'}</h1>
                  <button
                    type="button"
                    className="admin-orange-add-btn"
                    onClick={() => setShowAddRoleModal(true)}
                  >
                    <Plus size={16} />
                    <span>{lang === 'ar' ? 'Add دور وصلاحيات' : 'Add Role & Permissions'}</span>
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="admin-filters-bar">
                <div className="admin-filter-group">
                  <div className="admin-search-wrapper">
                    <input
                      type="text"
                      className="admin-search-field"
                      placeholder="Search"
                      value={roleSearch}
                      onChange={(e) => setRoleSearch(e.target.value)}
                    />
                    <button type="button" className="admin-search-btn">Search</button>
                  </div>
                </div>
              </div>

              {/* Bulk Action Bar */}
              <div className="admin-action-bar">
                <select
                  className="admin-bulk-select"
                  value={roleBulkAction}
                  onChange={(e) => setRoleBulkAction(e.target.value)}
                >
                  <option value="delete">{lang === 'ar' ? 'حذف الأدوار المحددة' : 'Delete selected roles'}</option>
                  <option value="">---------</option>
                </select>
                <button
                  type="button"
                  className="admin-go-btn"
                  onClick={handleExecuteRoleBulkAction}
                >
                  Go
                </button>
                <span className="admin-selected-count" dir="ltr">
                  {selectedRoleIds.length} of {filteredRoles.length} selected
                </span>
              </div>

              {/* Table Card */}
              <div className="admin-accounts-table-card">
                <table className="admin-accounts-table">
                  <thead>
                    <tr>
                      <th style={{ width: 40 }}>
                        <input
                          type="checkbox"
                          className="admin-checkbox"
                          checked={filteredRoles.length > 0 && filteredRoles.every(r => selectedRoleIds.includes(r.id))}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRoleIds(filteredRoles.map(r => r.id));
                            } else {
                              setSelectedRoleIds([]);
                            }
                          }}
                        />
                      </th>
                      <th className="cyan-th">{lang === 'ar' ? 'اسم الدور' : 'Role Name'}</th>
                      <th className="cyan-th">{lang === 'ar' ? '⇅ الاسم البرمجي' : 'Code'}</th>
                      <th className="cyan-th">{lang === 'ar' ? '× الصلاحيات' : 'Permissions'}</th>
                      <th>{lang === 'ar' ? 'عدد الموظفين' : 'Employees Count'}</th>
                      <th>{lang === 'ar' ? 'أساسي' : 'System'}</th>
                      <th style={{ textAlign: 'center', width: 60 }}>{lang === 'ar' ? 'حذف' : 'Delete'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRoles.map((r) => (
                      <tr key={r.id} className={selectedRoleIds.includes(r.id) ? 'selected-row' : ''}>
                        <td>
                          <input
                            type="checkbox"
                            className="admin-checkbox"
                            checked={selectedRoleIds.includes(r.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedRoleIds(prev => [...prev, r.id]);
                              } else {
                                setSelectedRoleIds(prev => prev.filter(id => id !== r.id));
                              }
                            }}
                          />
                        </td>
                        <td>
                          <span className={`pill-role ${r.code === 'SUPER_ADMIN' || r.name === 'مدير عام' ? 'pill-super' : 'pill-staff'}`}>
                            {r.name}
                          </span>
                        </td>
                        <td><strong style={{ color: '#ffffff' }}>{r.code}</strong></td>
                        <td>
                          {r.permissions_summary === 'كل الصلاحيات' ? (
                            <strong className="cyan-bold-text">{lang === 'ar' ? 'كل الصلاحيات' : 'All Permissions'}</strong>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>{r.permissions_summary}</span>
                          )}
                        </td>
                        <td>{r.employee_count || 0}</td>
                        <td>
                          <span className="circle-icon check-circle">
                            <Check size={13} strokeWidth={3} />
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className="admin-trash-btn"
                            onClick={() => handleDeleteRole(r.id)}
                            title="حذف"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="admin-table-footer-count">
                {lang === 'ar' ? 'الأدوار والصلاحيات' : 'Roles & Permissions'} {filteredRoles.length}
              </div>
            </div>
          )}
          {/* TAB 5: CATEGORIES MANAGEMENT */}
          {activeTab === 'categories' && (
            <div className="categories-tab-view animate-fade">
              <div className="table-actions-header">
                <div className="search-box-admin">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder={lang === 'ar' ? 'بحث باسم التصنيف أو المعرّف...' : 'Search categories by name or slug...'}
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                  />
                </div>

                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setCategoryForm({
                      name_ar: '',
                      name_en: '',
                      slug: '',
                      icon_name: 'Tool',
                      description_ar: '',
                      description_en: '',
                      slugModified: false
                    });
                    setIsAddCategoryOpen(true);
                  }}
                >
                  <Plus size={16} />
                  <span>{lang === 'ar' ? 'إضافة تصنيف جديد' : 'Add New Category'}</span>
                </button>
              </div>

              <div className="glass-panel table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: '60px', textAlign: 'center' }}>{lang === 'ar' ? 'الأيقونة' : 'Icon'}</th>
                      <th>{lang === 'ar' ? 'الاسم بالعربية' : 'Arabic Name'}</th>
                      <th>{lang === 'ar' ? 'الاسم بالإنجليزية' : 'English Name'}</th>
                      <th>{lang === 'ar' ? 'المعرّف (Slug)' : 'Slug'}</th>
                      <th>{lang === 'ar' ? 'الوصف' : 'Description'}</th>
                      <th>{lang === 'ar' ? 'المنتجات التابعة' : 'Products'}</th>
                      <th>{lang === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCategories.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                          {lang === 'ar' ? 'لا توجد تصنيفات متطابقة' : 'No matching categories found'}
                        </td>
                      </tr>
                    ) : (
                      filteredCategories.map((cat) => {
                        const IconComp = getCategoryIconComponent(cat.icon_name);
                        return (
                          <tr key={cat.id}>
                            <td style={{ textAlign: 'center' }}>
                              <div className="cat-icon-badge">
                                <IconComp size={18} className="text-orange" />
                              </div>
                            </td>
                            <td><strong>{cat.name_ar}</strong></td>
                            <td><span className="text-muted">{cat.name_en}</span></td>
                            <td><code>{cat.slug}</code></td>
                            <td className="desc-cell-truncate" title={lang === 'ar' ? cat.description_ar : cat.description_en}>
                              {(lang === 'ar' ? cat.description_ar : cat.description_en) || '—'}
                            </td>
                            <td>
                              <span className="admin-count-pill" style={{ display: 'inline-flex' }}>
                                {cat.products_count || 0} {lang === 'ar' ? 'قطع' : 'parts'}
                              </span>
                            </td>
                            <td>
                              <div className="table-btn-group">
                                <button
                                  className="icon-action-btn edit"
                                  onClick={() =>
                                    setEditingCategory({
                                      ...cat,
                                      description_ar: cat.description_ar || '',
                                      description_en: cat.description_en || '',
                                      icon_name: cat.icon_name || 'Tool'
                                    })
                                  }
                                  title={lang === 'ar' ? 'تعديل التصنيف' : 'Edit Category'}
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  className="icon-action-btn delete"
                                  onClick={() => handleDeleteCategory(cat)}
                                  title={lang === 'ar' ? 'حذف التصنيف' : 'Delete Category'}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: BRANDS MANAGEMENT */}
          {activeTab === 'brands' && (
            <div className="brands-tab-view animate-fade">
              <div className="table-actions-header">
                <div className="search-box-admin">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder={lang === 'ar' ? 'بحث باسم الشركة أو المعرّف...' : 'Search brands by name or slug...'}
                    value={brandSearch}
                    onChange={(e) => setBrandSearch(e.target.value)}
                  />
                </div>

                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setBrandForm({
                      name: '',
                      slug: '',
                      description: '',
                      logo_url: '',
                      slugModified: false
                    });
                    setIsAddBrandOpen(true);
                  }}
                >
                  <Plus size={16} />
                  <span>{lang === 'ar' ? 'إضافة شركة مصنعة' : 'Add New Brand'}</span>
                </button>
              </div>

              <div className="glass-panel table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: '60px', textAlign: 'center' }}>{lang === 'ar' ? 'الشعار' : 'Logo'}</th>
                      <th>{lang === 'ar' ? 'اسم الشركة' : 'Brand Name'}</th>
                      <th>{lang === 'ar' ? 'المعرّف (Slug)' : 'Slug'}</th>
                      <th>{lang === 'ar' ? 'الوصف' : 'Description'}</th>
                      <th>{lang === 'ar' ? 'الموديلات التابعة' : 'Printers'}</th>
                      <th>{lang === 'ar' ? 'قطع الغيار' : 'Spare Parts'}</th>
                      <th>{lang === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBrands.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                          {lang === 'ar' ? 'لا توجد شركات متطابقة' : 'No matching brands found'}
                        </td>
                      </tr>
                    ) : (
                      filteredBrands.map((brand) => (
                        <tr key={brand.id}>
                          <td style={{ textAlign: 'center' }}>
                            <div className="cat-icon-badge" style={{ overflow: 'hidden' }}>
                              {brand.logo_url ? (
                                <img src={brand.logo_url} alt="" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                              ) : (
                                <Building2 size={18} className="text-orange" />
                              )}
                            </div>
                          </td>
                          <td><strong>{brand.name}</strong></td>
                          <td><code>{brand.slug}</code></td>
                          <td className="desc-cell-truncate" title={brand.description}>
                            {brand.description || '—'}
                          </td>
                          <td>
                            <span className="admin-count-pill" style={{ display: 'inline-flex' }}>
                              {brand.printers_count || 0} {lang === 'ar' ? 'طابعة' : 'models'}
                            </span>
                          </td>
                          <td>
                            <span className="badge badge-orange" style={{ fontSize: '0.78rem' }}>
                              {brand.parts_count || 0} {lang === 'ar' ? 'قطع' : 'parts'}
                            </span>
                          </td>
                          <td>
                            <div className="table-btn-group">
                              <button
                                className="icon-action-btn edit"
                                onClick={() =>
                                  setEditingBrand({
                                    ...brand,
                                    description: brand.description || '',
                                    logo_url: brand.logo_url || ''
                                  })
                                }
                                title={lang === 'ar' ? 'تعديل بيانات الشركة' : 'Edit Brand'}
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                className="icon-action-btn delete"
                                onClick={() => handleDeleteBrand(brand)}
                                title={lang === 'ar' ? 'حذف الشركة' : 'Delete Brand'}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: PRINTER MODELS MANAGEMENT */}
          {activeTab === 'printers' && (
            <div className="printers-tab-view animate-fade">
              <div className="table-actions-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '10px', flex: 1, minWidth: '280px' }}>
                  <div className="search-box-admin" style={{ flex: 1 }}>
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder={lang === 'ar' ? 'بحث باسم الموديل أو الشركة...' : 'Search model or brand...'}
                      value={printerSearch}
                      onChange={(e) => setPrinterSearch(e.target.value)}
                    />
                  </div>

                  {/* Filter by Brand Dropdown */}
                  <select
                    className="form-select"
                    style={{ width: 'auto', minWidth: '170px', padding: '8px 12px' }}
                    value={printerBrandFilter}
                    onChange={(e) => setPrinterBrandFilter(e.target.value)}
                  >
                    <option value="">{lang === 'ar' ? 'جميع الشركات' : 'All Brands'}</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setPrinterForm({
                      name: '',
                      slug: '',
                      brand: brands[0]?.id || '',
                      technology: 'FDM',
                      image_url: '',
                      slugModified: false
                    });
                    setIsAddPrinterOpen(true);
                  }}
                >
                  <Plus size={16} />
                  <span>{lang === 'ar' ? 'إضافة موديل طابعة' : 'Add Printer Model'}</span>
                </button>
              </div>

              <div className="glass-panel table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: '60px', textAlign: 'center' }}>{lang === 'ar' ? 'الصورة' : 'Img'}</th>
                      <th>{lang === 'ar' ? 'موديل الطابعة' : 'Model Name'}</th>
                      <th>{lang === 'ar' ? 'الشركة المصنعة' : 'Manufacturer Brand'}</th>
                      <th>{lang === 'ar' ? 'تقنية الطباعة' : 'Technology'}</th>
                      <th>{lang === 'ar' ? 'المعرّف (Slug)' : 'Slug'}</th>
                      <th>{lang === 'ar' ? 'قطع الغيار المتوافقة' : 'Compatible Parts'}</th>
                      <th>{lang === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPrinters.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                          {lang === 'ar' ? 'لا توجد موديلات متطابقة' : 'No matching printer models found'}
                        </td>
                      </tr>
                    ) : (
                      filteredPrinters.map((printer) => (
                        <tr key={printer.id}>
                          <td style={{ textAlign: 'center' }}>
                            <div className="cat-icon-badge" style={{ overflow: 'hidden' }}>
                              {printer.image_url ? (
                                <img src={printer.image_url} alt="" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                              ) : (
                                <Printer size={18} className="text-orange" />
                              )}
                            </div>
                          </td>
                          <td><strong>{printer.name}</strong></td>
                          <td>
                            <span className="badge badge-amber font-bold">
                              {printer.brand_name || brands.find((b) => b.id === printer.brand)?.name || '—'}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${printer.technology === 'SLA' ? 'badge-orange' : 'badge-green'}`}>
                              {printer.technology === 'SLA' ? 'SLA / Resin' : 'FDM (Filament)'}
                            </span>
                          </td>
                          <td><code>{printer.slug}</code></td>
                          <td>
                            <span className="admin-count-pill" style={{ display: 'inline-flex' }}>
                              {printer.compatible_parts_count || 0} {lang === 'ar' ? 'قطع' : 'parts'}
                            </span>
                          </td>
                          <td>
                            <div className="table-btn-group">
                              <button
                                className="icon-action-btn edit"
                                onClick={() =>
                                  setEditingPrinter({
                                    ...printer,
                                    image_url: printer.image_url || '',
                                    technology: printer.technology || 'FDM'
                                  })
                                }
                                title={lang === 'ar' ? 'تعديل موديل الطابعة' : 'Edit Printer Model'}
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                className="icon-action-btn delete"
                                onClick={() => handleDeletePrinter(printer)}
                                title={lang === 'ar' ? 'حذف موديل الطابعة' : 'Delete Printer Model'}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: DEDICATED HERO BANNER SHOWCASE MANAGER */}
          {activeTab === 'hero_slider' && (
            <div className="tab-view animate-fade">
              {/* Header */}
              <div className="tab-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <h2 className="admin-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.4rem' }}>
                    <Sparkles className="text-orange" size={24} />
                    <span>{lang === 'ar' ? 'إدارة صور لافتة العرض (Hero Banner)' : 'Hero Banner Showcase Manager'}</span>
                  </h2>
                  <p className="admin-section-subtitle" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                    {lang === 'ar'
                      ? 'تحكم بالصور المعروضة في شريط البانر العلوي بالواجهة الرئيسية للمتجر. يمكنك رفع صور جديدة وحذف أي صورة لتختفي فوراً من الواجهة.'
                      : 'Manage hero showcase banners on the homepage. Upload custom high-resolution banners or delete any slide instantly.'}
                  </p>
                </div>

                <div className="hero-banner-stats-pill">
                  <span>
                    {lang === 'ar'
                      ? `معروض حالياً: ${banners.length} لافتات بالواجهة`
                      : `Active in Banner: ${banners.length} slides`}
                  </span>
                </div>
              </div>

              {/* Recommended Dimensions Callout */}
              <div className="banner-specs-callout">
                <div className="banner-specs-header">
                  <Sparkles size={18} className="text-orange" />
                  <span>{lang === 'ar' ? 'المقاسات الموصى بها للصور بدقة فائقة:' : 'Recommended High-Resolution Dimensions:'}</span>
                </div>
                <div className="banner-specs-badges-row">
                  <div className="banner-spec-badge highlight-orange">
                    <span>{lang === 'ar' ? 'العرض:' : 'Width:'}</span>
                    <strong>2752 {lang === 'ar' ? 'بكسل (px)' : 'px'}</strong>
                  </div>
                  <div className="banner-spec-badge highlight-orange">
                    <span>{lang === 'ar' ? 'الارتفاع:' : 'Height:'}</span>
                    <strong>768 {lang === 'ar' ? 'بكسل (px)' : 'px'}</strong>
                  </div>
                  <div className="banner-spec-badge highlight-green">
                    <span>{lang === 'ar' ? 'نسبة الأبعاد (Aspect Ratio):' : 'Aspect Ratio:'}</span>
                    <strong>{lang === 'ar' ? 'تقريباً 3.58:1' : '~3.58:1'}</strong>
                  </div>
                </div>
                <p className="banner-specs-note">
                  {lang === 'ar'
                    ? '💡 نصيحة: الالتزام بهذه القياسات يضمن ملء لافتة العرض بالكامل بدون أي قص جانبي أو تشويه، وبأعلى جودة شاشات العرض الحديثة.'
                    : '💡 Tip: Using these exact dimensions ensures full edge-to-edge coverage with razor-sharp fidelity and zero cropping.'}
                </p>
              </div>

              {/* Upload Banner Section */}
              <div className="banner-upload-panel glass-panel">
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Upload size={20} className="text-orange" />
                  <span>{lang === 'ar' ? 'إضافة صورة جديدة للافتة' : 'Upload New Hero Banner Image'}</span>
                </h3>

                <form onSubmit={handleCreateBannerSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <input
                    type="file"
                    ref={bannerFileInputRef}
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleBannerFileSelect}
                  />

                  {!bannerPreview ? (
                    <div
                      className="banner-dropzone"
                      onClick={() => bannerFileInputRef.current?.click()}
                    >
                      <div className="banner-dropzone-icon">
                        <ImageIcon size={28} />
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>
                        {lang === 'ar' ? 'اضغط هنا لاختيار صورة من جهازك' : 'Click here to choose an image from your computer'}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {lang === 'ar'
                          ? 'الصيغ المدعومة: PNG, JPG, WEBP • القياس الموصى به: 2752 × 768 بكسل'
                          : 'Supported: PNG, JPG, WEBP • Recommended: 2752 × 768 px'}
                      </div>
                    </div>
                  ) : (
                    <div className="banner-preview-box">
                      <img src={bannerPreview} alt="Preview" />
                      <div className={`banner-preview-badge ${bannerDimensions?.width === 2752 && bannerDimensions?.height === 768 ? 'is-perfect' : ''}`}>
                        {bannerDimensions ? (
                          <>
                            <CheckCircle size={14} />
                            <span>
                              {bannerDimensions.width} × {bannerDimensions.height} px
                              {bannerDimensions.width === 2752 && bannerDimensions.height === 768
                                ? (lang === 'ar' ? ' (مطابق تماماً 3.58:1)' : ' (Exact 3.58:1 match)')
                                : ` (نسبة ${(bannerDimensions.width / bannerDimensions.height).toFixed(2)}:1)`}
                            </span>
                          </>
                        ) : (
                          <span>{lang === 'ar' ? 'جارٍ فحص الأبعاد...' : 'Analyzing dimensions...'}</span>
                        )}
                      </div>
                      <button
                        type="button"
                        className="banner-remove-preview-btn"
                        onClick={() => {
                          setBannerFile(null);
                          setBannerPreview(null);
                          setBannerDimensions(null);
                          if (bannerFileInputRef.current) bannerFileInputRef.current.value = '';
                        }}
                        title={lang === 'ar' ? 'إلغاء التحديد' : 'Remove selection'}
                      >
                        <X size={18} />
                      </button>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <input
                      type="text"
                      className="form-input"
                      style={{ flex: 1, minWidth: '260px' }}
                      placeholder={lang === 'ar' ? 'عنوان أو تسمية للافتة (اختياري)...' : 'Optional banner title / label...'}
                      value={bannerTitle}
                      onChange={(e) => setBannerTitle(e.target.value)}
                    />

                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isUploadingBanner || !bannerFile}
                      style={{ minWidth: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      {isUploadingBanner ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          <span>{lang === 'ar' ? 'جارٍ رفع الصورة...' : 'Uploading...'}</span>
                        </>
                      ) : (
                        <>
                          <Plus size={18} />
                          <span>{lang === 'ar' ? 'إضافة إلى لافتة الواجهة' : 'Add to Hero Banner'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {bannerError && (
                    <div style={{ color: '#ef4444', fontSize: '0.88rem', fontWeight: 600 }}>
                      ⚠️ {bannerError}
                    </div>
                  )}
                </form>
              </div>

              {/* Active Banners Gallery */}
              <div style={{ marginTop: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ImageIcon size={20} className="text-orange" />
                  <span>{lang === 'ar' ? 'الصور المعروضة حالياً في لافتة الواجهة' : 'Active Showcase Banners on Storefront'}</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    ({banners.length})
                  </span>
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '20px' }}>
                  {lang === 'ar'
                    ? 'هذه هي الصور المعروضة بالتتابع في لافتة الواجهة الرئيسية. عند حذف أي صورة، سيتم حذفها نهائياً وإزالتها من الواجهة فوراً.'
                    : 'These slides rotate automatically on the storefront header. Deleting a slide removes it immediately from the live site.'}
                </p>

                {banners.length === 0 ? (
                  <div className="glass-panel" style={{ padding: '48px 24px', textAlign: 'center', borderRadius: '16px' }}>
                    <ImageIcon size={48} style={{ color: 'var(--text-muted)', opacity: 0.5, marginBottom: '12px' }} />
                    <h4 style={{ fontWeight: 700, marginBottom: '6px' }}>
                      {lang === 'ar' ? 'لا توجد أي لافتات معروضة حالياً' : 'No active banners'}
                    </h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      {lang === 'ar'
                        ? 'استخدم النموذج أعلاه لرفع صور لافتة العرض بقياس 2752×768 بكسل لتظهر في الواجهة الرئيسية.'
                        : 'Use the form above to upload custom banners with 2752 × 768 px dimensions.'}
                    </p>
                  </div>
                ) : (
                  <div className="active-banners-grid">
                    {banners.map((b, index) => {
                      const imgSource = b.image_url || b.image || '/images/banner_slide_1.png';
                      return (
                        <div key={b.id || index} className="active-banner-card">
                          <div className="active-banner-media">
                            <img src={imgSource} alt={b.title || `Banner ${index + 1}`} />
                            <div className="active-banner-order-pill">
                              <Sparkles size={12} />
                              <span>{lang === 'ar' ? `شريحة #${index + 1}` : `Slide #${index + 1}`}</span>
                            </div>
                          </div>

                          <div className="active-banner-body">
                            <div className="active-banner-info">
                              <h4 className="active-banner-title" title={b.title || `Banner #${b.id}`}>
                                {b.title || (lang === 'ar' ? `لافتة العرض #${index + 1}` : `Hero Slide #${index + 1}`)}
                              </h4>
                              <div className="active-banner-meta">
                                <span>ID: #{b.id}</span>
                                <span>•</span>
                                <span>2752 × 768 (3.58:1)</span>
                              </div>
                            </div>

                            <button
                              className="btn-delete-banner"
                              onClick={() => handleDeleteBanner(b)}
                              title={lang === 'ar' ? 'حذف من الواجهة نهائياً' : 'Delete banner from storefront'}
                            >
                              <Trash2 size={16} />
                              <span>{lang === 'ar' ? 'حذف من الواجهة' : 'Delete'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 9: DEALS & SPECIAL OFFERS MANAGEMENT */}
          {activeTab === 'deals' && (
            <div className="tab-view animate-fade deals-admin-view">
              {/* Header */}
              <div className="tab-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <h2 className="admin-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.4rem' }}>
                    <Tag className="text-orange" size={24} />
                    <span>{lang === 'ar' ? 'إدارة قسم العروض والتخفيضات (Deals & Offers)' : 'Deals & Special Offers Manager'}</span>
                  </h2>
                  <p className="admin-section-subtitle" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                    {lang === 'ar'
                      ? 'تحكم بالمنتجات المعروضة في صفحة العروض. يمكنك تحويل أي منتج متوفر حالياً إلى عرض مخفض، أو إضافة منتج جديد مباشرةً مع نسبة خصم.'
                      : 'Control products appearing on the Deals page. Transfer existing inventory to deals or add new discounted items.'}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setProductForm({
                        ...productForm,
                        is_deal: true,
                        deal_discount_percentage: 25,
                        deal_description: lang === 'ar' ? 'عرض خاص' : 'Special Deal',
                        price: '',
                        original_price: ''
                      });
                      setIsAddProductOpen(true);
                    }}
                  >
                    <Plus size={18} />
                    <span>{lang === 'ar' ? 'إضافة منتج جديد كعرض' : 'Add New Product as Deal'}</span>
                  </button>
                </div>
              </div>

              {/* Deal Stats Row */}
              <div className="deals-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div className="glass-panel kpi-card" style={{ padding: '18px', borderInlineStart: '4px solid #ff6b00' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                    {lang === 'ar' ? 'عدد العروض النشطة' : 'Active Deals'}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-main)' }}>
                      {products.filter((p) => p.is_deal).length}
                    </h3>
                    <Tag size={28} className="text-orange" />
                  </div>
                </div>

                <div className="glass-panel kpi-card" style={{ padding: '18px', borderInlineStart: '4px solid #10b981' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                    {lang === 'ar' ? 'منتجات جاهزة للتحويل' : 'Eligible Products'}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-main)' }}>
                      {products.filter((p) => !p.is_deal).length}
                    </h3>
                    <Package size={28} style={{ color: '#10b981' }} />
                  </div>
                </div>

                <div className="glass-panel kpi-card" style={{ padding: '18px', borderInlineStart: '4px solid #3b82f6' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                    {lang === 'ar' ? 'أعلى نسبة خصم متاحة' : 'Max Discount %'}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#3b82f6' }}>
                      %{products.filter((p) => p.is_deal).length > 0 ? Math.max(...products.filter((p) => p.is_deal).map((p) => p.deal_discount_percentage || 0), 0) : 0}
                    </h3>
                    <Percent size={28} style={{ color: '#3b82f6' }} />
                  </div>
                </div>
              </div>

              {/* CARD: Quick Transfer Available Product to Deals */}
              <div className="glass-panel deal-transfer-card" style={{ padding: '22px', borderRadius: '16px', marginBottom: '28px', border: '1.5px solid rgba(255, 107, 0, 0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                  <div style={{ background: 'rgba(255, 107, 0, 0.1)', color: '#ff6b00', padding: '8px', borderRadius: '10px' }}>
                    <Tag size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                      {lang === 'ar' ? 'نقل منتج متوفر حالياً إلى قسم العروض' : 'Transfer Available Product to Deals'}
                    </h3>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                      {lang === 'ar'
                        ? 'اختر أي قطعة غيار من المخزون الحالي، وحدد نسبة الخصم أو سعر العرض الجديد، وسيتم إدراجها فوراً في صفحة العروض.'
                        : 'Select an existing inventory part, set a discount or promotional price, and activate it on the Deals page.'}
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!dealTransferProductId) {
                      alert(lang === 'ar' ? 'يرجى اختيار منتج من القائمة أولاً' : 'Please select a product first');
                      return;
                    }
                    try {
                      setIsProcessingDeal(true);
                      await toggleProductDeal(dealTransferProductId, {
                        is_deal: true,
                        discount_percentage: dealTransferDiscount || 25,
                        deal_price: dealTransferPrice || null,
                        deal_description: dealTransferDesc || 'عرض حصري'
                      });
                      await loadData();
                      if (onProductsUpdated) {
                        const fresh = await fetchProducts();
                        onProductsUpdated(fresh);
                      }
                      setDealTransferProductId('');
                      setDealTransferPrice('');
                      alert(lang === 'ar' ? 'تم نقل المنتج إلى قسم العروض بنجاح!' : 'Product transferred to Deals successfully!');
                    } catch (err) {
                      alert(lang === 'ar' ? `فشل النقل إلى العروض: ${err.message}` : `Failed to transfer: ${err.message}`);
                    } finally {
                      setIsProcessingDeal(false);
                    }
                  }}
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px', alignItems: 'flex-end' }}
                >
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">{lang === 'ar' ? 'اختر المنتج من المتوفر *' : 'Select Product *'}</label>
                    <select
                      className="form-input"
                      required
                      value={dealTransferProductId}
                      onChange={(e) => {
                        const pid = e.target.value;
                        setDealTransferProductId(pid);
                        const found = products.find((p) => String(p.id) === String(pid));
                        if (found) {
                          const orig = parseFloat(found.original_price || found.price) || 0;
                          const disc = dealTransferDiscount || 25;
                          const newPrice = (orig * (1 - disc / 100)).toFixed(2);
                          setDealTransferPrice(newPrice);
                        }
                      }}
                    >
                      <option value="">{lang === 'ar' ? '-- اختر منتجاً لتحويله إلى عرض --' : '-- Choose a Product --'}</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.sku} — {lang === 'ar' ? p.name_ar : p.name_en} ({Number(p.price).toLocaleString()} د.ع) {p.is_deal ? ' (معروض حالياً)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">{lang === 'ar' ? 'نسبة الخصم (%)' : 'Discount %'}</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="number"
                        min="1"
                        max="90"
                        className="form-input"
                        value={dealTransferDiscount}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10) || 0;
                          setDealTransferDiscount(val);
                          const found = products.find((p) => String(p.id) === String(dealTransferProductId));
                          if (found) {
                            const orig = parseFloat(found.original_price || found.price) || 0;
                            setDealTransferPrice((orig * (1 - val / 100)).toFixed(2));
                          }
                        }}
                        placeholder="25"
                      />
                      <span style={{ fontWeight: 800, color: 'var(--text-muted)' }}>%</span>
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">{lang === 'ar' ? 'سعر العرض بعد الخصم ($)' : 'Deal Price ($)'}</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      value={dealTransferPrice}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setDealTransferPrice(e.target.value);
                        const found = products.find((p) => String(p.id) === String(dealTransferProductId));
                        if (found) {
                          const orig = parseFloat(found.original_price || found.price) || 0;
                          if (orig > 0 && val < orig) {
                            setDealTransferDiscount(Math.round(((orig - val) / orig) * 100));
                          }
                        }
                      }}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">{lang === 'ar' ? 'شارة العرض (Deal Tag)' : 'Deal Badge Tag'}</label>
                    <input
                      type="text"
                      className="form-input"
                      value={dealTransferDesc}
                      onChange={(e) => setDealTransferDesc(e.target.value)}
                      placeholder={lang === 'ar' ? 'عرض حصري / Flash Deal' : 'Special Offer'}
                    />
                  </div>

                  <div>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={!dealTransferProductId || isProcessingDeal}
                      style={{ width: '100%', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <Tag size={18} />
                      <span>{isProcessingDeal ? (lang === 'ar' ? 'جارٍ التحويل...' : 'Transferring...') : (lang === 'ar' ? 'نقل إلى العروض الآن' : 'Activate Deal Now')}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* TABLE: Active Deals Table */}
              <div className="glass-panel table-wrapper">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Flame className="text-orange" size={20} />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                      {lang === 'ar' ? 'قائمة المنتجات المعروضة حالياً ضمن العروض' : 'Active Deals List'}
                    </h3>
                  </div>

                  <div className="search-box-admin" style={{ maxWidth: '320px' }}>
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder={lang === 'ar' ? 'بحث في العروض...' : 'Search deals...'}
                      value={dealSearch}
                      onChange={(e) => setDealSearch(e.target.value)}
                    />
                  </div>
                </div>

                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>{lang === 'ar' ? 'الصورة' : 'Image'}</th>
                      <th>SKU</th>
                      <th>{lang === 'ar' ? 'الاسم' : 'Name'}</th>
                      <th>{lang === 'ar' ? 'القسم' : 'Category'}</th>
                      <th>{lang === 'ar' ? 'السعر الأصلي' : 'Original Price'}</th>
                      <th>{lang === 'ar' ? 'سعر العرض' : 'Deal Price'}</th>
                      <th>{lang === 'ar' ? 'نسبة الخصم' : 'Discount'}</th>
                      <th>{lang === 'ar' ? 'الشارة' : 'Badge'}</th>
                      <th>{lang === 'ar' ? 'المخزون' : 'Stock'}</th>
                      <th>{lang === 'ar' ? 'إجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products
                      .filter((p) => p.is_deal)
                      .filter((p) => {
                        if (!dealSearch) return true;
                        const q = dealSearch.toLowerCase();
                        return (
                          (p.name_ar && p.name_ar.toLowerCase().includes(q)) ||
                          (p.name_en && p.name_en.toLowerCase().includes(q)) ||
                          (p.sku && p.sku.toLowerCase().includes(q))
                        );
                      })
                      .map((p) => (
                        <tr key={p.id}>
                          <td>
                            <img src={p.image_url} alt="" className="table-thumb" />
                          </td>
                          <td><code>{p.sku}</code></td>
                          <td>
                            <strong>{lang === 'ar' ? p.name_ar : p.name_en}</strong>
                          </td>
                          <td>{lang === 'ar' ? p.category_name_ar : p.category_name_en}</td>
                          <td style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                            {Number(p.original_price || p.price).toLocaleString()} د.ع
                          </td>
                          <td className="text-orange font-bold" style={{ fontSize: '1.05rem' }}>
                            {Number(p.price).toLocaleString()} د.ع
                          </td>
                          <td>
                            <span className="bambu-badge-sale" style={{ fontSize: '0.78rem', padding: '3px 8px' }}>
                              -%{p.deal_discount_percentage || (p.original_price ? Math.round(((p.original_price - p.price) / p.original_price) * 100) : 0)}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.78rem', background: 'rgba(255, 107, 0, 0.08)', color: '#ff6b00', border: '1px solid rgba(255, 107, 0, 0.25)', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                              {p.deal_description || (lang === 'ar' ? 'عرض خاص' : 'Deal')}
                            </span>
                          </td>
                          <td>
                            <span className={`stock-pill ${p.stock_quantity <= 15 ? 'low' : 'ok'}`}>
                              {p.stock_quantity}
                            </span>
                          </td>
                          <td>
                            <div className="table-btn-group">
                              <button
                                className="icon-action-btn edit"
                                onClick={() => setEditingDealProduct({ ...p })}
                                title={lang === 'ar' ? 'تعديل نسبة الخصم والسعر' : 'Edit deal'}
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                className="btn-delete-banner"
                                style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                                onClick={async () => {
                                  if (!window.confirm(lang === 'ar' ? `هل أنت متأكد من إزالة "${p.name_ar || p.name_en}" من قسم العروض واستعادة سعره الأصلي؟` : `Remove "${p.name_en}" from deals?`)) return;
                                  try {
                                    setIsProcessingDeal(true);
                                    await toggleProductDeal(p.id, { is_deal: false });
                                    await loadData();
                                    if (onProductsUpdated) {
                                      const fresh = await fetchProducts();
                                      onProductsUpdated(fresh);
                                    }
                                  } catch (err) {
                                    alert(lang === 'ar' ? `فشل إزالة العرض: ${err.message}` : `Failed: ${err.message}`);
                                  } finally {
                                    setIsProcessingDeal(false);
                                  }
                                }}
                                title={lang === 'ar' ? 'إزالة من العروض واستعادة السعر الأصلي' : 'Remove from deals'}
                              >
                                <Trash2 size={14} />
                                <span>{lang === 'ar' ? 'إلغاء العرض' : 'Remove'}</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    {products.filter((p) => p.is_deal).length === 0 && (
                      <tr>
                        <td colSpan="10" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                          <Tag size={36} style={{ margin: '0 auto 10px', opacity: 0.5, display: 'block' }} />
                          <p style={{ fontWeight: 700, fontSize: '1rem' }}>
                            {lang === 'ar' ? 'لا توجد منتجات ضمن قسم العروض حالياً' : 'No active deals currently'}
                          </p>
                          <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                            {lang === 'ar' ? 'اختر منتجاً من المربع أعلاه واضغط "نقل إلى العروض الآن" لإدراجه فوراً.' : 'Select a product from above to transfer it to deals.'}
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* MODAL: Quick Edit Deal Details */}
              {editingDealProduct && (
                <div className="modal-backdrop animate-fade" onClick={() => setEditingDealProduct(null)}>
                  <div className="modal-container admin-modal glass-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                    <button className="modal-close-btn" onClick={() => setEditingDealProduct(null)}>
                      <X size={20} />
                    </button>
                    <h3 className="admin-modal-title">
                      <Tag size={20} className="text-orange" />
                      <span>{lang === 'ar' ? 'تعديل عرض المنتج' : 'Edit Deal Details'}</span>
                    </h3>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                      {lang === 'ar' ? editingDealProduct.name_ar : editingDealProduct.name_en} ({editingDealProduct.sku})
                    </p>

                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!editingDealProduct) return;
                        try {
                          setIsProcessingDeal(true);
                          await toggleProductDeal(editingDealProduct.id, {
                            is_deal: true,
                            discount_percentage: editingDealProduct.deal_discount_percentage,
                            deal_price: editingDealProduct.price,
                            deal_description: editingDealProduct.deal_description
                          });
                          setEditingDealProduct(null);
                          await loadData();
                          if (onProductsUpdated) {
                            const fresh = await fetchProducts();
                            onProductsUpdated(fresh);
                          }
                        } catch (err) {
                          alert(lang === 'ar' ? `فشل تعديل العرض: ${err.message}` : `Failed to update deal: ${err.message}`);
                        } finally {
                          setIsProcessingDeal(false);
                        }
                      }}
                      style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
                    >
                      <div className="form-group">
                        <label className="form-label">{lang === 'ar' ? 'السعر الأصلي ($)' : 'Original Price ($)'}</label>
                        <input
                          type="number"
                          step="0.01"
                          readOnly
                          className="form-input"
                          value={editingDealProduct.original_price || editingDealProduct.price}
                          style={{ opacity: 0.7, cursor: 'not-allowed' }}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">{lang === 'ar' ? 'نسبة الخصم (%)' : 'Discount Percentage (%)'}</label>
                        <input
                          type="number"
                          min="1"
                          max="90"
                          className="form-input"
                          value={editingDealProduct.deal_discount_percentage || 20}
                          onChange={(e) => {
                            const disc = parseInt(e.target.value, 10) || 0;
                            const orig = parseFloat(editingDealProduct.original_price || editingDealProduct.price) || 0;
                            const newP = (orig * (1 - disc / 100)).toFixed(2);
                            setEditingDealProduct({
                              ...editingDealProduct,
                              deal_discount_percentage: disc,
                              price: newP
                            });
                          }}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">{lang === 'ar' ? 'سعر العرض الجديد ($)' : 'New Deal Price ($)'}</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-input"
                          value={editingDealProduct.price}
                          onChange={(e) => {
                            const newP = parseFloat(e.target.value) || 0;
                            const orig = parseFloat(editingDealProduct.original_price || editingDealProduct.price) || 0;
                            const disc = orig > 0 ? Math.round(((orig - newP) / orig) * 100) : 0;
                            setEditingDealProduct({
                              ...editingDealProduct,
                              price: e.target.value,
                              deal_discount_percentage: disc
                            });
                          }}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">{lang === 'ar' ? 'شارة العرض (Deal Description)' : 'Deal Tag'}</label>
                        <input
                          type="text"
                          className="form-input"
                          value={editingDealProduct.deal_description || ''}
                          onChange={(e) => setEditingDealProduct({ ...editingDealProduct, deal_description: e.target.value })}
                          placeholder="خصم حصري"
                        />
                      </div>

                      <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>
                        {lang === 'ar' ? 'حفظ تعديلات العرض' : 'Save Deal Changes'}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* MODAL: ADD PRODUCT */}
      {isAddProductOpen && (
        <div className="modal-backdrop animate-fade" onClick={() => setIsAddProductOpen(false)}>
          <div className="modal-container admin-modal glass-panel" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsAddProductOpen(false)}>
              <X size={20} />
            </button>
            <h3 className="admin-modal-title">
              <Plus size={20} className="text-orange" />
              {lang === 'ar' ? 'إضافة قطعة غيار جديدة' : 'Add New Spare Part'}
            </h3>

            <form onSubmit={handleCreateProductSubmit} className="admin-form">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">الاسم بالعربية *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={productForm.name_ar}
                    onChange={(e) => setProductForm({ ...productForm, name_ar: e.target.value })}
                    placeholder="فوهة نحاسية عالية التدفق 0.4 مم"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">English Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={productForm.name_en}
                    onChange={(e) => setProductForm({ ...productForm, name_en: e.target.value })}
                    placeholder="High-Flow Brass Nozzle 0.4mm"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">رقم القطعة (SKU) *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    placeholder="NOZ-BRASS-04"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'التصنيف (Category) *' : 'Category *'}</label>
                  <select
                    className="form-input"
                    required
                    value={productForm.category || (categories[0]?.id || '')}
                    onChange={(e) => setProductForm({ ...productForm, category: parseInt(e.target.value, 10) || e.target.value })}
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {lang === 'ar' ? `${cat.name_ar} — (${cat.name_en})` : `${cat.name_en} — (${cat.name_ar})`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">السعر ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="form-input"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="15.00"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">الكمية بالمخزون *</label>
                  <input
                    type="number"
                    required
                    className="form-input"
                    value={productForm.stock_quantity}
                    onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value })}
                    placeholder="25"
                  />
                </div>
              </div>

              {/* Product Multi-Image Section */}
              <div className="form-group image-upload-section">
                <div className="image-section-header">
                  <label className="form-label" style={{ marginBottom: 0 }}>
                    {lang === 'ar' ? 'صور القطعة (معرض الصور)' : 'Product Images & Gallery'}
                  </label>
                  <span className="admin-count-pill">
                    {(productForm.images || []).length} {lang === 'ar' ? 'صور' : 'images'}
                  </span>
                </div>

                <div className="image-uploader-card">
                  {/* Actions Toolbar */}
                  <div className="image-toolbar-row">
                    <label className="btn btn-secondary btn-sm upload-file-btn">
                      {isUploadingAddImage ? (
                        <>
                          <Loader2 size={14} className="spin text-orange" />
                          <span>{lang === 'ar' ? 'جارٍ رفع الصور...' : 'Uploading...'}</span>
                        </>
                      ) : (
                        <>
                          <Upload size={14} />
                          <span>{lang === 'ar' ? '+ رفع صور من جهازك (اختر صورة أو أكثر)' : '+ Upload Images (Multiple)'}</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileUpload(e.target.files, 'add')}
                        disabled={isUploadingAddImage}
                      />
                    </label>

                    {/* Inline direct URL adder */}
                    <div className="image-url-inline-adder">
                      <input
                        type="url"
                        className="form-input form-input-sm"
                        placeholder={lang === 'ar' ? 'أو أدخل رابط صورة مباشر...' : 'Or paste image URL...'}
                        value={newImageUrlAdd}
                        onChange={(e) => setNewImageUrlAdd(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddImageUrl(newImageUrlAdd, 'add');
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleAddImageUrl(newImageUrlAdd, 'add')}
                        disabled={!newImageUrlAdd.trim()}
                      >
                        <Plus size={14} />
                        <span>{lang === 'ar' ? 'إضافة' : 'Add'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Thumbnails Gallery Grid */}
                  {(productForm.images && productForm.images.length > 0) ? (
                    <div className="images-gallery-grid">
                      {productForm.images.map((imgUrl, idx) => {
                        const isPrimary = idx === 0;
                        return (
                          <div key={idx} className={`image-gallery-item ${isPrimary ? 'is-primary' : ''}`}>
                            <img src={imgUrl} alt={`Product ${idx + 1}`} className="gallery-thumb-img" />
                            {isPrimary && (
                              <span className="primary-tag">
                                <Star size={11} fill="currentColor" /> {lang === 'ar' ? 'الرئيسية' : 'Main'}
                              </span>
                            )}
                            <div className="gallery-item-actions">
                              {!isPrimary && (
                                <button
                                  type="button"
                                  className="action-btn-mini set-primary"
                                  title={lang === 'ar' ? 'تعيين كصورة رئيسية' : 'Set as main thumbnail'}
                                  onClick={() => handleSetPrimaryImage(imgUrl, 'add')}
                                >
                                  <Star size={12} />
                                </button>
                              )}
                              <button
                                type="button"
                                className="action-btn-mini delete"
                                title={lang === 'ar' ? 'إزالة الصورة' : 'Remove'}
                                onClick={() => handleRemoveImage(imgUrl, 'add')}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <label className="image-dropzone-label">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileUpload(e.target.files, 'add')}
                        disabled={isUploadingAddImage}
                      />
                      <div className="empty-upload-state">
                        <div className="upload-icon-circle">
                          <Upload size={22} className="text-orange" />
                        </div>
                        <strong>{lang === 'ar' ? 'اضغط لاختيار صور من جهازك' : 'Click to select images from device'}</strong>
                        <span className="upload-hint">
                          {lang === 'ar' ? 'يمكنك تحديد عدة صور دفعة واحدة وسيتم إضافتها للمعرض' : 'You can select multiple photos at once'}
                        </span>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              {/* Product Sizes & Measurement Variants (Optional) */}
              <div className="variants-admin-box glass-panel">
                <div className="variants-toggle-header">
                  <label className="variants-checkbox-label">
                    <input
                      type="checkbox"
                      checked={productForm.has_variants || false}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setProductForm((prev) => ({
                          ...prev,
                          has_variants: checked,
                          variants: checked
                            ? (prev.variants && prev.variants.length > 0 ? prev.variants : [{ id: 1, name: '', price: prev.price || '', in_stock: true, image_url: '' }])
                            : prev.variants
                        }));
                      }}
                    />
                    <span className="toggle-custom-box"></span>
                    <span className="variants-title-text">
                      <strong>{lang === 'ar' ? 'تحديد خيارات المقاسات والقياسات (Variants & Sizes)' : 'Enable Size & Measurement Variants'}</strong>
                      <small className="text-muted block">
                        {lang === 'ar'
                          ? 'اختياري: فعّل هذا الخيار فقط للقطع التي تحتوي على مقاييس أو أقطار متنوعة (مثل: 0.2mm, 0.4mm, 0.6mm)'
                          : 'Optional: Enable only if this part has varying sizes, nozzles, or dimensions'}
                      </small>
                    </span>
                  </label>
                </div>

                {productForm.has_variants && (
                  <div className="variants-editor-body animate-fade">
                    <div className="variants-editor-header">
                      <div className="variants-stats-badge">
                        <Layers size={14} />
                        <span>
                          {lang === 'ar' ? 'خيارات المقاسات المتاحة:' : 'Configured Variants:'}
                          <strong> {(productForm.variants || []).length}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Clean Table-like Header */}
                    <div className="variants-table-header">
                      <span className="vth-col vth-num">#</span>
                      <span className="vth-col vth-name">{lang === 'ar' ? 'اسم المقاس / القطر *' : 'Size / Spec Name *'}</span>
                      <span className="vth-col vth-price">{lang === 'ar' ? 'السعر ($)' : 'Price ($)'}</span>
                      <span className="vth-col vth-stock">{lang === 'ar' ? 'حالة التوفر' : 'Stock Status'}</span>
                      <span className="vth-col vth-img">{lang === 'ar' ? 'رابط صورة المقاس (اختياري)' : 'Variant Image URL'}</span>
                      <span className="vth-col vth-action"></span>
                    </div>

                    <div className="variants-list">
                      {(productForm.variants || []).map((v, vIdx) => (
                        <div key={v.id || vIdx} className="variant-admin-card">
                          {/* Row Index Badge */}
                          <div className="variant-row-index">
                            <span>#{vIdx + 1}</span>
                          </div>

                          {/* Size Name Field */}
                          <div className="variant-col-field variant-field-name">
                            <input
                              type="text"
                              required
                              className="form-input variant-input-field"
                              placeholder={lang === 'ar' ? 'مثال: 0.4mm Stainless Steel' : 'e.g. 0.4mm Stainless Steel'}
                              value={v.name || ''}
                              onChange={(e) => {
                                const updated = [...(productForm.variants || [])];
                                updated[vIdx] = { ...updated[vIdx], name: e.target.value };
                                setProductForm({ ...productForm, variants: updated });
                              }}
                            />
                          </div>

                          {/* Price Field */}
                          <div className="variant-col-field variant-field-price">
                            <div className="variant-input-with-symbol">
                              <span className="currency-symbol">$</span>
                              <input
                                type="number"
                                step="0.01"
                                className="form-input variant-input-field price-input"
                                placeholder={productForm.price || '0.00'}
                                value={v.price != null ? v.price : ''}
                                onChange={(e) => {
                                  const updated = [...(productForm.variants || [])];
                                  updated[vIdx] = { ...updated[vIdx], price: e.target.value };
                                  setProductForm({ ...productForm, variants: updated });
                                }}
                              />
                            </div>
                          </div>

                          {/* Stock Custom Select */}
                          <div className="variant-col-field variant-field-stock">
                            <div className="variant-stock-custom-select">
                              <select
                                className={`form-select variant-stock-select ${v.in_stock === false ? 'is-out' : 'is-in'}`}
                                value={v.in_stock === false ? 'out' : 'in'}
                                onChange={(e) => {
                                  const updated = [...(productForm.variants || [])];
                                  updated[vIdx] = { ...updated[vIdx], in_stock: e.target.value === 'in' };
                                  setProductForm({ ...productForm, variants: updated });
                                }}
                              >
                                <option value="in">{lang === 'ar' ? '✓ متوفر بالمخزون' : 'In Stock'}</option>
                                <option value="out">{lang === 'ar' ? '✕ غير متوفر (نفذ)' : 'Out of Stock'}</option>
                              </select>
                            </div>
                          </div>

                          {/* Image Field with Live Upload & Preview */}
                          <div className="variant-col-field variant-field-img">
                            <div className="variant-img-input-wrap">
                              <label
                                className={`variant-thumbnail-upload-btn ${variantUploadLoadingAdd === vIdx ? 'loading' : ''} ${v.image_url ? 'has-img' : ''}`}
                                title={v.image_url ? (lang === 'ar' ? 'انقر لتغيير صورة المقاس من ملفاتك' : 'Click to change image') : (lang === 'ar' ? 'انقر لاختيار ورفع صورة المقاس من ملفاتك' : 'Click to upload from device')}
                              >
                                {variantUploadLoadingAdd === vIdx ? (
                                  <Loader2 size={16} className="spin text-orange" />
                                ) : v.image_url ? (
                                  <>
                                    <img
                                      src={v.image_url}
                                      alt="size"
                                      onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                    <div className="thumb-change-overlay">
                                      <Upload size={12} />
                                    </div>
                                  </>
                                ) : (
                                  <div className="thumb-upload-prompt">
                                    <Upload size={14} className="thumb-upload-icon" />
                                    <span className="thumb-upload-text">{lang === 'ar' ? 'رفع' : 'Upload'}</span>
                                  </div>
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  style={{ display: 'none' }}
                                  disabled={variantUploadLoadingAdd === vIdx}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handleVariantFileUpload(file, vIdx, 'add');
                                    }
                                    e.target.value = '';
                                  }}
                                />
                              </label>
                              <input
                                type="text"
                                className="form-input variant-input-field img-input"
                                placeholder={lang === 'ar' ? 'أو ألصق رابط مباشر...' : 'Or paste URL...'}
                                value={v.image_url || ''}
                                onChange={(e) => {
                                  const updated = [...(productForm.variants || [])];
                                  updated[vIdx] = { ...updated[vIdx], image_url: e.target.value };
                                  setProductForm({ ...productForm, variants: updated });
                                }}
                              />
                            </div>
                          </div>

                          {/* Delete Action Button */}
                          <div className="variant-col-field variant-actions-col">
                            <button
                              type="button"
                              className="variant-trash-btn"
                              onClick={() => {
                                const updated = (productForm.variants || []).filter((_, idx) => idx !== vIdx);
                                setProductForm({ ...productForm, variants: updated });
                              }}
                              title={lang === 'ar' ? 'حذف المقاس' : 'Remove size'}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      className="btn-add-variant-modern"
                      onClick={() => {
                        const updated = [
                          ...(productForm.variants || []),
                          {
                            id: Date.now(),
                            name: '',
                            price: productForm.price || '',
                            in_stock: true,
                            image_url: ''
                          }
                        ];
                        setProductForm({ ...productForm, variants: updated });
                      }}
                    >
                      <Plus size={16} />
                      <span>{lang === 'ar' ? 'إضافة خيار مقاس جديد' : 'Add Another Size'}</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'الوصف بالعربية (Arabic Description)' : 'Arabic Description'}</label>
                  <textarea
                    rows="3"
                    className="form-textarea"
                    value={productForm.description_ar}
                    onChange={(e) => setProductForm({ ...productForm, description_ar: e.target.value })}
                    placeholder="اكتب وصفاً فنياً شاملاً ومواصفات القطعة باللغة العربية..."
                  ></textarea>
                </div>

                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'الوصف بالإنجليزية (English Description)' : 'English Description'}</label>
                  <textarea
                    rows="3"
                    className="form-textarea"
                    value={productForm.description_en}
                    onChange={(e) => setProductForm({ ...productForm, description_en: e.target.value })}
                    placeholder="Enter comprehensive technical specifications and description in English..."
                  ></textarea>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }}>
                {lang === 'ar' ? 'حفظ وإضافة القطعة' : 'Save & Publish Part'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PRODUCT */}
      {editingProduct && (
        <div className="modal-backdrop animate-fade" onClick={() => setEditingProduct(null)}>
          <div className="modal-container admin-modal glass-panel" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setEditingProduct(null)}>
              <X size={20} />
            </button>
            <h3 className="admin-modal-title">
              <Edit2 size={20} className="text-orange" />
              {lang === 'ar' ? 'تعديل بيانات المنتج والمخزون' : 'Edit Product Details & Stock'}
            </h3>

            <form onSubmit={handleEditProductSubmit} className="admin-form">
              {/* Product Multi-Image Section */}
              <div className="form-group image-upload-section">
                <div className="image-section-header">
                  <label className="form-label" style={{ marginBottom: 0 }}>
                    {lang === 'ar' ? 'صور القطعة (معرض الصور)' : 'Product Images & Gallery'}
                  </label>
                  <span className="admin-count-pill">
                    {(editingProduct.images || (editingProduct.image_url ? [editingProduct.image_url] : [])).length} {lang === 'ar' ? 'صور' : 'images'}
                  </span>
                </div>

                <div className="image-uploader-card">
                  {/* Actions Toolbar */}
                  <div className="image-toolbar-row">
                    <label className="btn btn-secondary btn-sm upload-file-btn">
                      {isUploadingEditImage ? (
                        <>
                          <Loader2 size={14} className="spin text-orange" />
                          <span>{lang === 'ar' ? 'جارٍ رفع الصور...' : 'Uploading...'}</span>
                        </>
                      ) : (
                        <>
                          <Upload size={14} />
                          <span>{lang === 'ar' ? '+ إضافة صور من جهازك (اختر صورة أو أكثر)' : '+ Add Images (Multiple)'}</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileUpload(e.target.files, 'edit')}
                        disabled={isUploadingEditImage}
                      />
                    </label>

                    {/* Inline direct URL adder */}
                    <div className="image-url-inline-adder">
                      <input
                        type="url"
                        className="form-input form-input-sm"
                        placeholder={lang === 'ar' ? 'أو أدخل رابط صورة مباشر...' : 'Or paste image URL...'}
                        value={newImageUrlEdit}
                        onChange={(e) => setNewImageUrlEdit(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddImageUrl(newImageUrlEdit, 'edit');
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleAddImageUrl(newImageUrlEdit, 'edit')}
                        disabled={!newImageUrlEdit.trim()}
                      >
                        <Plus size={14} />
                        <span>{lang === 'ar' ? 'إضافة' : 'Add'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Thumbnails Gallery Grid */}
                  {((editingProduct.images && editingProduct.images.length > 0) || editingProduct.image_url) ? (
                    <div className="images-gallery-grid">
                      {(editingProduct.images && editingProduct.images.length > 0
                        ? editingProduct.images
                        : [editingProduct.image_url]
                      ).map((imgUrl, idx) => {
                        const isPrimary = idx === 0;
                        return (
                          <div key={idx} className={`image-gallery-item ${isPrimary ? 'is-primary' : ''}`}>
                            <img src={imgUrl} alt={`Product ${idx + 1}`} className="gallery-thumb-img" />
                            {isPrimary && (
                              <span className="primary-tag">
                                <Star size={11} fill="currentColor" /> {lang === 'ar' ? 'الرئيسية' : 'Main'}
                              </span>
                            )}
                            <div className="gallery-item-actions">
                              {!isPrimary && (
                                <button
                                  type="button"
                                  className="action-btn-mini set-primary"
                                  title={lang === 'ar' ? 'تعيين كصورة رئيسية' : 'Set as main thumbnail'}
                                  onClick={() => handleSetPrimaryImage(imgUrl, 'edit')}
                                >
                                  <Star size={12} />
                                </button>
                              )}
                              <button
                                type="button"
                                className="action-btn-mini delete"
                                title={lang === 'ar' ? 'إزالة الصورة' : 'Remove'}
                                onClick={() => handleRemoveImage(imgUrl, 'edit')}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <label className="image-dropzone-label">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileUpload(e.target.files, 'edit')}
                        disabled={isUploadingEditImage}
                      />
                      <div className="empty-upload-state">
                        <div className="upload-icon-circle">
                          <Upload size={22} className="text-orange" />
                        </div>
                        <strong>{lang === 'ar' ? 'اضغط لاختيار صور من جهازك' : 'Click to select images from device'}</strong>
                        <span className="upload-hint">
                          {lang === 'ar' ? 'يمكنك تحديد عدة صور دفعة واحدة وسيتم إضافتها للمعرض' : 'You can select multiple photos at once'}
                        </span>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">الاسم بالعربية</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingProduct.name_ar}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name_ar: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">English Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingProduct.name_en}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name_en: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  {lang === 'ar' ? 'التصنيف (Category) *' : 'Category *'}
                </label>
                <select
                  className="form-input"
                  required
                  value={
                    typeof editingProduct.category === 'object'
                      ? (editingProduct.category?.id || '')
                      : (editingProduct.category || '')
                  }
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      category: parseInt(e.target.value, 10) || e.target.value
                    })
                  }
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {lang === 'ar' ? `${cat.name_ar} — (${cat.name_en})` : `${cat.name_en} — (${cat.name_ar})`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">السعر الحالي ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">الكمية بالمخزون</label>
                  <input
                    type="number"
                    className="form-input"
                    value={editingProduct.stock_quantity}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock_quantity: e.target.value })}
                  />
                </div>
              </div>

              {/* Product Sizes & Measurement Variants (Optional) */}
              <div className="variants-admin-box glass-panel">
                <div className="variants-toggle-header">
                  <label className="variants-checkbox-label">
                    <input
                      type="checkbox"
                      checked={editingProduct.has_variants || false}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setEditingProduct((prev) => ({
                          ...prev,
                          has_variants: checked,
                          variants: checked
                            ? (prev.variants && prev.variants.length > 0 ? prev.variants : [{ id: 1, name: '', price: prev.price || '', in_stock: true, image_url: '' }])
                            : prev.variants
                        }));
                      }}
                    />
                    <span className="toggle-custom-box"></span>
                    <span className="variants-title-text">
                      <strong>{lang === 'ar' ? 'تحديد خيارات المقاسات والقياسات (Variants & Sizes)' : 'Enable Size & Measurement Variants'}</strong>
                      <small className="text-muted block">
                        {lang === 'ar'
                          ? 'اختياري: فعّل هذا الخيار فقط للقطع التي تحتوي على مقاييس أو أقطار متنوعة (مثل: 0.2mm, 0.4mm, 0.6mm)'
                          : 'Optional: Enable only if this part has varying sizes, nozzles, or dimensions'}
                      </small>
                    </span>
                  </label>
                </div>

                {editingProduct.has_variants && (
                  <div className="variants-editor-body animate-fade">
                    <div className="variants-editor-header">
                      <div className="variants-stats-badge">
                        <Layers size={14} />
                        <span>
                          {lang === 'ar' ? 'خيارات المقاسات المتاحة:' : 'Configured Variants:'}
                          <strong> {(editingProduct.variants || []).length}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Clean Table-like Header */}
                    <div className="variants-table-header">
                      <span className="vth-col vth-num">#</span>
                      <span className="vth-col vth-name">{lang === 'ar' ? 'اسم المقاس / القطر *' : 'Size / Spec Name *'}</span>
                      <span className="vth-col vth-price">{lang === 'ar' ? 'السعر ($)' : 'Price ($)'}</span>
                      <span className="vth-col vth-stock">{lang === 'ar' ? 'حالة التوفر' : 'Stock Status'}</span>
                      <span className="vth-col vth-img">{lang === 'ar' ? 'رابط صورة المقاس (اختياري)' : 'Variant Image URL'}</span>
                      <span className="vth-col vth-action"></span>
                    </div>

                    <div className="variants-list">
                      {(editingProduct.variants || []).map((v, vIdx) => (
                        <div key={v.id || vIdx} className="variant-admin-card">
                          {/* Row Index Badge */}
                          <div className="variant-row-index">
                            <span>#{vIdx + 1}</span>
                          </div>

                          {/* Size Name Field */}
                          <div className="variant-col-field variant-field-name">
                            <input
                              type="text"
                              required
                              className="form-input variant-input-field"
                              placeholder={lang === 'ar' ? 'مثال: 0.4mm Stainless Steel' : 'e.g. 0.4mm Stainless Steel'}
                              value={v.name || ''}
                              onChange={(e) => {
                                const updated = [...(editingProduct.variants || [])];
                                updated[vIdx] = { ...updated[vIdx], name: e.target.value };
                                setEditingProduct({ ...editingProduct, variants: updated });
                              }}
                            />
                          </div>

                          {/* Price Field */}
                          <div className="variant-col-field variant-field-price">
                            <div className="variant-input-with-symbol">
                              <span className="currency-symbol">$</span>
                              <input
                                type="number"
                                step="0.01"
                                className="form-input variant-input-field price-input"
                                placeholder={editingProduct.price || '0.00'}
                                value={v.price != null ? v.price : ''}
                                onChange={(e) => {
                                  const updated = [...(editingProduct.variants || [])];
                                  updated[vIdx] = { ...updated[vIdx], price: e.target.value };
                                  setEditingProduct({ ...editingProduct, variants: updated });
                                }}
                              />
                            </div>
                          </div>

                          {/* Stock Custom Select */}
                          <div className="variant-col-field variant-field-stock">
                            <div className="variant-stock-custom-select">
                              <select
                                className={`form-select variant-stock-select ${v.in_stock === false ? 'is-out' : 'is-in'}`}
                                value={v.in_stock === false ? 'out' : 'in'}
                                onChange={(e) => {
                                  const updated = [...(editingProduct.variants || [])];
                                  updated[vIdx] = { ...updated[vIdx], in_stock: e.target.value === 'in' };
                                  setEditingProduct({ ...editingProduct, variants: updated });
                                }}
                              >
                                <option value="in">{lang === 'ar' ? '✓ متوفر بالمخزون' : 'In Stock'}</option>
                                <option value="out">{lang === 'ar' ? '✕ غير متوفر (نفذ)' : 'Out of Stock'}</option>
                              </select>
                            </div>
                          </div>

                          {/* Image Field with Live Upload & Preview */}
                          <div className="variant-col-field variant-field-img">
                            <div className="variant-img-input-wrap">
                              <label
                                className={`variant-thumbnail-upload-btn ${variantUploadLoadingEdit === vIdx ? 'loading' : ''} ${v.image_url ? 'has-img' : ''}`}
                                title={v.image_url ? (lang === 'ar' ? 'انقر لتغيير صورة المقاس من ملفاتك' : 'Click to change image') : (lang === 'ar' ? 'انقر لاختيار ورفع صورة المقاس من ملفاتك' : 'Click to upload from device')}
                              >
                                {variantUploadLoadingEdit === vIdx ? (
                                  <Loader2 size={16} className="spin text-orange" />
                                ) : v.image_url ? (
                                  <>
                                    <img
                                      src={v.image_url}
                                      alt="size"
                                      onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                    <div className="thumb-change-overlay">
                                      <Upload size={12} />
                                    </div>
                                  </>
                                ) : (
                                  <div className="thumb-upload-prompt">
                                    <Upload size={14} className="thumb-upload-icon" />
                                    <span className="thumb-upload-text">{lang === 'ar' ? 'رفع' : 'Upload'}</span>
                                  </div>
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  style={{ display: 'none' }}
                                  disabled={variantUploadLoadingEdit === vIdx}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handleVariantFileUpload(file, vIdx, 'edit');
                                    }
                                    e.target.value = '';
                                  }}
                                />
                              </label>
                              <input
                                type="text"
                                className="form-input variant-input-field img-input"
                                placeholder={lang === 'ar' ? 'أو ألصق رابط مباشر...' : 'Or paste URL...'}
                                value={v.image_url || ''}
                                onChange={(e) => {
                                  const updated = [...(editingProduct.variants || [])];
                                  updated[vIdx] = { ...updated[vIdx], image_url: e.target.value };
                                  setEditingProduct({ ...editingProduct, variants: updated });
                                }}
                              />
                            </div>
                          </div>

                          {/* Delete Action Button */}
                          <div className="variant-col-field variant-actions-col">
                            <button
                              type="button"
                              className="variant-trash-btn"
                              onClick={() => {
                                const updated = (editingProduct.variants || []).filter((_, idx) => idx !== vIdx);
                                setEditingProduct({ ...editingProduct, variants: updated });
                              }}
                              title={lang === 'ar' ? 'حذف المقاس' : 'Remove size'}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      className="btn-add-variant-modern"
                      onClick={() => {
                        const updated = [
                          ...(editingProduct.variants || []),
                          {
                            id: Date.now(),
                            name: '',
                            price: editingProduct.price || '',
                            in_stock: true,
                            image_url: ''
                          }
                        ];
                        setEditingProduct({ ...editingProduct, variants: updated });
                      }}
                    >
                      <Plus size={16} />
                      <span>{lang === 'ar' ? 'إضافة خيار مقاس جديد' : 'Add Another Size'}</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'الوصف بالعربية (Arabic Description)' : 'Arabic Description'}</label>
                  <textarea
                    rows="3"
                    className="form-textarea"
                    value={editingProduct.description_ar || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description_ar: e.target.value })}
                    placeholder="اكتب وصفاً فنياً شاملاً ومواصفات القطعة باللغة العربية..."
                  ></textarea>
                </div>

                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'الوصف بالإنجليزية (English Description)' : 'English Description'}</label>
                  <textarea
                    rows="3"
                    className="form-textarea"
                    value={editingProduct.description_en || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description_en: e.target.value })}
                    placeholder="Enter comprehensive technical specifications and description in English..."
                  ></textarea>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }}>
                {lang === 'ar' ? 'تحديث البيانات' : 'Update Product'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW ORDER DETAILS */}
      {selectedOrderDetails && (
        <div className="modal-backdrop animate-fade" onClick={() => setSelectedOrderDetails(null)}>
          <div className="modal-container admin-modal glass-panel" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedOrderDetails(null)}>
              <X size={20} />
            </button>
            <h3 className="admin-modal-title">
              <ShoppingBag size={20} className="text-orange" />
              {lang === 'ar' ? 'تفاصيل الطلب' : 'Order Details'} #{selectedOrderDetails.order_number?.substring(0, 8)}
            </h3>

            <div className="order-details-box">
              <div className="order-info-line">
                <span>{lang === 'ar' ? 'العميل:' : 'Customer:'}</span>
                <strong>{selectedOrderDetails.customer_name}</strong>
              </div>
              <div className="order-info-line">
                <span>{lang === 'ar' ? 'الهاتف:' : 'Phone:'}</span>
                <strong>{selectedOrderDetails.customer_phone}</strong>
              </div>
              <div className="order-info-line">
                <span>{lang === 'ar' ? 'المدينة:' : 'City:'}</span>
                <span>{selectedOrderDetails.city}</span>
              </div>
              <div className="order-info-line">
                <span>{lang === 'ar' ? 'العنوان:' : 'Address:'}</span>
                <span>{selectedOrderDetails.shipping_address}</span>
              </div>
              <div className="order-info-line">
                <span>{lang === 'ar' ? 'المجموع الإجمالي:' : 'Total Amount:'}</span>
                <strong className="text-orange">{Number(selectedOrderDetails.total_amount).toLocaleString()} د.ع</strong>
              </div>

              <h4 style={{ marginTop: '16px', marginBottom: '8px' }}>
                {lang === 'ar' ? 'القطع المطلوبة:' : 'Ordered Items:'}
              </h4>
              <div className="order-items-mini-list">
                {(selectedOrderDetails.items || selectedOrderDetails.cart_items || []).map((item, idx) => (
                  <div key={item.id || idx} className="order-item-mini-row">
                    <img src={item.product_image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80'} alt="" className="item-mini-img" />
                    <div>
                      <div>{lang === 'ar' ? (item.product_name_ar || item.name || 'منتج') : (item.product_name_en || item.name || 'Product')}</div>
                      <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                        الكمية: {item.quantity} × {Number(item.unit_price || 0).toLocaleString()} د.ع
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '22px', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                {selectedOrderDetails.status === 'CANCELLED' ? (
                  <button
                    type="button"
                    className="btn btn-sm"
                    style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.35)', gap: '6px', fontWeight: 800 }}
                    onClick={() => handleDeleteOrder(selectedOrderDetails.id, selectedOrderDetails.order_number)}
                  >
                    <Trash2 size={16} />
                    {lang === 'ar' ? 'حذف هذه الفاتورة الملغية نهائياً' : 'Delete Cancelled Order'}
                  </button>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="text-muted" style={{ fontSize: '0.82rem' }}>
                      {lang === 'ar' ? 'يمكن حذف الفاتورة عند تحويلها إلى (CANCELLED)' : 'Invoice can be deleted when marked CANCELLED'}
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={() => setSelectedOrderDetails(null)}
                >
                  {lang === 'ar' ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD CATEGORY */}
      {isAddCategoryOpen && (
        <div className="modal-backdrop animate-fade" onClick={() => setIsAddCategoryOpen(false)}>
          <div className="modal-container admin-modal glass-panel" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsAddCategoryOpen(false)}>
              <X size={20} />
            </button>
            <h3 className="admin-modal-title">
              <FolderPlus size={20} className="text-orange" />
              {lang === 'ar' ? 'إضافة تصنيف جديد لقطع الغيار' : 'Add New Spare Parts Category'}
            </h3>

            <form onSubmit={handleCreateCategorySubmit} className="admin-form">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'الاسم بالعربية *' : 'Arabic Name *'}</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={categoryForm.name_ar}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name_ar: e.target.value })}
                    placeholder={lang === 'ar' ? 'مثال: فوهات الطباعة ورؤوس التسخين' : 'e.g. فوهات ورؤوس تسخين'}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'English Name *' : 'English Name *'}</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={categoryForm.name_en}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCategoryForm((prev) => ({
                        ...prev,
                        name_en: val,
                        slug: prev.slugModified
                          ? prev.slug
                          : val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                      }));
                    }}
                    placeholder="e.g. Nozzles & Hotends"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{lang === 'ar' ? 'المعرّف الرابط (Slug) *' : 'Slug Identifier *'}</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value, slugModified: true })}
                  placeholder="nozzles-hotends"
                />
                <span className="upload-hint" style={{ marginTop: '4px', display: 'block' }}>
                  {lang === 'ar' ? 'يُستخدم في روابط التصفية والفلاتر (يتولد تلقائياً من الاسم الإنجليزي)' : 'Used for URL filtering and state (auto-generated from English name)'}
                </span>
              </div>

              {/* Icon Picker */}
              <div className="form-group">
                <label className="form-label">{lang === 'ar' ? 'أيقونة التصنيف (Category Icon) *' : 'Category Icon *'}</label>
                <div className="category-icon-picker-grid">
                  {CATEGORY_ICON_OPTIONS.map((item) => {
                    const IconComp = item.icon;
                    const isSelected = categoryForm.icon_name === item.name;
                    return (
                      <button
                        type="button"
                        key={item.name}
                        className={`cat-icon-select-btn ${isSelected ? 'active' : ''}`}
                        onClick={() => setCategoryForm({ ...categoryForm, icon_name: item.name })}
                      >
                        <IconComp size={18} className={isSelected ? 'text-orange' : ''} />
                        <span>{lang === 'ar' ? item.label_ar : item.label_en}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'الوصف بالعربية (اختياري)' : 'Arabic Description (Optional)'}</label>
                  <textarea
                    rows="3"
                    className="form-textarea"
                    value={categoryForm.description_ar}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description_ar: e.target.value })}
                    placeholder="اكتب نبذة أو وصفاً تعريفياً بالتصنيف باللغة العربية..."
                  ></textarea>
                </div>

                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'الوصف بالإنجليزية (اختياري)' : 'English Description (Optional)'}</label>
                  <textarea
                    rows="3"
                    className="form-textarea"
                    value={categoryForm.description_en}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description_en: e.target.value })}
                    placeholder="Enter short description for this category in English..."
                  ></textarea>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }}>
                {lang === 'ar' ? 'حفظ وإضافة التصنيف' : 'Save & Publish Category'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT CATEGORY */}
      {editingCategory && (
        <div className="modal-backdrop animate-fade" onClick={() => setEditingCategory(null)}>
          <div className="modal-container admin-modal glass-panel" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setEditingCategory(null)}>
              <X size={20} />
            </button>
            <h3 className="admin-modal-title">
              <Edit2 size={20} className="text-orange" />
              {lang === 'ar' ? 'تعديل بيانات التصنيف' : 'Edit Category Details'}
            </h3>

            <form onSubmit={handleEditCategorySubmit} className="admin-form">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'الاسم بالعربية *' : 'Arabic Name *'}</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={editingCategory.name_ar}
                    onChange={(e) => setEditingCategory({ ...editingCategory, name_ar: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'English Name *' : 'English Name *'}</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={editingCategory.name_en}
                    onChange={(e) => setEditingCategory({ ...editingCategory, name_en: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{lang === 'ar' ? 'المعرّف الرابط (Slug) *' : 'Slug Identifier *'}</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={editingCategory.slug}
                  onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                />
              </div>

              {/* Icon Picker */}
              <div className="form-group">
                <label className="form-label">{lang === 'ar' ? 'أيقونة التصنيف (Category Icon) *' : 'Category Icon *'}</label>
                <div className="category-icon-picker-grid">
                  {CATEGORY_ICON_OPTIONS.map((item) => {
                    const IconComp = item.icon;
                    const isSelected = editingCategory.icon_name === item.name;
                    return (
                      <button
                        type="button"
                        key={item.name}
                        className={`cat-icon-select-btn ${isSelected ? 'active' : ''}`}
                        onClick={() => setEditingCategory({ ...editingCategory, icon_name: item.name })}
                      >
                        <IconComp size={18} className={isSelected ? 'text-orange' : ''} />
                        <span>{lang === 'ar' ? item.label_ar : item.label_en}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'الوصف بالعربية' : 'Arabic Description'}</label>
                  <textarea
                    rows="3"
                    className="form-textarea"
                    value={editingCategory.description_ar || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, description_ar: e.target.value })}
                  ></textarea>
                </div>

                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'الوصف بالإنجليزية' : 'English Description'}</label>
                  <textarea
                    rows="3"
                    className="form-textarea"
                    value={editingCategory.description_en || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, description_en: e.target.value })}
                  ></textarea>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }}>
                {lang === 'ar' ? 'حفظ التعديلات' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD BRAND */}
      {isAddBrandOpen && (
        <div className="modal-backdrop animate-fade" onClick={() => setIsAddBrandOpen(false)}>
          <div className="modal-container admin-modal glass-panel" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsAddBrandOpen(false)}>
              <X size={20} />
            </button>
            <h3 className="admin-modal-title">
              <Building2 size={20} className="text-orange" />
              {lang === 'ar' ? 'إضافة شركة مصنعة جديدة' : 'Add New Manufacturer Brand'}
            </h3>

            <form onSubmit={handleCreateBrandSubmit} className="admin-form">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'اسم الشركة المصنعة *' : 'Brand Name *'}</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={brandForm.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setBrandForm((prev) => ({
                        ...prev,
                        name: val,
                        slug: prev.slugModified
                          ? prev.slug
                          : val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                      }));
                    }}
                    placeholder={lang === 'ar' ? 'مثال: Creality, Bambu Lab, Anycubic' : 'e.g. Creality, Bambu Lab'}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'المعرّف الرابط (Slug) *' : 'Slug Identifier *'}</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={brandForm.slug}
                    onChange={(e) => setBrandForm({ ...brandForm, slug: e.target.value, slugModified: true })}
                    placeholder="creality"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{lang === 'ar' ? 'رابط شعار الشركة (Logo URL)' : 'Logo Image URL'}</label>
                <input
                  type="url"
                  className="form-input"
                  value={brandForm.logo_url}
                  onChange={(e) => setBrandForm({ ...brandForm, logo_url: e.target.value })}
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div className="form-group">
                <label className="form-label">{lang === 'ar' ? 'نبذة عن الشركة / الوصف' : 'Description / Bio'}</label>
                <textarea
                  rows="3"
                  className="form-textarea"
                  value={brandForm.description}
                  onChange={(e) => setBrandForm({ ...brandForm, description: e.target.value })}
                  placeholder={lang === 'ar' ? 'نبذة مختصرة عن الشركة المصنعة وتخصصها في الطابعات...' : 'Short bio about the brand and printer lines...'}
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }}>
                {lang === 'ar' ? 'حفظ وإضافة الشركة' : 'Save & Publish Brand'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT BRAND */}
      {editingBrand && (
        <div className="modal-backdrop animate-fade" onClick={() => setEditingBrand(null)}>
          <div className="modal-container admin-modal glass-panel" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setEditingBrand(null)}>
              <X size={20} />
            </button>
            <h3 className="admin-modal-title">
              <Edit2 size={20} className="text-orange" />
              {lang === 'ar' ? 'تعديل بيانات الشركة المصنعة' : 'Edit Brand Details'}
            </h3>

            <form onSubmit={handleEditBrandSubmit} className="admin-form">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'اسم الشركة *' : 'Brand Name *'}</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={editingBrand.name}
                    onChange={(e) => setEditingBrand({ ...editingBrand, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'المعرّف الرابط (Slug) *' : 'Slug Identifier *'}</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={editingBrand.slug}
                    onChange={(e) => setEditingBrand({ ...editingBrand, slug: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{lang === 'ar' ? 'رابط الشعار (Logo URL)' : 'Logo Image URL'}</label>
                <input
                  type="url"
                  className="form-input"
                  value={editingBrand.logo_url || ''}
                  onChange={(e) => setEditingBrand({ ...editingBrand, logo_url: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{lang === 'ar' ? 'الوصف' : 'Description'}</label>
                <textarea
                  rows="3"
                  className="form-textarea"
                  value={editingBrand.description || ''}
                  onChange={(e) => setEditingBrand({ ...editingBrand, description: e.target.value })}
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }}>
                {lang === 'ar' ? 'حفظ التعديلات' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD PRINTER MODEL */}
      {isAddPrinterOpen && (
        <div className="modal-backdrop animate-fade" onClick={() => setIsAddPrinterOpen(false)}>
          <div className="modal-container admin-modal glass-panel" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsAddPrinterOpen(false)}>
              <X size={20} />
            </button>
            <h3 className="admin-modal-title">
              <Printer size={20} className="text-orange" />
              {lang === 'ar' ? 'إضافة موديل طابعة جديد' : 'Add New Printer Model'}
            </h3>

            <form onSubmit={handleCreatePrinterSubmit} className="admin-form">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'الشركة المصنعة *' : 'Manufacturer Brand *'}</label>
                  <select
                    required
                    className="form-select"
                    value={printerForm.brand}
                    onChange={(e) => setPrinterForm({ ...printerForm, brand: e.target.value })}
                  >
                    <option value="">{lang === 'ar' ? '-- اختر الشركة --' : '-- Select Brand --'}</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'اسم الموديل *' : 'Printer Model Name *'}</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={printerForm.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPrinterForm((prev) => ({
                        ...prev,
                        name: val,
                        slug: prev.slugModified
                          ? prev.slug
                          : val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                      }));
                    }}
                    placeholder={lang === 'ar' ? 'مثال: Ender 3 V3 KE, K1 Max' : 'e.g. Ender 3 V3, X1-Carbon'}
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'المعرّف الرابط (Slug) *' : 'Slug Identifier *'}</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={printerForm.slug}
                    onChange={(e) => setPrinterForm({ ...printerForm, slug: e.target.value, slugModified: true })}
                    placeholder="creality-ender-3-v3"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'تقنية الطباعة *' : 'Printing Technology *'}</label>
                  <select
                    className="form-select"
                    value={printerForm.technology}
                    onChange={(e) => setPrinterForm({ ...printerForm, technology: e.target.value })}
                  >
                    <option value="FDM">FDM (Filament - خيوط)</option>
                    <option value="SLA">SLA / Resin (ريزن / ليزر)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{lang === 'ar' ? 'رابط صورة الطابعة (اختياري)' : 'Printer Image URL (Optional)'}</label>
                <input
                  type="url"
                  className="form-input"
                  value={printerForm.image_url}
                  onChange={(e) => setPrinterForm({ ...printerForm, image_url: e.target.value })}
                  placeholder="https://example.com/printer.jpg"
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }}>
                {lang === 'ar' ? 'حفظ وإضافة الموديل' : 'Save & Publish Model'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PRINTER MODEL */}
      {editingPrinter && (
        <div className="modal-backdrop animate-fade" onClick={() => setEditingPrinter(null)}>
          <div className="modal-container admin-modal glass-panel" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setEditingPrinter(null)}>
              <X size={20} />
            </button>
            <h3 className="admin-modal-title">
              <Edit2 size={20} className="text-orange" />
              {lang === 'ar' ? 'تعديل بيانات موديل الطابعة' : 'Edit Printer Model'}
            </h3>

            <form onSubmit={handleEditPrinterSubmit} className="admin-form">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'الشركة المصنعة *' : 'Manufacturer Brand *'}</label>
                  <select
                    required
                    className="form-select"
                    value={editingPrinter.brand}
                    onChange={(e) => setEditingPrinter({ ...editingPrinter, brand: e.target.value })}
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'اسم الموديل *' : 'Printer Model Name *'}</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={editingPrinter.name}
                    onChange={(e) => setEditingPrinter({ ...editingPrinter, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'المعرّف الرابط (Slug) *' : 'Slug Identifier *'}</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={editingPrinter.slug}
                    onChange={(e) => setEditingPrinter({ ...editingPrinter, slug: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{lang === 'ar' ? 'تقنية الطباعة *' : 'Printing Technology *'}</label>
                  <select
                    className="form-select"
                    value={editingPrinter.technology || 'FDM'}
                    onChange={(e) => setEditingPrinter({ ...editingPrinter, technology: e.target.value })}
                  >
                    <option value="FDM">FDM (Filament - خيوط)</option>
                    <option value="SLA">SLA / Resin (ريزن / ليزر)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{lang === 'ar' ? 'رابط صورة الطابعة' : 'Printer Image URL'}</label>
                <input
                  type="url"
                  className="form-input"
                  value={editingPrinter.image_url || ''}
                  onChange={(e) => setEditingPrinter({ ...editingPrinter, image_url: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }}>
                {lang === 'ar' ? 'حفظ التعديلات' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD EMPLOYEE */}
      {showAddEmployeeModal && (
        <div className="modal-backdrop animate-fade" onClick={() => setShowAddEmployeeModal(false)}>
          <div className="modal-container admin-modal glass-panel" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowAddEmployeeModal(false)}>
              <X size={20} />
            </button>
            <h3 className="admin-modal-title">
              <UserCheck size={20} style={{ color: '#ec4899' }} />
              {lang === 'ar' ? 'إضافة موظف جديد' : 'Add New Employee'}
            </h3>

            <form onSubmit={handleCreateEmployee} className="admin-form">
              <div className="form-group">
                <label className="form-label">{lang === 'ar' ? 'اسم الموظف *' : 'Employee Name *'}</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={newEmployeeForm.name}
                  onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, name: e.target.value })}
                  placeholder={lang === 'ar' ? 'مثال: محمد علي' : 'e.g. Mohammed Ali'}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{lang === 'ar' ? 'البريد الإلكتروني *' : 'Email Address *'}</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  value={newEmployeeForm.email}
                  onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, email: e.target.value })}
                  placeholder="employee@example.com"
                />
              </div>

              <div className="form-group">
                <label className="form-label">{lang === 'ar' ? 'رقم الهاتف' : 'Phone Number'}</label>
                <input
                  type="text"
                  className="form-input"
                  dir="ltr"
                  value={newEmployeeForm.phone}
                  onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, phone: e.target.value })}
                  placeholder="+964..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">{lang === 'ar' ? 'الدور / الصلاحية' : 'Role'}</label>
                <select
                  className="form-select"
                  value={newEmployeeForm.role_id}
                  onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, role_id: e.target.value })}
                >
                  <option value="">{lang === 'ar' ? '-- اختر الدور --' : '-- Select Role --'}</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>{r.name} ({r.code})</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="btn"
                style={{
                  width: '100%',
                  marginTop: '14px',
                  background: 'linear-gradient(135deg, #ec4899, #d946ef)',
                  color: '#fff',
                  fontWeight: 800
                }}
              >
                {lang === 'ar' ? 'إضافة الموظف' : 'Create Employee'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD ACCOUNT */}
      {showAddAccountModal && (
        <div className="modal-backdrop animate-fade" onClick={() => setShowAddAccountModal(false)}>
          <div className="modal-container admin-modal glass-panel" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowAddAccountModal(false)}>
              <X size={20} />
            </button>
            <h3 className="admin-modal-title">
              <Users size={20} style={{ color: '#3b82f6' }} />
              {lang === 'ar' ? 'إضافة حساب جديد' : 'Add New Account'}
            </h3>

            <form onSubmit={handleCreateAccount} className="admin-form">
              <div className="form-group">
                <label className="form-label">{lang === 'ar' ? 'الاسم *' : 'Name *'}</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={newAccountForm.name}
                  onChange={(e) => setNewAccountForm({ ...newAccountForm, name: e.target.value })}
                  placeholder={lang === 'ar' ? 'مثال: محمد علي' : 'e.g. John Doe'}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{lang === 'ar' ? 'البريد الإلكتروني *' : 'Email Address *'}</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  value={newAccountForm.email}
                  onChange={(e) => setNewAccountForm({ ...newAccountForm, email: e.target.value })}
                  placeholder="user@example.com"
                />
              </div>

              <div className="form-group">
                <label className="form-label">{lang === 'ar' ? 'رقم الهاتف' : 'Phone Number'}</label>
                <input
                  type="text"
                  className="form-input"
                  dir="ltr"
                  value={newAccountForm.phone}
                  onChange={(e) => setNewAccountForm({ ...newAccountForm, phone: e.target.value })}
                  placeholder="+964..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">{lang === 'ar' ? 'الدور' : 'Role'}</label>
                <select
                  className="form-select"
                  value={newAccountForm.role_id}
                  onChange={(e) => setNewAccountForm({ ...newAccountForm, role_id: e.target.value })}
                >
                  <option value="">{lang === 'ar' ? 'بلا دور' : 'No Role'}</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>{r.name} ({r.code})</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                <input
                  type="checkbox"
                  id="acc_is_staff"
                  checked={newAccountForm.is_staff}
                  onChange={(e) => setNewAccountForm({ ...newAccountForm, is_staff: e.target.checked })}
                  style={{ width: 18, height: 18, accentColor: '#3b82f6' }}
                />
                <label htmlFor="acc_is_staff" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>
                  {lang === 'ar' ? 'حساب موظف (Staff Member)' : 'Is Staff Member'}
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '14px', fontWeight: 800 }}
              >
                {lang === 'ar' ? 'إضافة الحساب' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD ROLE */}
      {showAddRoleModal && (
        <div className="modal-backdrop animate-fade" onClick={() => setShowAddRoleModal(false)}>
          <div className="modal-container admin-modal glass-panel" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowAddRoleModal(false)}>
              <X size={20} />
            </button>
            <h3 className="admin-modal-title">
              <ShieldCheck size={20} style={{ color: '#8b5cf6' }} />
              {lang === 'ar' ? 'إضافة دور وصلاحيات' : 'Add Role & Permissions'}
            </h3>

            <form onSubmit={handleCreateRole} className="admin-form">
              <div className="form-group">
                <label className="form-label">{lang === 'ar' ? 'اسم الدور *' : 'Role Name *'}</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={newRoleForm.name}
                  onChange={(e) => setNewRoleForm({ ...newRoleForm, name: e.target.value })}
                  placeholder={lang === 'ar' ? 'مثال: مدير جودة' : 'e.g. Quality Manager'}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{lang === 'ar' ? 'الاسم البرمجي (Code) *' : 'Role Code *'}</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  style={{ textTransform: 'uppercase' }}
                  value={newRoleForm.code}
                  onChange={(e) => setNewRoleForm({ ...newRoleForm, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. QUALITY"
                />
              </div>

              <div className="form-group">
                <label className="form-label">{lang === 'ar' ? 'ملخص الصلاحيات' : 'Permissions Summary'}</label>
                <input
                  type="text"
                  className="form-input"
                  value={newRoleForm.permissions_summary}
                  onChange={(e) => setNewRoleForm({ ...newRoleForm, permissions_summary: e.target.value })}
                  placeholder={lang === 'ar' ? 'مثال: صلاحية 4 أقسام 25 أو كل الصلاحيات' : 'Permissions summary'}
                />
              </div>

              <button
                type="submit"
                className="btn"
                style={{
                  width: '100%',
                  marginTop: '14px',
                  background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                  color: '#fff',
                  fontWeight: 800
                }}
              >
                {lang === 'ar' ? 'إضافة الدور' : 'Create Role'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
