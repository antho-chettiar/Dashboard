import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, MapPin, Users, Ticket, DollarSign, TrendingUp } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import KpiCard from '../components/ui/KpiCard'
import ChartContainer from '../components/charts/ChartContainer'
import BarChart from '../components/charts/BarChart'
import EmptyState from '../components/ui/EmptyState'
import { mockConcerts } from '../utils/mockData'
import { formatNumber, formatCurrency, formatDate, sellThrough } from '../utils/formatters'

function ConcertDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const concert = mockConcerts.find(c => c.id === id)

  if (!concert) {
    return (
      <div className="p-6">
        <EmptyState title="Concert not found" subtitle="This concert does not exist." />
      </div>
    )
  }

  const sellThroughPct = ((concert.tickets_sold / concert.capacity) * 100).toFixed(1)
  const sponsorRevenue = concert.total_revenue * 0.15
  const ticketRevenue  = concert.total_revenue - sponsorRevenue

  const revenueBreakdown = [
    { name: 'Ticket Revenue',  value: Math.round(ticketRevenue)  },
    { name: 'Sponsor Revenue', value: Math.round(sponsorRevenue) },
  ]

  return (
    <div>
      {/* Back */}
      <button
        onClick={() => navigate('/concerts')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-navy mb-4 transition"
      >
        <ArrowLeft size={16} /> Back to Concerts
      </button>

      {/* Hero */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-brand-navy mb-1">{concert.name}</h1>
            <p className="text-brand-orange font-semibold text-sm mb-3">{concert.artist}</p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-brand-blue" />
                {formatDate(concert.date)}
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin size={14} className="text-brand-blue" />
                {concert.venue}, {concert.city}, {concert.state}
              </div>
              <div className="flex items-center gap-1.5">
                <Users size={14} className="text-brand-blue" />
                Capacity: {formatNumber(concert.capacity)}
              </div>
            </div>
          </div>

          {/* Sell-through badge */}
          <div className="text-center bg-gray-50 rounded-xl px-6 py-4 border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">Sell-Through</p>
            <p className={`text-3xl font-bold ${
              sellThroughPct >= 95 ? 'text-green-600' :
              sellThroughPct >= 75 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {sellThroughPct}%
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Tickets Sold"
          value={formatNumber(concert.tickets_sold)}
          subtitle={`of ${formatNumber(concert.capacity)} capacity`}
          icon={Ticket}
          iconBg="bg-blue-50"
        />
        <KpiCard
          title="Avg. Ticket Price"
          value={formatCurrency(concert.avg_ticket_price)}
          subtitle="Per ticket"
          icon={TrendingUp}
          iconBg="bg-orange-50"
        />
        <KpiCard
          title="Total Revenue"
          value={formatCurrency(concert.total_revenue)}
          subtitle="Including sponsors"
          icon={DollarSign}
          iconBg="bg-green-50"
        />
        <KpiCard
          title="Sponsors"
          value={concert.sponsors.length}
          subtitle="Brand partners"
          icon={Users}
          iconBg="bg-purple-50"
        />
      </div>

      {/* Revenue Breakdown + Sponsors */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-6">
        <ChartContainer
          title="Revenue Breakdown"
          subtitle="Ticket vs. sponsor revenue"
        >
          <BarChart
            data={revenueBreakdown}
            xKey="name"
            layout="horizontal"
            bars={[{ key: 'value', label: 'Revenue (INR)', color: '#2563EB' }]}
            height={220}
          />
        </ChartContainer>

        {/* Sponsors */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-brand-navy mb-4">Sponsors</h3>
          {concert.sponsors.length === 0 ? (
            <EmptyState title="No sponsors" subtitle="No sponsor data available." />
          ) : (
            <div className="space-y-3">
              {concert.sponsors.map((sponsor, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-brand-navy rounded-lg flex items-center justify-center text-white text-xs font-bold">
                      {sponsor[0]}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{sponsor}</span>
                  </div>
                  <span className="text-xs text-gray-400 bg-white border border-gray-200 px-2.5 py-1 rounded-full">
                    Brand Partner
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Location */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-brand-navy mb-3">Location</h3>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <MapPin size={16} className="text-brand-orange" />
          <span>{concert.venue}, {concert.city}, {concert.state}, {concert.country}</span>
        </div>
        <div className="mt-3 bg-gray-50 rounded-lg p-3 text-xs text-gray-400">
          <span className="font-mono">Lat: {concert.lat}  |  Lng: {concert.lng}</span>
        </div>
      </div>
    </div>
  )
}

export default ConcertDetail