<template>
  <div class="supplier-list">
    <div class="page-header">
      <h2>供应商管理</h2>
      <el-button type="primary" @click="handleAdd">添加供应商</el-button>
    </div>
    
    <!-- <el-card shadow="hover" class="filter-container">
      <el-form :inline="true" :model="queryParams" ref="queryForm">
        <el-form-item label="供应商名称">
          <el-input v-model="queryParams.supplier_name" placeholder="请输入供应商名称" clearable></el-input>
        </el-form-item>
        <el-form-item label="联系人">
          <el-input v-model="queryParams.contact_person" placeholder="请输入联系人" clearable></el-input>
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
        :data="supplierList"
        border
        style="width: 100%">
        <el-table-column type="index" width="50" align="center"></el-table-column>
        <el-table-column prop="supplier_name" label="供应商名称" min-width="120"></el-table-column>
        <el-table-column prop="contact_name" label="联系人" width="100"></el-table-column>
        <el-table-column prop="phone" label="联系电话" width="120"></el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="150"></el-table-column>
        <el-table-column prop="address" label="地址" min-width="200"></el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template #default="{ row }">
            <el-button size="mini" type="primary" @click="handleEdit(row)">编辑</el-button>
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
    
    <!-- 添加/编辑供应商对话框 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="供应商名称" prop="supplier_name">
          <el-input v-model="form.supplier_name" placeholder="请输入供应商名称"></el-input>
        </el-form-item>
        <el-form-item label="联系人" prop="contact_person">
          <el-input v-model="form.contact_name" placeholder="请输入联系人"></el-input>
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入联系电话"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input type="textarea" v-model="form.address" placeholder="请输入地址"></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="notes">
          <el-input type="textarea" v-model="form.notes" placeholder="请输入备注"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier, getAllSuppliers } from '@/api/supplier'

// 状态
const loading = ref(false)
const supplierList = ref([])
const total = ref(0)
const queryParams = reactive({
  page: 1,
  limit: 10,
  supplier_name: '',
  contact_name: ''
})

const dialogVisible = ref(false)
const dialogTitle = ref('')
const form = reactive({
  supplier_name: '',
  contact_name: '',
  phone: '',
  email: '',
  address: '',
  notes: ''
})

const rules = {
  supplier_name: [{ required: true, message: '请输入供应商名称', trigger: 'blur' }],
  contact_name: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }]
}

const formRef = ref(null)

// const message = useMessage()
// const confirm = useConfirm()

onMounted(() => {
  getSupplierList()
})

async function getSupplierList() {
  loading.value = true
  try {
    const res = await getAllSuppliers(queryParams)
    console.log('res',res)
    supplierList.value = res.data || []
    total.value = res.data.total || 0
  } catch (error) {
    console.error('获取供应商列表失败:', error)
    ElMessage.error('获取供应商列表失败')
  } finally {
    loading.value = false
  }
}

function handleQuery() {
  queryParams.page = 1
  getSupplierList()
}

function resetQuery() {
  queryParams.page = 1
  queryParams.limit = 10
  queryParams.supplier_name = ''
  queryParams.contact_name = ''
  getSupplierList()
}

function handleSizeChange(val) {
  queryParams.limit = val
  getSupplierList()
}

function handleCurrentChange(val) {
  queryParams.page = val
  getSupplierList()
}

function handleAdd() {
  dialogTitle.value = '添加供应商'
  Object.assign(form, {
    supplier_name: '',
    contact_name: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  })
  dialogVisible.value = true
}

function handleEdit(row) {
  dialogTitle.value = '编辑供应商'
  Object.assign(form, row)
  dialogVisible.value = true
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm('确认删除该供应商吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteSupplier(row.supplier_id)
    ElMessage.success('删除成功')
    getSupplierList()
  } catch (error) {
    console.error('删除供应商失败:', error)
  }
}

function submitForm() {
  formRef.value.validate(async valid => {
    if (!valid) return
    try {
      if (form.supplier_id) {
        await updateSupplier(form.supplier_id, form)
        ElMessage.success('更新成功')
      } else {
        await createSupplier(form)
        ElMessage.success('添加成功')
      }
      dialogVisible.value = false
      getSupplierList()
    } catch (error) {
      console.error('保存供应商失败:', error)
      ElMessage.error('保存供应商失败')
    }
  })
}
</script>

<style scoped>
.supplier-list {
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
