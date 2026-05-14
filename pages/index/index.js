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

const MARKET_LABELS = { US: '🇺🇸 美股', HK: '🇭🇰 港股', CN: '🇨🇳 A股' }
const MARKETS = ['US', 'HK', 'CN']

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

  onLoad() {
    this.loadData()
  },

  onShow: function() {
    var tabBar = this.getTabBar && this.getTabBar()
    if (tabBar) tabBar.setData({ selected: 0 })
  },

  onPullDownRefresh() {
    this.loadData(true)
  },

  async loadData(forceRefresh = false) {
    this.setData({ loading: true, error: '' })
    try {
      const data = await fetchPicks(forceRefresh)
      const picks = {}
      const allStocks = {}
      MARKETS.forEach(mkt => {
        picks[mkt] = this._enrichStocks(data.markets?.[mkt]?.picks || [])
        allStocks[mkt] = this._enrichStocks(data.markets?.[mkt]?.all || [])
      })
      this.setData({
        loading: false,
        date: data.date || '',
        updatedAt: data.updated_at || '',
        picks,
        allStocks,
      })
    } catch (e) {
      this.setData({ loading: false, error: '数据加载失败，请下拉刷新重试' })
    } finally {
      wx.stopPullDownRefresh()
    }
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

  onLogoError(e) {
    const idx = e.currentTarget.dataset.idx
    const market = this.data.activeMarket
    const update = {}
    update['picks.' + market + '[' + idx + '].logoError'] = true
    this.setData(update)
  },

  switchMarket(e) {
    this.setData({ activeMarket: e.currentTarget.dataset.market, showAll: false })
  },

  toggleShowAll() {
    this.setData({ showAll: !this.data.showAll })
  },

  goDetail(e) {
    const stock = e.currentTarget.dataset.stock
    wx.navigateTo({
      url: `/pages/detail/detail?data=${encodeURIComponent(JSON.stringify(stock))}`,
    })
  },
})
