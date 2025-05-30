<template>
  <div class="category-container">
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
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip></el-table-column>
        <el-table-column prop="created_at" label="创建时间" min-width="160">
          <template slot-scope="scope">
            {{ formatDate(scope.row.created_at) }}
          </template>
        </el-table-column>
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
        @pagination="getCategoryList"
      />
    </el-card>
    
    <!-- 添加/编辑类别对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="类别名称" prop="category_name">
          <el-input v-model="form.category_name" placeholder="请输入类别名称"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入类别描述"></el-input>
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
import { getCategories, getCategory, createCategory, updateCategory, deleteCategory } from '@/api/category';
import { Category } from '@/types';
import Pagination from '@/components/common/Pagination.vue';
import moment from 'moment';

@Component({
  components: {
    Pagination
  }
})
export default class CategoryList extends Vue {
  private loading = false;
  private categoryList: Category[] = [];
  private total = 0;
  private queryParams = {
    page: 1,
    limit: 10
  };
  
  private dialogVisible = false;
  private dialogTitle = '';
  private form: Partial<Category> = {
    category_name: '',
    description: ''
  };
  
  private rules = {
    category_name: [{ required: true, message: '请输入类别名称', trigger: 'blur' }]
  };
  
  created() {
    this.getCategoryList();
  }
  
  private async getCategoryList() {
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
  }
  
  private formatDate(date: string) {
    return moment(date).format('YYYY-MM-DD HH:mm:ss');
  }
  
  private handleAdd() {
    this.dialogTitle = '添加类别';
    this.form = {
      category_name: '',
      description: ''
    };
    this.dialogVisible = true;
  }
  
  private handleEdit(row: Category) {
    this.dialogTitle = '编辑类别';
    this.form = { ...row };
    this.dialogVisible = true;
  }
  
  private async handleDelete(row: Category) {
    try {
      await this.$confirm('确认删除该类别吗？删除后关联的菜品将无法显示', '警告', {
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
  }
  
  private async submitForm() {
    (this.$refs.form as any).validate(async (valid: boolean) => {
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
</script>

<style lang="scss" scoped>
.category-container {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h2 {
      margin: 0;
    }
  }
  
  .table-container {
    margin-bottom: 20px;
  }
}
</style>
