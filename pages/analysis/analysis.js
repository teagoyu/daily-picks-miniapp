const { fetchReports, marketLabel, marketColor, getLogoUrl, logoColor, logoInitial } = require('../../utils/api')

Page({
  data: {
    reports: [],
    loading: true,
    error: '',
    filterMarket: 'ALL',
    markets: ['ALL', 'US', 'HK', 'CN'],
  },

  onLoad() {
    this.loadReports()
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 })
    }
  },

  onPullDownRefresh() {
    this.loadReports(true).finally(() => wx.stopPullDownRefresh())
  },

  async loadReports(forceRefresh = false) {
    this.setData({ loading: true, error: '' })
    try {
      const data = await fetchReports(forceRefresh)
      const reports = (data.reports || []).map(function(r) {
        return Object.assign({}, r, {
          logoUrl: getLogoUrl(r.ticker || ''),
          logoColor: logoColor(r.ticker || ''),
          logoInitial: logoInitial(r.ticker || ''),
          logoError: false,
        })
      })
      this.setData({ reports, loading: false })
    } catch (e) {
      this.setData({ loading: false, error: e.message || '加载失败，请下拉刷新重试' })
    }
  },

  switchMarket(e) {
    this.setData({ filterMarket: e.currentTarget.dataset.market })
  },

  get filteredReports() {
    const { reports, filterMarket } = this.data
    return filterMarket === 'ALL' ? reports : reports.filter(r => r.market === filterMarket)
  },

  onLogoError(e) {
    const idx = e.currentTarget.dataset.idx
    const update = {}
    update['reports[' + idx + '].logoError'] = true
    this.setData(update)
  },

  openReport(e) {
    const { url, title } = e.currentTarget.dataset
    if (!url) return
    wx.navigateTo({
      url: `/pages/report-viewer/report-viewer?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
      fail(err) {
        // Fallback: copy link if webview fails (e.g. domain not whitelisted yet)
        wx.setClipboardData({
          data: url,
          success: () => wx.showToast({ title: '链接已复制', icon: 'success' }),
        })
      },
    })
  },
})
