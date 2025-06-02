<template>
  <div class="dish-list-container">
    <div class="page-header">
      <h2>菜品列表</h2>
      <el-button type="primary" @click="handleAdd">添加菜品</el-button>
    </div>
    
    <el-card shadow="hover" class="filter-container">
      <el-form :inline="true" :model="queryParams" ref="queryForm" size="small">
        <el-form-item label="菜品名称" prop="dish_name">
          <el-input v-model="queryParams.dish_name" placeholder="请输入菜品名称" clearable></el-input>
        </el-form-item>
        <el-form-item label="菜品类别" prop="category_id">
          <el-select v-model="queryParams.category_id" placeholder="请选择菜品类别" clearable>
            <el-option
              v-for="item in categoryOptions"
              :key="item.category_id"
              :label="item.category_name"
              :value="item.category_id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
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
        <el-table-column prop="category_name" label="菜品类别" min-width="100"></el-table-column>
        <el-table-column prop="price" label="价格" min-width="80">
          <template slot-scope="scope">
            {{ scope.row.price.toFixed(2) }} 元
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="150" show-overflow-tooltip></el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
              {{ scope.row.status === 1 ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="mini" type="success" @click="handleIngredient(scope.row)">配料</el-button>
            <el-button 
              size="mini" 
              :type="scope.row.status === 1 ? 'warning' : 'success'"
              @click="handleStatusChange(scope.row)">
              {{ scope.row.status === 1 ? '下架' : '上架' }}
            </el-button>
            <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.page"
        :limit.sync="queryParams.limit"
        @pagination="getDishList"
      />
    </el-card>
    
    <!-- 添加/编辑菜品对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="菜品名称" prop="dish_name">
          <el-input v-model="form.dish_name" placeholder="请输入菜品名称"></el-input>
        </el-form-item>
        <el-form-item label="菜品类别" prop="category_id">
          <el-select v-model="form.category_id" placeholder="请选择菜品类别" style="width: 100%">
            <el-option
              v-for="item in categoryOptions"
              :key="item.category_id"
              :label="item.category_name"
              :value="item.category_id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="form.price" :precision="2" :step="0.1" :min="0" style="width: 100%"></el-input-number>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入菜品描述"></el-input>
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
    <el-dialog title="配料管理" :visible.sync="ingredientDialogVisible" width="700px" append-to-body>
      <div v-if="currentDish.dish_id">
        <p class="ingredient-dish-info">
          菜品：{{ currentDish.dish_name }} | 
          类别：{{ currentDish.category_name }} | 
          价格：{{ currentDish.price ? currentDish.price.toFixed(2) : '0.00' }} 元
        </p>
        
        <el-divider content-position="left">已添加配料</el-divider>
        
        <el-table :data="dishIngredients" border style="width: 100%">
          <el-table-column prop="ingredient_name" label="原材料名称" min-width="120"></el-table-column>
          <el-table-column prop="quantity" label="用量" width="100">
            <template slot-scope="scope">
              {{ scope.row.quantity }} {{ scope.row.unit || '单位' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" align="center">
            <template slot-scope="scope">
              <el-button size="mini" type="danger" @click="handleRemoveIngredient(scope.row)">移除</el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <el-divider content-position="left">添加配料</el-divider>
        
        <el-form :inline="true" :model="ingredientForm" ref="ingredientForm" size="small">
          <el-form-item label="原材料" prop="ingredient_id" required>
            <el-select v-model="ingredientForm.ingredient_id" placeholder="请选择原材料" filterable>
              <el-option
                v-for="item in ingredientOptions"
                :key="item.ingredient_id"
                :label="item.ingredient_name"
                :value="item.ingredient_id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="用量" prop="quantity" required>
            <el-input-number v-model="ingredientForm.quantity" :precision="2" :step="0.1" :min="0.01"></el-input-number>
          </el-form-item>
          <el-form-item label="单位" prop="unit">
            <el-input v-model="ingredientForm.unit" placeholder="单位"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleAddIngredient">添加</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'DishList',
  components: {
    Pagination: () => import('@/components/common/Pagination.vue')
  },
  data() {
    return {
      loading: false,
      dishList: [],
      total: 0,
      queryParams: {
        page: 1,
        limit: 10,
        dish_name: '',
        category_id: undefined,
        status: undefined
      },
      dialogVisible: false,
      dialogTitle: '',
      form: {
        dish_name: '',
        category_id: undefined,
        price: 0,
        description: '',
        status: 1
      },
      rules: {
        dish_name: [{ required: true, message: '请输入菜品名称', trigger: 'blur' }],
        category_id: [{ required: true, message: '请选择菜品类别', trigger: 'change' }],
        price: [{ required: true, message: '请输入价格', trigger: 'blur' }]
      },
      categoryOptions: [],
      ingredientDialogVisible: false,
      currentDish: {},
      dishIngredients: [],
      ingredientOptions: [],
      ingredientForm: {
        ingredient_id: undefined,
        quantity: 1,
        unit: ''
      }
    };
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
        this.$message.error('获取菜品类别失败');
      }
    },
    async getIngredientOptions() {
      try {
        const res = await getAllIngredients();
        this.ingredientOptions = res.data || [];
      } catch (error) {
        console.error('获取原材料列表失败:', error);
        this.$message.error('获取原材料列表失败');
      }
    },
    handleQuery() {
      this.queryParams.page = 1;
      this.getDishList();
    },
    resetQuery() {
      this.$refs.queryForm.resetFields();
      this.handleQuery();
    },
    handleAdd() {
      this.dialogTitle = '添加菜品';
      this.form = {
        dish_name: '',
        category_id: undefined,
        price: 0,
        description: '',
        status: 1
      };
      this.dialogVisible = true;
    },
    handleEdit(row) {
      this.dialogTitle = '编辑菜品';
      this.form = { ...row };
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
        await updateDishStatus(row.dish_id, newStatus);
        this.$message.success(`${newStatus === 1 ? '上架' : '下架'}成功`);
        this.getDishList();
      } catch (error) {
        console.error('更新菜品状态失败:', error);
        this.$message.error('更新菜品状态失败');
      }
    },
    async submitForm() {
      this.$refs.form.validate(async (valid) => {
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
    },
    async handleIngredient(row) {
      this.currentDish = { ...row };
      this.ingredientDialogVisible = true;
      this.getDishIngredientList(row.dish_id);
    },
    async getDishIngredientList(dishId) {
      try {
        const res = await getDishIngredients(dishId);
        this.dishIngredients = res.data || [];
      } catch (error) {
        console.error('获取菜品配料失败:', error);
        this.$message.error('获取菜品配料失败');
      }
    },
    async handleAddIngredient() {
      if (!this.ingredientForm.ingredient_id || !this.ingredientForm.quantity) {
        this.$message.warning('请选择原材料并输入用量');
        return;
      }
      
      // 检查是否已添加该原材料
      const exists = this.dishIngredients.some(item => item.ingredient_id === this.ingredientForm.ingredient_id);
      if (exists) {
        this.$message.warning('该原材料已添加，请勿重复添加');
        return;
      }
      
      try {
        // 构建新的配料列表
        const newIngredients = [...this.dishIngredients];
        
        // 添加新配料
        const selectedIngredient = this.ingredientOptions.find(item => item.ingredient_id === this.ingredientForm.ingredient_id);
        if (selectedIngredient) {
          newIngredients.push({
            relation_id: 0, // 新添加的，暂无ID
            dish_id: this.currentDish.dish_id,
            ingredient_id: this.ingredientForm.ingredient_id,
            ingredient_name: selectedIngredient.ingredient_name,
            quantity: this.ingredientForm.quantity,
            unit: this.ingredientForm.unit,
            created_at: '',
            updated_at: ''
          });
        }
        
        // 更新配料列表
        await updateDishIngredients(this.currentDish.dish_id, {
          ingredients: newIngredients.map(item => ({
            ingredient_id: item.ingredient_id,
            quantity: item.quantity,
            unit: item.unit
          }))
        });
        
        this.$message.success('添加配料成功');
        this.getDishIngredientList(this.currentDish.dish_id);
        
        // 重置表单
        this.ingredientForm = {
          ingredient_id: undefined,
          quantity: 1,
          unit: ''
        };
      } catch (error) {
        console.error('添加配料失败:', error);
        this.$message.error('添加配料失败');
      }
    },
    async handleRemoveIngredient(row) {
      try {
        await this.$confirm('确认移除该配料吗？', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        
        // 构建新的配料列表（排除要删除的）
        const newIngredients = this.dishIngredients
          .filter(item => item.ingredient_id !== row.ingredient_id)
          .map(item => ({
            ingredient_id: item.ingredient_id,
            quantity: item.quantity,
            unit: item.unit
          }));
        
        // 更新配料列表
        await updateDishIngredients(this.currentDish.dish_id, {
          ingredients: newIngredients
        });
        
        this.$message.success('移除配料成功');
        this.getDishIngredientList(this.currentDish.dish_id);
      } catch (error) {
        console.error('移除配料失败:', error);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.dish-list-container {
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
  
  .ingredient-dish-info {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 15px;
  }
}
</style>