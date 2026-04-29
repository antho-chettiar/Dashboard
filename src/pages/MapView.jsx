import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import PageHeader from '../components/ui/PageHeader'
import { mockConcerts, mockArtists } from '../utils/mockData'
import { formatNumber, formatCurrency, formatDate } from '../utils/formatters'
import { MapPin, Ticket, DollarSign, Music2, X } from 'lucide-react'

// ── Fix default icon path (leaflet quirk) ──
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// ── Inject pulse CSS once ──
const PULSE_CSS = `
  .venue-marker { position: relative; cursor: pointer; }
  .venue-marker .dot {
    position: absolute; inset: 0; border-radius: 50%;
    background: var(--m-color, #818CF8);
    border: 2px solid rgba(255,255,255,0.35);
    box-shadow: 0 0 0 0 var(--m-glow, rgba(129,140,248,0.6));
    animation: pulse-venue 2.4s ease-out infinite;
  }
  .venue-marker.selected .dot {
    border-color: #fff;
    box-shadow: 0 0 16px var(--m-glow, rgba(129,140,248,0.8));
    animation: none;
  }
  @keyframes pulse-venue {
    0%   { box-shadow: 0 0 0 0   var(--m-glow, rgba(129,140,248,0.6)); }
    70%  { box-shadow: 0 0 0 12px rgba(0,0,0,0); }
    100% { box-shadow: 0 0 0 0   rgba(0,0,0,0); }
  }
`
if (!document.getElementById('venue-pulse-css')) {
  const el = document.createElement('style')
  el.id = 'venue-pulse-css'
  el.textContent = PULSE_CSS
  document.head.appendChild(el)
}

const ARTISTS = ['All Artists', ...mockArtists.map(a => a.name)]

function sellColor(sold, cap) {
  const p = sold / cap
  if (p >= 0.95) return { color: '#34D399', glow: 'rgba(52,211,153,0.55)'  }
  if (p >= 0.75) return { color: '#FBBF24', glow: 'rgba(251,191,36,0.55)'  }
  return           { color: '#F87171', glow: 'rgba(248,113,113,0.55)' }
}
function markerSize(t) { return t >= 50000 ? 28 : t >= 30000 ? 22 : t >= 15000 ? 17 : 13 }

// Creates a Leaflet DivIcon for each concert dot
function makeIcon(concert, isSelected) {
  const sz  = markerSize(concert.tickets_sold)
  const { color, glow } = sellColor(concert.tickets_sold, concert.capacity)
  return L.divIcon({
    className: '',
    html: `
      <div class="venue-marker ${isSelected ? 'selected' : ''}"
           style="width:${sz}px;height:${sz}px;--m-color:${color};--m-glow:${glow}">
        <div class="dot"></div>
      </div>`,
    iconSize:   [sz, sz],
    iconAnchor: [sz / 2, sz / 2],
  })
}

// Inner component to add markers imperatively (avoids re-mount flicker)
function ConcertMarkers({ concerts, selectedId, onSelect }) {
  const map = useMap()
  const layerRef = useRef(L.layerGroup())

  useEffect(() => {
    layerRef.current.addTo(map)
    return () => layerRef.current.remove()
  }, [map])

  useEffect(() => {
    layerRef.current.clearLayers()
    concerts.forEach(concert => {
      const icon   = makeIcon(concert, concert.id === selectedId)
      const marker = L.marker([concert.lat, concert.lng], { icon, zIndexOffset: concert.id === selectedId ? 1000 : 0 })

      // Tooltip
      marker.bindTooltip(
        `<div style="font-family:Satoshi,sans-serif;line-height:1.5;min-width:130px">
          <p style="font-weight:700;font-size:13px;margin-bottom:2px">${concert.artist}</p>
          <p style="font-size:11px;opacity:.75">${concert.venue}</p>
          <p style="font-size:11px;opacity:.6">${concert.city} · ${formatDate(concert.date)}</p>
         </div>`,
        {
          direction: 'top',
          offset: L.point(0, -(markerSize(concert.tickets_sold) / 2 + 8)),
          opacity: 1,
          className: 'venue-tooltip',
        }
      )

      marker.on('click', () => onSelect(concert))
      layerRef.current.addLayer(marker)
    })
  }, [concerts, selectedId, onSelect])

  return null
}

// Inject tooltip CSS
const TT_CSS = `
  .venue-tooltip .leaflet-tooltip {
    background: rgba(8,11,20,0.92) !important;
    border: 1px solid rgba(255,255,255,0.12) !important;
    border-radius: 10px !important;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5) !important;
    padding: 8px 12px !important;
    color: #F0EEFF !important;
    backdrop-filter: blur(12px);
  }
  .venue-tooltip .leaflet-tooltip::before { display: none !important; }
  .leaflet-control-zoom {
    border: 1px solid rgba(255,255,255,0.1) !important;
    border-radius: 10px !important;
    overflow: hidden;
    box-shadow: 0 4px 16px rgba(0,0,0,0.35) !important;
  }
  .leaflet-control-zoom a {
    background: rgba(8,11,20,0.88) !important;
    color: #A8A4C8 !important;
    border-bottom: 1px solid rgba(255,255,255,0.08) !important;
    font-size: 16px !important;
    line-height: 28px !important;
    width: 30px !important; height: 30px !important;
  }
  .leaflet-control-zoom a:hover { background: rgba(99,102,241,0.25) !important; color:#fff !important; }
  .leaflet-control-attribution { display: none !important; }
`
if (!document.getElementById('venue-tooltip-css')) {
  const el = document.createElement('style'); el.id = 'venue-tooltip-css'; el.textContent = TT_CSS
  document.head.appendChild(el)
}

// ── Main Page ──
function MapView() {
  const [selectedArtist, setArtist]   = useState('All Artists')
  const [selectedConcert, setConcert] = useState(null)

  const filtered = mockConcerts.filter(c =>
    selectedArtist === 'All Artists' || c.artist === selectedArtist
  )

  const totalTickets = filtered.reduce((a, c) => a + c.tickets_sold, 0)
  const totalRevenue = filtered.reduce((a, c) => a + c.total_revenue, 0)

  const selStyle = {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    color: 'var(--text-primary)', fontFamily: 'Satoshi',
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
      {/* Ambient */}
      <div className="fixed top-20 left-72 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.06), transparent 70%)', filter: 'blur(40px)' }} />

      <PageHeader title="Tour Map" subtitle="Geographic view of concert locations and performance" />

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <select value={selectedArtist} onChange={e => { setArtist(e.target.value); setConcert(null) }}
          className="text-sm rounded-xl px-4 py-2.5 outline-none"
          style={selStyle}>
          {ARTISTS.map(a => <option key={a} value={a} style={selStyle}>{a}</option>)}
        </select>

        <div className="flex gap-3 flex-wrap">
          {[
            { icon: Music2,     label: 'Concerts', value: filtered.length,              color: 'var(--accent-indigo)' },
            { icon: Ticket,     label: 'Tickets',  value: formatNumber(totalTickets),   color: 'var(--accent-gold)'   },
            { icon: DollarSign, label: 'Revenue',  value: formatCurrency(totalRevenue), color: 'var(--accent-green)'  },
          ].map((stat, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <stat.icon size={13} style={{ color: stat.color }} />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.label}:</span>
              <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Map + Sidebar */}
      <div className="flex gap-4 flex-1 min-h-0">

        {/* Map */}
        <div className="flex-1 rounded-2xl overflow-hidden"
          style={{ border: '1px solid var(--border)', boxShadow: '0 4px 32px rgba(0,0,0,0.25)' }}>
          <MapContainer
            center={[20.5937, 78.9629]} zoom={5}
            style={{ height: '100%', width: '100%', background: '#0b0f1e' }}
            zoomControl={true}
          >
            {/* CartoDB Dark Matter – clean, minimal, no street clutter */}
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              subdomains="abcd"
              maxZoom={19}
            />
            <ConcertMarkers
              concerts={filtered}
              selectedId={selectedConcert?.id}
              onSelect={setConcert}
            />
          </MapContainer>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-2 overflow-y-auto" style={{ width: '270px' }}>
          {selectedConcert ? (
            <div className="glass-card p-4 animate-scale-in">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Concert Detail</span>
                <button onClick={() => setConcert(null)}
                  className="w-6 h-6 flex items-center justify-center rounded-full transition-all duration-200"
                  style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                  <X size={12} />
                </button>
              </div>
              <h3 className="font-display font-bold text-sm mb-0.5" style={{ color: 'var(--text-primary)' }}>
                {selectedConcert.name}
              </h3>
              <p className="text-xs font-semibold mb-3" style={{ color: 'var(--accent-gold)' }}>
                {selectedConcert.artist}
              </p>
              <div className="flex items-center gap-1.5 mb-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                <MapPin size={11} style={{ color: 'var(--accent-indigo)' }} />
                {selectedConcert.venue}, {selectedConcert.city}
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                {[
                  { label: 'Date',         value: formatDate(selectedConcert.date) },
                  { label: 'Capacity',     value: formatNumber(selectedConcert.capacity) },
                  { label: 'Tickets Sold', value: formatNumber(selectedConcert.tickets_sold) },
                  { label: 'Avg. Ticket',  value: formatCurrency(selectedConcert.avg_ticket_price) },
                  { label: 'Revenue',      value: formatCurrency(selectedConcert.total_revenue) },
                  { label: 'Sell-Through', value: ((selectedConcert.tickets_sold / selectedConcert.capacity) * 100).toFixed(1) + '%' },
                ].map((item, i) => (
                  <div key={i} className="rounded-xl p-2.5" style={{ background: 'var(--bg-secondary)' }}>
                    <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{item.label}</p>
                    <p className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Sell-through bar */}
              <div className="mb-3">
                {(() => {
                  const pct = (selectedConcert.tickets_sold / selectedConcert.capacity) * 100
                  const { color } = sellColor(selectedConcert.tickets_sold, selectedConcert.capacity)
                  return (
                    <>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Sell-Through</span>
                        <span className="text-xs font-bold" style={{ color }}>{pct.toFixed(1)}%</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }} />
                      </div>
                    </>
                  )
                })()}
              </div>

              {selectedConcert.sponsors?.length > 0 && (
                <div>
                  <p className="text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Sponsors</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedConcert.sponsors.map((s, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: 'rgba(99,102,241,0.12)', color: 'var(--accent-indigo)' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <p className="text-xs uppercase tracking-widest px-1 mb-1"
                style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
                {filtered.length} Concerts
              </p>
              {filtered.map(concert => {
                const { color } = sellColor(concert.tickets_sold, concert.capacity)
                return (
                  <div key={concert.id} onClick={() => setConcert(concert)}
                    className="glass-card p-3 cursor-pointer transition-all duration-200"
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.transform = 'translateX(3px)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)';        e.currentTarget.style.transform = 'translateX(0)' }}>
                    <div className="flex items-start justify-between mb-1.5">
                      <div>
                        <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{concert.artist}</p>
                        <p className="text-xs"           style={{ color: 'var(--text-muted)'    }}>{concert.city}</p>
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full mt-0.5 flex-shrink-0" style={{ background: color }} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(concert.date)}</span>
                      <span className="text-xs font-bold font-display" style={{ color: 'var(--accent-gold)' }}>
                        {formatCurrency(concert.total_revenue)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-3">
        <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
          Sell-Through:
        </p>
        {[
          { color: '#34D399', label: '≥ 95% Sold Out' },
          { color: '#FBBF24', label: '75–95%'         },
          { color: '#F87171', label: '< 75%'          },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.label}</span>
          </div>
        ))}
        <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>· Circle size = tickets sold</span>
      </div>
    </div>
  )
}

export default MapView