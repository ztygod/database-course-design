const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  // 获取所有菜品
  router.get('/', async (req, res) => {
    try {
      // 获取查询参数
      const { dish_name, category_id, status } = req.query;
      
      // 构建SQL查询
      let sql = `
        SELECT 
          d.dish_id, 
          d.dish_name, 
          d.category_id, 
          c.category_name, 
          d.price, 
          d.description, 
          d.status, 
          d.created_at, 
          d.updated_at 
        FROM dish d
        JOIN dish_category c ON d.category_id = c.category_id
        WHERE 1=1
      `;
      
      const params = [];
      
      // 添加筛选条件
      if (dish_name) {
        sql += ` AND d.dish_name LIKE ?`;
        params.push(`%${dish_name}%`);
      }
      
      if (category_id) {
        sql += ` AND d.category_id = ?`;
        params.push(category_id);
      }
      
      if (status !== undefined && status !== '') {
        sql += ` AND d.status = ?`;
        params.push(status);
      }
      
      sql += ` ORDER BY d.dish_id`;
      
      // 执行查询
      const [rows] = await pool.query(sql, params);
      
      res.json({
        code: 200,
        message: '获取成功',
        data: rows
      });
    } catch (error) {
      console.error('获取菜品失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取菜品失败',
        error: error.message
      });
    }
  });

  // 获取单个菜品
  router.get('/:id', async (req, res) => {
    try {
      const dishId = req.params.id;
      
      // 查询菜品基本信息
      const [dishes] = await pool.query(`
        SELECT 
          d.dish_id, 
          d.dish_name, 
          d.category_id, 
          c.category_name, 
          d.price, 
          d.description, 
          d.status, 
          d.created_at, 
          d.updated_at 
        FROM dish d
        JOIN dish_category c ON d.category_id = c.category_id
        WHERE d.dish_id = ?
      `, [dishId]);
      
      if (dishes.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '菜品不存在'
        });
      }
      
      const dish = dishes[0];
      
      // 查询菜品原料
      const [ingredients] = await pool.query(`
        SELECT 
          di.relation_id,
          di.dish_id,
          di.ingredient_id,
          i.ingredient_name,
          di.quantity,
          di.unit
        FROM dish_ingredient di
        JOIN ingredient i ON di.ingredient_id = i.ingredient_id
        WHERE di.dish_id = ?
      `, [dishId]);
      
      // 组合结果
      dish.ingredients = ingredients;
      
      res.json({
        code: 200,
        message: '获取成功',
        data: dish
      });
    } catch (error) {
      console.error('获取菜品失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取菜品失败',
        error: error.message
      });
    }
  });

  // 创建菜品
  router.post('/', async (req, res) => {
    try {
      const { dish_name, category_id, price, description, status = 1, ingredients = [] } = req.body;
      
      // 验证数据
      if (!dish_name || !category_id || !price) {
        return res.status(400).json({
          code: 400,
          message: '菜品名称、类别和价格不能为空'
        });
      }
      
      // 检查类别是否存在
      const [categories] = await pool.query(`
        SELECT category_id FROM dish_category WHERE category_id = ?
      `, [category_id]);
      
      if (categories.length === 0) {
        return res.status(400).json({
          code: 400,
          message: '菜品类别不存在'
        });
      }
      
      // 开始事务
      const connection = await pool.getConnection();
      await connection.beginTransaction();
      
      try {
        // 插入菜品
        const [result] = await connection.query(`
          INSERT INTO dish (dish_name, category_id, price, description, status) 
          VALUES (?, ?, ?, ?, ?)
        `, [dish_name, category_id, price, description, status]);
        
        const dishId = result.insertId;
        
        // 插入菜品原料关系
        if (ingredients.length > 0) {
          for (const ingredient of ingredients) {
            // 检查原料是否存在
            const [ingredientExists] = await connection.query(`
              SELECT ingredient_id FROM ingredient WHERE ingredient_id = ?
            `, [ingredient.ingredient_id]);
            
            if (ingredientExists.length > 0) {
              await connection.query(`
                INSERT INTO dish_ingredient (dish_id, ingredient_id, quantity, unit) 
                VALUES (?, ?, ?, ?)
              `, [dishId, ingredient.ingredient_id, ingredient.quantity, ingredient.unit]);
            }
          }
        }
        
        // 提交事务
        await connection.commit();
        
        // 获取新创建的菜品
        const [newDish] = await pool.query(`
          SELECT 
            d.dish_id, 
            d.dish_name, 
            d.category_id, 
            c.category_name, 
            d.price, 
            d.description, 
            d.status, 
            d.created_at, 
            d.updated_at 
          FROM dish d
          JOIN dish_category c ON d.category_id = c.category_id
          WHERE d.dish_id = ?
        `, [dishId]);
        
        res.status(201).json({
          code: 201,
          message: '创建成功',
          data: newDish[0]
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
      console.error('创建菜品失败:', error);
      res.status(500).json({
        code: 500,
        message: '创建菜品失败',
        error: error.message
      });
    }
  });

  // 更新菜品
  router.put('/:id', async (req, res) => {
    try {
      const dishId = req.params.id;
      const { dish_name, category_id, price, description, status, ingredients = [] } = req.body;
      
      // 验证数据
      if (!dish_name || !category_id || !price) {
        return res.status(400).json({
          code: 400,
          message: '菜品名称、类别和价格不能为空'
        });
      }
      
      // 检查菜品是否存在
      const [dishes] = await pool.query(`
        SELECT dish_id FROM dish WHERE dish_id = ?
      `, [dishId]);
      
      if (dishes.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '菜品不存在'
        });
      }
      
      // 检查类别是否存在
      const [categories] = await pool.query(`
        SELECT category_id FROM dish_category WHERE category_id = ?
      `, [category_id]);
      
      if (categories.length === 0) {
        return res.status(400).json({
          code: 400,
          message: '菜品类别不存在'
        });
      }
      
      // 开始事务
      const connection = await pool.getConnection();
      await connection.beginTransaction();
      
      try {
        // 更新菜品
        await connection.query(`
          UPDATE dish 
          SET 
            dish_name = ?, 
            category_id = ?, 
            price = ?, 
            description = ?, 
            status = ?, 
            updated_at = CURRENT_TIMESTAMP 
          WHERE dish_id = ?
        `, [dish_name, category_id, price, description, status, dishId]);
        
        // 删除旧的菜品原料关系
        await connection.query(`
          DELETE FROM dish_ingredient WHERE dish_id = ?
        `, [dishId]);
        
        // 插入新的菜品原料关系
        if (ingredients.length > 0) {
          for (const ingredient of ingredients) {
            // 检查原料是否存在
            const [ingredientExists] = await connection.query(`
              SELECT ingredient_id FROM ingredient WHERE ingredient_id = ?
            `, [ingredient.ingredient_id]);
            
            if (ingredientExists.length > 0) {
              await connection.query(`
                INSERT INTO dish_ingredient (dish_id, ingredient_id, quantity, unit) 
                VALUES (?, ?, ?, ?)
              `, [dishId, ingredient.ingredient_id, ingredient.quantity, ingredient.unit]);
            }
          }
        }
        
        // 提交事务
        await connection.commit();
        
        // 获取更新后的菜品
        const [updatedDish] = await pool.query(`
          SELECT 
            d.dish_id, 
            d.dish_name, 
            d.category_id, 
            c.category_name, 
            d.price, 
            d.description, 
            d.status, 
            d.created_at, 
            d.updated_at 
          FROM dish d
          JOIN dish_category c ON d.category_id = c.category_id
          WHERE d.dish_id = ?
        `, [dishId]);
        
        res.json({
          code: 200,
          message: '更新成功',
          data: updatedDish[0]
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
      console.error('更新菜品失败:', error);
      res.status(500).json({
        code: 500,
        message: '更新菜品失败',
        error: error.message
      });
    }
  });

  // 删除菜品
  router.delete('/:id', async (req, res) => {
    try {
      const dishId = req.params.id;
      
      // 检查菜品是否存在
      const [dishes] = await pool.query(`
        SELECT dish_id FROM dish WHERE dish_id = ?
      `, [dishId]);
      
      if (dishes.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '菜品不存在'
        });
      }
      
      // 检查是否有关联的订单
      const [orders] = await pool.query(`
        SELECT detail_id FROM order_detail WHERE dish_id = ?
      `, [dishId]);
      
      if (orders.length > 0) {
        return res.status(400).json({
          code: 400,
          message: '该菜品已被订单引用，无法删除'
        });
      }
      
      // 开始事务
      const connection = await pool.getConnection();
      await connection.beginTransaction();
      
      try {
        // 删除菜品原料关系
        await connection.query(`
          DELETE FROM dish_ingredient WHERE dish_id = ?
        `, [dishId]);
        
        // 删除菜品
        await connection.query(`
          DELETE FROM dish WHERE dish_id = ?
        `, [dishId]);
        
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
      console.error('删除菜品失败:', error);
      res.status(500).json({
        code: 500,
        message: '删除菜品失败',
        error: error.message
      });
    }
  });

  // 获取菜品原料
  router.get('/:id/ingredients', async (req, res) => {
    try {
      const dishId = req.params.id;
      
      // 检查菜品是否存在
      const [dishes] = await pool.query(`
        SELECT dish_id FROM dish WHERE dish_id = ?
      `, [dishId]);
      
      if (dishes.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '菜品不存在'
        });
      }
      
      // 查询菜品原料
      const [ingredients] = await pool.query(`
        SELECT 
          di.relation_id,
          di.dish_id,
          di.ingredient_id,
          i.ingredient_name,
          di.quantity,
          di.unit
        FROM dish_ingredient di
        JOIN ingredient i ON di.ingredient_id = i.ingredient_id
        WHERE di.dish_id = ?
      `, [dishId]);
      
      res.json({
        code: 200,
        message: '获取成功',
        data: ingredients
      });
    } catch (error) {
      console.error('获取菜品原料失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取菜品原料失败',
        error: error.message
      });
    }
  });

  // 更新菜品状态
  router.put('/:id/status', async (req, res) => {
    try {
      const dishId = req.params.id;
      const { status } = req.body;
      
      // 验证数据
      if (status === undefined || status === null) {
        return res.status(400).json({
          code: 400,
          message: '状态不能为空'
        });
      }
      
      // 检查菜品是否存在
      const [dishes] = await pool.query(`
        SELECT dish_id FROM dish WHERE dish_id = ?
      `, [dishId]);
      
      if (dishes.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '菜品不存在'
        });
      }
      
      // 更新菜品状态
      await pool.query(`
        UPDATE dish 
        SET 
          status = ?, 
          updated_at = CURRENT_TIMESTAMP 
        WHERE dish_id = ?
      `, [status, dishId]);
      
      // 获取更新后的菜品
      const [updatedDish] = await pool.query(`
        SELECT 
          d.dish_id, 
          d.dish_name, 
          d.category_id, 
          c.category_name, 
          d.price, 
          d.description, 
          d.status, 
          d.created_at, 
          d.updated_at 
        FROM dish d
        JOIN dish_category c ON d.category_id = c.category_id
        WHERE d.dish_id = ?
      `, [dishId]);
      
      res.json({
        code: 200,
        message: '更新成功',
        data: updatedDish[0]
      });
    } catch (error) {
      console.error('更新菜品状态失败:', error);
      res.status(500).json({
        code: 500,
        message: '更新菜品状态失败',
        error: error.message
      });
    }
  });

  return router;
};
