const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  // 获取所有菜品类别
  router.get('/', async (req, res) => {
    try {
      // 使用原生SQL查询所有菜品类别
      const [rows] = await pool.query(`
        SELECT 
          category_id, 
          category_name, 
          description, 
          created_at, 
          updated_at 
        FROM dish_category 
        ORDER BY category_id
      `);
      
      res.json({
        code: 200,
        message: '获取成功',
        data: rows
      });
    } catch (error) {
      console.error('获取菜品类别失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取菜品类别失败',
        error: error.message
      });
    }
  });

  // 获取单个菜品类别
  router.get('/:id', async (req, res) => {
    try {
      const categoryId = req.params.id;
      
      // 使用原生SQL查询单个菜品类别
      const [rows] = await pool.query(`
        SELECT 
          category_id, 
          category_name, 
          description, 
          created_at, 
          updated_at 
        FROM dish_category 
        WHERE category_id = ?
      `, [categoryId]);
      
      if (rows.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '菜品类别不存在'
        });
      }
      
      res.json({
        code: 200,
        message: '获取成功',
        data: rows[0]
      });
    } catch (error) {
      console.error('获取菜品类别失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取菜品类别失败',
        error: error.message
      });
    }
  });

  // 创建菜品类别
  router.post('/', async (req, res) => {
    try {
      const { category_name, description } = req.body;
      
      // 验证数据
      if (!category_name) {
        return res.status(400).json({
          code: 400,
          message: '类别名称不能为空'
        });
      }
      
      // 检查类别名称是否已存在
      const [existingCategories] = await pool.query(`
        SELECT category_id FROM dish_category WHERE category_name = ?
      `, [category_name]);
      
      if (existingCategories.length > 0) {
        return res.status(400).json({
          code: 400,
          message: '类别名称已存在'
        });
      }
      
      // 使用原生SQL插入新菜品类别
      const [result] = await pool.query(`
        INSERT INTO dish_category (category_name, description) 
        VALUES (?, ?)
      `, [category_name, description]);
      
      // 获取新插入的类别
      const [newCategory] = await pool.query(`
        SELECT 
          category_id, 
          category_name, 
          description, 
          created_at, 
          updated_at 
        FROM dish_category 
        WHERE category_id = ?
      `, [result.insertId]);
      
      res.status(201).json({
        code: 201,
        message: '创建成功',
        data: newCategory[0]
      });
    } catch (error) {
      console.error('创建菜品类别失败:', error);
      res.status(500).json({
        code: 500,
        message: '创建菜品类别失败',
        error: error.message
      });
    }
  });

  // 更新菜品类别
  router.put('/:id', async (req, res) => {
    try {
      const categoryId = req.params.id;
      const { category_name, description } = req.body;
      
      // 验证数据
      if (!category_name) {
        return res.status(400).json({
          code: 400,
          message: '类别名称不能为空'
        });
      }
      
      // 检查类别是否存在
      const [existingCategory] = await pool.query(`
        SELECT category_id FROM dish_category WHERE category_id = ?
      `, [categoryId]);
      
      if (existingCategory.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '菜品类别不存在'
        });
      }
      
      // 检查类别名称是否已被其他类别使用
      const [duplicateCategory] = await pool.query(`
        SELECT category_id FROM dish_category 
        WHERE category_name = ? AND category_id != ?
      `, [category_name, categoryId]);
      
      if (duplicateCategory.length > 0) {
        return res.status(400).json({
          code: 400,
          message: '类别名称已存在'
        });
      }
      
      // 使用原生SQL更新菜品类别
      await pool.query(`
        UPDATE dish_category 
        SET 
          category_name = ?, 
          description = ?, 
          updated_at = CURRENT_TIMESTAMP 
        WHERE category_id = ?
      `, [category_name, description, categoryId]);
      
      // 获取更新后的类别
      const [updatedCategory] = await pool.query(`
        SELECT 
          category_id, 
          category_name, 
          description, 
          created_at, 
          updated_at 
        FROM dish_category 
        WHERE category_id = ?
      `, [categoryId]);
      
      res.json({
        code: 200,
        message: '更新成功',
        data: updatedCategory[0]
      });
    } catch (error) {
      console.error('更新菜品类别失败:', error);
      res.status(500).json({
        code: 500,
        message: '更新菜品类别失败',
        error: error.message
      });
    }
  });

  // 删除菜品类别
  router.delete('/:id', async (req, res) => {
    try {
      const categoryId = req.params.id;
      
      // 检查类别是否存在
      const [existingCategory] = await pool.query(`
        SELECT category_id FROM dish_category WHERE category_id = ?
      `, [categoryId]);
      
      if (existingCategory.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '菜品类别不存在'
        });
      }
      
      // 检查是否有关联的菜品
      const [relatedDishes] = await pool.query(`
        SELECT dish_id FROM dish WHERE category_id = ?
      `, [categoryId]);
      
      if (relatedDishes.length > 0) {
        return res.status(400).json({
          code: 400,
          message: '该类别下有关联的菜品，无法删除'
        });
      }
      
      // 使用原生SQL删除菜品类别
      await pool.query(`
        DELETE FROM dish_category WHERE category_id = ?
      `, [categoryId]);
      
      res.json({
        code: 200,
        message: '删除成功'
      });
    } catch (error) {
      console.error('删除菜品类别失败:', error);
      res.status(500).json({
        code: 500,
        message: '删除菜品类别失败',
        error: error.message
      });
    }
  });

  return router;
};
