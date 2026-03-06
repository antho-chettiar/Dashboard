import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import RoGBadge from '../components/ui/RoGBadge'
import EmptyState from '../components/ui/EmptyState'
import { mockArtists } from '../utils/mockData'
import { formatNumber } from '../utils/formatters'

const GENRES = ['All', 'Bollywood', 'Pop', 'R&B', 'Classical/Fusion']

const PLATFORM_ICONS = {
  instagram: { label: 'IG',  bg: 'bg-pink-100',   text: 'text-pink-600' },
  youtube:   { label: 'YT',  bg: 'bg-red-100',    text: 'text-red-600'  },
  spotify:   { label: 'SP',  bg: 'bg-green-100',  text: 'text-green-600'},
}

function ArtistCard({ artist, onClick }) {
  const totalFollowers = Object.values(artist.followers).reduce((a, b) => a + b, 0)
  const avgRoG = (Object.values(artist.rog).reduce((a, b) => a + b, 0) / Object.values(artist.rog).length)

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-brand-blue transition-all cursor-pointer p-5"
    >
      {/* Avatar + Name */}
      <div className="flex items-center gap-3 mb-4">
        <img
          src={artist.photo}
          alt={artist.name}
          className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
        />
        <div>
          <h3 className="font-semibold text-brand-navy text-sm">{artist.name}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-gray-400">{artist.nationality}</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full" />
            <span className="text-xs font-medium text-brand-orange">{artist.genre}</span>
          </div>
        </div>
      </div>

      {/* Total Followers */}
      <div className="mb-3">
        <p className="text-xs text-gray-400 mb-0.5">Total Followers</p>
        <p className="text-xl font-bold text-brand-navy">{formatNumber(totalFollowers)}</p>
      </div>

      {/* Platform Breakdown */}
      <div className="flex gap-2 mb-3">
        {Object.entries(artist.followers).map(([platform, count]) => {
          const meta = PLATFORM_ICONS[platform]
          return (
            <div key={platform} className={`flex-1 rounded-lg p-2 ${meta.bg}`}>
              <p className={`text-xs font-bold ${meta.text}`}>{meta.label}</p>
              <p className={`text-xs font-semibold ${meta.text}`}>{formatNumber(count)}</p>
            </div>
          )
        })}
      </div>

      {/* Avg RoG */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-400">Avg. RoG</span>
        <RoGBadge value={avgRoG} />
      </div>
    </div>
  )
}

function Artists() {
  const navigate = useNavigate()
  const [search, setSearch]       = useState('')
  const [activeGenre, setGenre]   = useState('All')

  const filtered = mockArtists.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase())
    const matchGenre  = activeGenre === 'All' || a.genre === activeGenre
    return matchSearch && matchGenre
  })

  return (
    <div>
      <PageHeader
        title="Artists"
        subtitle={`${mockArtists.length} artists on the platform`}
      />

      {/* Search + Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2.5 flex-1 shadow-sm">
          <Search size={15} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search artists..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="text-sm text-gray-600 outline-none w-full placeholder:text-gray-400"
          />
        </div>

        {/* Genre Filter */}
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-gray-400" />
          <div className="flex gap-2 flex-wrap">
            {GENRES.map(g => (
              <button
                key={g}
                onClick={() => setGenre(g)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                  activeGenre === g
                    ? 'bg-brand-navy text-white'
                    : 'bg-white border border-gray-200 text-gray-500 hover:border-brand-navy hover:text-brand-navy'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-gray-400 mb-4">
        Showing {filtered.length} of {mockArtists.length} artists
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No artists found"
          subtitle="Try adjusting your search or genre filter"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(artist => (
            <ArtistCard
              key={artist.id}
              artist={artist}
              onClick={() => navigate(`/artists/${artist.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Artists