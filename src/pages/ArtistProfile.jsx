import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { ArrowLeft, MapPin, Music } from 'lucide-react'
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
  instagram: { label: 'Instagram', color: '#E1306C', bg: 'bg-pink-50',   border: 'border-pink-200' },
  youtube:   { label: 'YouTube',   color: '#FF0000', bg: 'bg-red-50',    border: 'border-red-200'  },
  spotify:   { label: 'Spotify',   color: '#1DB954', bg: 'bg-green-50',  border: 'border-green-200'},
}

function ArtistProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setTab] = useState('Platforms')
  const [activePlatform, setPlatform] = useState('instagram')

  const artist = mockArtists.find(a => a.id === id)
  const concerts = mockConcerts.filter(c => c.artist === artist?.name)

  if (!artist) {
    return (
      <div className="p-6">
        <EmptyState title="Artist not found" subtitle="This artist does not exist." />
      </div>
    )
  }

  const totalFollowers = Object.values(artist.followers).reduce((a, b) => a + b, 0)
  const avgRoG = Object.values(artist.rog).reduce((a, b) => a + b, 0) / Object.values(artist.rog).length
  const totalRevenue = concerts.reduce((a, c) => a + c.total_revenue, 0)

  const selectedPlatformMeta = PLATFORM_META[activePlatform]

  return (
    <div>
      {/* Back Button */}
      <button
        onClick={() => navigate('/artists')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-navy mb-4 transition"
      >
        <ArrowLeft size={16} /> Back to Artists
      </button>

      {/* Hero Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <img
            src={artist.photo}
            alt={artist.name}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-gray-100 shadow"
          />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-brand-navy">{artist.name}</h1>
              <span className="text-xs font-semibold bg-orange-100 text-brand-orange px-2.5 py-1 rounded-full">
                {artist.genre}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
              <MapPin size={13} />
              <span>{artist.nationality}</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full" />
              <Music size={13} />
              <span>{concerts.length} concert{concerts.length !== 1 ? 's' : ''} on record</span>
            </div>

            {/* Mini KPI Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400">Total Followers</p>
                <p className="text-lg font-bold text-brand-navy">{formatNumber(totalFollowers)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400">Top Platform</p>
                <p className="text-lg font-bold text-brand-navy capitalize">
                  {Object.entries(artist.followers).sort((a, b) => b[1] - a[1])[0][0]}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400">Avg. RoG</p>
                <div className="mt-1"><RoGBadge value={avgRoG} /></div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400">Total Revenue</p>
                <p className="text-lg font-bold text-brand-navy">{formatCurrency(totalRevenue)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setTab(tab)}
            className={`text-sm px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === tab
                ? 'bg-white text-brand-navy shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Tab: Platforms ── */}
      {activeTab === 'Platforms' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Object.entries(artist.followers).map(([platform, count]) => {
            const meta = PLATFORM_META[platform]
            return (
              <div key={platform} className={`bg-white rounded-xl border ${meta.border} shadow-sm p-5`}>
                <div className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold mb-3 ${meta.bg}`}
                  style={{ color: meta.color }}>
                  {meta.label}
                </div>
                <p className="text-2xl font-bold text-brand-navy">{formatNumber(count)}</p>
                <p className="text-xs text-gray-400 mt-0.5">Followers</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400">Monthly RoG</span>
                  <RoGBadge value={artist.rog[platform]} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Tab: Growth Trends ── */}
      {activeTab === 'Growth Trends' && (
        <ChartContainer
          title="Follower Growth Trend"
          subtitle="Monthly snapshot across platforms"
        >
          {/* Platform selector */}
          <div className="flex gap-2 mb-4">
            {Object.entries(PLATFORM_META).map(([key, meta]) => (
              <button
                key={key}
                onClick={() => setPlatform(key)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                  activePlatform === key ? 'text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
                style={activePlatform === key ? { background: meta.color } : {}}
              >
                {meta.label}
              </button>
            ))}
          </div>
          <LineChart
            data={mockFollowerTrends}
            xKey="date"
            lines={[{ key: activePlatform, label: selectedPlatformMeta.label, color: selectedPlatformMeta.color }]}
            height={320}
          />
        </ChartContainer>
      )}

      {/* ── Tab: Concerts ── */}
      {activeTab === 'Concerts' && (
        <div>
          {concerts.length === 0 ? (
            <EmptyState title="No concerts found" subtitle="No concert data available for this artist." />
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3">Concert</th>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3">Date</th>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3">City</th>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3">Venue</th>
                    <th className="text-right text-xs font-semibold text-gray-400 uppercase px-4 py-3">Tickets</th>
                    <th className="text-right text-xs font-semibold text-gray-400 uppercase px-4 py-3">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {concerts.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-medium text-brand-navy">{c.name}</td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(c.date)}</td>
                      <td className="px-4 py-3 text-gray-500">{c.city}</td>
                      <td className="px-4 py-3 text-gray-500">{c.venue}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{formatNumber(c.tickets_sold)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-brand-navy">{formatCurrency(c.total_revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
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