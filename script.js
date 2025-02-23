document.addEventListener('DOMContentLoaded', () => {
    // 访问计数器
    let visitCount = localStorage.getItem('visitCount') || 0;
    visitCount++;
    localStorage.setItem('visitCount', visitCount);
    document.getElementById('visitCount').textContent = visitCount;

    // 加载文章列表
    loadArticles();

    // 平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);

            if (target) {
                // 计算偏移量（导航栏高度 + 20px间距）
                const offset = document.querySelector('.navbar').offsetHeight + 20;
                const targetPosition = target.offsetTop - offset;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // 更新URL哈希（无页面跳转）
                history.pushState(null, null, targetId);
            }
        });
    });

    // 监听滚动高亮当前章节
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.nav-links a');
        let currentSection = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop - 150 && window.scrollY < sectionTop + sectionHeight - 150) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    });
});

/**
 * 加载文章列表
 */
async function loadArticles() {
    try {
        const container = document.getElementById('articlesContainer');
        container.classList.add('loading'); // 显示加载状态

        // 从 data/articles.json 加载文章数据
        const response = await fetch('data/articles.json');
        if (!response.ok) throw new Error('无法加载文章数据');
        const articles = await response.json();

        // 渲染文章列表
        container.innerHTML = articles.map(article => `
            <div class="article-card" data-article="${article.id}">
                <div class="article-meta">
                    <span class="category-tag ${getCategoryClass(article.category)}">${article.category}</span>
                    <span class="article-date">${article.date}</span>
                </div>
                <h2 class="article-title">${article.title}</h2>
                <p>${article.summary}</p>
                <div class="article-footer">
                    <a class="read-more">阅读全文 <i class="fas fa-arrow-right"></i></a>
                    <span class="read-time">${article.readTime}分钟阅读</span>
                </div>
            </div>
        `).join('');

        // 为每篇文章卡片添加点击事件
        document.querySelectorAll('.article-card').forEach(card => {
            card.addEventListener('click', () => showArticle(card.dataset.article));
        });
    } catch (error) {
        console.error('加载文章失败:', error);
        document.getElementById('articlesContainer').innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                加载文章失败，请稍后重试。
            </div>
        `;
    } finally {
        container.classList.remove('loading'); // 隐藏加载状态
    }
}

/**
 * 获取文章分类的CSS类
 * @param {string} category - 文章类别
 * @returns {string} - 分类的CSS类名
 */
function getCategoryClass(category) {
    switch (category) {
        case '公告':
            return 'announcement';
        case '欢迎':
            return 'welcome';
        default:
            return 'default-category'; // 添加一个默认的类别
    }
}

/**
 * 显示文章详情
 * @param {string} articleId - 文章ID
 */
async function showArticle(articleId) {
    try {
        const container = document.getElementById('articleDetail');
        const list = document.getElementById('articlesContainer');

        // 隐藏文章列表，显示加载状态
        list.style.display = 'none';
        container.style.display = 'block';
        container.innerHTML = '<div class="loader"></div>';

        // 加载文章内容
        const response = await fetch(`articles/${articleId}.html`);
        if (!response.ok) throw new Error('文章加载失败');
        const content = await response.text();

        // 渲染文章内容
        container.innerHTML = `
            <button class="back-button" onclick="showArticleList()">
                <i class="fas fa-arrow-left"></i> 返回列表
            </button>
            <div class="article-content">
                ${content}
            </div>
        `;

        // 更新URL
        history.pushState({ article: articleId }, '', `#${articleId}`);
    } catch (error) {
        console.error('加载文章详情失败:', error);
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                ${error.message}
            </div>
        `;
    }
}

/**
 * 显示文章列表
 */
function showArticleList() {
    const container = document.getElementById('articleDetail');
    const list = document.getElementById('articlesContainer');

    // 隐藏文章详情，显示文章列表
    container.style.display = 'none';
    list.style.display = 'block';

    // 更新URL
    history.replaceState(null, '', window.location.pathname);
}

/**
 * 处理浏览器前进/后退
 */
window.addEventListener('popstate', (event) => {
    if (event.state && event.state.article) {
        // 如果状态中有文章ID，显示文章详情
        showArticle(event.state.article);
    } else {
        // 否则显示文章列表
        showArticleList();
    }
});
