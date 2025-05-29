#!/bin/bash

# 餐饮经营管理系统启动脚本

echo "正在启动餐饮经营管理系统..."

# 检查环境
if ! command -v node &> /dev/null; then
    echo "错误: 未安装Node.js，请先安装Node.js"
    exit 1
fi

if ! command -v mysql &> /dev/null; then
    echo "警告: 未检测到MySQL命令行工具，但可能已安装MySQL服务"
fi

# 创建.env文件（如果不存在）
if [ ! -f ./backend/.env ]; then
    echo "创建默认环境配置文件..."
    cat > ./backend/.env << EOF
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=restaurant_db
PORT=3000
EOF
    echo "已创建默认环境配置文件，请根据实际情况修改 ./backend/.env"
fi

# 询问是否需要导入数据库
read -p "是否需要导入数据库? (y/n): " import_db
if [ "$import_db" = "y" ] || [ "$import_db" = "Y" ]; then
    read -p "请输入MySQL用户名 (默认: root): " db_user
    db_user=${db_user:-root}
    
    read -s -p "请输入MySQL密码: " db_password
    echo ""
    
    echo "正在导入数据库..."
    mysql -u $db_user -p$db_password < ./backend/restaurant_db.sql
    
    if [ $? -eq 0 ]; then
        echo "数据库导入成功!"
    else
        echo "数据库导入失败，请检查MySQL配置和权限"
        exit 1
    fi
fi

# 安装后端依赖
echo "正在安装后端依赖..."
cd backend
npm install

if [ $? -ne 0 ]; then
    echo "安装后端依赖失败，请检查网络连接和npm配置"
    exit 1
fi

# 启动后端服务
echo "正在启动后端服务..."
node server.js &
backend_pid=$!

# 等待后端服务启动
echo "等待后端服务启动..."
sleep 5

# 检查后端服务是否成功启动
if ! kill -0 $backend_pid 2>/dev/null; then
    echo "后端服务启动失败，请检查日志"
    exit 1
fi

echo "后端服务已启动，PID: $backend_pid"

# 启动前端服务
echo "正在启动前端服务..."
cd ../frontend

# 使用http-server或其他简单的HTTP服务器启动前端
if command -v npx &> /dev/null; then
    echo "使用http-server启动前端..."
    npx http-server -p 8080 &
    frontend_pid=$!
else
    echo "未找到npx，尝试使用Python启动简单HTTP服务器..."
    if command -v python3 &> /dev/null; then
        python3 -m http.server 8080 &
        frontend_pid=$!
    elif command -v python &> /dev/null; then
        python -m SimpleHTTPServer 8080 &
        frontend_pid=$!
    else
        echo "未找到合适的HTTP服务器，请手动启动前端"
        echo "可以使用以下命令之一:"
        echo "  - npx http-server -p 8080"
        echo "  - python3 -m http.server 8080"
        echo "  - python -m SimpleHTTPServer 8080"
    fi
fi

echo ""
echo "餐饮经营管理系统启动完成!"
echo "后端API地址: http://localhost:3000/api"
echo "前端页面地址: http://localhost:8080"
echo ""
echo "使用Ctrl+C停止服务"

# 等待用户中断
wait
