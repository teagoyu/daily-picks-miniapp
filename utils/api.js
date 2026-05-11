const COS_BASE = 'https://bloom-1300867387.cos.ap-guangzhou.myqcloud.com'
const LATEST_JSON = `${COS_BASE}/daily_picks/latest.json`
const REPORTS_INDEX_JSON = `${COS_BASE}/reports/index.json`

// Cache TTL: 30 minutes
const CACHE_TTL = 30 * 60 * 1000

let _picksCache = null
let _picksCacheTime = 0
let _reportsCache = null
let _reportsCacheTime = 0

function _request(url, forceRefresh) {
  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method: 'GET',
      timeout: 15000,
      header: forceRefresh ? { 'Cache-Control': 'no-cache' } : {},
      success(res) {
        if (res.statusCode === 200 && res.data) {
          resolve(res.data)
        } else {
          reject(new Error(`HTTP ${res.statusCode}`))
        }
      },
      fail(err) {
        console.error('[api] request failed:', url, JSON.stringify(err))
        reject(new Error(err.errMsg || JSON.stringify(err)))
      },
    })
  })
}

function fetchPicks(forceRefresh = false) {
  const now = Date.now()
  if (!forceRefresh && _picksCache && now - _picksCacheTime < CACHE_TTL) {
    return Promise.resolve(_picksCache)
  }
  return _request(LATEST_JSON, forceRefresh).then(data => {
    _picksCache = data
    _picksCacheTime = Date.now()
    return data
  })
}

function fetchReports(forceRefresh = false) {
  const now = Date.now()
  if (!forceRefresh && _reportsCache && now - _reportsCacheTime < CACHE_TTL) {
    return Promise.resolve(_reportsCache)
  }
  return _request(REPORTS_INDEX_JSON, forceRefresh).then(data => {
    _reportsCache = data
    _reportsCacheTime = Date.now()
    return data
  })
}

// Format helpers
function fmtChange(val) {
  if (val == null) return '—'
  const sign = val >= 0 ? '+' : ''
  return `${sign}${val.toFixed(2)}%`
}

function fmtPE(val) {
  if (val == null || val <= 0) return '—'
  return `${val.toFixed(1)}x`
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

function marketLabel(market) {
  return { US: '美股', HK: '港股', CN: 'A股' }[market] || market
}

function marketColor(market) {
  return { US: '#60a5fa', HK: '#f87171', CN: '#fbbf24' }[market] || '#8b949e'
}

module.exports = {
  fetchPicks, fetchReports,
  fmtChange, fmtPE, fmtScore,
  changeColor, peColor, scoreColor,
  marketLabel, marketColor,
}
