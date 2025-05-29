const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  // 获取销售统计数据
  router.get('/sales', async (req, res) => {
    try {
      // 获取查询参数
      const { start_time, end_time } = req.query;
      
      // 默认统计最近30天
      const defaultStartTime = new Date();
      defaultStartTime.setDate(defaultStartTime.getDate() - 30);
      
      const startDate = start_time ? new Date(start_time) : defaultStartTime;
      const endDate = end_time ? new Date(end_time) : new Date();
      
      // 格式化日期为MySQL格式
      const formatDate = (date) => {
        return date.toISOString().slice(0, 19).replace('T', ' ');
      };
      
      const formattedStartDate = formatDate(startDate);
      const formattedEndDate = formatDate(endDate);
      
      // 统计订单总数和总金额
      const [orderStats] = await pool.query(`
        SELECT 
          COUNT(*) AS total_orders,
          SUM(actual_amount) AS total_amount
        FROM \`order\`
        WHERE status = 1
        AND payment_time BETWEEN ? AND ?
      `, [formattedStartDate, formattedEndDate]);
      
      // 统计各菜品销量
      const [dishSales] = await pool.query(`
        SELECT 
          d.dish_id,
          d.dish_name,
          SUM(od.quantity) AS total_quantity,
          SUM(od.subtotal) AS total_amount
        FROM order_detail od
        JOIN dish d ON od.dish_id = d.dish_id
        JOIN \`order\` o ON od.order_id = o.order_id
        WHERE o.status = 1
        AND o.payment_time BETWEEN ? AND ?
        GROUP BY d.dish_id
        ORDER BY total_amount DESC
        LIMIT 10
      `, [formattedStartDate, formattedEndDate]);
      
      // 统计各类别销量
      const [categorySales] = await pool.query(`
        SELECT 
          c.category_id,
          c.category_name,
          SUM(od.quantity) AS total_quantity,
          SUM(od.subtotal) AS total_amount
        FROM order_detail od
        JOIN dish d ON od.dish_id = d.dish_id
        JOIN dish_category c ON d.category_id = c.category_id
        JOIN \`order\` o ON od.order_id = o.order_id
        WHERE o.status = 1
        AND o.payment_time BETWEEN ? AND ?
        GROUP BY c.category_id
        ORDER BY total_amount DESC
      `, [formattedStartDate, formattedEndDate]);
      
      // 统计每日销售额
      const [dailySales] = await pool.query(`
        SELECT 
          DATE(o.payment_time) AS date,
          COUNT(DISTINCT o.order_id) AS order_count,
          SUM(o.actual_amount) AS total_amount
        FROM \`order\` o
        WHERE o.status = 1
        AND o.payment_time BETWEEN ? AND ?
        GROUP BY DATE(o.payment_time)
        ORDER BY date
      `, [formattedStartDate, formattedEndDate]);
      
      res.json({
        code: 200,
        message: '获取成功',
        data: {
          total_orders: orderStats[0].total_orders || 0,
          total_amount: parseFloat(orderStats[0].total_amount || 0),
          dish_sales: dishSales,
          category_sales: categorySales,
          daily_sales: dailySales
        }
      });
    } catch (error) {
      console.error('获取销售统计失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取销售统计失败',
        error: error.message
      });
    }
  });

  // 获取会员统计数据
  router.get('/members', async (req, res) => {
    try {
      // 统计会员总数
      const [memberCount] = await pool.query(`
        SELECT COUNT(*) AS total_members
        FROM member
      `);
      
      // 统计各等级会员数量
      const [levelStats] = await pool.query(`
        SELECT 
          level,
          COUNT(*) AS count
        FROM member
        GROUP BY level
        ORDER BY level
      `);
      
      // 统计消费最多的会员
      const [topMembers] = await pool.query(`
        SELECT 
          m.member_id,
          m.member_name,
          m.card_number,
          m.level,
          m.points,
          COUNT(o.order_id) AS order_count,
          SUM(o.actual_amount) AS total_amount
        FROM member m
        JOIN \`order\` o ON m.member_id = o.member_id
        WHERE o.status = 1
        GROUP BY m.member_id
        ORDER BY total_amount DESC
        LIMIT 10
      `);
      
      res.json({
        code: 200,
        message: '获取成功',
        data: {
          total_members: memberCount[0].total_members,
          level_statistics: levelStats,
          top_members: topMembers
        }
      });
    } catch (error) {
      console.error('获取会员统计失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取会员统计失败',
        error: error.message
      });
    }
  });

  // 获取库存统计数据
  router.get('/inventory', async (req, res) => {
    try {
      // 统计库存预警数量
      const [warningCount] = await pool.query(`
        SELECT COUNT(*) AS count
        FROM ingredient
        WHERE stock_quantity < 10
      `);
      
      // 统计各供应商原材料数量和价值
      const [supplierStats] = await pool.query(`
        SELECT 
          s.supplier_id,
          s.supplier_name,
          COUNT(i.ingredient_id) AS ingredient_count,
          SUM(i.stock_quantity * i.cost_price) AS total_value
        FROM supplier s
        LEFT JOIN ingredient i ON s.supplier_id = i.supplier_id
        GROUP BY s.supplier_id
        ORDER BY total_value DESC
      `);
      
      // 统计库存总价值
      const [totalValue] = await pool.query(`
        SELECT SUM(stock_quantity * cost_price) AS total_value
        FROM ingredient
      `);
      
      // 统计最近30天入库和出库数量
      const [inventoryTrend] = await pool.query(`
        SELECT 
          DATE(operation_time) AS date,
          operation_type,
          SUM(quantity) AS total_quantity
        FROM inventory_record
        WHERE operation_time >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY DATE(operation_time), operation_type
        ORDER BY date
      `);
      
      res.json({
        code: 200,
        message: '获取成功',
        data: {
          warning_count: warningCount[0].count,
          supplier_statistics: supplierStats,
          total_value: parseFloat(totalValue[0].total_value || 0),
          inventory_trend: inventoryTrend
        }
      });
    } catch (error) {
      console.error('获取库存统计失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取库存统计失败',
        error: error.message
      });
    }
  });

  // 获取仪表盘数据
  router.get('/dashboard', async (req, res) => {
    try {
      // 今日订单数
      const [todayOrders] = await pool.query(`
        SELECT COUNT(*) AS count
        FROM \`order\`
        WHERE DATE(order_time) = CURDATE()
      `);
      
      // 今日销售额
      const [todaySales] = await pool.query(`
        SELECT SUM(actual_amount) AS amount
        FROM \`order\`
        WHERE DATE(payment_time) = CURDATE()
        AND status = 1
      `);
      
      // 会员总数
      const [memberCount] = await pool.query(`
        SELECT COUNT(*) AS count
        FROM member
      `);
      
      // 库存预警数量
      const [warningCount] = await pool.query(`
        SELECT COUNT(*) AS count
        FROM ingredient
        WHERE stock_quantity < 10
      `);
      
      // 热销菜品
      const [hotDishes] = await pool.query(`
        SELECT 
          d.dish_id,
          d.dish_name,
          SUM(od.quantity) AS total_quantity,
          SUM(od.subtotal) AS total_amount
        FROM order_detail od
        JOIN dish d ON od.dish_id = d.dish_id
        JOIN \`order\` o ON od.order_id = o.order_id
        WHERE o.status = 1
        AND o.payment_time >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY d.dish_id
        ORDER BY total_quantity DESC
        LIMIT 5
      `);
      
      // 最近7天销售趋势
      const [salesTrend] = await pool.query(`
        SELECT 
          DATE(payment_time) AS date,
          COUNT(*) AS order_count,
          SUM(actual_amount) AS total_amount
        FROM \`order\`
        WHERE status = 1
        AND payment_time >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY DATE(payment_time)
        ORDER BY date
      `);
      
      res.json({
        code: 200,
        message: '获取成功',
        data: {
          today_orders: todayOrders[0].count,
          today_sales: parseFloat(todaySales[0].amount || 0),
          member_count: memberCount[0].count,
          warning_count: warningCount[0].count,
          hot_dishes: hotDishes,
          sales_trend: salesTrend
        }
      });
    } catch (error) {
      console.error('获取仪表盘数据失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取仪表盘数据失败',
        error: error.message
      });
    }
  });

  // 获取员工业绩统计
  router.get('/employee-performance', async (req, res) => {
    try {
      // 获取查询参数
      const { start_time, end_time } = req.query;
      
      // 默认统计最近30天
      const defaultStartTime = new Date();
      defaultStartTime.setDate(defaultStartTime.getDate() - 30);
      
      const startDate = start_time ? new Date(start_time) : defaultStartTime;
      const endDate = end_time ? new Date(end_time) : new Date();
      
      // 格式化日期为MySQL格式
      const formatDate = (date) => {
        return date.toISOString().slice(0, 19).replace('T', ' ');
      };
      
      const formattedStartDate = formatDate(startDate);
      const formattedEndDate = formatDate(endDate);
      
      // 员工业绩统计
      const [employeeStats] = await pool.query(`
        SELECT 
          e.employee_id,
          e.employee_name,
          e.position,
          COUNT(o.order_id) AS order_count,
          SUM(o.actual_amount) AS total_amount,
          AVG(o.actual_amount) AS avg_amount
        FROM employee e
        LEFT JOIN \`order\` o ON e.employee_id = o.employee_id
        WHERE o.status = 1
        AND o.payment_time BETWEEN ? AND ?
        GROUP BY e.employee_id
        ORDER BY total_amount DESC
      `, [formattedStartDate, formattedEndDate]);
      
      res.json({
        code: 200,
        message: '获取成功',
        data: employeeStats
      });
    } catch (error) {
      console.error('获取员工业绩统计失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取员工业绩统计失败',
        error: error.message
      });
    }
  });

  return router;
};
