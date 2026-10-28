import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Eye, Edit, Trash2, Mic2, MapPin, Calendar, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import DataTable from '../components/common/DataTable';
import SearchBar from '../components/common/SearchBar';
import Modal from '../components/common/Modal';
import FormInput from '../components/common/FormInput';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ErrorMessage from '../components/common/ErrorMessage';

export default function Artists() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArtist, setEditingArtist] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [artistToDelete, setArtistToDelete] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    stage_name: '',
    real_name: '',
    country: '',
    debut_year: new Date().getFullYear(),
    email: '',
  });
  const [formErrors, setFormErrors] = useState({});

  const { success, error: toastError } = useToast();

  const fetchArtists = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.artists.getAll();
      setArtists(res.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch artists');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtists();
  }, []);

  const openAddModal = () => {
    setEditingArtist(null);
    setFormData({
      stage_name: '',
      real_name: '',
      country: '',
      debut_year: new Date().getFullYear(),
      email: '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (artist) => {
    setEditingArtist(artist);
    setFormData({
      stage_name: artist.stage_name || '',
      real_name: artist.real_name || '',
      country: artist.country || '',
      debut_year: artist.debut_year || 2020,
      email: artist.email || '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openDeleteDialog = (artist) => {
    setArtistToDelete(artist);
    setIsDeleteDialogOpen(true);
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.stage_name.trim()) errs.stage_name = 'Stage name is required';
    if (!formData.country.trim()) errs.country = 'Country is required';
    if (!formData.debut_year) {
      errs.debut_year = 'Debut year is required';
    } else if (formData.debut_year < 1900 || formData.debut_year > 2100) {
      errs.debut_year = 'Debut year must be between 1900 and 2100';
    }
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
      setFormSubmitting(true);
      if (editingArtist) {
        await api.artists.update(editingArtist.artist_id, formData);
        success(`Artist "${formData.stage_name}" updated successfully.`);
      } else {
        await api.artists.create(formData);
        success(`Artist "${formData.stage_name}" created successfully.`);
      }
      setIsModalOpen(false);
      fetchArtists();
    } catch (err) {
      toastError(err.message || 'Operation failed');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!artistToDelete) return;
    try {
      setFormSubmitting(true);
      await api.artists.delete(artistToDelete.artist_id);
      success(`Artist "${artistToDelete.stage_name}" deleted.`);
      setIsDeleteDialogOpen(false);
      fetchArtists();
    } catch (err) {
      toastError(err.message || 'Delete failed');
    } finally {
      setFormSubmitting(false);
    }
  };

  const filteredArtists = useMemo(() => {
    return artists.filter((a) => {
      const q = searchTerm.toLowerCase();
      return (
        a.stage_name?.toLowerCase().includes(q) ||
        a.real_name?.toLowerCase().includes(q) ||
        a.country?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q)
      );
    });
  }, [artists, searchTerm]);

  const columns = [
    {
      header: 'Artist / Stage Name',
      accessor: 'stage_name',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-xs shadow-sm">
            {row.stage_name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <Link
              to={`/artists/${row.artist_id}`}
              className="font-semibold text-slate-100 hover:text-purple-400 transition-colors"
            >
              {row.stage_name}
            </Link>
            {row.real_name && (
              <p className="text-xs text-slate-400">aka {row.real_name}</p>
            )}
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
      header: 'Debut Year',
      accessor: 'debut_year',
      sortable: true,
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-xs text-slate-300 font-mono">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          {row.debut_year}
        </span>
      ),
    },
    {
      header: 'Email',
      accessor: 'email',
      render: (row) => (
        <span className="text-xs text-slate-400 font-mono">{row.email}</span>
      ),
    },
    {
      header: 'Albums (Summary)',
      accessor: 'total_albums',
      sortable: true,
      align: 'center',
      render: (row) => (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-dark-850 border border-slate-700 text-cyan-300">
          {row.total_albums}
        </span>
      ),
    },
    {
      header: 'Songs (Summary)',
      accessor: 'total_songs',
      sortable: true,
      align: 'center',
      render: (row) => (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-dark-850 border border-slate-700 text-purple-300">
          {row.total_songs}
        </span>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link
            to={`/artists/${row.artist_id}`}
            title="View Details"
            className="p-1.5 text-slate-400 hover:text-purple-300 hover:bg-purple-950/40 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <button
            onClick={() => openEditModal(row)}
            title="Edit Artist"
            className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/40 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => openDeleteDialog(row)}
            title="Delete Artist"
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
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Artists Management</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Catalogued recording artists with metrics from <code className="text-purple-400">v_artist_summary</code>
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-purple-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Add Artist
        </button>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchArtists} />}

      {/* Filter / Search Bar */}
      <div className="flex items-center justify-between gap-4 glass-panel p-3 rounded-2xl border border-slate-800">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search artists by name, country, or email..."
          className="w-full max-w-md"
        />
        <div className="text-xs text-slate-400 font-mono">
          Total Artists: <span className="text-purple-400 font-semibold">{filteredArtists.length}</span>
        </div>
      </div>

      {/* Artists Table */}
      <DataTable
        columns={columns}
        data={filteredArtists}
        keyField="artist_id"
        isLoading={loading}
        emptyMessage="No artists match your search criteria."
      />

      {/* Add / Edit Artist Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingArtist ? 'Edit Recording Artist' : 'Register New Artist'}
        subtitle="Manage artist credentials, debut year, and contact email"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Stage Name"
            name="stage_name"
            value={formData.stage_name}
            onChange={(e) => setFormData({ ...formData, stage_name: e.target.value })}
            placeholder="e.g. Luna Park"
            required
            error={formErrors.stage_name}
          />

          <FormInput
            label="Real Name (Optional)"
            name="real_name"
            value={formData.real_name}
            onChange={(e) => setFormData({ ...formData, real_name: e.target.value })}
            placeholder="e.g. Lena Parker"
          />

          <div className="grid grid-cols-2 gap-4">
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
              label="Debut Year"
              name="debut_year"
              type="number"
              min="1900"
              max="2100"
              value={formData.debut_year}
              onChange={(e) => setFormData({ ...formData, debut_year: e.target.value })}
              required
              error={formErrors.debut_year}
              helpText="Check: 1900 to 2100"
            />
          </div>

          <FormInput
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="artist@example.com"
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
              disabled={formSubmitting}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-900/30 transition-all flex items-center gap-2"
            >
              {formSubmitting && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {editingArtist ? 'Save Changes' : 'Create Artist'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Artist"
        message={`Are you sure you want to delete "${artistToDelete?.stage_name}"? If they have existing albums or contracts, the database constraint will protect the record and prevent deletion.`}
        confirmText="Confirm Delete"
        isLoading={formSubmitting}
      />
    </div>
  );
}
