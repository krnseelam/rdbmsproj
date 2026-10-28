import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Coins,
  TrendingUp,
  Percent,
  User,
  Calendar,
  CheckCircle2,
  DollarSign,
  ArrowRight,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import DataTable from '../components/common/DataTable';
import StatCard from '../components/common/StatCard';
import ChartCard from '../components/common/ChartCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

export default function Payouts() {
  const [periods, setPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('2026-09-01');
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  const { success, error: toastError } = useToast();

  useEffect(() => {
    const fetchPeriods = async () => {
      try {
        setInitialLoading(true);
        const res = await api.payouts.getPeriods();
        const available = res.data || [];
        setPeriods(available);
        if (available.length > 0) {
          setSelectedPeriod(available[0]);
          handleCalculate(available[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchPeriods();
  }, []);

  const handleCalculate = async (periodToCalc) => {
    const targetPeriod = periodToCalc || selectedPeriod;
    if (!targetPeriod) return;

    try {
      setLoading(true);
      setError(null);
      const res = await api.payouts.calculate(targetPeriod);
      setResults(res.data || []);
      setSummary(res.summary || null);
      success(`Calculated payouts for period ${targetPeriod} via sp_calculate_payouts()`);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to execute sp_calculate_payouts');
      toastError(err.message || 'Stored procedure execution failed');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);

  const columns = [
    {
      header: 'Artist',
      accessor: 'stage_name',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-xs">
            {row.stage_name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-100">{row.stage_name}</p>
            <p className="text-[11px] text-slate-500 font-mono">Artist #{row.artist_id}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Gross Revenue Generated',
      accessor: 'revenue',
      sortable: true,
      align: 'right',
      render: (row) => (
        <span className="font-mono text-xs text-slate-300 font-medium">
          {formatCurrency(row.revenue)}
        </span>
      ),
    },
    {
      header: 'Contract Royalty %',
      accessor: 'royalty_percent',
      sortable: true,
      align: 'right',
      render: (row) => (
        <span
          className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${
            row.royalty_percent > 0
              ? 'text-purple-300 bg-purple-950/60 border border-purple-500/30'
              : 'text-slate-500 bg-slate-900 border border-slate-800'
          }`}
        >
          {row.royalty_percent > 0 ? `${row.royalty_percent}%` : '0% (No Active Contract)'}
        </span>
      ),
    },
    {
      header: 'Calculated Net Payout',
      accessor: 'payout',
      sortable: true,
      align: 'right',
      render: (row) => (
        <span
          className={`font-mono text-sm font-bold ${
            row.payout > 0 ? 'text-emerald-400' : 'text-slate-500'
          }`}
        >
          {formatCurrency(row.payout)}
        </span>
      ),
    },
  ];

  if (initialLoading) {
    return <LoadingSpinner message="Initializing stored procedure environment..." size="lg" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Royalty Payouts Calculator
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Executes MySQL stored procedure <code className="text-emerald-400">sp_calculate_payouts(p_period)</code> with temporary table cursors
          </p>
        </div>
      </div>

      {/* Period Selection Control Bar */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-dark-900 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-purple-400" />
            Select Royalty Period:
          </label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 bg-dark-950 border border-slate-700/80 focus:border-purple-500 rounded-xl text-sm font-mono text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          >
            {periods.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
            {!periods.includes(selectedPeriod) && (
              <option value={selectedPeriod}>{selectedPeriod} (Custom)</option>
            )}
          </select>
          <input
            type="date"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 bg-dark-950 border border-slate-700/80 focus:border-purple-500 rounded-xl text-xs font-mono text-slate-200 focus:outline-none"
          />
        </div>

        <button
          onClick={() => handleCalculate()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-900/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Calculator className="w-4 h-4" />
          )}
          Calculate Payouts
        </button>
      </div>

      {error && <ErrorMessage message={error} onRetry={() => handleCalculate()} />}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Total Payout to Artists"
            value={formatCurrency(summary.totalPayout)}
            subtitle={`Period: ${selectedPeriod}`}
            icon={Coins}
            color="emerald"
          />
          <StatCard
            title="Gross Period Revenue"
            value={formatCurrency(summary.totalRevenue)}
            subtitle="Generated across all songs"
            icon={DollarSign}
            color="cyan"
          />
          <StatCard
            title="Effective Payout Rate"
            value={`${summary.effectiveRate}%`}
            subtitle={`${summary.artistCount} artists processed in temporary table`}
            icon={Percent}
            color="purple"
          />
        </div>
      )}

      {/* Payout Distribution Chart */}
      {results.length > 0 && (
        <ChartCard
          title={`Artist Payouts Distribution — ${selectedPeriod}`}
          subtitle="Calculated from stored procedure cursor looping over tmp_payout"
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={results.filter((r) => r.payout > 0)}
              margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
            >
              <XAxis dataKey="stage_name" stroke="#64748B" fontSize={12} tickLine={false} />
              <YAxis
                stroke="#64748B"
                fontSize={12}
                tickLine={false}
                tickFormatter={(val) => `$${val}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0C101A',
                  border: '1px solid #2D3E61',
                  borderRadius: '12px',
                  color: '#fff',
                }}
                formatter={(val) => [formatCurrency(val), 'Artist Payout']}
              />
              <Bar dataKey="payout" fill="#10B981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* Payout Results Table */}
      <DataTable
        columns={columns}
        data={results}
        keyField="artist_id"
        isLoading={loading}
        emptyMessage="No payout calculations available for this period."
      />
    </div>
  );
}
