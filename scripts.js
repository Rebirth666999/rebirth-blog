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
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            
            if (target) {
                const offset = document.querySelector('.navbar').offsetHeight + 20;
                const targetPosition = target.offsetTop - offset;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                history.pushState(null, null, targetId);
            }
        });
    });

    // 滚动高亮导航
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

async function loadArticles() {
    try {
        const container = document.getElementById('articlesContainer');
        const response = await fetch('data/articles.json');
        const articles = await response.json();
        
        container.innerHTML = articles.map(article => `
            <div class="article-card" data-article="${article.id}">
                <div class="article-meta">
                    <span class="category-tag ${article.category === '教程' ? 'tutorial' : 'frontend'}">${article.category}</span>
                    <span class="article-date">${article.date}</span>
                </div>
                <h2 class="article-title">${article.title}</h2>
                <p>${article.summary}</p>
                <div class="article-footer">
                    <span class="read-time">${article.readTime}分钟阅读</span>
                </div>
            </div>
        `).join('');

        document.querySelectorAll('.article-card').forEach(card => {
            card.addEventListener('click', () => showArticle(card.dataset.article));
        });
    } catch (error) {
        console.error('加载文章失败:', error);
    }
}

async function showArticle(articleId) {
    try {
        const container = document.getElementById('articleDetail');
        const list = document.getElementById('articlesContainer');
        
        list.style.display = 'none';
        container.style.display = 'block';
        container.innerHTML = '<div class="loader"></div>';

        const response = await fetch(`articles/${articleId}.html`);
        if (!response.ok) throw new Error('文章加载失败');
        const content = await response.text();

        container.innerHTML = `
            <button class="back-button" onclick="showArticleList()">
                <i class="fas fa-arrow-left"></i> 返回列表
            </button>
            <div class="article-content">
                ${content}
            </div>
        `;

        history.pushState({ article: articleId }, '', `#${articleId}`);
    } catch (error) {
        container.innerHTML = `<div class="error-message">${error.message}</div>`;
    }
}

function showArticleList() {
    document.getElementById('articleDetail').style.display = 'none';
    document.getElementById('articlesContainer').style.display = 'block';
    history.replaceState(null, '', window.location.pathname);
}

window.addEventListener('popstate', (event) => {
    if (event.state && event.state.article) {
        showArticle(event.state.article);
    } else {
        showArticleList();
    }
});
