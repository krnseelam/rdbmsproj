import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Eye, Edit, Trash2, Disc, Calendar, Music, User } from 'lucide-react';
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

export default function Albums() {
  const [albums, setAlbums] = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [albumToDelete, setAlbumToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [formData, setFormData] = useState({
    title: '',
    release_date: '',
    artist_id: '',
  });
  const [formErrors, setFormErrors] = useState({});

  const { success, error: toastError } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [albumsRes, artistsRes] = await Promise.all([
        api.albums.getAll(),
        api.artists.getAll(),
      ]);
      setAlbums(albumsRes.data || []);
      setArtists(artistsRes.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch albums');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingAlbum(null);
    setFormData({
      title: '',
      release_date: new Date().toISOString().split('T')[0],
      artist_id: artists[0]?.artist_id || '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (album) => {
    setEditingAlbum(album);
    setFormData({
      title: album.title || '',
      release_date: album.release_date || '',
      artist_id: album.artist_id || '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openDeleteDialog = (album) => {
    setAlbumToDelete(album);
    setIsDeleteDialogOpen(true);
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Album title is required';
    if (!formData.release_date) errs.release_date = 'Release date is required';
    if (!formData.artist_id) errs.artist_id = 'Artist selection is required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      if (editingAlbum) {
        await api.albums.update(editingAlbum.album_id, formData);
        success(`Album "${formData.title}" updated.`);
      } else {
        await api.albums.create(formData);
        success(`Album "${formData.title}" created successfully.`);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toastError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!albumToDelete) return;
    try {
      setSubmitting(true);
      await api.albums.delete(albumToDelete.album_id);
      success(`Album "${albumToDelete.title}" deleted.`);
      setIsDeleteDialogOpen(false);
      fetchData();
    } catch (err) {
      toastError(err.message || 'Failed to delete album');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAlbums = useMemo(() => {
    return albums.filter((al) => {
      const q = searchTerm.toLowerCase();
      return (
        al.title?.toLowerCase().includes(q) ||
        al.artist_name?.toLowerCase().includes(q) ||
        al.release_date?.includes(q)
      );
    });
  }, [albums, searchTerm]);

  const formatSeconds = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}m ${secs}s`;
  };

  const columns = [
    {
      header: 'Album Title',
      accessor: 'title',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-xs shadow-sm">
            <Disc className="w-4 h-4" />
          </div>
          <div>
            <Link
              to={`/albums/${row.album_id}`}
              className="font-semibold text-slate-100 hover:text-cyan-400 transition-colors"
            >
              {row.title}
            </Link>
            <p className="text-xs text-slate-400">ID: #{row.album_id}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Artist',
      accessor: 'artist_name',
      sortable: true,
      render: (row) => (
        <Link
          to={`/artists/${row.artist_id}`}
          className="inline-flex items-center gap-1.5 text-xs text-purple-300 hover:text-purple-200 font-medium"
        >
          <User className="w-3.5 h-3.5 text-purple-400" />
          {row.artist_name}
        </Link>
      ),
    },
    {
      header: 'Release Date',
      accessor: 'release_date',
      sortable: true,
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-xs text-slate-300 font-mono">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          {row.release_date}
        </span>
      ),
    },
    {
      header: 'Tracks',
      accessor: 'song_count',
      sortable: true,
      align: 'center',
      render: (row) => (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-dark-850 border border-slate-700 text-slate-200">
          {row.song_count} {row.song_count === 1 ? 'track' : 'tracks'}
        </span>
      ),
    },
    {
      header: 'Duration',
      accessor: 'total_duration_seconds',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-slate-400 font-mono">
          {formatSeconds(row.total_duration_seconds)}
        </span>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link
            to={`/albums/${row.album_id}`}
            title="View Album"
            className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/40 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <button
            onClick={() => openEditModal(row)}
            title="Edit Album"
            className="p-1.5 text-slate-400 hover:text-purple-300 hover:bg-purple-950/40 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => openDeleteDialog(row)}
            title="Delete Album"
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
          <h2 className="text-xl font-bold text-white tracking-tight">Albums & Discography</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Full release records linked directly to recording artists
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-cyan-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Add Album
        </button>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchData} />}

      {/* Search & Stats */}
      <div className="flex items-center justify-between gap-4 glass-panel p-3 rounded-2xl border border-slate-800">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search albums by title or artist..."
          className="w-full max-w-md"
        />
        <div className="text-xs text-slate-400 font-mono">
          Total Albums: <span className="text-cyan-400 font-semibold">{filteredAlbums.length}</span>
        </div>
      </div>

      {/* Albums Table */}
      <DataTable
        columns={columns}
        data={filteredAlbums}
        keyField="album_id"
        isLoading={loading}
        emptyMessage="No albums match your search criteria."
      />

      {/* Add / Edit Album Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAlbum ? 'Edit Studio Album' : 'Create New Album'}
        subtitle="Specify release date and select registered artist"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Album Title"
            name="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Neon Skies"
            required
            error={formErrors.title}
          />

          <SelectInput
            label="Recording Artist"
            name="artist_id"
            value={formData.artist_id}
            onChange={(e) => setFormData({ ...formData, artist_id: e.target.value })}
            options={artists.map((a) => ({
              value: a.artist_id,
              label: `${a.stage_name} (${a.country})`,
            }))}
            placeholder="Choose artist from database..."
            required
            error={formErrors.artist_id}
          />

          <FormInput
            label="Release Date"
            name="release_date"
            type="date"
            value={formData.release_date}
            onChange={(e) => setFormData({ ...formData, release_date: e.target.value })}
            required
            error={formErrors.release_date}
            helpText="Important: Royalty periods cannot be before this date (checked by trigger)"
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
              {editingAlbum ? 'Save Changes' : 'Create Album'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Album"
        message={`Are you sure you want to delete album "${albumToDelete?.title}"? Under database cascade rules, songs belonging to this album will also be removed.`}
        confirmText="Confirm Delete"
        isLoading={submitting}
      />
    </div>
  );
}
