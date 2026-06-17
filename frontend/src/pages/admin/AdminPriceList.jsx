import { useState, useEffect } from 'react';
import { Search, Save, RefreshCw, Percent, Package, Loader2, CheckCircle, Tags } from 'lucide-react';
import { getPriceList, bulkUpdatePrices } from '../../api/priceListApi';
import { PageLoading } from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { useToast } from '../../contexts/ToastContext';

const AdminPriceList = () => {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [edits, setEdits] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [selected, setSelected] = useState({});
  const [bulkPriceType, setBulkPriceType] = useState('set');
  const [bulkPriceVal, setBulkPriceVal] = useState('');
  const [bulkDiscount, setBulkDiscount] = useState('');

  const handleEdit = (id, field, value) => {
    setEdits(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value, _changed: true }
    }));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPriceList();
      setProducts(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    const next = !selectAll;
    setSelectAll(next);
    const sel = {};
    if (next) products.forEach(p => { sel[p._id || p.id] = true; });
    setSelected(sel);
  };

  const handleSelect = (id) => {
    setSelected(prev => ({ ...prev, [id]: !prev[id] }));
    setSelectAll(false);
  };

  const handleBulkApply = async () => {
    const selectedIds = Object.entries(selected).filter(([, v]) => v).map(([k]) => k);
    if (selectedIds.length === 0) {
      showToast('Select products first');
      return;
    }
    try {
      setSaving(true);
      const updates = selectedIds.map(id => {
        const upd = {};
        if (bulkPriceVal) {
          if (bulkPriceType === 'set') upd.price = Number(bulkPriceVal);
          else {
            const p = products.find(x => (x._id || x.id) === id);
            if (p) upd.price = p.price + (p.price * Number(bulkPriceVal) / 100);
          }
        }
        if (bulkDiscount) upd.discount = Number(bulkDiscount);
        upd.id = id;
        return upd;
      });
      await bulkUpdatePrices(updates);
      showToast(`Updated ${updates.length} products`);
      setSelected({});
      setSelectAll(false);
      setBulkPriceVal('');
      setBulkDiscount('');
      setEdits({});
      await fetchProducts();
    } catch (err) {
      showToast('Failed to update prices');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSingle = async (id) => {
    const edit = edits[id];
    if (!edit) return;
    try {
      setSaving(true);
      await bulkUpdatePrices([{ id, price: edit.price, discount: edit.discount, stock: edit.stock }]);
      showToast('Product updated');
      setEdits(prev => { const n = { ...prev }; delete n[id]; return n; });
      await fetchProducts();
    } catch (err) {
      showToast('Update failed');
    } finally {
      setSaving(false);
    }
  };

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    return p.title?.toLowerCase().includes(q) || p.productId?.toLowerCase().includes(q);
  });

  if (loading) return <PageLoading />;
  if (error) return <ErrorMessage message={error} onRetry={fetchProducts} />;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Tags size={28} className="text-indigo-600" /> Product Price List
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage product prices, discounts, and stock.</p>
        </div>
        <button onClick={fetchProducts} className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl text-xs font-bold transition-all">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 bg-indigo-50/30">
          <h2 className="text-sm font-bold text-indigo-800 mb-3 flex items-center gap-2">
            <Tags size={16} /> One-Click Operate
          </h2>
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Action</label>
              <select value={bulkPriceType} onChange={(e) => setBulkPriceType(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-400">
                <option value="set">Set Price</option>
                <option value="percent">Add %</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Value</label>
              <input type="number" value={bulkPriceVal} onChange={(e) => setBulkPriceVal(e.target.value)} placeholder={bulkPriceType === 'set' ? 'New price' : 'Percentage'} className="w-24 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-400" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Discount %</label>
              <input type="number" value={bulkDiscount} onChange={(e) => setBulkDiscount(e.target.value)} placeholder="Discount %" className="w-20 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-400" />
            </div>
            <button onClick={handleBulkApply} disabled={saving} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Apply to Selected
            </button>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500" />
          </div>
          <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
            <input type="checkbox" checked={selectAll} onChange={handleSelectAll} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
            Select All
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="px-4 py-3 w-10"></th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3 text-right">Price (₹)</th>
                <th className="px-4 py-3 text-right">Discount %</th>
                <th className="px-4 py-3 text-right">Stock</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filtered.map((p) => {
                const id = p._id || p.id;
                const edit = edits[id] || {};
                const currentPrice = edit.price !== undefined ? edit.price : p.price;
                const currentDiscount = edit.discount !== undefined ? edit.discount : p.discount;
                const currentStock = edit.stock !== undefined ? edit.stock : p.stock;
                const isSelected = selected[id];
                return (
                  <tr key={id} className={`hover:bg-slate-50/50 transition-colors ${isSelected ? 'bg-indigo-50/30' : ''}`}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={!!isSelected} onChange={() => handleSelect(id)} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-sm overflow-hidden">
                          {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<svg class=\"w-[14px] h-[14px] text-slate-400\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4\"/></svg>'; }} /> : <Package size={14} className="text-slate-400" />}
                        </div>
                        <span className="font-semibold text-slate-900">{p.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{p.productId}</td>
                    <td className="px-4 py-3 text-right">
                      <input type="number" value={currentPrice} onChange={(e) => handleEdit(id, 'price', Number(e.target.value))} className="w-20 px-2 py-1 border border-slate-200 rounded-lg text-xs text-right focus:outline-none focus:border-indigo-400" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <input type="number" value={currentDiscount} onChange={(e) => handleEdit(id, 'discount', Number(e.target.value))} className="w-14 px-2 py-1 border border-slate-200 rounded-lg text-xs text-right focus:outline-none focus:border-indigo-400" />
                        <Percent size={12} className="text-slate-400" />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <input type="number" value={currentStock} onChange={(e) => handleEdit(id, 'stock', Number(e.target.value))} className="w-16 px-2 py-1 border border-slate-200 rounded-lg text-xs text-right focus:outline-none focus:border-indigo-400" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {edits[id]?._changed && (
                        <button onClick={() => handleSaveSingle(id)} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 ml-auto">
                          <CheckCircle size={12} /> Save
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-slate-400 text-sm font-medium">No products found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPriceList;
