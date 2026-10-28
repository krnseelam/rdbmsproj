import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Music,
  Disc,
  User,
  Sliders,
  PenTool,
  Clock,
  Coins,
  Radio,
  Calendar,
} from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import StatCard from '../components/common/StatCard';

export default function SongDetail() {
  const { id } = useParams();
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSong = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.songs.getById(id);
        setSong(res.data);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to load song details');
      } finally {
        setLoading(false);
      }
    };
    fetchSong();
  }, [id]);

  if (loading) {
    return <LoadingSpinner message="Querying master track and stored function fn_song_earnings..." size="lg" />;
  }

  if (error || !song) {
    return (
      <div className="space-y-4">
        <Link to="/songs" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Back to Songs
        </Link>
        <ErrorMessage message={error || 'Song not found'} />
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

  const totalStreams = song.royalties?.reduce((acc, r) => acc + Number(r.stream_count || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <Link
        to="/songs"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Songs
      </Link>

      {/* Song Header */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 bg-gradient-to-r from-pink-950/30 via-dark-900 to-purple-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-pink-900/30 shrink-0">
              <Music className="w-10 h-10" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {song.song_title}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-pink-500/20 border border-pink-500/30 text-pink-300">
                  Track #{song.track_number}
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-1">
                Artist:{' '}
                <Link
                  to={`/artists/${song.artist_id}`}
                  className="font-semibold text-purple-400 hover:underline"
                >
                  {song.artist_name}
                </Link>{' '}
                • Album:{' '}
                <Link
                  to={`/albums/${song.album_id}`}
                  className="font-semibold text-cyan-400 hover:underline"
                >
                  {song.album_title}
                </Link>
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-pink-400" />
                  Duration: {formatSeconds(song.duration_seconds)} ({song.duration_seconds}s)
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  Release: {song.release_date}
                </span>
                <span className="flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-emerald-400" />
                  Function Earnings: <strong className="text-emerald-400 font-mono">{formatCurrency(song.earnings)}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Lifetime Earnings"
          value={formatCurrency(song.earnings)}
          subtitle="fn_song_earnings(song_id)"
          icon={Coins}
          color="emerald"
        />
        <StatCard
          title="Total Streams"
          value={totalStreams.toLocaleString()}
          subtitle="Across all DSP platforms"
          icon={Radio}
          color="cyan"
        />
        <StatCard
          title="Producers"
          value={song.producers?.length || 0}
          subtitle="song_producers relation"
          icon={Sliders}
          color="amber"
        />
        <StatCard
          title="Songwriters"
          value={song.songwriters?.length || 0}
          subtitle="song_songwriters relation"
          icon={PenTool}
          color="purple"
        />
      </div>

      {/* Producers and Songwriters Credits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Producers */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
            <Sliders className="w-5 h-5 text-amber-400" />
            Production Credits (song_producers)
          </h3>
          <div className="space-y-3">
            {song.producers && song.producers.length > 0 ? (
              song.producers.map((p) => (
                <div
                  key={p.producer_id}
                  className="p-3.5 rounded-xl bg-dark-900/60 border border-slate-800/80 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{p.producer_name}</p>
                    <p className="text-xs text-slate-400">{p.country} • {p.email}</p>
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/30 text-amber-300">
                    Producer
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic">No producers credited on this track.</p>
            )}
          </div>
        </div>

        {/* Songwriters */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
            <PenTool className="w-5 h-5 text-indigo-400" />
            Writing Credits (song_songwriters)
          </h3>
          <div className="space-y-3">
            {song.songwriters && song.songwriters.length > 0 ? (
              song.songwriters.map((w) => (
                <div
                  key={w.songwriter_id}
                  className="p-3.5 rounded-xl bg-dark-900/60 border border-slate-800/80 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{w.songwriter_name}</p>
                    <p className="text-xs text-slate-400">{w.country} • {w.email}</p>
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-500/30 text-indigo-300">
                    Songwriter
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic">No songwriters credited on this track.</p>
            )}
          </div>
        </div>
      </div>

      {/* Royalties Breakdown */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
          <Radio className="w-5 h-5 text-cyan-400" />
          Streaming & Royalty History by Platform
        </h3>

        {song.royalties && song.royalties.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-dark-950/60 text-slate-400 border-b border-slate-800 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Period</th>
                  <th className="py-2.5 px-3">Platform</th>
                  <th className="py-2.5 px-3 text-right">Stream Count</th>
                  <th className="py-2.5 px-3 text-right">Rate / Stream</th>
                  <th className="py-2.5 px-3 text-right">Calculated Earnings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                {song.royalties.map((r) => (
                  <tr key={r.royalty_id} className="hover:bg-slate-800/20">
                    <td className="py-2.5 px-3 text-slate-200">{r.royalty_period}</td>
                    <td className="py-2.5 px-3 font-sans font-medium text-cyan-300">
                      {r.platform_name}
                    </td>
                    <td className="py-2.5 px-3 text-right">{Number(r.stream_count).toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right text-slate-400">${r.rate_per_stream}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                      {formatCurrency(r.earnings)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic py-2">No royalty streams logged for this track yet.</p>
        )}
      </div>
    </div>
  );
}
