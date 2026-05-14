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

  onLoad: function() {
    this.loadReports(false)
  },

  onShow: function() {
    var tabBar = this.getTabBar && this.getTabBar()
    if (tabBar) tabBar.setData({ selected: 1 })
  },

  onPullDownRefresh: function() {
    this.loadReports(true)
      .catch(function() {})
      .then(function() {
        wx.stopPullDownRefresh()
      })
  },

  loadReports: function(forceRefresh) {
    var self = this
    var force = forceRefresh === true
    this.setData({ loading: true, error: '' })
    return fetchReports(force)
      .then(function(data) {
        var raw = data.reports ? data.reports : []
        var reports = raw.map(function(r) {
          r.logoUrl = getLogoUrl(r.ticker || '')
          r.logoColor = logoColor(r.ticker || '')
          r.logoInitial = logoInitial(r.ticker || '')
          r.logoError = false
          return r
        })
        self.setData({ reports: reports, loading: false })
      })
      .catch(function(e) {
        var msg =
          e.message ? e.message : '加载失败，请下拉刷新重试'
        self.setData({ loading: false, error: msg })
      })
  },

  switchMarket: function(e) {
    this.setData({ filterMarket: e.currentTarget.dataset.market })
  },

  onLogoError: function(e) {
    var idx = e.currentTarget.dataset.idx
    var update = {}
    update['reports[' + idx + '].logoError'] = true
    this.setData(update)
  },

  openReport: function(e) {
    var ds = e.currentTarget.dataset
    var url = ds.url
    var title = ds.title
    if (!url) return
    wx.navigateTo({
      url:
        '/pages/report-viewer/report-viewer?url=' +
        encodeURIComponent(url) +
        '&title=' +
        encodeURIComponent(title),
      fail: function() {
        wx.setClipboardData({
          data: url,
          success: function() {
            wx.showToast({ title: '链接已复制', icon: 'success' })
          },
        })
      },
    })
  },
})
