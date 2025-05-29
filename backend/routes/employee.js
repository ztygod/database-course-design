const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  // 获取所有员工
  router.get('/', async (req, res) => {
    try {
      // 获取查询参数
      const { employee_name, position, status } = req.query;
      
      // 构建SQL查询
      let sql = `
        SELECT 
          employee_id, 
          employee_name, 
          gender, 
          phone, 
          position, 
          hire_date, 
          status, 
          created_at, 
          updated_at 
        FROM employee
        WHERE 1=1
      `;
      
      const params = [];
      
      // 添加筛选条件
      if (employee_name) {
        sql += ` AND employee_name LIKE ?`;
        params.push(`%${employee_name}%`);
      }
      
      if (position) {
        sql += ` AND position = ?`;
        params.push(position);
      }
      
      if (status !== undefined && status !== '') {
        sql += ` AND status = ?`;
        params.push(status);
      }
      
      sql += ` ORDER BY employee_id`;
      
      // 执行查询
      const [rows] = await pool.query(sql, params);
      
      res.json({
        code: 200,
        message: '获取成功',
        data: rows
      });
    } catch (error) {
      console.error('获取员工失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取员工失败',
        error: error.message
      });
    }
  });

  // 获取单个员工
  router.get('/:id', async (req, res) => {
    try {
      const employeeId = req.params.id;
      
      // 使用原生SQL查询单个员工
      const [rows] = await pool.query(`
        SELECT 
          employee_id, 
          employee_name, 
          gender, 
          phone, 
          position, 
          hire_date, 
          status, 
          created_at, 
          updated_at 
        FROM employee 
        WHERE employee_id = ?
      `, [employeeId]);
      
      if (rows.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '员工不存在'
        });
      }
      
      // 查询员工服务的订单
      const [orders] = await pool.query(`
        SELECT 
          o.order_id,
          o.order_number,
          o.table_number,
          o.total_amount,
          o.status,
          o.order_time
        FROM \`order\` o
        WHERE o.employee_id = ?
        ORDER BY o.order_time DESC
        LIMIT 10
      `, [employeeId]);
      
      // 组合结果
      const employee = rows[0];
      employee.orders = orders;
      
      res.json({
        code: 200,
        message: '获取成功',
        data: employee
      });
    } catch (error) {
      console.error('获取员工失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取员工失败',
        error: error.message
      });
    }
  });

  // 创建员工
  router.post('/', async (req, res) => {
    try {
      const { employee_name, gender, phone, position, hire_date, status = 1 } = req.body;
      
      // 验证数据
      if (!employee_name || !phone || !position || !hire_date) {
        return res.status(400).json({
          code: 400,
          message: '员工姓名、电话、职位和入职日期不能为空'
        });
      }
      
      // 检查电话是否已存在
      const [existingEmployees] = await pool.query(`
        SELECT employee_id FROM employee WHERE phone = ?
      `, [phone]);
      
      if (existingEmployees.length > 0) {
        return res.status(400).json({
          code: 400,
          message: '电话号码已存在'
        });
      }
      
      // 使用原生SQL插入新员工
      const [result] = await pool.query(`
        INSERT INTO employee (employee_name, gender, phone, position, hire_date, status) 
        VALUES (?, ?, ?, ?, ?, ?)
      `, [employee_name, gender, phone, position, hire_date, status]);
      
      // 获取新插入的员工
      const [newEmployee] = await pool.query(`
        SELECT 
          employee_id, 
          employee_name, 
          gender, 
          phone, 
          position, 
          hire_date, 
          status, 
          created_at, 
          updated_at 
        FROM employee 
        WHERE employee_id = ?
      `, [result.insertId]);
      
      res.status(201).json({
        code: 201,
        message: '创建成功',
        data: newEmployee[0]
      });
    } catch (error) {
      console.error('创建员工失败:', error);
      res.status(500).json({
        code: 500,
        message: '创建员工失败',
        error: error.message
      });
    }
  });

  // 更新员工
  router.put('/:id', async (req, res) => {
    try {
      const employeeId = req.params.id;
      const { employee_name, gender, phone, position, hire_date, status } = req.body;
      
      // 验证数据
      if (!employee_name || !phone || !position || !hire_date) {
        return res.status(400).json({
          code: 400,
          message: '员工姓名、电话、职位和入职日期不能为空'
        });
      }
      
      // 检查员工是否存在
      const [existingEmployee] = await pool.query(`
        SELECT employee_id FROM employee WHERE employee_id = ?
      `, [employeeId]);
      
      if (existingEmployee.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '员工不存在'
        });
      }
      
      // 检查电话是否已被其他员工使用
      const [duplicateEmployee] = await pool.query(`
        SELECT employee_id FROM employee 
        WHERE phone = ? AND employee_id != ?
      `, [phone, employeeId]);
      
      if (duplicateEmployee.length > 0) {
        return res.status(400).json({
          code: 400,
          message: '电话号码已存在'
        });
      }
      
      // 使用原生SQL更新员工
      await pool.query(`
        UPDATE employee 
        SET 
          employee_name = ?, 
          gender = ?, 
          phone = ?, 
          position = ?, 
          hire_date = ?, 
          status = ?, 
          updated_at = CURRENT_TIMESTAMP 
        WHERE employee_id = ?
      `, [employee_name, gender, phone, position, hire_date, status, employeeId]);
      
      // 获取更新后的员工
      const [updatedEmployee] = await pool.query(`
        SELECT 
          employee_id, 
          employee_name, 
          gender, 
          phone, 
          position, 
          hire_date, 
          status, 
          created_at, 
          updated_at 
        FROM employee 
        WHERE employee_id = ?
      `, [employeeId]);
      
      res.json({
        code: 200,
        message: '更新成功',
        data: updatedEmployee[0]
      });
    } catch (error) {
      console.error('更新员工失败:', error);
      res.status(500).json({
        code: 500,
        message: '更新员工失败',
        error: error.message
      });
    }
  });

  // 删除员工
  router.delete('/:id', async (req, res) => {
    try {
      const employeeId = req.params.id;
      
      // 检查员工是否存在
      const [existingEmployee] = await pool.query(`
        SELECT employee_id FROM employee WHERE employee_id = ?
      `, [employeeId]);
      
      if (existingEmployee.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '员工不存在'
        });
      }
      
      // 检查是否有关联的订单
      const [relatedOrders] = await pool.query(`
        SELECT order_id FROM \`order\` WHERE employee_id = ?
      `, [employeeId]);
      
      if (relatedOrders.length > 0) {
        return res.status(400).json({
          code: 400,
          message: '该员工有关联的订单，无法删除'
        });
      }
      
      // 检查是否有关联的库存记录
      const [relatedRecords] = await pool.query(`
        SELECT record_id FROM inventory_record WHERE employee_id = ?
      `, [employeeId]);
      
      if (relatedRecords.length > 0) {
        return res.status(400).json({
          code: 400,
          message: '该员工有关联的库存记录，无法删除'
        });
      }
      
      // 使用原生SQL删除员工
      await pool.query(`
        DELETE FROM employee WHERE employee_id = ?
      `, [employeeId]);
      
      res.json({
        code: 200,
        message: '删除成功'
      });
    } catch (error) {
      console.error('删除员工失败:', error);
      res.status(500).json({
        code: 500,
        message: '删除员工失败',
        error: error.message
      });
    }
  });

  // 更新员工状态
  router.put('/:id/status', async (req, res) => {
    try {
      const employeeId = req.params.id;
      const { status } = req.body;
      
      // 验证数据
      if (status === undefined || status === null) {
        return res.status(400).json({
          code: 400,
          message: '状态不能为空'
        });
      }
      
      // 检查员工是否存在
      const [existingEmployee] = await pool.query(`
        SELECT employee_id FROM employee WHERE employee_id = ?
      `, [employeeId]);
      
      if (existingEmployee.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '员工不存在'
        });
      }
      
      // 使用原生SQL更新员工状态
      await pool.query(`
        UPDATE employee 
        SET 
          status = ?, 
          updated_at = CURRENT_TIMESTAMP 
        WHERE employee_id = ?
      `, [status, employeeId]);
      
      // 获取更新后的员工
      const [updatedEmployee] = await pool.query(`
        SELECT 
          employee_id, 
          employee_name, 
          gender, 
          phone, 
          position, 
          hire_date, 
          status, 
          created_at, 
          updated_at 
        FROM employee 
        WHERE employee_id = ?
      `, [employeeId]);
      
      res.json({
        code: 200,
        message: '更新成功',
        data: updatedEmployee[0]
      });
    } catch (error) {
      console.error('更新员工状态失败:', error);
      res.status(500).json({
        code: 500,
        message: '更新员工状态失败',
        error: error.message
      });
    }
  });

  return router;
};
