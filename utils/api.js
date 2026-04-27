const COS_BASE = 'https://bloom-1300867387.cos.ap-guangzhou.myqcloud.com'
const LATEST_JSON = `${COS_BASE}/daily_picks/latest.json`

// Cache TTL: 30 minutes
const CACHE_TTL = 30 * 60 * 1000

let _cache = null
let _cacheTime = 0

function fetchPicks(forceRefresh = false) {
  return new Promise((resolve, reject) => {
    const now = Date.now()
    if (!forceRefresh && _cache && now - _cacheTime < CACHE_TTL) {
      return resolve(_cache)
    }
    wx.request({
      url: LATEST_JSON,
      method: 'GET',
      success(res) {
        if (res.statusCode === 200 && res.data) {
          _cache = res.data
          _cacheTime = now
          resolve(res.data)
        } else {
          reject(new Error(`HTTP ${res.statusCode}`))
        }
      },
      fail(err) {
        reject(err)
      },
    })
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

module.exports = { fetchPicks, fmtChange, fmtPE, fmtScore, changeColor, peColor, scoreColor }
