// ===== 闲鱼风格交互逻辑 =====
let currentCategory = 'all';
let currentSort = 'default';
let currentDetailId = null;
let cart = [];
let paidProducts = {};

document.addEventListener('DOMContentLoaded', async () => {
    await initData();
    loadCart();
    loadPaidProducts();
    renderProducts(PRODUCTS);
    updateCartDot();
});

// ===== 页面切换 =====
function switchTab(tabId, el) {
    document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(tabId).style.display = 'block';
    if (el) el.classList.add('active');
    if (tabId === 'tabProfile') updateProfile();
}

// ===== 搜索 =====
function focusSearch() {
    document.getElementById('searchInput').focus();
}

// ===== 渲染商品 =====
function renderProducts(products) {
    const grid = document.getElementById('productGrid');
    const empty = document.getElementById('emptyState');
    if (!grid) return;
    if (!products || products.length === 0) {
        grid.innerHTML = '';
        empty.style.display = 'block';
        return;
    }
    empty.style.display = 'none';
    grid.innerHTML = products.map(p => `
        <div class="product-card" onclick="openDetail(${p.id})">
            <div class="product-image" style="background:${getGradient(p.id)}">
                ${p.image}
                <span class="condition-tag">${p.condition}</span>
            </div>
            <div class="product-body">
                <div class="product-title">${esc(p.title)}</div>
                <div class="product-price"><span class="yuan">¥</span>${p.price.toLocaleString()}</div>
                <div class="product-foot">
                    <span class="product-loc">${p.seller}</span>
                    <span>${p.date.slice(5)}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function getGradient(id) {
    const g = ['#667eea,#764ba2','#f093fb,#f5576c','#4facfe,#00f2fe','#43e97b,#38f9d7','#fa709a,#fee140','#a18cd1,#fbc2eb','#fccb90,#d57eeb','#e0c3fc,#8ec5fc','#ffecd2,#fcb69f','#667eea,#00f2fe'];
    return 'linear-gradient(135deg,' + g[(id - 1) % g.length] + ')';
}

function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

// ===== 筛选 =====
async function filterProducts() {
    const search = (document.getElementById('searchInput').value || '').toLowerCase().trim();
    const condition = document.getElementById('conditionSelect').value;
    if (!dataLoaded) { PRODUCTS = await loadProductsAsync(); nextId = getNextId(PRODUCTS); dataLoaded = true; }
    let filtered = PRODUCTS.filter(p => {
        if (currentCategory !== 'all' && p.category !== currentCategory) return false;
        if (search && !p.title.toLowerCase().includes(search)) return false;
        if (condition !== 'all' && p.condition !== condition) return false;
        return true;
    });
    switch (currentSort) {
        case 'price-asc': filtered.sort((a, b) => a.price - b.price); break;
        case 'price-desc': filtered.sort((a, b) => b.price - a.price); break;
        case 'newest': filtered.sort((a, b) => new Date(b.date) - new Date(a.date)); break;
        default: filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    renderProducts(filtered);
}

function setCategory(cat, el) {
    currentCategory = cat;
    document.querySelectorAll('.cat-item').forEach(c => c.classList.remove('active'));
    if (el) el.classList.add('active');
    document.getElementById('searchInput').value = '';
    filterProducts();
    switchTab('tabHome', document.querySelector('.nav-item[data-tab="tabHome"]'));
}

function setSort(sort, el) {
    currentSort = sort;
    document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    filterProducts();
}

// ===== 详情 =====
function openDetail(id) {
    const p = PRODUCTS.find(x => x.id === id);
    if (!p) return;
    currentDetailId = id;
    document.getElementById('detailImage').style.background = getGradient(p.id);
    document.getElementById('detailImage').textContent = p.image;
    document.getElementById('detailPrice').textContent = '¥' + p.price.toLocaleString();
    document.getElementById('detailTitle').textContent = p.title;
    document.getElementById('detailTags').innerHTML = ['📂 ' + p.category, '✨ ' + p.condition, '📅 ' + p.date].map(t => '<span>' + t + '</span>').join('');
    document.getElementById('detailDesc').textContent = p.desc;
    document.getElementById('detailSeller').textContent = p.seller;
    document.getElementById('detailContact').textContent = p.contact;
    document.getElementById('detailModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeDetail() {
    document.getElementById('detailModal').classList.remove('active');
    document.body.style.overflow = '';
}

// ===== 联系卖家 =====
function contactSeller(id) {
    const p = PRODUCTS.find(x => x.id === id);
    if (!p) return;
    if (paidProducts[id]) {
        alert('卖家: ' + p.seller + '\n联系方式: ' + p.contact);
        return;
    }
    currentPayProduct = p;
    document.getElementById('payProductInfo').innerHTML = '<div class="pay-price">¥' + p.price.toLocaleString() + '</div><div style="color:#999;font-size:13px">' + esc(p.title) + '</div>';
    document.getElementById('payStep1').style.display = 'block';
    document.getElementById('payStep2').style.display = 'none';
    document.getElementById('payModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

let currentPayProduct = null;
function loadPaidProducts() { try { const s = localStorage.getItem('xianyu_paid'); if (s) paidProducts = JSON.parse(s); } catch (e) { paidProducts = {}; } }
function savePaidProducts() { localStorage.setItem('xianyu_paid', JSON.stringify(paidProducts)); }

function confirmPayment() {
    if (!currentPayProduct) return;
    paidProducts[currentPayProduct.id] = true;
    savePaidProducts();
    document.getElementById('payStep1').style.display = 'none';
    document.getElementById('payStep2').style.display = 'block';
    document.getElementById('paySeller').textContent = currentPayProduct.seller;
    document.getElementById('payContact').textContent = currentPayProduct.contact;
}

function closePayModal() { document.getElementById('payModal').classList.remove('active'); document.body.style.overflow = ''; currentPayProduct = null; }

// ===== 发布 =====
function openSellModal() { document.getElementById('sellModal').classList.add('active'); document.body.style.overflow = 'hidden'; }
function closeSellModal() { document.getElementById('sellModal').classList.remove('active'); document.body.style.overflow = ''; }

async function publishProduct(e) {
    e.preventDefault();
    const title = document.getElementById('sellTitle').value.trim();
    const category = document.getElementById('sellCategory').value;
    const price = parseFloat(document.getElementById('sellPrice').value);
    const condition = document.getElementById('sellCondition').value;
    const desc = document.getElementById('sellDesc').value.trim();
    const seller = document.getElementById('sellSeller').value.trim();
    const contact = document.getElementById('sellContact').value.trim();
    const imgs = { '数码': '📱', '家电': '🏠', '服饰': '👗', '图书': '📚', '运动': '⚽', '母婴': '🍼', '其他': '📦' };
    if (!dataLoaded) { PRODUCTS = await loadProductsAsync(); dataLoaded = true; }
    nextId = getNextId(PRODUCTS);
    PRODUCTS.unshift({ id: nextId, title, category, price, condition, desc: desc || '卖家很懒，什么都没有写~', seller, contact: contact || '未提供', image: imgs[category] || '📦', date: new Date().toISOString().split('T')[0] });
    nextId = getNextId(PRODUCTS);
    const saved = await saveProductsAsync(PRODUCTS);
    document.getElementById('sellForm').reset();
    closeSellModal();
    if (saved) PRODUCTS = await loadProductsAsync();
    renderProducts(PRODUCTS);
    toast(saved ? '发布成功 ✅' : '发布成功（云端同步失败）⚠️');
}

// ===== 购物车 =====
function loadCart() { try { const s = localStorage.getItem('xianyu_cart'); if (s) cart = JSON.parse(s); } catch (e) { cart = []; } }
function saveCart() { localStorage.setItem('xianyu_cart', JSON.stringify(cart)); }
function addToCart(id) {
    const p = PRODUCTS.find(x => x.id === id);
    if (!p) return;
    const ex = cart.find(x => x.id === id);
    if (ex) ex.qty++; else cart.push({ id: p.id, title: p.title, price: p.price, image: p.image, qty: 1 });
    saveCart(); updateCartDot(); toast('已加入购物车 ✅');
}
function removeFromCart(id) { cart = cart.filter(x => x.id !== id); saveCart(); updateCartDot(); renderCartItems(); }
function updateCartDot() {
    const count = cart.reduce((s, x) => s + x.qty, 0);
    const dot = document.getElementById('cartDot');
    dot.style.display = count > 0 ? 'block' : 'none';
}
function renderCartItems() {
    const items = document.getElementById('cartItems');
    const empty = document.getElementById('cartEmpty');
    const footer = document.getElementById('cartFooter');
    if (cart.length === 0) { items.innerHTML = ''; empty.style.display = 'flex'; footer.style.display = 'none'; return; }
    empty.style.display = 'none'; footer.style.display = 'block';
    items.innerHTML = cart.map(item => {
        const p = PRODUCTS.find(x => x.id === item.id);
        return '<div class="cart-item"><div class="cart-item-image" style="background:' + (p ? getGradient(p.id) : '#eee') + '">' + item.image + '</div><div class="cart-item-info"><div class="cart-item-title">' + esc(item.title) + '</div><div class="cart-item-price">¥' + item.price.toLocaleString() + '</div></div><button class="cart-item-remove" onclick="removeFromCart(' + item.id + ')">删除</button></div>';
    }).join('');
    document.getElementById('cartTotal').textContent = '¥' + cart.reduce((s, x) => s + x.price * x.qty, 0).toLocaleString();
}
function toggleCart() {
    const panel = document.getElementById('cartPanel');
    const overlay = document.getElementById('cartOverlay');
    if (panel.classList.contains('active')) { panel.classList.remove('active'); overlay.classList.remove('active'); document.body.style.overflow = ''; }
    else { renderCartItems(); panel.classList.add('active'); overlay.classList.add('active'); document.body.style.overflow = 'hidden'; }
}
function checkout() {
    if (cart.length === 0) return;
    const total = cart.reduce((s, x) => s + x.price * x.qty, 0);
    if (confirm('确认结算 ' + cart.reduce((s, x) => s + x.qty, 0) + ' 件商品，总计 ¥' + total.toLocaleString() + '？\n（演示功能，不实际扣款）')) { cart = []; saveCart(); updateCartDot(); renderCartItems(); toggleCart(); toast('结算成功 🎉'); }
}

// ===== 我的页面 =====
function updateProfile() {
    document.getElementById('myPublishCount').textContent = PRODUCTS.length;
    document.getElementById('myBuyCount').textContent = Object.keys(paidProducts).length;
}

// ===== Toast =====
function toast(msg) {
    const t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,.8);color:#fff;padding:10px 20px;border-radius:20px;font-size:14px;z-index:9999;animation:fadeIn .3s ease,fadeOut .3s ease 2s forwards;pointer-events:none';
    if (!document.getElementById('ts')) { const s = document.createElement('style'); s.id = 'ts'; s.textContent = '@keyframes fadeIn{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}@keyframes fadeOut{from{opacity:1;transform:translateX(-50%) translateY(0)}to{opacity:0;transform:translateX(-50%) translateY(-10px)}}'; document.head.appendChild(s); }
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2400);
}
