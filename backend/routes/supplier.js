const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  // 获取所有供应商
  router.get('/', async (req, res) => {
    try {
      // 获取查询参数
      const { supplier_name, contact_name, phone } = req.query;
      
      // 构建SQL查询
      let sql = `
        SELECT 
          supplier_id, 
          supplier_name, 
          contact_name, 
          phone, 
          address, 
          email, 
          created_at, 
          updated_at 
        FROM supplier
        WHERE 1=1
      `;
      
      const params = [];
      
      // 添加筛选条件
      if (supplier_name) {
        sql += ` AND supplier_name LIKE ?`;
        params.push(`%${supplier_name}%`);
      }
      
      if (contact_name) {
        sql += ` AND contact_name LIKE ?`;
        params.push(`%${contact_name}%`);
      }
      
      if (phone) {
        sql += ` AND phone LIKE ?`;
        params.push(`%${phone}%`);
      }
      
      sql += ` ORDER BY supplier_id`;
      
      // 执行查询
      const [rows] = await pool.query(sql, params);
      
      res.json({
        code: 200,
        message: '获取成功',
        data: rows
      });
    } catch (error) {
      console.error('获取供应商失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取供应商失败',
        error: error.message
      });
    }
  });

  // 获取单个供应商
  router.get('/:id', async (req, res) => {
    try {
      const supplierId = req.params.id;
      
      // 使用原生SQL查询单个供应商
      const [rows] = await pool.query(`
        SELECT 
          supplier_id, 
          supplier_name, 
          contact_name, 
          phone, 
          address, 
          email, 
          created_at, 
          updated_at 
        FROM supplier 
        WHERE supplier_id = ?
      `, [supplierId]);
      
      if (rows.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '供应商不存在'
        });
      }
      
      // 查询供应商提供的原材料
      const [ingredients] = await pool.query(`
        SELECT 
          i.ingredient_id,
          i.ingredient_name,
          i.stock_quantity,
          i.unit,
          i.cost_price
        FROM ingredient i
        WHERE i.supplier_id = ?
      `, [supplierId]);
      
      // 组合结果
      const supplier = rows[0];
      supplier.ingredients = ingredients;
      
      res.json({
        code: 200,
        message: '获取成功',
        data: supplier
      });
    } catch (error) {
      console.error('获取供应商失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取供应商失败',
        error: error.message
      });
    }
  });

  // 创建供应商
  router.post('/', async (req, res) => {
    try {
      const { supplier_name, contact_name, phone, address, email } = req.body;
      
      // 验证数据
      if (!supplier_name || !contact_name || !phone) {
        return res.status(400).json({
          code: 400,
          message: '供应商名称、联系人和电话不能为空'
        });
      }
      
      // 检查供应商名称是否已存在
      const [existingSuppliers] = await pool.query(`
        SELECT supplier_id FROM supplier WHERE supplier_name = ?
      `, [supplier_name]);
      
      if (existingSuppliers.length > 0) {
        return res.status(400).json({
          code: 400,
          message: '供应商名称已存在'
        });
      }
      
      // 使用原生SQL插入新供应商
      const [result] = await pool.query(`
        INSERT INTO supplier (supplier_name, contact_name, phone, address, email) 
        VALUES (?, ?, ?, ?, ?)
      `, [supplier_name, contact_name, phone, address, email]);
      
      // 获取新插入的供应商
      const [newSupplier] = await pool.query(`
        SELECT 
          supplier_id, 
          supplier_name, 
          contact_name, 
          phone, 
          address, 
          email, 
          created_at, 
          updated_at 
        FROM supplier 
        WHERE supplier_id = ?
      `, [result.insertId]);
      
      res.status(201).json({
        code: 201,
        message: '创建成功',
        data: newSupplier[0]
      });
    } catch (error) {
      console.error('创建供应商失败:', error);
      res.status(500).json({
        code: 500,
        message: '创建供应商失败',
        error: error.message
      });
    }
  });

  // 更新供应商
  router.put('/:id', async (req, res) => {
    try {
      const supplierId = req.params.id;
      const { supplier_name, contact_name, phone, address, email } = req.body;
      
      // 验证数据
      if (!supplier_name || !contact_name || !phone) {
        return res.status(400).json({
          code: 400,
          message: '供应商名称、联系人和电话不能为空'
        });
      }
      
      // 检查供应商是否存在
      const [existingSupplier] = await pool.query(`
        SELECT supplier_id FROM supplier WHERE supplier_id = ?
      `, [supplierId]);
      
      if (existingSupplier.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '供应商不存在'
        });
      }
      
      // 检查供应商名称是否已被其他供应商使用
      const [duplicateSupplier] = await pool.query(`
        SELECT supplier_id FROM supplier 
        WHERE supplier_name = ? AND supplier_id != ?
      `, [supplier_name, supplierId]);
      
      if (duplicateSupplier.length > 0) {
        return res.status(400).json({
          code: 400,
          message: '供应商名称已存在'
        });
      }
      
      // 使用原生SQL更新供应商
      await pool.query(`
        UPDATE supplier 
        SET 
          supplier_name = ?, 
          contact_name = ?, 
          phone = ?, 
          address = ?, 
          email = ?, 
          updated_at = CURRENT_TIMESTAMP 
        WHERE supplier_id = ?
      `, [supplier_name, contact_name, phone, address, email, supplierId]);
      
      // 获取更新后的供应商
      const [updatedSupplier] = await pool.query(`
        SELECT 
          supplier_id, 
          supplier_name, 
          contact_name, 
          phone, 
          address, 
          email, 
          created_at, 
          updated_at 
        FROM supplier 
        WHERE supplier_id = ?
      `, [supplierId]);
      
      res.json({
        code: 200,
        message: '更新成功',
        data: updatedSupplier[0]
      });
    } catch (error) {
      console.error('更新供应商失败:', error);
      res.status(500).json({
        code: 500,
        message: '更新供应商失败',
        error: error.message
      });
    }
  });

  // 删除供应商
  router.delete('/:id', async (req, res) => {
    try {
      const supplierId = req.params.id;
      
      // 检查供应商是否存在
      const [existingSupplier] = await pool.query(`
        SELECT supplier_id FROM supplier WHERE supplier_id = ?
      `, [supplierId]);
      
      if (existingSupplier.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '供应商不存在'
        });
      }
      
      // 检查是否有关联的原材料
      const [relatedIngredients] = await pool.query(`
        SELECT ingredient_id FROM ingredient WHERE supplier_id = ?
      `, [supplierId]);
      
      if (relatedIngredients.length > 0) {
        return res.status(400).json({
          code: 400,
          message: '该供应商有关联的原材料，无法删除'
        });
      }
      
      // 使用原生SQL删除供应商
      await pool.query(`
        DELETE FROM supplier WHERE supplier_id = ?
      `, [supplierId]);
      
      res.json({
        code: 200,
        message: '删除成功'
      });
    } catch (error) {
      console.error('删除供应商失败:', error);
      res.status(500).json({
        code: 500,
        message: '删除供应商失败',
        error: error.message
      });
    }
  });

  return router;
};
