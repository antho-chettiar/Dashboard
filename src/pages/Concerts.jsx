import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Calendar, MapPin, TrendingUp } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import EmptyState from '../components/ui/EmptyState'
import { mockConcerts } from '../utils/mockData'
import { formatNumber, formatCurrency, formatDate, sellThrough } from '../utils/formatters'

const CITIES = ['All', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata']

function Concerts() {
  const navigate = useNavigate()
  const [search, setSearch]     = useState('')
  const [activeCity, setCity]   = useState('All')
  const [sortBy, setSortBy]     = useState('date')

  const filtered = mockConcerts
    .filter(c => {
      const matchSearch = c.artist.toLowerCase().includes(search.toLowerCase()) ||
                          c.city.toLowerCase().includes(search.toLowerCase()) ||
                          c.venue.toLowerCase().includes(search.toLowerCase())
      const matchCity = activeCity === 'All' || c.city === activeCity
      return matchSearch && matchCity
    })
    .sort((a, b) => {
      if (sortBy === 'date')     return new Date(b.date) - new Date(a.date)
      if (sortBy === 'revenue')  return b.total_revenue - a.total_revenue
      if (sortBy === 'tickets')  return b.tickets_sold - a.tickets_sold
      return 0
    })

  return (
    <div>
      <PageHeader
        title="Concerts"
        subtitle={`${mockConcerts.length} concerts on record`}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        {/* Search */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2.5 flex-1 shadow-sm">
          <Search size={15} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search artist, city or venue..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="text-sm text-gray-600 outline-none w-full placeholder:text-gray-400"
          />
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white text-gray-600 outline-none shadow-sm"
        >
          <option value="date">Sort by Date</option>
          <option value="revenue">Sort by Revenue</option>
          <option value="tickets">Sort by Tickets Sold</option>
        </select>
      </div>

      {/* City Filter Pills */}
      <div className="flex gap-2 flex-wrap mb-6">
        {CITIES.map(city => (
          <button
            key={city}
            onClick={() => setCity(city)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
              activeCity === city
                ? 'bg-brand-navy text-white'
                : 'bg-white border border-gray-200 text-gray-500 hover:border-brand-navy hover:text-brand-navy'
            }`}
          >
            {city}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-xs text-gray-400 mb-4">
        Showing {filtered.length} of {mockConcerts.length} concerts
      </p>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No concerts found"
          subtitle="Try adjusting your search or city filter"
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3">Artist</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3">Concert</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3">Date</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase px-4 py-3">City / Venue</th>
                <th className="text-right text-xs font-semibold text-gray-400 uppercase px-4 py-3">Tickets Sold</th>
                <th className="text-right text-xs font-semibold text-gray-400 uppercase px-4 py-3">Sell-Through</th>
                <th className="text-right text-xs font-semibold text-gray-400 uppercase px-4 py-3">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(c => (
                <tr
                  key={c.id}
                  onClick={() => navigate(`/concerts/${c.id}`)}
                  className="hover:bg-blue-50 transition cursor-pointer"
                >
                  <td className="px-4 py-3 font-semibold text-brand-navy">{c.artist}</td>
                  <td className="px-4 py-3 text-gray-600">{c.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Calendar size={12} />
                      {formatDate(c.date)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <MapPin size={12} />
                      <span>{c.city}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 pl-4">{c.venue}</p>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">{formatNumber(c.tickets_sold)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      (c.tickets_sold / c.capacity) >= 0.95
                        ? 'bg-green-100 text-green-700'
                        : (c.tickets_sold / c.capacity) >= 0.75
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {sellThrough(c.tickets_sold, c.capacity)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-brand-navy">
                    {formatCurrency(c.total_revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Concerts