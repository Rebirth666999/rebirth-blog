// 初始化页面
document.addEventListener('DOMContentLoaded', () => {
    // 检查深色模式偏好
    checkDarkModePreference();
    
    // 加载文章列表
    loadArticles();
    
    // 初始化导航栏滚动效果
    initNavbarScroll();
    
    // 初始化评论系统
    initComments();
    
    // 初始化搜索功能
    initSearch();
    
    // 初始化分类筛选
    initCategoryFilter();
    
    // 初始化标签筛选
    initTagFilter();
    
    // 初始化回到顶部按钮
    initBackToTopButton();
    
    // 初始化打字动画
    initTypewriterEffect();
    
    // 初始化骨架屏
    showSkeletonCards(6);
});

// 深色模式切换
function checkDarkModePreference() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    const themeToggle = document.getElementById('themeToggle');
    
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.body.classList.remove('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
    
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDark);
        
        if (isDark) {
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    });
}

// 加载文章列表
async function loadArticles() {
    try {
        // 显示加载中
        const articlesContainer = document.getElementById('articlesContainer');
        articlesContainer.innerHTML = '';
        
        // 获取文章数据
        const articles = await fetchArticles();
        
        // 隐藏骨架屏
        hideSkeletonCards();
        
        // 渲染文章列表
        if (articles && articles.length > 0) {
            articles.forEach(article => {
                renderArticleCard(article, articlesContainer);
            });
            
            // 添加淡入动画
            addFadeInAnimation();
        } else {
            articlesContainer.innerHTML = '<div class="text-center py-10">暂无文章</div>';
        }
    } catch (error) {
        console.error('加载文章失败:', error);
        hideSkeletonCards();
        document.getElementById('articlesContainer').innerHTML = 
            '<div class="text-center py-10 text-red-500">加载文章失败，请稍后再试</div>';
    }
}

// 获取文章数据
async function fetchArticles() {
    try {
        // 这里使用模拟数据，实际项目中可以调用API
        // 模拟网络请求延迟
        await new Promise(resolve => setTimeout(resolve, 800));
        
        return [
            {
                id: 1,
                title: '欢迎来到重生博客',
                summary: '这是一个基于现代Web技术构建的博客系统，支持Markdown编辑、评论功能和深色模式。',
                date: '2023-05-15',
                category: 'welcome',
                readTime: '3 min read',
                content: '欢迎来到我的技术博客！这里将分享Web开发、JavaScript、React等相关技术文章...'
            },
            {
                id: 2,
                title: 'JavaScript异步编程全解析',
                summary: '深入理解JavaScript中的异步编程模型，包括回调函数、Promise、async/await等概念。',
                date: '2023-05-20',
                category: 'technology',
                readTime: '8 min read',
                content: 'JavaScript是单线程语言，但通过异步编程可以处理非阻塞操作...'
            },
            {
                id: 3,
                title: 'React性能优化实战',
                summary: '探讨React应用中的性能瓶颈和优化策略，包括虚拟DOM、shouldComponentUpdate等。',
                date: '2023-06-05',
                category: 'technology',
                readTime: '10 min read',
                content: '在构建大型React应用时，性能优化至关重要。本文将介绍几种常见的性能优化技术...'
            },
            {
                id: 4,
                title: 'CSS Grid布局入门到精通',
                summary: '全面介绍CSS Grid布局，从基础概念到高级技巧，帮助你构建现代响应式网站。',
                date: '2023-06-15',
                category: 'tutorial',
                readTime: '7 min read',
                content: 'CSS Grid是现代Web布局的强大工具，它提供了二维网格系统，可以轻松创建复杂的布局...'
            },
            {
                id: 5,
                title: '前端安全最佳实践',
                summary: '探讨前端开发中的安全问题，包括XSS、CSRF、SQL注入等攻击方式及防范措施。',
                date: '2023-07-01',
                category: 'technology',
                readTime: '9 min read',
                content: '随着Web应用变得越来越复杂，前端安全问题也变得越来越重要。本文将介绍几种常见的前端安全威胁及防范方法...'
            },
            {
                id: 6,
                title: '如何高效学习前端开发',
                summary: '分享学习前端开发的有效方法和资源，帮助初学者快速入门并成长为专业开发者。',
                date: '2023-07-10',
                category: 'tutorial',
                readTime: '6 min read',
                content: '前端开发是一个快速发展的领域，学习曲线可能很陡峭。本文将分享一些学习前端开发的有效方法和推荐资源...'
            }
        ];
    } catch (error) {
        throw new Error('获取文章数据失败: ' + error.message);
    }
}

// 渲染文章卡片
function renderArticleCard(article, container) {
    const card = document.createElement('div');
    card.className = 'article-card fade-in';
    card.dataset.category = article.category;
    card.dataset.id = article.id;
    
    // 分类标签样式映射
    const categoryLabels = {
        'welcome': '欢迎',
        'technology': '技术',
        'tutorial': '教程',
        'announcement': '公告'
    };
    
    card.innerHTML = `
        <div class="article-image">
            <i class="fas fa-file-alt"></i>
        </div>
        <div class="article-content">
            <div class="article-meta">
                <span class="category-tag ${article.category}">${categoryLabels[article.category] || article.category}</span>
                <span class="article-date">${article.date}</span>
            </div>
            <h3 class="article-title">${article.title}</h3>
            <p class="article-summary">${article.summary}</p>
            <div class="article-footer">
                <a href="#" class="read-more" data-id="${article.id}">
                    阅读更多 <i class="fas fa-arrow-right"></i>
                </a>
                <span class="read-time">${article.readTime}</span>
            </div>
        </div>
    `;
    
    container.appendChild(card);
    
    // 添加点击事件
    card.querySelector('.read-more').addEventListener('click', (e) => {
        e.preventDefault();
        const articleId = e.currentTarget.dataset.id;
        loadArticleDetail(articleId);
    });
}

// 加载文章详情
async function loadArticleDetail(id) {
    try {
        // 显示加载中
        const articleContainer = document.getElementById('articleContainer');
        articleContainer.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
            </div>
        `;
        
        // 获取文章详情
        const article = await fetchArticleDetail(id);
        
        // 渲染文章详情
        renderArticleDetail(article);
        
        // 平滑滚动到文章区域
        document.getElementById('articleSection').scrollIntoView({ 
            behavior: 'smooth' 
        });
    } catch (error) {
        console.error('加载文章详情失败:', error);
        document.getElementById('articleContainer').innerHTML = 
            '<div class="text-center py-10 text-red-500">加载文章详情失败，请稍后再试</div>';
    }
}

// 获取文章详情
async function fetchArticleDetail(id) {
    try {
        // 这里使用模拟数据，实际项目中可以调用API
        // 模拟网络请求延迟
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // 从模拟数据中查找文章
        const articles = await fetchArticles();
        return articles.find(article => article.id === parseInt(id));
    } catch (error) {
        throw new Error('获取文章详情失败: ' + error.message);
    }
}

// 渲染文章详情
function renderArticleDetail(article) {
    const articleContainer = document.getElementById('articleContainer');
    
    // 分类标签样式映射
    const categoryLabels = {
        'welcome': '欢迎',
        'technology': '技术',
        'tutorial': '教程',
        'announcement': '公告'
    };
    
    articleContainer.innerHTML = `
        <div class="article-detail">
            <div class="article-header">
                <span class="category-tag ${article.category}">${categoryLabels[article.category] || article.category}</span>
                <h1>${article.title}</h1>
                <div class="article-meta-detail">
                    <span><i class="fas fa-calendar-alt"></i> ${article.date}</span>
                    <span><i class="fas fa-clock"></i> ${article.readTime}</span>
                </div>
            </div>
            <div class="article-content-detail">
                <p>${article.content}</p>
                <p>这里是文章的详细内容，在实际应用中可以是完整的Markdown转换后的HTML。</p>
                <p>这是一个段落示例，包含了一些文本内容。在实际项目中，文章内容将从后端获取并显示在这里。</p>
                <img src="https://picsum.photos/800/400" alt="示例图片" />
                <p>文章可能包含代码示例：</p>
                <pre><code class="language-javascript">function fetchData() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({ data: '这是一个代码示例' });
        }, 1000);
    });
}</code></pre>
                <p>继续文章内容...</p>
            </div>
            <a href="#" class="back-to-articles" id="backToArticles">
                <i class="fas fa-arrow-left"></i> 返回文章列表
            </a>
        </div>
    `;
    
    // 添加返回按钮事件
    document.getElementById('backToArticles').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('articleSection').style.display = 'none';
        document.getElementById('articlesSection').style.display = 'block';
    });
    
    // 显示文章区域，隐藏文章列表
    document.getElementById('articlesSection').style.display = 'none';
    document.getElementById('articleSection').style.display = 'block';
}

// 初始化导航栏滚动效果
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('py-0.5');
            navbar.classList.remove('py-1');
            navbar.classList.add('shadow-md');
        } else {
            navbar.classList.remove('py-0.5');
            navbar.classList.add('py-1');
            navbar.classList.remove('shadow-md');
        }
    });
}

// 初始化评论系统
function initComments() {
    const commentForm = document.getElementById('commentForm');
    
    if (commentForm) {
        commentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('commentName').value.trim();
            const email = document.getElementById('commentEmail').value.trim();
            const content = document.getElementById('commentContent').value.trim();
            
            if (!name || !email || !content) {
                showNotification('请填写所有字段', 'error');
                return;
            }
            
            try {
                // 显示加载中
                const submitBtn = document.getElementById('submitComment');
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> 提交中...';
                
                // 模拟提交评论
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // 添加新评论
                const commentsContainer = document.getElementById('commentsContainer');
                const newComment = createCommentElement(name, content);
                commentsContainer.prepend(newComment);
                
                // 重置表单
                commentForm.reset();
                
                // 显示成功通知
                showNotification('评论提交成功', 'success');
            } catch (error) {
                console.error('提交评论失败:', error);
                showNotification('提交评论失败，请稍后再试', 'error');
            } finally {
                // 恢复按钮状态
                const submitBtn = document.getElementById('submitComment');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i> 提交评论';
            }
        });
    }
}

// 创建评论元素
function createCommentElement(author, content) {
    const comment = document.createElement('div');
    comment.className = 'comment fade-in';
    
    const now = new Date();
    const dateString = now.toLocaleDateString();
    
    comment.innerHTML = `
        <div class="comment-header">
            <div class="comment-author">${author}</div>
            <div class="comment-date">${dateString}</div>
        </div>
        <div class="comment-content">
            ${content}
        </div>
    `;
    
    return comment;
}

// 初始化搜索功能
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    
    if (searchInput && searchButton) {
        searchButton.addEventListener('click', () => {
            performSearch(searchInput.value.trim());
        });
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch(searchInput.value.trim());
            }
        });
    }
}

// 执行搜索
function performSearch(query) {
    if (!query) {
        loadArticles(); // 如果查询为空，加载全部文章
        return;
    }
    
    // 模拟搜索效果
    const articles = document.querySelectorAll('.article-card');
    
    articles.forEach(article => {
        const title = article.querySelector('.article-title').textContent.toLowerCase();
        const summary = article.querySelector('.article-summary').textContent.toLowerCase();
        
        if (title.includes(query.toLowerCase()) || summary.includes(query.toLowerCase())) {
            article.style.display = 'block';
        } else {
            article.style.display = 'none';
        }
    });
}

// 初始化分类筛选
function initCategoryFilter() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 移除所有按钮的活跃状态
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            
            // 添加当前按钮的活跃状态
            button.classList.add('active');
            
            // 获取选中的分类
            const category = button.dataset.category;
            
            // 筛选文章
            filterArticlesByCategory(category);
        });
    });
}

// 按分类筛选文章
function filterArticlesByCategory(category) {
    const articles = document.querySelectorAll('.article-card');
    
    articles.forEach(article => {
        if (category === 'all' || article.dataset.category === category) {
            article.style.display = 'block';
        } else {
            article.style.display = 'none';
        }
    });
}

// 初始化标签筛选
function initTagFilter() {
    const tagButtons = document.querySelectorAll('.tag-btn');
    
    tagButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 移除所有按钮的活跃状态
            tagButtons.forEach(btn => btn.classList.remove('active'));
            
            // 添加当前按钮的活跃状态
            button.classList.add('active');
            
            // 获取选中的标签
            const tag = button.dataset.tag;
            
            // 模拟按标签筛选文章
            showNotification(`筛选标签: ${tag}`, 'success');
        });
    });
}

// 初始化回到顶部按钮
function initBackToTopButton() {
    const backToTopButton = document.getElementById('backToTop');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopButton.classList.add('show');
        } else {
            backToTopButton.classList.remove('show');
        }
    });
    
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// 初始化打字动画
function initTypewriterEffect() {
    const typewriterLines = document.querySelectorAll('.typewriter-line');
    
    typewriterLines.forEach((line, index) => {
        setTimeout(() => {
            const text = line.textContent;
            line.textContent = '';
            
            let i = 0;
            const typing = setInterval(() => {
                if (i < text.length) {
                    line.textContent += text.charAt(i);
                    i++;
                } else {
                    clearInterval(typing);
                }
            }, 100);
        }, index * 3500); // 每条线之间的延迟
    });
}

// 显示骨架屏
function showSkeletonCards(count) {
    const articlesContainer = document.getElementById('articlesContainer');
    articlesContainer.innerHTML = '';
    
    for (let i = 0; i < count; i++) {
        const skeletonCard = document.createElement('div');
        skeletonCard.className = 'article-card';
        skeletonCard.innerHTML = `
            <div class="skeleton skeleton-image"></div>
            <div class="article-content">
                <div class="skeleton skeleton-meta"></div>
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="article-footer">
                    <div class="skeleton skeleton-text" style="width: 30%;"></div>
                    <div class="skeleton skeleton-text" style="width: 20%;"></div>
                </div>
            </div>
        `;
        
        articlesContainer.appendChild(skeletonCard);
    }
}

// 隐藏骨架屏
function hideSkeletonCards() {
    const skeletons = document.querySelectorAll('.skeleton');
    skeletons.forEach(skeleton => {
        skeleton.style.display = 'none';
    });
}

// 添加淡入动画
function addFadeInAnimation() {
    const articles = document.querySelectorAll('.article-card');
    
    articles.forEach((article, index) => {
        setTimeout(() => {
            article.classList.add('fade-in');
        }, 100 * index);
    });
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
