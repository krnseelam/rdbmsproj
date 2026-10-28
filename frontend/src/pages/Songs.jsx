import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Eye, Edit, Trash2, Music, Disc, User, Sliders, PenTool } from 'lucide-react';
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

export default function Songs() {
  const [songs, setSongs] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [producers, setProducers] = useState([]);
  const [songwriters, setSongwriters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [songToDelete, setSongToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    duration_seconds: 180,
    track_number: 1,
    album_id: '',
    producer_ids: [],
    songwriter_ids: [],
  });
  const [formErrors, setFormErrors] = useState({});

  const { success, error: toastError } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [songsRes, albumsRes, producersRes, writersRes] = await Promise.all([
        api.songs.getAll(),
        api.albums.getAll(),
        api.producers.getAll(),
        api.songwriters.getAll(),
      ]);
      setSongs(songsRes.data || []);
      setAlbums(albumsRes.data || []);
      setProducers(producersRes.data || []);
      setSongwriters(writersRes.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch songs list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingSong(null);
    setFormData({
      title: '',
      duration_seconds: 210,
      track_number: 1,
      album_id: albums[0]?.album_id || '',
      producer_ids: producers.length > 0 ? [producers[0].producer_id] : [],
      songwriter_ids: songwriters.length > 0 ? [songwriters[0].songwriter_id] : [],
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = async (song) => {
    try {
      setSubmitting(true);
      const res = await api.songs.getById(song.song_id);
      const fullSong = res.data;
      setEditingSong(fullSong);
      setFormData({
        title: fullSong.song_title || '',
        duration_seconds: fullSong.duration_seconds || 180,
        track_number: fullSong.track_number || 1,
        album_id: fullSong.album_id || '',
        producer_ids: fullSong.producers ? fullSong.producers.map((p) => p.producer_id) : [],
        songwriter_ids: fullSong.songwriters ? fullSong.songwriters.map((w) => w.songwriter_id) : [],
      });
      setFormErrors({});
      setIsModalOpen(true);
    } catch (err) {
      toastError(err.message || 'Failed to load song details for editing');
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteDialog = (song) => {
    setSongToDelete(song);
    setIsDeleteDialogOpen(true);
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Song title is required';
    if (!formData.duration_seconds || formData.duration_seconds <= 0) {
      errs.duration_seconds = 'Duration must be greater than 0 seconds';
    }
    if (!formData.track_number || formData.track_number <= 0) {
      errs.track_number = 'Track number must be greater than 0';
    }
    if (!formData.album_id) {
      errs.album_id = 'Album selection is required';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleProducerToggle = (producerId) => {
    setFormData((prev) => {
      const exists = prev.producer_ids.includes(producerId);
      const updated = exists
        ? prev.producer_ids.filter((id) => id !== producerId)
        : [...prev.producer_ids, producerId];
      return { ...prev, producer_ids: updated };
    });
  };

  const handleSongwriterToggle = (writerId) => {
    setFormData((prev) => {
      const exists = prev.songwriter_ids.includes(writerId);
      const updated = exists
        ? prev.songwriter_ids.filter((id) => id !== writerId)
        : [...prev.songwriter_ids, writerId];
      return { ...prev, songwriter_ids: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      if (editingSong) {
        await api.songs.update(editingSong.song_id, formData);
        success(`Song "${formData.title}" updated.`);
      } else {
        await api.songs.create(formData);
        success(`Song "${formData.title}" created.`);
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
    if (!songToDelete) return;
    try {
      setSubmitting(true);
      await api.songs.delete(songToDelete.song_id);
      success(`Song "${songToDelete.song_title}" deleted.`);
      setIsDeleteDialogOpen(false);
      fetchData();
    } catch (err) {
      toastError(err.message || 'Failed to delete song');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSongs = useMemo(() => {
    return songs.filter((s) => {
      const q = searchTerm.toLowerCase();
      return (
        s.song_title?.toLowerCase().includes(q) ||
        s.album_title?.toLowerCase().includes(q) ||
        s.artist_name?.toLowerCase().includes(q) ||
        s.producers?.toLowerCase().includes(q) ||
        s.songwriters?.toLowerCase().includes(q)
      );
    });
  }, [songs, searchTerm]);

  const formatSeconds = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);

  const columns = [
    {
      header: 'Track',
      accessor: 'track_number',
      sortable: true,
      align: 'center',
      render: (row) => (
        <span className="font-mono text-xs text-slate-400 font-bold">
          #{row.track_number}
        </span>
      ),
    },
    {
      header: 'Song Title',
      accessor: 'song_title',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-pink-950/80 border border-pink-500/30 flex items-center justify-center text-pink-400 shrink-0">
            <Music className="w-4 h-4" />
          </div>
          <div>
            <Link
              to={`/songs/${row.song_id}`}
              className="font-semibold text-slate-100 hover:text-pink-400 transition-colors"
            >
              {row.song_title}
            </Link>
            <p className="text-[11px] text-slate-400">ID: #{row.song_id}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Album',
      accessor: 'album_title',
      sortable: true,
      render: (row) => (
        <Link
          to={`/albums/${row.album_id}`}
          className="inline-flex items-center gap-1.5 text-xs text-cyan-300 hover:underline"
        >
          <Disc className="w-3.5 h-3.5 text-cyan-400" />
          {row.album_title}
        </Link>
      ),
    },
    {
      header: 'Artist',
      accessor: 'artist_name',
      sortable: true,
      render: (row) => (
        <Link
          to={`/artists/${row.artist_id}`}
          className="inline-flex items-center gap-1.5 text-xs text-purple-300 hover:underline"
        >
          <User className="w-3.5 h-3.5 text-purple-400" />
          {row.artist_name}
        </Link>
      ),
    },
    {
      header: 'Duration',
      accessor: 'duration_seconds',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs text-slate-400">
          {formatSeconds(row.duration_seconds)}
        </span>
      ),
    },
    {
      header: 'Producers & Writers',
      render: (row) => (
        <div className="text-xs space-y-0.5 max-w-[200px]">
          {row.producers && (
            <p className="text-amber-300/90 truncate flex items-center gap-1">
              <Sliders className="w-3 h-3 shrink-0 text-amber-400" />
              {row.producers}
            </p>
          )}
          {row.songwriters && (
            <p className="text-indigo-300/90 truncate flex items-center gap-1">
              <PenTool className="w-3 h-3 shrink-0 text-indigo-400" />
              {row.songwriters}
            </p>
          )}
        </div>
      ),
    },
    {
      header: 'Earnings (fn_song_earnings)',
      accessor: 'earnings',
      sortable: true,
      align: 'right',
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-emerald-400">
          {formatCurrency(row.earnings)}
        </span>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link
            to={`/songs/${row.song_id}`}
            title="View Song Details"
            className="p-1.5 text-slate-400 hover:text-pink-300 hover:bg-pink-950/40 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <button
            onClick={() => openEditModal(row)}
            title="Edit Song"
            className="p-1.5 text-slate-400 hover:text-purple-300 hover:bg-purple-950/40 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => openDeleteDialog(row)}
            title="Delete Song"
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
          <h2 className="text-xl font-bold text-white tracking-tight">Songs & Master Tracks</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Querying <code className="text-pink-400">v_song_details</code> with relational producer and songwriter credits
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-pink-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Add Track
        </button>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchData} />}

      <div className="flex items-center justify-between gap-4 glass-panel p-3 rounded-2xl border border-slate-800">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by title, album, artist, producer, or songwriter..."
          className="w-full max-w-md"
        />
        <div className="text-xs text-slate-400 font-mono">
          Total Tracks: <span className="text-pink-400 font-semibold">{filteredSongs.length}</span>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredSongs}
        keyField="song_id"
        isLoading={loading}
        emptyMessage="No songs match your search criteria."
      />

      {/* Add / Edit Song Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSong ? 'Edit Master Track' : 'Register New Song'}
        subtitle="Manage track metadata, duration, album, and production credits"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Song Title"
            name="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Skyline"
            required
            error={formErrors.title}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Track Number"
              name="track_number"
              type="number"
              min="1"
              value={formData.track_number}
              onChange={(e) => setFormData({ ...formData, track_number: e.target.value })}
              required
              error={formErrors.track_number}
              helpText="Unique per album"
            />

            <FormInput
              label="Duration (Seconds)"
              name="duration_seconds"
              type="number"
              min="1"
              value={formData.duration_seconds}
              onChange={(e) => setFormData({ ...formData, duration_seconds: e.target.value })}
              required
              error={formErrors.duration_seconds}
              helpText="Check: duration_seconds > 0"
            />
          </div>

          <SelectInput
            label="Album"
            name="album_id"
            value={formData.album_id}
            onChange={(e) => setFormData({ ...formData, album_id: e.target.value })}
            options={albums.map((al) => ({
              value: al.album_id,
              label: `${al.title} — ${al.artist_name}`,
            }))}
            placeholder="Assign to album..."
            required
            error={formErrors.album_id}
          />

          {/* Producers Checklist (Many-to-Many via song_producers) */}
          <div className="pt-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1.5">
              Producers (song_producers)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-dark-950/70 rounded-xl border border-slate-800 max-h-36 overflow-y-auto">
              {producers.map((p) => {
                const checked = formData.producer_ids.includes(p.producer_id);
                return (
                  <label
                    key={p.producer_id}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-xs border transition-colors ${
                      checked
                        ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                        : 'border-slate-800/80 text-slate-400 hover:bg-slate-800/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleProducerToggle(p.producer_id)}
                      className="rounded border-slate-700 text-amber-500 focus:ring-amber-500/20"
                    />
                    <span className="truncate">{p.producer_name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Songwriters Checklist (Many-to-Many via song_songwriters) */}
          <div className="pt-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1.5">
              Songwriters (song_songwriters)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-dark-950/70 rounded-xl border border-slate-800 max-h-36 overflow-y-auto">
              {songwriters.map((w) => {
                const checked = formData.songwriter_ids.includes(w.songwriter_id);
                return (
                  <label
                    key={w.songwriter_id}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-xs border transition-colors ${
                      checked
                        ? 'bg-indigo-950/40 border-indigo-500/40 text-indigo-200'
                        : 'border-slate-800/80 text-slate-400 hover:bg-slate-800/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleSongwriterToggle(w.songwriter_id)}
                      className="rounded border-slate-700 text-indigo-500 focus:ring-indigo-500/20"
                    />
                    <span className="truncate">{w.songwriter_name}</span>
                  </label>
                );
              })}
            </div>
          </div>

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
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-pink-600 hover:bg-pink-500 shadow-lg shadow-pink-900/30 transition-all flex items-center gap-2"
            >
              {submitting && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {editingSong ? 'Save Track' : 'Create Song'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Master Track"
        message={`Are you sure you want to delete "${songToDelete?.song_title}"? If royalties exist for this track, the foreign key constraint will reject deletion.`}
        confirmText="Confirm Delete"
        isLoading={submitting}
      />
    </div>
  );
}
