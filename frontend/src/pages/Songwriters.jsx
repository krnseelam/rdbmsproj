import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit, Trash2, PenTool, MapPin, Mail, Music } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import DataTable from '../components/common/DataTable';
import SearchBar from '../components/common/SearchBar';
import Modal from '../components/common/Modal';
import FormInput from '../components/common/FormInput';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ErrorMessage from '../components/common/ErrorMessage';

export default function Songwriters() {
  const [songwriters, setSongwriters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWriter, setEditingWriter] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [writerToDelete, setWriterToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [formData, setFormData] = useState({
    songwriter_name: '',
    country: '',
    email: '',
  });
  const [formErrors, setFormErrors] = useState({});

  const { success, error: toastError } = useToast();

  const fetchSongwriters = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.songwriters.getAll();
      setSongwriters(res.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch songwriters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSongwriters();
  }, []);

  const openAddModal = () => {
    setEditingWriter(null);
    setFormData({ songwriter_name: '', country: '', email: '' });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (writer) => {
    setEditingWriter(writer);
    setFormData({
      songwriter_name: writer.songwriter_name || '',
      country: writer.country || '',
      email: writer.email || '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openDeleteDialog = (writer) => {
    setWriterToDelete(writer);
    setIsDeleteDialogOpen(true);
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.songwriter_name.trim()) errs.songwriter_name = 'Songwriter name is required';
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
      if (editingWriter) {
        await api.songwriters.update(editingWriter.songwriter_id, formData);
        success(`Songwriter "${formData.songwriter_name}" updated.`);
      } else {
        await api.songwriters.create(formData);
        success(`Songwriter "${formData.songwriter_name}" registered.`);
      }
      setIsModalOpen(false);
      fetchSongwriters();
    } catch (err) {
      toastError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!writerToDelete) return;
    try {
      setSubmitting(true);
      await api.songwriters.delete(writerToDelete.songwriter_id);
      success(`Songwriter "${writerToDelete.songwriter_name}" removed.`);
      setIsDeleteDialogOpen(false);
      fetchSongwriters();
    } catch (err) {
      toastError(err.message || 'Delete failed');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSongwriters = useMemo(() => {
    return songwriters.filter((w) => {
      const q = searchTerm.toLowerCase();
      return (
        w.songwriter_name?.toLowerCase().includes(q) ||
        w.country?.toLowerCase().includes(q) ||
        w.email?.toLowerCase().includes(q)
      );
    });
  }, [songwriters, searchTerm]);

  const columns = [
    {
      header: 'Songwriter Name',
      accessor: 'songwriter_name',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xs shadow-sm">
            <PenTool className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-slate-100">{row.songwriter_name}</p>
            <p className="text-xs text-slate-400">ID: #{row.songwriter_id}</p>
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
      header: 'Tracks Written',
      accessor: 'total_songs_written',
      sortable: true,
      align: 'center',
      render: (row) => (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-dark-850 border border-slate-700 text-indigo-300">
          {row.total_songs_written}
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
            title="Edit Songwriter"
            className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-indigo-950/40 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => openDeleteDialog(row)}
            title="Delete Songwriter"
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
          <h2 className="text-xl font-bold text-white tracking-tight">Songwriters Directory</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Lyrical and composition copyright holders connected via <code className="text-indigo-400">song_songwriters</code>
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Add Songwriter
        </button>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchSongwriters} />}

      <div className="flex items-center justify-between gap-4 glass-panel p-3 rounded-2xl border border-slate-800">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search songwriters by name, country, or email..."
          className="w-full max-w-md"
        />
        <div className="text-xs text-slate-400 font-mono">
          Total Songwriters: <span className="text-indigo-400 font-semibold">{filteredSongwriters.length}</span>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredSongwriters}
        keyField="songwriter_id"
        isLoading={loading}
        emptyMessage="No songwriters found."
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingWriter ? 'Edit Songwriter Profile' : 'Register New Songwriter'}
        subtitle="Manage compositional credits and publishing contact info"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Songwriter Name"
            name="songwriter_name"
            value={formData.songwriter_name}
            onChange={(e) => setFormData({ ...formData, songwriter_name: e.target.value })}
            placeholder="e.g. Emily Stone"
            required
            error={formErrors.songwriter_name}
          />

          <FormInput
            label="Country"
            name="country"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            placeholder="e.g. USA"
            required
            error={formErrors.country}
          />

          <FormInput
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="songwriter@example.com"
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
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-900/30 transition-all flex items-center gap-2"
            >
              {submitting && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {editingWriter ? 'Save Changes' : 'Create Songwriter'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Songwriter"
        message={`Are you sure you want to remove songwriter "${writerToDelete?.songwriter_name}"? Database cascade will detach their compositional credit from tracks.`}
        confirmText="Confirm Delete"
        isLoading={submitting}
      />
    </div>
  );
}
