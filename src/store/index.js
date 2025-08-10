import { createStore } from 'vuex'

export default createStore({
  state: {
    sidebarVisible: true,
    theme: typeof window !== 'undefined' ? (localStorage.getItem('theme') || 'light') : 'light',
  },
  mutations: {
    toggleSidebar(state) {
      state.sidebarVisible = !state.sidebarVisible
    },
    updateSidebarVisible(state, value) {
      state.sidebarVisible = value
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
