import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Calendar, MapPin, TrendingUp, Ticket, User, Filter } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import EmptyState from '../components/ui/EmptyState'
import { mockConcerts } from '../utils/mockData'
import { formatNumber, formatCurrency, formatDate, sellThrough } from '../utils/formatters'



function Concerts() {
  const navigate = useNavigate()
  const [search, setSearch]         = useState('')
  const [sortBy, setSortBy]         = useState('date')
  const [filterDate, setDate]       = useState('')
  const [filterCity, setFilterCity] = useState('')

  const filtered = mockConcerts
    .filter(c => {
      const matchSearch    = c.artist.toLowerCase().includes(search.toLowerCase()) ||
                             c.city.toLowerCase().includes(search.toLowerCase()) ||
                             c.venue.toLowerCase().includes(search.toLowerCase())
      const matchDate      = !filterDate || c.date.includes(filterDate)
      const matchCityInput = !filterCity || c.city.toLowerCase().includes(filterCity.toLowerCase())
      return matchSearch && matchDate && matchCityInput
    })
    .sort((a, b) => {
      if (sortBy === 'date')    return new Date(b.date) - new Date(a.date)
      if (sortBy === 'revenue') return b.total_revenue - a.total_revenue
      if (sortBy === 'tickets') return b.tickets_sold - a.tickets_sold
      return 0
    })

  const inputStyle = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    fontFamily: 'Satoshi',
  }

  return (
    <div className="relative">
      <div className="fixed top-32 right-20 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.06), transparent 70%)', filter: 'blur(40px)' }} />

      <PageHeader title="Concerts" subtitle={`${mockConcerts.length} concerts on record`} />

      {/* Search + Sort row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl flex-1"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <Search size={15} style={{ color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Search artist, city or venue..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-sm outline-none w-full"
            style={{ color: 'var(--text-primary)', fontFamily: 'Satoshi' }} />
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          className="text-sm rounded-xl px-4 py-3 outline-none"
          style={{ ...inputStyle }}>
          <option value="date"    style={inputStyle}>Sort by Date</option>
          <option value="revenue" style={inputStyle}>Sort by Revenue</option>
          <option value="tickets" style={inputStyle}>Sort by Tickets Sold</option>
        </select>
      </div>



      {/* Column Filters */}
      <div className="flex flex-col sm:flex-row gap-2 mb-5 p-3 rounded-xl"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
          <Filter size={13} />
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ fontSize: '10px' }}>Filters</span>
        </div>

        {/* Date filter */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1"
          style={inputStyle}>
          <Calendar size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input type="text" placeholder="Filter by year or date…"
            value={filterDate} onChange={e => setDate(e.target.value)}
            className="bg-transparent text-xs outline-none w-full"
            style={{ color: 'var(--text-primary)', fontFamily: 'Satoshi' }} />
        </div>

        {/* City filter */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1"
          style={inputStyle}>
          <MapPin size={12} style={{ color: 'var(--accent-gold)', flexShrink: 0 }} />
          <input type="text" placeholder="Filter by city…"
            value={filterCity} onChange={e => setFilterCity(e.target.value)}
            className="bg-transparent text-xs outline-none w-full"
            style={{ color: 'var(--text-primary)', fontFamily: 'Satoshi' }} />
        </div>

        {/* Clear button */}
        {(filterDate || filterCity) && (
          <button
            onClick={() => { setDate(''); setFilterCity('') }}
            className="text-xs px-3 py-2 rounded-lg transition-all duration-200"
            style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--accent-red)', border: '1px solid rgba(239,68,68,0.2)' }}>
            Clear
          </button>
        )}
      </div>

      <p className="text-xs mb-4 uppercase tracking-widest"
        style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
        Showing {filtered.length} of {mockConcerts.length} concerts
      </p>

      {filtered.length === 0 ? (
        <EmptyState title="No concerts found" subtitle="Try adjusting your search or filters" />
      ) : (
        <div className="glass-card overflow-hidden animate-fade-up" style={{ overflowX: 'auto' }}>
          <table className="w-full text-sm" style={{ minWidth: '800px' }}>
            <thead style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
              <tr>
                {['Artist', 'Concert', 'Date', 'City', 'Venue', 'Tickets Sold', 'Sell-Through', 'Revenue'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest"
                    style={{ color: 'var(--text-muted)', fontSize: '10px', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const st = (c.tickets_sold / c.capacity) * 100
                return (
                  <tr key={c.id} onClick={() => navigate(`/concerts/${c.id}`)}
                    className="cursor-pointer transition-all duration-150"
                    style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                    {/* Artist */}
                    <td className="px-4 py-3 font-bold font-display text-sm" style={{ color: 'var(--accent-indigo)' }}>
                      {c.artist}
                    </td>

                    {/* Concert name */}
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{c.name}</td>

                    {/* Date */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        <Calendar size={11} />
                        {formatDate(c.date)}
                      </div>
                    </td>

                    {/* City – separate column */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        <MapPin size={11} style={{ color: 'var(--accent-gold)' }} />
                        {c.city}
                      </div>
                    </td>

                    {/* Venue – separate column */}
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {c.venue}
                    </td>

                    {/* Tickets sold */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                        <Ticket size={11} style={{ color: 'var(--accent-indigo)' }} />
                        {formatNumber(c.tickets_sold)}
                      </div>
                    </td>

                    {/* Sell-through */}
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{
                          background: st >= 95 ? 'rgba(16,185,129,0.12)' : st >= 75 ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)',
                          color: st >= 95 ? 'var(--accent-green)' : st >= 75 ? 'var(--accent-gold)' : 'var(--accent-red)'
                        }}>
                        {st.toFixed(1)}%
                      </span>
                    </td>

                    {/* Revenue */}
                    <td className="px-4 py-3 font-bold font-display" style={{ color: 'var(--accent-gold)' }}>
                      {formatCurrency(c.total_revenue)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Concerts