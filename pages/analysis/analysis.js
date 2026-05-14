var api = require('../../utils/api')
var fetchReports = api.fetchReports
var getLogoUrl = api.getLogoUrl
var logoColor = api.logoColor
var logoInitial = api.logoInitial

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

  onShow: function() {
    var tabBar = this.getTabBar && this.getTabBar()
    if (tabBar) tabBar.setData({ selected: 1 })
  },

  onPullDownRefresh() {
    this.loadReports(true).finally(() => wx.stopPullDownRefresh())
  },

  async loadReports(forceRefresh = false) {
    this.setData({ loading: true, error: '' })
    try {
      const data = await fetchReports(forceRefresh)
      const reports = (data.reports || []).map(function(r) {
        r.logoUrl = getLogoUrl(r.ticker || '')
        r.logoColor = logoColor(r.ticker || '')
        r.logoInitial = logoInitial(r.ticker || '')
        r.logoError = false
        return r
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
