export const DEFAULT_LOCALE = "en";
export const SUPPORTED_LOCALES = ["en", "zh", "ja", "ko"];

const STORAGE_KEY = "ysl-atlas-locale";

export const LOCALE_LABELS = {
  en: "English",
  zh: "简体中文",
  ja: "日本語",
  ko: "한국어",
};

const UI_COPY = {
  en: {
    documentTitle: "Yellowstone Sound Atlas - Specimen Stamps",
    siteLabel: "Yellowstone Sound Atlas",
    fieldNote: "FIELD NOTE",
    loadingTitle: "Loading...",
    routeSpecimen: "Route specimen",
    loadingDescription: "Loading the first Yellowstone sound specimen.",
    shareDock: "Share current field note",
    shareInstagram: "Share through device sheet for Instagram",
    shareInstagramTitle: "Instagram / system share",
    postToX: "Post this specimen to X",
    postToXTitle: "Post to X",
    copyLink: "Copy specimen link",
    copyLinkTitle: "Copy link",
    copied: "Specimen link copied.",
    copyUnavailable: "Copy unavailable in this browser.",
    instagramCopied: "Link copied for Instagram.",
    shareUnavailableCopied: "Share unavailable. Link copied.",
    minimize: "Minimize player",
    expand: "Expand player",
    play: "Play",
    pause: "Pause",
    previous: "Previous stop",
    next: "Next stop",
    audioControls: "Audio controls",
    playbackPosition: "Playback position",
    source: "National Park Service source",
    archive: "Specimen archive",
    volume: "VOL 61",
    stripLabel: "Theme specimen navigation",
    themeTabs: "Specimen themes",
    themeSpecimens: "Theme specimens",
    archiveSlipSummary: "Open project archive slip",
    archiveSlip: "Archive slip",
    archiveCardLabel: "Project colophon",
    colophon: "COLOPHON",
    archiveTitle: "Yellowstone Sound Atlas",
    archiveBody: "A static listening route built from the public Yellowstone Sound Library, arranged as specimen stamps and field notes.",
    repository: "Repository",
    fullArchive: "Full archive",
    sourceLabel: "Source",
    archiveFine:
      "Not an official National Park Service product. NPS labels these audio files as public domain, but users should verify third-party rights for their own use. If a file should be removed, open an issue.",
    github: "GitHub",
    webArchive: "Web Archive",
    nationalParkService: "National Park Service",
    statusLoaded: (count) => `${count} sound specimens loaded`,
    routeLoadFailed: "Unable to load route",
    autoPlayFailed: "Playback could not start automatically.",
    audioUnavailable: "Audio unavailable for this specimen.",
    language: "Language",
    chooseLanguage: "Choose language",
    languageOption: (name) => `Show atlas in ${name}`,
    selectTheme: (theme, count) => `${theme}, ${count} specimens`,
    selectStop: (title) => `Select ${title}`,
    timeCurrent: "Current time",
    timeTotal: "Total time",
    keyboardSpace: "Play/Pause",
    keyboardPrev: "Prev",
    keyboardNext: "Next",
    keyboardMinimize: "Minimize",
    noScript: "This experience requires JavaScript to load the sound specimens.",
    shareText: (title, theme, time) => `Yellowstone Sound Atlas: ${title} - ${theme}, ${time}.`,
    shareTitle: (title) => `${title} - Yellowstone Sound Atlas`,
    printCaption: (title, theme, time) => `${title} - ${theme} - ${time}`,
    noteMeta: (theme, zone, time) => `${theme} - ${zone} - ${time}`,
    eyebrow: (number) => `YELLOWSTONE - ${number}`,
  },
  zh: {
    documentTitle: "黄石声音图谱 - 标本邮票",
    siteLabel: "黄石声音图谱",
    fieldNote: "野外札记",
    loadingTitle: "加载中...",
    routeSpecimen: "路线标本",
    loadingDescription: "正在载入第一枚黄石声音标本。",
    shareDock: "分享当前野外札记",
    shareInstagram: "通过系统分享面板发送",
    shareInstagramTitle: "Instagram / 系统分享",
    postToX: "发布这枚标本到 X",
    postToXTitle: "发布到 X",
    copyLink: "复制标本链接",
    copyLinkTitle: "复制链接",
    copied: "标本链接已复制。",
    copyUnavailable: "当前浏览器无法复制。",
    instagramCopied: "已复制可用于 Instagram 的链接。",
    shareUnavailableCopied: "分享不可用，链接已复制。",
    minimize: "收起播放器",
    expand: "展开播放器",
    play: "播放",
    pause: "暂停",
    previous: "上一个站点",
    next: "下一个站点",
    audioControls: "音频控件",
    playbackPosition: "播放位置",
    source: "National Park Service 来源",
    archive: "标本档案",
    volume: "第 61 卷",
    stripLabel: "主题标本导航",
    themeTabs: "标本主题",
    themeSpecimens: "主题标本",
    archiveSlipSummary: "打开项目档案签",
    archiveSlip: "档案签",
    archiveCardLabel: "项目题跋",
    colophon: "题跋",
    archiveTitle: "黄石声音图谱",
    archiveBody: "一个静态聆听路线，取材自黄石公共声音库，并以标本邮票与野外札记的方式编排。",
    repository: "仓库",
    fullArchive: "完整归档",
    sourceLabel: "来源",
    archiveFine:
      "这不是 National Park Service 官方产品。NPS 将这些音频标记为公共领域，但使用者仍应自行核实第三方权利。如需移除文件，请提交 issue。",
    github: "GitHub",
    webArchive: "Web Archive",
    nationalParkService: "National Park Service",
    statusLoaded: (count) => `已加载 ${count} 枚声音标本`,
    routeLoadFailed: "无法加载路线",
    autoPlayFailed: "无法自动开始播放。",
    audioUnavailable: "这枚标本的音频暂不可用。",
    language: "语言",
    chooseLanguage: "选择语言",
    languageOption: (name) => `切换为${name}`,
    selectTheme: (theme, count) => `${theme}，${count} 枚标本`,
    selectStop: (title) => `选择${title}`,
    timeCurrent: "当前时间",
    timeTotal: "总时长",
    keyboardSpace: "播放/暂停",
    keyboardPrev: "上一个",
    keyboardNext: "下一个",
    keyboardMinimize: "收起",
    noScript: "此体验需要 JavaScript 来加载声音标本。",
    shareText: (title, theme, time) => `黄石声音图谱：${title} - ${theme}，${time}。`,
    shareTitle: (title) => `${title} - 黄石声音图谱`,
    printCaption: (title, theme, time) => `${title} - ${theme} - ${time}`,
    noteMeta: (theme, zone, time) => `${theme} - ${zone} - ${time}`,
    eyebrow: (number) => `黄石 - ${number}`,
  },
  ja: {
    documentTitle: "イエローストーン・サウンドアトラス - 標本切手",
    siteLabel: "イエローストーン・サウンドアトラス",
    fieldNote: "フィールドノート",
    loadingTitle: "読み込み中...",
    routeSpecimen: "ルート標本",
    loadingDescription: "最初のイエローストーン音標本を読み込んでいます。",
    shareDock: "現在のフィールドノートを共有",
    shareInstagram: "デバイスの共有シートで送信",
    shareInstagramTitle: "Instagram / システム共有",
    postToX: "この標本を X に投稿",
    postToXTitle: "X に投稿",
    copyLink: "標本リンクをコピー",
    copyLinkTitle: "リンクをコピー",
    copied: "標本リンクをコピーしました。",
    copyUnavailable: "このブラウザではコピーできません。",
    instagramCopied: "Instagram 用のリンクをコピーしました。",
    shareUnavailableCopied: "共有できません。リンクをコピーしました。",
    minimize: "プレイヤーを縮小",
    expand: "プレイヤーを展開",
    play: "再生",
    pause: "一時停止",
    previous: "前の地点",
    next: "次の地点",
    audioControls: "音声コントロール",
    playbackPosition: "再生位置",
    source: "National Park Service ソース",
    archive: "標本アーカイブ",
    volume: "VOL 61",
    stripLabel: "テーマ標本ナビゲーション",
    themeTabs: "標本テーマ",
    themeSpecimens: "テーマ標本",
    archiveSlipSummary: "プロジェクトのアーカイブ票を開く",
    archiveSlip: "アーカイブ票",
    archiveCardLabel: "プロジェクト奥付",
    colophon: "奥付",
    archiveTitle: "イエローストーン・サウンドアトラス",
    archiveBody: "イエローストーン公開音源ライブラリをもとに、標本切手とフィールドノートとして編成した静的なリスニングルートです。",
    repository: "リポジトリ",
    fullArchive: "完全アーカイブ",
    sourceLabel: "ソース",
    archiveFine:
      "これは National Park Service の公式製品ではありません。NPS はこれらの音声をパブリックドメインとしていますが、利用者は第三者権利を各自確認してください。削除が必要なファイルがあれば issue を開いてください。",
    github: "GitHub",
    webArchive: "Web Archive",
    nationalParkService: "National Park Service",
    statusLoaded: (count) => `${count}件の音標本を読み込みました`,
    routeLoadFailed: "ルートを読み込めません",
    autoPlayFailed: "自動再生を開始できませんでした。",
    audioUnavailable: "この標本の音声は利用できません。",
    language: "言語",
    chooseLanguage: "言語を選択",
    languageOption: (name) => `${name}で表示`,
    selectTheme: (theme, count) => `${theme}、${count}件の標本`,
    selectStop: (title) => `${title}を選択`,
    timeCurrent: "現在の時間",
    timeTotal: "合計時間",
    keyboardSpace: "再生/一時停止",
    keyboardPrev: "前へ",
    keyboardNext: "次へ",
    keyboardMinimize: "縮小",
    noScript: "この体験で音標本を読み込むには JavaScript が必要です。",
    shareText: (title, theme, time) => `イエローストーン・サウンドアトラス：${title} - ${theme}、${time}。`,
    shareTitle: (title) => `${title} - イエローストーン・サウンドアトラス`,
    printCaption: (title, theme, time) => `${title} - ${theme} - ${time}`,
    noteMeta: (theme, zone, time) => `${theme} - ${zone} - ${time}`,
    eyebrow: (number) => `イエローストーン - ${number}`,
  },
  ko: {
    documentTitle: "옐로스톤 사운드 아틀라스 - 표본 우표",
    siteLabel: "옐로스톤 사운드 아틀라스",
    fieldNote: "필드 노트",
    loadingTitle: "불러오는 중...",
    routeSpecimen: "루트 표본",
    loadingDescription: "첫 번째 옐로스톤 사운드 표본을 불러오는 중입니다.",
    shareDock: "현재 필드 노트 공유",
    shareInstagram: "기기 공유 시트로 보내기",
    shareInstagramTitle: "Instagram / 시스템 공유",
    postToX: "이 표본을 X에 게시",
    postToXTitle: "X에 게시",
    copyLink: "표본 링크 복사",
    copyLinkTitle: "링크 복사",
    copied: "표본 링크를 복사했습니다.",
    copyUnavailable: "이 브라우저에서는 복사할 수 없습니다.",
    instagramCopied: "Instagram용 링크를 복사했습니다.",
    shareUnavailableCopied: "공유할 수 없어 링크를 복사했습니다.",
    minimize: "플레이어 접기",
    expand: "플레이어 펼치기",
    play: "재생",
    pause: "일시정지",
    previous: "이전 지점",
    next: "다음 지점",
    audioControls: "오디오 컨트롤",
    playbackPosition: "재생 위치",
    source: "National Park Service 출처",
    archive: "표본 아카이브",
    volume: "VOL 61",
    stripLabel: "테마 표본 내비게이션",
    themeTabs: "표본 테마",
    themeSpecimens: "테마 표본",
    archiveSlipSummary: "프로젝트 아카이브 슬립 열기",
    archiveSlip: "아카이브 슬립",
    archiveCardLabel: "프로젝트 콜로폰",
    colophon: "콜로폰",
    archiveTitle: "옐로스톤 사운드 아틀라스",
    archiveBody: "옐로스톤 공개 사운드 라이브러리를 바탕으로 표본 우표와 필드 노트로 구성한 정적 청취 루트입니다.",
    repository: "저장소",
    fullArchive: "전체 아카이브",
    sourceLabel: "출처",
    archiveFine:
      "이것은 National Park Service 공식 제품이 아닙니다. NPS는 이 오디오를 퍼블릭 도메인으로 표시하지만, 사용자는 제3자 권리를 직접 확인해야 합니다. 제거가 필요한 파일은 issue를 열어 주세요.",
    github: "GitHub",
    webArchive: "Web Archive",
    nationalParkService: "National Park Service",
    statusLoaded: (count) => `${count}개 사운드 표본을 불러왔습니다`,
    routeLoadFailed: "루트를 불러올 수 없습니다",
    autoPlayFailed: "자동 재생을 시작할 수 없습니다.",
    audioUnavailable: "이 표본의 오디오를 사용할 수 없습니다.",
    language: "언어",
    chooseLanguage: "언어 선택",
    languageOption: (name) => `${name}로 보기`,
    selectTheme: (theme, count) => `${theme}, 표본 ${count}개`,
    selectStop: (title) => `${title} 선택`,
    timeCurrent: "현재 시간",
    timeTotal: "전체 시간",
    keyboardSpace: "재생/일시정지",
    keyboardPrev: "이전",
    keyboardNext: "다음",
    keyboardMinimize: "접기",
    noScript: "이 경험에서 사운드 표본을 불러오려면 JavaScript가 필요합니다.",
    shareText: (title, theme, time) => `옐로스톤 사운드 아틀라스: ${title} - ${theme}, ${time}.`,
    shareTitle: (title) => `${title} - 옐로스톤 사운드 아틀라스`,
    printCaption: (title, theme, time) => `${title} - ${theme} - ${time}`,
    noteMeta: (theme, zone, time) => `${theme} - ${zone} - ${time}`,
    eyebrow: (number) => `옐로스톤 - ${number}`,
  },
};

const THEMES = {
  Thermal: { zh: "地热", ja: "地熱", ko: "지열" },
  Birds: { zh: "鸟类", ja: "鳥", ko: "새" },
  Wildlife: { zh: "野生动物", ja: "野生動物", ko: "야생동물" },
  Human: { zh: "人文", ja: "人の営み", ko: "사람의 흔적" },
  Weather: { zh: "天气", ja: "天候", ko: "날씨" },
  Ambient: { zh: "环境", ja: "環境音", ko: "환경음" },
  Water: { zh: "水域", ja: "水", ko: "물" },
};

const TIMES = {
  Dawn: { zh: "黎明", ja: "夜明け", ko: "새벽" },
  Morning: { zh: "上午", ja: "朝", ko: "아침" },
  Midday: { zh: "正午", ja: "昼", ko: "한낮" },
  Afternoon: { zh: "下午", ja: "午後", ko: "오후" },
  "Late Afternoon": { zh: "午后稍晚", ja: "午後遅く", ko: "늦은 오후" },
  Dusk: { zh: "黄昏", ja: "夕暮れ", ko: "해질녘" },
  Evening: { zh: "傍晚", ja: "夕方", ko: "저녁" },
  Night: { zh: "夜晚", ja: "夜", ko: "밤" },
};

const ZONES = {
  "Alpine meadow": { zh: "高山草甸", ja: "高山草地", ko: "고산 초원" },
  "Black Sand Basin": { zh: "黑沙盆地", ja: "ブラックサンド・ベイスン", ko: "블랙 샌드 베이슨" },
  "Canyon rim": { zh: "峡谷边缘", ja: "峡谷の縁", ko: "협곡 가장자리" },
  "Cottonwood canopy": { zh: "三角叶杨树冠", ja: "コットンウッドの樹冠", ko: "미루나무 수관" },
  "Deciduous forest": { zh: "落叶林", ja: "落葉樹林", ko: "낙엽수림" },
  "Evening meadow": { zh: "傍晚草甸", ja: "夕方の草地", ko: "저녁 초원" },
  "Forest edge": { zh: "森林边缘", ja: "森の縁", ko: "숲 가장자리" },
  "Forest fire zone": { zh: "森林火场", ja: "森林火災跡", ko: "산불 지대" },
  "Gibbon Geyser Basin": { zh: "吉本间歇泉盆地", ja: "ギボン・ガイザー・ベイスン", ko: "기번 가이저 베이슨" },
  Grassland: { zh: "草地", ja: "草原", ko: "초원" },
  "Grassland herd": { zh: "草原兽群", ja: "草原の群れ", ko: "초원의 무리" },
  "Gravel bar": { zh: "砾石滩", ja: "砂礫州", ko: "자갈톱" },
  "Historic trail": { zh: "历史步道", ja: "歴史的な道", ko: "역사 길" },
  "Lake shore": { zh: "湖岸", ja: "湖岸", ko: "호숫가" },
  "Lake surface": { zh: "湖面", ja: "湖面", ko: "호수 표면" },
  "Lower Geyser Basin": { zh: "下间歇泉盆地", ja: "ローワー・ガイザー・ベイスン", ko: "로어 가이저 베이슨" },
  "Mammoth Hot Springs": { zh: "猛犸温泉", ja: "マンモス・ホットスプリングス", ko: "매머드 온천" },
  Marshland: { zh: "沼泽地", ja: "湿地", ko: "습지" },
  "Morning chorus": { zh: "清晨合唱", ja: "朝のコーラス", ko: "아침 합창" },
  "Morning soundscape": { zh: "清晨声景", ja: "朝のサウンドスケープ", ko: "아침 사운드스케이프" },
  "Mountain stream": { zh: "山溪", ja: "山の小川", ko: "산속 계류" },
  "Night soundscape": { zh: "夜间声景", ja: "夜のサウンドスケープ", ko: "밤의 사운드스케이프" },
  "Norris Geyser Basin": { zh: "诺里斯间歇泉盆地", ja: "ノリス・ガイザー・ベイスン", ko: "노리스 가이저 베이슨" },
  "Open meadow": { zh: "开阔草甸", ja: "開けた草地", ko: "열린 초원" },
  "Park-wide soundscape": { zh: "公园整体声景", ja: "公園全体のサウンドスケープ", ko: "공원 전역 사운드스케이프" },
  "Pine forest": { zh: "松林", ja: "松林", ko: "소나무 숲" },
  "Pond margin": { zh: "池塘边缘", ja: "池の縁", ko: "연못 가장자리" },
  "Prairie grassland": { zh: "草原", ja: "プレーリー草原", ko: "프레리 초원" },
  "Riverside perch": { zh: "河岸栖枝", ja: "川辺の止まり木", ko: "강가 횃대" },
  "Roaring Mountain": { zh: "咆哮山", ja: "ロアリング・マウンテン", ko: "로어링 마운틴" },
  "Rutting ground": { zh: "发情场", ja: "繁殖期の場所", ko: "발정기 터" },
  "Sagebrush slope": { zh: "鼠尾草坡地", ja: "セージブラシの斜面", ko: "세이지브러시 사면" },
  "Shrub wetland": { zh: "灌丛湿地", ja: "低木湿地", ko: "관목 습지" },
  "Summer storm": { zh: "夏季风暴", ja: "夏の嵐", ko: "여름 폭풍" },
  "Temporary pool": { zh: "临时水池", ja: "一時的な水たまり", ko: "일시적 웅덩이" },
  "Upper Geyser Basin": { zh: "上间歇泉盆地", ja: "アッパー・ガイザー・ベイスン", ko: "어퍼 가이저 베이슨" },
  "Valley floor": { zh: "谷底", ja: "谷底", ko: "계곡 바닥" },
  "Wetland margin": { zh: "湿地边缘", ja: "湿地の縁", ko: "습지 가장자리" },
  "Wetland marsh": { zh: "湿地沼泽", ja: "湿原", ko: "습지 늪" },
  "Wetland meadow": { zh: "湿地草甸", ja: "湿地草原", ko: "습지 초원" },
  "Winter trail": { zh: "冬季小径", ja: "冬の道", ko: "겨울 길" },
  "Yellowstone Lake": { zh: "黄石湖", ja: "イエローストーン湖", ko: "옐로스톤 호수" },
};

const TITLES = {
  "American Coots": { zh: "美洲骨顶鸡", ja: "アメリカオオバン", ko: "아메리카물닭" },
  "American Robin": { zh: "美洲知更鸟", ja: "コマツグミ", ko: "아메리카울새" },
  "Bird Chorus": { zh: "鸟鸣合唱", ja: "鳥の合唱", ko: "새들의 합창" },
  "Common Yellowthroat": { zh: "普通黄喉地莺", ja: "カオグロアメリカムシクイ", ko: "커먼 옐로스로트" },
  "Dawn Chorus": { zh: "黎明合唱", ja: "夜明けの合唱", ko: "새벽 합창" },
  "Red Fox": { zh: "赤狐", ja: "アカギツネ", ko: "붉은여우" },
  "Red-Winged Blackbird": { zh: "红翅黑鹂", ja: "ハゴロモガラス", ko: "붉은날개검은새" },
  "Sandhill Crane": { zh: "沙丘鹤", ja: "カナダヅル", ko: "캐나다두루미" },
  Soundscapes: { zh: "声景", ja: "サウンドスケープ", ko: "사운드스케이프" },
  "American Dipper": { zh: "美洲河乌", ja: "アメリカカワガラス", ko: "아메리카물까마귀" },
  "Bald Eagle": { zh: "白头海雕", ja: "ハクトウワシ", ko: "흰머리수리" },
  "Canada Goose": { zh: "加拿大雁", ja: "カナダガン", ko: "캐나다기러기" },
  "Clark's Nutcracker": { zh: "克拉克星鸦", ja: "ハイイロホシガラス", ko: "클라크호시까마귀" },
  "Common Raven": { zh: "渡鸦", ja: "ワタリガラス", ko: "큰까마귀" },
  Killdeer: { zh: "双领鸻", ja: "フタオビチドリ", ko: "킬디어" },
  "Mountain Bluebird": { zh: "山蓝鸲", ja: "ムジルリツグミ", ko: "마운틴 블루버드" },
  "Red Squirrel": { zh: "红松鼠", ja: "アカリス", ko: "붉은다람쥐" },
  "Ruffed Grouse": { zh: "披肩榛鸡", ja: "エリマキライチョウ", ko: "목도리뇌조" },
  "Savannah Sparrow": { zh: "萨凡纳鹀", ja: "クサチヒメドリ", ko: "사바나참새" },
  Snowmobile: { zh: "雪地摩托", ja: "スノーモービル", ko: "스노모빌" },
  "Townsend's Solitaire": { zh: "汤氏孤鸫", ja: "タウンゼントハエトリツグミ", ko: "타운센드솔리테어" },
  "Uinta Ground Squirrel": { zh: "尤因塔地松鼠", ja: "ユインタジリス", ko: "유인타땅다람쥐" },
  "Warbling Vireo": { zh: "鸣绿鹃", ja: "サエズリモズモドキ", ko: "노래비레오" },
  "Western Meadow Lark": { zh: "西部草地鹨", ja: "ニシマキバドリ", ko: "서부초원종다리" },
  "Anemone Geyser": { zh: "海葵间歇泉", ja: "アネモネ・ガイザー", ko: "아네모네 간헐천" },
  "Anemone Geysers": { zh: "海葵间歇泉群", ja: "アネモネ・ガイザー群", ko: "아네모네 간헐천군" },
  "Artist Paint Pots": { zh: "艺术家彩泥锅", ja: "アーティスト・ペイントポット", ko: "아티스트 페인트 팟" },
  "Beehive Geyser": { zh: "蜂巢间歇泉", ja: "ビーハイブ・ガイザー", ko: "비하이브 간헐천" },
  "Beryl Spring": { zh: "绿柱石泉", ja: "ベリル・スプリング", ko: "베릴 스프링" },
  "Bison Eating": { zh: "野牛进食", ja: "バイソンの採食", ko: "먹이를 먹는 들소" },
  "Castle Geyser": { zh: "城堡间歇泉", ja: "キャッスル・ガイザー", ko: "캐슬 간헐천" },
  "Cliff Geyser": { zh: "悬崖间歇泉", ja: "クリフ・ガイザー", ko: "클리프 간헐천" },
  "Ear Spring": { zh: "耳泉", ja: "イヤー・スプリング", ko: "이어 스프링" },
  "Fountain Paint Pot": { zh: "喷泉彩泥锅", ja: "ファウンテン・ペイントポット", ko: "파운틴 페인트 팟" },
  "Grand Geyser": { zh: "大间歇泉", ja: "グランド・ガイザー", ko: "그랜드 간헐천" },
  "Horse-Drawn Wagon": { zh: "马拉车", ja: "馬車", ko: "말이 끄는 마차" },
  "Old Faithful Geyser": { zh: "老忠实间歇泉", ja: "オールド・フェイスフル・ガイザー", ko: "올드 페이스풀 간헐천" },
  "Puff 'n Stuff Geyser": { zh: "Puff 'n Stuff 间歇泉", ja: "パフンスタッフ・ガイザー", ko: "퍼프 앤 스터프 간헐천" },
  "Sawmill Geyser": { zh: "锯木厂间歇泉", ja: "ソーミル・ガイザー", ko: "소밀 간헐천" },
  "Spouter Geyser": { zh: "喷涌间歇泉", ja: "スパウター・ガイザー", ko: "스파우터 간헐천" },
  "Veteran Geyser": { zh: "老兵间歇泉", ja: "ベテラン・ガイザー", ko: "베테랑 간헐천" },
  "Vixen Geyser": { zh: "雌狐间歇泉", ja: "ヴィクセン・ガイザー", ko: "빅슨 간헐천" },
  "Black Growler Steam Vent": { zh: "黑咆哮蒸汽孔", ja: "ブラック・グラウラー蒸気孔", ko: "블랙 그라울러 증기공" },
  "Black Sand Pool": { zh: "黑沙池", ja: "ブラックサンド・プール", ko: "블랙 샌드 풀" },
  Fire: { zh: "火", ja: "火", ko: "불" },
  Fumaroles: { zh: "喷气孔", ja: "噴気孔", ko: "분기공" },
  "Hurricane Vent": { zh: "飓风喷气孔", ja: "ハリケーン・ベント", ko: "허리케인 벤트" },
  "Scissors Springs": { zh: "剪刀泉", ja: "シザーズ・スプリングス", ko: "시저스 스프링스" },
  "The Dragon's Mouth": { zh: "龙口泉", ja: "ドラゴンズ・マウス", ko: "드래곤스 마우스" },
  Thunder: { zh: "雷声", ja: "雷", ko: "천둥" },
  "Bison Rut": { zh: "野牛发情季", ja: "バイソンの繁殖期", ko: "들소 발정기" },
  "Common Loon": { zh: "普通潜鸟", ja: "ハシグロアビ", ko: "큰회색머리아비" },
  "Singing Lake": { zh: "歌唱之湖", ja: "歌う湖", ko: "노래하는 호수" },
  "Boreal Chorus Frogs": { zh: "北方合唱蛙", ja: "ボリアルコーラスガエル", ko: "북방합창개구리" },
  Elk: { zh: "麋鹿", ja: "エルク", ko: "엘크" },
  "Wilson's Snipe": { zh: "威尔逊沙锥", ja: "ウィルソンタシギ", ko: "윌슨도요" },
  Coyotes: { zh: "郊狼", ja: "コヨーテ", ko: "코요테" },
  "Spadefoot Toad": { zh: "铲足蟾", ja: "スキアシガエル", ko: "삽발두꺼비" },
  Wolves: { zh: "狼群", ja: "オオカミ", ko: "늑대" },
};

function lookup(table, value, locale) {
  if (locale === DEFAULT_LOCALE) return value;
  return table[value]?.[locale] || value;
}

function templateDescription(stop, locale, title, theme, zone) {
  if (locale === "zh") {
    if (stop.theme === "Thermal") return `${title}把地热、蒸汽与地下压力带入${zone}的声场。`;
    if (stop.theme === "Birds") return `${title}的鸣声在${zone}展开，标记这条黄石路线的时间层次。`;
    if (stop.theme === "Wildlife") return `${title}穿过${zone}，让野生动物的距离与方向变得可听见。`;
    if (stop.theme === "Water") return `${title}把水面与岸线的空气带进这枚声音标本。`;
    if (stop.theme === "Weather") return `${title}记录天气经过黄石地形时留下的声压与回响。`;
    if (stop.theme === "Human") return `${title}保留了人在黄石景观中移动时留下的声音痕迹。`;
    return `${title}记录了${zone}里不断变化的黄石环境声。`;
  }
  if (locale === "ja") {
    if (stop.theme === "Thermal") return `${title}は、地熱、蒸気、地下の圧力を${zone}の音風景へ引き込みます。`;
    if (stop.theme === "Birds") return `${title}の声が${zone}に広がり、このルートの時間の層を示します。`;
    if (stop.theme === "Wildlife") return `${title}が${zone}を横切り、野生動物との距離と方向を聞こえるものにします。`;
    if (stop.theme === "Water") return `${title}は、水面と岸辺の空気をこの音標本に運び込みます。`;
    if (stop.theme === "Weather") return `${title}は、天候が地形を通るときの圧力と反響を記録します。`;
    if (stop.theme === "Human") return `${title}は、人がイエローストーンを移動するときの音の痕跡を残します。`;
    return `${title}は、${zone}で変化し続ける環境音を記録します。`;
  }
  if (locale === "ko") {
    if (stop.theme === "Thermal") return `${title}는 지열, 증기, 지하 압력을 ${zone}의 소리 풍경으로 끌어옵니다.`;
    if (stop.theme === "Birds") return `${title}의 소리가 ${zone}에 퍼지며 이 루트의 시간 층을 드러냅니다.`;
    if (stop.theme === "Wildlife") return `${title}가 ${zone}을 지나며 야생동물과의 거리와 방향을 들리게 합니다.`;
    if (stop.theme === "Water") return `${title}는 수면과 물가의 공기를 이 사운드 표본에 담습니다.`;
    if (stop.theme === "Weather") return `${title}는 날씨가 옐로스톤 지형을 지날 때의 압력과 울림을 기록합니다.`;
    if (stop.theme === "Human") return `${title}는 사람이 옐로스톤 풍경 속을 이동하며 남긴 소리의 흔적을 보존합니다.`;
    return `${title}는 ${zone}에서 계속 변하는 옐로스톤의 환경음을 기록합니다.`;
  }
  return stop.description;
}

function templateFieldNote(stop, locale, title, theme, zone, time) {
  if (locale === DEFAULT_LOCALE) return stop.fieldNote || stop.description;
  if (locale === "zh") return `${time}，${title}把${theme}的质地压进${zone}。这枚标本不解释景观，而是让它以声音显影。`;
  if (locale === "ja") return `${time}、${title}は${theme}の質感を${zone}に刻みます。この標本は景観を説明するのではなく、音として立ち上げます。`;
  if (locale === "ko") return `${time}, ${title}는 ${theme}의 결을 ${zone}에 새깁니다. 이 표본은 풍경을 설명하기보다 소리로 드러냅니다.`;
  return stop.fieldNote || stop.description;
}

export function normalizeLocale(locale) {
  return SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
}

export function localeFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const requested = normalizeLocale(params.get("lang"));
  if (requested !== DEFAULT_LOCALE || params.has("lang")) return requested;

  try {
    return normalizeLocale(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return DEFAULT_LOCALE;
  }
}

export function setStoredLocale(locale) {
  try {
    window.localStorage.setItem(STORAGE_KEY, normalizeLocale(locale));
  } catch {
    // Locale persistence is a progressive enhancement.
  }
}

export function uiText(locale) {
  return UI_COPY[normalizeLocale(locale)] || UI_COPY[DEFAULT_LOCALE];
}

export function localizeStop(stop, locale) {
  const normalized = normalizeLocale(locale);
  const title = lookup(TITLES, stop.title, normalized);
  const theme = lookup(THEMES, stop.theme, normalized);
  const timeOfDay = lookup(TIMES, stop.timeOfDay, normalized);
  const zoneLabel = lookup(ZONES, stop.zoneLabel, normalized);

  return {
    ...stop,
    sourceTitle: stop.title,
    sourceTheme: stop.theme,
    title,
    theme,
    timeOfDay,
    zoneLabel,
    description: templateDescription(stop, normalized, title, theme, zoneLabel),
    fieldNote: templateFieldNote(stop, normalized, title, theme, zoneLabel, timeOfDay),
    credit: localizedCredit(stop, normalized),
  };
}

export function localizeThemeName(theme, locale) {
  return lookup(THEMES, theme, normalizeLocale(locale));
}

export function localizeTimeLabel(timeOfDay, locale) {
  return lookup(TIMES, timeOfDay, normalizeLocale(locale));
}

export function localizedCredit(stop, locale) {
  const hasImage = Boolean(stop.imagePath);
  if (locale === "zh") return hasImage ? "音频与图像由 National Park Service 提供。" : "音频由 National Park Service 提供。";
  if (locale === "ja") return hasImage ? "音声と画像は National Park Service 提供。" : "音声は National Park Service 提供。";
  if (locale === "ko") return hasImage ? "오디오와 이미지는 National Park Service 제공." : "오디오는 National Park Service 제공.";
  if (hasImage) return stop.credit;
  return stop.credit.replace("Audio and image", "Audio");
}

export function shareText(stop, locale) {
  const copy = uiText(locale);
  const localized = localizeStop(stop, locale);
  return copy.shareText(localized.title, localized.theme, localized.timeOfDay);
}

export function shareHashtags(locale) {
  if (locale === "zh") return "Yellowstone,黄石,Soundscape";
  if (locale === "ja") return "Yellowstone,イエローストーン,Soundscape";
  if (locale === "ko") return "Yellowstone,옐로스톤,Soundscape";
  return "Yellowstone,Soundscape";
}
