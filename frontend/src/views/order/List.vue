<template>
  <div class="order-list">
    <div class="page-header">
      <h2>订单管理</h2>
      <el-button type="primary" @click="handleAdd">新建订单</el-button>
    </div>
    
    <!-- <el-card shadow="hover" class="filter-container">
      <el-form :inline="true" :model="queryParams" ref="queryForm">
        <el-form-item label="订单号">
          <el-input v-model="queryParams.order_number" placeholder="请输入订单号" clearable></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
            <el-option label="未结算" :value="0"></el-option>
            <el-option label="已结算" :value="1"></el-option>
            <el-option label="已取消" :value="2"></el-option>
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
        :data="orderList"
        border
        style="width: 100%">
        <el-table-column type="index" width="50" align="center"></el-table-column>
        <el-table-column prop="order_number" label="订单号" width="180"></el-table-column>
        <el-table-column prop="order_time" label="下单时间" width="180">
          <template #default="{ row }">
            {{ row.order_time | formatDateTime }}
          </template>
        </el-table-column>
        <el-table-column prop="total_amount" label="总金额" width="120">
          <template #default="{ row }">
            {{ row.total_amount | formatMoney }} 元
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="member_name" label="会员" width="120"></el-table-column>
        <el-table-column prop="employee_name" label="服务员" width="120"></el-table-column>
        <el-table-column prop="notes" label="备注" min-width="150"></el-table-column>
        <el-table-column label="操作" min-width="250" align="center">
          <template #default="{ row }">
            <el-button size="mini" type="primary" @click="handleView(row)">查看</el-button>
            <el-button 
              size="mini" 
              type="success" 
              v-if="row.status === 0"
              @click="handleSettle(row)">
              结算
            </el-button>
            <el-button 
              size="mini" 
              type="warning" 
              
              @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button 
              size="mini" 
              type="danger" 
              
              @click="handleCancel(row)">
              取消
            </el-button>
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
    
    <!-- 新建/编辑订单对话框 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="800px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="会员" prop="member_id">
              <el-select v-model="form.member_id" placeholder="请选择会员" filterable clearable style="width: 100%;">
                <el-option
                  v-for="item in memberOptions"
                  :key="item.member_id"
                  :label="item.member_name"
                  :value="item.member_id">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="服务员" prop="employee_id">
              <el-select v-model="form.employee_id" placeholder="请选择服务员" filterable style="width: 100%;">
                <el-option
                  v-for="item in employeeOptions"
                  :key="item.employee_id"
                  :label="item.employee_name"
                  :value="item.employee_id">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注" prop="notes">
          <el-input type="textarea" v-model="form.notes" placeholder="请输入备注"></el-input>
        </el-form-item>
        
        <div class="order-items-header">
          <h3>订单明细</h3>
          <el-button type="primary" size="small" @click="showAddItem">添加菜品</el-button>
        </div>
        
        <el-table :data="form.order_items" border style="width: 100%; margin-bottom: 20px;">
          <el-table-column prop="dish_name" label="菜品名称" width="300"></el-table-column>
          <el-table-column prop="price" label="单价" width="100">
            <template #default="{ row }">
              {{ row.price | row.unit_price | formatMoney }} 元
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" min-width="100">
            <template #default="{ row }">
              <el-input-number 
                v-model="row.quantity" 
                :min="1" 
                :max="99"
                size="small"
                @change="calculateTotal">
              </el-input-number>
            </template>
          </el-table-column>
          <el-table-column prop="subtotal" label="小计" width="120">
            <template #default="{ row }">
              {{ (row.price * row.quantity) | row.subtotal | formatMoney }} 元
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80" align="center">
            <template #default="{ $index }">
              <el-button 
                type="danger" 
                icon="el-icon-delete" 
                size="mini" 
                circle
                @click="removeOrderItem($index)">
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <div class="order-total">
          <span>总金额：<strong>{{ form.total_amount | formatMoney }}</strong> 元</span>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">保 存</el-button>
      </template>
    </el-dialog>
    
    <!-- 添加菜品对话框 -->
    <el-dialog title="添加菜品" v-model="itemDialogVisible" width="600px">
      <!-- <el-form :inline="true" :model="itemForm">
        <el-form-item label="菜品类别">
          <el-select v-model="itemForm.category_id" placeholder="请选择类别" @change="handleCategoryChange" clearable>
            <el-option
              v-for="item in categoryOptions"
              :key="item.category_id"
              :label="item.category_name"
              :value="item.category_id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="菜品名称">
          <el-input v-model="itemForm.keyword" placeholder="请输入菜品名称" clearable></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchDishes">搜索</el-button>
        </el-form-item>
      </el-form> -->
      
      <el-table
        v-loading="dishLoading"
        :data="dishOptions"
        border
        height="300"
        style="width: 100%">
        <el-table-column prop="dish_name" label="菜品名称" min-width="150"></el-table-column>
        <el-table-column prop="category_name" label="类别" width="120"></el-table-column>
        <el-table-column prop="price" label="价格" width="100">
          <template #default="{ row }">
            {{ row.price | formatMoney }} 元
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center">
          <template #default="{ row }">
            <el-button type="primary" size="mini" @click="addDishToOrder(row)">添加</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <template #footer>
        <el-button @click="itemDialogVisible = false">关 闭</el-button>
      </template>
    </el-dialog>
    
    <!-- 查看订单详情对话框 -->
    <el-dialog title="订单详情" v-model="viewDialogVisible" width="700px">
      <div v-if="currentOrder" class="order-detail">
        <div class="order-info">
          <p><strong>订单号：</strong>{{ currentOrder.order_number }}</p>
          <p><strong>下单时间：</strong>{{ formatDate(currentOrder.order_time)}}</p>
          <p><strong>状态：</strong>
            <el-tag :type="getStatusType(currentOrder.status)">
              {{ getStatusText(currentOrder.status) }}
            </el-tag>
          </p>
          <p v-if="currentOrder.member_name"><strong>会员：</strong>{{ currentOrder.member_name }}</p>
          <p><strong>服务员：</strong>{{ currentOrder.employee_name }}</p>
          <p v-if="currentOrder.notes"><strong>备注：</strong>{{ currentOrder.notes }}</p>
        </div>
        
        <el-divider></el-divider>
        
        <h4>订单明细</h4>
        <el-table :data="orderDetails" border style="width: 100%">
          <el-table-column prop="dish_name" label="菜品名称" min-width="150"></el-table-column>
          <el-table-column prop="price" label="单价" width="100">
            <template #default="{ row }">
              {{ row.unit_price | formatMoney }} 元
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="80" align="center"></el-table-column>
          <el-table-column prop="subtotal" label="小计" width="120">
            <template #default="{ row }">
              {{ row.subtotal| formatMoney }} 元
            </template>
          </el-table-column>
        </el-table>
        
        <div class="order-summary">
          <p><strong>总金额：</strong>{{ currentOrder.total_amount | formatMoney }} 元</p>
          <p v-if="currentOrder.status === 1"><strong>结算时间：</strong>{{ formatDate(currentOrder.payment_time)  }}</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="viewDialogVisible = false">关 闭</el-button>
      </template>
    </el-dialog>
    
    <!-- 结算订单对话框 -->
    <el-dialog title="订单结算" v-model="settleDialogVisible" width="500px">
      <div v-if="currentOrder" class="settle-form">
        <p><strong>订单号：</strong>{{ currentOrder.order_number }}</p>
        <p><strong>总金额：</strong>{{ currentOrder.total_amount | formatMoney }} 元</p>
        
        <el-form ref="settleFormRef" :model="settleForm" :rules="settleRules" label-width="100px">
          <el-form-item label="支付方式" prop="payment_method">
            <el-select v-model="settleForm.payment_method" placeholder="请选择支付方式" style="width: 100%;">
              <el-option label="现金" value="cash"></el-option>
              <el-option label="微信" value="wechat"></el-option>
              <el-option label="支付宝" value="alipay"></el-option>
              <el-option label="银行卡" value="card"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="实收金额" prop="actual_amount">
            <el-input-number 
              v-model="settleForm.actual_amount" 
              :precision="2" 
              :step="1" 
              :min="0"
              style="width: 100%;">
            </el-input-number>
          </el-form-item>
          <el-form-item label="备注" prop="notes">
            <el-input type="textarea" v-model="settleForm.notes" placeholder="请输入备注"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="settleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitSettle">确认结算</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAllOrders, getOrders, getOrder, createOrder, updateOrder, deleteOrder, settleOrder, cancelOrder, addOrderDetail, deleteOrderDetail, getOrderDetail } from '@/api/order'
import { getAllMembers } from '@/api/member'
import { getAllEmployees } from '@/api/employee'
import { getAllCategories } from '@/api/category'
import { getDishes,getAllDishes,getDish } from '@/api/dish'

const loading = ref(false)
const orderList = ref([])
const total = ref(0)
const queryParams = reactive({
  page: 1,
  limit: 10,
  order_number: '',
  status: '',
  start_date: '',
  end_date: ''
})
const dateRange = ref([])

const memberOptions = ref([])
const employeeOptions = ref([])
const categoryOptions = ref([])
const dishOptions = ref([])

const dialogVisible = ref(false)
const dialogTitle = ref('')
const form = reactive({
  member_id: '',
  employee_id: '',
  notes: '',
  order_items: [],
  total_amount: 0
})

const rules = {
  employee_id: [{ required: true, message: '请选择服务员', trigger: 'change' }]
}

const itemDialogVisible = ref(false)
const dishLoading = ref(false)
const itemForm = reactive({
  category_id: '',
  keyword: ''
})
const formRef = ref(null)
const settleFormRef = ref(null)
const viewDialogVisible = ref(false)
const currentOrder = ref(null)
const orderDetails = ref([])

const settleDialogVisible = ref(false)
const settleForm = reactive({
  payment_method: 'cash',
  actual_amount: 0,
  notes: ''
})
const settleRules = {
  payment_method: [{ required: true, message: '请选择支付方式', trigger: 'change' }],
  actual_amount: [{ required: true, message: '请输入实收金额', trigger: 'blur' }]
}

// const message = useMessage()
// const confirm = useConfirm()

onMounted(() => {
  getOrderList()
  getMemberOptions()
  getEmployeeOptions()
  getCategoryOptions()
})

async function getOrderList() {
  loading.value = true
  try {
    const res = await getAllOrders(queryParams)
    orderList.value = res.data || []
    total.value = res.data.total || 0
  } catch (error) {
    console.error('获取订单列表失败:', error)
    ElMessage.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

async function getMemberOptions() {
  try {
    const res = await getAllMembers()
    memberOptions.value = res.data || []
  } catch (error) {
    console.error('获取会员列表失败:', error)
  }
}

async function getEmployeeOptions() {
  try {
    const res = await getAllEmployees()
    employeeOptions.value = res.data || []
  } catch (error) {
    console.error('获取员工列表失败:', error)
  }
}

async function getCategoryOptions() {
  try {
    const res = await getAllCategories()
    categoryOptions.value = res.data || []
  } catch (error) {
    console.error('获取菜品类别失败:', error)
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
  getOrderList()
}

function resetQuery() {
  dateRange.value = []
  Object.assign(queryParams, {
    page: 1,
    limit: 10,
    order_number: '',
    status: '',
    start_date: '',
    end_date: ''
  })
  getOrderList()
}

function handleSizeChange(val) {
  queryParams.limit = val
  getOrderList()
}

function handleCurrentChange(val) {
  queryParams.page = val
  getOrderList()
}

function getStatusText(status) {
  switch (status) {
    case 0: return '未结算'
    case 1: return '已结算'
    case 2: return '已取消'
    default: return '未知'
  }
}

function getStatusType(status) {
  switch (status) {
    case 0: return 'warning'
    case 1: return 'success'
    case 2: return 'info'
    default: return ''
  }
}

function handleAdd() {
  dialogTitle.value = '新建订单'
  Object.assign(form, {
    member_id: '',
    employee_id: '',
    notes: '',
    order_items: [],
    total_amount: 0,
    order_id:'',
  })
  dialogVisible.value = true
}

async function handleEdit(row) {
  dialogTitle.value = '编辑订单'
  try {
    const res = await getOrder(row.order_id)
    const orderData = res.data || {}
    const dish_content = [];
    let dish_res = await getOrderDetail(row.order_id)
    dish_content.push(...dish_res.data)
    console.log('resorder',orderData,dish_content)
    
    Object.assign(form, {
      order_id: orderData.order_id,
      member_id: orderData.member_id || '',
      employee_id: orderData.employee_id,
      notes: orderData.notes || '',
      order_items: dish_content || [],
      total_amount: orderData.total_amount || 0
    })
    
    dialogVisible.value = true
  } catch (error) {
    console.error('获取订单详情失败:', error)
    ElMessage.error('获取订单详情失败')
  }
}

async function handleView(row) {
  try {
    const res = await getOrder(row.order_id)
    currentOrder.value = res.data || {}
    let dish_res = await getOrderDetail(row.order_id)
    orderDetails.value = dish_res.data;
    viewDialogVisible.value = true
  } catch (error) {
    console.error('获取订单详情失败:', error)
    ElMessage.error('获取订单详情失败')
  }
}

async function handleSettle(row) {
  currentOrder.value = row
  Object.assign(settleForm, {
    payment_method: 'cash',
    actual_amount: row.total_amount,
    notes: ''
  })
  settleDialogVisible.value = true
}

async function handleCancel(row) {
  try {
    await ElMessageBox.confirm('确认取消该订单吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await cancelOrder(row.order_id)
    ElMessage.success('订单已取消')
    getOrderList()
  } catch (error) {
    console.error('取消订单失败:', error)
  }
}

function showAddItem() {
  Object.assign(itemForm, {
    category_id: '',
    keyword: ''
  })
  dishOptions.value = []
  itemDialogVisible.value = true
  searchDishes()
}

function handleCategoryChange() {
  searchDishes()
}

async function searchDishes() {
  dishLoading.value = true
  try {
    const params = {
      category_id: itemForm.category_id,
      dish_name: itemForm.keyword,
      status: 1, // 只查询上架的菜品
      limit: 100
    }
    
    const res = await getAllDishes()
    dishOptions.value = res.data || []
  } catch (error) {
    console.error('搜索菜品失败:', error)
  } finally {
    dishLoading.value = false
  }
}

function addDishToOrder(dish) {
  // 检查是否已存在该菜品
  const existingIndex = form.order_items.findIndex(item => item.dish_id === dish.dish_id)
  
  if (existingIndex >= 0) {
    // 已存在，数量+1
    form.order_items[existingIndex].quantity += 1
  } else {
    // 不存在，添加新项
    form.order_items.push({
      dish_id: dish.dish_id,
      dish_name: dish.dish_name,
      price: dish.price,
      quantity: 1
    })
  }
  
  calculateTotal()
  ElMessage.success(`已添加 ${dish.dish_name}`)
}

function removeOrderItem(index) {
  form.order_items.splice(index, 1)
  calculateTotal()
}

function calculateTotal() {
  form.total_amount = form.order_items.reduce((sum, item) => {
    return sum + ((item.price | item.unit_price) * item.quantity)
  }, 0)
}

function submitForm() {
  if (form.order_items.length === 0) {
    ElMessage.warning('请至少添加一个菜品')
    return
  }
  console.log('resorder',form)
  formRef.value.validate(async (valid) => {
    if (!valid) return
    
    try {
      if (form.order_id) {
        // 更新订单
        await updateOrder(form.order_id, form)
        ElMessage.success('更新成功')
      } else {
        // 新建订单
        await createOrder(form)
        ElMessage.success('创建成功')
      }
      
      dialogVisible.value = false
      getOrderList()
    } catch (error) {
      console.error('保存订单失败:', error)
      ElMessage.error('保存订单失败')
    }
  })
}

function submitSettle() {
  settleFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    try {
      await settleOrder(currentOrder.value.order_id, settleForm)
      ElMessage.success('结算成功')
      settleDialogVisible.value = false
      getOrderList()
    } catch (error) {
      console.error('结算订单失败:', error)
      ElMessage.error('结算订单失败')
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
.order-list {
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

.order-items-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0 10px;
}

.order-total {
  text-align: right;
  margin-top: 10px;
  font-size: 16px;
}

.order-detail {
  padding: 0 20px;
}

.order-info p {
  margin: 8px 0;
}

.order-summary {
  margin-top: 20px;
  text-align: right;
}

.order-summary p {
  margin: 8px 0;
  font-size: 16px;
}
</style>
