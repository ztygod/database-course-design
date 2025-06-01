<template>
  <div class="employee-list">
    <div class="page-header">
      <h2>员工管理</h2>
      <el-button type="primary" @click="handleAdd">添加员工</el-button>
    </div>
    
    <el-card shadow="hover" class="filter-container">
      <el-form :inline="true" :model="queryParams" ref="queryForm">
        <el-form-item label="员工姓名">
          <el-input v-model="queryParams.employee_name" placeholder="请输入员工姓名" clearable></el-input>
        </el-form-item>
        <el-form-item label="职位">
          <el-input v-model="queryParams.position" placeholder="请输入职位" clearable></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
            <el-option label="在职" :value="1"></el-option>
            <el-option label="离职" :value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <el-card shadow="hover" class="table-container">
      <el-table
        v-loading="loading"
        :data="employeeList"
        border
        style="width: 100%">
        <el-table-column type="index" width="50" align="center"></el-table-column>
        <el-table-column prop="employee_name" label="员工姓名" min-width="100"></el-table-column>
        <el-table-column prop="gender" label="性别" width="60" align="center">
          <template slot-scope="scope">
            {{ scope.row.gender === 'M' ? '男' : (scope.row.gender === 'F' ? '女' : '未知') }}
          </template>
        </el-table-column>
        <el-table-column prop="position" label="职位" min-width="100"></el-table-column>
        <el-table-column prop="phone" label="联系电话" min-width="120"></el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="150"></el-table-column>
        <el-table-column prop="hire_date" label="入职日期" min-width="120">
          <template slot-scope="scope">
            {{ scope.row.hire_date | formatDate }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
              {{ scope.row.status === 1 ? '在职' : '离职' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button 
              size="mini" 
              :type="scope.row.status === 1 ? 'warning' : 'success'"
              @click="handleStatusChange(scope.row)">
              {{ scope.row.status === 1 ? '离职' : '复职' }}
            </el-button>
            <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryParams.page"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="queryParams.limit"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </div>
    </el-card>
    
    <!-- 添加/编辑员工对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="员工姓名" prop="employee_name">
          <el-input v-model="form.employee_name" placeholder="请输入员工姓名"></el-input>
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="form.gender">
            <el-radio label="M">男</el-radio>
            <el-radio label="F">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="职位" prop="position">
          <el-input v-model="form.position" placeholder="请输入职位"></el-input>
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入联系电话"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        <el-form-item label="入职日期" prop="hire_date">
          <el-date-picker
            v-model="form.hire_date"
            type="date"
            placeholder="选择日期"
            value-format="yyyy-MM-dd"
            style="width: 100%">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">在职</el-radio>
            <el-radio :label="0">离职</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getEmployees, getEmployee, createEmployee, updateEmployee, deleteEmployee, updateEmployeeStatus } from '@/api/employee';

export default {
  name: 'EmployeeIndex',
  data() {
    return {
      loading: false,
      employeeList: [],
      total: 0,
      queryParams: {
        page: 1,
        limit: 10,
        employee_name: '',
        position: '',
        status: ''
      },
      
      dialogVisible: false,
      dialogTitle: '',
      form: {
        employee_name: '',
        gender: 'M',
        position: '',
        phone: '',
        email: '',
        hire_date: new Date().toISOString().split('T')[0],
        status: 1
      },
      
      rules: {
        employee_name: [{ required: true, message: '请输入员工姓名', trigger: 'blur' }],
        gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
        position: [{ required: true, message: '请输入职位', trigger: 'blur' }],
        hire_date: [{ required: true, message: '请选择入职日期', trigger: 'change' }]
      }
    }
  },
  created() {
    this.getEmployeeList();
  },
  methods: {
    async getEmployeeList() {
      this.loading = true;
      try {
        const res = await getEmployees(this.queryParams);
        this.employeeList = res.data.items || [];
        this.total = res.data.total || 0;
      } catch (error) {
        console.error('获取员工列表失败:', error);
        this.$message.error('获取员工列表失败');
      } finally {
        this.loading = false;
      }
    },
    
    handleQuery() {
      this.queryParams.page = 1;
      this.getEmployeeList();
    },
    
    resetQuery() {
      this.queryParams = {
        page: 1,
        limit: 10,
        employee_name: '',
        position: '',
        status: ''
      };
      this.getEmployeeList();
    },
    
    handleSizeChange(val) {
      this.queryParams.limit = val;
      this.getEmployeeList();
    },
    
    handleCurrentChange(val) {
      this.queryParams.page = val;
      this.getEmployeeList();
    },
    
    handleAdd() {
      this.dialogTitle = '添加员工';
      this.form = {
        employee_name: '',
        gender: 'M',
        position: '',
        phone: '',
        email: '',
        hire_date: new Date().toISOString().split('T')[0],
        status: 1
      };
      this.dialogVisible = true;
    },
    
    handleEdit(row) {
      this.dialogTitle = '编辑员工';
      this.form = JSON.parse(JSON.stringify(row));
      this.dialogVisible = true;
    },
    
    async handleDelete(row) {
      try {
        await this.$confirm('确认删除该员工吗？', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        
        await deleteEmployee(row.employee_id);
        this.$message.success('删除成功');
        this.getEmployeeList();
      } catch (error) {
        console.error('删除员工失败:', error);
      }
    },
    
    async handleStatusChange(row) {
      try {
        const newStatus = row.status === 1 ? 0 : 1;
        const confirmText = newStatus === 1 ? '确认将该员工状态改为在职吗？' : '确认将该员工状态改为离职吗？';
        
        await this.$confirm(confirmText, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        
        await updateEmployeeStatus(row.employee_id, newStatus);
        this.$message.success('状态更新成功');
        this.getEmployeeList();
      } catch (error) {
        console.error('更新员工状态失败:', error);
      }
    },
    
    submitForm() {
      this.$refs.form.validate(async valid => {
        if (!valid) return;
        
        try {
          if (this.form.employee_id) {
            // 更新
            await updateEmployee(this.form.employee_id, this.form);
            this.$message.success('更新成功');
          } else {
            // 新增
            await createEmployee(this.form);
            this.$message.success('添加成功');
          }
          
          this.dialogVisible = false;
          this.getEmployeeList();
        } catch (error) {
          console.error('保存员工失败:', error);
          this.$message.error('保存员工失败');
        }
      });
    }
  }
}
</script>

<style scoped>
.employee-list {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-container {
  margin-bottom: 20px;
}

.table-container {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}
</style>
