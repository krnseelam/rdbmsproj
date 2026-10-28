import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Disc, Music, Calendar, User, Plus, Clock, Coins } from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

export default function AlbumDetail() {
  const { id } = useParams();
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAlbumDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.albums.getById(id);
        setAlbum(res.data);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to load album details');
      } finally {
        setLoading(false);
      }
    };
    fetchAlbumDetail();
  }, [id]);

  if (loading) {
    return <LoadingSpinner message="Querying album discography..." size="lg" />;
  }

  if (error || !album) {
    return (
      <div className="space-y-4">
        <Link to="/albums" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Back to Albums
        </Link>
        <ErrorMessage message={error || 'Album not found'} />
      </div>
    );
  }

  const formatSeconds = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);

  const totalDuration = album.songs?.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) || 0;
  const totalEarnings = album.songs?.reduce((acc, s) => acc + Number(s.song_earnings || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <Link
        to="/albums"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Albums
      </Link>

      {/* Album Header */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 bg-gradient-to-r from-cyan-950/30 via-dark-900 to-indigo-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-xl shadow-cyan-900/30 shrink-0">
              <Disc className="w-10 h-10" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {album.title}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 border border-cyan-500/30 text-cyan-300">
                  Album #{album.album_id}
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-1">
                By{' '}
                <Link
                  to={`/artists/${album.artist_id}`}
                  className="font-semibold text-purple-400 hover:underline"
                >
                  {album.artist_name}
                </Link>{' '}
                ({album.artist_country})
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  Release Date: <strong className="text-slate-200">{album.release_date}</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-pink-400" />
                  {album.songs?.length || 0} Tracks
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  Total Duration: {formatSeconds(totalDuration)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-emerald-400" />
                  Earnings: {formatCurrency(totalEarnings)}
                </span>
              </div>
            </div>
          </div>

          <Link
            to="/songs"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 self-start sm:self-center transition-all"
          >
            <Plus className="w-4 h-4 text-purple-400" /> Add New Song
          </Link>
        </div>
      </div>

      {/* Tracklist Table */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
          <Music className="w-5 h-5 text-purple-400" />
          Album Tracklist (Populated via v_song_details)
        </h3>

        {album.songs && album.songs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-dark-950/60 text-slate-400 border-b border-slate-800 font-semibold">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">Track Title</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4 text-right">Lifetime Earnings (fn_song_earnings)</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-normal">
                {album.songs.map((song) => (
                  <tr key={song.song_id} className="hover:bg-slate-800/20">
                    <td className="py-3 px-4 text-center font-mono text-slate-500 font-bold">
                      {song.track_number}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-100">
                      <Link to={`/songs/${song.song_id}`} className="hover:text-purple-400">
                        {song.song_title}
                      </Link>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-400">
                      {formatSeconds(song.duration_seconds)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-xs font-semibold text-emerald-400">
                      {formatCurrency(song.song_earnings)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/songs/${song.song_id}`}
                        className="text-xs text-purple-400 hover:text-purple-300 font-medium"
                      >
                        View Song →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic py-4">No tracks listed in this album.</p>
        )}
      </div>
    </div>
  );
}
