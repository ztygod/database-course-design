<template>
  <div class="ingredient-list">
    <div class="page-header">
      <h2>原材料管理</h2>
      <el-button type="primary" @click="handleAdd">添加原材料</el-button>
    </div>
    
    <!-- <el-card shadow="hover" class="filter-container">
      <el-form :inline="true" :model="queryParams" ref="queryForm">
        <el-form-item label="原材料名称">
          <el-input v-model="queryParams.ingredient_name" placeholder="请输入原材料名称" clearable></el-input>
        </el-form-item>
        <el-form-item label="供应商">
          <el-select v-model="queryParams.supplier_id" placeholder="请选择供应商" clearable>
            <el-option
              v-for="item in supplierOptions"
              :key="item.supplier_id"
              :label="item.supplier_name"
              :value="item.supplier_id">
            </el-option>
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
        :data="ingredientList"
        border
        style="width: 100%">
        <el-table-column type="index" width="50" align="center"></el-table-column>
        <el-table-column prop="ingredient_name" label="原材料名称" min-width="120"></el-table-column>
        <el-table-column prop="supplier_name" label="供应商" min-width="120"></el-table-column>
        <el-table-column prop="stock_quantity" label="库存数量">
          <template #default="{ row }">
            {{ row.stock_quantity }} {{ row.unit || '单位' }}
          </template>
        </el-table-column>
        <el-table-column prop="cost_price" label="成本价">
          <template #default="{ row }">
            {{ row.cost_price | formatMoney }} 元
          </template>
        </el-table-column>
        <el-table-column prop="warning_quantity" label="预警数量">
          <template #default="{ row }">
            {{ row.warning_quantity }} {{ row.unit || '单位' }}
          </template>
        </el-table-column>
        <!-- <el-table-column prop="description" label="描述" min-width="150"></el-table-column> -->
        <el-table-column label="操作" width="300" align="center">
          <template #default="{ row }">
            <el-button size="mini" type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button size="mini" type="success" @click="handleInventoryIn(row)">入库</el-button>
            <el-button size="mini" type="danger" @click="handleDelete(row)">删除</el-button>
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
    
    <!-- 添加/编辑原材料对话框 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="原材料名称" prop="ingredient_name">
          <el-input v-model="form.ingredient_name" placeholder="请输入原材料名称"></el-input>
        </el-form-item>
        <el-form-item label="供应商" prop="supplier_id">
          <el-select v-model="form.supplier_id" placeholder="请选择供应商" style="width: 100%;">
            <el-option
              v-for="item in supplierOptions"
              :key="item.supplier_id"
              :label="item.supplier_name"
              :value="item.supplier_id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="计量单位" prop="unit">
          <el-input v-model="form.unit" placeholder="请输入计量单位"></el-input>
        </el-form-item>
        <el-form-item label="成本价" prop="cost_price">
          <el-input-number v-model="form.cost_price" :precision="2" :step="0.1" :min="0" style="width: 100%;"></el-input-number>
        </el-form-item>
        <el-form-item label="预警数量" prop="warning_quantity">
          <el-input-number v-model="form.warning_quantity" :precision="2" :step="1" :min="0" style="width: 100%;"></el-input-number>
        </el-form-item>
        <!-- <el-form-item label="描述" prop="description">
          <el-input type="textarea" v-model="form.description" placeholder="请输入描述"></el-input>
        </el-form-item> -->
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </template>
    </el-dialog>
    
    <!-- 入库对话框 -->
    <el-dialog title="原材料入库" v-model="inventoryDialogVisible" width="400px">
      <el-form ref="inventoryFormRef" :model="inventoryForm" :rules="inventoryRules" label-width="100px">
        <el-form-item label="原材料">
          <span>{{ currentIngredient.ingredient_name }}</span>
        </el-form-item>
        <el-form-item label="当前库存">
          <span>{{ currentIngredient.stock_quantity }} {{ currentIngredient.unit || '单位' }}</span>
        </el-form-item>
        <el-form-item label="入库数量" prop="quantity">
          <el-input-number v-model="inventoryForm.quantity" :precision="2" :step="1" :min="0.01" style="width: 100%;"></el-input-number>
        </el-form-item>
        <el-form-item label="备注" prop="notes">
          <el-input type="textarea" v-model="inventoryForm.notes" placeholder="请输入备注"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="inventoryDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitInventory">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getIngredients, createIngredient, updateIngredient, deleteIngredient, getAllIngredients } from '@/api/ingredient'
import { getAllSuppliers } from '@/api/supplier'
import { createInventoryRecord } from '@/api/inventory'

const loading = ref(false)
const ingredientList = ref([])
const total = ref(0)
const queryParams = reactive({
  page: 1,
  limit: 10,
  ingredient_name: '',
  supplier_id: ''
})

const supplierOptions = ref([])

const dialogVisible = ref(false)
const dialogTitle = ref('')
const form = reactive({
  ingredient_name: '',
  supplier_id: '',
  unit: '',
  cost_price: 0,
  warning_quantity: 10,
  description: ''
})

const rules = {
  ingredient_name: [{ required: true, message: '请输入原材料名称', trigger: 'blur' }],
  supplier_id: [{ required: true, message: '请选择供应商', trigger: 'change' }],
  unit: [{ required: true, message: '请输入计量单位', trigger: 'blur' }],
  cost_price: [{ required: true, message: '请输入成本价', trigger: 'blur' }],
  warning_quantity: [{ required: true, message: '请输入预警数量', trigger: 'blur' }]
}

const inventoryDialogVisible = ref(false)
const currentIngredient = ref({})
const inventoryForm = reactive({
  quantity: 1,
  notes: ''
})
const inventoryFormRef = ref(null)
const formRef = ref(null)

const inventoryRules = {
  quantity: [{ required: true, message: '请输入入库数量', trigger: 'blur' }]
}

// const message = useMessage()
// const confirm = useConfirm()

onMounted(() => {
  getIngredientList()
  getSupplierOptions()
})

async function getIngredientList() {
  loading.value = true
  try {
    const res = await getAllIngredients(queryParams)
    ingredientList.value = res.data || []
    total.value = res.data.total || 0
  } catch (error) {
    console.error('获取原材料列表失败:', error)
    ElMessage.error('获取原材料列表失败')
  } finally {
    loading.value = false
  }
}

async function getSupplierOptions() {
  try {
    const res = await getAllSuppliers()
    supplierOptions.value = res.data || []
  } catch (error) {
    console.error('获取供应商列表失败:', error)
  }
}

function handleQuery() {
  queryParams.page = 1
  getIngredientList()
}

function resetQuery() {
  queryParams.ingredient_name = ''
  queryParams.supplier_id = ''
  handleQuery()
}

function handleSizeChange(val) {
  queryParams.limit = val
  getIngredientList()
}

function handleCurrentChange(val) {
  queryParams.page = val
  getIngredientList()
}

function handleAdd() {
  dialogTitle.value = '添加原材料'
  Object.assign(form, {
    ingredient_name: '',
    supplier_id: '',
    unit: '',
    cost_price: 0,
    warning_quantity: 10,
    description: ''
  })
  dialogVisible.value = true
}

function handleEdit(row) {
  dialogTitle.value = '编辑原材料'
  Object.assign(form, row)
  dialogVisible.value = true
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm('确认删除该原材料吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteIngredient(row.ingredient_id)
    ElMessage.success('删除成功')
    getIngredientList()
  } catch (error) {
    console.error('删除原材料失败:', error)
  }
}

function handleInventoryIn(row) {
  currentIngredient.value = row
  Object.assign(inventoryForm, {
    quantity: 1,
    notes: ''
  })
  inventoryDialogVisible.value = true
}

function submitForm() {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    
    try {
      if (form.ingredient_id) {
        await updateIngredient(form.ingredient_id, form)
        ElMessage.success('更新成功')
      } else {
        await createIngredient(form)
        ElMessage.success('添加成功')
      }
      
      dialogVisible.value = false
      getIngredientList()
    } catch (error) {
      console.error('保存原材料失败:', error)
      ElMessage.error('保存原材料失败')
    }
  })
}

function submitInventory() {
  inventoryFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    try {
      await createInventoryRecord({
        ingredient_id: currentIngredient.value.ingredient_id,
        type: 'in',
        quantity: inventoryForm.quantity,
        notes: inventoryForm.notes
      })
      
      ElMessage.success('入库成功')
      inventoryDialogVisible.value = false
      getIngredientList()
    } catch (error) {
      console.error('入库失败:', error)
      ElMessage.error('入库失败')
    }
  })
}
</script>

<style scoped>
.ingredient-list {
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
