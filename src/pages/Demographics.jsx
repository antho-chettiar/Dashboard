import { useState } from 'react'
import PageHeader from '../components/ui/PageHeader'
import ChartContainer from '../components/charts/ChartContainer'
import PieChart from '../components/charts/PieChart'
import BarChart from '../components/charts/BarChart'
import { mockAgeData, mockGenderData, mockGenreData, mockArtists } from '../utils/mockData'
import { formatNumber } from '../utils/formatters'

const PLATFORMS = ['All Platforms', 'Instagram', 'YouTube', 'Spotify']

// City-level audience data
const cityAudienceData = [
  { city: 'Mumbai',    audience: 4200000 },
  { city: 'Delhi',     audience: 3800000 },
  { city: 'Bangalore', audience: 2900000 },
  { city: 'Chennai',   audience: 1800000 },
  { city: 'Kolkata',   audience: 1600000 },
  { city: 'Hyderabad', audience: 1400000 },
  { city: 'Pune',      audience: 980000  },
  { city: 'Ahmedabad', audience: 750000  },
]

function Demographics() {
  const [selectedArtist, setArtist]     = useState('all')
  const [selectedPlatform, setPlatform] = useState('All Platforms')

  return (
    <div>
      <PageHeader
        title="Demographics"
        subtitle="Audience breakdown by age, gender, geography and genre"
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Artist Filter */}
        <select
          value={selectedArtist}
          onChange={e => setArtist(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white text-gray-600 outline-none shadow-sm"
        >
          <option value="all">All Artists</option>
          {mockArtists.map(a => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>

        {/* Platform Filter */}
        <div className="flex gap-2 flex-wrap">
          {PLATFORMS.map(p => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                selectedPlatform === p
                  ? 'bg-brand-navy text-white'
                  : 'bg-white border border-gray-200 text-gray-500 hover:border-brand-navy hover:text-brand-navy'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* ── Row 1: Age + Gender ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <ChartContainer
          title="Audience Age Distribution"
          subtitle="% of total audience by age group"
        >
          <PieChart
            data={mockAgeData}
            nameKey="name"
            valueKey="value"
            innerRadius={60}
            height={280}
          />
          {/* Data Table below chart */}
          <div className="mt-4 border-t border-gray-100 pt-4">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left text-gray-400 font-semibold pb-2">Age Group</th>
                  <th className="text-right text-gray-400 font-semibold pb-2">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {mockAgeData.map((row, i) => (
                  <tr key={i}>
                    <td className="py-1.5 text-gray-600 font-medium">{row.name}</td>
                    <td className="py-1.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 bg-gray-100 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full bg-brand-blue"
                            style={{ width: `${row.value}%` }}
                          />
                        </div>
                        <span className="text-gray-700 font-semibold w-8 text-right">{row.value}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartContainer>

        <ChartContainer
          title="Gender Distribution"
          subtitle="% of total audience by gender"
        >
          <PieChart
            data={mockGenderData}
            nameKey="name"
            valueKey="value"
            innerRadius={60}
            height={280}
          />
          {/* Data Table */}
          <div className="mt-4 border-t border-gray-100 pt-4">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left text-gray-400 font-semibold pb-2">Gender</th>
                  <th className="text-right text-gray-400 font-semibold pb-2">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {mockGenderData.map((row, i) => (
                  <tr key={i}>
                    <td className="py-1.5 text-gray-600 font-medium">{row.name}</td>
                    <td className="py-1.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 bg-gray-100 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full bg-brand-orange"
                            style={{ width: `${row.value}%` }}
                          />
                        </div>
                        <span className="text-gray-700 font-semibold w-8 text-right">{row.value}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartContainer>
      </div>

      {/* ── Row 2: Genre + City ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <ChartContainer
          title="Genre Popularity"
          subtitle="Total streams by music genre"
        >
          <BarChart
            data={mockGenreData}
            xKey="genre"
            layout="vertical"
            bars={[{ key: 'streams', label: 'Streams', color: '#2563EB' }]}
            multiColor={true}
            height={280}
          />
        </ChartContainer>

        <ChartContainer
          title="Audience by City"
          subtitle="Top cities by listener count"
        >
          <BarChart
            data={cityAudienceData}
            xKey="city"
            layout="vertical"
            bars={[{ key: 'audience', label: 'Audience', color: '#0D9488' }]}
            height={280}
          />
        </ChartContainer>
      </div>

      {/* ── Row 3: Summary Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Largest Age Group',   value: '18–24',      sub: '34% of audience' },
          { label: 'Dominant Gender',     value: 'Male',       sub: '54% of audience' },
          { label: 'Top City',            value: 'Mumbai',     sub: formatNumber(4200000) + ' listeners' },
          { label: 'Top Genre',           value: 'Bollywood',  sub: formatNumber(4200000) + ' streams'  },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
            <p className="text-lg font-bold text-brand-navy">{stat.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Demographics