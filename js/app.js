/* =========================================================================
 *  周末去哪儿 · 应用主控
 * ========================================================================= */

import { CITIES, CATEGORIES, VIBES, TIME_WINDOWS, ACTIVITIES } from './data.js';
import { fetchWeather, weatherSlice, wmoInfo } from './weather.js';
import { recommend, morePicks } from './recommend.js';
import { GUIDE_SEED } from './guides.js';
import { ABOUT } from './about.js';

/* ============================ 状态 ============================ */
const LS = {
  get(k, d) { try { return JSON.parse(localStorage.getItem('wg_' + k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem('wg_' + k, JSON.stringify(v)); } catch { /* 隐私模式忽略 */ } },
};

const state = {
  cityId: LS.get('city', 'shenzhen'),
  date: null,
  windowId: 'afternoon',
  vibes: LS.get('vibes', ['文艺', '出片']),
  budget: LS.get('budget', 200),
  party: LS.get('party', 2),
  maxDist: LS.get('dist', 60),
  avoid: [],
  weather: null,          // { days, mode }
  plans: [],
  shownIds: [],
  lastPrefs: null,
  view: 'explore',
};

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const city = () => CITIES[state.cityId];
const win = () => TIME_WINDOWS.find(w => w.id === state.windowId);

/* ============================ 工具 ============================ */
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg; el.hidden = false;
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.hidden = true; }, 2200);
}

async function copyText(text, okMsg = '已复制到剪贴板') {
  try {
    await navigator.clipboard.writeText(text);
    toast(okMsg);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast(okMsg); }
    catch { toast('复制失败，请手动选择文本'); }
    ta.remove();
  }
}

/* 极简 markdown：**加粗** */
const md = (s) => s.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* 本地日期（避免 toISOString 的 UTC 偏移导致跨日） */
const todayLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const dateLabel = (ds) => {
  if (!ds) return '';
  const [y, m, d] = ds.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  const wd = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][dt.getDay()];
  return `${m}月${d}日 ${wd}`;
};

/* ============================ 导航 ============================ */
function nav(view) {
  state.view = view;
  $$('.view').forEach(v => { v.hidden = v.id !== 'view-' + view; });
  $$('.tab').forEach(t => t.classList.toggle('on', t.dataset.nav === view));
  $('#citySheet').hidden = true;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (view === 'checkin') renderCheckin();
  if (view === 'guide') renderGuides();
  if (view === 'team') renderTeamPage();
}

/* ============================ 城市选择 ============================ */
function renderCityGrid() {
  $('#cityLabel').textContent = city().name;
  $('#cityGrid').innerHTML = Object.entries(CITIES).map(([id, c]) => `
    <button class="city-item ${id === state.cityId ? 'on' : ''}" data-city="${id}">
      ${c.name}<i>${c.prov}</i>
    </button>`).join('');
}

async function switchCity(id) {
  state.cityId = id;
  LS.set('city', id);
  state.date = null; state.plans = []; state.shownIds = []; state.avoid = [];
  renderCityGrid();
  $('#citySheet').hidden = true;
  $('#results').innerHTML = '';
  $('#whyBox').hidden = true;
  $('#prefSummary').hidden = true;
  await loadWeather();
  fillCheckinSelect();
  renderGuides();
}

/* ============================ 天气 ============================ */
async function loadWeather() {
  const bar = $('#weatherBar');
  bar.innerHTML = `<div class="w-skeleton">正在获取 ${city().name} 未来 7 天天气…</div>`;

  const res = await fetchWeather(city());
  state.weather = { days: res.days, mode: res.mode, reason: res.reason };

  // 默认选中最近的周六
  if (!state.date) {
    const keys = Object.keys(res.days);
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const pick = keys.find(k => {
      const dt = new Date(k + 'T12:00:00');
      return dt.getDay() === 6 && dt >= start;
    });
    state.date = pick || keys[Math.min(1, keys.length - 1)];
  }
  renderWeatherBar();
}

function renderWeatherBar() {
  const { days, mode, reason } = state.weather;
  const keys = Object.keys(days);
  const wd = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  const daysHtml = keys.map(k => {
    const d = days[k].daily || {};
    const dt = new Date(k + 'T12:00:00');
    const info = wmoInfo(d.code ?? 0);
    const pop = Math.round(d.popmax ?? 0);
    return `<button class="w-day ${k === state.date ? 'on' : ''}" data-date="${k}">
      <div class="dow">${wd[dt.getDay()]}</div>
      <div class="date">${dt.getMonth() + 1}/${dt.getDate()}</div>
      <div class="ico">${info[1]}</div>
      <div class="tmp">${Math.round(d.tmax ?? 0)}°<small> / ${Math.round(d.tmin ?? 0)}°</small></div>
      <div class="pop ${pop >= 50 ? 'hi' : ''}">💧${pop}%</div>
    </button>`;
  }).join('');

  const w = weatherSlice(days, state.date, win());
  let advice = '', cls = '';
  if (w) {
    if (w.severe) { cls = 'bad'; advice = `⚠️ ${dateLabel(state.date)} ${win().desc} 天气较差（${w.info[0]}，体感 ${w.feels}℃${w.windy ? `，风速 ${w.wind}km/h` : ''}），已自动过滤纯户外活动。`; }
    else if (w.wet) { cls = 'warn'; advice = `🌧️ 该时段降水概率 ${w.pop}%，推荐已优先安排室内/半室内活动。`; }
    else if (w.hot) { cls = 'warn'; advice = `🔥 体感温度 ${w.feels}℃，建议避开正午户外，优先有遮阴或空调的场景。`; }
    else { cls = 'ok'; advice = `✅ ${w.info[1]} ${w.info[0]}，${w.temp}℃，风速 ${w.wind}km/h${w.uv >= 7 ? `，紫外线较强(${w.uv})` : ''}——适合出门，户外优先。`; }
  }

  $('#weatherBar').innerHTML = `
    <div class="w-top">
      <div class="w-city">📡 ${city().name} · 未来 7 天
        <span class="w-mode ${mode === 'demo' ? 'demo' : ''}">
          ${mode === 'live' ? 'Open-Meteo 实时' : '演示模式（天气接口不可用）'}
        </span>
      </div>
      <div class="w-city" style="font-weight:600;color:var(--ink-3);font-size:12.5px">
        点选日期切换方案 · 当前：${dateLabel(state.date)} ${win().desc}
      </div>
    </div>
    <div class="w-days">${daysHtml}</div>
    ${advice ? `<div class="w-advice ${cls}"><span>${advice}</span></div>` : ''}
    ${mode === 'demo' ? `<div class="w-advice warn" style="margin-top:8px"><span>天气接口暂时不可用（${esc(reason || '网络异常')}），当前使用基于城市气候特征的演示数据，产品逻辑完全一致。</span></div>` : ''}
  `;
}

/* ============================ 偏好面板 ============================ */
function renderPrefs() {
  $('#timeRow').innerHTML = TIME_WINDOWS.map(w =>
    `<button class="chip ${w.id === state.windowId ? 'on' : ''}" data-window="${w.id}">
      ${w.label}<i>${w.desc}</i></button>`).join('');

  $('#vibeRow').innerHTML = VIBES.map(v =>
    `<button class="chip ${state.vibes.includes(v.id) ? 'on' : ''}" data-vibe="${v.id}">
      ${v.icon} ${v.id}<i>${v.desc}</i></button>`).join('');

  $('#budgetRange').value = state.budget;
  $('#budgetVal').textContent = '¥' + state.budget;
  $('#distRange').value = state.maxDist;
  $('#distVal').textContent = state.maxDist + ' km';
  $('#partyVal').textContent = state.party + ' 人';
  $('#partyHint').textContent = partyHint(state.party);
}

function partyHint(n) {
  if (n <= 1) return '一个人也很好，很多点位单人更自在';
  if (n === 2) return '2 人 · 适合结伴但不挤，最省心的组合';
  if (n <= 4) return '小团体，周末出行的黄金人数';
  if (n <= 6) return '中型队伍，建议提前订位 / 预约';
  return '大团队，推荐避开室内小场景，优先户外与分组行动';
}

function renderPrefSummary() {
  const el = $('#prefSummary');
  if (!state.plans.length) { el.hidden = true; return; }
  const w = weatherSlice(state.weather.days, state.date, win());
  el.hidden = false;
  el.innerHTML = `
    <span class="ps-item">📅 <b>${dateLabel(state.date)}</b> ${win().desc}</span>
    <span class="ps-item">${w ? w.info[1] + ' <b>' + w.temp + '℃</b> ' + w.info[0] : '天气未知'}</span>
    <span class="ps-item">💰 人均 <b>¥${state.budget}</b></span>
    <span class="ps-item">👥 <b>${state.party} 人</b></span>
    <span class="ps-item">🚗 单程 <b>≤${state.maxDist}km</b></span>
    <span class="ps-item">🎐 ${state.vibes.length ? state.vibes.join(' · ') : '不限偏好'}</span>
    <button class="ps-item" id="editPref" style="cursor:pointer;color:var(--brand);font-weight:750">修改条件</button>`;
}

/* ============================ 生成方案 ============================ */
function generate() {
  if (!state.weather) return;

  const w = weatherSlice(state.weather.days, state.date, win());
  if (!w) { toast('该日期暂无数据，请换一天'); return; }

  const prefs = {
    cityId: state.cityId, window: win(), weather: w,
    vibes: state.vibes, budget: state.budget, party: state.party,
    maxDist: state.maxDist, avoid: state.avoid,
  };

  const res = recommend(prefs, 3);
  state.plans = res.picks;
  state.shownIds = res.picks.map(p => p.act.id);
  state.lastPrefs = prefs;

  $('#results').innerHTML = '';
  renderResults(res);

  setTimeout(() => $('#results').scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
}

function renderResults(res) {
  const wrap = $('#results');
  renderPrefSummary();

  if (!res.picks.length) {
    wrap.innerHTML = `
      <div class="empty">
        <div class="big">🤔</div>
        <b>${city().name}的 ${ACTIVITIES.filter(a => a.city === state.cityId).length} 个活动里，没有同时满足你当前条件的</b>
        <p>尝试放宽一下条件：提高预算、扩大通勤范围，或换一个时间窗。</p>
        <div class="row-actions" style="justify-content:center;margin-top:16px">
          <button class="primary-btn" id="relax">自动放宽条件重试</button>
        </div>
      </div>`;
    const rb = $('#relax');
    if (rb) rb.addEventListener('click', () => {
      state.budget = Math.min(800, state.budget + 200);
      state.maxDist = Math.min(120, state.maxDist + 40);
      renderPrefs(); generate();
    });
    $('#whyBox').hidden = true;
    return;
  }

  const stat = res.stats;
  wrap.innerHTML = `
    <div class="res-head">
      <h2>为你生成 ${res.picks.length} 个方案</h2>
      <div class="sub">
        从 ${city().name} 的 <b>${stat.total}</b> 个活动中筛出 <b>${stat.eligible}</b> 个可执行项${stat.filteredByWeather ? ` · 因天气剔除 <b>${stat.filteredByWeather}</b> 个户外项` : ''} · 按匹配度排序
      </div>
    </div>
    <div class="res-actions">
      <button class="ghost-btn" id="moreBtn">🔄 换一批</button>
      <button class="ghost-btn" id="goTeam">👥 组队出发</button>
    </div>
    <div class="plan-grid">${res.picks.map((p, i) => planCard(p, i)).join('')}</div>
  `;

  bindPlanActions();
  $('#moreBtn').addEventListener('click', () => {
    const more = morePicks(state.lastPrefs, state.shownIds, 3);
    if (!more.length) { toast('已经没有更多符合条件的活动了'); return; }
    state.plans = more;
    state.shownIds = [...state.shownIds, ...more.map(p => p.act.id)];
    $('#results').innerHTML = '';
    renderResults({ ...res, picks: more });
  });
  $('#goTeam').addEventListener('click', () => nav('team'));

  renderWhy(res);
}

function planCard(p, i) {
  const a = p.act;
  const cat = CATEGORIES[a.cat] || { icon: '📍', color: '#888' };
  const badge = ['🥇 首选', '🥈 备选一', '🥉 备选二'][i] || `方案 ${i + 1}`;
  const badgeCls = ['', 's2', 's3'][i] || '';
  const overBudget = p.totalCost > state.budget;

  const reasons = p.reasons.slice(0, 4).map(r => `<span class="tag ok">✓ ${esc(r)}</span>`).join('');
  const warns = p.warnings.slice(0, 3).map(r => `<span class="tag warn">⚠ ${esc(r)}</span>`).join('');

  return `
  <article class="plan" data-act="${a.id}">
    <div class="plan-top">
      <div class="plan-badge ${badgeCls}">${badge} · ${p.matchLevel}</div>
      <div class="plan-score"><b>${p.score}</b><i>匹配度</i></div>
      <h3 class="plan-title">${cat.icon} ${esc(a.name)}</h3>
      <div class="plan-meta">
        <span>📍 ${esc(a.venue)}（${esc(a.district)}）</span>
        <span>🎫 ${esc(a.booking)}</span>
        <span>⭐ ${a.rating}</span>
        <span>⏱️ ${a.dur}h</span>
        <span>🚗 ${a.dist}km</span>
      </div>
    </div>

    <div class="plan-why">${reasons}${warns}</div>

    <div class="timeline">
      ${p.timeline.map(t => `
        <div class="tl-item ${t.type}">
          <div class="tl-dot">${t.icon}</div>
          <div class="tl-body">
            <div class="tl-time">${t.time}</div>
            <div class="tl-title">${esc(t.title)}</div>
            <div class="tl-detail">${esc(t.detail)}</div>
          </div>
        </div>`).join('')}
    </div>

    <div class="plan-sec">
      <h4>💰 花费拆解（每人）</h4>
      ${p.costBreakdown.map(c => `
        <div class="cost-line"><span>${c.label}</span>
          <span><b>¥${c.value}</b> <span class="note">${esc(c.note)}</span></span></div>`).join('')}
      <div class="cost-total"><span>预计人均</span>
        <span class="amt ${overBudget ? 'over' : ''}">¥${p.totalCost}
          <span class="note" style="font-weight:500">${overBudget ? `超预算 ¥${p.totalCost - state.budget}` : `预算内（剩 ¥${state.budget - p.totalCost}）`}</span>
        </span></div>
    </div>

    <div class="plan-sec">
      <h4>✅ 出发前清单</h4>
      <ul class="check-list">
        ${p.checklist.map(c => `<li class="${c.critical ? 'critical' : ''}"><span class="box">${c.critical ? '!' : ''}</span><span>${esc(c.text)}</span></li>`).join('')}
      </ul>
    </div>

    ${p.alt ? `<div class="plan-sec"><div class="alt-box">🔁 <b>同一片区顺路可加：</b>${esc(p.alt.name)}（${CATEGORIES[p.alt.cat]?.icon || ''}${p.alt.cat} · 约 ${p.alt.dur}h · 人均 ¥${p.alt.cost[0]}-${p.alt.cost[1]}）—— 体力有余可直接延长，不必另外找地方。</div></div>` : ''}

    <div class="plan-sec" style="background:var(--bg-2);border-radius:0">
      <h4>📖 这个活动是什么</h4>
      <div style="font-size:13.5px;color:var(--ink-2)">${esc(a.desc)}</div>
    </div>

    <div class="plan-foot">
      <button class="mini-btn accent" data-copy="${a.id}">📋 复制招募文案</button>
      <button class="mini-btn" data-checkin="${a.id}">📌 我去了</button>
      <button class="mini-btn" data-guide="${a.id}">📝 看攻略</button>
      <button class="mini-btn" data-hide="${a.id}">🙅 不感兴趣</button>
    </div>
  </article>`;
}

function bindPlanActions() {
  $$('[data-copy]').forEach(b => b.addEventListener('click', () => {
    const p = state.plans.find(x => x.act.id === b.dataset.copy);
    if (p) copyText(p.recruit, '招募文案已复制，直接丢进群里吧');
  }));

  $$('[data-checkin]').forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.checkin;
    nav('checkin');
    setTimeout(() => {
      const sel = $('#ckAct'); if (sel) sel.value = id;
      $('#ckDate').value = state.date || todayLocal();
      $('#ckDate').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 120);
  }));

  $$('[data-guide]').forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.guide;
    nav('guide');
    setTimeout(() => {
      $$('.tab2').forEach(t => t.classList.toggle('on', t.dataset.city === state.cityId));
      renderGuides(CITIES[state.cityId] ? state.cityId : null);
      const el = $(`.guide[data-act="${id}"]`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      else toast('这个活动还没有攻略，你可以成为第一个分享的人');
    }, 120);
  }));

  $$('[data-hide]').forEach(b => b.addEventListener('click', () => {
    state.avoid.push(b.dataset.hide);
    toast('已排除，正在重新推荐');
    generate();
  }));
}

function renderWhy(res) {
  const box = $('#whyBox');
  box.hidden = false;
  const w = state.lastPrefs.weather;
  const catCount = {};
  res.pool.forEach(a => catCount[a.cat] = (catCount[a.cat] || 0) + 1);
  const topCats = Object.entries(catCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

  box.innerHTML = `
  <details open>
    <summary>💡 这些方案是怎么算出来的？（点开看推荐逻辑）</summary>
    <div class="why-body">
      <h4>① 先过滤掉"不能去"的</h4>
      <ul>
        <li>时长塞不进「${win().label} ${win().desc}」的活动（比如 9 小时的徒步放进 4 小时夜场）</li>
        <li>${w && (w.wet || w.severe) ? `<b>因天气被剔除的纯户外活动：${res.stats.filteredByWeather} 个</b>（降水概率 ${w.pop}%）` : '极端天气下的纯户外活动（当前天气好，未触发淘汰）'}</li>
        <li>最低人均花费超过你预算 1.5 倍的活动</li>
        <li>单程超过 ${state.maxDist}km 的活动</li>
      </ul>
      <p style="margin-top:8px">当前 ${city().name} 活动库共 ${res.stats.total} 个，通过硬约束的有 <b>${res.stats.eligible}</b> 个。</p>

      <h4>② 再按 9 个维度打分</h4>
      <ul>
        <li><b>偏好命中</b>（主权重）：${state.vibes.length ? state.vibes.join(' / ') : '未设置'}</li>
        <li><b>天气适配</b>：每个活动带"雨 / 热 / 冷 / 风"敏感度，当前 ${w ? `${w.info[0]}、${w.temp}℃、风速 ${w.wind}km/h、降水概率 ${w.pop}%` : '—'}</li>
        <li><b>预算契合</b>：人均 ¥${state.budget}</li>
        <li><b>人数契合</b>：${state.party} 人同行</li>
        <li><b>时间窗契合</b>、<b>通勤成本</b>、<b>口碑质量</b>、<b>体力匹配</b>、<b>稀缺性</b></li>
      </ul>

      <h4>③ 最后保证"三个方案性格不同"</h4>
      <p>用 MMR 多样性重排：标签重合度高、同类目、同商圈会被扣分，避免三个方案全是美术馆。当前活动库类目分布：${topCats.map(([k, v]) => `${k} ${v}`).join(' · ')}。</p>

      <h4>④ 所以你看到的每一个理由都能对上</h4>
      <p>绿标是加分项，黄标是风险提示——<b>推荐系统不该是黑箱，尤其是当它劝你别去某个地方的时候。</b></p>
    </div>
  </details>`;
}

/* ============================ 组队 ============================ */
function renderTeamPage() {
  const sel = $('#teamPlanSel');
  sel.innerHTML = state.plans.length
    ? state.plans.map(p => `<option value="${p.act.id}">${esc(p.act.name)} · ${p.timeline[2]?.time || ''}</option>`).join('')
    : ACTIVITIES.filter(a => a.city === state.cityId).map(a => `<option value="${a.id}">${esc(a.name)}</option>`).join('');
  renderTeamList();
}

function renderTeamList() {
  const teams = LS.get('teams', []);
  const el = $('#teamList');
  if (!teams.length) {
    el.innerHTML = `<div class="empty" style="padding:28px 10px"><div class="big">👥</div><b>还没有进行中的组队</b><p>在左边发起一个，把文案复制到群里</p></div>`;
    return;
  }
  el.innerHTML = teams.map(t => {
    const pct = Math.round((t.joined / t.size) * 100);
    return `<div class="team-row" data-tid="${t.id}">
      <div class="th"><b>${esc(t.actName)}</b>
        <span class="pill ${pct >= 100 ? 'done' : ''}">${t.joined}/${t.size} 人${pct >= 100 ? ' · 已成行' : ''}</span></div>
      <div class="tm">🕐 ${esc(t.time)} · 发起人：我 ${t.note ? '· ' + esc(t.note) : ''}</div>
      <div class="bar"><i style="width:${Math.min(100, pct)}%"></i></div>
      <div class="row-actions" style="margin-top:10px">
        <button class="mini-btn" data-join="${t.id}">＋1 我也去</button>
        <button class="mini-btn" data-share="${t.id}">📋 复制文案</button>
        <button class="mini-btn" data-del="${t.id}">删除</button>
      </div>
    </div>`;
  }).join('');

  $$('[data-join]').forEach(b => b.addEventListener('click', () => {
    const teams2 = LS.get('teams', []);
    const t = teams2.find(x => x.id === b.dataset.join);
    if (t && t.joined < t.size) { t.joined++; LS.set('teams', teams2); renderTeamList(); toast('已加入，还差 ' + (t.size - t.joined) + ' 人'); }
    else toast('人数已满');
  }));
  $$('[data-del]').forEach(b => b.addEventListener('click', () => {
    LS.set('teams', LS.get('teams', []).filter(x => x.id !== b.dataset.del));
    renderTeamList(); toast('已删除');
  }));
  $$('[data-share]').forEach(b => b.addEventListener('click', () => {
    const t = LS.get('teams', []).find(x => x.id === b.dataset.share);
    if (t) copyText(t.text, '招募文案已复制');
  }));
}

function createTeam() {
  const actId = $('#teamPlanSel').value;
  const a = ACTIVITIES.find(x => x.id === actId);
  if (!a) return;
  const size = Math.max(2, parseInt($('#teamSize').value, 10) || 4);
  const time = $('#teamTime').value.trim() || '周六 10:00';
  const note = $('#teamNote').value.trim();

  const w = state.weather ? weatherSlice(state.weather.days, state.date, win()) : null;
  const text = `【周末组队 · ${city().name}】
🎯 ${a.name}
📍 ${a.venue}（${a.district}）
🕐 ${time} 集合 · 预计 ${a.dur}h
💰 人均约 ¥${Math.round((a.cost[0] + a.cost[1]) / 2)}
🚇 ${a.transit}
${w ? `🌤️ 天气：${w.info[1]} ${w.info[0]}，${w.temp}℃${w.pop >= 30 ? `，降水概率 ${w.pop}%（记得带伞）` : ''}` : ''}
👥 目标 ${size} 人，已有 1 人
${note ? `📝 ${note}` : ''}
—— 用「周末去哪儿」生成`;

  const teams = LS.get('teams', []);
  teams.unshift({ id: 't' + Date.now(), actId: a.id, actName: a.name, size, joined: 1, time, note, text });
  LS.set('teams', teams);

  $('#teamShareCard').hidden = false;
  $('#teamShareText').textContent = text;
  copyText(text, '招募文案已复制，粘贴到群里就行');
  renderTeamList();

  $('#copyTeamAgain').onclick = () => copyText(text, '已复制');
  $('#downloadTeamCard').onclick = () => downloadCard(a, time, size, w, note);
}

/* 用 Canvas 画一张可发群的招募卡（不依赖任何库/网络） */
function downloadCard(a, time, size, w, note) {
  const W = 760, H = 460, dpr = 2;
  const cv = document.createElement('canvas');
  cv.width = W * dpr; cv.height = H * dpr;
  const g = cv.getContext('2d');
  g.scale(dpr, dpr);

  const grad = g.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, '#FF7A57'); grad.addColorStop(1, '#E8502C');
  g.fillStyle = grad; g.fillRect(0, 0, W, H);

  g.fillStyle = 'rgba(255,255,255,.94)';
  roundRect(g, 34, 34, W - 68, H - 68, 26); g.fill();

  g.fillStyle = '#E8502C'; g.font = '700 15px sans-serif';
  g.fillText('周末去哪儿 · 组队招募', 68, 84);
  g.fillStyle = '#918879'; g.font = '500 13px sans-serif';
  g.fillText(city().name + ' · ' + dateLabel(state.date), 68, 106);

  g.fillStyle = '#1F1B18'; g.font = '800 30px sans-serif';
  wrapText(g, a.name, 68, 156, W - 160, 38);

  g.fillStyle = '#5C534B'; g.font = '500 17px sans-serif';
  const lines = [
    `📍 ${a.venue}（${a.district}）`,
    `🕐 ${time} 集合 · 预计 ${a.dur}h`,
    `💰 人均约 ¥${Math.round((a.cost[0] + a.cost[1]) / 2)}`,
    `🚇 ${a.transit}`,
    w ? `🌤️ ${w.info[0]} ${w.temp}℃ · 降水概率 ${w.pop}%` : '',
  ].filter(Boolean);
  lines.forEach((l, i) => g.fillText(l, 68, 200 + i * 30));

  g.fillStyle = '#FF6B4A'; g.font = '800 20px sans-serif';
  g.fillText(`👥 目标 ${size} 人，已有 1 人`, 68, 200 + lines.length * 30 + 16);
  if (note) { g.fillStyle = '#918879'; g.font = '500 14px sans-serif'; g.fillText('📝 ' + note, 68, 200 + lines.length * 30 + 44); }

  g.fillStyle = '#DED4C7'; roundRect(g, 68, H - 96, W - 136, 1.5, 1); g.fill();
  g.fillStyle = '#918879'; g.font = '500 13px sans-serif';
  g.fillText('长按保存 / 转发到群，一起出发 →', 68, H - 62);

  cv.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `周末组队-${a.name.slice(0, 12)}.png`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    toast('招募卡已下载');
  }, 'image/png');
}

function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r); g.closePath();
}
function wrapText(g, text, x, y, maxW, lh) {
  let line = '', yy = y;
  for (const ch of text) {
    if (g.measureText(line + ch).width > maxW) { g.fillText(line, x, yy); line = ch; yy += lh; }
    else line += ch;
  }
  g.fillText(line, x, yy);
}

/* ============================ 打卡 ============================ */
let ckStars = 5;

function fillCheckinSelect() {
  const sel = $('#ckAct');
  if (!sel) return;
  sel.innerHTML = ACTIVITIES.filter(a => a.city === state.cityId)
    .map(a => `<option value="${a.id}">${esc(a.name)}</option>`).join('');
}

function renderCheckin() {
  fillCheckinSelect();
  if (!$('#ckDate').value) $('#ckDate').value = todayLocal();

  $('#ckStars').innerHTML = [1, 2, 3, 4, 5].map(n =>
    `<button class="star ${n <= ckStars ? 'on' : ''}" data-star="${n}">★</button>`).join('');
  $$('[data-star]').forEach(b => b.addEventListener('click', () => { ckStars = +b.dataset.star; renderCheckin(); }));

  const list = LS.get('checkins', []);
  const totalCost = list.reduce((a, b) => a + (b.cost || 0), 0);
  const totalHours = list.reduce((a, b) => a + (b.dur || 0), 0);
  const avgStar = list.length ? (list.reduce((a, b) => a + b.star, 0) / list.length).toFixed(1) : '—';
  const districts = new Set(list.map(c => c.district)).size;

  $('#ckStats').innerHTML = `
    <div class="stat"><b>${list.length}</b><span>累计探索次数</span></div>
    <div class="stat"><b>${districts}</b><span>解锁片区</span></div>
    <div class="stat"><b>${totalHours.toFixed(1)}</b><span>累计探索小时</span></div>
    <div class="stat"><b>¥${totalCost}</b><span>累计花费</span></div>
    <div class="stat"><b>${avgStar}</b><span>平均评分</span></div>
  `;

  $('#ckList').innerHTML = list.length ? list.map(c => {
    const a = ACTIVITIES.find(x => x.id === c.actId) || {};
    return `<div class="ck-row">
      <div class="em">${CATEGORIES[a.cat]?.icon || '📍'}</div>
      <div class="cb">
        <div class="ct">${esc(a.name || c.actName || '已删除的活动')}</div>
        <div class="cm">${c.date} · ${esc(a.district || '')} · 实花 ¥${c.cost} · ${c.dur}h · ${'★'.repeat(c.star)}</div>
        ${c.note ? `<div class="cn">"${esc(c.note)}"</div>` : ''}
      </div>
      <button class="ck-del" data-del-ck="${c.id}">✕</button>
    </div>`;
  }).join('') : `<div class="empty" style="padding:28px 10px"><div class="big">📌</div><b>还没有打卡记录</b><p>去过的地方记一笔，下次推荐会更准</p></div>`;

  $$('[data-del-ck]').forEach(b => b.addEventListener('click', () => {
    LS.set('checkins', LS.get('checkins', []).filter(x => String(x.id) !== b.dataset.delCk));
    renderCheckin(); toast('已删除');
  }));
}

function addCheckin() {
  const actId = $('#ckAct').value;
  const a = ACTIVITIES.find(x => x.id === actId);
  if (!a) return;
  const list = LS.get('checkins', []);
  list.unshift({
    id: Date.now(), actId, actName: a.name, district: a.district,
    date: $('#ckDate').value || todayLocal(),
    cost: Math.max(0, +$('#ckCost').value || 0),
    dur: Math.max(0.5, +$('#ckDur').value || 3),
    star: ckStars, note: $('#ckNote').value.trim(),
  });
  LS.set('checkins', list);
  $('#ckNote').value = '';
  renderCheckin();
  toast('打卡成功！已计入你的城市足迹');
}

/* ============================ 攻略 ============================ */
function renderGuides(filterCity) {
  const fc = filterCity || null;
  const tabs = [['all', '全部'], ...Object.entries(CITIES).map(([id, c]) => [id, c.name])];
  $('#guideTabs').innerHTML = tabs.map(([id, name]) => {
    const on = fc ? fc === id : id === 'all';
    return `<button class="tab2 ${on ? 'on' : ''}" data-city="${id}">${name}</button>`;
  }).join('');

  $$('.tab2').forEach(b => b.addEventListener('click', () => {
    renderGuides(b.dataset.city === 'all' ? null : b.dataset.city);
  }));

  const liked = LS.get('liked', []), saved = LS.get('saved', []);
  let list = GUIDE_SEED;
  if (fc) list = list.filter(g => g.city === fc);

  $('#guideList').innerHTML = list.length ? list.map(g => {
    const a = ACTIVITIES.find(x => x.id === g.actId) || {};
    return `<article class="guide" data-act="${g.actId}">
      <div class="guide-h">
        <div class="avatar">${g.avatar}</div>
        <div><div class="who">${esc(g.author)}</div><div class="when">${g.when} · ${CITIES[g.city]?.name || ''}</div></div>
      </div>
      <h4>${esc(g.title)}</h4>
      <div class="g-body">
        ${g.body.map(p => `<p>${md(esc(p))}</p>`).join('')}
        <div class="kv">${g.kv.map(([k, v]) => `<div><b>${esc(k)}：</b>${esc(v)}</div>`).join('')}</div>
        <p style="color:var(--brand-d);font-weight:650">📌 结论：${esc(g.verdict)}</p>
      </div>
      <div class="guide-f">
        <button data-like="${g.id}" class="${liked.includes(g.id) ? 'on' : ''}">👍 有用 ${g.likes + (liked.includes(g.id) ? 1 : 0)}</button>
        <button data-save="${g.id}" class="${saved.includes(g.id) ? 'on' : ''}">🔖 收藏 ${g.saves + (saved.includes(g.id) ? 1 : 0)}</button>
        <span style="margin-left:auto">${a.name ? esc(a.name.slice(0, 14)) + (a.name.length > 14 ? '…' : '') : ''}</span>
      </div>
    </article>`;
  }).join('') : `<div class="empty" style="grid-column:1/-1"><div class="big">📝</div><b>这个城市还没有攻略</b><p>切换城市看看，或成为第一个分享的人</p></div>`;

  $$('[data-like]').forEach(b => b.addEventListener('click', () => {
    const l = LS.get('liked', []);
    const i = l.indexOf(b.dataset.like);
    if (i >= 0) l.splice(i, 1); else l.push(b.dataset.like);
    LS.set('liked', l); renderGuides(fc);
  }));
  $$('[data-save]').forEach(b => b.addEventListener('click', () => {
    const s = LS.get('saved', []);
    const i = s.indexOf(b.dataset.save);
    if (i >= 0) s.splice(i, 1); else s.push(b.dataset.save);
    LS.set('saved', s); renderGuides(fc);
  }));
}

/* ============================ 初始化 ============================ */
function bindGlobal() {
  document.addEventListener('click', (e) => {
    const navEl = e.target.closest('[data-nav]');
    if (navEl) { e.preventDefault(); nav(navEl.dataset.nav); }
  });

  $('#cityBtn').addEventListener('click', () => {
    const s = $('#citySheet');
    s.hidden = !s.hidden;
  });

  $('#cityGrid').addEventListener('click', (e) => {
    const b = e.target.closest('[data-city]');
    if (b) switchCity(b.dataset.city);
  });

  $('#aboutBtn').addEventListener('click', () => nav('about'));

  $('#timeRow').addEventListener('click', (e) => {
    const b = e.target.closest('[data-window]');
    if (!b) return;
    state.windowId = b.dataset.window;
    renderPrefs();
    renderWeatherBar();
    if (state.plans.length) generate();
  });

  $('#vibeRow').addEventListener('click', (e) => {
    const b = e.target.closest('[data-vibe]');
    if (!b) return;
    const v = b.dataset.vibe, i = state.vibes.indexOf(v);
    if (i >= 0) state.vibes.splice(i, 1); else state.vibes.push(v);
    LS.set('vibes', state.vibes);
    renderPrefs();
  });

  $('#budgetRange').addEventListener('input', (e) => {
    state.budget = +e.target.value; LS.set('budget', state.budget);
    $('#budgetVal').textContent = '¥' + state.budget;
  });
  $('#distRange').addEventListener('input', (e) => {
    state.maxDist = +e.target.value; LS.set('dist', state.maxDist);
    $('#distVal').textContent = state.maxDist + ' km';
  });

  $$('[data-party]').forEach(b => b.addEventListener('click', () => {
    state.party = Math.max(1, Math.min(20, state.party + (+b.dataset.party)));
    LS.set('party', state.party);
    $('#partyVal').textContent = state.party + ' 人';
    $('#partyHint').textContent = partyHint(state.party);
  }));

  $('#genBtn').addEventListener('click', generate);

  $('#resetBtn').addEventListener('click', () => {
    state.vibes = []; state.budget = 200; state.party = 2; state.maxDist = 60;
    state.windowId = 'afternoon'; state.avoid = [];
    LS.set('vibes', []); LS.set('budget', 200); LS.set('party', 2); LS.set('dist', 60);
    renderPrefs();
    toast('已重置条件');
  });

  $('#togglePref').addEventListener('click', () => {
    const body = $('#prefBody');
    body.hidden = !body.hidden;
    $('#togglePref').textContent = body.hidden ? '展开' : '收起';
  });

  $('#weatherBar').addEventListener('click', (e) => {
    const b = e.target.closest('[data-date]');
    if (!b) return;
    state.date = b.dataset.date;
    renderWeatherBar();
    if (state.plans.length) generate();
  });

  document.addEventListener('click', (e) => {
    if (e.target.id === 'editPref') {
      $('#prefBody').hidden = false;
      $('#togglePref').textContent = '收起';
      $('#prefPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  $('#createTeam').addEventListener('click', createTeam);
  $('#addCheckin').addEventListener('click', addCheckin);

  $('#heroGen').addEventListener('click', generate);
  $('#heroDemo').addEventListener('click', () => {
    // 一键演示：把偏好面板展开并滚动过去，让用户看到"输入 → 输出"的完整链路
    $('#prefBody').hidden = false;
    $('#togglePref').textContent = '收起';
    $('#prefPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(generate, 420);
  });
}

function init() {
  $('#aboutBody').innerHTML = ABOUT;
  bindGlobal();
  renderCityGrid();
  renderPrefs();
  fillCheckinSelect();
  renderCheckin();
  renderGuides();
  loadWeather();
}

init();
