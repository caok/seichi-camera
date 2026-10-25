import type { SceneStory } from '../types'

// Researched 2026-10-24. Only facts we could source are included; each story lists its sources.
export const stories: Record<string, SceneStory> = {
  'skytree-conan': {
    diff: {
      zh: '片中的塔叫「东都铃木树塔」，设定高 635 米——故意比现实中的晴空塔（634 米）高出 1 米。',
      en: 'In the film it’s the “Touto Bell Tree Tower”, set at 635 m — deliberately 1 m taller than the real Skytree (634 m).',
    },
    story: {
      zh: '电影 2014 年上映时晴空塔才开业两年。故事舞台从晴空塔一直延伸到雷门之间的吾妻桥、驹形桥一带，隅田川、言问桥都以真名出现。',
      en: 'When the film came out in 2014, Skytree had been open for only two years. The story runs from Skytree to Kaminarimon around Azuma and Komagata bridges; the Sumida River and Kototoi Bridge appear under their real names.',
    },
    fact: {
      zh: '这部是柯南剧场版第 18 作，也是系列第一次票房突破 40 亿日元。',
      en: 'The 18th Conan film was the first in the series to gross over ¥4 billion.',
    },
    sources: [
      { label: '金曜ロードショー公式 X', url: 'https://x.com/kinro_ntv/status/1383028234141376512' },
      { label: 'アニヲタWiki', url: 'https://w.atwiki.jp/aniwotawiki/pages/30190.html' },
      { label: 'allcinema', url: 'https://www.allcinema.net/cinema/347764' },
    ],
    trailer: { videoId: '6b9KzTgx0sU', t: 9 },
  },
  'shibuya-jujutsu': {
    diff: {
      zh: '「涩谷事变」设定在 2018 年 10 月 31 日万圣节夜。动画第 31 话里，八公前广场的人群被吸进车站——现实中的广场依然是涩谷最热闹的集合点。',
      en: 'The Shibuya Incident is set on Halloween night, 31 Oct 2018. In episode 31 the crowd at Hachiko Square is sucked into the station — in real life it’s still Shibuya’s busiest meeting spot.',
    },
    story: {
      zh: '你看到的是第二代八公像（1948 年）。初代建于 1934 年，八公本人出席了揭幕；1945 年 8 月 14 日——终战广播的前一天——在战时金属回收中被熔成了火车零件。',
      en: 'This is the second Hachiko statue (1948). The first went up in 1934 with Hachiko himself at the unveiling, and was melted down for locomotive parts on 14 Aug 1945 — the day before Japan’s surrender broadcast.',
    },
    fact: {
      zh: '第二代八公像由初代作者的儿子铸造，战后缺铜，他熔掉了父亲的另一件雕塑才完成；揭幕当天铜像还是热的。',
      en: 'The second statue was cast by the original sculptor’s son, who melted down another of his father’s works for bronze — it was still warm at the unveiling.',
    },
    sources: [
      { label: 'シブヤ経済新聞', url: 'https://www.shibukei.com/headline/10073/' },
      { label: '2匹のハチ公と戦争', url: 'https://www.mizukishorin.com/post/2%E5%8C%B9%E3%81%AE%E3%83%8F%E3%83%81%E5%85%AC%E3%81%A8%E6%88%A6%E4%BA%89' },
      { label: 'anime-pilgrimage.com', url: 'https://anime-pilgrimage.com/jujutsu-kaisen/' },
      { label: 'ピクシブ百科事典', url: 'https://dic.pixiv.net/a/%E6%B8%8B%E8%B0%B7%E4%BA%8B%E5%A4%89' },
    ],
    trailer: { videoId: 'PKHQuQF1S8k', t: 9 },
  },
  'akiba-steinsgate': {
    diff: {
      zh: '动画里是 2010 年的旧收音机会馆。旧楼 2011 年闭馆拆除，你现在看到的是 2014 年 7 月 20 日重新开业的新楼。',
      en: 'The anime shows the old Radio Kaikan of 2010. That building closed and was demolished in 2011; what you see now reopened on 20 July 2014.',
    },
    story: {
      zh: '2011 年 10 月旧楼拆除前，官方在楼顶外墙「嵌入」了一颗重 600 kg 的人造卫星，裂痕、焦痕全部重现第 1 集——这是旧楼与《命运石之门》最初也是最后一次合作。',
      en: 'Before demolition in Oct 2011, a 600 kg “satellite” was embedded in the top-floor wall, complete with cracks and scorch marks from episode 1 — the old building’s first and last collaboration with Steins;Gate.',
    },
    fact: {
      zh: '那颗卫星是从午夜 12 点装到凌晨 4 点才完工的。',
      en: 'Installing the satellite took from midnight until about 4 am.',
    },
    sources: [
      { label: 'ねとらぼ', url: 'https://nlab.itmedia.co.jp/cont/articles/3222699/' },
      { label: 'アキバ経済新聞', url: 'https://akiba.keizai.biz/headline/2613/' },
      { label: 'AKIBA PC Hotline!', url: 'https://akiba-pc.watch.impress.co.jp/hotline/20111029/etc_rajikan.html' },
    ],
    trailer: { videoId: '27OZc-ku6is', t: 24 },
  },
  'ochanomizu-suzume': {
    diff: {
      zh: '电影里是翻修前的旧圣桥。2018–2021 年桥做过延寿工程，现在的栏杆看起来比电影里新。',
      en: 'The film shows the bridge before its 2018–2021 renovation, so the parapet looks newer today than on screen.',
    },
    story: {
      zh: '从桥上能看到喷出「蚯蚓」的那个隧道口——现实中是地铁丸之内线的隧道。这里本来就是能同时看到中央线、总武线、丸之内线立体交叉的人气观景点。',
      en: 'From the bridge you can see the tunnel the “Worm” bursts out of — in reality it’s the Marunouchi subway line. The spot was already famous for watching the Chuo, Sobu and Marunouchi lines cross at different levels.',
    },
    fact: {
      zh: '「圣桥」的名字来自它连接的两座圣堂：汤岛圣堂和尼古拉堂。桥建于 1927 年，是关东大地震后的复兴工程之一。',
      en: '“Hijiri-bashi” (Holy Bridge) is named for the two cathedrals it links: Yushima Seido and Nikolai-do. It was built in 1927 as part of the post-earthquake reconstruction.',
    },
    sources: [
      { label: 'travel.co.jp', url: 'https://www.travel.co.jp/guide/matome/4352/' },
      { label: 'NEWT', url: 'https://newt.net/jpn/mag-00703739081' },
      { label: 'TOKYO TRIP', url: 'https://tokyo-trip.org/spot/visiting/tk1069/' },
    ],
    trailer: { videoId: 'FVU0zESXS5c', t: 72 },
  },
  'gyoen-kotonoha': {
    diff: {
      zh: '凉亭的形状和周围景色与电影几乎一模一样；但凉亭后面是禁止进入的树丛，所以电影里「从背后看凉亭」的角度在现实中拍不到。',
      en: 'The gazebo and its surroundings look almost exactly as in the film — but the bushes behind it are off-limits, so the “from behind” angle can’t be recreated.',
    },
    story: {
      zh: '随着作品走红，越来越多人来凉亭拍照、坐在长椅上，即使下雨天也常有海外游客专程前来。',
      en: 'As the film grew in popularity, more and more visitors come to photograph the gazebo and sit on its bench — even on rainy days, including many from overseas.',
    },
    fact: {
      zh: '雪野在凉亭里喝啤酒，但新宿御苑禁止携带酒类——据粉丝考证，片中其实就画了「禁止携带酒类」的告示牌。',
      en: 'Yukari drinks beer in the gazebo, but alcohol isn’t allowed in Shinjuku Gyoen — fans spotted that the “no alcohol” sign is actually drawn in the film.',
    },
    sources: [
      { label: 'ホームメイト', url: 'https://www.homemate-research.com/bc183/entame-fan/148/' },
      { label: 'RENブロ', url: 'https://www.renstablog.net/entry/seichi/kotonoha' },
      { label: 'FotoReiser', url: 'https://alan-d-haller.info/travel_jp/thegardenofwords/' },
      { label: 'まとめまめ', url: 'https://matomame.jp/user/ELI_AYASE/caa37731c3e20927b8e0' },
    ],
    trailer: { videoId: 'udDIkl6z8X0', t: 70 },
  },
  'shimokita-bocchi': {
    diff: {
      zh: '招牌、楼梯、门口这些细节几乎原样还原；就连店里物贩和庆功宴用的六角桌，也「像得不能再像」。',
      en: 'The sign, stairs and door are reproduced almost one-to-one — even the hexagonal tables used for merch and after-parties look “as close as it gets”.',
    },
    story: {
      zh: '动画爆红后巡礼者激增，官方和 SHELTER 都发了注意事项。请避开团体或周末聚众拍照，最好工作日下午 2 点前快速拍完。',
      en: 'After the anime took off, pilgrims flooded in and both the official side and SHELTER issued notices. Avoid group or weekend photo sessions — a quick shot on a weekday before 2 pm is best.',
    },
    fact: {
      zh: '想真正体验 STARRY，最好的方式是买张票进去看一场真正的 live。',
      en: 'The best way to really experience STARRY is to buy a ticket and catch a real live show.',
    },
    sources: [
      { label: 'anitabi', url: 'https://anitabi.jp/spots/1797' },
      { label: 'しもブロ', url: 'https://www.shimokitazawa.info/news/2023/01/bocchitherocks-location/' },
      { label: 'Tabist', url: 'https://magazine.tabist.co.jp/other/14935/' },
    ],
    trailer: { videoId: 'nomJbjuQXAY', t: 43 },
  },
  'akiba-lovelive': {
    diff: {
      zh: '动画里 UTX 是精英私立高中；现实中的 UDX 是一栋 22 层的办公楼，每天有几千人在这里上班，外形也和动画不太一样。',
      en: 'In the anime UTX is an elite private high school; the real UDX is a 22-storey office building where thousands of people work, and its shape differs from the anime.',
    },
    story: {
      zh: 'UDX 2 楼的 Akiba Square 至今仍常办 LoveLive! 系列活动，例如 2026 年 2 月纪念系列 15 周年的「ラブカ感謝祭」。',
      en: 'UDX’s 2nd-floor Akiba Square still regularly hosts Love Live! events, such as the series’ 15th-anniversary “Loveca Kanshasai” in Feb 2026.',
    },
    fact: {
      zh: '现实中的大屏幕约 6.7 m × 11.5 m，每天早 8 点到晚 11 点播放。',
      en: 'The real screen is about 6.7 m × 11.5 m and runs from 8 am to 11 pm.',
    },
    sources: [
      { label: 'AKIHABARA BASECAMP', url: 'https://akihabara-bc.jp/lovelive-seichi/' },
      { label: 'LIVE BOARD', url: 'https://liveboard.co.jp/screen/001530.html' },
      { label: 'akihabaraevent.com', url: 'https://www.akihabaraevent.com/loveca-kanshasai-2026/' },
    ],
    trailer: { videoId: 't_lkr985xoQ', t: 40 },
  },
  'shinjuku-tenki': {
    diff: {
      zh: '画面正中那栋网格外壳的「茧」是 Mode 学园 Cocoon Tower：地上 50 层，里面不是办公室，而是东京 Mode 学园、HAL 东京等几所专门学校。',
      en: 'The lattice “cocoon” in the middle is Mode Gakuen Cocoon Tower: 50 floors that house vocational schools such as Tokyo Mode Gakuen and HAL Tokyo, not offices.',
    },
    story: {
      zh: '电影里，这片高楼是帆高、阳菜、凪三人开始「晴女生意」后的日常背景。从都厅到凯悦酒店之间的天桥上往新宿站方向看，就是片中的同一角度。',
      en: 'In the film these towers frame Hodaka, Hina and Nagi’s days after starting their “sunshine girl” business. Look towards Shinjuku Station from the footbridge between the Government Building and Hyatt Regency for the same angle.',
    },
    fact: {
      zh: '旁边的东京都厅 202 米高的展望室免费开放，可以俯瞰整片高楼群。',
      en: 'The Tokyo Metropolitan Government Building next door has a free observatory 202 m up.',
    },
    sources: [
      { label: 'THE GATE', url: 'https://thegate12.com/jp/article/445' },
      { label: 'jpcmap', url: 'https://jpcmap.com/entame/shinkai/tenkinoko_shinjuku' },
      { label: 'LIBERT', url: 'https://libert.co.jp/pilgrimage-guild/weatheringwithyou-pilgrimage/' },
    ],
    trailer: { videoId: 'VGksHFs04Rc', t: 56 },
  },
  'sangubashi-byosoku': {
    diff: {
      zh: '动画里小路两旁开满樱花，现实中小路旁几乎没有樱花——樱花都在旁边的参宫桥公园里。',
      en: 'In the anime the lane is lined with cherry blossoms; in reality there are hardly any along it — they’re inside Sangubashi Park next door.',
    },
    story: {
      zh: '2025 年 10 月，松村北斗主演的真人版电影上映，回到原作的取景地实地拍摄，参宫桥一带又成了巡礼热点。',
      en: 'The live-action film starring Hokuto Matsumura (Oct 2025) shot on location at the original spots, putting Sangubashi back on the pilgrimage map.',
    },
    fact: {
      zh: '附近两个道口别搞混：1 号道口是「明年也能一起看樱花就好了」的约定，结尾两人擦肩而过的是再往南的 3 号道口。',
      en: 'Don’t mix up the two crossings: No. 1 is where Akari hopes they can see the blossoms together next year; the ending’s passing moment is at crossing No. 3, further south.',
    },
    sources: [
      { label: 'travel.co.jp', url: 'https://www.travel.co.jp/guide/matome/7566/' },
      { label: 'anime-pilgrimage.com', url: 'https://anime-pilgrimage.com/five-centimeters-per-second/' },
      { label: 'Yatsugatake Information Wall', url: 'https://yatsugatake.info/?p=5206' },
    ],
    trailer: { videoId: '1X95eE2fwuc', t: 17 },
  },
}
