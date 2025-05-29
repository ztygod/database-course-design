const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  // 获取所有原材料
  router.get('/', async (req, res) => {
    try {
      // 获取查询参数
      const { ingredient_name, supplier_id, stock_warning } = req.query;
      
      // 构建SQL查询
      let sql = `
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
        WHERE 1=1
      `;
      
      const params = [];
      
      // 添加筛选条件
      if (ingredient_name) {
        sql += ` AND i.ingredient_name LIKE ?`;
        params.push(`%${ingredient_name}%`);
      }
      
      if (supplier_id) {
        sql += ` AND i.supplier_id = ?`;
        params.push(supplier_id);
      }
      
      if (stock_warning === 'true') {
        sql += ` AND i.stock_quantity < 10`;
      }
      
      sql += ` ORDER BY i.ingredient_id`;
      
      // 执行查询
      const [rows] = await pool.query(sql, params);
      
      res.json({
        code: 200,
        message: '获取成功',
        data: rows
      });
    } catch (error) {
      console.error('获取原材料失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取原材料失败',
        error: error.message
      });
    }
  });

  // 获取单个原材料
  router.get('/:id', async (req, res) => {
    try {
      const ingredientId = req.params.id;
      
      // 使用原生SQL查询单个原材料
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
        WHERE i.ingredient_id = ?
      `, [ingredientId]);
      
      if (rows.length === 0) {
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
          ir.operation_type,
          ir.quantity,
          ir.operation_time,
          ir.employee_id,
          e.employee_name,
          ir.remark
        FROM inventory_record ir
        LEFT JOIN employee e ON ir.employee_id = e.employee_id
        WHERE ir.ingredient_id = ?
        ORDER BY ir.operation_time DESC
        LIMIT 10
      `, [ingredientId]);
      
      // 查询使用该原材料的菜品
      const [dishes] = await pool.query(`
        SELECT 
          d.dish_id,
          d.dish_name,
          di.quantity,
          di.unit
        FROM dish_ingredient di
        JOIN dish d ON di.dish_id = d.dish_id
        WHERE di.ingredient_id = ?
      `, [ingredientId]);
      
      // 组合结果
      const ingredient = rows[0];
      ingredient.records = records;
      ingredient.dishes = dishes;
      
      res.json({
        code: 200,
        message: '获取成功',
        data: ingredient
      });
    } catch (error) {
      console.error('获取原材料失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取原材料失败',
        error: error.message
      });
    }
  });

  // 创建原材料
  router.post('/', async (req, res) => {
    try {
      const { ingredient_name, supplier_id, stock_quantity, unit, cost_price } = req.body;
      
      // 验证数据
      if (!ingredient_name || !supplier_id || stock_quantity === undefined || !unit || cost_price === undefined) {
        return res.status(400).json({
          code: 400,
          message: '原材料名称、供应商、库存量、单位和成本价不能为空'
        });
      }
      
      // 检查供应商是否存在
      const [suppliers] = await pool.query(`
        SELECT supplier_id FROM supplier WHERE supplier_id = ?
      `, [supplier_id]);
      
      if (suppliers.length === 0) {
        return res.status(400).json({
          code: 400,
          message: '供应商不存在'
        });
      }
      
      // 检查原材料名称是否已存在
      const [existingIngredients] = await pool.query(`
        SELECT ingredient_id FROM ingredient WHERE ingredient_name = ?
      `, [ingredient_name]);
      
      if (existingIngredients.length > 0) {
        return res.status(400).json({
          code: 400,
          message: '原材料名称已存在'
        });
      }
      
      // 使用原生SQL插入新原材料
      const [result] = await pool.query(`
        INSERT INTO ingredient (ingredient_name, supplier_id, stock_quantity, unit, cost_price) 
        VALUES (?, ?, ?, ?, ?)
      `, [ingredient_name, supplier_id, stock_quantity, unit, cost_price]);
      
      // 获取新插入的原材料
      const [newIngredient] = await pool.query(`
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
      `, [result.insertId]);
      
      res.status(201).json({
        code: 201,
        message: '创建成功',
        data: newIngredient[0]
      });
    } catch (error) {
      console.error('创建原材料失败:', error);
      res.status(500).json({
        code: 500,
        message: '创建原材料失败',
        error: error.message
      });
    }
  });

  // 更新原材料
  router.put('/:id', async (req, res) => {
    try {
      const ingredientId = req.params.id;
      const { ingredient_name, supplier_id, stock_quantity, unit, cost_price } = req.body;
      
      // 验证数据
      if (!ingredient_name || !supplier_id || stock_quantity === undefined || !unit || cost_price === undefined) {
        return res.status(400).json({
          code: 400,
          message: '原材料名称、供应商、库存量、单位和成本价不能为空'
        });
      }
      
      // 检查原材料是否存在
      const [existingIngredient] = await pool.query(`
        SELECT ingredient_id FROM ingredient WHERE ingredient_id = ?
      `, [ingredientId]);
      
      if (existingIngredient.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '原材料不存在'
        });
      }
      
      // 检查供应商是否存在
      const [suppliers] = await pool.query(`
        SELECT supplier_id FROM supplier WHERE supplier_id = ?
      `, [supplier_id]);
      
      if (suppliers.length === 0) {
        return res.status(400).json({
          code: 400,
          message: '供应商不存在'
        });
      }
      
      // 检查原材料名称是否已被其他原材料使用
      const [duplicateIngredient] = await pool.query(`
        SELECT ingredient_id FROM ingredient 
        WHERE ingredient_name = ? AND ingredient_id != ?
      `, [ingredient_name, ingredientId]);
      
      if (duplicateIngredient.length > 0) {
        return res.status(400).json({
          code: 400,
          message: '原材料名称已存在'
        });
      }
      
      // 使用原生SQL更新原材料
      await pool.query(`
        UPDATE ingredient 
        SET 
          ingredient_name = ?, 
          supplier_id = ?, 
          stock_quantity = ?, 
          unit = ?, 
          cost_price = ?, 
          updated_at = CURRENT_TIMESTAMP 
        WHERE ingredient_id = ?
      `, [ingredient_name, supplier_id, stock_quantity, unit, cost_price, ingredientId]);
      
      // 获取更新后的原材料
      const [updatedIngredient] = await pool.query(`
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
      
      res.json({
        code: 200,
        message: '更新成功',
        data: updatedIngredient[0]
      });
    } catch (error) {
      console.error('更新原材料失败:', error);
      res.status(500).json({
        code: 500,
        message: '更新原材料失败',
        error: error.message
      });
    }
  });

  // 删除原材料
  router.delete('/:id', async (req, res) => {
    try {
      const ingredientId = req.params.id;
      
      // 检查原材料是否存在
      const [existingIngredient] = await pool.query(`
        SELECT ingredient_id FROM ingredient WHERE ingredient_id = ?
      `, [ingredientId]);
      
      if (existingIngredient.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '原材料不存在'
        });
      }
      
      // 检查是否有关联的菜品
      const [relatedDishes] = await pool.query(`
        SELECT relation_id FROM dish_ingredient WHERE ingredient_id = ?
      `, [ingredientId]);
      
      if (relatedDishes.length > 0) {
        return res.status(400).json({
          code: 400,
          message: '该原材料有关联的菜品，无法删除'
        });
      }
      
      // 检查是否有关联的库存记录
      const [relatedRecords] = await pool.query(`
        SELECT record_id FROM inventory_record WHERE ingredient_id = ?
      `, [ingredientId]);
      
      if (relatedRecords.length > 0) {
        return res.status(400).json({
          code: 400,
          message: '该原材料有关联的库存记录，无法删除'
        });
      }
      
      // 使用原生SQL删除原材料
      await pool.query(`
        DELETE FROM ingredient WHERE ingredient_id = ?
      `, [ingredientId]);
      
      res.json({
        code: 200,
        message: '删除成功'
      });
    } catch (error) {
      console.error('删除原材料失败:', error);
      res.status(500).json({
        code: 500,
        message: '删除原材料失败',
        error: error.message
      });
    }
  });

  return router;
};
