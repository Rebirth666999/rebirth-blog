// comment.js - 评论功能
// 初始化评论系统
function initComments() {
  const commentForm = document.getElementById('comment-form');
  if (commentForm) {
    commentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const commentText = document.getElementById('comment-text').value;
      if (!commentText.trim()) return;
      
      // 检查用户是否已登录
      if (!checkAuth()) {
        showToast('请先登录再发表评论', 'info');
        return;
      }
      
      try {
        showToast('提交评论中...', 'loading');
        
        // 提交评论到后端
        const response = await fetch('/api/comments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            articleId: getArticleIdFromUrl(),
            content: commentText
          })
        });
        
        if (!response.ok) {
          throw new Error(`提交评论失败: ${response.status}`);
        }
        
        // 清空评论框
        document.getElementById('comment-text').value = '';
        
        // 重新加载评论
        await loadComments();
        
        showToast('评论提交成功！', 'success');
      } catch (error) {
        console.error('提交评论时出错:', error);
        showToast('提交评论失败', 'error');
      }
    });
  }
  
  // 加载文章评论
  loadComments();
}

// 从URL获取文章ID
function getArticleIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id');
}

// 加载文章评论
async function loadComments() {
  try {
    const commentsContainer = document.getElementById('comments-container');
    if (!commentsContainer) return;
    
    const articleId = getArticleIdFromUrl();
    if (!articleId) return;
    
    showToast('加载评论中...', 'loading');
    
    // 从后端获取评论
    const response = await fetch(`/api/comments?articleId=${articleId}`);
    
    if (!response.ok) {
      throw new Error(`加载评论失败: ${response.status}`);
    }
    
    const comments = await response.json();
    
    // 渲染评论
    renderComments(comments);
  } catch (error) {
    console.error('加载评论时出错:', error);
    showToast('加载评论失败', 'error');
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

// 格式化日期
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// 在页面加载时初始化评论
document.addEventListener('DOMContentLoaded', () => {
  initComments();
});
