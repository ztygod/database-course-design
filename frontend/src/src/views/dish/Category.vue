<template>
  <div class="category-list">
    <div class="page-header">
      <h2>菜品类别管理</h2>
      <el-button type="primary" @click="handleAdd">添加类别</el-button>
    </div>
    
    <el-card shadow="hover" class="table-container">
      <el-table
        v-loading="loading"
        :data="categoryList"
        border
        style="width: 100%">
        <el-table-column type="index" width="50" align="center"></el-table-column>
        <el-table-column prop="category_name" label="类别名称" min-width="120"></el-table-column>
        <el-table-column prop="description" label="描述" min-width="200"></el-table-column>
        <el-table-column prop="dish_count" label="菜品数量" width="100" align="center"></el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
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
    
    <!-- 添加/编辑类别对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="类别名称" prop="category_name">
          <el-input v-model="form.category_name" placeholder="请输入类别名称"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input type="textarea" v-model="form.description" placeholder="请输入类别描述"></el-input>
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
import { getCategories, getCategory, createCategory, updateCategory, deleteCategory } from '@/api/category';

export default {
  name: 'CategoryList',
  data() {
    return {
      loading: false,
      categoryList: [],
      total: 0,
      queryParams: {
        page: 1,
        limit: 10
      },
      
      dialogVisible: false,
      dialogTitle: '',
      form: {
        category_name: '',
        description: ''
      },
      
      rules: {
        category_name: [{ required: true, message: '请输入类别名称', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getCategoryList();
  },
  methods: {
    async getCategoryList() {
      this.loading = true;
      try {
        const res = await getCategories(this.queryParams);
        this.categoryList = res.data.items || [];
        this.total = res.data.total || 0;
      } catch (error) {
        console.error('获取类别列表失败:', error);
        this.$message.error('获取类别列表失败');
      } finally {
        this.loading = false;
      }
    },
    
    handleSizeChange(val) {
      this.queryParams.limit = val;
      this.getCategoryList();
    },
    
    handleCurrentChange(val) {
      this.queryParams.page = val;
      this.getCategoryList();
    },
    
    handleAdd() {
      this.dialogTitle = '添加类别';
      this.form = {
        category_name: '',
        description: ''
      };
      this.dialogVisible = true;
    },
    
    handleEdit(row) {
      this.dialogTitle = '编辑类别';
      this.form = JSON.parse(JSON.stringify(row));
      this.dialogVisible = true;
    },
    
    async handleDelete(row) {
      try {
        // 检查是否有关联的菜品
        if (row.dish_count > 0) {
          this.$message.warning(`该类别下有${row.dish_count}个菜品，无法删除`);
          return;
        }
        
        await this.$confirm('确认删除该类别吗？', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        
        await deleteCategory(row.category_id);
        this.$message.success('删除成功');
        this.getCategoryList();
      } catch (error) {
        console.error('删除类别失败:', error);
      }
    },
    
    submitForm() {
      this.$refs.form.validate(async valid => {
        if (!valid) return;
        
        try {
          if (this.form.category_id) {
            // 更新
            await updateCategory(this.form.category_id, this.form);
            this.$message.success('更新成功');
          } else {
            // 新增
            await createCategory(this.form);
            this.$message.success('添加成功');
          }
          
          this.dialogVisible = false;
          this.getCategoryList();
        } catch (error) {
          console.error('保存类别失败:', error);
          this.$message.error('保存类别失败');
        }
      });
    }
  }
}
</script>

<style scoped>
.category-list {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
