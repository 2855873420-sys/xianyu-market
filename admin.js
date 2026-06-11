// ===== 管理后台逻辑 =====
const ADMIN_PASSWORD = 'admin123';
let adminLoggedIn = false;

// 检查登录状态
if (sessionStorage.getItem('admin_logged_in') === 'true') {
    adminLoggedIn = true;
    showAdminPanel();
}

function adminLogin() {
    const pw = document.getElementById('adminPassword').value;
    if (pw === ADMIN_PASSWORD) {
        adminLoggedIn = true;
        sessionStorage.setItem('admin_logged_in', 'true');
        showAdminPanel();
    } else {
        document.getElementById('loginError').textContent = '密码错误，请重试';
        document.getElementById('adminPassword').value = '';
    }
}

function adminLogout() {
    adminLoggedIn = false;
    sessionStorage.removeItem('admin_logged_in');
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('adminPassword').value = '';
    document.getElementById('loginError').textContent = '';
}

function showAdminPanel() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    refreshProducts();
    renderAdminTable();
    updateStats();
}

// 刷新全局数据
function refreshProducts() {
    PRODUCTS = loadProducts();
    nextId = getNextId(PRODUCTS);
}

// 更新统计卡片
function updateStats() {
    const products = loadProducts();
    document.getElementById('statTotal').textContent = products.length;

    if (products.length > 0) {
        const avg = products.reduce((s, p) => s + p.price, 0) / products.length;
        document.getElementById('statAvgPrice').textContent = '¥' + Math.round(avg).toLocaleString();
    } else {
        document.getElementById('statAvgPrice').textContent = '¥0';
    }

    const categories = new Set(products.map(p => p.category));
    document.getElementById('statCategories').textContent = categories.size;

    const now = new Date();
    const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
    const recent = products.filter(p => new Date(p.date) >= monthAgo).length;
    document.getElementById('statRecent').textContent = recent;
}

// 渲染管理表格
function renderAdminTable() {
    const search = document.getElementById('adminSearch').value.toLowerCase().trim();
    const category = document.getElementById('adminCategoryFilter').value;

    let products = loadProducts();

    if (search) {
        products = products.filter(p =>
            p.title.toLowerCase().includes(search) ||
            p.seller.toLowerCase().includes(search)
        );
    }

    if (category !== 'all') {
        products = products.filter(p => p.category === category);
    }

    products.sort((a, b) => b.id - a.id);

    const tbody = document.getElementById('adminTableBody');
    const empty = document.getElementById('adminEmpty');

    if (products.length === 0) {
        tbody.innerHTML = '';
        empty.style.display = 'block';
        return;
    }

    empty.style.display = 'none';

    tbody.innerHTML = products.map(p => `
        <tr>
            <td>${p.id}</td>
            <td class="td-icon">${p.image}</td>
            <td class="td-title">${escapeHtml(p.title)}</td>
            <td><span class="tag-category">${p.category}</span></td>
            <td class="td-price">¥${p.price.toLocaleString()}</td>
            <td>${p.condition}</td>
            <td>${escapeHtml(p.seller)}</td>
            <td>${p.date}</td>
            <td class="td-actions">
                <button class="btn-edit" onclick="openAdminEdit(${p.id})">✏️</button>
                <button class="btn-delete" onclick="deleteProduct(${p.id})">🗑️</button>
            </td>
        </tr>
    `).join('');
}

// 添加商品
function openAdminAdd() {
    document.getElementById('adminModalTitle').textContent = '添加商品';
    document.getElementById('adminEditId').value = '';
    document.getElementById('adminForm').reset();
    document.getElementById('adminModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

// 编辑商品
function openAdminEdit(id) {
    const products = loadProducts();
    const p = products.find(p => p.id === id);
    if (!p) return;

    document.getElementById('adminModalTitle').textContent = '编辑商品';
    document.getElementById('adminEditId').value = p.id;
    document.getElementById('adminTitle').value = p.title;
    document.getElementById('adminCategory').value = p.category;
    document.getElementById('adminPrice').value = p.price;
    document.getElementById('adminCondition').value = p.condition;
    document.getElementById('adminImage').value = p.image;
    document.getElementById('adminDesc').value = p.desc;
    document.getElementById('adminSeller').value = p.seller;
    document.getElementById('adminContact').value = p.contact;
    document.getElementById('adminModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeAdminModal() {
    document.getElementById('adminModal').classList.remove('active');
    document.body.style.overflow = '';
}

// 保存商品（添加/编辑）
function saveAdminProduct(event) {
    event.preventDefault();

    const editId = document.getElementById('adminEditId').value;
    const title = document.getElementById('adminTitle').value.trim();
    const category = document.getElementById('adminCategory').value;
    const price = parseFloat(document.getElementById('adminPrice').value);
    const condition = document.getElementById('adminCondition').value;
    const image = document.getElementById('adminImage').value.trim();
    const desc = document.getElementById('adminDesc').value.trim();
    const seller = document.getElementById('adminSeller').value.trim();
    const contact = document.getElementById('adminContact').value.trim();

    let products = loadProducts();

    if (editId) {
        // 编辑
        const idx = products.findIndex(p => p.id === parseInt(editId));
        if (idx !== -1) {
            products[idx] = {
                ...products[idx],
                title, category, price, condition,
                image: image || products[idx].image,
                desc: desc || '卖家很懒，什么都没有写~',
                seller, contact: contact || '未提供'
            };
        }
    } else {
        // 添加
        const newProduct = {
            id: getNextId(products),
            title, category, price, condition,
            image: image || '📦',
            desc: desc || '卖家很懒，什么都没有写~',
            seller, contact: contact || '未提供',
            date: new Date().toISOString().split('T')[0]
        };
        products.unshift(newProduct);
    }

    saveProducts(products);

    closeAdminModal();
    refreshProducts();
    renderAdminTable();
    updateStats();
    showToast('保存成功 ✅');
}

// 删除商品
function deleteProduct(id) {
    if (!confirm('确定要删除这个商品吗？此操作不可恢复。')) return;

    let products = loadProducts();
    products = products.filter(p => p.id !== id);
    saveProducts(products);

    refreshProducts();
    renderAdminTable();
    updateStats();
    showToast('已删除 🗑️');
}

// ===== Toast 提示 =====
function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
        background: #2d3436; color: white; padding: 12px 24px;
        border-radius: 24px; font-size: 14px; font-weight: 600; z-index: 9999;
        animation: toastIn 0.3s ease, toastOut 0.3s ease 2s forwards;
        white-space: nowrap;
    `;

    if (!document.getElementById('toastStyles')) {
        const style = document.createElement('style');
        style.id = 'toastStyles';
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

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
