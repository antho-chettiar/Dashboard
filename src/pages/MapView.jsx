import { useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet'
import PageHeader from '../components/ui/PageHeader'
import { mockConcerts, mockArtists } from '../utils/mockData'
import { formatNumber, formatCurrency, formatDate } from '../utils/formatters'
import { MapPin, Ticket, DollarSign, Music2 } from 'lucide-react'

// Fix Leaflet default marker icon issue in Vite
import L from 'leaflet'
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const ARTISTS = ['All Artists', ...mockArtists.map(a => a.name)]

// Scale circle radius by tickets sold
function getRadius(ticketsSold) {
  if (ticketsSold >= 50000) return 28
  if (ticketsSold >= 30000) return 22
  if (ticketsSold >= 15000) return 16
  return 12
}

// Colour by sell-through %
function getColor(sold, capacity) {
  const pct = sold / capacity
  if (pct >= 0.95) return '#15803D'
  if (pct >= 0.75) return '#F97316'
  return '#DC2626'
}

function MapView() {
  const [selectedArtist, setArtist] = useState('All Artists')
  const [selectedConcert, setConcert] = useState(null)

  const filtered = mockConcerts.filter(c =>
    selectedArtist === 'All Artists' || c.artist === selectedArtist
  )

  // Summary stats
  const totalTickets  = filtered.reduce((a, c) => a + c.tickets_sold, 0)
  const totalRevenue  = filtered.reduce((a, c) => a + c.total_revenue, 0)
  const totalConcerts = filtered.length

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Tour Map"
        subtitle="Geographic view of concert locations and performance"
      />

      {/* Filters + Stats Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        {/* Artist Filter */}
        <select
          value={selectedArtist}
          onChange={e => setArtist(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white text-gray-600 outline-none shadow-sm"
        >
          {ARTISTS.map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        {/* Quick Stats */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
            <Music2 size={14} className="text-brand-blue" />
            <span className="text-xs text-gray-500">Concerts:</span>
            <span className="text-xs font-bold text-brand-navy">{totalConcerts}</span>
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
            <Ticket size={14} className="text-brand-orange" />
            <span className="text-xs text-gray-500">Tickets:</span>
            <span className="text-xs font-bold text-brand-navy">{formatNumber(totalTickets)}</span>
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
            <DollarSign size={14} className="text-green-600" />
            <span className="text-xs text-gray-500">Revenue:</span>
            <span className="text-xs font-bold text-brand-navy">{formatCurrency(totalRevenue)}</span>
          </div>
        </div>
      </div>

      {/* Map + Sidebar */}
      <div className="flex gap-4 flex-1" style={{ minHeight: '520px' }}>

        {/* Map */}
        <div className="flex-1 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
          <MapContainer
            center={[20.5937, 78.9629]}
            zoom={5}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filtered.map(concert => (
              <CircleMarker
                key={concert.id}
                center={[concert.lat, concert.lng]}
                radius={getRadius(concert.tickets_sold)}
                pathOptions={{
                  color:       getColor(concert.tickets_sold, concert.capacity),
                  fillColor:   getColor(concert.tickets_sold, concert.capacity),
                  fillOpacity: 0.7,
                  weight:      2,
                }}
                eventHandlers={{
                  click: () => setConcert(concert),
                }}
              >
                <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
                  <div className="text-xs">
                    <p className="font-bold">{concert.artist}</p>
                    <p>{concert.venue}, {concert.city}</p>
                    <p>{formatDate(concert.date)}</p>
                  </div>
                </Tooltip>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>

        {/* Sidebar — Concert List / Detail */}
        <div className="w-72 flex flex-col gap-3 overflow-y-auto">
          {selectedConcert ? (
            // Concert Detail Panel
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <button
                onClick={() => setConcert(null)}
                className="text-xs text-gray-400 hover:text-brand-navy mb-3 transition"
              >
                ← Back to list
              </button>
              <h3 className="font-bold text-brand-navy text-sm mb-1">{selectedConcert.name}</h3>
              <p className="text-xs text-brand-orange font-semibold mb-3">{selectedConcert.artist}</p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-gray-500">
                  <MapPin size={12} className="text-brand-blue" />
                  {selectedConcert.venue}, {selectedConcert.city}
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {[
                    { label: 'Date',         value: formatDate(selectedConcert.date) },
                    { label: 'Capacity',     value: formatNumber(selectedConcert.capacity) },
                    { label: 'Tickets Sold', value: formatNumber(selectedConcert.tickets_sold) },
                    { label: 'ATP',          value: formatCurrency(selectedConcert.avg_ticket_price) },
                    { label: 'Revenue',      value: formatCurrency(selectedConcert.total_revenue) },
                    { label: 'Sell-Through', value: ((selectedConcert.tickets_sold / selectedConcert.capacity) * 100).toFixed(1) + '%' },
                  ].map((item, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-2">
                      <p className="text-gray-400 text-xs">{item.label}</p>
                      <p className="font-semibold text-brand-navy text-xs mt-0.5">{item.value}</p>
                    </div>
                  ))}
                </div>
                {/* Sponsors */}
                <div className="mt-3">
                  <p className="text-gray-400 mb-2">Sponsors</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedConcert.sponsors.map((s, i) => (
                      <span key={i} className="bg-blue-50 text-brand-blue text-xs px-2 py-0.5 rounded-full font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Concert List
            <>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider px-1">
                {filtered.length} Concert{filtered.length !== 1 ? 's' : ''}
              </p>
              {filtered.map(concert => (
                <div
                  key={concert.id}
                  onClick={() => setConcert(concert)}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 cursor-pointer hover:border-brand-blue hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs font-bold text-brand-navy">{concert.artist}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{concert.city}</p>
                    </div>
                    <span
                      className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0"
                      style={{ background: getColor(concert.tickets_sold, concert.capacity) }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">{formatDate(concert.date)}</span>
                    <span className="font-semibold text-brand-navy">{formatCurrency(concert.total_revenue)}</span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-4 px-1">
        <p className="text-xs text-gray-400 font-semibold">Sell-Through:</p>
        {[
          { color: '#15803D', label: '≥ 95% (Sold Out)' },
          { color: '#F97316', label: '75–95%' },
          { color: '#DC2626', label: '< 75%' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full" style={{ background: item.color }} />
            <span className="text-xs text-gray-500">{item.label}</span>
          </div>
        ))}
        <p className="text-xs text-gray-400 ml-4">Circle size = tickets sold</p>
      </div>
    </div>
  )
}

export default MapView