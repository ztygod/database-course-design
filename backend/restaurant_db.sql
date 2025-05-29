-- 餐饮经营管理系统数据库脚本

-- 创建数据库
DROP DATABASE IF EXISTS restaurant_db;
CREATE DATABASE restaurant_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE restaurant_db;

-- 创建菜品类别表
CREATE TABLE dish_category (
    category_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '类别ID',
    category_name VARCHAR(50) NOT NULL COMMENT '类别名称',
    description VARCHAR(255) COMMENT '类别描述',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_category_name (category_name)
) COMMENT='菜品类别表';

-- 创建菜品表
CREATE TABLE dish (
    dish_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '菜品ID',
    dish_name VARCHAR(100) NOT NULL COMMENT '菜品名称',
    category_id INT NOT NULL COMMENT '类别ID',
    price DECIMAL(10, 2) NOT NULL COMMENT '价格',
    description TEXT COMMENT '菜品描述',
    status TINYINT DEFAULT 1 COMMENT '状态：0-下架，1-上架',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_dish_name (dish_name),
    FOREIGN KEY (category_id) REFERENCES dish_category(category_id)
) COMMENT='菜品表';

-- 创建供应商表
CREATE TABLE supplier (
    supplier_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '供应商ID',
    supplier_name VARCHAR(100) NOT NULL COMMENT '供应商名称',
    contact_name VARCHAR(50) COMMENT '联系人',
    phone VARCHAR(20) COMMENT '联系电话',
    address VARCHAR(255) COMMENT '地址',
    email VARCHAR(100) COMMENT '邮箱',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_supplier_name (supplier_name)
) COMMENT='供应商表';

-- 创建原材料表
CREATE TABLE ingredient (
    ingredient_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '原材料ID',
    ingredient_name VARCHAR(100) NOT NULL COMMENT '原材料名称',
    supplier_id INT NOT NULL COMMENT '供应商ID',
    stock_quantity DECIMAL(10, 2) DEFAULT 0 COMMENT '库存数量',
    unit VARCHAR(20) COMMENT '单位',
    cost_price DECIMAL(10, 2) COMMENT '成本价',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_ingredient_name (ingredient_name),
    FOREIGN KEY (supplier_id) REFERENCES supplier(supplier_id)
) COMMENT='原材料表';

-- 创建菜品原材料关系表
CREATE TABLE dish_ingredient (
    relation_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '关系ID',
    dish_id INT NOT NULL COMMENT '菜品ID',
    ingredient_id INT NOT NULL COMMENT '原材料ID',
    quantity DECIMAL(10, 2) NOT NULL COMMENT '用量',
    unit VARCHAR(20) COMMENT '单位',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_dish_ingredient (dish_id, ingredient_id),
    FOREIGN KEY (dish_id) REFERENCES dish(dish_id),
    FOREIGN KEY (ingredient_id) REFERENCES ingredient(ingredient_id)
) COMMENT='菜品原材料关系表';

-- 创建员工表
CREATE TABLE employee (
    employee_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '员工ID',
    employee_name VARCHAR(50) NOT NULL COMMENT '员工姓名',
    gender CHAR(1) COMMENT '性别：M-男，F-女',
    phone VARCHAR(20) NOT NULL COMMENT '联系电话',
    position VARCHAR(50) NOT NULL COMMENT '职位',
    hire_date DATE NOT NULL COMMENT '入职日期',
    status TINYINT DEFAULT 1 COMMENT '状态：0-离职，1-在职',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_phone (phone)
) COMMENT='员工表';

-- 创建会员表
CREATE TABLE member (
    member_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '会员ID',
    card_number VARCHAR(20) NOT NULL COMMENT '会员卡号',
    member_name VARCHAR(50) NOT NULL COMMENT '会员姓名',
    phone VARCHAR(20) COMMENT '联系电话',
    level INT DEFAULT 1 COMMENT '会员等级',
    points INT DEFAULT 0 COMMENT '积分',
    register_date DATE NOT NULL COMMENT '注册日期',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_card_number (card_number)
) COMMENT='会员表';

-- 创建订单表
CREATE TABLE `order` (
    order_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '订单ID',
    order_number VARCHAR(20) NOT NULL COMMENT '订单编号',
    table_number VARCHAR(10) NOT NULL COMMENT '餐桌号',
    customer_count INT DEFAULT 1 COMMENT '就餐人数',
    employee_id INT NOT NULL COMMENT '服务员ID',
    member_id INT COMMENT '会员ID',
    total_amount DECIMAL(10, 2) DEFAULT 0 COMMENT '订单总金额',
    discount_amount DECIMAL(10, 2) DEFAULT 0 COMMENT '优惠金额',
    actual_amount DECIMAL(10, 2) DEFAULT 0 COMMENT '实付金额',
    status TINYINT DEFAULT 0 COMMENT '状态：0-未付款，1-已付款，2-已取消',
    payment_method VARCHAR(20) COMMENT '支付方式',
    order_time DATETIME NOT NULL COMMENT '下单时间',
    payment_time DATETIME COMMENT '支付时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_order_number (order_number),
    FOREIGN KEY (employee_id) REFERENCES employee(employee_id),
    FOREIGN KEY (member_id) REFERENCES member(member_id)
) COMMENT='订单表';

-- 创建订单明细表
CREATE TABLE order_detail (
    detail_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '明细ID',
    order_id INT NOT NULL COMMENT '订单ID',
    dish_id INT NOT NULL COMMENT '菜品ID',
    quantity INT NOT NULL COMMENT '数量',
    unit_price DECIMAL(10, 2) NOT NULL COMMENT '单价',
    subtotal DECIMAL(10, 2) NOT NULL COMMENT '小计',
    remark VARCHAR(255) COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (order_id) REFERENCES `order`(order_id),
    FOREIGN KEY (dish_id) REFERENCES dish(dish_id)
) COMMENT='订单明细表';

-- 创建库存记录表
CREATE TABLE inventory_record (
    record_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '记录ID',
    ingredient_id INT NOT NULL COMMENT '原材料ID',
    operation_type TINYINT NOT NULL COMMENT '操作类型：1-入库，2-出库',
    quantity DECIMAL(10, 2) NOT NULL COMMENT '数量',
    operation_time DATETIME NOT NULL COMMENT '操作时间',
    employee_id INT NOT NULL COMMENT '操作员ID',
    remark VARCHAR(255) COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (ingredient_id) REFERENCES ingredient(ingredient_id),
    FOREIGN KEY (employee_id) REFERENCES employee(employee_id)
) COMMENT='库存记录表';

-- 创建用户表
CREATE TABLE user (
    user_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    username VARCHAR(50) NOT NULL COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    employee_id INT COMMENT '关联员工ID',
    role VARCHAR(20) NOT NULL COMMENT '角色：admin-管理员，staff-员工',
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    last_login DATETIME COMMENT '最后登录时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_username (username),
    FOREIGN KEY (employee_id) REFERENCES employee(employee_id)
) COMMENT='用户表';

-- 创建视图：热销菜品视图
CREATE VIEW hot_dishes_view AS
SELECT 
    d.dish_id,
    d.dish_name,
    d.category_id,
    c.category_name,
    d.price,
    SUM(od.quantity) AS total_quantity,
    SUM(od.subtotal) AS total_amount
FROM dish d
JOIN dish_category c ON d.category_id = c.category_id
JOIN order_detail od ON d.dish_id = od.dish_id
JOIN `order` o ON od.order_id = o.order_id
WHERE o.status = 1
AND o.payment_time >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY d.dish_id
ORDER BY total_quantity DESC;

-- 创建视图：库存预警视图
CREATE VIEW inventory_warning_view AS
SELECT 
    i.ingredient_id,
    i.ingredient_name,
    i.supplier_id,
    s.supplier_name,
    i.stock_quantity,
    i.unit,
    i.cost_price
FROM ingredient i
JOIN supplier s ON i.supplier_id = s.supplier_id
WHERE i.stock_quantity < 10
ORDER BY i.stock_quantity;

-- 创建视图：会员消费统计视图
CREATE VIEW member_consumption_view AS
SELECT 
    m.member_id,
    m.card_number,
    m.member_name,
    m.level,
    m.points,
    COUNT(o.order_id) AS order_count,
    SUM(o.actual_amount) AS total_amount,
    MAX(o.payment_time) AS last_consumption_time
FROM member m
LEFT JOIN `order` o ON m.member_id = o.member_id AND o.status = 1
GROUP BY m.member_id;

-- 创建存储过程：创建订单
DELIMITER //
CREATE PROCEDURE create_order(
    IN p_table_number VARCHAR(10),
    IN p_customer_count INT,
    IN p_employee_id INT,
    IN p_member_id INT,
    OUT p_order_id INT
)
BEGIN
    DECLARE v_order_number VARCHAR(20);
    
    -- 生成订单编号（日期+4位随机数）
    SET v_order_number = CONCAT(
        DATE_FORMAT(NOW(), '%Y%m%d'),
        LPAD(FLOOR(RAND() * 10000), 4, '0')
    );
    
    -- 插入订单
    INSERT INTO `order` (
        order_number,
        table_number,
        customer_count,
        employee_id,
        member_id,
        status,
        order_time
    ) VALUES (
        v_order_number,
        p_table_number,
        p_customer_count,
        p_employee_id,
        p_member_id,
        0,
        NOW()
    );
    
    -- 返回订单ID
    SET p_order_id = LAST_INSERT_ID();
END //
DELIMITER ;

-- 创建存储过程：添加订单明细
DELIMITER //
CREATE PROCEDURE add_order_detail(
    IN p_order_id INT,
    IN p_dish_id INT,
    IN p_quantity INT,
    IN p_remark VARCHAR(255)
)
BEGIN
    DECLARE v_price DECIMAL(10, 2);
    DECLARE v_subtotal DECIMAL(10, 2);
    
    -- 获取菜品价格
    SELECT price INTO v_price FROM dish WHERE dish_id = p_dish_id;
    
    -- 计算小计
    SET v_subtotal = v_price * p_quantity;
    
    -- 插入订单明细
    INSERT INTO order_detail (
        order_id,
        dish_id,
        quantity,
        unit_price,
        subtotal,
        remark
    ) VALUES (
        p_order_id,
        p_dish_id,
        p_quantity,
        v_price,
        v_subtotal,
        p_remark
    );
    
    -- 更新订单总金额
    UPDATE `order`
    SET total_amount = total_amount + v_subtotal,
        actual_amount = actual_amount + v_subtotal
    WHERE order_id = p_order_id;
END //
DELIMITER ;

-- 创建存储过程：结算订单
DELIMITER //
CREATE PROCEDURE settle_order(
    IN p_order_id INT,
    IN p_payment_method VARCHAR(20),
    IN p_discount_amount DECIMAL(10, 2)
)
BEGIN
    DECLARE v_total_amount DECIMAL(10, 2);
    DECLARE v_actual_amount DECIMAL(10, 2);
    DECLARE v_member_id INT;
    DECLARE v_points INT;
    
    -- 获取订单信息
    SELECT total_amount, member_id INTO v_total_amount, v_member_id
    FROM `order`
    WHERE order_id = p_order_id;
    
    -- 计算实付金额
    SET v_actual_amount = v_total_amount - p_discount_amount;
    
    -- 更新订单状态
    UPDATE `order`
    SET status = 1,
        payment_method = p_payment_method,
        discount_amount = p_discount_amount,
        actual_amount = v_actual_amount,
        payment_time = NOW()
    WHERE order_id = p_order_id;
    
    -- 如果是会员，更新积分
    IF v_member_id IS NOT NULL THEN
        -- 积分为实付金额的整数部分
        SET v_points = FLOOR(v_actual_amount);
        
        -- 更新会员积分
        UPDATE member
        SET points = points + v_points
        WHERE member_id = v_member_id;
        
        -- 根据积分更新会员等级
        UPDATE member
        SET level = CASE
            WHEN points >= 2000 THEN 3
            WHEN points >= 1000 THEN 2
            ELSE 1
        END
        WHERE member_id = v_member_id;
    END IF;
END //
DELIMITER ;

-- 创建存储过程：库存操作
DELIMITER //
CREATE PROCEDURE inventory_operation(
    IN p_ingredient_id INT,
    IN p_operation_type TINYINT,
    IN p_quantity DECIMAL(10, 2),
    IN p_employee_id INT,
    IN p_remark VARCHAR(255)
)
BEGIN
    DECLARE v_current_stock DECIMAL(10, 2);
    DECLARE v_new_stock DECIMAL(10, 2);
    
    -- 获取当前库存
    SELECT stock_quantity INTO v_current_stock
    FROM ingredient
    WHERE ingredient_id = p_ingredient_id;
    
    -- 计算新库存
    IF p_operation_type = 1 THEN
        -- 入库
        SET v_new_stock = v_current_stock + p_quantity;
    ELSE
        -- 出库
        SET v_new_stock = v_current_stock - p_quantity;
        
        -- 检查库存是否足够
        IF v_new_stock < 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '库存不足';
        END IF;
    END IF;
    
    -- 插入库存记录
    INSERT INTO inventory_record (
        ingredient_id,
        operation_type,
        quantity,
        operation_time,
        employee_id,
        remark
    ) VALUES (
        p_ingredient_id,
        p_operation_type,
        p_quantity,
        NOW(),
        p_employee_id,
        p_remark
    );
    
    -- 更新库存
    UPDATE ingredient
    SET stock_quantity = v_new_stock
    WHERE ingredient_id = p_ingredient_id;
END //
DELIMITER ;

-- 创建触发器：订单明细删除触发器
DELIMITER //
CREATE TRIGGER order_detail_delete_trigger
AFTER DELETE ON order_detail
FOR EACH ROW
BEGIN
    -- 更新订单总金额
    UPDATE `order`
    SET total_amount = total_amount - OLD.subtotal,
        actual_amount = actual_amount - OLD.subtotal
    WHERE order_id = OLD.order_id;
END //
DELIMITER ;

-- 创建触发器：订单明细更新触发器
DELIMITER //
CREATE TRIGGER order_detail_update_trigger
AFTER UPDATE ON order_detail
FOR EACH ROW
BEGIN
    -- 更新订单总金额
    UPDATE `order`
    SET total_amount = total_amount - OLD.subtotal + NEW.subtotal,
        actual_amount = actual_amount - OLD.subtotal + NEW.subtotal
    WHERE order_id = NEW.order_id;
END //
DELIMITER ;

-- 插入示例数据：菜品类别
INSERT INTO dish_category (category_name, description) VALUES
('热菜', '各种热炒菜品'),
('凉菜', '各种凉拌菜品'),
('汤类', '各种汤品'),
('主食', '米饭、面食等'),
('饮品', '各种饮料');

-- 插入示例数据：菜品
INSERT INTO dish (dish_name, category_id, price, description, status) VALUES
('红烧肉', 1, 68.00, '经典红烧肉，肥而不腻', 1),
('宫保鸡丁', 1, 48.00, '麻辣鲜香，口感丰富', 1),
('水煮牛肉', 1, 88.00, '麻辣鲜香，肉质鲜嫩', 1),
('番茄炒蛋', 1, 28.00, '家常美味，酸甜可口', 1),
('凉拌黄瓜', 2, 18.00, '清脆爽口，开胃菜品', 1),
('皮蛋豆腐', 2, 22.00, '经典凉菜，口感丰富', 1),
('紫菜蛋花汤', 3, 20.00, '清淡鲜美，营养丰富', 1),
('酸辣汤', 3, 25.00, '酸辣可口，开胃解腻', 1),
('米饭', 4, 3.00, '香软可口的白米饭', 1),
('炒面', 4, 28.00, '经典炒面，配料丰富', 1),
('可乐', 5, 8.00, '冰镇可口可乐', 1),
('柠檬水', 5, 12.00, '新鲜柠檬制作，清爽解渴', 1);

-- 插入示例数据：供应商
INSERT INTO supplier (supplier_name, contact_name, phone, address, email) VALUES
('蔬菜供应商A', '张三', '13800138001', '北京市朝阳区XX路XX号', 'zhangsan@example.com'),
('肉类供应商B', '李四', '13800138002', '北京市海淀区XX路XX号', 'lisi@example.com'),
('调料供应商C', '王五', '13800138003', '北京市丰台区XX路XX号', 'wangwu@example.com'),
('饮料供应商D', '赵六', '13800138004', '北京市西城区XX路XX号', 'zhaoliu@example.com');

-- 插入示例数据：原材料
INSERT INTO ingredient (ingredient_name, supplier_id, stock_quantity, unit, cost_price) VALUES
('猪肉', 2, 50.00, '斤', 15.00),
('牛肉', 2, 30.00, '斤', 35.00),
('鸡肉', 2, 40.00, '斤', 12.00),
('黄瓜', 1, 20.00, '斤', 3.00),
('西红柿', 1, 15.00, '斤', 4.00),
('鸡蛋', 1, 60.00, '个', 1.50),
('大蒜', 1, 5.00, '斤', 8.00),
('姜', 1, 3.00, '斤', 10.00),
('花椒', 3, 2.00, '斤', 30.00),
('干辣椒', 3, 3.00, '斤', 25.00),
('酱油', 3, 10.00, '瓶', 12.00),
('食用油', 3, 20.00, '瓶', 20.00),
('可乐', 4, 50.00, '瓶', 3.00),
('柠檬', 1, 10.00, '斤', 8.00);

-- 插入示例数据：菜品原材料关系
INSERT INTO dish_ingredient (dish_id, ingredient_id, quantity, unit) VALUES
(1, 1, 1.00, '斤'),
(1, 11, 0.10, '瓶'),
(1, 12, 0.20, '瓶'),
(2, 3, 0.50, '斤'),
(2, 9, 0.05, '斤'),
(2, 10, 0.05, '斤'),
(3, 2, 1.00, '斤'),
(3, 9, 0.10, '斤'),
(3, 10, 0.10, '斤'),
(4, 5, 0.50, '斤'),
(4, 6, 3.00, '个'),
(5, 4, 1.00, '斤'),
(5, 7, 0.05, '斤');

-- 插入示例数据：员工
INSERT INTO employee (employee_name, gender, phone, position, hire_date, status) VALUES
('张经理', 'M', '13900139001', '经理', '2020-01-01', 1),
('李服务员', 'F', '13900139002', '服务员', '2020-03-15', 1),
('王厨师', 'M', '13900139003', '厨师', '2020-02-10', 1),
('赵收银', 'F', '13900139004', '收银员', '2020-04-20', 1),
('钱采购', 'M', '13900139005', '采购员', '2020-05-05', 1);

-- 插入示例数据：会员
INSERT INTO member (card_number, member_name, phone, level, points, register_date) VALUES
('M20210001', '刘会员', '13800138005', 1, 500, '2021-01-10'),
('M20210002', '陈会员', '13800138006', 2, 1200, '2021-02-15'),
('M20210003', '杨会员', '13800138007', 3, 2500, '2021-03-20');

-- 插入示例数据：用户
INSERT INTO user (username, password, employee_id, role, status) VALUES
('admin', 'e10adc3949ba59abbe56e057f20f883e', 1, 'admin', 1), -- 密码：123456
('staff1', 'e10adc3949ba59abbe56e057f20f883e', 2, 'staff', 1), -- 密码：123456
('staff2', 'e10adc3949ba59abbe56e057f20f883e', 3, 'staff', 1); -- 密码：123456

-- 插入示例数据：订单
INSERT INTO `order` (order_number, table_number, customer_count, employee_id, member_id, total_amount, discount_amount, actual_amount, status, payment_method, order_time, payment_time) VALUES
('202105010001', 'A1', 2, 2, 1, 138.00, 10.00, 128.00, 1, '微信支付', '2021-05-01 12:30:00', '2021-05-01 13:45:00'),
('202105010002', 'A2', 4, 2, 2, 256.00, 20.00, 236.00, 1, '支付宝', '2021-05-01 18:20:00', '2021-05-01 19:30:00'),
('202105020001', 'B1', 3, 2, 3, 198.00, 30.00, 168.00, 1, '现金', '2021-05-02 12:10:00', '2021-05-02 13:20:00'),
('202105020002', 'B2', 2, 2, NULL, 116.00, 0.00, 116.00, 1, '微信支付', '2021-05-02 19:15:00', '2021-05-02 20:25:00'),
('202105030001', 'C1', 5, 2, 1, 320.00, 15.00, 305.00, 1, '支付宝', '2021-05-03 12:40:00', '2021-05-03 14:00:00');

-- 插入示例数据：订单明细
INSERT INTO order_detail (order_id, dish_id, quantity, unit_price, subtotal, remark) VALUES
(1, 1, 1, 68.00, 68.00, NULL),
(1, 4, 1, 28.00, 28.00, NULL),
(1, 8, 1, 25.00, 25.00, NULL),
(1, 9, 2, 3.00, 6.00, NULL),
(1, 11, 1, 8.00, 8.00, NULL),
(2, 2, 1, 48.00, 48.00, NULL),
(2, 3, 1, 88.00, 88.00, NULL),
(2, 5, 1, 18.00, 18.00, NULL),
(2, 7, 1, 20.00, 20.00, NULL),
(2, 9, 4, 3.00, 12.00, NULL),
(2, 11, 2, 8.00, 16.00, NULL),
(2, 12, 2, 12.00, 24.00, NULL),
(3, 1, 1, 68.00, 68.00, NULL),
(3, 2, 1, 48.00, 48.00, NULL),
(3, 6, 1, 22.00, 22.00, NULL),
(3, 9, 3, 3.00, 9.00, NULL),
(3, 12, 3, 12.00, 36.00, NULL),
(4, 4, 1, 28.00, 28.00, NULL),
(4, 8, 1, 25.00, 25.00, NULL),
(4, 10, 1, 28.00, 28.00, NULL),
(4, 11, 2, 8.00, 16.00, NULL),
(4, 9, 2, 3.00, 6.00, NULL),
(5, 1, 2, 68.00, 136.00, NULL),
(5, 2, 1, 48.00, 48.00, NULL),
(5, 5, 2, 18.00, 36.00, NULL),
(5, 7, 2, 20.00, 40.00, NULL),
(5, 9, 5, 3.00, 15.00, NULL),
(5, 11, 3, 8.00, 24.00, NULL),
(5, 12, 1, 12.00, 12.00, NULL);

-- 插入示例数据：库存记录
INSERT INTO inventory_record (ingredient_id, operation_type, quantity, operation_time, employee_id, remark) VALUES
(1, 1, 60.00, '2021-04-28 09:30:00', 5, '初始入库'),
(2, 1, 40.00, '2021-04-28 09:35:00', 5, '初始入库'),
(3, 1, 50.00, '2021-04-28 09:40:00', 5, '初始入库'),
(4, 1, 30.00, '2021-04-28 09:45:00', 5, '初始入库'),
(5, 1, 25.00, '2021-04-28 09:50:00', 5, '初始入库'),
(6, 1, 80.00, '2021-04-28 09:55:00', 5, '初始入库'),
(1, 2, 10.00, '2021-05-01 08:30:00', 3, '日常消耗'),
(2, 2, 10.00, '2021-05-01 08:35:00', 3, '日常消耗'),
(3, 2, 10.00, '2021-05-01 08:40:00', 3, '日常消耗'),
(4, 2, 10.00, '2021-05-02 08:30:00', 3, '日常消耗'),
(5, 2, 10.00, '2021-05-02 08:35:00', 3, '日常消耗'),
(6, 2, 20.00, '2021-05-02 08:40:00', 3, '日常消耗');
