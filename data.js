// ===== 云端数据层 - GitHub 仓库作为数据库 =====
const REPO_OWNER = '2855873420-sys';
const REPO_NAME = 'xianyu-market';
const DATA_FILE = 'products.json';
const RAW_URL = 'https://raw.githubusercontent.com/' + REPO_OWNER + '/' + REPO_NAME + '/master/' + DATA_FILE;
const API_URL = 'https://api.github.com/repos/' + REPO_OWNER + '/' + REPO_NAME + '/contents/' + DATA_FILE;

let PRODUCTS = [];
let nextId = 1;
let dataLoaded = false;

// 获取 Token（从 sessionStorage，没有则提示输入）
function getToken() {
    let token = sessionStorage.getItem('gh_sync_token');
    if (!token) {
        token = prompt('首次使用需要 GitHub Token 来同步数据：\n\n请输入你的 Token（以 ghp_ 开头）：');
        if (token) sessionStorage.setItem('gh_sync_token', token.trim());
    }
    return token;
}

// 加载商品（优先云端，失败则用本地缓存）
async function loadProductsAsync() {
    try {
        const resp = await fetch(RAW_URL + '?t=' + Date.now());
        if (resp.ok) {
            const data = await resp.json();
            return data;
        }
    } catch (e) {}
    try {
        const cached = localStorage.getItem('xianyu_products');
        if (cached) return JSON.parse(cached);
    } catch (e) {}
    return [];
}

// 保存商品到云端
async function saveProductsAsync(products) {
    const token = getToken();
    if (!token) {
        localStorage.setItem('xianyu_products', JSON.stringify(products));
        return false;
    }
    try {
        const getResp = await fetch(API_URL, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const fileInfo = await getResp.json();
        const sha = fileInfo.sha || '';

        const content = btoa(unescape(encodeURIComponent(JSON.stringify(products, null, 2))));
        const body = JSON.stringify({ message: '更新商品数据', content: content, sha: sha });

        const putResp = await fetch(API_URL, {
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
            body: body
        });

        if (putResp.ok) {
            localStorage.setItem('xianyu_products', JSON.stringify(products));
            return true;
        }
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
