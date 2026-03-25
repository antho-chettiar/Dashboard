import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { ArrowLeft, MapPin, Music, TrendingUp, DollarSign, Users, Ticket } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import RoGBadge from '../components/ui/RoGBadge'
import ChartContainer from '../components/charts/ChartContainer'
import LineChart from '../components/charts/LineChart'
import PieChart from '../components/charts/PieChart'
import EmptyState from '../components/ui/EmptyState'
import { mockArtists, mockConcerts, mockFollowerTrends, mockAgeData, mockGenderData } from '../utils/mockData'
import { formatNumber, formatCurrency, formatDate } from '../utils/formatters'

const TABS = ['Platforms', 'Growth Trends', 'Concerts', 'Demographics']

const PLATFORM_META = {
  instagram: { label: 'Instagram', color: '#E1306C' },
  youtube:   { label: 'YouTube',   color: '#FF0000' },
  spotify:   { label: 'Spotify',   color: '#1DB954' },
}

const TREND_LINES = [
  { key: 'instagram', label: 'Instagram', color: '#E1306C' },
  { key: 'youtube',   label: 'YouTube',   color: '#FF0000' },
  { key: 'spotify',   label: 'Spotify',   color: '#1DB954' },
]

function ArtistProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setTab] = useState('Platforms')

  const artist   = mockArtists.find(a => a.id === id)
  const concerts = mockConcerts.filter(c => c.artist === artist?.name)

  if (!artist) return (
    <div className="p-6"><EmptyState title="Artist not found" subtitle="This artist does not exist." /></div>
  )

  const totalFollowers = Object.values(artist.followers).reduce((a, b) => a + b, 0)
  const avgRoG         = Object.values(artist.rog).reduce((a, b) => a + b, 0) / Object.values(artist.rog).length
  const totalRevenue   = concerts.reduce((a, c) => a + c.total_revenue, 0)
  const totalTickets   = concerts.reduce((a, c) => a + c.tickets_sold, 0)

  return (
    <div className="relative">
      {/* Ambient glow */}
      <div className="fixed top-20 right-20 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.07), transparent 70%)', filter: 'blur(40px)' }} />

      {/* Back */}
      <button onClick={() => navigate('/artists')}
        className="flex items-center gap-2 text-sm mb-5 transition-all duration-200 hover:gap-3"
        style={{ color: 'var(--text-muted)' }}>
        <ArrowLeft size={15} /> Back to Artists
      </button>

      {/* Hero Card */}
      <div className="glass-card p-6 mb-6 animate-fade-up relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 100% 0%, rgba(99,102,241,0.06), transparent 60%)' }} />

        <div className="flex flex-col sm:flex-row items-start gap-6 relative z-10">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <img src={artist.photo} alt={artist.name}
              className="w-24 h-24 rounded-2xl object-cover"
              style={{ border: '2px solid var(--border-strong)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }} />
            <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-lg text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #6366F1, #818CF8)', color: '#fff' }}>
              {artist.genre.split('/')[0]}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="font-display font-bold text-3xl" style={{ color: 'var(--text-primary)' }}>
                {artist.name}
              </h1>
              <RoGBadge value={avgRoG} />
            </div>
            <div className="flex items-center gap-4 text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
              <div className="flex items-center gap-1.5">
                <MapPin size={13} style={{ color: 'var(--accent-indigo)' }} />
                {artist.nationality}
              </div>
              <div className="flex items-center gap-1.5">
                <Music size={13} style={{ color: 'var(--accent-gold)' }} />
                {concerts.length} concerts on record
              </div>
            </div>

            {/* KPI Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total Followers', value: formatNumber(totalFollowers), icon: Users,      color: 'var(--accent-indigo)' },
                { label: 'Top Platform',    value: Object.entries(artist.followers).sort((a,b) => b[1]-a[1])[0][0], icon: TrendingUp, color: 'var(--accent-gold)' },
                { label: 'Total Revenue',   value: formatCurrency(totalRevenue), icon: DollarSign, color: 'var(--accent-green)'  },
                { label: 'Tickets Sold',    value: formatNumber(totalTickets),   icon: Ticket,     color: 'var(--accent-red)'    },
              ].map((stat, i) => (
                <div key={i} className="rounded-xl p-3"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <stat.icon size={12} style={{ color: stat.color }} />
                    <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
                      {stat.label}
                    </p>
                  </div>
                  <p className="font-display font-bold text-base capitalize" style={{ color: 'var(--text-primary)' }}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-2xl mb-6 w-fit"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setTab(tab)}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
            style={activeTab === tab ? {
              background: 'linear-gradient(135deg, #6366F1, #818CF8)',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(99,102,241,0.3)'
            } : {
              color: 'var(--text-muted)',
              background: 'transparent'
            }}>
            {tab}
          </button>
        ))}
      </div>

      {/* ── Tab: Platforms ── */}
      {activeTab === 'Platforms' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Object.entries(artist.followers).map(([platform, count], i) => {
            const meta = PLATFORM_META[platform]
            return (
              <div key={platform} className="glass-card p-5 animate-fade-up"
                style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both', opacity: 0, borderTop: `3px solid ${meta.color}` }}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold" style={{ color: meta.color }}>{meta.label}</span>
                  <RoGBadge value={artist.rog[platform]} />
                </div>
                <p className="font-display font-bold text-3xl mb-1" style={{ color: 'var(--text-primary)' }}>
                  {formatNumber(count)}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Followers</p>

                {/* Mini progress bar */}
                <div className="mt-4 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                  <div className="h-full rounded-full"
                    style={{ width: `${(count / totalFollowers) * 100}%`, background: meta.color }} />
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {((count / totalFollowers) * 100).toFixed(1)}% of total
                </p>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Tab: Growth Trends ── */}
      {activeTab === 'Growth Trends' && (
        <ChartContainer
          title="Follower Growth — All Platforms"
          subtitle="Instagram · YouTube · Spotify monthly trend"
        >
          <div className="flex gap-2 mb-4 flex-wrap">
            {TREND_LINES.map(p => (
              <span key={p.key}
                className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ background: `${p.color}18`, color: p.color, border: `1px solid ${p.color}30` }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.color }} />
                {p.label}
              </span>
            ))}
          </div>
          <LineChart data={mockFollowerTrends} xKey="date" lines={TREND_LINES} height={320} />
        </ChartContainer>
      )}

      {/* ── Tab: Concerts ── */}
      {activeTab === 'Concerts' && (
        concerts.length === 0 ? (
          <EmptyState title="No concerts found" subtitle="No concert data available for this artist." />
        ) : (
          <div className="glass-card overflow-hidden animate-fade-up">
            <table className="w-full text-sm">
              <thead style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                <tr>
                  {['Concert', 'Date', 'City', 'Venue', 'Tickets', 'Revenue'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest"
                      style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {concerts.map((c, i) => (
                  <tr key={c.id}
                    style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td className="px-4 py-3 font-semibold" style={{ color: 'var(--text-primary)' }}>{c.name}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(c.date)}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{c.city}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{c.venue}</td>
                    <td className="px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{formatNumber(c.tickets_sold)}</td>
                    <td className="px-4 py-3 font-bold font-display text-sm" style={{ color: 'var(--accent-gold)' }}>{formatCurrency(c.total_revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* ── Tab: Demographics ── */}
      {activeTab === 'Demographics' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ChartContainer title="Audience Age Distribution" subtitle="% by age group">
            <PieChart data={mockAgeData} nameKey="name" valueKey="value" innerRadius={55} height={260} />
          </ChartContainer>
          <ChartContainer title="Gender Distribution" subtitle="% by gender">
            <PieChart data={mockGenderData} nameKey="name" valueKey="value" innerRadius={55} height={260} />
          </ChartContainer>
        </div>
      )}
    </div>
  )
}

export default ArtistProfile