// 评论系统
export function initComments(articleId) {
    // 加载现有评论
    loadComments(articleId);
    
    // 初始化评论表单提交
    const commentForm = document.getElementById('commentForm');
    
    if (commentForm) {
        commentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('commentName').value.trim();
            const email = document.getElementById('commentEmail').value.trim();
            const content = document.getElementById('commentContent').value.trim();
            
            if (!name || !email || !content) {
                showNotification('请填写所有必填字段', 'error');
                return;
            }
            
            try {
                // 显示加载中
                const submitBtn = document.getElementById('submitComment');
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> 提交中...';
                
                // 添加新评论
                const newComment = await addComment({
                    articleId,
                    author: name,
                    content
                });
                
                // 添加新评论到列表
                addCommentToUI(newComment);
                
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

// 加载评论
async function loadComments(articleId) {
    try {
        // 显示加载中
        const commentsContainer = document.getElementById('commentsContainer');
        commentsContainer.innerHTML = `
            <div class="text-center py-6">
                <div class="loading-spinner mx-auto"></div>
            </div>
        `;
        
        // 获取评论数据
        const comments = await fetchComments(articleId);
        
        // 渲染评论列表
        if (comments && comments.length > 0) {
            commentsContainer.innerHTML = '';
            comments.forEach(comment => {
                addCommentToUI(comment);
            });
        } else {
            commentsContainer.innerHTML = `
                <div class="text-center py-6 text-gray-500">
                    暂无评论，快来发表你的看法吧！
                </div>
            `;
        }
    } catch (error) {
        console.error('加载评论失败:', error);
        document.getElementById('commentsContainer').innerHTML = `
            <div class="text-center py-6 text-red-500">
                加载评论失败，请稍后再试
            </div>
        `;
    }
}

// 添加评论到UI
function addCommentToUI(comment) {
    const commentsContainer = document.getElementById('commentsContainer');
    
    const commentElement = document.createElement('div');
    commentElement.className = 'comment fade-in';
    
    commentElement.innerHTML = `
        <div class="comment-header">
            <div class="comment-author">${comment.author}</div>
            <div class="comment-date">${comment.date}</div>
        </div>
        <div class="comment-content">
            ${comment.content}
        </div>
    `;
    
    // 添加到容器顶部
    if (commentsContainer.firstChild) {
        commentsContainer.insertBefore(commentElement, commentsContainer.firstChild);
    } else {
        commentsContainer.appendChild(commentElement);
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

// 从API模块导入必要的函数
import { fetchComments, addComment } from './api.js';
