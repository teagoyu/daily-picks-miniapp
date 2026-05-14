const { fetchPicks, fmtChange, fmtPE, fmtScore, changeColor, peColor, scoreColor, getLogoUrl, logoColor, logoInitial } = require('../../utils/api')

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

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 })
    }
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

  _enrichStocks(list) {
    return list.map(s => ({
      ...s,
      priceStr: s.price ? String(s.price) : '—',
      changeStr: fmtChange(s.change),
      changeColor: changeColor(s.change),
      peStr: fmtPE(s.pe),
      peColor: peColor(s.pe),
      scoreStr: fmtScore(s.score),
      scoreColor: scoreColor(s.score),
      maTag: s.ma_signal || '—',
      logoUrl: getLogoUrl(s.symbol || ''),
      logoColor: logoColor(s.symbol || ''),
      logoInitial: logoInitial(s.symbol || ''),
      logoError: false,
    }))
  },

  onLogoError(e) {
    const { idx } = e.currentTarget.dataset
    const market = this.data.activeMarket
    this.setData({ [`picks.${market}[${idx}].logoError`]: true })
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
