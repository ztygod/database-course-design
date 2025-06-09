const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  // 获取所有库存记录
  router.get('/', async (req, res) => {
    try {
      // 获取查询参数
      const { ingredient_id, operation_type, employee_id, start_time, end_time } = req.query;
      
      // 构建SQL查询
      let sql = `
        SELECT 
          ir.record_id, 
          ir.ingredient_id, 
          i.ingredient_name, 
          ir.operation_type, 
          ir.quantity, 
          i.unit, 
          ir.operation_time, 
          ir.employee_id, 
          e.employee_name, 
          ir.remark, 
          ir.created_at, 
          ir.updated_at 
        FROM inventory_record ir
        JOIN ingredient i ON ir.ingredient_id = i.ingredient_id
        JOIN employee e ON ir.employee_id = e.employee_id
        WHERE 1=1
      `;
      
      const params = [];
      
      // 添加筛选条件
      if (ingredient_id) {
        sql += ` AND ir.ingredient_id = ?`;
        params.push(ingredient_id);
      }
      
      if (operation_type) {
        sql += ` AND ir.operation_type = ?`;
        params.push(operation_type);
      }
      
      if (employee_id) {
        sql += ` AND ir.employee_id = ?`;
        params.push(employee_id);
      }
      
      if (start_time) {
        sql += ` AND ir.operation_time >= ?`;
        params.push(start_time);
      }
      
      if (end_time) {
        sql += ` AND ir.operation_time <= ?`;
        params.push(end_time);
      }
      
      sql += ` ORDER BY ir.operation_time DESC`;
      
      // 执行查询
      const [rows] = await pool.query(sql, params);
      
      res.json({
        code: 200,
        message: '获取成功',
        data: rows
      });
    } catch (error) {
      console.error('获取库存记录失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取库存记录失败',
        error: error.message
      });
    }
  });

  // 获取单个库存记录
  router.get('/:id', async (req, res) => {
    try {
      const recordId = req.params.id;
      
      // 使用原生SQL查询单个库存记录
      const [rows] = await pool.query(`
        SELECT 
          ir.record_id, 
          ir.ingredient_id, 
          i.ingredient_name, 
          ir.operation_type, 
          ir.quantity, 
          i.unit, 
          ir.operation_time, 
          ir.employee_id, 
          e.employee_name, 
          ir.remark, 
          ir.created_at, 
          ir.updated_at 
        FROM inventory_record ir
        JOIN ingredient i ON ir.ingredient_id = i.ingredient_id
        JOIN employee e ON ir.employee_id = e.employee_id
        WHERE ir.record_id = ?
      `, [recordId]);
      
      if (rows.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '库存记录不存在'
        });
      }
      
      res.json({
        code: 200,
        message: '获取成功',
        data: rows[0]
      });
    } catch (error) {
      console.error('获取库存记录失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取库存记录失败',
        error: error.message
      });
    }
  });

  // 创建库存记录（入库/出库）
  router.post('/', async (req, res) => {
    try {
      const { ingredient_id, type, quantity, notes } = req.body;
      let operation_type;
      switch (type) {
        case 'in':
          operation_type = 1
          break;
        case 'out':
          operation_type = 2
          break;
      }
      let employee_id = 3;
      console.log(ingredient_id,type !== '1',quantity,notes)

      
      // 验证数据
      if (!ingredient_id || !type || !quantity || !notes) {
        return res.status(400).json({
          code: 400,
          message: '原材料ID、操作类型、数量和备注不能为空'
        });
      }
      
      // 检查操作类型是否有效
      if (operation_type !== 1 && operation_type !== 2) {
        return res.status(400).json({
          code: 400,
          message: '操作类型无效，应为1(入库)或2(出库)'
        });
      }
      
      // 检查数量是否有效
      if (parseFloat(quantity) <= 0) {
        return res.status(400).json({
          code: 400,
          message: '数量必须大于0'
        });
      }
      
      // 检查原材料是否存在
      const [ingredients] = await pool.query(`
        SELECT ingredient_id, ingredient_name, stock_quantity, unit 
        FROM ingredient 
        WHERE ingredient_id = ?
      `, [ingredient_id]);
      
      if (ingredients.length === 0) {
        return res.status(400).json({
          code: 400,
          message: '原材料不存在'
        });
      }
      
      const ingredient = ingredients[0];
      
      // 检查员工是否存在
      const [employees] = await pool.query(`
        SELECT employee_id FROM employee WHERE employee_id = ?
      `, [employee_id]);
      
      if (employees.length === 0) {
        return res.status(400).json({
          code: 400,
          message: '操作员不存在'
        });
      }
      
      // 如果是出库，检查库存是否足够
      if (operation_type === 2 && parseFloat(ingredient.stock_quantity) < parseFloat(quantity)) {
        return res.status(400).json({
          code: 400,
          message: '库存不足'
        });
      }
      
      // 开始事务
      const connection = await pool.getConnection();
      await connection.beginTransaction();
      
      try {
        // 插入库存记录
        const [result] = await connection.query(`
          INSERT INTO inventory_record (
            ingredient_id, 
            operation_type, 
            quantity, 
            operation_time, 
            employee_id, 
            remark
          ) 
          VALUES (?, ?, ?, NOW(), ?, ?)
        `, [ingredient_id, operation_type, quantity, employee_id, notes]);
        
        // 更新原材料库存
        let newStockQuantity;
        if (operation_type === 1) {
          // 入库
          newStockQuantity = parseFloat(ingredient.stock_quantity) + parseFloat(quantity);
        } else {
          // 出库
          newStockQuantity = parseFloat(ingredient.stock_quantity) - parseFloat(quantity);
        }
        
        await connection.query(`
          UPDATE ingredient 
          SET 
            stock_quantity = ?, 
            updated_at = CURRENT_TIMESTAMP 
          WHERE ingredient_id = ?
        `, [newStockQuantity, ingredient_id]);
        
        // 提交事务
        await connection.commit();
        
        // 获取新创建的库存记录
        const [newRecord] = await pool.query(`
          SELECT 
            ir.record_id, 
            ir.ingredient_id, 
            i.ingredient_name, 
            ir.operation_type, 
            ir.quantity, 
            i.unit, 
            ir.operation_time, 
            ir.employee_id, 
            e.employee_name, 
            ir.remark, 
            ir.created_at, 
            ir.updated_at 
          FROM inventory_record ir
          JOIN ingredient i ON ir.ingredient_id = i.ingredient_id
          JOIN employee e ON ir.employee_id = e.employee_id
          WHERE ir.record_id = ?
        `, [result.insertId]);
        
        res.status(201).json({
          code: 201,
          message: '创建成功',
          data: newRecord[0]
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
      console.error('创建库存记录失败:', error);
      res.status(500).json({
        code: 500,
        message: '创建库存记录失败',
        error: error.message
      });
    }
  });

  // 获取库存预警
  router.get('/warning/list', async (req, res) => {
    try {
      // 查询库存低于10的原材料
      const [rows] = await pool.query(`
        SELECT 
          i.ingredient_id, 
          i.ingredient_name, 
          i.supplier_id, 
          s.supplier_name, 
          i.stock_quantity, 
          i.unit, 
          i.cost_price, 
          i.created_at, 
          i.updated_at 
        FROM ingredient i
        JOIN supplier s ON i.supplier_id = s.supplier_id
        WHERE i.stock_quantity < 10
        ORDER BY i.stock_quantity
      `);
      
      res.json({
        code: 200,
        message: '获取成功',
        data: rows
      });
    } catch (error) {
      console.error('获取库存预警失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取库存预警失败',
        error: error.message
      });
    }
  });

  // 获取原材料库存变动历史
  router.get('/history/:ingredientId', async (req, res) => {
    try {
      const ingredientId = req.params.ingredientId;
      
      // 检查原材料是否存在
      const [ingredients] = await pool.query(`
        SELECT 
          i.ingredient_id, 
          i.ingredient_name, 
          i.supplier_id, 
          s.supplier_name, 
          i.stock_quantity, 
          i.unit, 
          i.cost_price, 
          i.created_at, 
          i.updated_at 
        FROM ingredient i
        JOIN supplier s ON i.supplier_id = s.supplier_id
        WHERE i.ingredient_id = ?
      `, [ingredientId]);
      
      if (ingredients.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '原材料不存在'
        });
      }
      
      // 查询原材料的库存记录
      const [records] = await pool.query(`
        SELECT 
          ir.record_id, 
          ir.ingredient_id, 
          i.ingredient_name, 
          ir.operation_type, 
          ir.quantity, 
          i.unit, 
          ir.operation_time, 
          ir.employee_id, 
          e.employee_name, 
          ir.remark, 
          ir.created_at, 
          ir.updated_at 
        FROM inventory_record ir
        JOIN ingredient i ON ir.ingredient_id = i.ingredient_id
        JOIN employee e ON ir.employee_id = e.employee_id
        WHERE ir.ingredient_id = ?
        ORDER BY ir.operation_time DESC
      `, [ingredientId]);
      
      res.json({
        code: 200,
        message: '获取成功',
        data: {
          ingredient: ingredients[0],
          records: records
        }
      });
    } catch (error) {
      console.error('获取原材料库存变动历史失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取原材料库存变动历史失败',
        error: error.message
      });
    }
  });

  return router;
};
