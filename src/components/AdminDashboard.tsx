import { useEffect, useState } from 'react';
import { X, Plus, Pencil, Trash2, TrendingUp, ShoppingBag, Receipt as ReceiptIcon, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { MenuItem, Order, OrderType, PaymentMethod } from '@/types';
import { CATEGORY_KEYS } from '@/types';
import { useLanguage } from '@/i18n/useLanguage';
import { CATEGORY_TRANSLATIONS, type CategoryKey } from '@/i18n/translations';

interface AdminDashboardProps {
  open: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  onMenuChanged: () => void;
}

type Tab = 'summary' | 'menu' | 'history';

export function AdminDashboard({ open, onClose, menuItems, onMenuChanged }: AdminDashboardProps) {
  const { t, lang, formatPrice, formatTime, formatDate } = useLanguage();
  const [tab, setTab] = useState<Tab>('summary');
  const [todayOrders, setTodayOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  // Menu form state
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'برجر' as string,
    price: '',
    image_url: '',
    description: '',
  });
  const [saving, setSaving] = useState(false);

  const catTr = CATEGORY_TRANSLATIONS[lang];

  const orderTypeLabel: Record<OrderType, string> = {
    dine_in: t.dineIn,
    takeaway: t.takeaway,
    delivery: t.delivery,
  };

  const paymentLabel: Record<PaymentMethod, string> = {
    cash: t.cash,
    card: t.card,
  };

  useEffect(() => {
    if (open) {
      fetchOrders();
    }
  }, [open]);

  const fetchOrders = async () => {
    setLoading(true);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [todayRes, allRes] = await Promise.all([
      supabase.from('orders').select('*').gte('created_at', today.toISOString()).order('created_at', { ascending: false }),
      supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(50),
    ]);
    if (todayRes.data) setTodayOrders(todayRes.data as Order[]);
    if (allRes.data) setAllOrders(allRes.data as Order[]);
    setLoading(false);
  };

  const todayTotal = todayOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const todayItems = todayOrders.reduce((sum, o) => sum + o.items.length, 0);

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      price: String(item.price),
      image_url: item.image_url ?? '',
      description: item.description ?? '',
    });
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setFormData({ name: '', category: 'برجر', price: '', image_url: '', description: '' });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price) return;
    setSaving(true);
    const payload = {
      name: formData.name,
      category: formData.category,
      price: Number(formData.price),
      image_url: formData.image_url || null,
      description: formData.description || null,
      available: true,
    };
    if (editingItem) {
      await supabase.from('menu_items').update(payload).eq('id', editingItem.id);
    } else {
      await supabase.from('menu_items').insert(payload);
    }
    setSaving(false);
    setShowForm(false);
    onMenuChanged();
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.deleteConfirm)) return;
    await supabase.from('menu_items').delete().eq('id', id);
    onMenuChanged();
  };

  const handleToggleAvailable = async (item: MenuItem) => {
    await supabase.from('menu_items').update({ available: !item.available }).eq('id', item.id);
    onMenuChanged();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative flex w-full max-w-4xl flex-col bg-slate-50 dark:bg-slate-900 shadow-2xl overflow-hidden animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t.dashboard}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 py-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          {([
            { id: 'summary' as const, label: t.todaySummary, icon: TrendingUp },
            { id: 'menu' as const, label: t.menuManagement, icon: ShoppingBag },
            { id: 'history' as const, label: t.orderHistory, icon: ReceiptIcon },
          ]).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                tab === id
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && tab !== 'menu' ? (
            <div className="flex h-full items-center justify-center text-slate-400">
              <p className="text-sm">{t.loading}</p>
            </div>
          ) : tab === 'summary' ? (
            <div className="space-y-6">
              {/* Stat cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-5 text-white shadow-lg">
                  <TrendingUp className="h-6 w-6 mb-2 opacity-80" />
                  <p className="text-xs opacity-80 mb-1">{t.todaySales}</p>
                  <p className="text-2xl font-bold">{formatPrice(todayTotal)}</p>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-5 text-white shadow-lg">
                  <ReceiptIcon className="h-6 w-6 mb-2 opacity-80" />
                  <p className="text-xs opacity-80 mb-1">{t.orderCount}</p>
                  <p className="text-2xl font-bold">{todayOrders.length}</p>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 p-5 text-white shadow-lg">
                  <ShoppingBag className="h-6 w-6 mb-2 opacity-80" />
                  <p className="text-xs opacity-80 mb-1">{t.itemsSold}</p>
                  <p className="text-2xl font-bold">{todayItems}</p>
                </div>
              </div>

              {/* Today's orders */}
              <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-700">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{t.todayOrders}</h3>
                </div>
                {todayOrders.length === 0 ? (
                  <div className="px-5 py-12 text-center text-sm text-slate-400">
                    {t.noOrdersToday}
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {todayOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                            #{order.order_number}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                              {orderTypeLabel[order.order_type]} · {paymentLabel[order.payment_method]}
                            </p>
                            <p className="text-xs text-slate-400 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTime(order.created_at)}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          {formatPrice(Number(order.total))}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : tab === 'menu' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {t.menuItems(menuItems.length)}
                </h3>
                <button
                  onClick={handleAddNew}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 text-sm font-medium transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  {t.addItem}
                </button>
              </div>

              {showForm && (
                <div className="rounded-2xl bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-500/30 p-5 space-y-3">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {editingItem ? t.editItem : t.newItem}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">{t.name}</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                        placeholder={t.namePlaceholder}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">{t.category}</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                      >
                        {CATEGORY_KEYS.map((cat) => (
                          <option key={cat} value={cat}>{catTr[cat as CategoryKey]}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">{t.priceLabel}</label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">{t.imageUrl}</label>
                      <input
                        type="text"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">{t.description}</label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                      placeholder={t.descPlaceholder}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      disabled={saving || !formData.name || !formData.price}
                      className="rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white px-4 py-2 text-sm font-medium transition-colors"
                    >
                      {saving ? t.saving : t.save}
                    </button>
                    <button
                      onClick={() => setShowForm(false)}
                      className="rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-4 py-2 text-sm font-medium transition-colors"
                    >
                      {t.cancel}
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {menuItems.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 ${
                      !item.available ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-700">
                      {item.image_url && (
                        <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{item.name}</p>
                      <p className="text-xs text-slate-400">{catTr[item.category as CategoryKey]} · {formatPrice(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleAvailable(item)}
                        className={`rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
                          item.available
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                        }`}
                      >
                        {item.available ? t.available : t.hidden}
                      </button>
                      <button
                        onClick={() => handleEdit(item)}
                        className="rounded-lg p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{t.orderHistory} ({allOrders.length})</h3>
              {allOrders.length === 0 ? (
                <div className="text-center py-12 text-sm text-slate-400">{t.noOrdersHistory}</div>
              ) : (
                <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {allOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                            #{order.order_number}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                              {orderTypeLabel[order.order_type]} · {paymentLabel[order.payment_method]}
                            </p>
                            <p className="text-xs text-slate-400">
                              {formatDate(order.created_at)} · {t.itemsCount(order.items.length)}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          {formatPrice(Number(order.total))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
