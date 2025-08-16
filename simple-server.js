const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const FRONTEND_DIR = path.join(__dirname, 'frontend');

// MIME类型映射
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    
    // 解析URL路径，确保从frontend目录提供文件
    let filePath;
    if (req.url === '/') {
        filePath = path.join(FRONTEND_DIR, 'index.html');
    } else {
        filePath = path.join(FRONTEND_DIR, req.url);
    }
    
    // 获取文件扩展名
    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeType = mimeTypes[extname] || 'application/octet-stream';
    
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // 处理OPTIONS预检请求
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // 读取并返回文件
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                console.log(`文件不存在: ${filePath}`);
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end(`
                    <html>
                        <head><title>404 Not Found</title></head>
                        <body>
                            <h1>404 - 文件未找到</h1>
                            <p>请求的文件不存在: ${req.url}</p>
                            <p><a href="/">返回首页</a></p>
                        </body>
                    </html>
                `);
            } else {
                console.error(`服务器错误: ${error.code} - ${error.message}`);
                res.writeHead(500);
                res.end(`服务器内部错误: ${error.code}`);
            }
        } else {
            console.log(`成功返回文件: ${filePath}`);
            res.writeHead(200, { 'Content-Type': mimeType });
            res.end(content);
        }
    });
});

server.listen(PORT, () => {
    console.log(`🚀 FHEVM保密投票dApp服务器已启动!`);
    console.log(`📱 访问地址: http://localhost:${PORT}`);
    console.log(`📁 前端目录: ${FRONTEND_DIR}`);
    console.log(`⏰ 启动时间: ${new Date().toLocaleString()}`);
    console.log(`\n🎯 现在可以在浏览器中访问您的dApp了！`);
    
    // 检查frontend目录是否存在
    if (!fs.existsSync(FRONTEND_DIR)) {
        console.error(`❌ 错误: frontend目录不存在: ${FRONTEND_DIR}`);
    } else {
        console.log(`✅ frontend目录存在: ${FRONTEND_DIR}`);
        
        // 列出frontend目录中的文件
        fs.readdir(FRONTEND_DIR, (err, files) => {
            if (err) {
                console.error(`❌ 无法读取frontend目录: ${err.message}`);
            } else {
                console.log(`📂 frontend目录包含文件: ${files.join(', ')}`);
            }
        });
    }
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n🛑 正在关闭服务器...');
    server.close(() => {
        console.log('✅ 服务器已关闭');
        process.exit(0);
    });
}); 