import { create } from 'zustand'

const useFilterStore = create((set) => ({
  selectedArtist: null,
  selectedGenre:  null,
  dateRange: {
    from: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
      .toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  },

  setArtist:    (artist)    => set({ selectedArtist: artist }),
  setGenre:     (genre)     => set({ selectedGenre: genre }),
  setDateRange: (dateRange) => set({ dateRange }),
  resetFilters: ()          => set({ selectedArtist: null, selectedGenre: null }),
}))

export default useFilterStore