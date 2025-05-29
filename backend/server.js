const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const moment = require('moment');

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();
const port = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 创建数据库连接池
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'restaurant_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 测试数据库连接
app.get('/api/test-db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    res.json({
      code: 200,
      message: '数据库连接成功',
      data: rows[0]
    });
  } catch (error) {
    console.error('数据库连接失败:', error);
    res.status(500).json({
      code: 500,
      message: '数据库连接失败',
      error: error.message
    });
  }
});

// 注册路由
app.use('/api/category', require('./routes/category')(pool));
app.use('/api/dish', require('./routes/dish')(pool));
app.use('/api/supplier', require('./routes/supplier')(pool));
app.use('/api/ingredient', require('./routes/ingredient')(pool));
app.use('/api/employee', require('./routes/employee')(pool));
app.use('/api/member', require('./routes/member')(pool));
app.use('/api/order', require('./routes/order')(pool));
app.use('/api/inventory', require('./routes/inventory')(pool));
app.use('/api/statistics', require('./routes/statistics')(pool));

// 静态文件服务
app.use(express.static('public'));

// 启动服务器
app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});

// 处理未捕获的异常
process.on('uncaughtException', (err) => {
  console.error('未捕获的异常:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
});

module.exports = app;
