
// API 配置
const API_BASE_URL = 'https://api.github.com/gists';
const GIST_ID = 'YOUR_GIST_ID'; // 替换为你的 GitHub Gist ID
const GITHUB_TOKEN = 'YOUR_GITHUB_TOKEN'; // 替换为你的 GitHub Token

// 获取文章列表
export async function fetchArticles() {
    try {
        const response = await fetch(`${API_BASE_URL}/${GIST_ID}`, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': `token ${GITHUB_TOKEN}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`API 请求失败: ${response.status}`);
        }
        
        const data = await response.json();
        // 假设 Gist 中包含一个名为 articles.json 的文件
        const articlesJson = data.files['articles.json'].content;
        return JSON.parse(articlesJson);
    } catch (error) {
        console.error('获取文章列表失败:', error);
        // 返回模拟数据，以便在开发环境中正常工作
        return getMockArticles();
    }
}

// 获取单篇文章详情
export async function fetchArticleDetail(id) {
    try {
        const articles = await fetchArticles();
        return articles.find(article => article.id === parseInt(id));
    } catch (error) {
        console.error('获取文章详情失败:', error);
        throw error;
    }
}

// 添加新文章
export async function addArticle(article) {
    try {
        const articles = await fetchArticles();
        
        // 生成新文章ID
        const newId = articles.length > 0 
            ? Math.max(...articles.map(a => a.id)) + 1 
            : 1;
        
        const newArticle = {
            id: newId,
            ...article
        };
        
        // 更新文章列表
        const updatedArticles = [...articles, newArticle];
        
        // 将更新保存到 Gist
        await updateGistArticles(updatedArticles);
        
        return newArticle;
    } catch (error) {
        console.error('添加文章失败:', error);
        throw error;
    }
}

// 更新文章
export async function updateArticle(id, articleData) {
    try {
        const articles = await fetchArticles();
        
        // 找到要更新的文章
        const articleIndex = articles.findIndex(a => a.id === parseInt(id));
        
        if (articleIndex === -1) {
            throw new Error('文章不存在');
        }
        
        // 更新文章数据
        const updatedArticle = {
            ...articles[articleIndex],
            ...articleData
        };
        
        // 更新文章列表
        const updatedArticles = [...articles];
        updatedArticles[articleIndex] = updatedArticle;
        
        // 将更新保存到 Gist
        await updateGistArticles(updatedArticles);
        
        return updatedArticle;
    } catch (error) {
        console.error('更新文章失败:', error);
        throw error;
    }
}

// 删除文章
export async function deleteArticle(id) {
    try {
        const articles = await fetchArticles();
        
        // 过滤掉要删除的文章
        const updatedArticles = articles.filter(a => a.id !== parseInt(id));
        
        // 将更新保存到 Gist
        await updateGistArticles(updatedArticles);
        
        return true;
    } catch (error) {
        console.error('删除文章失败:', error);
        throw error;
    }
}

// 获取评论列表
export async function fetchComments(articleId) {
    try {
        const response = await fetch(`${API_BASE_URL}/${GIST_ID}`, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': `token ${GITHUB_TOKEN}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`API 请求失败: ${response.status}`);
        }
        
        const data = await response.json();
        // 假设 Gist 中包含一个名为 comments.json 的文件
        const commentsJson = data.files['comments.json'].content;
        const allComments = JSON.parse(commentsJson);
        
        // 过滤特定文章的评论
        return allComments.filter(comment => comment.articleId === parseInt(articleId));
    } catch (error) {
        console.error('获取评论列表失败:', error);
        // 返回模拟数据，以便在开发环境中正常工作
        return getMockComments(articleId);
    }
}

// 添加新评论
export async function addComment(comment) {
    try {
        const response = await fetch(`${API_BASE_URL}/${GIST_ID}`, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': `token ${GITHUB_TOKEN}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`API 请求失败: ${response.status}`);
        }
        
        const data = await response.json();
        // 假设 Gist 中包含一个名为 comments.json 的文件
        const commentsJson = data.files['comments.json'].content;
        let allComments = JSON.parse(commentsJson);
        
        // 生成新评论ID
        const newId = allComments.length > 0 
            ? Math.max(...allComments.map(c => c.id)) + 1 
            : 1;
        
        const newComment = {
            id: newId,
            date: new Date().toISOString().split('T')[0],
            ...comment
        };
        
        // 添加新评论
        allComments = [...allComments, newComment];
        
        // 更新 Gist
        const updatedFiles = {
            ...data.files,
            'comments.json': {
                content: JSON.stringify(allComments, null, 2)
            }
        };
        
        const updateResponse = await fetch(`${API_BASE_URL}/${GIST_ID}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `token ${GITHUB_TOKEN}`
            },
            body: JSON.stringify({
                files: updatedFiles
            })
        });
        
        if (!updateResponse.ok) {
            throw new Error(`更新 Gist 失败: ${updateResponse.status}`);
        }
        
        return newComment;
    } catch (error) {
        console.error('添加评论失败:', error);
        throw error;
    }
}

// 更新 Gist 中的文章数据
async function updateGistArticles(articles) {
    try {
        const response = await fetch(`${API_BASE_URL}/${GIST_ID}`, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': `token ${GITHUB_TOKEN}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`API 请求失败: ${response.status}`);
        }
        
        const data = await response.json();
        
        // 更新文章文件
        const updatedFiles = {
            ...data.files,
            'articles.json': {
                content: JSON.stringify(articles, null, 2)
            }
        };
        
        // 提交更新
        const updateResponse = await fetch(`${API_BASE_URL}/${GIST_ID}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `token ${GITHUB_TOKEN}`
            },
            body: JSON.stringify({
                files: updatedFiles
            })
        });
        
        if (!updateResponse.ok) {
            throw new Error(`更新 Gist 失败: ${updateResponse.status}`);
        }
        
        return true;
    } catch (error) {
        console.error('更新 Gist 失败:', error);
        throw error;
    }
}

// 获取模拟文章数据
function getMockArticles() {
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
        }
    ];
}

// 获取模拟评论数据
function getMockComments(articleId) {
    const allComments = [
        {
            id: 1,
            articleId: 1,
            author: '张三',
            content: '非常好的文章，感谢分享！',
            date: '2023-05-16'
        },
        {
            id: 2,
            articleId: 1,
            author: '李四',
            content: '期待更多内容！',
            date: '2023-05-17'
        },
        {
            id: 3,
            articleId: 2,
            author: '王五',
            content: '讲解很详细，受益匪浅！',
            date: '2023-05-21'
        }
    ];
    
    return allComments.filter(comment => comment.articleId === parseInt(articleId));
}
