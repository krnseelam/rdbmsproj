import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit, Trash2, Sliders, MapPin, Mail, Music } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import DataTable from '../components/common/DataTable';
import SearchBar from '../components/common/SearchBar';
import Modal from '../components/common/Modal';
import FormInput from '../components/common/FormInput';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ErrorMessage from '../components/common/ErrorMessage';

export default function Producers() {
  const [producers, setProducers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProducer, setEditingProducer] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [producerToDelete, setProducerToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [formData, setFormData] = useState({
    producer_name: '',
    country: '',
    email: '',
  });
  const [formErrors, setFormErrors] = useState({});

  const { success, error: toastError } = useToast();

  const fetchProducers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.producers.getAll();
      setProducers(res.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch producers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducers();
  }, []);

  const openAddModal = () => {
    setEditingProducer(null);
    setFormData({ producer_name: '', country: '', email: '' });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (producer) => {
    setEditingProducer(producer);
    setFormData({
      producer_name: producer.producer_name || '',
      country: producer.country || '',
      email: producer.email || '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openDeleteDialog = (producer) => {
    setProducerToDelete(producer);
    setIsDeleteDialogOpen(true);
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.producer_name.trim()) errs.producer_name = 'Producer name is required';
    if (!formData.country.trim()) errs.country = 'Country is required';
    if (!formData.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Valid email is required';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      if (editingProducer) {
        await api.producers.update(editingProducer.producer_id, formData);
        success(`Producer "${formData.producer_name}" updated.`);
      } else {
        await api.producers.create(formData);
        success(`Producer "${formData.producer_name}" added successfully.`);
      }
      setIsModalOpen(false);
      fetchProducers();
    } catch (err) {
      toastError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!producerToDelete) return;
    try {
      setSubmitting(true);
      await api.producers.delete(producerToDelete.producer_id);
      success(`Producer "${producerToDelete.producer_name}" removed.`);
      setIsDeleteDialogOpen(false);
      fetchProducers();
    } catch (err) {
      toastError(err.message || 'Delete failed');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducers = useMemo(() => {
    return producers.filter((p) => {
      const q = searchTerm.toLowerCase();
      return (
        p.producer_name?.toLowerCase().includes(q) ||
        p.country?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q)
      );
    });
  }, [producers, searchTerm]);

  const columns = [
    {
      header: 'Producer Name',
      accessor: 'producer_name',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-950/80 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs shadow-sm">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-slate-100">{row.producer_name}</p>
            <p className="text-xs text-slate-400">ID: #{row.producer_id}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Country',
      accessor: 'country',
      sortable: true,
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-300">
          <MapPin className="w-3.5 h-3.5 text-slate-500" />
          {row.country}
        </span>
      ),
    },
    {
      header: 'Email',
      accessor: 'email',
      render: (row) => (
        <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
          <Mail className="w-3 h-3 text-slate-500" />
          {row.email}
        </span>
      ),
    },
    {
      header: 'Tracks Produced',
      accessor: 'total_songs_produced',
      sortable: true,
      align: 'center',
      render: (row) => (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-dark-850 border border-slate-700 text-amber-300">
          {row.total_songs_produced}
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
            title="Edit Producer"
            className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-amber-950/40 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => openDeleteDialog(row)}
            title="Delete Producer"
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
          <h2 className="text-xl font-bold text-white tracking-tight">Music Producers</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Production engineers and studio supervisors connected via <code className="text-amber-400">song_producers</code>
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-amber-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Add Producer
        </button>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchProducers} />}

      <div className="flex items-center justify-between gap-4 glass-panel p-3 rounded-2xl border border-slate-800">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search producers by name, country, or email..."
          className="w-full max-w-md"
        />
        <div className="text-xs text-slate-400 font-mono">
          Total Producers: <span className="text-amber-400 font-semibold">{filteredProducers.length}</span>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredProducers}
        keyField="producer_id"
        isLoading={loading}
        emptyMessage="No producers found."
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProducer ? 'Edit Producer Profile' : 'Register New Producer'}
        subtitle="Manage contact information and studio credentials"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Producer Name"
            name="producer_name"
            value={formData.producer_name}
            onChange={(e) => setFormData({ ...formData, producer_name: e.target.value })}
            placeholder="e.g. Vikram Rao"
            required
            error={formErrors.producer_name}
          />

          <FormInput
            label="Country"
            name="country"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            placeholder="e.g. India"
            required
            error={formErrors.country}
          />

          <FormInput
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="producer@example.com"
            required
            error={formErrors.email}
            helpText="Must be unique in database"
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
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-amber-600 hover:bg-amber-500 shadow-lg shadow-amber-900/30 transition-all flex items-center gap-2"
            >
              {submitting && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {editingProducer ? 'Save Changes' : 'Create Producer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Producer"
        message={`Are you sure you want to remove producer "${producerToDelete?.producer_name}"? Database cascade will detach their credit from tracks.`}
        confirmText="Confirm Delete"
        isLoading={submitting}
      />
    </div>
  );
}
