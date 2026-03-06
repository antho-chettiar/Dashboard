import { Users, Music2, Ticket, DollarSign, TrendingUp, Star } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import KpiCard from '../components/ui/KpiCard'
import ChartContainer from '../components/charts/ChartContainer'
import LineChart from '../components/charts/LineChart'
import BarChart from '../components/charts/BarChart'
import PieChart from '../components/charts/PieChart'
import {
  mockKpis,
  mockFollowerTrends,
  mockConcerts,
  mockAgeData,
  mockGenderData,
  mockGenreData,
  mockArtists,
} from '../utils/mockData'
import { formatNumber, formatCurrency } from '../utils/formatters'
import { useState } from 'react'

// Top artists by total followers
const topArtists = mockArtists
  .map(a => ({
    name: a.name,
    followers: Object.values(a.followers).reduce((sum, v) => sum + v, 0),
  }))
  .sort((a, b) => b.followers - a.followers)

// Revenue by city
const revenueByCity = Object.values(
  mockConcerts.reduce((acc, c) => {
    if (!acc[c.city]) acc[c.city] = { name: c.city, revenue: 0 }
    acc[c.city].revenue += c.total_revenue
    return acc
  }, {})
).sort((a, b) => b.revenue - a.revenue)

const PLATFORM_TABS = [
  { key: 'instagram', label: 'Instagram', color: '#E1306C' },
  { key: 'youtube',   label: 'YouTube',   color: '#FF0000' },
  { key: 'spotify',   label: 'Spotify',   color: '#1DB954' },
]

function Dashboard() {
  const [activePlatform, setActivePlatform] = useState('instagram')

  const selectedPlatform = PLATFORM_TABS.find(p => p.key === activePlatform)

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of artist performance and concert analytics"
      />

      {/* ── KPI Strip ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <KpiCard
          title="Total Artists"
          value={mockKpis.totalArtists}
          subtitle="Active on platform"
          rog={8.3}
          icon={Users}
          iconBg="bg-blue-50"
        />
        <KpiCard
          title="Total Concerts"
          value={mockKpis.totalConcerts}
          subtitle="All time"
          rog={12.5}
          icon={Music2}
          iconBg="bg-orange-50"
        />
        <KpiCard
          title="Tickets Sold (YTD)"
          value={formatNumber(mockKpis.ticketsSoldYTD)}
          subtitle="Year to date"
          rog={6.2}
          icon={Ticket}
          iconBg="bg-teal-50"
        />
        <KpiCard
          title="Revenue (YTD)"
          value={formatCurrency(mockKpis.revenueYTD)}
          subtitle="Year to date"
          rog={18.4}
          icon={DollarSign}
          iconBg="bg-green-50"
        />
        <KpiCard
          title="Avg. Social RoG"
          value={`${mockKpis.avgRoG}%`}
          subtitle="Across all platforms"
          rog={mockKpis.avgRoG}
          icon={TrendingUp}
          iconBg="bg-purple-50"
        />
        <KpiCard
          title="Top Artist"
          value={mockKpis.topArtist.name}
          subtitle={`${formatNumber(mockKpis.topArtist.streams)} streams`}
          icon={Star}
          iconBg="bg-yellow-50"
        />
      </div>

      {/* ── Row 1: Line Chart + Bar Chart ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">

        {/* Follower Growth Trend */}
        <ChartContainer
          title="Follower Growth Trend"
          subtitle="Monthly followers by platform"
        >
          {/* Platform Tabs */}
          <div className="flex gap-2 mb-4">
            {PLATFORM_TABS.map(p => (
              <button
                key={p.key}
                onClick={() => setActivePlatform(p.key)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                  activePlatform === p.key
                    ? 'text-white shadow-sm'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
                style={activePlatform === p.key ? { background: p.color } : {}}
              >
                {p.label}
              </button>
            ))}
          </div>
          <LineChart
            data={mockFollowerTrends}
            xKey="date"
            lines={[{ key: activePlatform, label: selectedPlatform.label, color: selectedPlatform.color }]}
          />
        </ChartContainer>

        {/* Top Artists by Followers */}
        <ChartContainer
          title="Top Artists by Total Followers"
          subtitle="Combined across all platforms"
        >
          <BarChart
            data={topArtists}
            xKey="name"
            layout="vertical"
            bars={[{ key: 'followers', label: 'Total Followers' }]}
            multiColor={true}
          />
        </ChartContainer>
      </div>

      {/* ── Row 2: Revenue + Age + Gender ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">

        {/* Revenue by City */}
        <ChartContainer
          title="Concert Revenue by City"
          subtitle="Total revenue per city (INR)"
        >
          <BarChart
            data={revenueByCity}
            xKey="name"
            layout="horizontal"
            bars={[{ key: 'revenue', label: 'Revenue', color: '#2563EB' }]}
            height={240}
          />
        </ChartContainer>

        {/* Age Distribution */}
        <ChartContainer
          title="Audience Age Distribution"
          subtitle="% of total audience by age group"
        >
          <PieChart
            data={mockAgeData}
            nameKey="name"
            valueKey="value"
            innerRadius={55}
            height={240}
          />
        </ChartContainer>

        {/* Gender Distribution */}
        <ChartContainer
          title="Gender Distribution"
          subtitle="% of total audience by gender"
        >
          <PieChart
            data={mockGenderData}
            nameKey="name"
            valueKey="value"
            innerRadius={55}
            height={240}
          />
        </ChartContainer>
      </div>

      {/* ── Row 3: Genre Popularity ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartContainer
          title="Genre Popularity"
          subtitle="Total streams by music genre"
        >
          <BarChart
            data={mockGenreData}
            xKey="genre"
            layout="vertical"
            bars={[{ key: 'streams', label: 'Streams' }]}
            multiColor={true}
            height={240}
          />
        </ChartContainer>

        {/* Recent Concerts Table */}
        <ChartContainer
          title="Recent Concerts"
          subtitle="Latest events at a glance"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-gray-400 font-semibold pb-2 pr-4">Artist</th>
                  <th className="text-left text-gray-400 font-semibold pb-2 pr-4">City</th>
                  <th className="text-right text-gray-400 font-semibold pb-2 pr-4">Tickets</th>
                  <th className="text-right text-gray-400 font-semibold pb-2">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {mockConcerts.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 transition">
                    <td className="py-2.5 pr-4 font-medium text-brand-navy">{c.artist}</td>
                    <td className="py-2.5 pr-4 text-gray-500">{c.city}</td>
                    <td className="py-2.5 pr-4 text-right text-gray-600">{formatNumber(c.tickets_sold)}</td>
                    <td className="py-2.5 text-right font-semibold text-brand-navy">{formatCurrency(c.total_revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartContainer>
      </div>
    </div>
  )
}

export default Dashboard