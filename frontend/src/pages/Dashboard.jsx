import React, { useEffect, useState } from 'react';
import {
  Mic2,
  Disc,
  Music,
  Sliders,
  PenTool,
  FileText,
  Radio,
  Coins,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import api from '../services/api';
import StatCard from '../components/common/StatCard';
import ChartCard from '../components/common/ChartCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const PIE_COLORS = ['#8B5CF6', '#06B6D4', '#EC4899', '#10B981', '#F59E0B', '#6366F1'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [earningsTrend, setEarningsTrend] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [topSongs, setTopSongs] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, earningsRes, artistsRes, songsRes, platformsRes] = await Promise.all([
        api.dashboard.getStats(),
        api.dashboard.getEarnings(),
        api.dashboard.getTopArtists(),
        api.dashboard.getTopSongs(),
        api.dashboard.getPlatforms(),
      ]);

      setStats(statsRes.data);
      setEarningsTrend(earningsRes.data || []);
      setTopArtists(artistsRes.data || []);
      setTopSongs(songsRes.data || []);
      setPlatforms(platformsRes.data || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data from MySQL');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Querying database metrics and views..." size="lg" />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchDashboardData} />;
  }

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);

  const formatNumber = (val) =>
    new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(val || 0);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden glass-panel rounded-3xl p-6 lg:p-8 border border-purple-500/20 bg-gradient-to-r from-purple-950/40 via-dark-900 to-indigo-950/30">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-3">
            <TrendingUp className="w-3.5 h-3.5" />
            Live Database Analytics
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Sonic Recordings RDBMS Portal
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Enterprise management for recording artists, contracts, master tracks, multi-platform streaming, and automated MySQL royalty payout calculations.
          </p>
        </div>
      </div>

      {/* Primary KPI Stat Cards (8 key metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Artists"
          value={stats?.total_artists ?? 0}
          subtitle="Signed talent roster"
          icon={Mic2}
          color="purple"
        />
        <StatCard
          title="Total Albums"
          value={stats?.total_albums ?? 0}
          subtitle="Released discography"
          icon={Disc}
          color="cyan"
        />
        <StatCard
          title="Total Songs"
          value={stats?.total_songs ?? 0}
          subtitle="Master catalogue tracks"
          icon={Music}
          color="pink"
        />
        <StatCard
          title="Active Contracts"
          value={stats?.active_contracts ?? 0}
          subtitle="v_active_contracts"
          icon={FileText}
          color="emerald"
        />
        <StatCard
          title="Total Streams"
          value={formatNumber(stats?.total_streams ?? 0)}
          subtitle={`${Number(stats?.total_streams || 0).toLocaleString()} all-time`}
          icon={Radio}
          color="cyan"
        />
        <StatCard
          title="Royalty Earnings"
          value={formatCurrency(stats?.total_earnings ?? 0)}
          subtitle="Calculated in v_royalty_earnings"
          icon={Coins}
          color="emerald"
        />
        <StatCard
          title="Producers"
          value={stats?.total_producers ?? 0}
          subtitle="Production network"
          icon={Sliders}
          color="amber"
        />
        <StatCard
          title="Songwriters"
          value={stats?.total_songwriters ?? 0}
          subtitle="Writing credits"
          icon={PenTool}
          color="purple"
        />
      </div>

      {/* Charts Section 1: Monthly Trend & Platform Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Earnings Area Chart */}
        <ChartCard
          title="Monthly Royalty Earnings"
          subtitle="Revenue generated across all streaming platforms"
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={earningsTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="royalty_period" stroke="#64748B" fontSize={12} tickLine={false} />
              <YAxis
                stroke="#64748B"
                fontSize={12}
                tickLine={false}
                tickFormatter={(val) => `$${val / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0C101A',
                  border: '1px solid #2D3E61',
                  borderRadius: '12px',
                  color: '#fff',
                }}
                formatter={(val) => [formatCurrency(val), 'Earnings']}
              />
              <Area
                type="monotone"
                dataKey="total_earnings"
                stroke="#8B5CF6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#earningsGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Platform Share Donut Chart */}
        <ChartCard
          title="Streams by Platform"
          subtitle="Share of streams by digital service provider"
        >
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={platforms}
                dataKey="total_streams"
                nameKey="platform_name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
              >
                {platforms.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0C101A',
                  border: '1px solid #2D3E61',
                  borderRadius: '12px',
                  color: '#fff',
                }}
                formatter={(val) => [Number(val).toLocaleString() + ' streams', 'Streams']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-2 text-xs">
            {platforms.map((p, idx) => (
              <div key={p.platform_name} className="flex items-center gap-1.5 text-slate-300">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                />
                <span>{p.platform_name}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Charts Section 2: Top Artists by Earnings & Top Songs by Streams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Artists by Earnings */}
        <ChartCard
          title="Top 5 Artists by Earnings"
          subtitle="Total royalty revenue generated by catalog"
          action={
            <Link
              to="/artists"
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          }
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={topArtists}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <XAxis
                type="number"
                stroke="#64748B"
                fontSize={12}
                tickFormatter={(val) => `$${val / 1000}k`}
              />
              <YAxis
                type="category"
                dataKey="artist_name"
                stroke="#64748B"
                fontSize={12}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0C101A',
                  border: '1px solid #2D3E61',
                  borderRadius: '12px',
                  color: '#fff',
                }}
                formatter={(val) => [formatCurrency(val), 'Earnings']}
              />
              <Bar dataKey="total_earnings" fill="#8B5CF6" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Top 5 Songs by Streams */}
        <ChartCard
          title="Top 5 Songs by Streams"
          subtitle="Highest stream counts across all platforms"
          action={
            <Link
              to="/songs"
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          }
        >
          <div className="divide-y divide-slate-800/80">
            {topSongs.map((song, idx) => (
              <div key={song.song_id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 text-sm font-bold text-slate-500 text-center">
                    #{idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-200 truncate">
                      {song.song_title}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{song.artist_name}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-cyan-400">
                    {Number(song.total_streams).toLocaleString()}
                  </p>
                  <p className="text-xs text-emerald-400 font-medium">
                    {formatCurrency(song.total_earnings)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
