/* =========================================================================
 *  天气模块 —— Open-Meteo（免费、无需 API Key、支持 CORS，可纯前端调用）
 *  拉取未来 7 天的逐小时预报，聚合成「周末两天 × 时段」的可用天气画像。
 *  网络失败时自动降级为「演示模式」，保证页面永不空白。
 * ========================================================================= */

const API = 'https://api.open-meteo.com/v1/forecast';

/* WMO 天气代码 → 中文 + 图标 */
const WMO = {
  0:  ['晴', '☀️'],  1: ['晴间多云', '🌤️'], 2: ['多云', '⛅'], 3: ['阴', '☁️'],
  45: ['雾', '🌫️'], 48: ['雾凇', '🌫️'],
  51: ['小毛毛雨', '🌦️'], 53: ['毛毛雨', '🌦️'], 55: ['大毛毛雨', '🌦️'],
  56: ['冻毛毛雨', '🌧️'], 57: ['强冻毛毛雨', '🌧️'],
  61: ['小雨', '🌦️'], 63: ['中雨', '🌧️'], 65: ['大雨', '🌧️'],
  66: ['冻雨', '🌧️'], 67: ['强冻雨', '🌧️'],
  71: ['小雪', '🌨️'], 73: ['中雪', '🌨️'], 75: ['大雪', '❄️'], 77: ['雪粒', '🌨️'],
  80: ['阵雨', '🌦️'], 81: ['强阵雨', '🌧️'], 82: ['暴雨', '⛈️'],
  85: ['阵雪', '🌨️'], 86: ['强阵雪', '❄️'],
  95: ['雷阵雨', '⛈️'], 96: ['雷阵雨伴冰雹', '⛈️'], 99: ['强雷暴冰雹', '⛈️'],
};

export function wmoInfo(code) { return WMO[code] || ['未知', '🌡️']; }

/* 用 date 对象取本地日期键 YYYY-MM-DD */
const dayKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/**
 * 获取城市未来 7 天逐小时预报并聚合成「天 → 时段」结构
 * @returns {Promise<{ok:boolean, mode:'live'|'demo', days:Object, raw:any, reason?:string}>}
 */
export async function fetchWeather(city) {
  const url = `${API}?latitude=${city.lat}&longitude=${city.lng}`
    + `&hourly=temperature_2m,apparent_temperature,precipitation_probability,precipitation,`
    + `weather_code,wind_speed_10m,uv_index,relative_humidity_2m`
    + `&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,uv_index_max`
    + `&timezone=auto&forecast_days=7`;

  try {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 9000);
    const res = await fetch(url, { signal: ctl.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const json = await res.json();
    return { ok: true, mode: 'live', days: aggregate(json), raw: json };
  } catch (e) {
    return { ok: false, mode: 'demo', days: demoWeather(city), reason: e.message || '网络不可用' };
  }
}

/* 把逐小时数据装进 日期 → {0..23: {...}} */
function aggregate(json) {
  const h = json.hourly, d = json.daily;
  const days = {};
  h.time.forEach((t, i) => {
    const [date, hh] = t.split('T');
    const hour = parseInt(hh.slice(0, 2), 10);
    (days[date] = days[date] || { hours: {}, daily: null }).hours[hour] = {
      temp: h.temperature_2m[i],
      feels: h.apparent_temperature[i],
      pop: h.precipitation_probability?.[i] ?? 0,
      precip: h.precipitation?.[i] ?? 0,
      code: h.weather_code[i],
      wind: h.wind_speed_10m[i],
      uv: h.uv_index?.[i] ?? 0,
      hum: h.relative_humidity_2m?.[i] ?? 60,
    };
  });
  d.time.forEach((date, i) => {
    if (!days[date]) days[date] = { hours: {}, daily: null };
    days[date].daily = {
      code: d.weather_code[i],
      tmax: d.temperature_2m_max[i],
      tmin: d.temperature_2m_min[i],
      sunrise: d.sunrise?.[i]?.slice(11, 16) ?? '06:30',
      sunset: d.sunset?.[i]?.slice(11, 16) ?? '18:30',
      popmax: d.precipitation_probability_max?.[i] ?? 0,
      uvmax: d.uv_index_max?.[i] ?? 0,
    };
  });
  return days;
}

/* 网络不可用时的确定性演示数据（基于城市气候特征 + 日期种子） */
function demoWeather(city) {
  const seedBase = { shenzhen: 30, guangzhou: 29, beijing: 22, shanghai: 25, hangzhou: 26, chengdu: 24 }[cityKey(city)] ?? 25;
  const days = {};
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const dt = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    const key = dayKey(dt);
    const s = (dt.getDate() * 7 + i * 13) % 10;
    const hours = {};
    for (let hr = 0; hr < 24; hr++) {
      const wave = Math.sin(((hr - 8) / 24) * Math.PI * 2);
      hours[hr] = {
        temp: +(seedBase + wave * 5 - s * 0.3).toFixed(1),
        feels: +(seedBase + wave * 6 - s * 0.3).toFixed(1),
        pop: Math.max(0, Math.min(95, (s * 11 + hr * 2) % 100)),
        precip: 0, code: s > 6 ? 61 : s > 3 ? 2 : 0,
        wind: 8 + (s % 5) * 3, uv: Math.max(0, wave * 7), hum: 60 + (s % 4) * 5,
      };
    }
    days[key] = {
      hours,
      daily: { code: s > 6 ? 61 : s > 3 ? 2 : 0, tmax: seedBase + 4 - s * 0.3, tmin: seedBase - 6 - s * 0.3,
        sunrise: '06:20', sunset: '18:40', popmax: s * 10, uvmax: 7 },
    };
  }
  return days;
}

function cityKey(city) {
  return Object.keys({ shenzhen: 1, guangzhou: 1, beijing: 1, shanghai: 1, hangzhou: 1, chengdu: 1 })
    .find(k => CITY_MATCH[k] === city.name) || '';
}
const CITY_MATCH = { shenzhen: '深圳', guangzhou: '广州', beijing: '北京', shanghai: '上海', hangzhou: '杭州', chengdu: '成都' };

/* ---------------------------------------------------------------------
 *  把某天的逐小时数据，按用户选择的时间窗聚合成一个"天气画像"
 * ------------------------------------------------------------------- */
export function weatherSlice(days, dateStr, window) {
  const day = days?.[dateStr];
  // 找不到该日期时，就近取第一天，避免整页空白
  const fallbackKey = days ? Object.keys(days)[0] : null;
  const dd = day || (fallbackKey ? days[fallbackKey] : null);
  if (!dd) return null;

  const hours = [];
  const from = window.start;
  const to = Math.min(23, window.start + window.hours);
  for (let h = from; h <= to; h++) if (dd.hours[h]) hours.push(dd.hours[h]);
  if (!hours.length) return null;

  const avg = (k) => hours.reduce((a, b) => a + (b[k] ?? 0), 0) / hours.length;
  const max = (k) => Math.max(...hours.map(b => b[k] ?? 0));

  const pop = Math.round(max('pop'));            // 降水概率峰值
  const temp = +avg('temp').toFixed(1);
  const feels = +avg('feels').toFixed(1);
  const wind = +avg('wind').toFixed(1);          // km/h
  const uv = +max('uv').toFixed(1);
  const code = hours.map(h => h.code).sort((a, b) =>
    (WMO[b]?.[0].length || 0) - (WMO[a]?.[0].length || 0))[0] ?? dd.daily?.code ?? 0;

  return {
    date: dateStr, window: window.id, hours: hours.length,
    pop, temp, feels, wind, uv, hum: Math.round(avg('hum')),
    code, info: wmoInfo(code),
    daily: dd.daily,
    wet: pop >= 50 || (dd.daily?.popmax ?? 0) >= 60,
    hot: feels >= 32,
    cold: feels <= 5,
    windy: wind >= 30,          // km/h
    severe: feels >= 37 || wind >= 45 || pop >= 85,
  };
}
