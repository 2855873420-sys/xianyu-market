// ===== 全局状态 =====
let currentCategory = "all";
let cart = [];
let paidProducts = {};

// ===== 初始化 =====
document.addEventListener("DOMContentLoaded", async () => {
    await initData();
    loadCart();
    loadPaidProducts();
    renderProducts(PRODUCTS);
    updateCartUI();
});

// ===== 购物车持久化 =====
function loadCart() {
    try {
        const saved = localStorage.getItem("xianyu_cart");
        if (saved) cart = JSON.parse(saved);
    } catch (e) { cart = []; }
}

function saveCart() {
    localStorage.setItem("xianyu_cart", JSON.stringify(cart));
}

// ===== 渲染商品列表 =====
function renderProducts(products) {
    const grid = document.getElementById("productGrid");
    const empty = document.getElementById("emptyState");
    const resultCount = document.getElementById("resultCount");

    if (!products || products.length === 0) {
        grid.innerHTML = "";
        empty.style.display = "block";
        resultCount.textContent = "0 件商品";
        return;
    }

    empty.style.display = "none";
    resultCount.textContent = "共 " + products.length + " 件商品";

    grid.innerHTML = products.map(p => `
        <div class="product-card" onclick="openDetail(${p.id})">
            <div class="product-image" style="background: ${getGradient(p.id)}">
                ${p.image}
                <span class="product-condition">${p.condition}</span>
            </div>
            <div class="product-info">
                <div class="product-title">${escapeHtml(p.title)}</div>
                <div class="product-price"><span class="unit">¥</span>${p.price.toLocaleString()}</div>
                <div class="product-meta">
                    <span>${p.category}</span>
                    <span class="product-seller">${escapeHtml(p.seller)}</span>
                </div>
            </div>
        </div>
    `).join("");
}

function getGradient(id) {
    const gradients = [
        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
        "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
        "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
        "linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)",
        "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
        "linear-gradient(135deg, #f5576c 0%, #ff9a9e 100%)",
        "linear-gradient(135deg, #667eea 0%, #00f2fe 100%)"
    ];
    return gradients[(id - 1) % gradients.length];
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

// ===== 筛选与搜索 =====
async function filterProducts() {
    const searchTerm = document.getElementById("searchInput").value.toLowerCase().trim();
    const sort = document.getElementById("sortSelect").value;
    const condition = document.getElementById("conditionSelect").value;
    const priceMin = parseFloat(document.getElementById("priceMin").value) || 0;
    const priceMax = parseFloat(document.getElementById("priceMax").value) || Infinity;

    if (!dataLoaded) {
        PRODUCTS = await loadProductsAsync();
        nextId = getNextId(PRODUCTS);
        dataLoaded = true;
    }

    let filtered = PRODUCTS.filter(p => {
        if (currentCategory !== "all" && p.category !== currentCategory) return false;
        if (searchTerm && !p.title.toLowerCase().includes(searchTerm) && !p.desc.toLowerCase().includes(searchTerm)) return false;
        if (condition !== "all" && p.condition !== condition) return false;
        if (p.price < priceMin || p.price > priceMax) return false;
        return true;
    });

    switch (sort) {
        case "price-asc": filtered.sort((a, b) => a.price - b.price); break;
        case "price-desc": filtered.sort((a, b) => b.price - a.price); break;
        case "newest": filtered.sort((a, b) => new Date(b.date) - new Date(a.date)); break;
        default: filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    renderProducts(filtered);
}

function setCategory(category, btn) {
    currentCategory = category;
    document.querySelectorAll(".category-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    filterProducts();
}

// ===== 商品详情 =====
function findProduct(id) {
    return PRODUCTS.find(p => p.id === id);
}

function openDetail(id) {
    const product = findProduct(id);
    if (!product) return;

    const body = document.getElementById("detailBody");
    body.innerHTML = `
        <div class="detail-image" style="background: ${getGradient(product.id)}">${product.image}</div>
        <div class="detail-title">${escapeHtml(product.title)}</div>
        <div class="detail-price">¥${product.price.toLocaleString()}</div>
        <div class="detail-meta">
            <span>📂 ${product.category}</span>
            <span>✨ ${product.condition}</span>
            <span>👤 ${escapeHtml(product.seller)}</span>
            <span>📅 ${product.date}</span>
        </div>
        <div class="detail-desc">${escapeHtml(product.desc)}</div>
        <div class="detail-actions">
            <button class="btn-add-cart" onclick="addToCart(${product.id})">🛒 加入购物车</button>
            <button class="btn-contact" onclick="contactSeller(${product.id})">💬 联系卖家</button>
        </div>
    `;
    document.getElementById("detailModal").classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeDetail() {
    document.getElementById("detailModal").classList.remove("active");
    document.body.style.overflow = "";
}

function contactSeller(id) {
    const product = findProduct(id);
    if (!product) return;

    if (paidProducts[id]) {
        alert("卖家: " + product.seller + "\n联系方式: " + product.contact);
        return;
    }

    currentPayProduct = product;
    document.getElementById("payImage").textContent = product.image;
    document.getElementById("payImage").style.background = getGradient(product.id);
    document.getElementById("payTitle").textContent = product.title;
    document.getElementById("payPrice").innerHTML = '<span class="unit">¥</span>' + product.price.toLocaleString();
    document.getElementById("payStep1").style.display = "block";
    document.getElementById("payStep2").style.display = "none";
    document.getElementById("payModal").classList.add("active");
    document.body.style.overflow = "hidden";
    closeDetail();
}

let currentPayProduct = null;

function loadPaidProducts() {
    try {
        const saved = localStorage.getItem("xianyu_paid");
        if (saved) paidProducts = JSON.parse(saved);
    } catch (e) { paidProducts = {}; }
}

function savePaidProducts() {
    localStorage.setItem("xianyu_paid", JSON.stringify(paidProducts));
}

function confirmPayment() {
    if (!currentPayProduct) return;
    paidProducts[currentPayProduct.id] = true;
    savePaidProducts();
    document.getElementById("payStep1").style.display = "none";
    document.getElementById("payStep2").style.display = "block";
    document.getElementById("paySeller").textContent = currentPayProduct.seller;
    document.getElementById("payContact").textContent = currentPayProduct.contact;
}

function closePayModal() {
    document.getElementById("payModal").classList.remove("active");
    document.body.style.overflow = "";
    currentPayProduct = null;
}

// ===== 发布商品 =====
function openSellModal() {
    document.getElementById("sellModal").classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeSellModal() {
    document.getElementById("sellModal").classList.remove("active");
    document.body.style.overflow = "";
}

async function publishProduct(event) {
    event.preventDefault();

    const title = document.getElementById("sellTitle").value.trim();
    const category = document.getElementById("sellCategory").value;
    const price = parseFloat(document.getElementById("sellPrice").value);
    const condition = document.getElementById("sellCondition").value;
    const desc = document.getElementById("sellDesc").value.trim();
    const seller = document.getElementById("sellSeller").value.trim();
    const contact = document.getElementById("sellContact").value.trim();

    const categoryImages = {
        "数码": "📱", "家电": "🏠", "服饰": "👗",
        "图书": "📚", "运动": "⚽", "母婴": "🍼", "其他": "📦"
    };

    if (!dataLoaded) {
        PRODUCTS = await loadProductsAsync();
        dataLoaded = true;
    }
    nextId = getNextId(PRODUCTS);

    const newProduct = {
        id: nextId, title, category, price, condition,
        desc: desc || "卖家很懒，什么都没有写~",
        seller, contact: contact || "未提供",
        image: categoryImages[category] || "📦",
        date: new Date().toISOString().split("T")[0]
    };

    PRODUCTS.unshift(newProduct);
    nextId = getNextId(PRODUCTS);

    const saved = await saveProductsAsync(PRODUCTS);
    document.getElementById("sellForm").reset();
    closeSellModal();

    if (saved) {
        // 刷新数据
        PRODUCTS = await loadProductsAsync();
    }
    renderProducts(PRODUCTS);
    showToast(saved ? "发布成功！已同步到云端 ✅" : "发布成功（云端同步失败，已存本地）⚠️");
}

// ===== 购物车操作 =====
function addToCart(id) {
    const product = findProduct(id);
    if (!product) return;

    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ id: product.id, title: product.title, price: product.price, image: product.image, qty: 1 });
    }

    saveCart();
    updateCartUI();
    showToast("已加入购物车 ✅");
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    updateCartUI();
    renderCartItems();
}

function updateCartUI() {
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    document.getElementById("cartCount").textContent = count;
}

function renderCartItems() {
    const cartItems = document.getElementById("cartItems");
    const cartEmpty = document.getElementById("cartEmpty");
    const cartFooter = document.getElementById("cartFooter");

    if (cart.length === 0) {
        cartItems.innerHTML = "";
        cartEmpty.style.display = "flex";
        cartFooter.style.display = "none";
        return;
    }

    cartEmpty.style.display = "none";
    cartFooter.style.display = "block";

    cartItems.innerHTML = cart.map(item => {
        const product = findProduct(item.id);
        const gradient = product ? getGradient(product.id) : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
        return `
            <div class="cart-item">
                <div class="cart-item-image" style="background: ${gradient}">${item.image}</div>
                <div class="cart-item-info">
                    <div class="cart-item-title">${escapeHtml(item.title)}</div>
                    <div class="cart-item-price">¥${item.price.toLocaleString()}</div>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart(${item.id})">删除</button>
            </div>
        `;
    }).join("");

    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    document.getElementById("cartTotal").textContent = "¥" + total.toLocaleString();
}

function toggleCart() {
    const panel = document.getElementById("cartPanel");
    const overlay = document.getElementById("cartOverlay");

    if (panel.classList.contains("active")) {
        panel.classList.remove("active");
        overlay.classList.remove("active");
        document.body.style.overflow = "";
    } else {
        renderCartItems();
        panel.classList.add("active");
        overlay.classList.add("active");
        document.body.style.overflow = "hidden";
    }
}

function checkout() {
    if (cart.length === 0) return;
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const count = cart.reduce((sum, item) => sum + item.qty, 0);

    if (confirm("确认结算 " + count + " 件商品，总计 ¥" + total.toLocaleString() + "？\n\n（此为演示功能，不会实际扣款）")) {
        cart = [];
        saveCart();
        updateCartUI();
        renderCartItems();
        toggleCart();
        showToast("结算成功！感谢购物 🎉");
    }
}

// ===== Toast 提示 =====
function showToast(message) {
    const existing = document.querySelector(".toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
        background: #2d3436; color: white; padding: 12px 24px;
        border-radius: 24px; font-size: 14px; font-weight: 600; z-index: 9999;
        animation: toastIn 0.3s ease, toastOut 0.3s ease 2s forwards;
        white-space: nowrap;
    `;

    if (!document.getElementById("toastStyles")) {
        const style = document.createElement("style");
        style.id = "toastStyles";
        style.textContent = `
            @keyframes toastIn {
                from { opacity: 0; transform: translateX(-50%) translateY(20px); }
                to   { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
            @keyframes toastOut {
                from { opacity: 1; transform: translateX(-50%) translateY(0); }
                to   { opacity: 0; transform: translateX(-50%) translateY(-20px); }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}
