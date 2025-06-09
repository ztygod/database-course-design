<template>
  <div class="dish-list-container">
    <div class="page-header">
      <h2>菜品列表</h2>
      <el-button type="primary" @click="handleAdd">添加菜品</el-button>
    </div>
    
    <!-- <el-card shadow="hover" class="filter-container">
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
    </el-card> -->
    
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
          <template #default="{ row }">
            {{ row.price }} 元
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="150" show-overflow-tooltip></el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="200" align="center">
          <template #default="{ row }">
            <el-button size="mini" type="primary" @click="handleEdit(row)">编辑</el-button>
            <!-- <el-button size="mini" type="success" @click="handleIngredient(row)">配料</el-button> -->
            <el-button 
              size="mini" 
              :type="row.status === 1 ? 'warning' : 'success'"
              @click="handleStatusChange(row)">
              {{ row.status === 1 ? '下架' : '上架' }}
            </el-button>
            <el-button size="mini" type="danger" @click="handleDelete(row)">删除</el-button>
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
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
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
      <template #footer>
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </template>
    </el-dialog>
    
    <!-- 配料管理对话框 -->
    <!-- <el-dialog title="配料管理" v-model="ingredientDialogVisible" width="700px" append-to-body>
      <div v-if="currentDish.dish_id">
        <p class="ingredient-dish-info">
          菜品：{{ currentDish.dish_name }} | 
          类别：{{ currentDish.category_name }} | 
          价格：{{ currentDish.price ? currentDish.price : '0.00' }} 元
        </p>
        
        <el-divider content-position="left">已添加配料</el-divider>
        
        <el-table :data="dishIngredients" border style="width: 100%">
          <el-table-column prop="ingredient_name" label="原材料名称" min-width="120"></el-table-column>
          <el-table-column prop="quantity" label="用量" width="100">
            <template #default="{ row }">
              {{ row.quantity }} {{ row.unit || '单位' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" align="center">
            <template #default="{ row }">
              <el-button size="mini" type="danger" @click="handleRemoveIngredient(row)">移除</el-button>
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
    </el-dialog> -->
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import Pagination from '@/components/common/Pagination.vue'
import { getDishes, deleteDish, updateDishStatus, updateDish, createDish, getDishIngredients, updateDishIngredients,getAllDishes } from '@/api/dish'
import { getAllCategories } from '@/api/category';
import { getAllIngredients } from '@/api/ingredient';

const loading = ref(false)
const dishList = ref([])
const total = ref(0)
const queryParams = reactive({
  page: 1,
  limit: 10,
  dish_name: '',
  category_id: undefined,
  status: undefined
})

const dialogVisible = ref(false)
const dialogTitle = ref('')
const form = reactive({
  dish_name: '',
  category_id: undefined,
  price: 0,
  description: '',
  status: 1
})
const formRef = ref(null)

const rules = {
  dish_name: [{ required: true, message: '请输入菜品名称', trigger: 'blur' }],
  category_id: [{ required: true, message: '请选择菜品类别', trigger: 'change' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }]
}

const categoryOptions = ref([])
const ingredientDialogVisible = ref(false)
const currentDish = reactive({})
const dishIngredients = ref([])
const ingredientOptions = ref([])
const ingredientForm = reactive({
  ingredient_id: undefined,
  quantity: 1,
  unit: ''
})

// const message = useMessage()

onMounted(() => {
  getDishList()
  getCategoryOptions()
  getIngredientOptions()
})

async function getDishList() {
  loading.value = true
  try {
    const res = await getAllDishes(queryParams)
    console.log('res',res)
    dishList.value = res.data
    total.value = res.data.total || 0
  } catch (error) {
    console.error('获取菜品列表失败:', error)
    ElMessage.error('获取菜品列表失败')
  } finally {
    loading.value = false
  }
}

async function getCategoryOptions() {
  try {
    const res = await getAllCategories()
    categoryOptions.value = res.data || []
  } catch (error) {
    console.error('获取菜品类别失败:', error)
    ElMessage.error('获取菜品类别失败')
  }
}

async function getIngredientOptions() {
  try {
    const res = await getAllIngredients()
    ingredientOptions.value = res.data || []
  } catch (error) {
    console.error('获取原材料列表失败:', error)
    ElMessage.error('获取原材料列表失败')
  }
}

function handleQuery() {
  queryParams.page = 1
  getDishList()
}

function resetQuery() {
  queryParams.dish_name = ''
  queryParams.category_id = undefined
  queryParams.status = undefined
  handleQuery()
}

function handleAdd() {
  dialogTitle.value = '添加菜品'
  form.dish_name = ''
  form.category_id = undefined
  form.price = 0
  form.description = ''
  form.status = 1
  dialogVisible.value = true
}

function handleEdit(row) {
  dialogTitle.value = '编辑菜品'
  Object.assign(form, row)
  dialogVisible.value = true
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm('确认删除该菜品吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteDish(row.dish_id)
    ElMessageBox.success('删除成功')
    getDishList()
  } catch (error) {
    console.error('删除菜品失败:', error)
  }
}

async function handleStatusChange(row) {
  try {
    const newStatus = row.status === 1 ? 0 : 1
    await updateDishStatus(row.dish_id, newStatus)
    ElMessageBox.confirm(`${newStatus === 1 ? '上架' : '下架'}成功`)
    getDishList()
  } catch (error) {
    console.error('更新菜品状态失败:', error)
    ElMessage.error('更新菜品状态失败')
  }
}

async function submitForm() {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    
    try {
      console.log("from",form)
      if (form.dish_id) {
        // 更新
        await updateDish(form.dish_id, form)
        ElMessageBox.confirm('更新成功')
      } else {
        // 新增
        await createDish(form)
        ElMessageBox.confirm('添加成功')
      }
      
      dialogVisible.value = false
      getDishList()
    } catch (error) {
      console.error('保存菜品失败:', error)
      ElMessage.error('保存菜品失败')
    }
  })
}

async function handleIngredient(row) {
  Object.assign(currentDish, row)
  ingredientDialogVisible.value = true
  getDishIngredientList(row.dish_id)
}

async function getDishIngredientList(dishId) {
  try {
    const res = await getDishIngredients(dishId)
    dishIngredients.value = res.data || []
  } catch (error) {
    console.error('获取菜品配料失败:', error)
    ElMessage.error('获取菜品配料失败')
  }
}

async function handleAddIngredient() {
  if (!ingredientForm.ingredient_id || !ingredientForm.quantity) {
    ElMessage.warning('请选择原材料并输入用量')
    return
  }

  // 检查是否已添加该原材料
  const exists = dishIngredients.value.some(item => item.ingredient_id === ingredientForm.ingredient_id)
  if (exists) {
    ElMessage.warning('该原材料已添加，请勿重复添加')
    return
  }

  try {
    // 构建新的配料列表
    const newIngredients = [...dishIngredients.value]

    // 添加新配料
    const selectedIngredient = ingredientOptions.value.find(item => item.ingredient_id === ingredientForm.ingredient_id)
    if (selectedIngredient) {
      newIngredients.push({
        relation_id: 0, // 新添加的，暂无ID
        dish_id: currentDish.dish_id,
        ingredient_id: ingredientForm.ingredient_id,
        ingredient_name: selectedIngredient.ingredient_name,
        quantity: ingredientForm.quantity,
        unit: ingredientForm.unit,
        created_at: '',
        updated_at: ''
      })
    }

    // 更新配料列表
    await updateDishIngredients(currentDish.dish_id, {
      ingredients: newIngredients.map(item => ({
        ingredient_id: item.ingredient_id,
        quantity: item.quantity,
        unit: item.unit
      }))
    })

    ElMessageBox.success('添加配料成功')
    getDishIngredientList(currentDish.dish_id)

    // 重置表单
    ingredientForm.ingredient_id = undefined
    ingredientForm.quantity = 1
    ingredientForm.unit = ''
  } catch (error) {
    console.error('添加配料失败:', error)
    ElMessage.error('添加配料失败')
  }
}

async function handleRemoveIngredient(row) {
  try {
    await ElMessage.confirm('确认移除该配料吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 构建新的配料列表（排除要删除的）
    const newIngredients = dishIngredients.value
      .filter(item => item.ingredient_id !== row.ingredient_id)
      .map(item => ({
        ingredient_id: item.ingredient_id,
        quantity: item.quantity,
        unit: item.unit
      }))

    // 更新配料列表
    await updateDishIngredients(currentDish.dish_id, {
      ingredients: newIngredients
    })

    ElMessageBox.success('移除配料成功')
    getDishIngredientList(currentDish.dish_id)
  } catch (error) {
    console.error('移除配料失败:', error)
  }
}
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
