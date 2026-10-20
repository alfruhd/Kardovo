'use client';

import React, { useState, useEffect } from 'react';
import { RsvpRecord } from '@/lib/supabase/rsvp-store';
import {
  Users,
  CheckCircle,
  XCircle,
  Download,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  Music,
  Baby,
  Mail,
  Phone,
} from 'lucide-react';

export default function OrganizerDashboardPage() {
  const [rsvps, setRsvps] = useState<RsvpRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'attending' | 'declined'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchResponses = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/rsvp');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setRsvps(data.data);
      }
    } catch (err) {
      console.error('Failed to load RSVPs', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResponses();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this RSVP response?')) return;
    try {
      const res = await fetch(`/api/rsvp?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRsvps((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete RSVP', err);
    }
  };

  // Metrics Calculations
  const attendingList = rsvps.filter((r) => r.attending);
  const decliningList = rsvps.filter((r) => !r.attending);
  const totalSeats = attendingList.reduce((acc, r) => acc + (r.guest_count || 1), 0);

  // Filtered Table Data
  const filteredRsvps = rsvps.filter((r) => {
    if (filterStatus === 'attending' && !r.attending) return false;
    if (filterStatus === 'declined' && r.attending) return false;
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const matchName = r.name.toLowerCase().includes(q);
      const matchEmail = (r.email || '').toLowerCase().includes(q);
      const matchDiet = (r.dietary_restrictions || '').toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchDiet) return false;
    }
    return true;
  });

  // Export to CSV Functionality
  const handleExportCsv = () => {
    const headers = [
      'ID',
      'Name',
      'Status',
      'Guest Count',
      'Email',
      'Phone',
      'Dietary Restrictions',
      'Song Request',
      'Children Details',
      'Guest Token',
      'Created At',
    ];

    const rows = filteredRsvps.map((r) => [
      `"${r.id}"`,
      `"${r.name.replace(/"/g, '""')}"`,
      r.attending ? 'Attending' : 'Declined',
      r.attending ? r.guest_count : 0,
      `"${(r.email || '').replace(/"/g, '""')}"`,
      `"${(r.phone || '').replace(/"/g, '""')}"`,
      `"${(r.dietary_restrictions || '').replace(/"/g, '""')}"`,
      `"${(r.song_request || '').replace(/"/g, '""')}"`,
      `"${JSON.stringify(r.children_details || []).replace(/"/g, '""')}"`,
      `"${r.guest_token || ''}"`,
      `"${r.created_at}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rsvp-responses-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#5a0f1b]/10 text-[#5a0f1b] font-serif font-bold text-xs uppercase tracking-wider">
                The Sacred Garden
              </span>
              <span className="text-stone-400 text-xs">/dashboard</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 mt-1">
              Guest Responses & RSVP Dashboard
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Monitor attendance, dietary restrictions, songs, and export real-time guest tallies.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="btn-refresh-dashboard"
              onClick={fetchResponses}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 shadow-sm transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              id="btn-export-csv"
              onClick={handleExportCsv}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-sm transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </header>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="dashboard-stats-grid">
          <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-stone-500 font-semibold">Attending</p>
              <h3 className="text-2xl font-bold text-stone-900" id="stat-attending-count">
                {attendingList.length}
              </h3>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-stone-500 font-semibold">Declined</p>
              <h3 className="text-2xl font-bold text-stone-900" id="stat-declined-count">
                {decliningList.length}
              </h3>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#a67d2b]/10 text-[#a67d2b] flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-stone-500 font-semibold">Total Seats</p>
              <h3 className="text-2xl font-bold text-stone-900" id="stat-total-seats">
                {totalSeats}
              </h3>
            </div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-dashboard-search"
              type="text"
              placeholder="Search by name, email, dietary..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-xl text-xs focus:ring-1 focus:ring-stone-800"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-xs text-stone-500 font-medium">Status:</span>
            <div className="flex rounded-xl border border-stone-300 p-0.5 bg-white text-xs">
              {(['all', 'attending', 'declined'] as const).map((mode) => (
                <button
                  key={mode}
                  id={`filter-btn-${mode}`}
                  onClick={() => setFilterStatus(mode)}
                  className={`px-3 py-1 rounded-lg capitalize font-medium transition ${
                    filterStatus === mode ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Responses Table */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs" id="dashboard-responses-table">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase font-semibold text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Guest</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Seats</th>
                  <th className="py-3 px-4">Dietary</th>
                  <th className="py-3 px-4">Song / Notes</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredRsvps.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-stone-400">
                      No RSVP responses found.
                    </td>
                  </tr>
                ) : (
                  filteredRsvps.map((rsvp) => (
                    <tr key={rsvp.id} className="hover:bg-stone-50/60 transition group">
                      <td className="py-3.5 px-4 font-medium text-stone-900">
                        <div className="flex flex-col">
                          <span className="font-semibold text-stone-900">{rsvp.name}</span>
                          {rsvp.email && (
                            <span className="text-[11px] text-stone-400 flex items-center gap-1">
                              <Mail className="w-3 h-3" /> {rsvp.email}
                            </span>
                          )}
                          {rsvp.phone && (
                            <span className="text-[11px] text-stone-400 flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {rsvp.phone}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {rsvp.attending ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px]">
                            <CheckCircle className="w-3 h-3" /> Attending
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 font-semibold text-[11px]">
                            <XCircle className="w-3 h-3" /> Declined
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-stone-700">
                        {rsvp.attending ? rsvp.guest_count : 0}
                      </td>

                      <td className="py-3.5 px-4 text-stone-600">
                        {rsvp.dietary_restrictions || '—'}
                      </td>

                      <td className="py-3.5 px-4 text-stone-600">
                        <div className="space-y-1">
                          {rsvp.song_request && (
                            <div className="flex items-center gap-1 text-[11px] text-stone-700">
                              <Music className="w-3 h-3 text-stone-400 shrink-0" />
                              <span className="truncate max-w-[150px]">{rsvp.song_request}</span>
                            </div>
                          )}
                          {rsvp.children_details && rsvp.children_details.length > 0 && (
                            <div className="flex items-center gap-1 text-[11px] text-stone-700">
                              <Baby className="w-3 h-3 text-stone-400 shrink-0" />
                              <span>{rsvp.children_details.length} Child(ren)</span>
                            </div>
                          )}
                          {!rsvp.song_request && (!rsvp.children_details || rsvp.children_details.length === 0) && '—'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-stone-400 text-[11px] whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(rsvp.created_at).toLocaleDateString()}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          title="Delete response"
                          onClick={() => handleDelete(rsvp.id)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition opacity-80 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
