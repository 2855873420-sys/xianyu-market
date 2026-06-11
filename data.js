// ===== 共享数据层 - localStorage 持久化 =====
const STORAGE_KEY = 'xianyu_products';

const SAMPLE_PRODUCTS = [];

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
