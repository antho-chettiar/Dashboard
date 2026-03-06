import { useState } from 'react'
import {
  Users, Music2, Ticket, DollarSign,
  TrendingUp, Star, Activity, Globe
} from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import KpiCard from '../components/ui/KpiCard'
import ChartContainer from '../components/charts/ChartContainer'
import LineChart from '../components/charts/LineChart'
import BarChart from '../components/charts/BarChart'
import PieChart from '../components/charts/PieChart'
import RoGBadge from '../components/ui/RoGBadge'
import {
  mockKpis, mockFollowerTrends, mockConcerts,
  mockAgeData, mockGenderData, mockGenreData, mockArtists,
} from '../utils/mockData'
import { formatNumber, formatCurrency, formatDate } from '../utils/formatters'

const topArtists = mockArtists
  .map(a => ({
    name: a.name,
    followers: Object.values(a.followers).reduce((s, v) => s + v, 0),
  }))
  .sort((a, b) => b.followers - a.followers)

const revenueByCity = Object.values(
  mockConcerts.reduce((acc, c) => {
    if (!acc[c.city]) acc[c.city] = { name: c.city, revenue: 0 }
    acc[c.city].revenue += c.total_revenue
    return acc
  }, {})
).sort((a, b) => b.revenue - a.revenue)

// All 3 platform lines on one chart
const TREND_LINES = [
  { key: 'instagram', label: 'Instagram', color: '#E1306C' },
  { key: 'youtube',   label: 'YouTube',   color: '#FF0000' },
  { key: 'spotify',   label: 'Spotify',   color: '#1DB954' },
]

const KPI_CONFIG = [
  { title: 'Total Artists',    value: mockKpis.totalArtists,                      subtitle: 'Active on platform',  rog: 8.3,  icon: Users,      accentColor: '#818CF8', delay: 0   },
  { title: 'Total Concerts',   value: mockKpis.totalConcerts,                     subtitle: 'All time',            rog: 12.5, icon: Music2,     accentColor: '#FBBF24', delay: 80  },
  { title: 'Tickets Sold YTD', value: formatNumber(mockKpis.ticketsSoldYTD),      subtitle: 'Year to date',        rog: 6.2,  icon: Ticket,     accentColor: '#34D399', delay: 160 },
  { title: 'Revenue YTD',      value: formatCurrency(mockKpis.revenueYTD),        subtitle: 'Year to date',        rog: 18.4, icon: DollarSign, accentColor: '#F87171', delay: 240 },
  { title: 'Avg Social RoG',   value: `${mockKpis.avgRoG}%`,                      subtitle: 'All platforms',       rog: mockKpis.avgRoG, icon: TrendingUp, accentColor: '#A78BFA', delay: 320 },
  { title: 'Top Artist',       value: mockKpis.topArtist.name,                    subtitle: formatNumber(mockKpis.topArtist.streams) + ' streams', icon: Star, accentColor: '#FBBF24', delay: 400 },
]

function Dashboard() {
  return (
    <div className="relative">

      {/* Ambient background glows */}
      <div className="fixed top-20 left-72 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.08), transparent 70%)', filter: 'blur(40px)' }} />
      <div className="fixed bottom-20 right-20 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.06), transparent 70%)', filter: 'blur(40px)' }} />

      <PageHeader
        title="Dashboard"
        subtitle="Real-time overview of artist performance and concert analytics"
      />

      {/* ── KPI Strip ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-6 relative">
        {KPI_CONFIG.map((kpi, i) => (
          <KpiCard key={i} {...kpi} />
        ))}
      </div>

      {/* ── Row 1: Multi-line Trend + Top Artists ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">

        {/* All 3 platforms on one chart */}
        <ChartContainer
          title="Platform Growth Trends"
          subtitle="Instagram · YouTube · Spotify — monthly followers"
          delay={100}
        >
          {/* Legend pills */}
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
          <LineChart
            data={mockFollowerTrends}
            xKey="date"
            lines={TREND_LINES}
            height={260}
          />
        </ChartContainer>

        {/* Top Artists */}
        <ChartContainer
          title="Top Artists by Followers"
          subtitle="Combined across all platforms"
          delay={200}
        >
          <BarChart
            data={topArtists}
            xKey="name"
            layout="vertical"
            bars={[{ key: 'followers', label: 'Total Followers' }]}
            multiColor={true}
            height={300}
          />
        </ChartContainer>
      </div>

      {/* ── Row 2: Revenue + Age + Gender ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
        <ChartContainer title="Concert Revenue by City" subtitle="Total revenue per city (INR)" delay={150}>
          <BarChart
            data={revenueByCity}
            xKey="name"
            layout="horizontal"
            bars={[{ key: 'revenue', label: 'Revenue', color: '#818CF8' }]}
            height={240}
          />
        </ChartContainer>

        <ChartContainer title="Audience Age Distribution" subtitle="% of total audience" delay={230}>
          <PieChart data={mockAgeData} nameKey="name" valueKey="value" innerRadius={55} height={240} />
        </ChartContainer>

        <ChartContainer title="Gender Distribution" subtitle="% of total audience" delay={310}>
          <PieChart data={mockGenderData} nameKey="name" valueKey="value" innerRadius={55} height={240} />
        </ChartContainer>
      </div>

      {/* ── Row 3: Genre + Recent Concerts ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartContainer title="Genre Popularity" subtitle="Total streams by music genre" delay={200}>
          <BarChart
            data={mockGenreData}
            xKey="genre"
            layout="vertical"
            bars={[{ key: 'streams', label: 'Streams' }]}
            multiColor={true}
            height={260}
          />
        </ChartContainer>

        {/* Premium Concert Table */}
        <div className="glass-card p-5 animate-fade-up"
          style={{ animationDelay: '280ms', animationFillMode: 'both', opacity: 0 }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                Recent Concerts
              </h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Latest events at a glance</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
              style={{ background: 'rgba(99,102,241,0.12)', color: 'var(--accent-indigo)' }}>
              {mockConcerts.length} events
            </span>
          </div>

          <div className="space-y-2">
            {mockConcerts.map((c, i) => (
              <div key={c.id}
                className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer group"
                style={{ animationDelay: `${i * 60}ms` }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* Index */}
                <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                  {i + 1}
                </span>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                    {c.artist}
                  </p>
                  <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                    {c.city} · {formatDate(c.date)}
                  </p>
                </div>

                {/* Stats */}
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold font-display" style={{ color: 'var(--accent-gold)' }}>
                    {formatCurrency(c.total_revenue)}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {formatNumber(c.tickets_sold)} tickets
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard