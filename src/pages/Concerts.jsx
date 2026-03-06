import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Calendar, MapPin, TrendingUp, Ticket } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import EmptyState from '../components/ui/EmptyState'
import { mockConcerts } from '../utils/mockData'
import { formatNumber, formatCurrency, formatDate, sellThrough } from '../utils/formatters'

const CITIES = ['All', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata']

function Concerts() {
  const navigate = useNavigate()
  const [search, setSearch]   = useState('')
  const [activeCity, setCity] = useState('All')
  const [sortBy, setSortBy]   = useState('date')

  const filtered = mockConcerts
    .filter(c => {
      const matchSearch = c.artist.toLowerCase().includes(search.toLowerCase()) ||
                          c.city.toLowerCase().includes(search.toLowerCase()) ||
                          c.venue.toLowerCase().includes(search.toLowerCase())
      const matchCity = activeCity === 'All' || c.city === activeCity
      return matchSearch && matchCity
    })
    .sort((a, b) => {
      if (sortBy === 'date')    return new Date(b.date) - new Date(a.date)
      if (sortBy === 'revenue') return b.total_revenue - a.total_revenue
      if (sortBy === 'tickets') return b.tickets_sold - a.tickets_sold
      return 0
    })

  return (
    <div className="relative">
      <div className="fixed top-32 right-20 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.06), transparent 70%)', filter: 'blur(40px)' }} />

      <PageHeader title="Concerts" subtitle={`${mockConcerts.length} concerts on record`} />

      {/* Filters */}
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
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontFamily: 'Satoshi' }}>
          <option value="date">Sort by Date</option>
          <option value="revenue">Sort by Revenue</option>
          <option value="tickets">Sort by Tickets Sold</option>
        </select>
      </div>

      {/* City Pills */}
      <div className="flex gap-2 flex-wrap mb-6">
        {CITIES.map(city => (
          <button key={city} onClick={() => setCity(city)}
            className="text-xs px-3 py-1.5 rounded-xl font-medium transition-all duration-200"
            style={activeCity === city ? {
              background: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
              color: '#000',
              boxShadow: '0 4px 12px rgba(245,158,11,0.3)'
            } : {
              background: 'var(--bg-card)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border)'
            }}>
            {city}
          </button>
        ))}
      </div>

      <p className="text-xs mb-4 uppercase tracking-widest"
        style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
        Showing {filtered.length} of {mockConcerts.length} concerts
      </p>

      {filtered.length === 0 ? (
        <EmptyState title="No concerts found" subtitle="Try adjusting your search or city filter" />
      ) : (
        <div className="glass-card overflow-hidden animate-fade-up">
          <table className="w-full text-sm">
            <thead style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
              <tr>
                {['Artist', 'Concert', 'Date', 'City / Venue', 'Tickets Sold', 'Sell-Through', 'Revenue'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest"
                    style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => {
                const st = (c.tickets_sold / c.capacity) * 100
                return (
                  <tr key={c.id} onClick={() => navigate(`/concerts/${c.id}`)}
                    className="cursor-pointer transition-all duration-150"
                    style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td className="px-4 py-3 font-bold font-display text-sm" style={{ color: 'var(--accent-indigo)' }}>
                      {c.artist}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{c.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <Calendar size={11} />
                        {formatDate(c.date)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                        <MapPin size={11} style={{ color: 'var(--accent-gold)' }} />
                        {c.city}
                      </div>
                      <p className="text-xs mt-0.5 pl-4" style={{ color: 'var(--text-muted)' }}>{c.venue}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                        <Ticket size={11} style={{ color: 'var(--accent-indigo)' }} />
                        {formatNumber(c.tickets_sold)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{
                          background: st >= 95 ? 'rgba(16,185,129,0.12)' : st >= 75 ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)',
                          color: st >= 95 ? 'var(--accent-green)' : st >= 75 ? 'var(--accent-gold)' : 'var(--accent-red)'
                        }}>
                        {st.toFixed(1)}%
                      </span>
                    </td>
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