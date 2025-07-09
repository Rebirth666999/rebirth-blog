
// 管理面板初始化
document.addEventListener('DOMContentLoaded', () => {
    // 检查用户是否已登录
    checkLoginStatus();
    
    // 初始化管理面板事件
    initAdminPanel();
    
    // 初始化文章管理
    initArticleManagement();
    
    // 初始化分类管理
    initCategoryManagement();
    
    // 初始化评论管理
    initCommentManagement();
    
    // 初始化登录表单
    initLoginForm();
});

// 检查登录状态
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (!isLoggedIn && window.location.pathname.includes('admin.html')) {
        window.location.href = 'login.html';
    }
    
    // 更新导航栏
    updateNavLinks(isLoggedIn);
}

// 更新导航链接
function updateNavLinks(isLoggedIn) {
    const adminLink = document.getElementById('adminLink');
    
    if (adminLink) {
        if (isLoggedIn) {
            adminLink.innerHTML = '<i class="fas fa-user-cog mr-2"></i> 管理面板';
            adminLink.href = 'admin.html';
        } else {
            adminLink.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i> 登录';
            adminLink.href = 'login.html';
        }
    }
}

// 初始化管理面板
function initAdminPanel() {
    const logoutButton = document.getElementById('logoutButton');
    
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('isLoggedIn');
            window.location.href = 'login.html';
        });
    }
    
    // 初始化管理面板选项卡
    const tabLinks = document.querySelectorAll('.admin-tab');
    
    tabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // 移除所有选项卡的活跃状态
            tabLinks.forEach(tab => tab.classList.remove('active'));
            
            // 添加当前选项卡的活跃状态
            link.classList.add('active');
            
            // 获取选项卡内容ID
            const tabContentId = link.getAttribute('href').substring(1);
            
            // 隐藏所有选项卡内容
            document.querySelectorAll('.admin-tab-content').forEach(content => {
                content.style.display = 'none';
            });
            
            // 显示当前选项卡内容
            document.getElementById(tabContentId).style.display = 'block';
            
            // 如果是文章列表选项卡，刷新文章列表
            if (tabContentId === 'articlesTab') {
                loadAdminArticles();
            }
            
            // 如果是评论管理选项卡，刷新评论列表
            if (tabContentId === 'commentsTab') {
                loadAdminComments();
            }
        });
    });
}

// 初始化文章管理
function initArticleManagement() {
    const addArticleButton = document.getElementById('addArticleButton');
    
    if (addArticleButton) {
        addArticleButton.addEventListener('click', () => {
            // 清空表单
            document.getElementById('articleForm').reset();
            
            // 设置表单提交类型为"添加"
            document.getElementById('articleForm').dataset.action = 'add';
            
            // 显示模态框
            document.getElementById('articleModal').style.display = 'flex';
        });
    }
    
    // 初始化文章表单提交
    const articleForm = document.getElementById('articleForm');
    
    if (articleForm) {
        articleForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const action = articleForm.dataset.action;
            const title = document.getElementById('articleTitle').value.trim();
            const summary = document.getElementById('articleSummary').value.trim();
            const content = document.getElementById('articleContent').value.trim();
            const category = document.getElementById('articleCategory').value;
            
            if (!title || !summary || !content || !category) {
                showNotification('请填写所有必填字段', 'error');
                return;
            }
            
            try {
                // 显示加载中
                const submitBtn = document.getElementById('submitArticle');
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> 提交中...';
                
                if (action === 'add') {
                    // 添加新文章
                    await addArticle({
                        title,
                        summary,
                        content,
                        category,
                        date: new Date().toISOString().split('T')[0],
                        readTime: calculateReadTime(content)
                    });
                    
                    showNotification('文章添加成功', 'success');
                } else if (action === 'edit') {
                    // 编辑现有文章
                    const articleId = articleForm.dataset.id;
                    await updateArticle(articleId, {
                        title,
                        summary,
                        content,
                        category,
                        readTime: calculateReadTime(content)
                    });
                    
                    showNotification('文章更新成功', 'success');
                }
                
                // 关闭模态框
                document.getElementById('articleModal').style.display = 'none';
                
                // 刷新文章列表
                loadAdminArticles();
            } catch (error) {
                console.error('提交文章失败:', error);
                showNotification('提交文章失败，请稍后再试', 'error');
            } finally {
                // 恢复按钮状态
                const submitBtn = document.getElementById('submitArticle');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i> 保存';
            }
        });
    }
}

// 加载管理面板文章列表
async function loadAdminArticles() {
    try {
        // 显示加载中
        const articlesTableBody = document.getElementById('articlesTableBody');
        articlesTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4">
                    <div class="loading-spinner mx-auto"></div>
                </td>
            </tr>
        `;
        
        // 获取文章数据
        const articles = await fetchArticles();
        
        // 渲染文章列表
        if (articles && articles.length > 0) {
            articlesTableBody.innerHTML = '';
            
            articles.forEach(article => {
                renderAdminArticleRow(article, articlesTableBody);
            });
        } else {
            articlesTableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4">暂无文章</td>
                </tr>
            `;
        }
    } catch (error) {
        console.error('加载文章失败:', error);
        document.getElementById('articlesTableBody').innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4 text-red-500">加载文章失败，请稍后再试</td>
            </tr>
        `;
    }
}

// 渲染管理面板文章行
function renderAdminArticleRow(article, container) {
    const row = document.createElement('tr');
    
    // 分类标签样式映射
    const categoryLabels = {
        'welcome': '欢迎',
        'technology': '技术',
        'tutorial': '教程',
        'announcement': '公告'
    };
    
    row.innerHTML = `
        <td>${article.id}</td>
        <td>${article.title}</td>
        <td><span class="category-tag ${article.category}">${categoryLabels[article.category] || article.category}</span></td>
        <td>${article.date}</td>
        <td>${article.readTime}</td>
        <td>
            <button class="admin-btn edit mr-2" data-id="${article.id}">
                <i class="fas fa-edit mr-1"></i> 编辑
            </button>
            <button class="admin-btn delete" data-id="${article.id}">
                <i class="fas fa-trash mr-1"></i> 删除
            </button>
        </td>
    `;
    
    container.appendChild(row);
    
    // 添加编辑按钮事件
    row.querySelector('.edit').addEventListener('click', () => {
        loadArticleForEdit(article.id);
    });
    
    // 添加删除按钮事件
    row.querySelector('.delete').addEventListener('click', () => {
        confirmDeleteArticle(article.id);
    });
}

// 加载文章进行编辑
async function loadArticleForEdit(id) {
    try {
        // 获取文章详情
        const article = await fetchArticleDetail(id);
        
        // 填充表单
        document.getElementById('articleTitle').value = article.title;
        document.getElementById('articleSummary').value = article.summary;
        document.getElementById('articleContent').value = article.content;
        document.getElementById('articleCategory').value = article.category;
        
        // 设置表单提交类型为"编辑"
        const articleForm = document.getElementById('articleForm');
        articleForm.dataset.action = 'edit';
        articleForm.dataset.id = id;
        
        // 显示模态框
        document.getElementById('articleModal').style.display = 'flex';
    } catch (error) {
        console.error('加载文章失败:', error);
        showNotification('加载文章失败，请稍后再试', 'error');
    }
}

// 确认删除文章
function confirmDeleteArticle(id) {
    const modal = document.getElementById('confirmModal');
    document.getElementById('confirmMessage').textContent = '确定要删除这篇文章吗？此操作不可撤销。';
    
    // 设置确认按钮回调
    const confirmButton = document.getElementById('confirmButton');
    confirmButton.onclick = async () => {
        try {
            // 显示加载中
            confirmButton.disabled = true;
            confirmButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> 删除中...';
            
            // 删除文章
            await deleteArticle(id);
            
            // 关闭模态框
            modal.style.display = 'none';
            
            // 显示通知
            showNotification('文章已删除', 'success');
            
            // 刷新文章列表
            loadAdminArticles();
        } catch (error) {
            console.error('删除文章失败:', error);
            showNotification('删除文章失败，请稍后再试', 'error');
        } finally {
            // 恢复按钮状态
            confirmButton.disabled = false;
            confirmButton.innerHTML = '确认删除';
        }
    };
    
    // 显示确认模态框
    modal.style.display = 'flex';
}

// 添加新文章
async function addArticle(article) {
    try {
        // 这里使用模拟数据，实际项目中可以调用API
        // 模拟网络请求延迟
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // 在实际应用中，这里应该是API调用
        console.log('添加新文章:', article);
        
        // 返回添加的文章（通常API会返回完整的文章对象）
        return {
            id: Date.now(), // 使用时间戳作为临时ID
            ...article
        };
    } catch (error) {
        throw new Error('添加文章失败: ' + error.message);
    }
}

// 更新文章
async function updateArticle(id, articleData) {
    try {
        // 这里使用模拟数据，实际项目中可以调用API
        // 模拟网络请求延迟
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // 在实际应用中，这里应该是API调用
        console.log('更新文章:', id, articleData);
        
        // 返回更新的文章
        return {
            id: parseInt(id),
            ...articleData
        };
    } catch (error) {
        throw new Error('更新文章失败: ' + error.message);
    }
}

// 删除文章
async function deleteArticle(id) {
    try {
        // 这里使用模拟数据，实际项目中可以调用API
        // 模拟网络请求延迟
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // 在实际应用中，这里应该是API调用
        console.log('删除文章:', id);
        
        return true;
    } catch (error) {
        throw new Error('删除文章失败: ' + error.message);
    }
}

// 计算阅读时间
function calculateReadTime(content) {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
}

// 初始化分类管理
function initCategoryManagement() {
    const addCategoryButton = document.getElementById('addCategoryButton');
    
    if (addCategoryButton) {
        addCategoryButton.addEventListener('click', () => {
            // 清空表单
            document.getElementById('categoryForm').reset();
            
            // 显示模态框
            document.getElementById('categoryModal').style.display = 'flex';
        });
    }
    
    // 初始化分类表单提交
    const categoryForm = document.getElementById('categoryForm');
    
    if (categoryForm) {
        categoryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('categoryName').value.trim();
            const color = document.getElementById('categoryColor').value.trim();
            
            if (!name || !color) {
                showNotification('请填写所有必填字段', 'error');
                return;
            }
            
            try {
                // 显示加载中
                const submitBtn = document.getElementById('submitCategory');
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> 提交中...';
                
                // 添加新分类
                await addCategory({
                    name,
                    color
                });
                
                // 关闭模态框
                document.getElementById('categoryModal').style.display = 'none';
                
                // 显示通知
                showNotification('分类添加成功', 'success');
                
                // 刷新分类列表
                loadAdminCategories();
            } catch (error) {
                console.error('提交分类失败:', error);
                showNotification('提交分类失败，请稍后再试', 'error');
            } finally {
                // 恢复按钮状态
                const submitBtn = document.getElementById('submitCategory');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i> 保存';
            }
        });
    }
}

// 加载管理面板分类列表
async function loadAdminCategories() {
    try {
        // 显示加载中
        const categoriesTableBody = document.getElementById('categoriesTableBody');
        categoriesTableBody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center py-4">
                    <div class="loading-spinner mx-auto"></div>
                </td>
            </tr>
        `;
        
        // 获取分类数据（在实际应用中应该从API获取）
        const categories = [
            { id: 1, name: '欢迎', key: 'welcome', color: '#e67e22' },
            { id: 2, name: '技术', key: 'technology', color: '#3498db' },
            { id: 3, name: '教程', key: 'tutorial', color: '#9b59b6' },
            { id: 4, name: '公告', key: 'announcement', color: '#27ae60' }
        ];
        
        // 渲染分类列表
        if (categories && categories.length > 0) {
            categoriesTableBody.innerHTML = '';
            
            categories.forEach(category => {
                renderAdminCategoryRow(category, categoriesTableBody);
            });
        } else {
            categoriesTableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center py-4">暂无分类</td>
                </tr>
            `;
        }
    } catch (error) {
        console.error('加载分类失败:', error);
        document.getElementById('categoriesTableBody').innerHTML = `
            <tr>
                <td colspan="4" class="text-center py-4 text-red-500">加载分类失败，请稍后再试</td>
            </tr>
        `;
    }
}

// 渲染管理面板分类行
function renderAdminCategoryRow(category, container) {
    const row = document.createElement('tr');
    
    row.innerHTML = `
        <td>${category.id}</td>
        <td>
            <span class="category-tag" style="background-color: ${category.color}">${category.name}</span>
        </td>
        <td>${category.key}</td>
        <td>
            <button class="admin-btn edit mr-2" data-id="${category.id}">
                <i class="fas fa-edit mr-1"></i> 编辑
            </button>
            <button class="admin-btn delete" data-id="${category.id}">
                <i class="fas fa-trash mr-1"></i> 删除
            </button>
        </td>
    `;
    
    container.appendChild(row);
    
    // 添加编辑按钮事件
    row.querySelector('.edit').addEventListener('click', () => {
        loadCategoryForEdit(category.id);
    });
    
    // 添加删除按钮事件
    row.querySelector('.delete').addEventListener('click', () => {
        confirmDeleteCategory(category.id);
    });
}

// 加载分类进行编辑
function loadCategoryForEdit(id) {
    // 在实际应用中，这里应该从API获取分类数据
    const categories = [
        { id: 1, name: '欢迎', key: 'welcome', color: '#e67e22' },
        { id: 2, name: '技术', key: 'technology', color: '#3498db' },
        { id: 3, name: '教程', key: 'tutorial', color: '#9b59b6' },
        { id: 4, name: '公告', key: 'announcement', color: '#27ae60' }
    ];
    
    const category = categories.find(cat => cat.id === id);
    
    if (category) {
        // 填充表单
        document.getElementById('categoryName').value = category.name;
        document.getElementById('categoryColor').value = category.color;
        
        // 设置表单提交类型为"编辑"
        const categoryForm = document.getElementById('categoryForm');
        categoryForm.dataset.action = 'edit';
        categoryForm.dataset.id = id;
        
        // 显示模态框
        document.getElementById('categoryModal').style.display = 'flex';
    }
}

// 确认删除分类
function confirmDeleteCategory(id) {
    const modal = document.getElementById('confirmModal');
    document.getElementById('confirmMessage').textContent = '确定要删除这个分类吗？此操作不可撤销。';
    
    // 设置确认按钮回调
    const confirmButton = document.getElementById('confirmButton');
    confirmButton.onclick = () => {
        // 在实际应用中，这里应该调用API删除分类
        console.log('删除分类:', id);
        
        // 关闭模态框
        modal.style.display = 'none';
        
        // 显示通知
        showNotification('分类已删除', 'success');
        
        // 刷新分类列表
        loadAdminCategories();
    };
    
    // 显示确认模态框
    modal.style.display = 'flex';
}

// 添加新分类
async function addCategory(category) {
    try {
        // 这里使用模拟数据，实际项目中可以调用API
        // 模拟网络请求延迟
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // 在实际应用中，这里应该是API调用
        console.log('添加新分类:', category);
        
        // 返回添加的分类
        return {
            id: Date.now(), // 使用时间戳作为临时ID
            ...category
        };
    } catch (error) {
        throw new Error('添加分类失败: ' + error.message);
    }
}

// 初始化评论管理
function initCommentManagement() {
    // 加载评论列表
    loadAdminComments();
}

// 加载管理面板评论列表
async function loadAdminComments() {
    try {
        // 显示加载中
        const commentsTableBody = document.getElementById('commentsTableBody');
        commentsTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4">
                    <div class="loading-spinner mx-auto"></div>
                </td>
            </tr>
        `;
        
        // 获取评论数据（在实际应用中应该从API获取）
        const comments = [
            { id: 1, articleId: 1, author: '张三', content: '非常好的文章，感谢分享！', date: '2023-05-16' },
            { id: 2, articleId: 2, author: '李四', content: '讲解很详细，受益匪浅！', date: '2023-05-21' },
            { id: 3, articleId: 3, author: '王五', content: '期待更多类似的文章！', date: '2023-06-06' },
            { id: 4, articleId: 4, author: '赵六', content: 'CSS Grid确实很强大，谢谢教程！', date: '2023-06-16' },
            { id: 5, articleId: 5, author: '钱七', content: '前端安全非常重要，希望能看到更多这方面的内容。', date: '2023-07-02' }
        ];
        
        // 渲染评论列表
        if (comments && comments.length > 0) {
            commentsTableBody.innerHTML = '';
            
            comments.forEach(comment => {
                renderAdminCommentRow(comment, commentsTableBody);
            });
        } else {
            commentsTableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-4">暂无评论</td>
                </tr>
            `;
        }
    } catch (error) {
        console.error('加载评论失败:', error);
        document.getElementById('commentsTableBody').innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4 text-red-500">加载评论失败，请稍后再试</td>
            </tr>
        `;
    }
}

// 渲染管理面板评论行
function renderAdminCommentRow(comment, container) {
    const row = document.createElement('tr');
    
    row.innerHTML = `
        <td>${comment.id}</td>
        <td>${comment.author}</td>
        <td>${comment.content}</td>
        <td>${comment.date}</td>
        <td>
            <button class="admin-btn delete" data-id="${comment.id}">
                <i class="fas fa-trash mr-1"></i> 删除
            </button>
        </td>
    `;
    
    container.appendChild(row);
    
    // 添加删除按钮事件
    row.querySelector('.delete').addEventListener('click', () => {
        confirmDeleteComment(comment.id);
    });
}

// 确认删除评论
function confirmDeleteComment(id) {
    const modal = document.getElementById('confirmModal');
    document.getElementById('confirmMessage').textContent = '确定要删除这条评论吗？此操作不可撤销。';
    
    // 设置确认按钮回调
    const confirmButton = document.getElementById('confirmButton');
    confirmButton.onclick = () => {
        // 在实际应用中，这里应该调用API删除评论
        console.log('删除评论:', id);
        
        // 关闭模态框
        modal.style.display = 'none';
        
        // 显示通知
        showNotification('评论已删除', 'success');
        
        // 刷新评论列表
        loadAdminComments();
    };
    
    // 显示确认模态框
    modal.style.display = 'flex';
}

// 初始化登录表单
function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // 简单验证（实际应用中应该与服务器验证）
            if (username === 'admin' && password === 'password') {
                // 登录成功
                localStorage.setItem('isLoggedIn', 'true');
                window.location.href = 'admin.html';
            } else {
                // 登录失败
                showNotification('用户名或密码错误', 'error');
            }
        });
    }
}

// 显示通知
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // 显示通知
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // 3秒后隐藏通知
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}
