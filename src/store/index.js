import { createStore } from 'vuex'

export default createStore({
  state: {
    sidebarVisible: typeof window !== 'undefined'
      ? (localStorage.getItem('sidebarVisible') === null
        ? true
        : localStorage.getItem('sidebarVisible') === 'true')
      : true,
    theme: typeof window !== 'undefined' ? (localStorage.getItem('theme') || 'light') : 'light',
  },
  mutations: {
    toggleSidebar(state) {
      state.sidebarVisible = !state.sidebarVisible
      if (typeof window !== 'undefined') localStorage.setItem('sidebarVisible', String(state.sidebarVisible))
    },
    updateSidebarVisible(state, value) {
      state.sidebarVisible = value
      if (typeof window !== 'undefined') localStorage.setItem('sidebarVisible', String(state.sidebarVisible))
    },
    toggleTheme(state) {
      state.theme = state.theme === 'dark' ? 'light' : 'dark'
      if (typeof window !== 'undefined') localStorage.setItem('theme', state.theme)
    },
    setTheme(state, value) {
      state.theme = value
      if (typeof window !== 'undefined') localStorage.setItem('theme', state.theme)
    },
  },
  actions: {},
  modules: {},
})
