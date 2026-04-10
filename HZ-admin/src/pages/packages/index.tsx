import withAdminLayout from '@/src/common/AdminLayout';
import { useEffect, useState } from 'react';
import apiClient from '@/src/utils/apiClient';
import toast from 'react-hot-toast';
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Save,
  X,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

interface InteriorPackage {
  id: string;
  name: string;
  price: string;
  suffix: string;
  color: string;
  features: string[];
  highlighted: boolean;
  sortOrder: number;
  isActive: boolean;
  bhkType: string | null;
}

const EMPTY_PKG: Omit<InteriorPackage, 'id'> = {
  name: '',
  price: '',
  suffix: 'onwards',
  color: '#2f80ed',
  features: [''],
  highlighted: false,
  sortOrder: 99,
  isActive: true,
  bhkType: null,
};

const COLOR_PRESETS = [
  { label: 'Navy', value: '#0f2a44' },
  { label: 'Blue', value: '#2f80ed' },
  { label: 'Accent', value: '#f2994a' },
  { label: 'Gray', value: '#5a6a7e' },
  { label: 'Green', value: '#16a34a' },
  { label: 'Purple', value: '#7c3aed' },
];

function PackagesCMS() {
  const [packages, setPackages] = useState<InteriorPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<InteriorPackage | null>(null);
  const [form, setForm] = useState<Omit<InteriorPackage, 'id'>>(EMPTY_PKG);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(apiClient.URLS.interior_packages, {}, true);
      const data = Array.isArray(res.body) ? res.body : [];
      setPackages(
        data.sort(
          (a: InteriorPackage, b: InteriorPackage) => a.sortOrder - b.sortOrder,
        ),
      );
    } catch {
      toast.error('Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const openCreate = () => {
    setForm({ ...EMPTY_PKG, sortOrder: packages.length });
    setEditing(null);
    setModal('create');
  };

  const openEdit = (pkg: InteriorPackage) => {
    setForm({
      name: pkg.name,
      price: pkg.price,
      suffix: pkg.suffix,
      color: pkg.color,
      features: [...pkg.features],
      highlighted: pkg.highlighted,
      sortOrder: pkg.sortOrder,
      isActive: pkg.isActive,
      bhkType: pkg.bhkType,
    });
    setEditing(pkg);
    setModal('edit');
  };

  const closeModal = () => {
    setModal(null);
    setEditing(null);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price.trim()) {
      toast.error('Name and price are required');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, features: form.features.filter((f) => f.trim()) };
      if (modal === 'create') {
        await apiClient.post(apiClient.URLS.interior_packages, payload, true);
        toast.success('Package created');
      } else if (editing) {
        await apiClient.put(
          `${apiClient.URLS.interior_packages}/${editing.id}`,
          payload,
          true,
        );
        toast.success('Package updated');
      }
      closeModal();
      fetchPackages();
    } catch {
      toast.error('Failed to save package');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`${apiClient.URLS.interior_packages}/${id}`, {}, true);
      toast.success('Package deleted');
      setDeleteConfirm(null);
      fetchPackages();
    } catch {
      toast.error('Failed to delete package');
    }
  };

  const toggleActive = async (pkg: InteriorPackage) => {
    try {
      await apiClient.put(
        `${apiClient.URLS.interior_packages}/${pkg.id}`,
        { isActive: !pkg.isActive },
        true,
      );
      toast.success(
        pkg.isActive ? 'Package hidden from website' : 'Package visible on website',
      );
      fetchPackages();
    } catch {
      toast.error('Failed to update visibility');
    }
  };

  const toggleHighlighted = async (pkg: InteriorPackage) => {
    try {
      await apiClient.put(
        `${apiClient.URLS.interior_packages}/${pkg.id}`,
        { highlighted: !pkg.highlighted },
        true,
      );
      toast.success(
        pkg.highlighted ? 'Removed Most Popular badge' : 'Set as Most Popular',
      );
      fetchPackages();
    } catch {
      toast.error('Failed to update');
    }
  };

  const moveOrder = async (pkg: InteriorPackage, dir: 'up' | 'down') => {
    const idx = packages.findIndex((p) => p.id === pkg.id);
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= packages.length) return;
    const swap = packages[swapIdx];
    try {
      await Promise.all([
        apiClient.put(
          `${apiClient.URLS.interior_packages}/${pkg.id}`,
          { sortOrder: swap.sortOrder },
          true,
        ),
        apiClient.put(
          `${apiClient.URLS.interior_packages}/${swap.id}`,
          { sortOrder: pkg.sortOrder },
          true,
        ),
      ]);
      fetchPackages();
    } catch {
      toast.error('Failed to reorder');
    }
  };

  const setFeature = (i: number, val: string) => {
    const f = [...form.features];
    f[i] = val;
    setForm((prev) => ({ ...prev, features: f }));
  };

  const addFeature = () =>
    setForm((prev) => ({ ...prev, features: [...prev.features, ''] }));

  const removeFeature = (i: number) =>
    setForm((prev) => ({
      ...prev,
      features: prev.features.filter((_, fi) => fi !== i),
    }));

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[20px] font-extrabold text-[#0f2a44] tracking-tight">
            Interior Packages
          </h1>
          <p className="text-[12px] text-[#8c959f] mt-0.5">
            Manage packages shown on website Interiors &amp; Pricing pages
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-[8px]
                     bg-[#2f80ed] hover:bg-[#1a6dd6] text-white text-[13px]
                     font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> New Package
        </button>
      </div>

      <div
        className="bg-[#eaf1fd] border border-[#c8dcf8] rounded-[10px] px-4 py-3 mb-5
                      flex items-start gap-3 text-[12.5px] text-[#1e40af]"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="flex-shrink-0 mt-0.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        >
          <circle cx="8" cy="8" r="6.5" />
          <path d="M8 6v4M8 10.5v.5" />
        </svg>
        <span>
          Changes here reflect <strong>live on the website</strong> within seconds.
          Use the eye icon to hide a package without deleting it. The{' '}
          <strong>Most Popular</strong> badge can only appear on one package at a
          time.
        </span>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-40">
          <div className="w-7 h-7 border-2 border-[#2f80ed] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && (
        <div className="space-y-3">
          {packages.length === 0 && (
            <div className="text-center py-16 bg-white rounded-[12px] border border-[#e2eaf4]">
              <p className="text-[14px] text-[#8c959f]">
                No packages yet. Click <strong>New Package</strong> to create the
                first one.
              </p>
            </div>
          )}

          {packages.map((pkg, idx) => (
            <div
              key={pkg.id}
              className={`bg-white rounded-[12px] border transition-all
                         ${pkg.isActive ? 'border-[#e2eaf4]' : 'border-[#e2eaf4] opacity-60'}
                         hover:border-[#c8dcf8] hover:shadow-sm`}
            >
              <div className="flex items-center gap-4 px-5 py-4">
                <div className="flex flex-col gap-0.5 flex-shrink-0">
                  <button
                    onClick={() => moveOrder(pkg, 'up')}
                    disabled={idx === 0}
                    className="p-0.5 rounded hover:bg-[#f0f4f9] disabled:opacity-20 transition-colors"
                  >
                    <ChevronUp className="w-3.5 h-3.5 text-[#8c959f]" />
                  </button>
                  <button
                    onClick={() => moveOrder(pkg, 'down')}
                    disabled={idx === packages.length - 1}
                    className="p-0.5 rounded hover:bg-[#f0f4f9] disabled:opacity-20 transition-colors"
                  >
                    <ChevronDown className="w-3.5 h-3.5 text-[#8c959f]" />
                  </button>
                </div>

                <div
                  className="w-3 h-12 rounded-full flex-shrink-0"
                  style={{ background: pkg.color }}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[14px] font-bold text-[#0f2a44]">
                      {pkg.name}
                    </span>
                    {pkg.highlighted && (
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                        style={{ background: '#f2994a' }}
                      >
                        Most Popular
                      </span>
                    )}
                    {!pkg.isActive && (
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full
                                       bg-[#f1f5f9] text-[#8c959f]"
                      >
                        Hidden
                      </span>
                    )}
                  </div>
                  <p className="text-[15px] font-black text-[#0f2a44]">
                    {pkg.price}
                    <span className="text-[12px] font-medium text-[#8c959f] ml-1">
                      {pkg.suffix}
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {pkg.features.slice(0, 4).map((f, fi) => (
                      <span
                        key={`${pkg.id}-${fi}`}
                        className="text-[11px] px-2 py-0.5 rounded-full bg-[#f0f4f9] text-[#526070]"
                      >
                        {f}
                      </span>
                    ))}
                    {pkg.features.length > 4 && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#f0f4f9] text-[#8c959f]">
                        +{pkg.features.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleActive(pkg)}
                    title={pkg.isActive ? 'Hide on website' : 'Show on website'}
                    className="w-8 h-8 rounded-[7px] border border-[#e2eaf4] bg-white
                               flex items-center justify-center text-[#8c959f]
                               hover:border-[#2f80ed] hover:text-[#2f80ed] transition-all"
                  >
                    {pkg.isActive ? (
                      <Eye className="w-3.5 h-3.5" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    onClick={() => toggleHighlighted(pkg)}
                    title={
                      pkg.highlighted
                        ? 'Remove Most Popular'
                        : 'Set as Most Popular'
                    }
                    className={`w-8 h-8 rounded-[7px] border flex items-center justify-center
                               transition-all
                               ${
                                 pkg.highlighted
                                   ? 'border-[#f2994a] bg-[#fff7ed] text-[#f2994a]'
                                   : 'border-[#e2eaf4] bg-white text-[#8c959f] hover:border-[#f2994a] hover:text-[#f2994a]'
                               }`}
                  >
                    <Star className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => openEdit(pkg)}
                    className="w-8 h-8 rounded-[7px] border border-[#e2eaf4] bg-white
                               flex items-center justify-center text-[#8c959f]
                               hover:border-[#2f80ed] hover:text-[#2f80ed] transition-all"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setDeleteConfirm(pkg.id)}
                    className="w-8 h-8 rounded-[7px] border border-[#e2eaf4] bg-white
                               flex items-center justify-center text-[#8c959f]
                               hover:border-[#fca5a5] hover:bg-[#fee2e2] hover:text-[#dc2626]
                               transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && packages.length > 0 && (
        <div
          className="mt-5 p-4 bg-[#f6f8fa] rounded-[10px] border border-[#e2eaf4]
                        text-[12px] text-[#8c959f] text-center"
        >
          {packages.filter((p) => p.isActive).length} package(s) currently visible on
          website ·{' '}
          <a
            href={process.env.NEXT_PUBLIC_WEBSITE_URL || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#2f80ed] hover:underline font-medium"
          >
            Preview on website ↗
          </a>
        </div>
      )}

      {modal && (
        <div
          className="fixed inset-0 bg-[#0d1117]/55 backdrop-blur-[4px] z-[200]
                        flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div
            className="bg-white rounded-[16px] w-full max-w-lg max-h-[90vh]
                          overflow-y-auto shadow-[0_24px_80px_rgba(0,0,0,0.22)]"
          >
            <div
              className="sticky top-0 bg-white border-b border-[#e2eaf4] px-6 py-4
                            flex items-center justify-between rounded-t-[16px] z-10"
            >
              <div>
                <h2 className="text-[15px] font-bold text-[#0f2a44]">
                  {modal === 'create' ? 'New Package' : 'Edit Package'}
                </h2>
                <p className="text-[11px] text-[#8c959f] mt-0.5">
                  Changes will reflect live on the website
                </p>
              </div>
              <button
                onClick={closeModal}
                className="w-7 h-7 rounded-full bg-[#f6f8fa] border border-[#e2eaf4]
                                 flex items-center justify-center text-[#8c959f]
                                 hover:bg-[#fee2e2] hover:border-[#fca5a5] hover:text-[#dc2626]
                                 transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-[11.5px] font-medium text-[#526070] mb-1.5">
                  Package name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="e.g. Essential, Premium, Luxury"
                  className="w-full px-3 py-2.5 rounded-[8px] border border-[#d0d7de]
                             text-[13.5px] text-[#24292f] outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11.5px] font-medium text-[#526070] mb-1.5">
                    Price display <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.price}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, price: e.target.value }))
                    }
                    placeholder="e.g. ₹4.5L"
                    className="w-full px-3 py-2.5 rounded-[8px] border border-[#d0d7de]
                               text-[13.5px] text-[#24292f] outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11.5px] font-medium text-[#526070] mb-1.5">
                    Suffix
                  </label>
                  <input
                    type="text"
                    value={form.suffix}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, suffix: e.target.value }))
                    }
                    placeholder="onwards"
                    className="w-full px-3 py-2.5 rounded-[8px] border border-[#d0d7de]
                               text-[13.5px] text-[#24292f] outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11.5px] font-medium text-[#526070] mb-1.5">
                  Accent color
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {COLOR_PRESETS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, color: c.value }))}
                      title={c.label}
                      className="w-7 h-7 rounded-full border-2 transition-all"
                      style={{
                        background: c.value,
                        borderColor: form.color === c.value ? '#0f2a44' : 'transparent',
                        boxShadow:
                          form.color === c.value
                            ? '0 0 0 2px white, 0 0 0 4px #0f2a44'
                            : 'none',
                      }}
                    />
                  ))}
                  <div className="flex items-center gap-1.5 ml-1">
                    <input
                      type="color"
                      value={form.color}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, color: e.target.value }))
                      }
                      className="w-7 h-7 rounded cursor-pointer border-0 p-0"
                    />
                    <span className="text-[11px] font-mono text-[#8c959f]">
                      {form.color}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11.5px] font-medium text-[#526070] mb-1.5">
                  Features{' '}
                  <span className="text-[#8c959f] font-normal">
                    (shown as bullet points)
                  </span>
                </label>
                <div className="space-y-2">
                  {form.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{
                          background: `${form.color}22`,
                          border: `1.5px solid ${form.color}`,
                        }}
                      />
                      <input
                        type="text"
                        value={f}
                        onChange={(e) => setFeature(i, e.target.value)}
                        placeholder={`Feature ${i + 1}`}
                        className="flex-1 px-3 py-2 rounded-[8px] border border-[#d0d7de]
                                   text-[13px] text-[#24292f] outline-none transition-all"
                      />
                      {form.features.length > 1 && (
                        <button
                          onClick={() => removeFeature(i)}
                          className="w-7 h-7 rounded-[6px] flex items-center justify-center
                                           text-[#8c959f] hover:text-[#dc2626] hover:bg-[#fee2e2]
                                           transition-all flex-shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addFeature}
                    className="w-full py-2 rounded-[8px] border border-dashed border-[#c8dcf8]
                               text-[12.5px] font-medium text-[#2f80ed] hover:bg-[#eaf1fd]
                               transition-all flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add feature
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label
                  className="flex items-center gap-2.5 p-3 rounded-[8px] border border-[#e2eaf4]
                                  cursor-pointer hover:border-[#2f80ed] transition-all"
                >
                  <input
                    type="checkbox"
                    checked={form.highlighted}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, highlighted: e.target.checked }))
                    }
                    className="w-4 h-4 accent-[#f2994a]"
                  />
                  <div>
                    <p className="text-[12.5px] font-semibold text-[#24292f]">
                      Most Popular
                    </p>
                    <p className="text-[11px] text-[#8c959f]">Shows orange badge</p>
                  </div>
                </label>
                <label
                  className="flex items-center gap-2.5 p-3 rounded-[8px] border border-[#e2eaf4]
                                  cursor-pointer hover:border-[#2f80ed] transition-all"
                >
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, isActive: e.target.checked }))
                    }
                    className="w-4 h-4 accent-[#2f80ed]"
                  />
                  <div>
                    <p className="text-[12.5px] font-semibold text-[#24292f]">
                      Visible
                    </p>
                    <p className="text-[11px] text-[#8c959f]">Show on website</p>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-[11.5px] font-medium text-[#526070] mb-1.5">
                  Display order{' '}
                  <span className="text-[#8c959f] font-normal">
                    (lower = shown first)
                  </span>
                </label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, sortOrder: Number(e.target.value) }))
                  }
                  className="w-24 px-3 py-2 rounded-[8px] border border-[#d0d7de]
                             text-[13px] text-[#24292f] outline-none"
                  min={0}
                />
              </div>
            </div>

            <div
              className="sticky bottom-0 bg-white border-t border-[#e2eaf4] px-6 py-4
                            flex justify-end gap-3 rounded-b-[16px]"
            >
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-[8px] border border-[#d0d7de] bg-white
                                 text-[13px] font-medium text-[#57606a] hover:bg-[#f6f8fa]
                                 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim() || !form.price.trim()}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-[8px]
                           bg-[#2f80ed] hover:bg-[#1a6dd6] text-white text-[13px]
                           font-semibold transition-all disabled:opacity-60
                           disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />{' '}
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />{' '}
                    {modal === 'create' ? 'Create package' : 'Save changes'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div
          className="fixed inset-0 bg-[#0d1117]/55 backdrop-blur-[4px] z-[200]
                        flex items-center justify-center p-4"
        >
          <div
            className="bg-white rounded-[14px] p-6 max-w-sm w-full
                          shadow-[0_24px_80px_rgba(0,0,0,0.2)]"
          >
            <div className="w-10 h-10 rounded-full bg-[#fee2e2] flex items-center justify-center mb-4">
              <Trash2 className="w-5 h-5 text-[#dc2626]" />
            </div>
            <h3 className="text-[15px] font-bold text-[#24292f] mb-1">
              Delete package?
            </h3>
            <p className="text-[13px] text-[#8c959f] mb-5">
              This package will be removed from the website immediately. This
              action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 rounded-[8px] border border-[#d0d7de]
                                 text-[13px] font-medium text-[#57606a] hover:bg-[#f6f8fa]
                                 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2 rounded-[8px] bg-[#dc2626] hover:bg-[#b91c1c]
                                 text-white text-[13px] font-semibold transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAdminLayout(PackagesCMS);
