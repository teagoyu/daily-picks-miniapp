const { fmtChange, fmtPE, changeColor, peColor, scoreColor } = require('../../utils/api')

Page({
  data: {
    stock: null,
  },

  onLoad(options) {
    if (!options.data) return
    const stock = JSON.parse(decodeURIComponent(options.data))
    this.setData({
      stock: {
        ...stock,
        changeStr: fmtChange(stock.change),
        changeColor: changeColor(stock.change),
        peStr: fmtPE(stock.pe),
        peColor: peColor(stock.pe),
        scoreColor: scoreColor(stock.score),
        hasPB: stock.pb != null,
        hasTurnover: stock.turnover_rate != null,
        hasRSI: stock.rsi != null,
        hasVolRatio: stock.vol_ratio != null,
      },
    })
    wx.setNavigationBarTitle({ title: stock.name || stock.symbol })
  },
})
