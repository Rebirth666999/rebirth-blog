// admin.js - 管理和认证功能
async function login() {
  try {
    // 从配置或环境变量获取客户端ID
    const clientId = 'YOUR_CLIENT_ID';
    const redirectUri = encodeURIComponent(getBaseUrl() + '/callback.html');
    
    // 构建GitHub OAuth授权URL
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}`;
    
    // 重定向到GitHub授权页面
    window.location.href = authUrl;
  } catch (error) {
    console.error('登录过程出错:', error);
    showToast('登录失败，请重试', 'error');
  }
}

// 处理GitHub OAuth回调
async function handleAuthCallback() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const error = params.get('error');
  
  // 检查是否有错误参数
  if (error) {
    const errorDescription = params.get('error_description') || '未知错误';
    console.error('GitHub授权错误:', error, errorDescription);
    showToast(`授权失败: ${errorDescription}`, 'error');
    return;
  }
  
  // 如果没有授权码，直接返回
  if (!code) {
    console.warn('未收到授权码');
    return;
  }
  
  try {
    // 显示加载状态
    showToast('正在验证身份...', 'loading');
    
    // 将授权码发送到我们的后端
    const response = await fetch('/api/auth/github', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code })
    });
    
    if (!response.ok) {
      throw new Error(`身份验证失败: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // 存储用户令牌和信息
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // 更新UI
    updateAuthUI(true);
    
    // 显示成功消息并跳转
    showToast('登录成功！', 'success');
    setTimeout(() => {
      window.location.href = '/';
    }, 1500);
  } catch (error) {
    console.error('处理回调时出错:', error);
    showToast('登录过程中发生错误', 'error');
  }
}

// 检查用户是否已登录
function checkAuth() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (token && user) {
    updateAuthUI(true, JSON.parse(user));
    return true;
  }
  
  updateAuthUI(false);
  return false;
}

// 更新UI以反映认证状态
function updateAuthUI(isAuthenticated, user = null) {
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const userProfile = document.getElementById('user-profile');
  
  if (loginBtn) {
    loginBtn.style.display = isAuthenticated ? 'none' : 'block';
  }
  
  if (logoutBtn) {
    logoutBtn.style.display = isAuthenticated ? 'block' : 'none';
  }
  
  if (userProfile && user) {
    userProfile.innerHTML = `
      <img src="${user.avatar_url}" alt="用户头像" class="avatar">
      <span class="username">${user.login}</span>
    `;
    userProfile.style.display = 'flex';
  }
  
  // 更新管理相关UI元素
  const adminPanel = document.getElementById('admin-panel');
  if (adminPanel) {
    adminPanel.style.display = isAuthenticated ? 'block' : 'none';
  }
}

// 登出功能
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  updateAuthUI(false);
  showToast('已登出', 'info');
}

// 获取当前页面的基础URL
function getBaseUrl() {
  return window.location.origin + window.location.pathname.split('/').slice(0, -1).join('/');
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

// 在页面加载时检查认证状态
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  
  // 检查是否是回调页面
  if (window.location.pathname.endsWith('/callback.html')) {
    handleAuthCallback();
  }
  
  // 添加登出按钮事件监听
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
  
  // 添加登录按钮事件监听
  const loginBtn = document.getElementById('login-btn');
  if (loginBtn) {
    loginBtn.addEventListener('click', login);
  }
});
