import React, { useState, useEffect, useMemo } from 'react';
import { Coins, Database, Plus, Filter, TrendingUp, Calendar, Radio, Music, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import DataTable from '../components/common/DataTable';
import SearchBar from '../components/common/SearchBar';
import FilterDropdown from '../components/common/FilterDropdown';
import FormInput from '../components/common/FormInput';
import SelectInput from '../components/common/SelectInput';
import ErrorMessage from '../components/common/ErrorMessage';
import StatCard from '../components/common/StatCard';

export default function Royalties() {
  const [activeTab, setActiveTab] = useState('records'); // 'records', 'earnings', 'add'

  // Tab 1: Records
  const [records, setRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsSearch, setRecordsSearch] = useState('');

  // Tab 2: Earnings from v_royalty_earnings
  const [earnings, setEarnings] = useState([]);
  const [earningsSummary, setEarningsSummary] = useState(null);
  const [earningsLoading, setEarningsLoading] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');

  // Tab 3: Add Royalty form
  const [songs, setSongs] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [artists, setArtists] = useState([]);
  const [addForm, setAddForm] = useState({
    song_id: '',
    platform_id: '',
    period: '2026-09-01',
    streams: 500000,
  });
  const [addErrors, setAddErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [triggerError, setTriggerError] = useState(null);

  const { success, error: toastError } = useToast();

  // Load auxiliary data for dropdowns
  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [songsRes, platformsRes, artistsRes] = await Promise.all([
          api.songs.getAll(),
          api.platforms.getAll(),
          api.artists.getAll(),
        ]);
        setSongs(songsRes.data || []);
        setPlatforms(platformsRes.data || []);
        setArtists(artistsRes.data || []);

        if (songsRes.data?.length > 0 && !addForm.song_id) {
          setAddForm((prev) => ({
            ...prev,
            song_id: songsRes.data[0].song_id,
            platform_id: platformsRes.data?.[0]?.platform_id || '',
          }));
        }
      } catch (err) {
        console.error('Failed to load lookups:', err);
      }
    };
    loadLookups();
  }, []);

  // Fetch Tab 1 Records
  const fetchRecords = async () => {
    try {
      setRecordsLoading(true);
      const res = await api.royalties.getRecords();
      setRecords(res.data || []);
    } catch (err) {
      toastError(err.message || 'Failed to fetch royalty records');
    } finally {
      setRecordsLoading(false);
    }
  };

  // Fetch Tab 2 Earnings from v_royalty_earnings with filters
  const fetchEarnings = async () => {
    try {
      setEarningsLoading(true);
      const res = await api.royalties.getEarnings({
        artist_id: selectedArtist,
        platform_name: selectedPlatform,
        period: selectedMonth,
      });
      setEarnings(res.data || []);
      setEarningsSummary(res.summary || null);
    } catch (err) {
      toastError(err.message || 'Failed to fetch royalty earnings view');
    } finally {
      setEarningsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'records') {
      fetchRecords();
    } else if (activeTab === 'earnings') {
      fetchEarnings();
    }
  }, [activeTab, selectedArtist, selectedPlatform, selectedMonth]);

  // Tab 3 Form Submission: Calls CALL sp_add_royalty(song_id, platform_id, period, streams)
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setTriggerError(null);

    const errs = {};
    if (!addForm.song_id) errs.song_id = 'Song is required';
    if (!addForm.platform_id) errs.platform_id = 'Platform is required';
    if (!addForm.period) errs.period = 'Royalty period date is required';
    if (addForm.streams === '' || Number(addForm.streams) < 0) {
      errs.streams = 'Streams must be 0 or greater (ck_royalties_streams)';
    }

    if (Object.keys(errs).length > 0) {
      setAddErrors(errs);
      return;
    }

    try {
      setSubmitting(true);
      await api.royalties.add(addForm);
      success(
        'Royalty added successfully via sp_add_royalty (increments existing stream counts on duplicate period).'
      );
      // Reset form or switch to records
      setActiveTab('records');
    } catch (err) {
      // Captures MySQL trigger 'trg_royalties_before_insert'
      // e.g. "Royalty period is before the album release date"
      setTriggerError(err.message || 'Stored procedure execution rejected by database');
      toastError(err.message || 'Failed to execute sp_add_royalty');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);

  // Tab 1 Columns (Royalty Records)
  const recordColumns = [
    {
      header: 'Song Title',
      accessor: 'song_title',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <Music className="w-4 h-4 text-pink-400 shrink-0" />
          <Link to={`/songs/${row.song_id}`} className="font-semibold text-slate-100 hover:text-pink-400">
            {row.song_title}
          </Link>
        </div>
      ),
    },
    {
      header: 'Artist',
      accessor: 'artist_name',
      sortable: true,
      render: (row) => (
        <Link to={`/artists/${row.artist_id}`} className="text-xs text-purple-300 hover:underline">
          {row.artist_name}
        </Link>
      ),
    },
    {
      header: 'Streaming Platform',
      accessor: 'platform_name',
      sortable: true,
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-xs text-cyan-300 font-medium">
          <Radio className="w-3.5 h-3.5 text-cyan-400" />
          {row.platform_name}
        </span>
      ),
    },
    {
      header: 'Royalty Period',
      accessor: 'royalty_period',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs text-slate-300 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          {row.royalty_period}
        </span>
      ),
    },
    {
      header: 'Stream Count',
      accessor: 'stream_count',
      sortable: true,
      align: 'right',
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-cyan-300">
          {Number(row.stream_count).toLocaleString()}
        </span>
      ),
    },
  ];

  // Tab 2 Columns (Earnings via v_royalty_earnings)
  const earningsColumns = [
    {
      header: 'Song',
      accessor: 'song_title',
      sortable: true,
      render: (row) => (
        <Link to={`/songs/${row.song_id}`} className="font-semibold text-slate-100 hover:text-purple-400">
          {row.song_title}
        </Link>
      ),
    },
    {
      header: 'Artist',
      accessor: 'artist_name',
      sortable: true,
      render: (row) => (
        <Link to={`/artists/${row.artist_id}`} className="text-xs text-purple-300 hover:underline">
          {row.artist_name}
        </Link>
      ),
    },
    {
      header: 'Platform',
      accessor: 'platform_name',
      sortable: true,
      render: (row) => (
        <span className="text-xs font-medium text-cyan-300">{row.platform_name}</span>
      ),
    },
    {
      header: 'Period',
      accessor: 'royalty_period',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs text-slate-300">{row.royalty_period}</span>
      ),
    },
    {
      header: 'Streams',
      accessor: 'stream_count',
      sortable: true,
      align: 'right',
      render: (row) => (
        <span className="font-mono text-xs text-slate-300">
          {Number(row.stream_count).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Rate / Stream',
      accessor: 'rate_per_stream',
      sortable: true,
      align: 'right',
      render: (row) => (
        <span className="font-mono text-xs text-slate-400">
          ${Number(row.rate_per_stream).toFixed(6)}
        </span>
      ),
    },
    {
      header: 'Calculated Earnings',
      accessor: 'earnings',
      sortable: true,
      align: 'right',
      render: (row) => (
        <span className="font-mono text-xs font-bold text-emerald-400">
          {formatCurrency(row.earnings)}
        </span>
      ),
    },
  ];

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const q = recordsSearch.toLowerCase();
      return (
        r.song_title?.toLowerCase().includes(q) ||
        r.artist_name?.toLowerCase().includes(q) ||
        r.platform_name?.toLowerCase().includes(q) ||
        r.royalty_period?.includes(q)
      );
    });
  }, [records, recordsSearch]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Royalties & Stream Earnings</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monetization tracked across DSPs, view <code className="text-purple-400">v_royalty_earnings</code>, and procedures
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 p-1 bg-dark-900 border border-slate-800 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('records')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'records'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          1. Royalty Records ({records.length})
        </button>
        <button
          onClick={() => setActiveTab('earnings')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'earnings'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          2. Earnings Analysis (v_royalty_earnings)
        </button>
        <button
          onClick={() => setActiveTab('add')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'add'
              ? 'bg-pink-600 text-white shadow-md shadow-pink-900/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          3. Add Royalty (sp_add_royalty)
        </button>
      </div>

      {/* TAB 1: Royalty Records */}
      {activeTab === 'records' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 glass-panel p-3 rounded-2xl border border-slate-800">
            <SearchBar
              value={recordsSearch}
              onChange={setRecordsSearch}
              placeholder="Filter records by song, artist, platform, or period..."
              className="w-full max-w-md"
            />
            <div className="text-xs text-slate-400 font-mono">
              Total Stream Records: <span className="text-purple-400 font-semibold">{filteredRecords.length}</span>
            </div>
          </div>

          <DataTable
            columns={recordColumns}
            data={filteredRecords}
            keyField="royalty_id"
            isLoading={recordsLoading}
            emptyMessage="No royalty records found."
          />
        </div>
      )}

      {/* TAB 2: Earnings Analysis (v_royalty_earnings) */}
      {activeTab === 'earnings' && (
        <div className="space-y-4">
          {/* Summary Cards */}
          {earningsSummary && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                title="Filtered Earnings"
                value={formatCurrency(earningsSummary.totalEarnings)}
                subtitle="Calculated in v_royalty_earnings"
                icon={Coins}
                color="emerald"
              />
              <StatCard
                title="Filtered Streams"
                value={Number(earningsSummary.totalStreams).toLocaleString()}
                subtitle="Aggregated DSP playback count"
                icon={Radio}
                color="cyan"
              />
              <StatCard
                title="Entries Matched"
                value={earningsSummary.recordCount}
                subtitle="Matching current filter query"
                icon={Database}
                color="purple"
              />
            </div>
          )}

          {/* Interactive Filters Bar */}
          <div className="flex flex-wrap items-center gap-4 glass-panel p-4 rounded-2xl border border-slate-800">
            <FilterDropdown
              label="Artist"
              value={selectedArtist}
              onChange={setSelectedArtist}
              options={artists.map((a) => ({ value: a.artist_id, label: a.stage_name }))}
              allLabel="All Artists"
            />

            <FilterDropdown
              label="Platform"
              value={selectedPlatform}
              onChange={setSelectedPlatform}
              options={platforms.map((p) => p.platform_name)}
              allLabel="All Platforms"
            />

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                Period / Month:
              </span>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 bg-dark-900/90 border border-slate-700/60 focus:border-purple-500 rounded-xl text-sm text-slate-200 focus:outline-none"
              />
              {selectedMonth && (
                <button
                  onClick={() => setSelectedMonth('')}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <DataTable
            columns={earningsColumns}
            data={earnings}
            keyField="royalty_id"
            isLoading={earningsLoading}
            emptyMessage="No royalty earnings match the selected criteria."
          />
        </div>
      )}

      {/* TAB 3: Add Royalty Form (Calls sp_add_royalty) */}
      {activeTab === 'add' && (
        <div className="max-w-xl mx-auto glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-dark-900/90">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-semibold mb-2">
              <Database className="w-3.5 h-3.5" />
              MySQL Stored Procedure Call
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Execute Stored Procedure: <code>sp_add_royalty()</code>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Submits directly to <code>CALL sp_add_royalty(song_id, platform_id, period, streams)</code>.
              MySQL automatically accumulates stream counts on duplicate entries, and trigger{' '}
              <code>trg_royalties_before_insert</code> validates that the royalty date is on/after the album release date.
            </p>
          </div>

          {triggerError && (
            <ErrorMessage
              message={triggerError}
              errorType="TRIGGER_VIOLATION"
              detail="SIGNAL SQLSTATE '45000' raised by trg_royalties_before_insert"
            />
          )}

          <form onSubmit={handleAddSubmit} className="space-y-4">
            <SelectInput
              label="Select Master Track"
              name="song_id"
              value={addForm.song_id}
              onChange={(e) => setAddForm({ ...addForm, song_id: e.target.value })}
              options={songs.map((s) => ({
                value: s.song_id,
                label: `${s.song_title} — ${s.artist_name} (Released: ${s.release_date})`,
              }))}
              placeholder="Choose track..."
              required
              error={addErrors.song_id}
            />

            <SelectInput
              label="Streaming Platform"
              name="platform_id"
              value={addForm.platform_id}
              onChange={(e) => setAddForm({ ...addForm, platform_id: e.target.value })}
              options={platforms.map((p) => ({
                value: p.platform_id,
                label: `${p.platform_name} ($${p.rate_per_stream}/stream)`,
              }))}
              placeholder="Select DSP platform..."
              required
              error={addErrors.platform_id}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Royalty Period (1st of Month)"
                name="period"
                type="date"
                value={addForm.period}
                onChange={(e) => setAddForm({ ...addForm, period: e.target.value })}
                required
                error={addErrors.period}
                helpText="Trigger validates: LAST_DAY(period) >= release_date"
              />

              <FormInput
                label="Stream Count"
                name="streams"
                type="number"
                min="0"
                step="1000"
                value={addForm.streams}
                onChange={(e) => setAddForm({ ...addForm, streams: e.target.value })}
                required
                error={addErrors.streams}
                helpText="Non-negative BIGINT"
              />
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('records')}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 shadow-lg shadow-pink-900/30 transition-all flex items-center gap-2"
              >
                {submitting && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                Call sp_add_royalty()
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
