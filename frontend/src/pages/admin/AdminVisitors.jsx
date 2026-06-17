import { useState, useEffect } from 'react';
import {
  Users, Eye, Clock, Globe, Monitor, Smartphone, Tablet,
  Chrome, Search, X, MapPin, ChevronDown, ChevronUp,
} from 'lucide-react';
import { getVisitors, getVisitorStats } from '../../api/visitorApi';
import { PageLoading } from '../../components/LoadingSpinner';

const browserIcons = {
  Chrome: <Chrome size={14} />,
  Firefox: <Globe size={14} />,
  Safari: <Globe size={14} />,
  Edge: <Globe size={14} />,
};

const deviceIcons = {
  Desktop: <Monitor size={14} />,
  Mobile: <Smartphone size={14} />,
  Tablet: <Tablet size={14} />,
};

const AdminVisitors = () => {
  const [visitors, setVisitors] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [dateFilter, setDateFilter] = useState('all');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [visitorsData, statsData] = await Promise.all([
        getVisitors(),
        getVisitorStats(),
      ]);
      setVisitors(visitorsData);
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching visitors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = visitors.filter(v => {
    const matchSearch = !search || 
      v.visitorId?.toLowerCase().includes(search.toLowerCase()) ||
      v.browser?.toLowerCase().includes(search.toLowerCase()) ||
      v.os?.toLowerCase().includes(search.toLowerCase()) ||
      v.deviceType?.toLowerCase().includes(search.toLowerCase()) ||
      v.ipAddress?.includes(search);

    if (!matchSearch) return false;
    if (dateFilter === 'today') {
      const today = new Date().toDateString();
      return new Date(v.lastVisit).toDateString() === today;
    }
    if (dateFilter === 'week') {
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return new Date(v.lastVisit).getTime() > weekAgo;
    }
    return true;
  });

  if (loading) return <PageLoading />;

  const formatDate = (d) => {
    if (!d) return '-';
    const date = new Date(d);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const timeAgo = (d) => {
    if (!d) return '';
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Visitors</h1>
        <p className="text-sm text-gray-500 mt-0.5">Track website visitors & browser analytics</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500">Total Visitors</p>
              <Users size={16} className="text-indigo-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500">Today</p>
              <Eye size={16} className="text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.today}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500">Online Now</p>
              <Clock size={16} className="text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.online}</p>
            <p className="text-xs text-gray-400 mt-1">Last 5 minutes</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500">Consented</p>
              <Users size={16} className="text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.consented}</p>
            <p className="text-xs text-gray-400 mt-1">{stats.total ? Math.round(stats.consented / stats.total * 100) : 0}% of total</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500">Browsers</p>
              <Globe size={16} className="text-purple-500" />
            </div>
            <div className="space-y-1">
              {(stats.browsers || []).slice(0, 3).map((b, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">{b.browser || 'Unknown'}</span>
                  <span className="text-gray-900 font-medium">{b.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wider">Browser Breakdown</h3>
            <div className="space-y-2">
              {(stats.browsers || []).map((b, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {browserIcons[b.browser] || <Globe size={14} className="text-gray-400" />}
                    <span className="text-sm text-gray-700">{b.browser || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${stats.total ? (b.count / stats.total * 100) : 0}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 font-medium w-8 text-right">{b.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wider">OS Breakdown</h3>
            <div className="space-y-2">
              {(stats.oss || []).map((o, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{o.os || 'Unknown'}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stats.total ? (o.count / stats.total * 100) : 0}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 font-medium w-8 text-right">{o.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wider">Device Breakdown</h3>
            <div className="space-y-2">
              {(stats.devices || []).map((d, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {deviceIcons[d.device_type] || <Monitor size={14} className="text-gray-400" />}
                    <span className="text-sm text-gray-700">{d.device_type || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${stats.total ? (d.count / stats.total * 100) : 0}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 font-medium w-8 text-right">{d.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search visitors..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 w-48"
              />
            </div>
            {search && (
              <button onClick={() => setSearch('')} className="text-xs text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>
          <div className="flex gap-1">
            {['all', 'today', 'week'].map(f => (
              <button
                key={f}
                onClick={() => setDateFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize ${
                  dateFilter === f
                    ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                    : 'text-gray-500 hover:text-gray-700 border border-transparent'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="px-5 py-3 text-xs text-gray-400 font-medium">Visitor</th>
                <th className="px-4 py-3 text-xs text-gray-400 font-medium">Device</th>
                <th className="px-4 py-3 text-xs text-gray-400 font-medium">Browser / OS</th>
                <th className="px-4 py-3 text-xs text-gray-400 font-medium">Location</th>
                <th className="px-4 py-3 text-xs text-gray-400 font-medium">Visits</th>
                <th className="px-4 py-3 text-xs text-gray-400 font-medium">Last Visit</th>
                <th className="px-4 py-3 text-xs text-gray-400 font-medium">Consent</th>
                <th className="pr-5 py-3 text-xs text-gray-400 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-sm text-gray-400">
                    No visitors found
                  </td>
                </tr>
              ) : filtered.map((v) => (
                <tbody key={v.id}>
                  <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => setExpanded(expanded === v.id ? null : v.id)}>
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="text-sm text-gray-900 font-mono text-xs">{v.visitorId?.substring(0, 16)}...</p>
                        <p className="text-xs text-gray-400">{v.ipAddress || '-'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        {deviceIcons[v.deviceType] || <Monitor size={14} className="text-gray-400" />}
                        <span className="text-sm text-gray-700">{v.deviceType || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        {browserIcons[v.browser] || <Globe size={14} className="text-gray-400" />}
                        <span className="text-sm text-gray-700">{v.browser || '?'}</span>
                        <span className="text-xs text-gray-400">/</span>
                        <span className="text-xs text-gray-500">{v.os || '?'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={12} className="text-gray-400" />
                        <span className="text-xs text-gray-500">{v.language || '-'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm font-medium text-gray-900">{v.visitCount || 1}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm text-gray-700">{timeAgo(v.lastVisit)}</p>
                      <p className="text-xs text-gray-400">{formatDate(v.lastVisit)}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                        v.consentGiven ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-gray-50 text-gray-400 border border-gray-200'
                      }`}>
                        {v.consentGiven ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="pr-5 py-3.5 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelected(v); }}
                        className="text-xs text-indigo-600 hover:text-indigo-800"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                  {expanded === v.id && (
                    <tr className="bg-gray-50">
                      <td colSpan={8} className="px-5 py-4">
                        <div className="text-xs text-gray-600 space-y-1">
                          <p><span className="font-medium text-gray-700">Visitor ID:</span> {v.visitorId}</p>
                          <p><span className="font-medium text-gray-700">IP:</span> {v.ipAddress || '-'}</p>
                          <p><span className="font-medium text-gray-700">Screen:</span> {v.screenResolution || '-'}</p>
                          <p><span className="font-medium text-gray-700">Timezone:</span> {v.timezone || '-'}</p>
                          <p><span className="font-medium text-gray-700">Language:</span> {v.language || '-'}</p>
                          <p><span className="font-medium text-gray-700">Referrer:</span> {v.referrer || 'Direct'}</p>
                          <p><span className="font-medium text-gray-700">First Visit:</span> {formatDate(v.firstVisit)}</p>
                          {v.pagesVisited && v.pagesVisited.length > 0 && (
                            <div>
                              <p className="font-medium text-gray-700 mb-1 mt-2">Pages Visited ({v.pagesVisited.length}):</p>
                              <div className="flex flex-wrap gap-1">
                                {v.pagesVisited.map((p, i) => (
                                  <span key={i} className="bg-white px-2 py-0.5 rounded border border-gray-200 text-xs text-gray-600">
                                    {p.page}
                                    <span className="text-gray-400 ml-1">{p.timestamp ? new Date(p.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400 text-right">
          {filtered.length} visitor{filtered.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Visitor Details</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-gray-400">Visitor ID</span><p className="text-gray-800 font-mono text-xs break-all">{selected.visitorId}</p></div>
                <div><span className="text-gray-400">IP Address</span><p className="text-gray-800">{selected.ipAddress || '-'}</p></div>
                <div><span className="text-gray-400">Browser</span><p className="text-gray-800">{selected.browser || '-'}</p></div>
                <div><span className="text-gray-400">OS</span><p className="text-gray-800">{selected.os || '-'}</p></div>
                <div><span className="text-gray-400">Device</span><p className="text-gray-800">{selected.deviceType || '-'}</p></div>
                <div><span className="text-gray-400">Screen</span><p className="text-gray-800">{selected.screenResolution || '-'}</p></div>
                <div><span className="text-gray-400">Language</span><p className="text-gray-800">{selected.language || '-'}</p></div>
                <div><span className="text-gray-400">Timezone</span><p className="text-gray-800">{selected.timezone || '-'}</p></div>
                <div><span className="text-gray-400">Referrer</span><p className="text-gray-800">{selected.referrer || 'Direct'}</p></div>
                <div><span className="text-gray-400">Consent</span><p className="text-gray-800">{selected.consentGiven ? 'Granted' : 'Not given'}</p></div>
                <div><span className="text-gray-400">Visit Count</span><p className="text-gray-800">{selected.visitCount}</p></div>
                <div><span className="text-gray-400">First Visit</span><p className="text-gray-800">{formatDate(selected.firstVisit)}</p></div>
                <div className="col-span-2"><span className="text-gray-400">Last Visit</span><p className="text-gray-800">{formatDate(selected.lastVisit)}</p></div>
              </div>
              {selected.pagesVisited && selected.pagesVisited.length > 0 && (
                <div>
                  <span className="text-gray-400 text-xs">Pages Visited</span>
                  <div className="mt-1 max-h-32 overflow-y-auto space-y-1">
                    {selected.pagesVisited.map((p, i) => (
                      <div key={i} className="flex justify-between text-xs bg-gray-50 px-2 py-1 rounded">
                        <span className="text-gray-700">{p.page}</span>
                        <span className="text-gray-400">{p.timestamp ? new Date(p.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVisitors;
