// Logo.dev free API token — sign up at https://logo.dev (500k req/month free)
// Leave empty to always use text avatar fallback
var LOGO_DEV_TOKEN = ''

var COS_BASE = 'https://bloom-1300867387.cos.ap-guangzhou.myqcloud.com'
var LATEST_JSON = COS_BASE + '/daily_picks/latest.json'
var REPORTS_INDEX_JSON = COS_BASE + '/reports/index.json'

// Cache TTL: 30 minutes
var CACHE_TTL = 30 * 60 * 1000

var _picksCache = null
var _picksCacheTime = 0
var _reportsCache = null
var _reportsCacheTime = 0

function _request(url, forceRefresh) {
  return new Promise(function(resolve, reject) {
    wx.request({
      url: url,
      method: 'GET',
      timeout: 15000,
      header: forceRefresh ? { 'Cache-Control': 'no-cache' } : {},
      success: function(res) {
        if (res.statusCode === 200 && res.data) {
          resolve(res.data)
        } else {
          reject(new Error('HTTP ' + res.statusCode))
        }
      },
      fail: function(err) {
        console.error('[api] request failed:', url, JSON.stringify(err))
        reject(
          new Error(err.errMsg ? err.errMsg : JSON.stringify(err)),
        )
      },
    })
  })
}

function fetchPicks(forceRefresh) {
  var now = Date.now()
  var skipCache = forceRefresh === true
  if (!skipCache && _picksCache && now - _picksCacheTime < CACHE_TTL) {
    return Promise.resolve(_picksCache)
  }
  return _request(LATEST_JSON, skipCache).then(function(data) {
    _picksCache = data
    _picksCacheTime = Date.now()
    return data
  })
}

function fetchReports(forceRefresh) {
  var now = Date.now()
  var skipCache = forceRefresh === true
  if (!skipCache && _reportsCache && now - _reportsCacheTime < CACHE_TTL) {
    return Promise.resolve(_reportsCache)
  }
  return _request(REPORTS_INDEX_JSON, skipCache).then(function(data) {
    _reportsCache = data
    _reportsCacheTime = Date.now()
    return data
  })
}

// Format helpers
function fmtChange(val) {
  if (val == null) return '—'
  var sign = val >= 0 ? '+' : ''
  return sign + val.toFixed(2) + '%'
}

function fmtPE(val) {
  if (val == null || val <= 0) return '—'
  return val.toFixed(1) + 'x'
}

function fmtScore(val) {
  return val != null ? val.toFixed(1) : '—'
}

function changeColor(val) {
  if (val == null) return '#8b949e'
  return val >= 0 ? '#3fb950' : '#f85149'
}

function peColor(val) {
  if (val == null || val <= 0) return '#8b949e'
  if (val <= 30) return '#3fb950'
  if (val <= 60) return '#e6edf3'
  return '#f85149'
}

function scoreColor(val) {
  if (val >= 70) return '#3fb950'
  if (val >= 55) return '#d29922'
  return '#8b949e'
}

// Return logo.dev URL for a symbol, or '' if no token configured
function getLogoUrl(symbol) {
  if (!LOGO_DEV_TOKEN) return ''
  var ticker = symbol.replace(/\.(US|HK|SH|SZ|SG)$/i, '')
  return (
    'https://img.logo.dev/ticker/' +
    ticker +
    '?token=' +
    LOGO_DEV_TOKEN +
    '&size=64'
  )
}

// Deterministic color per symbol for text avatar fallback
var _AVATAR_COLORS = [
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
  '#F59E0B',
  '#10B981',
  '#EF4444',
  '#06B6D4',
  '#84CC16',
]
function logoColor(symbol) {
  var h = 0
  var i
  for (i = 0; i < symbol.length; i++) {
    h = (h * 31 + symbol.charCodeAt(i)) & 0x7fffffff
  }
  return _AVATAR_COLORS[h % _AVATAR_COLORS.length]
}

// First 1-2 letters to show in text avatar
function logoInitial(symbol) {
  var ticker = symbol.replace(/\.(US|HK|SH|SZ|SG)$/i, '')
  var n = ticker.length
  return ticker.slice(0, n <= 2 ? 2 : 1).toUpperCase()
}

function marketLabel(market) {
  var map = { US: '美股', HK: '港股', CN: 'A股' }
  var lab = map[market]
  return lab ? lab : market
}

function marketColor(market) {
  var map = { US: '#60a5fa', HK: '#f87171', CN: '#fbbf24' }
  var c = map[market]
  return c ? c : '#8b949e'
}

module.exports = {
  fetchPicks: fetchPicks,
  fetchReports: fetchReports,
  fmtChange: fmtChange,
  fmtPE: fmtPE,
  fmtScore: fmtScore,
  changeColor: changeColor,
  peColor: peColor,
  scoreColor: scoreColor,
  marketLabel: marketLabel,
  marketColor: marketColor,
  getLogoUrl: getLogoUrl,
  logoColor: logoColor,
  logoInitial: logoInitial,
}
