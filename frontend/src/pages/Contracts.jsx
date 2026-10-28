import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit, Trash2, FileText, CheckCircle2, AlertTriangle, XCircle, User, Calendar, Coins } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import DataTable from '../components/common/DataTable';
import SearchBar from '../components/common/SearchBar';
import Modal from '../components/common/Modal';
import FormInput from '../components/common/FormInput';
import SelectInput from '../components/common/SelectInput';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ErrorMessage from '../components/common/ErrorMessage';

export default function Contracts() {
  const [contracts, setContracts] = useState([]);
  const [activeContracts, setActiveContracts] = useState([]);
  const [artists, setArtists] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' or 'active_view'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [formData, setFormData] = useState({
    artist_id: '',
    start_date: '',
    end_date: '',
    royalty_percent: 15.0,
    advance_amount: 0,
    status: 'Active',
  });
  const [formErrors, setFormErrors] = useState({});

  const { success, error: toastError } = useToast();

  const fetchContracts = async () => {
    try {
      setLoading(true);
      setError(null);
      const [allRes, activeRes, artistsRes] = await Promise.all([
        api.contracts.getAll(),
        api.contracts.getActive(),
        api.artists.getAll(),
      ]);
      setContracts(allRes.data || []);
      setActiveContracts(activeRes.data || []);
      setArtists(artistsRes.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch contracts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const openAddModal = () => {
    setEditingContract(null);
    const today = new Date().toISOString().split('T')[0];
    const threeYearsLater = new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    setFormData({
      artist_id: artists[0]?.artist_id || '',
      start_date: today,
      end_date: threeYearsLater,
      royalty_percent: 15.0,
      advance_amount: 100000,
      status: 'Active',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (contract) => {
    setEditingContract(contract);
    setFormData({
      artist_id: contract.artist_id || '',
      start_date: contract.start_date || '',
      end_date: contract.end_date || '',
      royalty_percent: contract.royalty_percent || 15,
      advance_amount: contract.advance_amount || 0,
      status: contract.status || 'Active',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openDeleteDialog = (contract) => {
    setContractToDelete(contract);
    setIsDeleteDialogOpen(true);
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.artist_id) errs.artist_id = 'Artist selection is required';
    if (!formData.start_date) errs.start_date = 'Start date is required';
    if (!formData.end_date) errs.end_date = 'End date is required';
    if (formData.start_date && formData.end_date && formData.end_date <= formData.start_date) {
      errs.end_date = 'End date must be strictly after start date (ck_contracts_dates)';
    }
    if (formData.royalty_percent < 0 || formData.royalty_percent > 100) {
      errs.royalty_percent = 'Royalty percentage must be between 0% and 100%';
    }
    if (formData.advance_amount < 0) {
      errs.advance_amount = 'Advance amount cannot be negative';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      if (editingContract) {
        await api.contracts.update(editingContract.contract_id, formData);
        success(`Contract #${editingContract.contract_id} updated.`);
      } else {
        await api.contracts.create(formData);
        success('Contract registered successfully (validated by MySQL trigger).');
      }
      setIsModalOpen(false);
      fetchContracts();
    } catch (err) {
      // Trigger errors like 'Artist already has an overlapping Active contract' will be shown clearly
      toastError(err.message || 'Operation rejected by database');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!contractToDelete) return;
    try {
      setSubmitting(true);
      await api.contracts.delete(contractToDelete.contract_id);
      success(`Contract #${contractToDelete.contract_id} deleted.`);
      setIsDeleteDialogOpen(false);
      fetchContracts();
    } catch (err) {
      toastError(err.message || 'Delete failed');
    } finally {
      setSubmitting(false);
    }
  };

  const currentDataset = activeFilter === 'active_view' ? activeContracts : contracts;

  const filteredContracts = useMemo(() => {
    return currentDataset.filter((c) => {
      const q = searchTerm.toLowerCase();
      return (
        c.artist_name?.toLowerCase().includes(q) ||
        String(c.contract_id).includes(q) ||
        c.status?.toLowerCase().includes(q)
      );
    });
  }, [currentDataset, searchTerm]);

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);

  const columns = [
    {
      header: 'ID',
      accessor: 'contract_id',
      sortable: true,
      align: 'center',
      render: (row) => (
        <span className="font-mono text-xs font-bold text-slate-400">
          #{row.contract_id}
        </span>
      ),
    },
    {
      header: 'Artist',
      accessor: 'artist_name',
      sortable: true,
      render: (row) => (
        <Link
          to={`/artists/${row.artist_id}`}
          className="inline-flex items-center gap-1.5 text-xs text-purple-300 hover:underline font-semibold"
        >
          <User className="w-3.5 h-3.5 text-purple-400" />
          {row.artist_name}
        </Link>
      ),
    },
    {
      header: 'Term Period',
      render: (row) => (
        <span className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          {row.start_date} <span className="text-slate-600">→</span> {row.end_date}
        </span>
      ),
    },
    {
      header: 'Royalty %',
      accessor: 'royalty_percent',
      sortable: true,
      align: 'right',
      render: (row) => (
        <span className="font-mono text-xs font-bold text-purple-400">
          {row.royalty_percent}%
        </span>
      ),
    },
    {
      header: 'Advance Amount',
      accessor: 'advance_amount',
      sortable: true,
      align: 'right',
      render: (row) => (
        <span className="font-mono text-xs text-emerald-400 font-semibold">
          {formatCurrency(row.advance_amount)}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (row) => {
        const styles = {
          Active: 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300',
          Expired: 'bg-amber-950/80 border-amber-500/40 text-amber-300',
          Terminated: 'bg-rose-950/80 border-rose-500/40 text-rose-300',
        };
        return (
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
              styles[row.status] || styles.Active
            }`}
          >
            {row.status}
          </span>
        );
      },
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => openEditModal(row)}
            title="Edit Contract"
            className="p-1.5 text-slate-400 hover:text-purple-300 hover:bg-purple-950/40 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => openDeleteDialog(row)}
            title="Delete Contract"
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
          <h2 className="text-xl font-bold text-white tracking-tight">Artist Contracts & Agreements</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Governed by check constraints and MySQL trigger <code className="text-emerald-400">trg_contracts_before_insert</code>
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          New Contract
        </button>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchContracts} />}

      {/* Tabs & Search Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 glass-panel p-3 rounded-2xl border border-slate-800">
        {/* Toggle between All Contracts and v_active_contracts view */}
        <div className="flex items-center bg-dark-950/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === 'all'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Contracts ({contracts.length})
          </button>
          <button
            onClick={() => setActiveFilter('active_view')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeFilter === 'active_view'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Active Only (v_active_contracts) ({activeContracts.length})
          </button>
        </div>

        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Filter by artist name, ID, or status..."
          className="w-full sm:max-w-xs"
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredContracts}
        keyField="contract_id"
        isLoading={loading}
        emptyMessage="No contracts found matching filter."
      />

      {/* Add / Edit Contract Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingContract ? 'Modify Contract Agreement' : 'Draft New Artist Contract'}
        subtitle="Enforces business logic: start < end date, 0-100% royalty, and no active contract overlaps"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <SelectInput
            label="Artist"
            name="artist_id"
            value={formData.artist_id}
            onChange={(e) => setFormData({ ...formData, artist_id: e.target.value })}
            options={artists.map((a) => ({
              value: a.artist_id,
              label: `${a.stage_name} (${a.country})`,
            }))}
            placeholder="Select signing artist..."
            required
            error={formErrors.artist_id}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Start Date"
              name="start_date"
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              required
              error={formErrors.start_date}
            />

            <FormInput
              label="End Date"
              name="end_date"
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              required
              error={formErrors.end_date}
              helpText="Must be after start date"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Royalty Percentage (%)"
              name="royalty_percent"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={formData.royalty_percent}
              onChange={(e) => setFormData({ ...formData, royalty_percent: e.target.value })}
              required
              error={formErrors.royalty_percent}
              helpText="0.00% to 100.00%"
            />

            <FormInput
              label="Advance Amount ($)"
              name="advance_amount"
              type="number"
              min="0"
              step="1000"
              value={formData.advance_amount}
              onChange={(e) => setFormData({ ...formData, advance_amount: e.target.value })}
              error={formErrors.advance_amount}
              helpText="Advance >= $0"
            />
          </div>

          <SelectInput
            label="Contract Status"
            name="status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={[
              { value: 'Active', label: 'Active' },
              { value: 'Expired', label: 'Expired' },
              { value: 'Terminated', label: 'Terminated' },
            ]}
            required
            helpText="Triggers will auto-expire if past end_date, or reject if overlapping Active exists"
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
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-900/30 transition-all flex items-center gap-2"
            >
              {submitting && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {editingContract ? 'Save Contract' : 'Submit Contract'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Contract Record"
        message={`Are you sure you want to delete Contract #${contractToDelete?.contract_id} for ${contractToDelete?.artist_name}?`}
        confirmText="Confirm Delete"
        isLoading={submitting}
      />
    </div>
  );
}
