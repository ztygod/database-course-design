const express = require('express');
const router = express.Router();
const moment = require('moment');

module.exports = (pool) => {
  // 获取所有订单
  router.get('/', async (req, res) => {
    try {
      // 获取查询参数
      const { order_number, table_number, status, start_time, end_time, employee_id, member_id } = req.query;
      
      // 构建SQL查询
      let sql = `
        SELECT 
          o.order_id, 
          o.order_number, 
          o.table_number, 
          o.customer_count, 
          o.employee_id, 
          e.employee_name, 
          o.member_id, 
          m.member_name, 
          o.total_amount, 
          o.discount_amount, 
          o.actual_amount, 
          o.status, 
          o.payment_method, 
          o.order_time, 
          o.payment_time, 
          o.created_at, 
          o.updated_at 
        FROM \`order\` o
        LEFT JOIN employee e ON o.employee_id = e.employee_id
        LEFT JOIN member m ON o.member_id = m.member_id
        WHERE 1=1
      `;
      
      const params = [];
      
      // 添加筛选条件
      if (order_number) {
        sql += ` AND o.order_number LIKE ?`;
        params.push(`%${order_number}%`);
      }
      
      if (table_number) {
        sql += ` AND o.table_number LIKE ?`;
        params.push(`%${table_number}%`);
      }
      
      if (status !== undefined && status !== '') {
        sql += ` AND o.status = ?`;
        params.push(status);
      }
      
      if (start_time) {
        sql += ` AND o.order_time >= ?`;
        params.push(start_time);
      }
      
      if (end_time) {
        sql += ` AND o.order_time <= ?`;
        params.push(end_time);
      }
      
      if (employee_id) {
        sql += ` AND o.employee_id = ?`;
        params.push(employee_id);
      }
      
      if (member_id) {
        sql += ` AND o.member_id = ?`;
        params.push(member_id);
      }
      
      sql += ` ORDER BY o.order_time DESC`;
      
      // 执行查询
      const [rows] = await pool.query(sql, params);
      
      res.json({
        code: 200,
        message: '获取成功',
        data: rows
      });
    } catch (error) {
      console.error('获取订单失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取订单失败',
        error: error.message
      });
    }
  });

  // 获取单个订单
  router.get('/:id', async (req, res) => {
    try {
      const orderId = req.params.id;
      
      // 使用原生SQL查询单个订单
      const [orders] = await pool.query(`
        SELECT 
          o.order_id, 
          o.order_number, 
          o.table_number, 
          o.customer_count, 
          o.employee_id, 
          e.employee_name, 
          o.member_id, 
          m.member_name, 
          o.total_amount, 
          o.discount_amount, 
          o.actual_amount, 
          o.status, 
          o.payment_method, 
          o.order_time, 
          o.payment_time, 
          o.created_at, 
          o.updated_at 
        FROM \`order\` o
        LEFT JOIN employee e ON o.employee_id = e.employee_id
        LEFT JOIN member m ON o.member_id = m.member_id
        WHERE o.order_id = ?
      `, [orderId]);
      if (orders.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '订单不存在'
        });
      }
      
      const order = orders[0];
      
      // 查询订单明细
      const [order_detail] = await pool.query(`
        SELECT 
          od.detail_id,
          od.order_id,
          od.dish_id,
          d.dish_name,
          od.quantity,
          od.unit_price,
          od.subtotal,
          od.remark
        FROM order_detail od
        JOIN dish d ON od.dish_id = d.dish_id
        WHERE od.order_id = ?
      `, [orderId]);
      
      // 组合结果
      order.order_items = order_detail.map((item) => item.dish_id);
      console.log('dish_id',order_detail,order.order_items)
      
      res.json({
        code: 200,
        message: '获取成功',
        data: order
      });
    } catch (error) {
      console.error('获取订单失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取订单失败',
        error: error.message
      });
    }
  });

  // 获取订单明细
  router.get('/:id/detail',async (req,res) => {
    try{
      const orderId = req.params.id;
      // 查询订单明细
      const [order_detail] = await pool.query(`
        SELECT 
          od.detail_id,
          od.order_id,
          od.dish_id,
          d.dish_name,
          od.quantity,
          od.unit_price,
          od.subtotal,
          od.remark
        FROM order_detail od
        JOIN dish d ON od.dish_id = d.dish_id
        WHERE od.order_id = ?
      `, [orderId]);

      console.log('resdetail',order_detail)
      res.json({
          code: 200,
          message: '获取成功',
          data: order_detail
      });
    } catch (error) {
      console.error('获取订单明细失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取订单明细失败',
        error: error.message
      });
    }

  })

  // 创建订单
  router.post('/', async (req, res) => {
    try {
      const {  
        customer_count = 1, 
        employee_id, 
        member_id = null, 
        details = [] ,
        total_amount
      } = req.body;
      
      let table_number = 'A1'
      // 验证数据
      if (!table_number || !employee_id) {
        return res.status(400).json({
          code: 400,
          message: '餐桌号和服务员ID不能为空'
        });
      }
      
      // if (details.length === 0) {
      //   return res.status(400).json({
      //     code: 400,
      //     message: '订单明细不能为空'
      //   });
      // }
      
      // 检查服务员是否存在
      const [employees] = await pool.query(`
        SELECT employee_id FROM employee WHERE employee_id = ?
      `, [employee_id]);
      
      if (employees.length === 0) {
        return res.status(400).json({
          code: 400,
          message: '服务员不存在'
        });
      }
      
      // 如果提供了会员ID，检查会员是否存在
      if (member_id) {
        const [members] = await pool.query(`
          SELECT member_id FROM member WHERE member_id = ?
        `, [member_id]);
        
        if (members.length === 0) {
          return res.status(400).json({
            code: 400,
            message: '会员不存在'
          });
        }
      }
      
      // 生成订单编号（日期+4位随机数）
      const orderNumber = moment().format('YYYYMMDD') + Math.floor(1000 + Math.random() * 9000).toString();
      
      // 开始事务
      const connection = await pool.getConnection();
      await connection.beginTransaction();
      
      try {
        // 插入订单
        const [orderResult] = await connection.query(`
          INSERT INTO \`order\` (
            order_number, 
            table_number, 
            customer_count, 
            employee_id, 
            member_id, 
            status, 
            order_time
          ) 
          VALUES (?, ?, ?, ?, ?, ?, NOW())
        `, [orderNumber, table_number, customer_count, employee_id, member_id, 0]);
        
        const orderId = orderResult.insertId;
        
        // 插入订单明细
        let totalAmount = total_amount;
        console.log('totalAmount',total_amount,totalAmount)
        
        for (const detail of details) {
          // 检查菜品是否存在并获取价格
          const [dishes] = await connection.query(`
            SELECT dish_id, price FROM dish WHERE dish_id = ?
          `, [detail.dish_id]);
          
          if (dishes.length === 0) {
            continue;
          }
          
          const dish = dishes[0];
          const quantity = detail.quantity || 1;
          const unitPrice = dish.price;
          const subtotal = unitPrice * quantity;
          
          // 插入订单明细
          await connection.query(`
            INSERT INTO order_detail (
              order_id, 
              dish_id, 
              quantity, 
              unit_price, 
              subtotal, 
              remark
            ) 
            VALUES (?, ?, ?, ?, ?, ?)
          `, [orderId, dish.dish_id, quantity, unitPrice, subtotal, detail.remark || null]);
          
          totalAmount += subtotal;
        }
        
        // 更新订单总金额
        await connection.query(`
          UPDATE \`order\` 
          SET 
            total_amount = ?, 
            actual_amount = ? 
          WHERE order_id = ?
        `, [totalAmount, totalAmount, orderId]);
        
        // 提交事务
        await connection.commit();
        
        // 获取新创建的订单
        const [newOrder] = await pool.query(`
          SELECT 
            o.order_id, 
            o.order_number, 
            o.table_number, 
            o.customer_count, 
            o.employee_id, 
            e.employee_name, 
            o.member_id, 
            m.member_name, 
            o.total_amount, 
            o.discount_amount, 
            o.actual_amount, 
            o.status, 
            o.payment_method, 
            o.order_time, 
            o.payment_time, 
            o.created_at, 
            o.updated_at 
          FROM \`order\` o
          LEFT JOIN employee e ON o.employee_id = e.employee_id
          LEFT JOIN member m ON o.member_id = m.member_id
          WHERE o.order_id = ?
        `, [orderId]);
        
        res.status(201).json({
          code: 201,
          message: '创建成功',
          data: newOrder[0]
        });
      } catch (error) {
        // 回滚事务
        await connection.rollback();
        throw error;
      } finally {
        // 释放连接
        connection.release();
      }
    } catch (error) {
      console.error('创建订单失败:', error);
      res.status(500).json({
        code: 500,
        message: '创建订单失败',
        error: error.message
      });
    }
  });

  // 更新订单
  router.put('/:id', async (req, res) => {
    try {
      const orderId = req.params.id;
      const {  
        customer_count, 
        employee_id, 
        member_id, 
        total_amount
      } = req.body;
      const details = req.body.order_items
      console.log('resupdate',req.body,details)
      let table_number = 'A1'
      // 验证数据
      if (!table_number || !employee_id) {
        return res.status(400).json({
          code: 400,
          message: '餐桌号和服务员ID不能为空'
        });
      }
      
      // 检查订单是否存在
      const [orders] = await pool.query(`
        SELECT order_id, status FROM \`order\` WHERE order_id = ?
      `, [orderId]);
      
      if (orders.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '订单不存在'
        });
      }
      
      // 检查订单状态，已付款的订单不能修改
      if (orders[0].status === 1) {
        return res.status(400).json({
          code: 400,
          message: '已付款的订单不能修改'
        });
      }
      
      // 检查服务员是否存在
      const [employees] = await pool.query(`
        SELECT employee_id FROM employee WHERE employee_id = ?
      `, [employee_id]);
      
      if (employees.length === 0) {
        return res.status(400).json({
          code: 400,
          message: '服务员不存在'
        });
      }
      
      // 如果提供了会员ID，检查会员是否存在
      if (member_id) {
        const [members] = await pool.query(`
          SELECT member_id FROM member WHERE member_id = ?
        `, [member_id]);
        
        if (members.length === 0) {
          return res.status(400).json({
            code: 400,
            message: '会员不存在'
          });
        }
      }
      
      // 开始事务
      const connection = await pool.getConnection();
      await connection.beginTransaction();
      
      try {
        // 更新订单基本信息
        await connection.query(`
          UPDATE \`order\` 
          SET 
            table_number = ?, 
            customer_count = ?, 
            employee_id = ?, 
            member_id = ?, 
            updated_at = CURRENT_TIMESTAMP 
          WHERE order_id = ?
        `, [table_number, customer_count, employee_id, member_id, orderId]);
        
        // 如果提供了订单明细，更新明细
        if (details && details.length > 0) {
          // 删除旧的订单明细
          await connection.query(`
            DELETE FROM order_detail WHERE order_id = ?
          `, [orderId]);
          
          // 插入新的订单明细
          let totalAmount = total_amount;
          
          for (const detail of details) {
            // 检查菜品是否存在并获取价格
            const [dishes] = await connection.query(`
              SELECT dish_id, price FROM dish WHERE dish_id = ?
            `, [detail.dish_id]);
            
            if (dishes.length === 0) {
              continue;
            }
            
            const dish = dishes[0];
            const quantity = detail.quantity || 1;
            const unitPrice = dish.price;
            const subtotal = unitPrice * quantity;
            
            // 插入订单明细
            await connection.query(`
              INSERT INTO order_detail (
                order_id, 
                dish_id, 
                quantity, 
                unit_price, 
                subtotal, 
                remark
              ) 
              VALUES (?, ?, ?, ?, ?, ?)
            `, [orderId, dish.dish_id, quantity, unitPrice, subtotal, detail.remark || null]);
            
            totalAmount += subtotal;
          }
          
          // 更新订单总金额
          await connection.query(`
            UPDATE \`order\` 
            SET 
              total_amount = ?, 
              actual_amount = ? 
            WHERE order_id = ?
          `, [totalAmount, totalAmount, orderId]);
        }
        
        // 提交事务
        await connection.commit();
        
        // 获取更新后的订单
        const [updatedOrder] = await pool.query(`
          SELECT 
            o.order_id, 
            o.order_number, 
            o.table_number, 
            o.customer_count, 
            o.employee_id, 
            e.employee_name, 
            o.member_id, 
            m.member_name, 
            o.total_amount, 
            o.discount_amount, 
            o.actual_amount, 
            o.status, 
            o.payment_method, 
            o.order_time, 
            o.payment_time, 
            o.created_at, 
            o.updated_at 
          FROM \`order\` o
          LEFT JOIN employee e ON o.employee_id = e.employee_id
          LEFT JOIN member m ON o.member_id = m.member_id
          WHERE o.order_id = ?
        `, [orderId]);
        
        res.json({
          code: 200,
          message: '更新成功',
          data: updatedOrder[0]
        });
      } catch (error) {
        // 回滚事务
        await connection.rollback();
        throw error;
      } finally {
        // 释放连接
        connection.release();
      }
    } catch (error) {
      console.error('更新订单失败:', error);
      res.status(500).json({
        code: 500,
        message: '更新订单失败',
        error: error.message
      });
    }
  });

  // 删除订单
  router.delete('/:id', async (req, res) => {
    try {
      const orderId = req.params.id;
      
      // 检查订单是否存在
      const [orders] = await pool.query(`
        SELECT order_id, status FROM \`order\` WHERE order_id = ?
      `, [orderId]);
      
      if (orders.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '订单不存在'
        });
      }
      
      // 检查订单状态，已付款的订单不能删除
      if (orders[0].status === 1) {
        return res.status(400).json({
          code: 400,
          message: '已付款的订单不能删除'
        });
      }
      
      // 开始事务
      const connection = await pool.getConnection();
      await connection.beginTransaction();
      
      try {
        // 删除订单明细
        await connection.query(`
          DELETE FROM order_detail WHERE order_id = ?
        `, [orderId]);
        
        // 删除订单
        await connection.query(`
          DELETE FROM \`order\` WHERE order_id = ?
        `, [orderId]);
        
        // 提交事务
        await connection.commit();
        
        res.json({
          code: 200,
          message: '删除成功'
        });
      } catch (error) {
        // 回滚事务
        await connection.rollback();
        throw error;
      } finally {
        // 释放连接
        connection.release();
      }
    } catch (error) {
      console.error('删除订单失败:', error);
      res.status(500).json({
        code: 500,
        message: '删除订单失败',
        error: error.message
      });
    }
  });

  // 结算订单
  router.put('/:id/settle', async (req, res) => {
    try {
      const orderId = req.params.id;
      const { payment_method, discount_amount = 0 } = req.body;
      
      // 验证数据
      if (!payment_method) {
        return res.status(400).json({
          code: 400,
          message: '支付方式不能为空'
        });
      }
      
      // 检查订单是否存在
      const [orders] = await pool.query(`
        SELECT 
          o.order_id, 
          o.status, 
          o.total_amount, 
          o.member_id 
        FROM \`order\` o
        WHERE o.order_id = ?
      `, [orderId]);
      
      if (orders.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '订单不存在'
        });
      }
      
      const order = orders[0];
      
      // 检查订单状态，已付款的订单不能重复结算
      if (order.status === 1) {
        return res.status(400).json({
          code: 400,
          message: '订单已结算'
        });
      }
      
      // 计算实付金额
      const actualAmount = parseFloat(order.total_amount) - parseFloat(discount_amount);
      
      // 开始事务
      const connection = await pool.getConnection();
      await connection.beginTransaction();
      
      try {
        // 更新订单状态
        await connection.query(`
          UPDATE \`order\` 
          SET 
            status = 1, 
            payment_method = ?, 
            discount_amount = ?, 
            actual_amount = ?, 
            payment_time = NOW(), 
            updated_at = CURRENT_TIMESTAMP 
          WHERE order_id = ?
        `, [payment_method, discount_amount, actualAmount, orderId]);
        
        // 如果是会员，更新积分
        if (order.member_id) {
          // 积分为实付金额的整数部分
          const points = Math.floor(actualAmount);
          
          // 获取会员当前积分
          const [members] = await connection.query(`
            SELECT points FROM member WHERE member_id = ?
          `, [order.member_id]);
          
          if (members.length > 0) {
            const currentPoints = members[0].points;
            const newPoints = parseInt(currentPoints) + points;
            
            // 根据积分确定会员等级
            let level = 1;
            if (newPoints >= 2000) {
              level = 3;
            } else if (newPoints >= 1000) {
              level = 2;
            }
            
            // 更新会员积分和等级
            await connection.query(`
              UPDATE member 
              SET 
                points = ?, 
                level = ?, 
                updated_at = CURRENT_TIMESTAMP 
              WHERE member_id = ?
            `, [newPoints, level, order.member_id]);
          }
        }
        
        // 提交事务
        await connection.commit();
        
        // 获取更新后的订单
        const [updatedOrder] = await pool.query(`
          SELECT 
            o.order_id, 
            o.order_number, 
            o.table_number, 
            o.customer_count, 
            o.employee_id, 
            e.employee_name, 
            o.member_id, 
            m.member_name, 
            o.total_amount, 
            o.discount_amount, 
            o.actual_amount, 
            o.status, 
            o.payment_method, 
            o.order_time, 
            o.payment_time, 
            o.created_at, 
            o.updated_at 
          FROM \`order\` o
          LEFT JOIN employee e ON o.employee_id = e.employee_id
          LEFT JOIN member m ON o.member_id = m.member_id
          WHERE o.order_id = ?
        `, [orderId]);
        
        res.json({
          code: 200,
          message: '结算成功',
          data: updatedOrder[0]
        });
      } catch (error) {
        // 回滚事务
        await connection.rollback();
        throw error;
      } finally {
        // 释放连接
        connection.release();
      }
    } catch (error) {
      console.error('结算订单失败:', error);
      res.status(500).json({
        code: 500,
        message: '结算订单失败',
        error: error.message
      });
    }
  });

  // 取消订单
  router.put('/:id/cancel', async (req, res) => {
    try {
      const orderId = req.params.id;
      
      // 检查订单是否存在
      const [orders] = await pool.query(`
        SELECT order_id, status FROM \`order\` WHERE order_id = ?
      `, [orderId]);
      
      if (orders.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '订单不存在'
        });
      }
      
      // 检查订单状态，已付款的订单不能取消
      if (orders[0].status === 1) {
        return res.status(400).json({
          code: 400,
          message: '已付款的订单不能取消'
        });
      }
      
      // 更新订单状态
      await pool.query(`
        UPDATE \`order\` 
        SET 
          status = 2, 
          updated_at = CURRENT_TIMESTAMP 
        WHERE order_id = ?
      `, [orderId]);
      
      // 获取更新后的订单
      const [updatedOrder] = await pool.query(`
        SELECT 
          o.order_id, 
          o.order_number, 
          o.table_number, 
          o.customer_count, 
          o.employee_id, 
          e.employee_name, 
          o.member_id, 
          m.member_name, 
          o.total_amount, 
          o.discount_amount, 
          o.actual_amount, 
          o.status, 
          o.payment_method, 
          o.order_time, 
          o.payment_time, 
          o.created_at, 
          o.updated_at 
        FROM \`order\` o
        LEFT JOIN employee e ON o.employee_id = e.employee_id
        LEFT JOIN member m ON o.member_id = m.member_id
        WHERE o.order_id = ?
      `, [orderId]);
      
      res.json({
        code: 200,
        message: '取消成功',
        data: updatedOrder[0]
      });
    } catch (error) {
      console.error('取消订单失败:', error);
      res.status(500).json({
        code: 500,
        message: '取消订单失败',
        error: error.message
      });
    }
  });

  return router;
};
