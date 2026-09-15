/* =========================================================================
 *  周末城市探索指南 · 数据层
 *  ---------------------------------------------------------------------
 *  说明：本文件中的“场所/场馆”均为各城市真实存在的地标与常设文化空间，
 *  活动形态以「常设展览 / 周期性市集 / 经典徒步路线 / 常规演出场地」为主，
 *  因此不会随时间过期。评分与人均花费为演示用样例值，接入真实数据源
 *  （大麦 / 豆瓣同城 / 各场馆公众号 / 高德 POI）后即可实时化。
 * ========================================================================= */

export const CITIES = {
  shenzhen:  { name: '深圳', lat: 22.5431, lng: 114.0579, prov: '广东' },
  guangzhou: { name: '广州', lat: 23.1291, lng: 113.2644, prov: '广东' },
  beijing:   { name: '北京', lat: 39.9042, lng: 116.4074, prov: '北京' },
  shanghai:  { name: '上海', lat: 31.2304, lng: 121.4737, prov: '上海' },
  hangzhou:  { name: '杭州', lat: 30.2741, lng: 120.1551, prov: '浙江' },
  chengdu:   { name: '成都', lat: 30.5728, lng: 104.0668, prov: '四川' },
};

/* 活动类别 —— 影响图标与配色 */
export const CATEGORIES = {
  '展览':  { icon: '🖼️', color: '#6C5CE7' },
  '市集':  { icon: '🧺', color: '#E17055' },
  '演出':  { icon: '🎭', color: '#D63031' },
  '徒步':  { icon: '🥾', color: '#00B894' },
  '户外':  { icon: '🌳', color: '#00A86B' },
  '文化':  { icon: '🏛️', color: '#0984E3' },
  '美食':  { icon: '🍜', color: '#E84393' },
  '运动':  { icon: '🏸', color: '#FDCB6E' },
  '夜游':  { icon: '🌃', color: '#2D3436' },
  '手作':  { icon: '🎨', color: '#A29BFE' },
};

/* 氛围标签 —— 用户偏好选择项 */
export const VIBES = [
  { id: '文艺', icon: '🎐', desc: '看展、书店、美术馆' },
  { id: '出片', icon: '📸', desc: '拍照好看、值得发朋友圈' },
  { id: '小众', icon: '🧭', desc: '避开人潮、非网红打卡点' },
  { id: '运动', icon: '⚡', desc: '徒步、骑行、出汗' },
  { id: '热闹', icon: '🎉', desc: '市集、演出、人多有氛围' },
  { id: '安静', icon: '☕', desc: '独处、发呆、慢节奏' },
  { id: '美食', icon: '🍢', desc: '吃是主线，玩是顺带' },
  { id: '社交', icon: '🤝', desc: '适合认识新朋友、组队' },
];

/* 时间窗 */
export const TIME_WINDOWS = [
  { id: 'morning',  label: '上午半天', hours: 4,  start: 9,  desc: '09:00 - 13:00' },
  { id: 'afternoon',label: '下午半天', hours: 5,  start: 14, desc: '14:00 - 19:00' },
  { id: 'evening',  label: '傍晚夜场', hours: 4,  start: 18, desc: '18:00 - 22:00' },
  { id: 'fullday',  label: '一整天',   hours: 9,  start: 10, desc: '10:00 - 19:00' },
];

/* ---------------------------------------------------------------------
 * 活动库
 *  env      : in 室内 / out 户外 / semi 半室内
 *  exertion : 体力消耗 0~5
 *  cost     : [最低, 最高] 人均元
 *  dur      : 建议游玩时长（小时）
 *  party    : [最舒适人数下限, 上限]
 * ------------------------------------------------------------------- */
export const ACTIVITIES = [
  /* ============================ 深圳 ============================ */
  { id:'sz01', city:'shenzhen', name:'海上世界文化艺术中心 · 设计互联常设展', cat:'展览',
    venue:'海上世界文化艺术中心', district:'南山·蛇口', env:'in', exertion:1,
    cost:[0,120], dur:3, party:[1,6], rating:4.7, dist:35, booking:'公众号预约',
    transit:'地铁12号线 海上世界站', tags:['文艺','出片','安静','小众'],
    weather:{ rain:1.0, hot:1.0, cold:1.0, wind:1.0 },
    desc:'由槇文斯基设计的海边美术馆，常设设计展与临展轮换。看完可直接走海上世界广场，海景+邮轮母港，傍晚光最好。' },

  { id:'sz02', city:'shenzhen', name:'南头古城 · 街巷漫游 + 周末创意市集', cat:'市集',
    venue:'南头古城', district:'南山·南头', env:'semi', exertion:2,
    cost:[40,120], dur:3.5, party:[2,6], rating:4.5, dist:25, booking:'免预约',
    transit:'地铁1号线 桃园站 / 12号线 南头古城站', tags:['热闹','出片','美食','文艺'],
    weather:{ rain:0.4, hot:0.5, cold:0.9, wind:0.8 },
    desc:'1700年历史的城中村改造样本，青砖老街 + 独立小店 + 咖啡 + 周末市集。巷子密集，下雨也能逛，是典型的"半室内"友好场景。' },

  { id:'sz03', city:'shenzhen', name:'东西涌海岸线穿越', cat:'徒步',
    venue:'东涌 - 西涌', district:'大鹏新区', env:'out', exertion:5,
    cost:[60,120], dur:6, party:[2,8], rating:4.8, dist:75, booking:'需提前报备',
    transit:'自驾 / 大鹏假日专线', tags:['运动','出片','社交','小众'],
    weather:{ rain:-1.0, hot:-0.6, cold:0.2, wind:-0.7 },
    desc:'深圳最经典的海岸线徒步，全程约 9km，礁石+沙滩+海崖。强烈依赖天气：雨天湿滑危险，高温天暴晒，大风天海浪风险高。' },

  { id:'sz04', city:'shenzhen', name:'梧桐山 · 鹏城第一峰登顶', cat:'徒步',
    venue:'梧桐山风景区', district:'罗湖/盐田', env:'out', exertion:5,
    cost:[0,20], dur:5, party:[1,10], rating:4.6, dist:40, booking:'免预约',
    transit:'地铁8号线 梧桐山南站', tags:['运动','出片','社交'],
    weather:{ rain:-1.0, hot:-0.8, cold:0.1, wind:-0.5 },
    desc:'海拔 943.7m，深圳最高峰。泰山涧/凌云道上山约 2.5h。山顶可俯瞰盐田港与香港。夏季高温时段强烈不推荐。' },

  { id:'sz05', city:'shenzhen', name:'深圳湾公园 - 人才公园 滨海骑行', cat:'户外',
    venue:'深圳湾公园', district:'南山', env:'out', exertion:3,
    cost:[10,40], dur:2.5, party:[1,6], rating:4.7, dist:20, booking:'免预约',
    transit:'地铁2号线 后海站 / 9号线 深圳湾公园站', tags:['运动','出片','安静','社交'],
    weather:{ rain:-0.9, hot:-0.5, cold:0.3, wind:-0.6 },
    desc:'15km 滨海绿道，日落时分对岸是香港元朗。风大时骑行阻力明显，夏季正午几乎无遮阴。适合傍晚场。' },

  { id:'sz06', city:'shenzhen', name:'华侨城创意文化园 OCT-LOFT · 独立展览 & 书店', cat:'展览',
    venue:'OCT-LOFT 北区/南区', district:'南山·华侨城', env:'in', exertion:1,
    cost:[0,80], dur:3, party:[1,4], rating:4.4, dist:25, booking:'部分需预约',
    transit:'地铁1号线 侨城东站', tags:['文艺','小众','安静','出片'],
    weather:{ rain:1.0, hot:1.0, cold:1.0, wind:1.0 },
    desc:'旧厂房改造的创意园区，小型画廊、独立书店、旧天堂书店、实验剧场密集。展览多为免费小众展，人少安静。' },

  { id:'sz07', city:'shenzhen', name:'深圳博物馆（市民中心）· 历史民俗常设展', cat:'文化',
    venue:'深圳博物馆', district:'福田·市民中心', env:'in', exertion:1,
    cost:[0,0], dur:2.5, party:[1,6], rating:4.5, dist:15, booking:'公众号预约',
    transit:'地铁4号线 市民中心站', tags:['文艺','安静','小众'],
    weather:{ rain:1.0, hot:1.0, cold:1.0, wind:1.0 },
    desc:'免费常设展，深圳改革开放史 + 古代深圳 + 民俗展。空调充足，是雨天/高温天的"绝对不会错"选项。' },

  { id:'sz08', city:'shenzhen', name:'大鹏所城 + 较场尾海滨', cat:'文化',
    venue:'大鹏所城', district:'大鹏新区', env:'semi', exertion:2,
    cost:[50,150], dur:5, party:[2,8], rating:4.4, dist:80, booking:'免预约',
    transit:'自驾 / 大鹏假日专线', tags:['出片','文艺','热闹','美食'],
    weather:{ rain:0.3, hot:0.4, cold:0.7, wind:0.5 },
    desc:'600年明代海防军事古城，旁边就是较场尾民宿海滩。适合一整天：上午逛城、中午海鲜、下午海边。' },

  { id:'sz09', city:'shenzhen', name:'莲花山公园 · 风筝广场 + 山顶俯瞰福田', cat:'户外',
    venue:'莲花山公园', district:'福田', env:'out', exertion:2,
    cost:[0,20], dur:2, party:[1,10], rating:4.6, dist:12, booking:'免预约',
    transit:'地铁3/4号线 少年宫站', tags:['运动','出片','社交','热闹'],
    weather:{ rain:-0.8, hot:-0.4, cold:0.2, wind:-0.4 },
    desc:'市区内最省力的"出门透气"选项。山顶广场看福田 CBD 天际线，风大时风筝广场特别热闹。' },

  { id:'sz10', city:'shenzhen', name:'观澜版画村 · 客家古村 + 版画工坊', cat:'手作',
    venue:'观澜版画原创产业基地', district:'龙华·观澜', env:'semi', exertion:1,
    cost:[0,60], dur:3, party:[1,6], rating:4.3, dist:55, booking:'部分工坊需预约',
    transit:'地铁4号线 观澜站 + 公交', tags:['文艺','小众','安静','出片'],
    weather:{ rain:0.4, hot:0.5, cold:0.8, wind:0.7 },
    desc:'客家老屋 + 版画工坊 + 大片稻田。人极少，是"小众"标签下最典型的深圳选项。可体验手工版画。' },

  { id:'sz11', city:'shenzhen', name:'深圳音乐厅 · 周末音乐会', cat:'演出',
    venue:'深圳音乐厅', district:'福田', env:'in', exertion:0,
    cost:[80,380], dur:2, party:[1,4], rating:4.7, dist:15, booking:'需购票',
    transit:'地铁4号线 少年宫站', tags:['文艺','安静'],
    weather:{ rain:1.0, hot:1.0, cold:1.0, wind:1.0 },
    desc:'周末常有公益场与市民音乐会，票价从几十到几百。完全室内，天气无关，适合安静型周末。' },

  { id:'sz12', city:'shenzhen', name:'甘坑客家小镇 · 夜间灯景', cat:'夜游',
    venue:'甘坑客家小镇', district:'龙岗·布吉', env:'semi', exertion:2,
    cost:[0,80], dur:3, party:[2,8], rating:4.2, dist:45, booking:'免预约',
    transit:'地铁10号线 甘坑站', tags:['出片','热闹','美食','社交'],
    weather:{ rain:0.0, hot:0.6, cold:0.5, wind:0.4 },
    desc:'客家围屋建筑群，傍晚亮灯后氛围最好。适合傍晚夜场，小吃集中，人多热闹。' },

  { id:'sz13', city:'shenzhen', name:'蛇口价值工厂 · 工业遗址艺术空间', cat:'展览',
    venue:'价值工厂', district:'南山·蛇口', env:'in', exertion:1,
    cost:[0,80], dur:2, party:[1,5], rating:4.3, dist:38, booking:'看展期',
    transit:'地铁12号线 左炮台东站', tags:['小众','文艺','出片','安静'],
    weather:{ rain:1.0, hot:1.0, cold:1.0, wind:1.0 },
    desc:'旧浮法玻璃厂改造，粗野主义工业风，摄影出片率高，人流稀少。展期不固定，去前建议确认。' },

  { id:'sz14', city:'shenzhen', name:'光明小镇欢乐田园 · 花海与露营', cat:'户外',
    venue:'光明小镇', district:'光明区', env:'out', exertion:2,
    cost:[30,120], dur:4, party:[2,10], rating:4.2, dist:60, booking:'部分需预约',
    transit:'地铁6号线 光明大街站 + 公交', tags:['出片','社交','运动','热闹'],
    weather:{ rain:-1.0, hot:-0.7, cold:0.0, wind:-0.5 },
    desc:'大面积花田与草坪，可搭帐篷野餐，团队活动友好。纯户外，天气依赖度最高的一类。' },

  /* ============================ 广州 ============================ */
  { id:'gz01', city:'guangzhou', name:'广东省博物馆 · 常设展', cat:'展览',
    venue:'广东省博物馆', district:'天河·珠江新城', env:'in', exertion:1,
    cost:[0,0], dur:3, party:[1,8], rating:4.6, dist:10, booking:'公众号预约',
    transit:'地铁APM线 大剧院站', tags:['文艺','安静','小众'],
    weather:{ rain:1.0, hot:1.0, cold:1.0, wind:1.0 },
    desc:'免费，端砚、潮州木雕、海洋生物等常设展质量很高。珠江新城 CBD 内，配套完善，雨天首选。' },

  { id:'gz02', city:'guangzhou', name:'永庆坊 · 西关骑楼 + 粤剧艺术博物馆', cat:'文化',
    venue:'永庆坊', district:'荔湾·西关', env:'semi', exertion:2,
    cost:[30,120], dur:3.5, party:[2,6], rating:4.5, dist:15, booking:'免预约',
    transit:'地铁1号线 长寿路站', tags:['文艺','出片','美食','热闹'],
    weather:{ rain:0.4, hot:0.4, cold:0.8, wind:0.7 },
    desc:'微改造的骑楼老街，粤剧艺术博物馆园林免费开放。周边是西关小吃密集区，吃逛一体。' },

  { id:'gz03', city:'guangzhou', name:'大夫山森林公园 · 环湖骑行', cat:'户外',
    venue:'大夫山森林公园', district:'番禺', env:'out', exertion:3,
    cost:[20,60], dur:3, party:[2,10], rating:4.5, dist:40, booking:'免预约',
    transit:'地铁3号线 市桥站 + 公交', tags:['运动','社交','出片'],
    weather:{ rain:-1.0, hot:-0.5, cold:0.3, wind:-0.6 },
    desc:'广州最舒服的骑行公园，租车便宜，环湖路线平坦。树荫多，比市区凉快，适合夏天上午。' },

  { id:'gz04', city:'guangzhou', name:'沙面岛 · 欧陆建筑 Citywalk', cat:'户外',
    venue:'沙面岛', district:'荔湾', env:'out', exertion:2,
    cost:[0,80], dur:2.5, party:[1,6], rating:4.6, dist:12, booking:'免预约',
    transit:'地铁1/6号线 黄沙站', tags:['出片','文艺','安静','小众'],
    weather:{ rain:-0.6, hot:-0.3, cold:0.3, wind:-0.3 },
    desc:'150 余栋近代欧式建筑，树荫成片，出片率高。连着上下九，可一整天吃逛。' },

  { id:'gz05', city:'guangzhou', name:'广州大剧院 · 周末演出', cat:'演出',
    venue:'广州大剧院', district:'天河·珠江新城', env:'in', exertion:0,
    cost:[100,480], dur:2.5, party:[1,4], rating:4.7, dist:10, booking:'需购票',
    transit:'地铁APM线 大剧院站', tags:['文艺','安静'],
    weather:{ rain:1.0, hot:1.0, cold:1.0, wind:1.0 },
    desc:'扎哈设计的建筑本身就是打卡点。周末常有话剧、音乐会、舞剧，室内完全不受天气影响。' },

  { id:'gz06', city:'guangzhou', name:'广州塔 - 海心沙 珠江夜游', cat:'夜游',
    venue:'珠江夜游', district:'海珠', env:'semi', exertion:1,
    cost:[80,200], dur:2, party:[2,6], rating:4.5, dist:12, booking:'需购票',
    transit:'地铁3号线 广州塔站', tags:['出片','热闹','社交'],
    weather:{ rain:-0.4, hot:0.3, cold:0.4, wind:-0.5 },
    desc:'珠江两岸灯光带，广州塔+猎德桥+海心桥。夜场首选，但大风天甲板体验下降。' },

  { id:'gz07', city:'guangzhou', name:'红专厂 / 东山口 · 独立小店 Citywalk', cat:'文化',
    venue:'东山口', district:'越秀', env:'semi', exertion:2,
    cost:[40,150], dur:3, party:[1,5], rating:4.4, dist:12, booking:'免预约',
    transit:'地铁1/6号线 东山口站', tags:['文艺','小众','出片','安静'],
    weather:{ rain:0.3, hot:0.4, cold:0.8, wind:0.7 },
    desc:'老洋房别墅区里的咖啡馆、买手店、独立书店。坡度不大，走走停停，节奏很慢。' },

  { id:'gz08', city:'guangzhou', name:'白云山 · 摩星岭登高', cat:'徒步',
    venue:'白云山风景区', district:'白云区', env:'out', exertion:4,
    cost:[5,30], dur:4, party:[1,8], rating:4.6, dist:25, booking:'免预约',
    transit:'地铁2号线 白云公园站 + 公交', tags:['运动','出片','社交'],
    weather:{ rain:-1.0, hot:-0.7, cold:0.2, wind:-0.5 },
    desc:'市区内最方便的山，摩星岭是广州最高点。有索道可选，适合不想太累但要运动量的人。' },

  { id:'gz09', city:'guangzhou', name:'陈家祠 · 岭南建筑装饰艺术', cat:'文化',
    venue:'陈家祠（广东民间工艺博物馆）', district:'荔湾·中山七路', env:'in', exertion:1,
    cost:[10,60], dur:2, party:[1,6], rating:4.7, dist:12, booking:'需购票（¥10）',
    transit:'地铁1号线 陈家祠站', tags:['文艺','安静','小众','出片'],
    weather:{ rain:1.0, hot:1.0, cold:1.0, wind:1.0 },
    desc:'"百粤冠祠"，砖雕、木雕、石雕、陶塑密度全国第一。门票 10 元，室内为主，是广州性价比与天气容错率双高的选项。' },

  { id:'gz10', city:'guangzhou', name:'珠江琶醍啤酒文化创意区 · 江景夜场', cat:'夜游',
    venue:'珠江琶醍', district:'海珠·琶洲', env:'semi', exertion:1,
    cost:[60,200], dur:3, party:[2,8], rating:4.4, dist:18, booking:'免预约',
    transit:'地铁8号线 琶洲站 + 有轨电车', tags:['热闹','社交','出片','美食'],
    weather:{ rain:-0.2, hot:0.3, cold:0.4, wind:-0.4 },
    desc:'旧啤酒厂改造的江边园区，酒吧与餐吧聚集，正对广州塔与猎德桥。傍晚到夜间氛围最好，江风大。' },

  /* ============================ 北京 ============================ */
  { id:'bj01', city:'beijing', name:'国家博物馆 · 常设展', cat:'展览',
    venue:'中国国家博物馆', district:'东城', env:'in', exertion:1,
    cost:[0,0], dur:4, party:[1,6], rating:4.8, dist:8, booking:'需预约',
    transit:'地铁1号线 天安门东站', tags:['文艺','安静','小众'],
    weather:{ rain:1.0, hot:1.0, cold:1.0, wind:1.0 },
    desc:'免费但需提前预约，古代中国基本陈列一天都逛不完。完全室内，是北京极端天气下的最优解。' },

  { id:'bj02', city:'beijing', name:'798 艺术区 · 画廊巡礼', cat:'展览',
    venue:'798 艺术区', district:'朝阳·酒仙桥', env:'semi', exertion:2,
    cost:[0,150], dur:3.5, party:[1,6], rating:4.6, dist:20, booking:'部分需预约',
    transit:'地铁14号线 望京南站', tags:['文艺','出片','小众'],
    weather:{ rain:0.2, hot:0.3, cold:0.5, wind:0.6 },
    desc:'包豪斯厂房改造的艺术区，画廊密度全国最高。多数画廊免费，空间大，逛起来不挤。' },

  { id:'bj03', city:'beijing', name:'箭扣 / 慕田峪长城徒步', cat:'徒步',
    venue:'慕田峪长城', district:'怀柔', env:'out', exertion:5,
    cost:[60,180], dur:6, party:[2,8], rating:4.8, dist:90, booking:'需购票',
    transit:'自驾 / 旅游专线', tags:['运动','出片','社交'],
    weather:{ rain:-1.0, hot:-0.6, cold:-0.4, wind:-0.8 },
    desc:'慕田峪是最成熟的野长城体验点，有索道与滑道。山脊风极大，冬季与大风天体感骤降。' },

  { id:'bj04', city:'beijing', name:'什刹海 - 南锣鼓巷 胡同 Citywalk', cat:'文化',
    venue:'什刹海', district:'西城', env:'out', exertion:2,
    cost:[30,150], dur:3, party:[2,6], rating:4.5, dist:6, booking:'免预约',
    transit:'地铁6号线 北海北站', tags:['文艺','出片','美食','热闹'],
    weather:{ rain:-0.7, hot:-0.3, cold:-0.2, wind:-0.5 },
    desc:'环湖胡同漫游，可租自行车，冬天湖面结冰可滑冰。周边小吃与老字号集中。' },

  { id:'bj05', city:'beijing', name:'国家大剧院 · 周末音乐会', cat:'演出',
    venue:'国家大剧院', district:'西城', env:'in', exertion:0,
    cost:[80,500], dur:2.5, party:[1,4], rating:4.8, dist:8, booking:'需购票',
    transit:'地铁1号线 天安门西站', tags:['文艺','安静'],
    weather:{ rain:1.0, hot:1.0, cold:1.0, wind:1.0 },
    desc:'周末音乐会有低价票档，安德鲁设计的"巨蛋"水下长廊本身就值得看。完全室内。' },

  { id:'bj06', city:'beijing', name:'首钢园 · 工业遗址 + 冬奥场馆', cat:'文化',
    venue:'首钢园', district:'石景山', env:'semi', exertion:2,
    cost:[0,120], dur:3.5, party:[2,8], rating:4.6, dist:25, booking:'部分需预约',
    transit:'地铁11号线 金安桥站', tags:['出片','小众','文艺','运动'],
    weather:{ rain:0.2, hot:0.2, cold:0.4, wind:0.3 },
    desc:'高炉、冷却塔、滑雪大跳台，"赛博朋克"感的工业美学。园区很大，建议租自行车。' },

  { id:'bj07', city:'beijing', name:'北海公园 - 景山 · 登高看中轴线', cat:'户外',
    venue:'景山公园', district:'西城', env:'out', exertion:3,
    cost:[2,20], dur:2.5, party:[1,6], rating:4.7, dist:6, booking:'免预约',
    transit:'地铁8号线 什刹海站', tags:['出片','运动','安静'],
    weather:{ rain:-0.7, hot:-0.3, cold:-0.3, wind:-0.6 },
    desc:'景山万春亭是俯瞰故宫全景的唯一最佳机位。爬升仅 45m，性价比极高，日落时段最佳。' },

  { id:'bj08', city:'beijing', name:'红砖美术馆 · 建筑与园林', cat:'展览',
    venue:'红砖美术馆', district:'朝阳·崔各庄', env:'semi', exertion:1,
    cost:[60,130], dur:2.5, party:[1,4], rating:4.5, dist:28, booking:'需购票',
    transit:'地铁15号线 马泉营站', tags:['文艺','出片','安静','小众'],
    weather:{ rain:0.3, hot:0.3, cold:0.5, wind:0.6 },
    desc:'红砖建筑 + 中式园林，本身就常被当作展品。人少安静，适合真正想"看东西"的人。' },

  { id:'bj09', city:'beijing', name:'奥林匹克森林公园 · 环湖跑步骑行', cat:'运动',
    venue:'奥森公园', district:'朝阳', env:'out', exertion:3,
    cost:[0,30], dur:2.5, party:[1,10], rating:4.6, dist:15, booking:'免预约',
    transit:'地铁8号线 森林公园南门站', tags:['运动','社交','出片'],
    weather:{ rain:-0.9, hot:-0.5, cold:-0.3, wind:-0.6 },
    desc:'北京最标准的跑步圣地，塑胶跑道 10km。春夏有花海，是低成本高回报的运动场景。' },

  { id:'bj10', city:'beijing', name:'前门北京坊 · 书店与夜市', cat:'夜游',
    venue:'北京坊', district:'东城', env:'semi', exertion:1,
    cost:[50,180], dur:2.5, party:[2,6], rating:4.4, dist:5, booking:'免预约',
    transit:'地铁2号线 前门站', tags:['文艺','热闹','美食','出片'],
    weather:{ rain:0.3, hot:0.5, cold:0.5, wind:0.5 },
    desc:'PageOne 书店正对正阳门，夜景极好。周边胡同小吃与老字号，适合傍晚到夜间。' },

  /* ============================ 上海 ============================ */
  { id:'sh01', city:'shanghai', name:'西岸美术馆 · 蓬皮杜合作展', cat:'展览',
    venue:'西岸美术馆', district:'徐汇·西岸', env:'in', exertion:1,
    cost:[60,180], dur:3, party:[1,6], rating:4.7, dist:20, booking:'需购票/预约',
    transit:'地铁11号线 云锦路站', tags:['文艺','出片','安静'],
    weather:{ rain:1.0, hot:1.0, cold:1.0, wind:1.0 },
    desc:'与蓬皮杜中心五年展陈合作，现当代艺术质量稳定。江边步道可顺路散步，看展+江景一站完成。' },

  { id:'sh02', city:'shanghai', name:'武康路 - 安福路 · 梧桐区 Citywalk', cat:'文化',
    venue:'武康路', district:'徐汇', env:'out', exertion:2,
    cost:[40,180], dur:3, party:[1,6], rating:4.7, dist:8, booking:'免预约',
    transit:'地铁10/11号线 交通大学站', tags:['出片','文艺','小众','美食'],
    weather:{ rain:-0.5, hot:-0.2, cold:0.0, wind:-0.4 },
    desc:'上海最经典的梧桐街区，武康大楼、老洋房、买手店、咖啡馆。人流大，建议工作日上午或傍晚。' },

  { id:'sh03', city:'shanghai', name:'苏州河 / 黄浦江 滨江骑行', cat:'户外',
    venue:'苏州河沿岸', district:'普陀-黄浦', env:'out', exertion:3,
    cost:[10,50], dur:3, party:[1,8], rating:4.6, dist:8, booking:'免预约',
    transit:'地铁1号线 新闸路站', tags:['运动','出片','社交'],
    weather:{ rain:-0.9, hot:-0.4, cold:-0.1, wind:-0.7 },
    desc:'苏州河 42km 贯通步道，桥下空间改造得很漂亮。骑行全程平坦，是低成本城市运动首选。' },

  { id:'sh04', city:'shanghai', name:'上海当代艺术博物馆 PSA · 双年展级别大展', cat:'展览',
    venue:'上海当代艺术博物馆', district:'黄浦', env:'in', exertion:1,
    cost:[0,100], dur:3, party:[1,8], rating:4.6, dist:6, booking:'需预约',
    transit:'地铁4/8号线 西藏南路站', tags:['文艺','小众','出片'],
    weather:{ rain:1.0, hot:1.0, cold:1.0, wind:1.0 },
    desc:'电厂改造，165m 大烟囱是地标。展览体量大、免费场次多，是雨天在上海最不容易出错的选择。' },

  { id:'sh05', city:'shanghai', name:'上海大剧院 / 交响乐团 · 周末演出', cat:'演出',
    venue:'上海大剧院', district:'黄浦·人民广场', env:'in', exertion:0,
    cost:[120,580], dur:2.5, party:[1,4], rating:4.7, dist:5, booking:'需购票',
    transit:'地铁1/2/8号线 人民广场站', tags:['文艺','安静'],
    weather:{ rain:1.0, hot:1.0, cold:1.0, wind:1.0 },
    desc:'周末常有交响、话剧、音乐剧。位于市中心，散场后可步行至南京路夜宵，动线顺。' },

  { id:'sh06', city:'shanghai', name:'辰山植物园 · 矿坑花园', cat:'户外',
    venue:'上海辰山植物园', district:'松江', env:'out', exertion:3,
    cost:[60,120], dur:4, party:[2,8], rating:4.7, dist:45, booking:'需购票',
    transit:'地铁9号线 洞泾站 + 公交', tags:['出片','安静','运动','文艺'],
    weather:{ rain:-0.9, hot:-0.5, cold:-0.1, wind:-0.5 },
    desc:'矿坑花园与三大温室是核心看点。温室区可避雨避晒，纯户外区域则是春夏最佳。' },

  { id:'sh07', city:'shanghai', name:'豫园 - 城隍庙 · 夜游与小吃', cat:'夜游',
    venue:'豫园', district:'黄浦', env:'semi', exertion:2,
    cost:[40,160], dur:2.5, party:[2,6], rating:4.3, dist:5, booking:'免预约',
    transit:'地铁10/14号线 豫园站', tags:['热闹','美食','出片'],
    weather:{ rain:-0.2, hot:0.2, cold:0.3, wind:0.2 },
    desc:'江南园林 + 老城厢商业街。灯会期间夜景极佳，人流也极大，适合"热闹"偏好。' },

  { id:'sh08', city:'shanghai', name:'多伦路 / M50 创意园 · 小众艺术', cat:'展览',
    venue:'M50 创意园', district:'普陀', env:'in', exertion:1,
    cost:[0,80], dur:2.5, party:[1,5], rating:4.4, dist:10, booking:'免预约',
    transit:'地铁1/3/4号线 上海火车站 + 步行', tags:['小众','文艺','安静','出片'],
    weather:{ rain:1.0, hot:1.0, cold:1.0, wind:1.0 },
    desc:'苏州河畔的老纺织厂改造艺术区，画廊小而精，游客远少于 798 与西岸，属于"安静看展"选项。' },

  { id:'sh09', city:'shanghai', name:'滴水湖 / 临港 · 骑行与海边', cat:'户外',
    venue:'滴水湖', district:'浦东·临港', env:'out', exertion:4,
    cost:[30,100], dur:5, party:[2,10], rating:4.3, dist:75, booking:'免预约',
    transit:'地铁16号线 滴水湖站', tags:['运动','出片','小众','社交'],
    weather:{ rain:-1.0, hot:-0.5, cold:-0.3, wind:-0.9 },
    desc:'上海看海最方便的地方，环湖骑行 8km。临海风极大，体感温度常比市区低 3-5 度，需注意防风。' },

  { id:'sh10', city:'shanghai', name:'黑石公寓 / 上生新所 · 周末市集', cat:'市集',
    venue:'上生新所', district:'长宁', env:'semi', exertion:1,
    cost:[40,150], dur:2.5, party:[2,6], rating:4.4, dist:12, booking:'免预约',
    transit:'地铁2/11号线 江苏路站', tags:['文艺','出片','热闹','美食'],
    weather:{ rain:0.4, hot:0.5, cold:0.8, wind:0.8 },
    desc:'哥伦比亚乡村俱乐部旧址改造，茑屋书店 + 泳池 + 周末市集。半室内，天气弹性大。' },

  /* ============================ 杭州 ============================ */
  { id:'hz01', city:'hangzhou', name:'中国美术学院象山校区 / 浙江美术馆', cat:'展览',
    venue:'浙江美术馆', district:'上城·南山路', env:'in', exertion:1,
    cost:[0,60], dur:2.5, party:[1,6], rating:4.6, dist:5, booking:'公众号预约',
    transit:'地铁4号线 水澄桥站 + 公交', tags:['文艺','安静','出片'],
    weather:{ rain:1.0, hot:1.0, cold:1.0, wind:1.0 },
    desc:'西湖边的免费美术馆，常设与临展轮换。看完可直接进西湖景区，是"看展+散步"的天然组合。' },

  { id:'hz02', city:'hangzhou', name:'西湖环湖骑行 / 苏堤漫步', cat:'户外',
    venue:'西湖', district:'西湖区', env:'out', exertion:3,
    cost:[10,60], dur:3.5, party:[1,8], rating:4.8, dist:3, booking:'免预约',
    transit:'地铁1号线 龙翔桥站', tags:['出片','运动','文艺','社交'],
    weather:{ rain:-0.8, hot:-0.3, cold:-0.1, wind:-0.5 },
    desc:'环湖约 15km，共享单车即可。雨中西湖别有味道，但骑行体验下降；节假日人流极大。' },

  { id:'hz03', city:'hangzhou', name:'龙井村 - 九溪十八涧 徒步', cat:'徒步',
    venue:'九溪十八涧', district:'西湖区', env:'out', exertion:4,
    cost:[0,60], dur:4, party:[2,8], rating:4.7, dist:12, booking:'免预约',
    transit:'公交 九溪站', tags:['运动','安静','出片','小众'],
    weather:{ rain:-0.7, hot:-0.3, cold:0.1, wind:-0.4 },
    desc:'溪水伴行的林荫徒步路线，夏天比市区凉快明显。有踩石过溪路段，雨大时湿滑需谨慎。' },

  { id:'hz04', city:'hangzhou', name:'良渚古城遗址公园 · 五千年文明', cat:'文化',
    venue:'良渚古城遗址公园', district:'余杭', env:'out', exertion:3,
    cost:[60,120], dur:4, party:[2,8], rating:4.6, dist:30, booking:'需购票',
    transit:'地铁2号线 良渚站 + 公交', tags:['文艺','小众','出片','运动'],
    weather:{ rain:-0.9, hot:-0.6, cold:-0.2, wind:-0.5 },
    desc:'世界遗产，园区极大需坐观光车。草坪与遗址地貌开阔，几乎无遮阴，适合春秋凉爽天气。' },

  { id:'hz05', city:'hangzhou', name:'大运河 / 小河直街 · 夜游', cat:'夜游',
    venue:'小河直街', district:'拱墅', env:'semi', exertion:1,
    cost:[30,120], dur:2.5, party:[2,6], rating:4.4, dist:8, booking:'免预约',
    transit:'地铁5号线 大运河站', tags:['文艺','安静','美食','出片'],
    weather:{ rain:0.3, hot:0.5, cold:0.5, wind:0.5 },
    desc:'运河边的老街改造区，咖啡馆与小酒馆密集，晚上有桥洞灯光。人比西湖少很多。' },

  { id:'hz06', city:'hangzhou', name:'杭州大剧院 · 周末演出', cat:'演出',
    venue:'杭州大剧院', district:'上城·钱江新城', env:'in', exertion:0,
    cost:[80,380], dur:2.5, party:[1,4], rating:4.5, dist:8, booking:'需购票',
    transit:'地铁4/7号线 市民中心站', tags:['文艺','安静'],
    weather:{ rain:1.0, hot:1.0, cold:1.0, wind:1.0 },
    desc:'钱江新城"日月同辉"建筑群之一，散场后可看城市阳台灯光秀。完全室内，天气无关。' },

  { id:'hz07', city:'hangzhou', name:'天目里 · 书店与周末市集', cat:'市集',
    venue:'天目里', district:'西湖区', env:'semi', exertion:1,
    cost:[50,180], dur:2.5, party:[1,6], rating:4.5, dist:10, booking:'免预约',
    transit:'地铁3号线 古墩路站', tags:['文艺','出片','热闹','美食'],
    weather:{ rain:0.4, hot:0.5, cold:0.8, wind:0.7 },
    desc:'伦佐·皮亚诺设计，茑屋书店中国首店。周末常有市集与展览，是杭州年轻人密度最高的地方之一。' },

  { id:'hz08', city:'hangzhou', name:'湘湖 · 环湖骑行与露营', cat:'户外',
    venue:'湘湖', district:'萧山', env:'out', exertion:3,
    cost:[20,100], dur:4, party:[2,10], rating:4.4, dist:20, booking:'免预约',
    transit:'地铁1号线 湘湖站', tags:['运动','社交','出片','安静'],
    weather:{ rain:-1.0, hot:-0.6, cold:-0.1, wind:-0.6 },
    desc:'西湖的"平替"，人少、湖面开阔、可搭帐篷。草坪面积大，适合多人组队活动。' },

  { id:'hz09', city:'hangzhou', name:'西溪湿地 · 摇橹船与芦苇荡', cat:'户外',
    venue:'西溪国家湿地公园', district:'西湖区', env:'semi', exertion:2,
    cost:[80,180], dur:4, party:[2,6], rating:4.6, dist:12, booking:'需购票',
    transit:'地铁3号线 西溪湿地南站', tags:['安静','出片','文艺','小众'],
    weather:{ rain:0.1, hot:0.2, cold:0.3, wind:0.3 },
    desc:'坐摇橹船穿芦苇荡，是杭州"慢"字的具象化。船为半遮蔽，小雨可接受；园内步道夏热冬冷。' },

  { id:'hz10', city:'hangzhou', name:'浙江省博物馆之江馆 / 之江文化中心', cat:'展览',
    venue:'之江文化中心', district:'西湖区·之江', env:'in', exertion:1,
    cost:[0,0], dur:3, party:[1,8], rating:4.7, dist:15, booking:'公众号预约',
    transit:'地铁6号线 之浦路站', tags:['文艺','安静','小众','出片'],
    weather:{ rain:1.0, hot:1.0, cold:1.0, wind:1.0 },
    desc:'浙江四大馆合一的新文化地标，免费预约。体量大、室内恒温、人流分散，是杭州雨天的最优室内选项之一。' },

  /* ============================ 成都 ============================ */
  { id:'cd01', city:'chengdu', name:'成都博物馆 / 四川博物院 · 常设展', cat:'展览',
    venue:'成都博物馆', district:'青羊·天府广场', env:'in', exertion:1,
    cost:[0,0], dur:3, party:[1,8], rating:4.6, dist:3, booking:'公众号预约',
    transit:'地铁1/2号线 天府广场站', tags:['文艺','安静','小众'],
    weather:{ rain:1.0, hot:1.0, cold:1.0, wind:1.0 },
    desc:'免费，皮影戏与民俗展非常有特色，紧邻天府广场。成都阴雨天多，室内馆是第一备选。' },

  { id:'cd02', city:'chengdu', name:'东郊记忆 · 工业风艺术区', cat:'文化',
    venue:'东郊记忆', district:'成华', env:'semi', exertion:2,
    cost:[0,120], dur:3, party:[1,8], rating:4.5, dist:8, booking:'免预约',
    transit:'地铁7号线 二仙桥站', tags:['出片','文艺','热闹','社交'],
    weather:{ rain:0.3, hot:0.4, cold:0.7, wind:0.7 },
    desc:'旧电子管厂改造，红砖厂房 + 音乐现场 + 小剧场。晚场演出多，是成都夜生活的核心区之一。' },

  { id:'cd03', city:'chengdu', name:'龙泉山 · 丹景台观景徒步', cat:'徒步',
    venue:'龙泉山城市森林公园', district:'龙泉驿', env:'out', exertion:4,
    cost:[20,80], dur:4, party:[2,8], rating:4.5, dist:30, booking:'免预约',
    transit:'自驾 / 地铁2号线 + 公交', tags:['运动','出片','社交','小众'],
    weather:{ rain:-0.9, hot:-0.5, cold:-0.1, wind:-0.6 },
    desc:'丹景台可俯瞰成都平原，天气好时能看见雪山。成都少有的登高视野点，日出与日落时段最佳。' },

  { id:'cd04', city:'chengdu', name:'人民公园 · 鹤鸣茶社喝盖碗茶', cat:'文化',
    venue:'人民公园', district:'青羊', env:'semi', exertion:1,
    cost:[20,80], dur:2.5, party:[1,8], rating:4.6, dist:3, booking:'免预约',
    transit:'地铁2号线 人民公园站', tags:['安静','文艺','小众','社交'],
    weather:{ rain:0.5, hot:0.5, cold:0.6, wind:0.6 },
    desc:'成都生活方式的样本：竹椅、盖碗茶、掏耳朵、相亲角。有大树遮蔽，小雨也能坐得住。' },

  { id:'cd05', city:'chengdu', name:'玉林路 / 芳草街 · 小酒馆与小吃 Citywalk', cat:'夜游',
    venue:'玉林路', district:'武侯', env:'semi', exertion:2,
    cost:[60,200], dur:3, party:[2,8], rating:4.6, dist:5, booking:'免预约',
    transit:'地铁3号线 磨子桥站', tags:['美食','热闹','社交','出片'],
    weather:{ rain:0.3, hot:0.4, cold:0.5, wind:0.5 },
    desc:'《成都》唱的那条街。串串、酒吧、咖啡馆密集，是成都"吃+聊"动线最顺的一片。' },

  { id:'cd06', city:'chengdu', name:'青城山 · 前山道教徒步', cat:'徒步',
    venue:'青城山', district:'都江堰', env:'out', exertion:5,
    cost:[80,200], dur:6, party:[2,8], rating:4.7, dist:65, booking:'需购票',
    transit:'城际铁路 青城山站', tags:['运动','安静','出片','小众'],
    weather:{ rain:-1.0, hot:-0.4, cold:-0.2, wind:-0.5 },
    desc:'"青城天下幽"，全程石阶上行约 3h，林荫覆盖率极高，雨天湿滑但氛围极佳。需一整天。' },

  { id:'cd07', city:'chengdu', name:'天府艺术公园 · 成都美术馆', cat:'展览',
    venue:'天府艺术公园', district:'金牛', env:'in', exertion:1,
    cost:[0,80], dur:3, party:[1,6], rating:4.6, dist:10, booking:'公众号预约',
    transit:'地铁6号线 西华大道站', tags:['文艺','出片','安静','小众'],
    weather:{ rain:1.0, hot:1.0, cold:1.0, wind:1.0 },
    desc:'芙蓉花造型的美术馆 + 迎桂湖，建筑与倒影出片率极高。免费预约，室内为主，雨天友好。' },

  { id:'cd08', city:'chengdu', name:'兴隆湖 / 青龙湖 · 环湖骑行露营', cat:'户外',
    venue:'青龙湖湿地公园', district:'成华/天府新区', env:'out', exertion:3,
    cost:[20,100], dur:4, party:[2,10], rating:4.4, dist:20, booking:'免预约',
    transit:'地铁4号线 十陵站', tags:['运动','社交','出片','安静'],
    weather:{ rain:-1.0, hot:-0.5, cold:-0.1, wind:-0.5 },
    desc:'成都最流行的周末搭帐篷地点，草坪大、骑行道完整、可烧烤。纯户外，依赖天气。' },

  { id:'cd09', city:'chengdu', name:'望江楼公园 · 竹林喝茶', cat:'文化',
    venue:'望江楼公园', district:'武侯·九眼桥', env:'semi', exertion:1,
    cost:[20,60], dur:2.5, party:[1,8], rating:4.5, dist:5, booking:'免预约',
    transit:'地铁6号线 三官堂站', tags:['安静','小众','文艺','社交'],
    weather:{ rain:0.5, hot:0.6, cold:0.6, wind:0.7 },
    desc:'薛涛纪念地，全国竹子品种最全的公园之一。竹林浓密、遮阴极好，茶座便宜，是"安静一下午"的标准答案。' },

  { id:'cd10', city:'chengdu', name:'川剧变脸小剧场 · 锦江剧场', cat:'演出',
    venue:'锦江剧场', district:'锦江·春熙路', env:'in', exertion:0,
    cost:[80,260], dur:2, party:[1,6], rating:4.6, dist:4, booking:'需购票',
    transit:'地铁2/3号线 春熙路站', tags:['热闹','文艺','社交'],
    weather:{ rain:1.0, hot:1.0, cold:1.0, wind:1.0 },
    desc:'变脸、吐火、手影戏，两小时看懂川剧精华。完全室内，是成都雨天夜晚最不会出错的文化消费。' },

  { id:'cd11', city:'chengdu', name:'白鹭湾湿地 / 三圣乡 · 露营骑行', cat:'户外',
    venue:'白鹭湾湿地公园', district:'锦江·三圣乡', env:'out', exertion:3,
    cost:[20,90], dur:3.5, party:[2,10], rating:4.4, dist:15, booking:'免预约',
    transit:'地铁3号线 三圣乡站 + 公交', tags:['运动','社交','出片','安静'],
    weather:{ rain:-1.0, hot:-0.5, cold:-0.1, wind:-0.5 },
    desc:'三圣乡花乡腹地，草坪开阔、水岸线长，骑行与野餐都很成熟。距市区近，是"临时决定出门"的低成本选项。' },
];

/* ---------------------------------------------------------------------
 * 餐饮 / 补给点 —— 用于把单个活动升级成"半天方案"
 * ------------------------------------------------------------------- */
export const FOOD_SPOTS = [
  { city:'shenzhen', district:'南山·蛇口', name:'海上世界广场美食街', type:'海鲜/异国', cost:80 },
  { city:'shenzhen', district:'南山·南头', name:'南头古城巷内小吃', type:'小吃/咖啡', cost:45 },
  { city:'shenzhen', district:'大鹏新区', name:'较场尾海鲜大排档', type:'海鲜', cost:110 },
  { city:'shenzhen', district:'罗湖/盐田', name:'盐田海鲜街', type:'海鲜', cost:100 },
  { city:'shenzhen', district:'南山', name:'海岸城 / 万象天地', type:'综合商场', cost:75 },
  { city:'shenzhen', district:'福田·市民中心', name:'COCO Park 餐饮层', type:'综合商场', cost:70 },
  { city:'shenzhen', district:'南山·华侨城', name:'侨城坊 / 燕晗山食街', type:'小吃/简餐', cost:55 },
  { city:'shenzhen', district:'龙华·观澜', name:'观澜老街客家菜', type:'客家菜', cost:60 },
  { city:'shenzhen', district:'龙岗·布吉', name:'甘坑小镇小吃街', type:'小吃', cost:50 },
  { city:'shenzhen', district:'光明区', name:'光明农庄 / 乳鸽', type:'本地菜', cost:85 },
  { city:'shenzhen', district:'福田', name:'购物公园酒吧街', type:'夜宵/酒馆', cost:120 },
  { city:'shenzhen', district:'南山·蛇口', name:'价值工厂周边咖啡', type:'咖啡轻食', cost:40 },

  { city:'guangzhou', district:'天河·珠江新城', name:'兴盛路 / 猎德美食', type:'综合', cost:80 },
  { city:'guangzhou', district:'荔湾·西关', name:'上下九小吃街', type:'小吃', cost:45 },
  { city:'guangzhou', district:'番禺', name:'市桥大排档', type:'粤菜', cost:70 },
  { city:'guangzhou', district:'荔湾', name:'沙面岛内西餐厅', type:'西餐', cost:110 },
  { city:'guangzhou', district:'海珠', name:'滨江东夜宵', type:'夜宵', cost:85 },
  { city:'guangzhou', district:'越秀', name:'东山口咖啡馆', type:'咖啡轻食', cost:50 },
  { city:'guangzhou', district:'白云区', name:'白云山脚农家菜', type:'本地菜', cost:65 },
  { city:'guangzhou', district:'天河·珠江新城', name:'花城汇餐饮层', type:'综合商场', cost:75 },

  { city:'beijing', district:'东城', name:'前门大街老字号', type:'京菜/小吃', cost:90 },
  { city:'beijing', district:'朝阳·酒仙桥', name:'798 内餐厅咖啡', type:'简餐/咖啡', cost:80 },
  { city:'beijing', district:'怀柔', name:'慕田峪农家院', type:'农家菜', cost:70 },
  { city:'beijing', district:'西城', name:'什刹海烤肉季 / 爆肚', type:'京菜', cost:100 },
  { city:'beijing', district:'石景山', name:'首钢园内餐厅', type:'简餐', cost:85 },
  { city:'beijing', district:'朝阳·崔各庄', name:'红砖美术馆咖啡', type:'咖啡轻食', cost:60 },
  { city:'beijing', district:'朝阳', name:'奥森南门美食广场', type:'综合', cost:65 },
  { city:'beijing', district:'西城', name:'西单 / 大悦城', type:'综合商场', cost:75 },

  { city:'shanghai', district:'徐汇·西岸', name:'西岸凤巢 / 龙腾大道餐饮', type:'简餐/咖啡', cost:90 },
  { city:'shanghai', district:'徐汇', name:'武康路咖啡馆 brunch', type:'Brunch', cost:110 },
  { city:'shanghai', district:'黄浦', name:'南京东路 / 云南南路小吃', type:'小吃', cost:60 },
  { city:'shanghai', district:'黄浦', name:'豫园城隍庙小吃', type:'小吃', cost:70 },
  { city:'shanghai', district:'松江', name:'辰山植物园周边农家菜', type:'本地菜', cost:70 },
  { city:'shanghai', district:'普陀', name:'M50 周边简餐咖啡', type:'咖啡轻食', cost:55 },
  { city:'shanghai', district:'浦东·临港', name:'滴水湖海鲜', type:'海鲜', cost:100 },
  { city:'shanghai', district:'长宁', name:'上生新所内餐厅', type:'简餐/咖啡', cost:95 },

  { city:'hangzhou', district:'上城·南山路', name:'南山路餐厅 / 湖滨银泰', type:'综合', cost:90 },
  { city:'hangzhou', district:'西湖区', name:'龙井村农家茶餐', type:'本地菜', cost:85 },
  { city:'hangzhou', district:'余杭', name:'良渚文化村食街', type:'简餐/咖啡', cost:65 },
  { city:'hangzhou', district:'拱墅', name:'小河直街小酒馆', type:'夜宵/酒馆', cost:95 },
  { city:'hangzhou', district:'上城·钱江新城', name:'万象城餐饮层', type:'综合商场', cost:85 },
  { city:'hangzhou', district:'西湖区', name:'天目里餐饮街区', type:'简餐/咖啡', cost:90 },
  { city:'hangzhou', district:'萧山', name:'湘湖渔庄', type:'本地菜', cost:80 },
  { city:'hangzhou', district:'西湖区', name:'九溪烧烤 / 农家菜', type:'农家菜', cost:70 },

  { city:'chengdu', district:'青羊·天府广场', name:'宽窄巷子 / 奎星楼街', type:'川菜/小吃', cost:70 },
  { city:'chengdu', district:'成华', name:'东郊记忆内餐吧', type:'简餐/酒馆', cost:85 },
  { city:'chengdu', district:'龙泉驿', name:'龙泉山农家乐', type:'农家菜', cost:65 },
  { city:'chengdu', district:'青羊', name:'人民公园鹤鸣茶社', type:'茶社/小吃', cost:35 },
  { city:'chengdu', district:'武侯', name:'玉林串串 / 小酒馆', type:'串串/酒馆', cost:80 },
  { city:'chengdu', district:'都江堰', name:'青城山脚老腊肉', type:'农家菜', cost:70 },
  { city:'chengdu', district:'金牛', name:'天府艺术公园周边', type:'简餐/咖啡', cost:65 },
  { city:'chengdu', district:'成华/天府新区', name:'青龙湖烧烤营地', type:'烧烤', cost:75 },
];

/* ---------------------------------------------------------------------
 * 路线主题 —— 用于组合出"有性格"的周末方案
 * ------------------------------------------------------------------- */
export const PLAN_TEMPLATES = [
  { id:'chill',   name:'省心躺平', icon:'🛋️', vibe:['安静','文艺','小众'],
    desc:'不赶时间、不晒太阳、随时可退，适合"就是想出门走走"的周末。',
    weights:{ quiet:1.2, indoor:1.3, exertion:-0.8 } },
  { id:'photo',   name:'出片打卡', icon:'📸', vibe:['出片','文艺','热闹'],
    desc:'优先光线、建筑、场景感，路线按"先室内后户外看日落"排。',
    weights:{ photo:1.4, indoor:0.2, exertion:0 } },
  { id:'active',  name:'轻运动社交', icon:'⚡', vibe:['运动','社交','热闹'],
    desc:'要有体力输出与同行互动，适合多人组队、也适合认识新朋友。',
    weights:{ exert:1.3, social:1.3, indoor:-0.6 } },
];
