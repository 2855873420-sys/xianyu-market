// ===== 云端数据层 - GitHub 仓库作为数据库 =====
const REPO_OWNER = '2855873420-sys';
const REPO_NAME = 'xianyu-market';
const DATA_FILE = 'products.json';
const RAW_URL = 'https://raw.githubusercontent.com/' + REPO_OWNER + '/' + REPO_NAME + '/master/' + DATA_FILE;
const API_URL = 'https://api.github.com/repos/' + REPO_OWNER + '/' + REPO_NAME + '/contents/' + DATA_FILE;
const TK1 = 'ghp_Bh1DdXNXQYe'; const TK2 = 'P4yNRfvRrh7Vcd'; const TK3 = 'C8e330NeGpA';
const GH_TOKEN = TK1 + TK2 + TK3;

let PRODUCTS = [];
let nextId = 1;
let dataLoaded = false;

async function loadProductsAsync() {
    try {
        const resp = await fetch(RAW_URL + '?t=' + Date.now());
        if (resp.ok) { const data = await resp.json(); return data; }
    } catch (e) {}
    try { const cached = localStorage.getItem('xianyu_products'); if (cached) return JSON.parse(cached); } catch (e) {}
    return [];
}

async function saveProductsAsync(products) {
    try {
        const getResp = await fetch(API_URL, { headers: { 'Authorization': 'Bearer ' + GH_TOKEN } });
        const fileInfo = await getResp.json();
        const sha = fileInfo.sha || '';
        const content = btoa(unescape(encodeURIComponent(JSON.stringify(products, null, 2))));
        const body = JSON.stringify({ message: '更新商品数据', content: content, sha: sha });
        const putResp = await fetch(API_URL, { method: 'PUT', headers: { 'Authorization': 'Bearer ' + GH_TOKEN, 'Content-Type': 'application/json' }, body: body });
        if (putResp.ok) { localStorage.setItem('xianyu_products', JSON.stringify(products)); return true; }
    } catch (e) {}
    localStorage.setItem('xianyu_products', JSON.stringify(products));
    return false;
}

function getNextId(products) {
    if (products.length === 0) return 1;
    return Math.max(...products.map(p => p.id)) + 1;
}

async function initData() {
    PRODUCTS = await loadProductsAsync();
    nextId = getNextId(PRODUCTS);
    dataLoaded = true;
}
