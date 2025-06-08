const express = require('express');
const router = express.Router();
const moment = require('moment');

module.exports = (pool) => {
  // 获取所有会员
  router.get('/', async (req, res) => {
    try {
      // 获取查询参数
      const { member_name, card_number, phone, level } = req.query;
      
      // 构建SQL查询
      let sql = `
        SELECT 
          member_id, 
          card_number, 
          member_name, 
          phone, 
          level, 
          points, 
          register_date, 
          created_at, 
          updated_at 
        FROM member
        WHERE 1=1
      `;
      
      const params = [];
      
      // 添加筛选条件
      if (member_name) {
        sql += ` AND member_name LIKE ?`;
        params.push(`%${member_name}%`);
      }
      
      if (card_number) {
        sql += ` AND card_number LIKE ?`;
        params.push(`%${card_number}%`);
      }
      
      if (phone) {
        sql += ` AND phone LIKE ?`;
        params.push(`%${phone}%`);
      }
      
      if (level) {
        sql += ` AND level = ?`;
        params.push(level);
      }
      
      sql += ` ORDER BY member_id`;
      
      // 执行查询
      const [rows] = await pool.query(sql, params);
      
      res.json({
        code: 200,
        message: '获取成功',
        data: rows
      });
    } catch (error) {
      console.error('获取会员失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取会员失败',
        error: error.message
      });
    }
  });

  // 获取单个会员
  router.get('/:id', async (req, res) => {
    try {
      const memberId = req.params.id;
      
      // 使用原生SQL查询单个会员
      const [rows] = await pool.query(`
        SELECT 
          member_id, 
          card_number, 
          member_name, 
          phone, 
          level, 
          points, 
          register_date, 
          created_at, 
          updated_at 
        FROM member 
        WHERE member_id = ?
      `, [memberId]);
      
      if (rows.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '会员不存在'
        });
      }
      
      // 查询会员的订单
      const [orders] = await pool.query(`
        SELECT 
          o.order_id,
          o.order_number,
          o.table_number,
          o.total_amount,
          o.actual_amount,
          o.status,
          o.order_time,
          o.payment_time
        FROM \`order\` o
        WHERE o.member_id = ?
        ORDER BY o.order_time DESC
        LIMIT 10
      `, [memberId]);
      
      // 组合结果
      const member = rows[0];
      member.orders = orders;
      
      res.json({
        code: 200,
        message: '获取成功',
        data: member
      });
    } catch (error) {
      console.error('获取会员失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取会员失败',
        error: error.message
      });
    }
  });

  // 创建会员
  router.post('/', async (req, res) => {
    try {
      const { card_number, member_name, phone, level = 1, points = 0, register_date } = req.body;
      
      // 验证数据
      if (!card_number || !member_name || !register_date) {
        return res.status(400).json({
          code: 400,
          message: '会员卡号、姓名和注册日期不能为空'
        });
      }
      
      // 检查卡号是否已存在
      const [existingMembers] = await pool.query(`
        SELECT member_id FROM member WHERE card_number = ?
      `, [card_number]);
      
      if (existingMembers.length > 0) {
        return res.status(400).json({
          code: 400,
          message: '会员卡号已存在'
        });
      }
      
      // 使用原生SQL插入新会员
      const [result] = await pool.query(`
        INSERT INTO member (card_number, member_name, phone, level, points, register_date) 
        VALUES (?, ?, ?, ?, ?, ?)
      `, [card_number, member_name, phone, level, points, register_date]);
      
      // 获取新插入的会员
      const [newMember] = await pool.query(`
        SELECT 
          member_id, 
          card_number, 
          member_name, 
          phone, 
          level, 
          points, 
          register_date, 
          created_at, 
          updated_at 
        FROM member 
        WHERE member_id = ?
      `, [result.insertId]);
      
      res.status(201).json({
        code: 201,
        message: '创建成功',
        data: newMember[0]
      });
    } catch (error) {
      console.error('创建会员失败:', error);
      res.status(500).json({
        code: 500,
        message: '创建会员失败',
        error: error.message
      });
    }
  });

  // 更新会员
  router.put('/:id', async (req, res) => {
    try {
      const memberId = req.params.id;
      const { card_number, member_name, phone, level, points, register_date } = req.body;
      
      // 验证数据
      if (!card_number || !member_name || !register_date) {
        return res.status(400).json({
          code: 400,
          message: '会员卡号、姓名和注册日期不能为空'
        });
      }
      
      let data = formatDate(register_date);

      // 检查会员是否存在
      const [existingMember] = await pool.query(`
        SELECT member_id FROM member WHERE member_id = ?
      `, [memberId]);
      
      if (existingMember.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '会员不存在'
        });
      }
      
      // 检查卡号是否已被其他会员使用
      const [duplicateMember] = await pool.query(`
        SELECT member_id FROM member 
        WHERE card_number = ? AND member_id != ?
      `, [card_number, memberId]);
      
      if (duplicateMember.length > 0) {
        return res.status(400).json({
          code: 400,
          message: '会员卡号已存在'
        });
      }
      
      // 使用原生SQL更新会员
      await pool.query(`
        UPDATE member 
        SET 
          card_number = ?, 
          member_name = ?, 
          phone = ?, 
          level = ?, 
          points = ?, 
          register_date = ?, 
          updated_at = CURRENT_TIMESTAMP 
        WHERE member_id = ?
      `, [card_number, member_name, phone, level, points, data, memberId]);
      
      // 获取更新后的会员
      const [updatedMember] = await pool.query(`
        SELECT 
          member_id, 
          card_number, 
          member_name, 
          phone, 
          level, 
          points, 
          register_date, 
          created_at, 
          updated_at 
        FROM member 
        WHERE member_id = ?
      `, [memberId]);
      
      res.json({
        code: 200,
        message: '更新成功',
        data: updatedMember[0]
      });
    } catch (error) {
      console.error('更新会员失败:', error);
      res.status(500).json({
        code: 500,
        message: '更新会员失败',
        error: error.message
      });
    }
  });

  // 删除会员
  router.delete('/:id', async (req, res) => {
    try {
      const memberId = req.params.id;
      
      // 检查会员是否存在
      const [existingMember] = await pool.query(`
        SELECT member_id FROM member WHERE member_id = ?
      `, [memberId]);
      
      if (existingMember.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '会员不存在'
        });
      }
      
      // 检查是否有关联的订单
      const [relatedOrders] = await pool.query(`
        SELECT order_id FROM \`order\` WHERE member_id = ?
      `, [memberId]);
      
      if (relatedOrders.length > 0) {
        return res.status(400).json({
          code: 400,
          message: '该会员有关联的订单，无法删除'
        });
      }
      
      // 使用原生SQL删除会员
      await pool.query(`
        DELETE FROM member WHERE member_id = ?
      `, [memberId]);
      
      res.json({
        code: 200,
        message: '删除成功'
      });
    } catch (error) {
      console.error('删除会员失败:', error);
      res.status(500).json({
        code: 500,
        message: '删除会员失败',
        error: error.message
      });
    }
  });

  // 更新会员积分
  router.put('/:id/points', async (req, res) => {
    try {
      const memberId = req.params.id;
      const { points } = req.body;
      
      // 验证数据
      if (points === undefined || points === null) {
        return res.status(400).json({
          code: 400,
          message: '积分不能为空'
        });
      }
      
      // 检查会员是否存在
      const [existingMember] = await pool.query(`
        SELECT member_id FROM member WHERE member_id = ?
      `, [memberId]);
      
      if (existingMember.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '会员不存在'
        });
      }
      
      // 根据积分自动更新会员等级
      let level = 1;
      if (points >= 2000) {
        level = 3;
      } else if (points >= 1000) {
        level = 2;
      }
      
      // 使用原生SQL更新会员积分和等级
      await pool.query(`
        UPDATE member 
        SET 
          points = ?, 
          level = ?,
          updated_at = CURRENT_TIMESTAMP 
        WHERE member_id = ?
      `, [points, level, memberId]);
      
      // 获取更新后的会员
      const [updatedMember] = await pool.query(`
        SELECT 
          member_id, 
          card_number, 
          member_name, 
          phone, 
          level, 
          points, 
          register_date, 
          created_at, 
          updated_at 
        FROM member 
        WHERE member_id = ?
      `, [memberId]);
      
      res.json({
        code: 200,
        message: '更新成功',
        data: updatedMember[0]
      });
    } catch (error) {
      console.error('更新会员积分失败:', error);
      res.status(500).json({
        code: 500,
        message: '更新会员积分失败',
        error: error.message
      });
    }
  });

  return router;
};

function formatDate(isoString) {
  const date = new Date(isoString)

  const pad = (n) => n.toString().padStart(2, '0')

  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hour = pad(date.getHours())
  const minute = pad(date.getMinutes())
  const second = pad(date.getSeconds())

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

const iso = '2021-01-09T16:00:00.000Z'
console.log(formatDate(iso))
// 输出如：2021-01-09 16:00:00（若为 UTC，会按本地时间显示）
