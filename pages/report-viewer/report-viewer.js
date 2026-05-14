Page({
  data: {
    url: '',
    title: '',
  },

  onLoad: function(options) {
    var url = decodeURIComponent(options.url || '')
    var title = decodeURIComponent(options.title || '深度分析')
    this.setData({ url: url, title: title })
    wx.setNavigationBarTitle({ title: title })
  },
})
