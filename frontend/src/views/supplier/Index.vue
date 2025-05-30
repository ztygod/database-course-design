<template>
  <div class="supplier-container">
    <div class="page-header">
      <h2>供应商管理</h2>
      <el-button type="primary" @click="handleAdd">添加供应商</el-button>
    </div>
    
    <el-card shadow="hover" class="filter-container">
      <el-form :inline="true" :model="queryParams" ref="queryForm" size="small">
        <el-form-item label="供应商名称" prop="supplier_name">
          <el-input v-model="queryParams.supplier_name" placeholder="请输入供应商名称" clearable></el-input>
        </el-form-item>
        <el-form-item label="联系人" prop="contact_name">
          <el-input v-model="queryParams.contact_name" placeholder="请输入联系人" clearable></el-input>
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
        :data="supplierList"
        border
        style="width: 100%">
        <el-table-column type="index" width="50" align="center"></el-table-column>
        <el-table-column prop="supplier_name" label="供应商名称" min-width="120"></el-table-column>
        <el-table-column prop="contact_name" label="联系人" min-width="100"></el-table-column>
        <el-table-column prop="phone" label="联系电话" min-width="120"></el-table-column>
        <el-table-column prop="address" label="地址" min-width="200" show-overflow-tooltip></el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="150"></el-table-column>
        <el-table-column label="操作" width="150" align="center">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.page"
        :limit.sync="queryParams.limit"
        @pagination="getSupplierList"
      />
    </el-card>
    
    <!-- 添加/编辑供应商对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="供应商名称" prop="supplier_name">
          <el-input v-model="form.supplier_name" placeholder="请输入供应商名称"></el-input>
        </el-form-item>
        <el-form-item label="联系人" prop="contact_name">
          <el-input v-model="form.contact_name" placeholder="请输入联系人"></el-input>
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入联系电话"></el-input>
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入地址"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { getSuppliers, getSupplier, createSupplier, updateSupplier, deleteSupplier } from '@/api/supplier';
import { Supplier } from '@/types';
import Pagination from '@/components/common/Pagination.vue';

@Component({
  components: {
    Pagination
  }
})
export default class SupplierIndex extends Vue {
  private loading = false;
  private supplierList: Supplier[] = [];
  private total = 0;
  private queryParams = {
    page: 1,
    limit: 10,
    supplier_name: '',
    contact_name: ''
  };
  
  private dialogVisible = false;
  private dialogTitle = '';
  private form: Partial<Supplier> = {
    supplier_name: '',
    contact_name: '',
    phone: '',
    address: '',
    email: ''
  };
  
  private rules = {
    supplier_name: [{ required: true, message: '请输入供应商名称', trigger: 'blur' }]
  };
  
  created() {
    this.getSupplierList();
  }
  
  private async getSupplierList() {
    this.loading = true;
    try {
      const res = await getSuppliers(this.queryParams);
      this.supplierList = res.data.items || [];
      this.total = res.data.total || 0;
    } catch (error) {
      console.error('获取供应商列表失败:', error);
      this.$message.error('获取供应商列表失败');
    } finally {
      this.loading = false;
    }
  }
  
  private handleQuery() {
    this.queryParams.page = 1;
    this.getSupplierList();
  }
  
  private resetQuery() {
    (this.$refs.queryForm as any).resetFields();
    this.handleQuery();
  }
  
  private handleAdd() {
    this.dialogTitle = '添加供应商';
    this.form = {
      supplier_name: '',
      contact_name: '',
      phone: '',
      address: '',
      email: ''
    };
    this.dialogVisible = true;
  }
  
  private handleEdit(row: Supplier) {
    this.dialogTitle = '编辑供应商';
    this.form = { ...row };
    this.dialogVisible = true;
  }
  
  private async handleDelete(row: Supplier) {
    try {
      await this.$confirm('确认删除该供应商吗？删除后关联的原材料将无法显示', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      });
      
      await deleteSupplier(row.supplier_id);
      this.$message.success('删除成功');
      this.getSupplierList();
    } catch (error) {
      console.error('删除供应商失败:', error);
    }
  }
  
  private async submitForm() {
    (this.$refs.form as any).validate(async (valid: boolean) => {
      if (!valid) return;
      
      try {
        if (this.form.supplier_id) {
          // 更新
          await updateSupplier(this.form.supplier_id, this.form);
          this.$message.success('更新成功');
        } else {
          // 新增
          await createSupplier(this.form);
          this.$message.success('添加成功');
        }
        
        this.dialogVisible = false;
        this.getSupplierList();
      } catch (error) {
        console.error('保存供应商失败:', error);
        this.$message.error('保存供应商失败');
      }
    });
  }
}
</script>

<style lang="scss" scoped>
.supplier-container {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h2 {
      margin: 0;
    }
  }
  
  .filter-container {
    margin-bottom: 20px;
  }
  
  .table-container {
    margin-bottom: 20px;
  }
}
</style>
