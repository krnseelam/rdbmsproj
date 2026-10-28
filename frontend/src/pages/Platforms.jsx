import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit, Trash2, Radio, ExternalLink, Globe, DollarSign, Activity } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import DataTable from '../components/common/DataTable';
import SearchBar from '../components/common/SearchBar';
import Modal from '../components/common/Modal';
import FormInput from '../components/common/FormInput';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ErrorMessage from '../components/common/ErrorMessage';

export default function Platforms() {
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [platformToDelete, setPlatformToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [formData, setFormData] = useState({
    platform_name: '',
    rate_per_stream: '0.004000',
    website: '',
  });
  const [formErrors, setFormErrors] = useState({});

  const { success, error: toastError } = useToast();

  const fetchPlatforms = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.platforms.getAll();
      setPlatforms(res.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch streaming platforms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlatforms();
  }, []);

  const openAddModal = () => {
    setEditingPlatform(null);
    setFormData({
      platform_name: '',
      rate_per_stream: '0.004000',
      website: 'https://',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (platform) => {
    setEditingPlatform(platform);
    setFormData({
      platform_name: platform.platform_name || '',
      rate_per_stream: platform.rate_per_stream || '0.004000',
      website: platform.website || '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openDeleteDialog = (platform) => {
    setPlatformToDelete(platform);
    setIsDeleteDialogOpen(true);
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.platform_name.trim()) errs.platform_name = 'Platform name is required';
    if (formData.rate_per_stream === '' || Number(formData.rate_per_stream) < 0) {
      errs.rate_per_stream = 'Rate per stream must be non-negative (ck_platforms_rate)';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      if (editingPlatform) {
        await api.platforms.update(editingPlatform.platform_id, formData);
        success(`Platform "${formData.platform_name}" updated.`);
      } else {
        await api.platforms.create(formData);
        success(`Platform "${formData.platform_name}" added successfully.`);
      }
      setIsModalOpen(false);
      fetchPlatforms();
    } catch (err) {
      toastError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!platformToDelete) return;
    try {
      setSubmitting(true);
      await api.platforms.delete(platformToDelete.platform_id);
      success(`Platform "${platformToDelete.platform_name}" deleted.`);
      setIsDeleteDialogOpen(false);
      fetchPlatforms();
    } catch (err) {
      toastError(err.message || 'Delete rejected by database');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPlatforms = useMemo(() => {
    return platforms.filter((p) => {
      const q = searchTerm.toLowerCase();
      return (
        p.platform_name?.toLowerCase().includes(q) ||
        p.website?.toLowerCase().includes(q)
      );
    });
  }, [platforms, searchTerm]);

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);

  const columns = [
    {
      header: 'Platform Name',
      accessor: 'platform_name',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-xs shadow-sm">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-slate-100">{row.platform_name}</p>
            <p className="text-xs text-slate-400">ID: #{row.platform_id}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Rate Per Stream',
      accessor: 'rate_per_stream',
      sortable: true,
      align: 'right',
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-emerald-400">
          ${Number(row.rate_per_stream).toFixed(6)}
        </span>
      ),
    },
    {
      header: 'Official Website',
      accessor: 'website',
      render: (row) =>
        row.website ? (
          <a
            href={row.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-medium group"
          >
            <Globe className="w-3.5 h-3.5 text-purple-400" />
            <span className="group-hover:underline">{row.website.replace('https://', '')}</span>
            <ExternalLink className="w-3 h-3 opacity-70 group-hover:opacity-100" />
          </a>
        ) : (
          <span className="text-xs text-slate-500 italic">None</span>
        ),
    },
    {
      header: 'Total Streams Logged',
      accessor: 'total_streams',
      sortable: true,
      align: 'right',
      render: (row) => (
        <span className="font-mono text-xs text-cyan-300 font-medium">
          {Number(row.total_streams).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Gross Revenue Generated',
      accessor: 'total_earnings',
      sortable: true,
      align: 'right',
      render: (row) => (
        <span className="font-mono text-xs font-bold text-emerald-400">
          {formatCurrency(row.total_earnings)}
        </span>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => openEditModal(row)}
            title="Edit Platform"
            className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/40 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => openDeleteDialog(row)}
            title="Delete Platform"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Streaming Platforms & Royalty Rates</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Digital service providers (DSP) and per-stream monetization payout agreements
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-cyan-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Add Platform
        </button>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchPlatforms} />}

      <div className="flex items-center justify-between gap-4 glass-panel p-3 rounded-2xl border border-slate-800">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search platforms by name or website..."
          className="w-full max-w-md"
        />
        <div className="text-xs text-slate-400 font-mono">
          Total Platforms: <span className="text-cyan-400 font-semibold">{filteredPlatforms.length}</span>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredPlatforms}
        keyField="platform_id"
        isLoading={loading}
        emptyMessage="No streaming platforms found."
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPlatform ? 'Edit Streaming Platform' : 'Register New Streaming Platform'}
        subtitle="Configure DSP streaming provider and per-stream royalty rate"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Platform Name"
            name="platform_name"
            value={formData.platform_name}
            onChange={(e) => setFormData({ ...formData, platform_name: e.target.value })}
            placeholder="e.g. Tidal"
            required
            error={formErrors.platform_name}
            helpText="Must be unique (uq_platforms_name)"
          />

          <FormInput
            label="Rate Per Stream (USD)"
            name="rate_per_stream"
            type="number"
            step="0.000001"
            min="0"
            value={formData.rate_per_stream}
            onChange={(e) => setFormData({ ...formData, rate_per_stream: e.target.value })}
            placeholder="0.004000"
            required
            error={formErrors.rate_per_stream}
            helpText="Must be non-negative (ck_platforms_rate)"
          />

          <FormInput
            label="Website URL"
            name="website"
            type="url"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            placeholder="https://www.platform.com"
            helpText="Will be displayed as a clickable link"
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow-lg shadow-cyan-900/30 transition-all flex items-center gap-2"
            >
              {submitting && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {editingPlatform ? 'Save Changes' : 'Create Platform'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Streaming Platform"
        message={`Are you sure you want to delete platform "${platformToDelete?.platform_name}"? If royalty records exist on this platform, the foreign key constraint will prevent deletion.`}
        confirmText="Confirm Delete"
        isLoading={submitting}
      />
    </div>
  );
}
