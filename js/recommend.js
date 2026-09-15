/* =========================================================================
 *  推荐引擎
 *  ---------------------------------------------------------------------
 *  设计目标不是"算出一个最优解"，而是解决真实痛点：
 *   1) 信息分散  → 聚合 + 按时间窗裁剪，输出「可执行的一天」而非一堆链接
 *   2) 受天气影响大 → 天气作为硬约束参与打分，恶劣天气直接淘汰户外项
 *   3) 受预算约束  → 先按人均预算过滤，再按"性价比"加权
 *   4) 受同行人数影响 → 用 party 区间过滤，并标注是否适合组队
 *   5) 选择困难   → 软最大化采样，每次给你 3 个不同性格的方案，而不是唯一答案
 * ========================================================================= */

import { ACTIVITIES, FOOD_SPOTS } from './data.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ---------------------------------------------------------------------
 *  单条活动的打分
 *  @returns {{score:number, reasons:string[], warnings:string[], blocked:boolean}}
 * ------------------------------------------------------------------- */
export function scoreActivity(act, prefs) {
  const { vibes = [], budget = 200, party = 2, window, weather, maxDist = 120, avoid = [] } = prefs;
  const reasons = [], warnings = [];
  let score = 30;

  /* ---- 0. 硬性淘汰：不满足的条件直接出局，而不是扣分了事 ---- */
  if (!window) return { score: 0, reasons, warnings: ['时间窗缺失'], blocked: true };
  if (avoid.includes(act.id)) return { score: 0, reasons, warnings: ['你已排除该活动'], blocked: true };

  if (weather) {
    if (act.env === 'out' && weather.severe) {
      return { score: 0, reasons, warnings: ['极端天气，户外活动安全风险高'], blocked: true };
    }
    if (act.env === 'out' && weather.pop >= 75) {
      return { score: 0, reasons, warnings: [`降水概率 ${weather.pop}%，户外体验基本报废`], blocked: true };
    }
  }

  if (act.dur > window.hours + 1.5) {
    return { score: 0, reasons, warnings: [`需 ${act.dur}h，超出「${window.label}」可用时间`], blocked: true };
  }
  if (act.dist > maxDist) {
    return { score: 0, reasons, warnings: [`单程约 ${act.dist}km，超出可接受通勤范围`], blocked: true };
  }

  /* ---- 1. 偏好匹配（核心权重） ---- */
  const hit = act.tags.filter(t => vibes.includes(t));
  const miss = vibes.filter(t => !act.tags.includes(t));
  score += hit.length * 9;
  score -= miss.length * 3;
  if (hit.length) reasons.push(`命中你的偏好：${hit.join(' / ')}`);
  if (vibes.length && hit.length === 0) warnings.push('与你的偏好几乎没有交集');

  /* ---- 2. 天气适配 ---- */
  if (weather) {
    const w = act.weather;
    // 用活动自带的天气敏感度模型打分
    if (weather.wet) {
      score += (w.rain ?? 0) * 10;
      if ((w.rain ?? 0) > 0.4) reasons.push(`降水概率 ${weather.pop}%，该活动室内/半室内，不受影响`);
      else if ((w.rain ?? 0) < 0) warnings.push(`降水概率 ${weather.pop}%，户外体验会明显打折`);
    }
    if (weather.hot) {
      score += (w.hot ?? 0) * 8;
      if ((w.hot ?? 0) > 0.4) reasons.push(`体感 ${weather.feels}℃，室内有空调更舒服`);
      else if ((w.hot ?? 0) < -0.4) warnings.push(`体感 ${weather.feels}℃，正午高温时段需谨慎`);
    }
    if (weather.cold) {
      score += (w.cold ?? 0) * 7;
      if ((w.cold ?? 0) < -0.2) warnings.push(`气温较低（${weather.temp}℃），注意保暖`);
    }
    if (weather.windy) {
      score += (w.wind ?? 0) * 8;
      if ((w.wind ?? 0) < -0.4) warnings.push(`平均风速 ${weather.wind}km/h，户外观感会偏差`);
    }
    // 好天气奖励出门（避免推荐引擎在晴天把人塞进室内）
    if (!weather.wet && !weather.hot && !weather.cold && act.env === 'out') {
      score += 7; reasons.push('天气条件好，适合出门');
    } else if (!weather.wet && !weather.hot && !weather.cold && act.env === 'semi') {
      score += 4;
    }
    // 紫外线
    if (act.env === 'out' && weather.uv >= 8) {
      score -= 4; warnings.push(`紫外线指数 ${weather.uv}，务必防晒`);
    }
  }

  /* ---- 3. 预算匹配 ---- */
  const cLow = act.cost[0], cHigh = act.cost[1];
  const cMid = (cLow + cHigh) / 2;
  if (cLow > budget) {
    // 超预算：轻微超出可以提醒，超出 50% 直接淘汰
    if (cLow > budget * 1.5) return { score: 0, reasons, warnings: [`最低人均 ¥${cLow}，超出预算 ¥${budget}`], blocked: true };
    score -= 12; warnings.push(`人均约 ¥${cLow}-${cHigh}，略超你的 ¥${budget} 预算`);
  } else if (cHigh <= budget) {
    score += 8;
    if (cLow === 0) reasons.push('完全免费，预算压力为零');
    else reasons.push(`人均 ¥${cLow}-${cHigh}，完全在 ¥${budget} 预算内${budget - cMid > 50 ? `，还能省下约 ¥${Math.round(budget - cMid)}` : ''}`);
  } else if (cMid <= budget) {
    score += 4;
    reasons.push(`人均 ¥${cLow}-${cHigh}，中位数花费在预算内（上限档位略超）`);
  } else if (cLow <= budget) {
    // 最低档位仍在预算内 → 可去，但要说清楚怎么省
    score += 1;
    warnings.push(`人均 ¥${cLow}-${cHigh}，选最低档位能卡进 ¥${budget} 预算`);
  } else {
    score -= 6;
    warnings.push(`人均约 ¥${Math.round(cMid)}，超出你的 ¥${budget} 预算`);
  }

  /* ---- 4. 同行人数适配 ---- */
  const [pMin, pMax] = act.party;
  if (party < pMin) { score -= 7; warnings.push(`更适合 ${pMin} 人以上同行`); }
  else if (party > pMax) { score -= 11; warnings.push(`${party} 人偏多，该场景更适合 ${pMin}-${pMax} 人`); }
  else {
    score += 7;
    if (party >= 3) reasons.push(`${party} 人同行正合适${pMin <= 2 && pMax >= 6 ? '，可分组也能一起' : ''}`);
  }

  /* ---- 5. 时间窗契合度 ---- */
  const gap = window.hours - act.dur;
  if (gap >= -0.5 && gap <= 2.5) { score += 7; reasons.push(`耗时 ${act.dur}h，与「${window.label}」${window.desc} 刚好匹配`); }
  else if (gap > 2.5) { score += 2; }
  else { score -= 4; warnings.push('时间安排会比较紧张'); }

  /* ---- 6. 通勤成本 ---- */
  score -= clamp(act.dist / 14, 0, 8);
  if (act.dist <= 15) reasons.push(`单程约 ${act.dist}km，通勤成本低`);

  /* ---- 7. 质量与稀缺性 ---- */
  score += (act.rating - 4.4) * 15;
  if (act.rating >= 4.6) reasons.push(`口碑 ${act.rating} 分，属于该城第一梯队`);

  /* ---- 8. 体力匹配 ---- */
  const wantActive = vibes.includes('运动');
  const wantChill = vibes.includes('安静');
  if (wantActive && act.exertion >= 4) { score += 8; reasons.push(`体力消耗 ${act.exertion}/5，运动量充足`); }
  if (wantChill && act.exertion <= 1) { score += 6; }
  if (wantChill && act.exertion >= 4) { score -= 12; warnings.push('体力消耗较大，和你想要的慢节奏不太一致'); }
  if (!wantActive && act.exertion >= 5) { score -= 8; warnings.push('全程体力消耗很高，需评估同行人能否承受'); }

  /* ---- 9. 小众偏好 ---- */
  if (vibes.includes('小众') && act.tags.includes('小众')) { score += 6; reasons.push('相对小众，周末不易人挤人'); }
  if (vibes.includes('热闹') && act.tags.includes('热闹')) { score += 5; }

  return { score: clamp(score, 0, 100), reasons, warnings, blocked: false };
}

/* ---------------------------------------------------------------------
 *  软最大化采样：把分数转成概率，随机抽一个
 *  目的：同样条件的两次点击不会给出完全一样的结果，缓解"选择困难"却不失相关性
 * ------------------------------------------------------------------- */
function softmaxPick(items, temperature = 0.16) {
  if (!items.length) return null;
  const maxS = Math.max(...items.map(i => i.score));
  const exps = items.map(i => Math.exp((i.score - maxS) / (temperature * 100)));
  const sum = exps.reduce((a, b) => a + b, 0);
  let r = Math.random() * sum;
  for (let i = 0; i < items.length; i++) { r -= exps[i]; if (r <= 0) return items[i]; }
  return items[items.length - 1];
}

/* ---------------------------------------------------------------------
 *  MMR：选出的 3 个方案要"性格不同"，避免全是美术馆
 * ------------------------------------------------------------------- */
function diversify(ranked, k) {
  const picked = [];
  const pool = [...ranked];
  while (picked.length < k && pool.length) {
    let best = null, bestVal = -Infinity;
    for (const cand of pool) {
      const sim = picked.length
        ? Math.max(...picked.map(p => similarity(p.act, cand.act)))
        : 0;
      const val = cand.score * 0.72 - sim * 48;
      if (val > bestVal) { bestVal = val; best = cand; }
    }
    picked.push(best);
    pool.splice(pool.indexOf(best), 1);
  }
  return picked;
}

function similarity(a, b) {
  const ta = new Set(a.tags), tb = new Set(b.tags);
  const inter = [...ta].filter(t => tb.has(t)).length;
  const union = new Set([...ta, ...tb]).size || 1;
  let s = inter / union;                       // Jaccard
  if (a.cat === b.cat) s += 0.45;              // 同类目惩罚
  if (a.env === b.env) s += 0.1;
  if (a.district === b.district) s += 0.15;
  return Math.min(1.4, s);
}

/* ---------------------------------------------------------------------
 *  主入口：生成 3 个「周末方案」
 * ------------------------------------------------------------------- */
export function recommend(prefs, count = 3) {
  const pool = ACTIVITIES.filter(a => a.city === prefs.cityId);

  const scored = pool
    .map(act => ({ act, ...scoreActivity(act, prefs) }))
    .filter(x => !x.blocked && x.score > 0)
    .sort((a, b) => b.score - a.score);

  if (!scored.length) return { picks: [], pool, blocked: pool.length };

  // 先取头部候选池（保底相关），再在池内做多样化选择
  const head = scored.slice(0, Math.max(count * 4, 12));
  const picks = diversify(head, Math.min(count, head.length));

  // 给每个方案配一个"顺手加餐"（同区餐饮）与备选
  return {
    picks: picks.map(p => buildPlan(p, scored, prefs)),
    pool, blocked: 0,
    stats: {
      total: pool.length,
      eligible: scored.length,
      filteredByWeather: pool.filter(a => a.env === 'out' && prefs.weather?.wet).length,
      avgScore: Math.round(scored.reduce((a, b) => a + b.score, 0) / scored.length),
    },
  };
}

/* ---------------------------------------------------------------------
 *  把一条活动升级成「可执行的半天/一天方案」
 * ------------------------------------------------------------------- */
function buildPlan(pick, ranked, prefs) {
  const { act, score, reasons, warnings } = pick;
  const { budget = 200, party = 2, window, weather } = prefs;

  /* --- 加餐：同区优先，其次同城随机 --- */
  const sameDistrict = FOOD_SPOTS.filter(f => f.city === act.city && f.district === act.district);
  const others = FOOD_SPOTS.filter(f => f.city === act.city && f.district !== act.district);
  const food = sameDistrict[0] || others[(act.name.length + act.id.length) % others.length] || null;

  /* --- 时间轴 --- */
  const timeline = [];
  const transitMin = Math.round(act.dist * 1.6) + 10;   // 粗估：市区约 1.6 min/km
  const leaveH = window.start - Math.max(0.5, transitMin / 60);
  timeline.push({
    time: fmtTime(leaveH),
    title: '出发',
    detail: `${transitMin} 分钟车程 · ${act.transit}${act.dist > 30 ? '（距离较远，建议提前确认末班车）' : ''}`,
    icon: '🚇', type: 'transit',
  });
  timeline.push({
    time: fmtTime(window.start), title: `抵达 ${act.venue}`,
    detail: act.booking === '免预约' ? '无需预约，直接进' : `预约方式：${act.booking}`,
    icon: '📍', type: 'arrive',
  });
  timeline.push({
    time: fmtTime(window.start + 0.4), title: '主线体验',
    detail: `${act.name} · 建议 ${act.dur}h`,
    icon: '⭐', type: 'main',
  });
  if (food) {
    const foodAt = Math.min(window.start + act.dur + 0.2, window.start + window.hours - 0.8);
    timeline.push({
      time: fmtTime(foodAt), title: '补给 / 吃饭',
      detail: `${food.name} · 人均约 ¥${food.cost} · ${food.type}`,
      icon: '🍜', type: 'food',
    });
  }
  timeline.push({
    time: fmtTime(Math.min(window.start + act.dur + 1.6, window.start + window.hours + 0.6)),
    title: '返程 / 自由活动',
    detail: '体力有余可顺路加一个周边点位，或直接收工',
    icon: '🏁', type: 'end',
  });

  /* --- 花费拆解 --- */
  const actAvg = Math.round((act.cost[0] + act.cost[1]) / 2);
  const foodCost = food ? food.cost : 0;
  const transitCost = Math.round(act.dist * 0.9) * 2;
  const totalCost = actAvg + foodCost + transitCost;
  const costBreakdown = [
    { label: '活动门票/消费', value: actAvg, note: `¥${act.cost[0]}-${act.cost[1]}` },
    { label: '餐饮', value: foodCost, note: food ? food.name : '未匹配' },
    { label: '往返交通（估算）', value: transitCost, note: `${act.transit}` },
  ];

  /* --- 出发前清单（随天气变化） --- */
  const checklist = [];
  if (act.booking !== '免预约') checklist.push({ text: `${act.booking}（提前 1-3 天，周末名额紧张）`, critical: true });
  else checklist.push({ text: '免预约，但仍建议出发前在公众号确认当日开放', critical: false });
  if (weather) {
    if (weather.pop >= 30) checklist.push({ text: `带伞（降水概率 ${weather.pop}%）`, critical: weather.pop >= 50 });
    if (weather.hot) checklist.push({ text: `防晒 + 至少 1L 水（体感 ${weather.feels}℃）`, critical: true });
    if (weather.cold) checklist.push({ text: `加件外套（${weather.temp}℃，体感 ${weather.feels}℃）`, critical: true });
    if (weather.uv >= 7) checklist.push({ text: `防晒霜 SPF50+（紫外线 ${weather.uv}）`, critical: false });
    if (weather.windy) checklist.push({ text: `防风外套（平均风速 ${weather.wind}km/h）`, critical: false });
  }
  if (act.exertion >= 4) {
    checklist.push({ text: '运动鞋 + 换洗衣物 + 充电宝', critical: true });
    checklist.push({ text: '户外路线请结伴，告知同行人返程时间', critical: true });
  }
  if (party >= 4) checklist.push({ text: `${party} 人同行建议先建群对时间，并预约/订位`, critical: true });

  /* --- 顺路加餐：优先同片区，其次同城的不同场景类型 --- */
  const sameCity = ranked.filter(r => r.act.id !== act.id && r.act.city === act.city);
  const alt = sameCity.find(r => r.act.district === act.district)
    || sameCity.find(r => r.act.env !== act.env)
    || sameCity[0];

  /* --- 组队：生成一个可直接分享的招募文案 --- */
  const budgetTip = totalCost <= budget
    ? `预计人均 ¥${totalCost}，在你 ¥${budget} 的预算内`
    : `预计人均 ¥${totalCost}，比 ¥${budget} 预算高约 ¥${totalCost - budget}，可考虑砍掉餐饮`;

  return {
    act, score: Math.round(score), reasons, warnings,
    timeline, costBreakdown, totalCost, costAvg: actAvg, food,
    checklist, alt: alt ? alt.act : null,
    weather, budgetTip,
    recruit: buildRecruitText(act, prefs, totalCost, timeline),
    matchLevel: score >= 78 ? '强推' : score >= 62 ? '值得考虑' : '作为备选',
  };
}

function buildRecruitText(act, prefs, totalCost, timeline) {
  const w = prefs.weather;
  const wLine = w ? `${w.info[1]} ${w.info[0]}，${w.temp}℃` : '';
  return `【周末组队】${act.name}
📍 ${act.venue}（${act.district}）
🕐 ${timeline[2]?.time || ''} 集合 · 预计 ${act.dur}h
💰 人均约 ¥${totalCost}
${wLine ? '🌤️ ' + wLine : ''}
👥 已有 1 人，还差 ${Math.max(1, prefs.party - 1)} 人
${act.desc.slice(0, 60)}…`;
}

function fmtTime(h) {
  const hh = Math.floor(((h % 24) + 24) % 24);
  const mm = Math.round((h - Math.floor(h)) * 60 / 15) * 15;
  const m = mm === 60 ? 0 : mm;
  const hFinal = mm === 60 ? (hh + 1) % 24 : hh;
  return `${String(hFinal).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/* ---------------------------------------------------------------------
 *  「换一个」：在候选池里排除已展示的，再抽一批
 * ------------------------------------------------------------------- */
export function morePicks(prefs, excludeIds, count = 1) {
  const pool = ACTIVITIES.filter(a => a.city === prefs.cityId && !excludeIds.includes(a.id));
  const scored = pool
    .map(act => ({ act, ...scoreActivity(act, prefs) }))
    .filter(x => !x.blocked && x.score > 0)
    .sort((a, b) => b.score - a.score);
  if (!scored.length) return [];
  const head = scored.slice(0, Math.max(count * 4, 8));
  return diversify(head, Math.min(count, head.length)).map(p => buildPlan(p, scored, prefs));
}
