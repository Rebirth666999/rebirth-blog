// main.js - 完整的博客主逻辑
let currentArticleId = null;
let articles = [];

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', async () => {
  // 初始化导航栏交互
  initNavbar();
  
  // 检查是否有文章ID参数（查看单篇文章）
  const urlParams = new URLSearchParams(window.location.search);
  currentArticleId = urlParams.get('id');
  
  if (currentArticleId) {
    // 加载并显示单篇文章
    await loadArticle(currentArticleId);
  } else {
    // 加载并显示文章列表
    await loadArticlesList();
  }
  
  // 初始化评论系统
  initComments();
  
  // 检查用户登录状态
  checkAuthState();
});

// 加载文章列表
async function loadArticlesList() {
  try {
    showLoading('article-list-container', '加载文章列表中...');
    
    // 从 GitHub Gist 获取文章列表
    // 注意：这里需要一个包含文章元数据的 Gist ID
    const articlesGistId = 'YOUR_ARTICLES_METADATA_GIST_ID';
    const response = await fetch(`https://api.github.com/gists/${articlesGistId}`);
    
    if (!response.ok) {
      throw new Error(`获取文章列表失败: ${response.status}`);
    }
    
    const gist = await response.json();
    const file = Object.values(gist.files)[0];
    articles = JSON.parse(file.content);
    
    // 渲染文章列表
    renderArticlesList(articles);
  } catch (error) {
    console.error('加载文章列表时出错:', error);
    showError('article-list-container', '加载文章列表失败', error.message);
  }
}

// 渲染文章列表
function renderArticlesList(articles) {
  const container = document.getElementById('article-list-container');
  if (!container) return;
  
  if (articles.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>暂无文章</p>
      </div>
    `;
    return;
  }
  
  // 清空加载状态
  container.innerHTML = '';
  
  // 创建文章卡片
  articles.forEach(article => {
    const card = document.createElement('div');
    card.className = 'article-card';
    card.innerHTML = `
      <a href="?id=${article.id}" class="article-link">
        <h2 class="article-title">${article.title}</h2>
        <p class="article-meta">
          <span class="article-date">${formatDate(article.date)}</span>
          <span class="article-category">${article.category}</span>
        </p>
        <p class="article-excerpt">${article.excerpt}</p>
      </a>
    `;
    container.appendChild(card);
  });
}

// 加载单篇文章
async function loadArticle(id) {
  try {
    showLoading('article-container', '加载文章中...');
    
    // 从 GitHub Gist 加载文章
    const response = await fetch(`https://api.github.com/gists/${id}`);
    
    if (!response.ok) {
      throw new Error(`加载文章失败: ${response.status}`);
    }
    
    const gist = await response.json();
    // 假设 Gist 的第一个文件包含文章内容
    const file = Object.values(gist.files)[0];
    const articleContent = file.content;
    
    // 渲染文章内容
    const articleContainer = document.getElementById('article-container');
    if (articleContainer) {
      articleContainer.innerHTML = `
        <div class="article-content">
          ${marked.parse(articleContent)}
        </div>
        <div id="comments-container" class="comments-container"></div>
      `;
    }
    
    // 加载文章评论
    loadComments(id);
    
    // 更新页面标题
    const articleTitle = document.querySelector('.article-content h1')?.textContent || '文章';
    document.title = `${articleTitle} | Rebirth Blog`;
  } catch (error) {
    console.error('加载文章时出错:', error);
    showError('article-container', '文章加载失败', error.message);
  }
}

// 初始化评论系统
function initComments() {
  const commentForm = document.getElementById('comment-form');
  if (commentForm) {
    commentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const commentText = document.getElementById('comment-text').value;
      if (!commentText.trim()) return;
      
      try {
        showLoading('comments-container', '提交评论中...');
        
        // 提交评论到 GitHub Actions 处理
        const response = await fetch('/api/comments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            articleId: currentArticleId,
            content: commentText
          })
        });
        
        if (!response.ok) {
          throw new Error(`提交评论失败: ${response.status}`);
        }
        
        // 清空评论框
        document.getElementById('comment-text').value = '';
        
        // 重新加载评论
        await loadComments(currentArticleId);
        
        showToast('评论提交成功！', 'success');
      } catch (error) {
        console.error('提交评论时出错:', error);
        showError('comments-container', '提交评论失败', error.message);
      }
    });
  }
}

// 加载文章评论
async function loadComments(articleId) {
  try {
    const commentsContainer = document.getElementById('comments-container');
    if (!commentsContainer) return;
    
    showLoading('comments-container', '加载评论中...');
    
    // 从 GitHub 获取评论
    const response = await fetch(`/api/comments?articleId=${articleId}`);
    
    if (!response.ok) {
      throw new Error(`加载评论失败: ${response.status}`);
    }
    
    const comments = await response.json();
    
    // 渲染评论
    renderComments(comments);
  } catch (error) {
    console.error('加载评论时出错:', error);
    showError('comments-container', '加载评论失败', error.message);
  }
}

// 渲染评论
function renderComments(comments) {
  const commentsContainer = document.getElementById('comments-container');
  if (!commentsContainer) return;
  
  if (comments.length === 0) {
    commentsContainer.innerHTML = `
      <div class="empty-comments">
        <p>暂无评论</p>
      </div>
    `;
  } else {
    let html = '<div class="comments-list">';
    
    comments.forEach(comment => {
      html += `
        <div class="comment">
          <div class="comment-header">
            <img src="${comment.user.avatar_url}" alt="${comment.user.login}" class="comment-avatar">
            <div class="comment-user-info">
              <h4 class="comment-author">${comment.user.login}</h4>
              <p class="comment-date">${formatDate(comment.date)}</p>
            </div>
          </div>
          <div class="comment-content">
            ${marked.parse(comment.content)}
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    
    // 添加评论表单
    if (localStorage.getItem('token')) {
      html += `
        <div class="comment-form-container">
          <h3>发表评论</h3>
          <form id="comment-form">
            <textarea id="comment-text" rows="4" placeholder="写下你的评论..."></textarea>
            <button type="submit">提交评论</button>
          </form>
        </div>
      `;
    } else {
      html += `
        <div class="login-to-comment">
          <p>请 <a href="#" onclick="login()">登录</a> 后发表评论</p>
        </div>
      `;
    }
    
    commentsContainer.innerHTML = html;
  }
}

// 初始化导航栏交互
function initNavbar() {
  const navbarToggle = document.getElementById('navbar-toggle');
  const navbarMenu = document.getElementById('navbar-menu');
  
  if (navbarToggle && navbarMenu) {
    navbarToggle.addEventListener('click', () => {
      navbarMenu.classList.toggle('hidden');
    });
  }
}

// 检查用户认证状态
function checkAuthState() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  const loginButton = document.getElementById('login-button');
  const logoutButton = document.getElementById('logout-button');
  const userProfile = document.getElementById('user-profile');
  
  if (token && user) {
    // 用户已登录
    if (loginButton) loginButton.style.display = 'none';
    if (logoutButton) logoutButton.style.display = 'block';
    if (userProfile) {
      const userData = JSON.parse(user);
      userProfile.innerHTML = `
        <img src="${userData.avatar_url}" alt="${userData.login}" class="user-avatar">
        <span>${userData.login}</span>
      `;
      userProfile.style.display = 'flex';
    }
  } else {
    // 用户未登录
    if (loginButton) loginButton.style.display = 'block';
    if (logoutButton) logoutButton.style.display = 'none';
    if (userProfile) userProfile.style.display = 'none';
  }
}

// 显示加载状态
function showLoading(containerId, message = '加载中...') {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p>${message}</p>
      </div>
    `;
  }
}

// 显示错误信息
function showError(containerId, title, message) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = `
      <div class="error-state">
        <h3>${title}</h3>
        <p>${message}</p>
      </div>
    `;
  }
}

// 格式化日期
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// 显示提示消息
function showToast(message, type = 'info') {
  // 创建或获取toast容器
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'fixed bottom-4 right-4 z-50 flex flex-col gap-2';
    document.body.appendChild(toastContainer);
  }
  
  // 创建toast元素
  const toast = document.createElement('div');
  toast.className = `toast px-4 py-2 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out ${
    type === 'success' ? 'bg-green-500 text-white' :
    type === 'error' ? 'bg-red-500 text-white' :
    type === 'loading' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-white'
  }`;
  
  if (type === 'loading') {
    toast.innerHTML = `
      <div class="flex items-center">
        <div class="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ${message}
      </div>
    `;
  } else {
    toast.textContent = message;
  }
  
  // 添加toast到容器
  toastContainer.appendChild(toast);
  
  // 自动移除toast (除了loading类型)
  if (type !== 'loading') {
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
  }
}
