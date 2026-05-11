Component({
  data: {
    selected: 0,
    tabs: [
      { text: '每日选股', icon: '📈', path: '/pages/index/index' },
      { text: '深度分析', icon: '🔬', path: '/pages/analysis/analysis' },
    ],
  },
  methods: {
    switchTab(e) {
      const idx = e.currentTarget.dataset.index
      const path = this.data.tabs[idx].path
      wx.switchTab({ url: path })
    },
  },
})
