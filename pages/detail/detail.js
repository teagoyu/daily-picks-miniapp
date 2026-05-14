var api = require('../../utils/api')

Page({
  data: {
    stock: null,
  },

  onLoad: function(options) {
    if (!options.data) return
    var stock = JSON.parse(decodeURIComponent(options.data))
    stock.changeStr = api.fmtChange(stock.change)
    stock.changeColor = api.changeColor(stock.change)
    stock.peStr = api.fmtPE(stock.pe)
    stock.peColor = api.peColor(stock.pe)
    stock.scoreColor = api.scoreColor(stock.score)
    stock.hasPB = stock.pb != null
    stock.hasTurnover = stock.turnover_rate != null
    stock.hasRSI = stock.rsi != null
    stock.hasVolRatio = stock.vol_ratio != null
    this.setData({ stock: stock })
    wx.setNavigationBarTitle({ title: stock.name || stock.symbol })
  },
})
