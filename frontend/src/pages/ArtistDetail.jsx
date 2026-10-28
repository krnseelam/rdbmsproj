import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Mic2,
  Disc,
  Music,
  FileText,
  Radio,
  Coins,
  MapPin,
  Calendar,
  Mail,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import StatCard from '../components/common/StatCard';

export default function ArtistDetail() {
  const { id } = useParams();
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArtistDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.artists.getById(id);
        setArtist(res.data);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to load artist details');
      } finally {
        setLoading(false);
      }
    };
    fetchArtistDetail();
  }, [id]);

  if (loading) {
    return <LoadingSpinner message="Loading artist profile and database relations..." size="lg" />;
  }

  if (error || !artist) {
    return (
      <div className="space-y-4">
        <Link
          to="/artists"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Artists
        </Link>
        <ErrorMessage message={error || 'Artist not found'} />
      </div>
    );
  }

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);

  const formatSeconds = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        to="/artists"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Artists
      </Link>

      {/* Artist Profile Header Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 bg-gradient-to-r from-purple-950/30 via-dark-900 to-indigo-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-purple-900/30">
              {artist.stage_name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {artist.stage_name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 border border-purple-500/30 text-purple-300">
                  ID: #{artist.artist_id}
                </span>
              </div>
              {artist.real_name && (
                <p className="text-sm text-slate-400 mt-0.5">Real Name: {artist.real_name}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-purple-400" />
                  {artist.country}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  Debut Year: {artist.debut_year}
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-pink-400" />
                  {artist.email}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Albums"
          value={artist.albums?.length || 0}
          subtitle="Studio Releases"
          icon={Disc}
          color="cyan"
        />
        <StatCard
          title="Total Songs"
          value={artist.songs?.length || 0}
          subtitle="Tracks via v_song_details"
          icon={Music}
          color="purple"
        />
        <StatCard
          title="Total Streams"
          value={Number(artist.total_streams || 0).toLocaleString()}
          subtitle="Across all DSP platforms"
          icon={Radio}
          color="pink"
        />
        <StatCard
          title="Lifetime Earnings"
          value={formatCurrency(artist.total_earnings || 0)}
          subtitle="From v_royalty_earnings"
          icon={Coins}
          color="emerald"
        />
      </div>

      {/* Contracts Section */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            Contracts & Agreements ({artist.contracts?.length || 0})
          </h3>
          <Link
            to="/contracts"
            className="text-xs text-purple-400 hover:text-purple-300 font-medium"
          >
            Manage Contracts →
          </Link>
        </div>

        {artist.contracts && artist.contracts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-dark-950/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Contract ID</th>
                  <th className="py-2.5 px-3">Start Date</th>
                  <th className="py-2.5 px-3">End Date</th>
                  <th className="py-2.5 px-3">Royalty Rate</th>
                  <th className="py-2.5 px-3">Advance Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                {artist.contracts.map((c) => (
                  <tr key={c.contract_id} className="hover:bg-slate-800/20">
                    <td className="py-2.5 px-3 font-semibold text-slate-200">#{c.contract_id}</td>
                    <td className="py-2.5 px-3">{c.start_date}</td>
                    <td className="py-2.5 px-3">{c.end_date}</td>
                    <td className="py-2.5 px-3 text-purple-400 font-semibold">{c.royalty_percent}%</td>
                    <td className="py-2.5 px-3 text-emerald-400">{formatCurrency(c.advance_amount)}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-bold uppercase ${
                          c.status === 'Active'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                            : c.status === 'Expired'
                            ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">No contracts on file for this artist.</p>
        )}
      </div>

      {/* Discography: Albums & Songs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Albums list */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
            <Disc className="w-5 h-5 text-cyan-400" />
            Studio Albums ({artist.albums?.length || 0})
          </h3>
          <div className="space-y-3">
            {artist.albums && artist.albums.length > 0 ? (
              artist.albums.map((al) => (
                <div
                  key={al.album_id}
                  className="p-3.5 rounded-xl bg-dark-900/60 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                      <Disc className="w-4 h-4" />
                    </div>
                    <div>
                      <Link
                        to={`/albums/${al.album_id}`}
                        className="text-sm font-semibold text-slate-200 hover:text-cyan-300"
                      >
                        {al.title}
                      </Link>
                      <p className="text-xs text-slate-400 font-mono">Released: {al.release_date}</p>
                    </div>
                  </div>
                  <Link
                    to={`/albums/${al.album_id}`}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                  >
                    View Album →
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic">No albums released yet.</p>
            )}
          </div>
        </div>

        {/* Songs list */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
            <Music className="w-5 h-5 text-pink-400" />
            Master Tracks ({artist.songs?.length || 0})
          </h3>
          <div className="divide-y divide-slate-800/60 max-h-96 overflow-y-auto">
            {artist.songs && artist.songs.length > 0 ? (
              artist.songs.map((song) => (
                <div key={song.song_id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono text-slate-500 w-6 text-center">
                      #{song.track_number}
                    </span>
                    <div className="min-w-0">
                      <Link
                        to={`/songs/${song.song_id}`}
                        className="text-sm font-semibold text-slate-200 hover:text-pink-300 truncate block"
                      >
                        {song.song_title}
                      </Link>
                      <p className="text-xs text-slate-400 truncate">{song.album_title}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 font-mono text-xs text-slate-400">
                    {formatSeconds(song.duration_seconds)}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic">No songs released yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
