import { useState, useEffect, useRef } from 'react';
import { 
  Package, Plus, Edit, Trash2, Search, X, Loader2, 
  Image, Grid, Download, Upload
} from 'lucide-react';
import { 
  getProducts, getCategories, 
  createProduct, updateProduct, deleteProduct, 
  createCategory, updateCategory, deleteCategory 
} from '../../api/productsApi';
import { uploadFile } from '../../uploadsApi';
import { PageLoading } from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const AdminInventory = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modals state
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); 
  const [submitting, setSubmitting] = useState(false);

  // Product Form State
  const [prodSku, setProdSku] = useState('');
  const [prodTitle, setProdTitle] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodDiscount, setProdDiscount] = useState('');
  const [prodStock, setProdStock] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodModel3d, setProdModel3d] = useState('');
  const [prodImages, setProdImages] = useState(['']); 
  const [prodSpecs, setProdSpecs] = useState([{ key: '', value: '' }]); 

  // Category Form State
  const [catName, setCatName] = useState('');
  const [catImage, setCatImage] = useState('');

  const fileInputRef = useRef(null);
  const [uploadingIndex, setUploadingIndex] = useState(null);

  const openAddProduct = () => {
    setEditingItem(null);
    setProdSku('');
    setProdTitle('');
    setProdCategory(categories[0]?._id || '');
    setProdPrice('');
    setProdDiscount('0');
    setProdStock('10');
    setProdDesc('');
    setProdModel3d('');
    setProdImages(['']);
    setProdSpecs([{ key: '', value: '' }]);
    setProductModalOpen(true);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories()
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch catalog data.');
    } finally {
      setLoading(false);
    }
  };

  // --- PRODUCT FORM ACTIONS ---
  const openEditProduct = (product) => {
    setEditingItem(product);
    setProdSku(product.productId || '');
    setProdTitle(product.title || '');
    setProdCategory(product.category?._id || product.category || '');
    setProdPrice(product.price || '');
    setProdDiscount(product.discount || '0');
    setProdStock(product.stock || '0');
    setProdDesc(product.description || '');
    setProdModel3d(product.model3d || '');
    
    setProdImages(product.images && product.images.length > 0 ? [...product.images] : ['']);
    
    if (product.specifications) {
      const specArray = Object.entries(product.specifications).map(([key, value]) => ({ key, value }));
      setProdSpecs(specArray.length > 0 ? specArray : [{ key: '', value: '' }]);
    } else {
      setProdSpecs([{ key: '', value: '' }]);
    }
    
    setProductModalOpen(true);
  };

  const handleAddImageField = () => {
    if (prodImages.length < 5) {
      setProdImages([...prodImages, '']);
    }
  };

  const handleRemoveImageField = (index) => {
    const updated = prodImages.filter((_, idx) => idx !== index);
    setProdImages(updated.length > 0 ? updated : ['']);
  };

  const handleImageChange = (index, value) => {
    const updated = [...prodImages];
    updated[index] = value;
    setProdImages(updated);
  };

  const handleImageUpload = async (index) => {
    fileInputRef.current.click();
    fileInputRef.current.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploadingIndex(index);
      try {
        const result = await uploadFile(file);
        const updated = [...prodImages];
        updated[index] = result.url || result.path || `/uploads/images/${result.filename}`;
        setProdImages(updated);
      } catch (err) {
        alert('Upload failed: ' + (err.response?.data?.message || err.message));
      } finally {
        setUploadingIndex(null);
        fileInputRef.current.value = '';
      }
    };
  };

  const handleAddSpecField = () => {
    setProdSpecs([...prodSpecs, { key: '', value: '' }]);
  };

  const handleRemoveSpecField = (index) => {
    const updated = prodSpecs.filter((_, idx) => idx !== index);
    setProdSpecs(updated.length > 0 ? updated : [{ key: '', value: '' }]);
  };

  const handleSpecChange = (index, field, value) => {
    const updated = [...prodSpecs];
    updated[index][field] = value;
    setProdSpecs(updated);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);

      const specObject = {};
      prodSpecs.forEach(spec => {
        if (spec.key.trim() && spec.value.trim()) {
          specObject[spec.key.trim()] = spec.value.trim();
        }
      });

      const cleanImages = prodImages.filter(img => img.trim());

      const productPayload = {
        productId: prodSku,
        title: prodTitle,
        description: prodDesc,
        category: prodCategory,
        price: Number(prodPrice),
        discount: Number(prodDiscount || 0),
        stock: Number(prodStock || 0),
        images: cleanImages.length > 0 ? cleanImages : undefined,
        specifications: specObject,
        model3d: prodModel3d
      };

      if (editingItem) {
        const updated = await updateProduct(editingItem._id, productPayload);
        const matchedCategory = categories.find(c => c._id === updated.category);
        updated.category = matchedCategory ? { _id: matchedCategory._id, categoryName: matchedCategory.categoryName } : updated.category;
        setProducts(products.map(p => p._id === editingItem._id ? updated : p));
      } else {
        const created = await createProduct(productPayload);
        const matchedCategory = categories.find(c => c._id === created.category);
        created.category = matchedCategory ? { _id: matchedCategory._id, categoryName: matchedCategory.categoryName } : created.category;
        setProducts([created, ...products]);
      }

      setProductModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product details.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      setError(null);
      await deleteProduct(id);
      setProducts(products.filter(p => p._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product.');
    }
  };

  // --- CATEGORY FORM ACTIONS ---
  const openAddCategory = () => {
    setEditingItem(null);
    setCatName('');
    setCatImage('');
    setCategoryModalOpen(true);
  };

  const openEditCategory = (category) => {
    setEditingItem(category);
    setCatName(category.categoryName || '');
    setCatImage(category.categoryImage || '');
    setCategoryModalOpen(true);
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);

      const categoryPayload = {
        categoryName: catName,
        categoryImage: catImage
      };

      if (editingItem) {
        const updated = await updateCategory(editingItem._id, categoryPayload);
        setCategories(categories.map(c => c._id === editingItem._id ? updated : c));
      } else {
        const created = await createCategory(categoryPayload);
        setCategories([...categories, created]);
      }

      setCategoryModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save category.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Deleting a category does not automatically delete its products. Continue?')) return;
    try {
      setError(null);
      await deleteCategory(id);
      setCategories(categories.filter(c => c._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete category.');
    }
  };

  // --- FILTERS ---
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.productId.toLowerCase().includes(searchQuery.toLowerCase());
    const categoryId = p.category?._id || p.category || '';
    const matchesCategory = !categoryFilter || categoryId === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) return <PageLoading />;

  // Calculate top counters
  const totalSKUs = products.length;
  const availableItems = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStockAlerts = products.filter(p => p.stock <= 5 && p.stock > 0).length;
  const restockNeeded = products.filter(p => p.stock === 0).length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title & Top Navigation Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Inventory Management</h1>
          <p className="text-sm text-slate-500 mt-1">Track parts, device screens, stock levels, and accessories.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-semibold shadow-sm transition-all">
            <Download size={16} />
            <span>Export CSV</span>
          </button>
          <button 
            onClick={openAddProduct}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
          >
            <Plus size={16} />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Top Counters Grid (Screenshot 2) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total SKUs</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{totalSKUs}</h3>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
            +4%
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Available Items</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{availableItems}</h3>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
            In Stock
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Low Stock Alerts</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{lowStockAlerts}</h3>
          </div>
          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-md border border-rose-100">
            Urgent
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Restock Needed</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{restockNeeded}</h3>
          </div>
          <span className="text-[10px] font-bold text-slate-600 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
            Out of Stock
          </span>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchData} />}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3.5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'products'
              ? 'border-indigo-600 text-slate-900 font-extrabold'
              : 'border-transparent text-slate-400 hover:text-indigo-600'
          }`}
        >
          <div className="flex items-center gap-2">
            <Package size={16} />
            <span>Inventory Items ({products.length})</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`pb-3.5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'categories'
              ? 'border-indigo-600 text-slate-900 font-extrabold'
              : 'border-transparent text-slate-400 hover:text-indigo-600'
          }`}
        >
          <div className="flex items-center gap-2">
            <Grid size={16} />
            <span>Categories ({categories.length})</span>
          </div>
        </button>
      </div>

      {/* PRODUCTS TAB CONTENT */}
      {activeTab === 'products' && (
        <div className="space-y-8">
          
          {/* Main Grid: Left is Table & Trends, Right is Alerts & Circles */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left 2 Columns */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Filter bar */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="relative w-full sm:w-80">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search inventory items..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs font-semibold text-slate-400">Category:</span>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full sm:w-48 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.categoryName}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Items Table */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-16">
                    <Package size={40} className="mx-auto text-slate-300 mb-3" />
                    <h3 className="text-lg font-bold text-slate-900">No Products Found</h3>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">Add items to view them in the list.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                          <th className="px-6 py-4">Item Name</th>
                          <th className="px-6 py-4">SKU</th>
                          <th className="px-6 py-4">Category</th>
                          <th className="px-6 py-4">Stock Level</th>
                          <th className="px-6 py-4">Price</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredProducts.map(p => {
                          const stockPct = Math.min(Math.max(Math.round((p.stock / 100) * 100), 0), 100);
                          const isLow = p.stock <= 5 && p.stock > 0;
                          const isCritical = p.stock === 0;
                          
                          return (
                            <tr key={p._id} className="hover:bg-slate-50/20 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                                    {p.images && p.images[0] ? (
                                      <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      <Image size={18} className="text-slate-400" />
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-bold text-sm text-slate-950 leading-tight">{p.title}</div>
                                    <div className="text-[10px] text-slate-400 line-clamp-1 max-w-[180px] mt-0.5">
                                      {Object.entries(p.specifications || {}).map(([k, v]) => `${k}: ${v}`).join(', ') || p.description}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-xs font-bold font-mono text-slate-500">{p.productId}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-xs font-semibold bg-indigo-50/50 text-indigo-600 border border-indigo-100/50 px-2.5 py-0.5 rounded-full">
                                  {p.category?.categoryName || 'Parts'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="space-y-1 w-32">
                                  <div className="flex justify-between items-center text-[10px] font-bold">
                                    <span className="text-slate-500">{p.stock} / 100</span>
                                    <span className={isCritical ? 'text-rose-600 font-extrabold' : isLow ? 'text-amber-500' : 'text-slate-400'}>
                                      {isCritical ? 'Critical' : isLow ? 'Low' : `${stockPct}%`}
                                    </span>
                                  </div>
                                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full transition-all ${
                                        isCritical ? 'bg-rose-600' : 
                                        isLow ? 'bg-amber-500' : 'bg-emerald-500'
                                      }`}
                                      style={{ width: `${isCritical ? 8 : stockPct}%` }}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap font-bold text-sm text-slate-800">
                                ₹{p.price.toLocaleString('en-IN')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button 
                                    onClick={() => openEditProduct(p)}
                                    className="p-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                                  >
                                    <Edit size={14} />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteProduct(p._id)}
                                    className="p-1.5 rounded-lg border border-slate-200 hover:border-red-200 text-slate-500 hover:text-red-600 hover:bg-red-50/30 transition-colors cursor-pointer"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Bottom Stock Trends Line Chart (Screenshot 5) */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">Stock Trends (Last 30 Days)</h3>
                    <p className="text-xs text-slate-400">Inventory levels tracking across major product segments.</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" />Phones</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />Laptops</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />Parts</span>
                  </div>
                </div>

                {/* Pure SVG Line Chart */}
                <div className="relative h-60 w-full border-b border-slate-100 mt-4">
                  <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                    {/* Grid Lines */}
                    <line x1="0" y1="50" x2="500" y2="50" stroke="#f1f5f9" strokeDasharray="4 4" />
                    <line x1="0" y1="100" x2="500" y2="100" stroke="#f1f5f9" strokeDasharray="4 4" />
                    <line x1="0" y1="150" x2="500" y2="150" stroke="#f1f5f9" strokeDasharray="4 4" />

                    {/* Phones Path (Blue) */}
                    <path 
                      d="M 0,160 Q 80,120 150,140 T 300,160 T 450,110 T 500,135" 
                      fill="none" 
                      stroke="#3b82f6" 
                      strokeWidth="3" 
                      strokeLinecap="round"
                    />

                    {/* Laptops Path (Indigo) */}
                    <path 
                      d="M 0,130 Q 100,150 200,100 T 350,140 T 500,80" 
                      fill="none" 
                      stroke="#6366f1" 
                      strokeWidth="3" 
                      strokeLinecap="round"
                    />

                    {/* Parts Path (Emerald) */}
                    <path 
                      d="M 0,145 Q 120,130 250,165 T 400,60 T 500,90" 
                      fill="none" 
                      stroke="#10b981" 
                      strokeWidth="3" 
                      strokeLinecap="round"
                    />
                  </svg>
                  
                  {/* Chart X Labels */}
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold mt-2 px-1">
                    <span>Oct 01</span>
                    <span>Oct 10</span>
                    <span>Oct 20</span>
                    <span>Oct 30</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-100 flex-wrap gap-4">
                  <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                    <span>Overall stock stability: +12.4%</span>
                  </div>
                  <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                    Download Report
                  </button>
                </div>
              </div>

            </div>

            {/* Right 1 Column Widgets */}
            <div className="space-y-8">
              
              {/* Low Stock Alerts */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-900">Low Stock Alerts</h3>
                  <span className="bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-100">
                    {lowStockAlerts} Action Items
                  </span>
                </div>

                <div className="space-y-4">
                  {products.filter(p => p.stock <= 5).slice(0, 4).map((p, idx) => (
                    <div key={p._id || idx} className="flex justify-between items-center p-3.5 bg-slate-50/50 hover:bg-slate-50 transition-colors rounded-xl border border-slate-100">
                      <div>
                        <p className="text-sm font-bold text-slate-800">{p.title}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">{p.stock} units remaining (Min: 5)</p>
                      </div>
                      <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg border border-rose-100 shrink-0">
                        {p.stock === 0 ? 'Out' : `${p.stock} Left`}
                      </span>
                    </div>
                  ))}
                  {products.filter(p => p.stock <= 5).length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-4 font-medium">All items are sufficiently stocked.</p>
                  )}
                </div>

                <button className="w-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors py-2.5 rounded-xl text-xs font-bold text-center">
                  View All Critical Alerts
                </button>
              </div>

              {/* Categories Circles/Card Grid */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-900">Categories</h3>
                  <button 
                    onClick={openAddCategory}
                    className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors cursor-pointer"
                    title="Add Category"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {categories.map(cat => {
                    const catCount = products.filter(p => (p.category?._id || p.category) === cat._id).length;
                    
                    return (
                      <div key={cat._id} className="p-4 bg-indigo-50/30 border border-indigo-100/20 hover:border-indigo-100 transition-all rounded-2xl text-left relative overflow-hidden flex flex-col justify-between min-h-[90px]">
                        <span className="text-lg font-bold text-indigo-700">{catCount}</span>
                        <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block mt-2">{cat.categoryName}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* CATEGORIES TAB CONTENT */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-slate-100">
              <Grid size={40} className="mx-auto text-slate-300 mb-3" />
              <h3 className="text-lg font-bold text-slate-900">No Categories Found</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">Create a new category using the button above.</p>
            </div>
          ) : (
            categories.map(cat => (
              <div key={cat._id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-soft transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 overflow-hidden border border-slate-100 flex items-center justify-center shrink-0">
                    {cat.categoryImage ? (
                      <img src={cat.categoryImage} alt={cat.categoryName} className="w-full h-full object-cover" />
                    ) : (
                      <Grid size={24} className="text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 leading-tight">{cat.categoryName}</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {products.filter(p => (p.category?._id || p.category) === cat._id).length} products
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => openEditCategory(cat)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <Edit size={12} /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat._id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50/20 transition-colors cursor-pointer"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}


      {/* --- ADD/EDIT PRODUCT MODAL --- */}
      {productModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-slate-100 flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-slate-900">
                {editingItem ? 'Edit Product Details' : 'Create New Product'}
              </h2>
              <button onClick={() => setProductModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="p-6 space-y-6 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">SKU / Product ID</label>
                  <input
                    type="text"
                    required
                    value={prodSku}
                    onChange={(e) => setProdSku(e.target.value)}
                    placeholder="e.g. IP16P-256-NT"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Product Title</label>
                  <input
                    type="text"
                    required
                    value={prodTitle}
                    onChange={(e) => setProdTitle(e.target.value)}
                    placeholder="e.g. iPhone 16 Pro Max"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                  <select
                    required
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 cursor-pointer"
                  >
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.categoryName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    placeholder="e.g. 1499"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Discount (%)</label>
                  <input
                    type="number"
                    value={prodDiscount}
                    onChange={(e) => setProdDiscount(e.target.value)}
                    placeholder="e.g. 10"
                    min="0"
                    max="99"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Stock Level</label>
                  <input
                    type="number"
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    placeholder="e.g. 5"
                    min="0"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  required
                  rows="3"
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  placeholder="Provide product details, specs, etc..."
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">3D Model Link (GLB / GLTF - Optional)</label>
                <input
                  type="text"
                  value={prodModel3d}
                  onChange={(e) => setProdModel3d(e.target.value)}
                  placeholder="e.g. https://example.com/models/iphone.glb"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Product Image URLs (Up to 5)</label>
                  {prodImages.length < 5 && (
                    <button
                      type="button"
                      onClick={handleAddImageField}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={12} /> Add Image Field
                    </button>
                  )}
                </div>
                {prodImages.map((imgUrl, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={imgUrl}
                      onChange={(e) => handleImageChange(index, e.target.value)}
                      placeholder="e.g. https://images.unsplash.com/photo-..."
                      className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"
                    />
                    <button
                      type="button"
                      onClick={() => handleImageUpload(index)}
                      disabled={uploadingIndex === index}
                      className="p-2 text-slate-400 hover:text-indigo-600 disabled:opacity-40 cursor-pointer"
                      title="Upload image"
                    >
                      {uploadingIndex === index ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    </button>
                    <button
                      type="button"
                      disabled={prodImages.length === 1}
                      onClick={() => handleRemoveImageField(index)}
                      className="p-2 text-slate-400 hover:text-red-500 disabled:opacity-30 cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Specifications (Key-Value)</label>
                  <button
                    type="button"
                    onClick={handleAddSpecField}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={12} /> Add Row
                  </button>
                </div>
                {prodSpecs.map((spec, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={spec.key}
                      onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                      placeholder="Spec Key (e.g. Storage)"
                      className="w-1/2 px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"
                    />
                    <input
                      type="text"
                      value={spec.value}
                      onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                      placeholder="Spec Value (e.g. 256GB)"
                      className="w-1/2 px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"
                    />
                    <button
                      type="button"
                      disabled={prodSpecs.length === 1}
                      onClick={() => handleRemoveSpecField(index)}
                      className="p-2 text-slate-400 hover:text-red-500 disabled:opacity-30 cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2 sticky bottom-0 bg-white z-10 py-2">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-55"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  <span>{editingItem ? 'Save Changes' : 'Create Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* --- ADD/EDIT CATEGORY MODAL --- */}
      {categoryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-xl border border-slate-100 flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">
                {editingItem ? 'Edit Category' : 'Create New Category'}
              </h2>
              <button onClick={() => setCategoryModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCategorySubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Category Name</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Phones, Accessories"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Category Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={catImage}
                    onChange={(e) => setCatImage(e.target.value)}
                    placeholder="e.g. https://images.unsplash.com/photo-..."
                    className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const inp = document.createElement('input');
                      inp.type = 'file';
                      inp.accept = 'image/*';
                      inp.onchange = async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const result = await uploadFile(file);
                          setCatImage(result.url || result.path || `/uploads/images/${result.filename}`);
                        } catch (err) {
                          alert('Upload failed: ' + (err.response?.data?.message || err.message));
                        }
                      };
                      inp.click();
                    }}
                    className="p-2 text-slate-400 hover:text-indigo-600 cursor-pointer"
                    title="Upload image"
                  >
                    <Upload size={16} />
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-55"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  <span>{editingItem ? 'Save Changes' : 'Create Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventory;
