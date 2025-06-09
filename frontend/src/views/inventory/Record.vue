<template>
  <div class="inventory-list">
    <div class="page-header">
      <h2>库存管理</h2>
      <div>
        <el-button type="primary" @click="handleInStock">入库登记</el-button>
        <el-button type="warning" @click="handleOutStock">出库登记</el-button>
      </div>
    </div>

    <!-- <el-card shadow="hover" class="filter-container">
      <el-form :inline="true" :model="queryParams" ref="queryForm">
        <el-form-item label="原材料">
          <el-select v-model="queryParams.ingredient_id" placeholder="请选择原材料" clearable filterable>
            <el-option
              v-for="item in ingredientOptions"
              :key="item.ingredient_id"
              :label="item.ingredient_name"
              :value="item.ingredient_id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="queryParams.type" placeholder="请选择类型" clearable>
            <el-option label="入库" value="in"></el-option>
            <el-option label="出库" value="out"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
            @change="handleDateChange">
          </el-date-picker>
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
        :data="inventoryList"
        border
        style="width: 100%">
        <el-table-column type="index" width="50" align="center"></el-table-column>
        <el-table-column prop="record_time" label="记录时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.operation_time)}}
          </template>
        </el-table-column>
        <el-table-column prop="ingredient_name" label="原材料名称" min-width="120"></el-table-column>
        <el-table-column prop="type" label="类型" width="80">
          <template #default="{ row }">
            <el-tag :type="row.operation_type === 1 ? 'success' : 'danger'">
              {{ row.operation_type === 1 ? '入库' : '出库' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量" width="120">
          <template #default="{ row }">
            {{ row.quantity }} {{ row.unit || '单位' }}
          </template>
        </el-table-column>
        <el-table-column prop="employee_name" label="操作员" width="100"></el-table-column>
        <el-table-column prop="notes" label="备注" min-width="150"></el-table-column>
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

    <!-- 入库/出库对话框 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="原材料" prop="ingredient_id">
          <el-select v-model="form.ingredient_id" placeholder="请选择原材料" filterable style="width: 100%;">
            <el-option
              v-for="item in ingredientOptions"
              :key="item.ingredient_id"
              :label="item.ingredient_name"
              :value="item.ingredient_id">
              <span>{{ item.ingredient_name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">
                库存: {{ item.stock_quantity }} {{ item.unit || '单位' }}
              </span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="数量" prop="quantity">
          <el-input-number v-model="form.quantity" :precision="2" :step="1" :min="0.01" style="width: 100%;"></el-input-number>
        </el-form-item>
        <el-form-item label="备注" prop="notes">
          <el-input type="textarea" v-model="form.notes" placeholder="请输入备注"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getInventoryRecords, createInventoryRecord, getAllInventoryRecords } from '@/api/inventory'
import { getAllIngredients } from '@/api/ingredient'

const loading = ref(false)
const inventoryList = ref([])
const total = ref(0)
const queryParams = reactive({
  page: 1,
  limit: 10,
  ingredient_id: '',
  type: '',
  start_date: '',
  end_date: ''
})
const formRef = ref(null)
const dateRange = ref([])

const ingredientOptions = ref([])

const dialogVisible = ref(false)
const dialogTitle = ref('')
const form = reactive({
  ingredient_id: '',
  type: 'in',
  quantity: 1,
  notes: ''
})

const rules = {
  ingredient_id: [{ required: true, message: '请选择原材料', trigger: 'change' }],
  quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }]
}

// const message = useMessage()

onMounted(() => {
  getInventoryList()
  getIngredientOptions()
})

async function getInventoryList() {
  loading.value = true
  try {
    const res = await getAllInventoryRecords(queryParams)
    inventoryList.value = res.data || []
    total.value = res.data.total || 0
    console.log('res',inventoryList.value)
  } catch (error) {
    console.error('获取库存记录失败:', error)
    ElMessage.error('获取库存记录失败')
  } finally {
    loading.value = false
  }
}

async function getIngredientOptions() {
  try {
    const res = await getAllIngredients()
    ingredientOptions.value = res.data || []
  } catch (error) {
    console.error('获取原材料列表失败:', error)
  }
}

function handleDateChange(val) {
  if (val) {
    queryParams.start_date = val[0]
    queryParams.end_date = val[1]
  } else {
    queryParams.start_date = ''
    queryParams.end_date = ''
  }
}

function handleQuery() {
  queryParams.page = 1
  getInventoryList()
}

function resetQuery() {
  dateRange.value = []
  Object.assign(queryParams, {
    page: 1,
    limit: 10,
    ingredient_id: '',
    type: '',
    start_date: '',
    end_date: ''
  })
  getInventoryList()
}

function handleSizeChange(val) {
  queryParams.limit = val
  getInventoryList()
}

function handleCurrentChange(val) {
  queryParams.page = val
  getInventoryList()
}

function handleInStock() {
  dialogTitle.value = '原材料入库'
  Object.assign(form, {
    ingredient_id: '',
    type: 'in',
    quantity: 1,
    notes: ''
  })
  dialogVisible.value = true
}

function handleOutStock() {
  dialogTitle.value = '原材料出库'
  Object.assign(form, {
    ingredient_id: '',
    type: 'out',
    quantity: 1,
    notes: ''
  })
  dialogVisible.value = true
}

function submitForm() {
  console.log('from',form)
  formRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      if (form.type === 'out') {
        const ingredient = ingredientOptions.value.find(item => item.ingredient_id === form.ingredient_id)
        if (ingredient && ingredient.stock_quantity < form.quantity) {
          ElMessage.warning(`库存不足，当前库存: ${ingredient.stock_quantity} ${ingredient.unit || '单位'}`)
          return
        }
      }

      await createInventoryRecord(form)
      ElMessage.success(form.type === 'in' ? '入库成功' : '出库成功')
      dialogVisible.value = false
      getInventoryList()
      getIngredientOptions()
    } catch (error) {
      console.error('保存库存记录失败:', error)
      ElMessage.error('保存库存记录失败')
    }
  })
}

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

</script>

<style scoped>
.inventory-list {
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
