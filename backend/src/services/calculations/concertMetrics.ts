export const concertMetrics = {
  /**
   * Total Revenue
   */
  calculateRevenue: (
    ticketsSold: number,
    avgTicketPrice: number
  ) => {
    return ticketsSold * avgTicketPrice;
  },

  /**
   * Sell Through Rate
   */
  calculateSellThroughRate: (
    ticketsSold: number,
    capacity: number
  ) => {
    if (!capacity || capacity <= 0) return 0;

    return Number(
      ((ticketsSold / capacity) * 100).toFixed(2)
    );
  },

  /**
   * Remaining Tickets
   */
  calculateRemainingTickets: (
    ticketsSold: number,
    capacity: number
  ) => {
    return Math.max(capacity - ticketsSold, 0);
  },

  /**
   * Occupancy Rate
   */
  calculateOccupancyRate: (
    ticketsSold: number,
    capacity: number
  ) => {
    if (!capacity || capacity <= 0) return 0;

    return Number(
      ((ticketsSold / capacity) * 100).toFixed(2)
    );
  },

  /**
   * ROI
   */
  calculateROI: (
    revenue: number,
    cost: number
  ) => {
    if (!cost || cost <= 0) return 0;

    return Number(
      (((revenue - cost) / cost) * 100).toFixed(2)
    );
  },

  /**
   * Revenue Per Ticket
   */
  calculateRevenuePerTicket: (
    revenue: number,
    ticketsSold: number
  ) => {
    if (!ticketsSold || ticketsSold <= 0) return 0;

    return Number(
      (revenue / ticketsSold).toFixed(2)
    );
  },

  /**
   * Profitability Category
   */
  getProfitabilityCategory: (
    roi: number
  ) => {
    if (roi >= 80) return 'VERY_HIGH';
    if (roi >= 50) return 'HIGH';
    if (roi >= 20) return 'MEDIUM';

    return 'LOW';
  },
};