<template>
  <div class="dish-list">
    <div class="page-header">
      <h2>菜品管理</h2>
      <el-button type="primary" @click="handleAdd">添加菜品</el-button>
    </div>
    
    <el-card shadow="hover" class="filter-container">
      <el-form :inline="true" :model="queryParams" ref="queryForm">
        <el-form-item label="菜品名称">
          <el-input v-model="queryParams.dish_name" placeholder="请输入菜品名称" clearable></el-input>
        </el-form-item>
        <el-form-item label="菜品类别">
          <el-select v-model="queryParams.category_id" placeholder="请选择类别" clearable>
            <el-option
              v-for="item in categoryOptions"
              :key="item.category_id"
              :label="item.category_name"
              :value="item.category_id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
            <el-option label="上架" :value="1"></el-option>
            <el-option label="下架" :value="0"></el-option>
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
        :data="dishList"
        border
        style="width: 100%">
        <el-table-column type="index" width="50" align="center"></el-table-column>
        <el-table-column prop="dish_name" label="菜品名称" min-width="120"></el-table-column>
        <el-table-column prop="category_name" label="类别" width="100"></el-table-column>
        <el-table-column prop="price" label="价格" width="100">
          <template slot-scope="scope">
            {{ scope.row.price | formatMoney }} 元
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="150"></el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
              {{ scope.row.status === 1 ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" align="center">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button 
              size="mini" 
              :type="scope.row.status === 1 ? 'warning' : 'success'"
              @click="handleStatusChange(scope.row)">
              {{ scope.row.status === 1 ? '下架' : '上架' }}
            </el-button>
            <el-button size="mini" type="info" @click="handleIngredients(scope.row)">配料</el-button>
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
    
    <!-- 添加/编辑菜品对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="菜品名称" prop="dish_name">
          <el-input v-model="form.dish_name" placeholder="请输入菜品名称"></el-input>
        </el-form-item>
        <el-form-item label="类别" prop="category_id">
          <el-select v-model="form.category_id" placeholder="请选择类别" style="width: 100%;">
            <el-option
              v-for="item in categoryOptions"
              :key="item.category_id"
              :label="item.category_name"
              :value="item.category_id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="form.price" :precision="2" :step="0.1" :min="0" style="width: 100%;"></el-input-number>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input type="textarea" v-model="form.description" placeholder="请输入菜品描述"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">上架</el-radio>
            <el-radio :label="0">下架</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </div>
    </el-dialog>
    
    <!-- 配料管理对话框 -->
    <el-dialog title="配料管理" :visible.sync="ingredientsDialogVisible" width="600px">
      <div v-if="currentDish">
        <p>菜品：{{ currentDish.dish_name }}</p>
        <el-divider></el-divider>
        
        <el-form :inline="true">
          <el-form-item label="添加配料">
            <el-select v-model="selectedIngredient" placeholder="请选择原材料" filterable>
              <el-option
                v-for="item in ingredientOptions"
                :key="item.ingredient_id"
                :label="item.ingredient_name"
                :value="item.ingredient_id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="用量">
            <el-input-number v-model="ingredientAmount" :min="0.01" :step="0.1" :precision="2"></el-input-number>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="addIngredient">添加</el-button>
          </el-form-item>
        </el-form>
        
        <el-table :data="dishIngredients" border style="width: 100%">
          <el-table-column prop="ingredient_name" label="原材料名称"></el-table-column>
          <el-table-column prop="amount" label="用量">
            <template slot-scope="scope">
              {{ scope.row.amount }} {{ scope.row.unit || '单位' }}
            </template>
          </el-table-column>
          <el-table-column prop="cost_price" label="成本价">
            <template slot-scope="scope">
              {{ scope.row.cost_price | formatMoney }} 元
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" align="center">
            <template slot-scope="scope">
              <el-button size="mini" type="danger" @click="removeIngredient(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="ingredientsDialogVisible = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getDishes, getDish, createDish, updateDish, deleteDish, updateDishStatus, getDishIngredients, updateDishIngredients } from '@/api/dish';
import { getAllCategories } from '@/api/category';
import { getAllIngredients } from '@/api/ingredient';

export default {
  name: 'DishList',
  data() {
    return {
      loading: false,
      dishList: [],
      total: 0,
      queryParams: {
        page: 1,
        limit: 10,
        dish_name: '',
        category_id: '',
        status: ''
      },
      
      categoryOptions: [],
      ingredientOptions: [],
      
      dialogVisible: false,
      dialogTitle: '',
      form: {
        dish_name: '',
        category_id: '',
        price: 0,
        description: '',
        status: 1
      },
      
      rules: {
        dish_name: [{ required: true, message: '请输入菜品名称', trigger: 'blur' }],
        category_id: [{ required: true, message: '请选择菜品类别', trigger: 'change' }],
        price: [{ required: true, message: '请输入菜品价格', trigger: 'blur' }]
      },
      
      ingredientsDialogVisible: false,
      currentDish: null,
      dishIngredients: [],
      selectedIngredient: '',
      ingredientAmount: 1
    }
  },
  created() {
    this.getDishList();
    this.getCategoryOptions();
    this.getIngredientOptions();
  },
  methods: {
    async getDishList() {
      this.loading = true;
      try {
        const res = await getDishes(this.queryParams);
        this.dishList = res.data.items || [];
        this.total = res.data.total || 0;
      } catch (error) {
        console.error('获取菜品列表失败:', error);
        this.$message.error('获取菜品列表失败');
      } finally {
        this.loading = false;
      }
    },
    
    async getCategoryOptions() {
      try {
        const res = await getAllCategories();
        this.categoryOptions = res.data || [];
      } catch (error) {
        console.error('获取菜品类别失败:', error);
      }
    },
    
    async getIngredientOptions() {
      try {
        const res = await getAllIngredients();
        this.ingredientOptions = res.data || [];
      } catch (error) {
        console.error('获取原材料列表失败:', error);
      }
    },
    
    handleQuery() {
      this.queryParams.page = 1;
      this.getDishList();
    },
    
    resetQuery() {
      this.queryParams = {
        page: 1,
        limit: 10,
        dish_name: '',
        category_id: '',
        status: ''
      };
      this.getDishList();
    },
    
    handleSizeChange(val) {
      this.queryParams.limit = val;
      this.getDishList();
    },
    
    handleCurrentChange(val) {
      this.queryParams.page = val;
      this.getDishList();
    },
    
    handleAdd() {
      this.dialogTitle = '添加菜品';
      this.form = {
        dish_name: '',
        category_id: '',
        price: 0,
        description: '',
        status: 1
      };
      this.dialogVisible = true;
    },
    
    handleEdit(row) {
      this.dialogTitle = '编辑菜品';
      this.form = JSON.parse(JSON.stringify(row));
      this.dialogVisible = true;
    },
    
    async handleDelete(row) {
      try {
        await this.$confirm('确认删除该菜品吗？', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        
        await deleteDish(row.dish_id);
        this.$message.success('删除成功');
        this.getDishList();
      } catch (error) {
        console.error('删除菜品失败:', error);
      }
    },
    
    async handleStatusChange(row) {
      try {
        const newStatus = row.status === 1 ? 0 : 1;
        const confirmText = newStatus === 1 ? '确认上架该菜品吗？' : '确认下架该菜品吗？';
        
        await this.$confirm(confirmText, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        
        await updateDishStatus(row.dish_id, newStatus);
        this.$message.success('状态更新成功');
        this.getDishList();
      } catch (error) {
        console.error('更新菜品状态失败:', error);
      }
    },
    
    async handleIngredients(row) {
      this.currentDish = row;
      this.ingredientsDialogVisible = true;
      this.dishIngredients = [];
      
      try {
        const res = await getDishIngredients(row.dish_id);
        this.dishIngredients = res.data || [];
      } catch (error) {
        console.error('获取菜品配料失败:', error);
        this.$message.error('获取菜品配料失败');
      }
    },
    
    async addIngredient() {
      if (!this.selectedIngredient || this.ingredientAmount <= 0) {
        this.$message.warning('请选择原材料并输入正确的用量');
        return;
      }
      
      // 检查是否已存在该原材料
      const exists = this.dishIngredients.some(item => item.ingredient_id === this.selectedIngredient);
      if (exists) {
        this.$message.warning('该原材料已添加，请直接修改用量');
        return;
      }
      
      // 查找选中的原材料信息
      const ingredient = this.ingredientOptions.find(item => item.ingredient_id === this.selectedIngredient);
      if (!ingredient) return;
      
      // 添加到配料列表
      this.dishIngredients.push({
        ingredient_id: ingredient.ingredient_id,
        ingredient_name: ingredient.ingredient_name,
        amount: this.ingredientAmount,
        unit: ingredient.unit,
        cost_price: ingredient.cost_price
      });
      
      // 更新菜品配料
      try {
        await updateDishIngredients(this.currentDish.dish_id, {
          ingredients: this.dishIngredients.map(item => ({
            ingredient_id: item.ingredient_id,
            amount: item.amount
          }))
        });
        this.$message.success('添加配料成功');
      } catch (error) {
        console.error('添加配料失败:', error);
        this.$message.error('添加配料失败');
      }
      
      // 重置选择
      this.selectedIngredient = '';
      this.ingredientAmount = 1;
    },
    
    async removeIngredient(row) {
      try {
        await this.$confirm('确认删除该配料吗？', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        
        // 从列表中移除
        this.dishIngredients = this.dishIngredients.filter(item => item.ingredient_id !== row.ingredient_id);
        
        // 更新菜品配料
        await updateDishIngredients(this.currentDish.dish_id, {
          ingredients: this.dishIngredients.map(item => ({
            ingredient_id: item.ingredient_id,
            amount: item.amount
          }))
        });
        this.$message.success('删除配料成功');
      } catch (error) {
        console.error('删除配料失败:', error);
      }
    },
    
    submitForm() {
      this.$refs.form.validate(async valid => {
        if (!valid) return;
        
        try {
          if (this.form.dish_id) {
            // 更新
            await updateDish(this.form.dish_id, this.form);
            this.$message.success('更新成功');
          } else {
            // 新增
            await createDish(this.form);
            this.$message.success('添加成功');
          }
          
          this.dialogVisible = false;
          this.getDishList();
        } catch (error) {
          console.error('保存菜品失败:', error);
          this.$message.error('保存菜品失败');
        }
      });
    }
  }
}
</script>

<style scoped>
.dish-list {
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
