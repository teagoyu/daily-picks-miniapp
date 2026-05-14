var api = require('../../utils/api')
var fetchPicks = api.fetchPicks
var fmtChange = api.fmtChange
var fmtPE = api.fmtPE
var fmtScore = api.fmtScore
var changeColor = api.changeColor
var peColor = api.peColor
var scoreColor = api.scoreColor
var getLogoUrl = api.getLogoUrl
var logoColor = api.logoColor
var logoInitial = api.logoInitial

var MARKET_LABELS = { US: '🇺🇸 美股', HK: '🇭🇰 港股', CN: '🇨🇳 A股' }
var MARKETS = ['US', 'HK', 'CN']

Page({
  data: {
    loading: true,
    error: '',
    date: '',
    updatedAt: '',
    activeMarket: 'US',
    markets: MARKET_LABELS,
    marketList: MARKETS,
    picks: {},    // { US: [...], HK: [...], CN: [...] }
    allStocks: {}, // { US: [...], ... }
    showAll: false,
  },

  onLoad: function() {
    this.loadData()
  },

  onShow: function() {
    var tabBar = this.getTabBar && this.getTabBar()
    if (tabBar) tabBar.setData({ selected: 0 })
  },

  onPullDownRefresh: function() {
    this.loadData(true)
  },

  loadData: function(forceRefresh) {
    var self = this
    var force = forceRefresh === true
    this.setData({ loading: true, error: '' })
    fetchPicks(force)
      .then(function(data) {
        var picks = {}
        var allStocks = {}
        MARKETS.forEach(function(mkt) {
          var mk = data.markets && data.markets[mkt]
          picks[mkt] = self._enrichStocks(mk && mk.picks ? mk.picks : [])
          allStocks[mkt] = self._enrichStocks(mk && mk.all ? mk.all : [])
        })
        self.setData({
          loading: false,
          date: data.date || '',
          updatedAt: data.updated_at || '',
          picks: picks,
          allStocks: allStocks,
        })
      })
      .catch(function() {
        self.setData({ loading: false, error: '数据加载失败，请下拉刷新重试' })
      })
      .then(function() {
        wx.stopPullDownRefresh()
      })
  },

  _enrichStocks: function(list) {
    return list.map(function(s) {
      s.priceStr = s.price ? String(s.price) : '—'
      s.changeStr = fmtChange(s.change)
      s.changeColor = changeColor(s.change)
      s.peStr = fmtPE(s.pe)
      s.peColor = peColor(s.pe)
      s.scoreStr = fmtScore(s.score)
      s.scoreColor = scoreColor(s.score)
      s.maTag = s.ma_signal || '—'
      s.logoUrl = getLogoUrl(s.symbol || '')
      s.logoColor = logoColor(s.symbol || '')
      s.logoInitial = logoInitial(s.symbol || '')
      s.logoError = false
      return s
    })
  },

  onLogoError: function(e) {
    var idx = e.currentTarget.dataset.idx
    var market = this.data.activeMarket
    var update = {}
    update['picks.' + market + '[' + idx + '].logoError'] = true
    this.setData(update)
  },

  switchMarket: function(e) {
    this.setData({ activeMarket: e.currentTarget.dataset.market, showAll: false })
  },

  toggleShowAll: function() {
    this.setData({ showAll: !this.data.showAll })
  },

  goDetail: function(e) {
    var stock = e.currentTarget.dataset.stock
    wx.navigateTo({
      url: '/pages/detail/detail?data=' + encodeURIComponent(JSON.stringify(stock)),
    })
  },
})
