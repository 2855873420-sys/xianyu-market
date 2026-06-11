// ===== 共享数据层 - localStorage 持久化 =====
const STORAGE_KEY = 'xianyu_products';

const SAMPLE_PRODUCTS = [
    { id: 1, title: "iPhone 14 Pro Max 256GB 暗紫色", category: "数码", price: 5999, condition: "九成新", desc: "去年买的手机，一直戴壳使用，屏幕无划痕，电池健康度92%。配件齐全。", seller: "小王数码", contact: "138****8888", image: "📱", date: "2026-06-10" },
    { id: 2, title: "MacBook Air M2 8+256 午夜色", category: "数码", price: 6800, condition: "九五新", desc: "2025年购入，主要用于学习和轻度办公，循环充电仅80次。", seller: "数码达人Leo", contact: "WeChat: leo_digital", image: "💻", date: "2026-06-09" },
    { id: 3, title: "索尼PS5光驱版+两个手柄", category: "数码", price: 2800, condition: "八成新", desc: "主机+两个原装手柄+三款实体游戏。功能一切正常。", seller: "游戏宅小李", contact: "139****6666", image: "🎮", date: "2026-06-08" },
    { id: 4, title: "戴森V15无线吸尘器 全套配件", category: "家电", price: 2200, condition: "九成新", desc: "使用半年左右，吸力强劲如新。包含全套吸头。", seller: "居家好物推荐", contact: "150****3333", image: "🧹", date: "2026-06-07" },
    { id: 5, title: "Nike Air Jordan 1 Low 熊猫配色 42码", category: "服饰", price: 580, condition: "九成新", desc: "只穿过三次，正品保证，支持鉴定。买小了半码。", seller: "潮鞋控", contact: "186****7777", image: "👟", date: "2026-06-05" },
    { id: 6, title: "《三体》全集 精装版 刘慈欣", category: "图书", price: 68, condition: "九成新", desc: "读过一遍，保存完好，精装硬壳版带书盒。", seller: "书虫小林", contact: "137****2222", image: "📖", date: "2026-06-04" },
    { id: 7, title: "小米空气净化器4 Pro", category: "家电", price: 850, condition: "八成新", desc: "使用一年多，滤芯还有40%寿命，支持米家App。", seller: "搬家中清仓", contact: "182****5555", image: "🌬️", date: "2026-06-03" },
    { id: 8, title: "任天堂Switch OLED 白色 + 塞尔达", category: "数码", price: 1700, condition: "九五新", desc: "几乎全新OLED版，含底座、Joy-Con。附送塞尔达卡带。", seller: "任饭小陈", contact: "158****9999", image: "🎰", date: "2026-06-02" },
    { id: 9, title: "人体工学椅 Ergomax Evolution", category: "家电", price: 1500, condition: "八成新", desc: "高端人体工学椅，网布坐垫透气舒适，需自提。", seller: "程序员老张", contact: "176****1111", image: "💺", date: "2026-05-30" },
    { id: 10, title: "婴儿推车 Bugaboo Bee6 黑色", category: "母婴", price: 2600, condition: "八五新", desc: "宝宝长大换轻便型，避震超好，含雨罩蚊帐等配件。", seller: "宝妈莉莉", contact: "WeChat: lily_mom", image: "👶", date: "2026-05-29" },
    { id: 11, title: "哑铃套装 20kg可调节 一对", category: "运动", price: 180, condition: "八成新", desc: "在家健身用，铸铁材质。需自提，比较重。", seller: "健身爱好者", contact: "135****8888", image: "🏋️", date: "2026-05-27" },
    { id: 12, title: "乐高 哈利波特霍格沃茨城堡 71043", category: "其他", price: 1999, condition: "九成新", desc: "拼好后一直放展示柜，无缺件。6020块超震撼收藏品。", seller: "乐高控Max", contact: "189****3333", image: "🏰", date: "2026-05-26" }
];

function loadProducts() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) { return JSON.parse(data); }
    } catch (e) {}
    saveProducts(SAMPLE_PRODUCTS);
    return SAMPLE_PRODUCTS;
}

function saveProducts(products) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function getNextId(products) {
    if (products.length === 0) return 1;
    return Math.max(...products.map(p => p.id)) + 1;
}

let PRODUCTS = loadProducts();
let nextId = getNextId(PRODUCTS);
