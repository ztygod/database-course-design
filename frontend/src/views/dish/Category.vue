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
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center">
          <template #default="{ row }">
            <el-button size="mini" type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.page"
        v-model:limit="queryParams.limit"
        @pagination="getCategoryList"
      />
    </el-card>

    <!-- 添加/编辑类别对话框 -->
    <el-dialog :title="dialogTitle" v-model:visible="dialogVisible" width="500px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="类别名称" prop="category_name">
          <el-input v-model="form.category_name" placeholder="请输入类别名称"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入类别描述"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import moment from 'moment'
// import Pagination from '@/components/common/Pagination.vue'
// import { getCategories, createCategory, updateCategory, deleteCategory } from '@/api/category'

const loading = ref(false)
const categoryList = ref<any[]>([])
const total = ref(0)
const queryParams = reactive({
  page: 1,
  limit: 10
})

const dialogVisible = ref(false)
const dialogTitle = ref('')
const form = reactive({
  category_id: undefined as number | undefined,
  category_name: '',
  description: ''
})

const rules = {
  category_name: [{ required: true, message: '请输入类别名称', trigger: 'blur' }]
}

const formRef = ref()

async function getCategoryList() {
  loading.value = true
  try {
    // const res = await getCategories(queryParams)
    // 模拟接口返回数据结构
    const res = {
      data: {
        items: [
          { category_id: 1, category_name: '蔬菜', description: '新鲜蔬菜', created_at: '2023-01-01 12:00:00' },
          { category_id: 2, category_name: '水果', description: '各种水果', created_at: '2023-01-05 12:00:00' }
        ],
        total: 2
      }
    }
    categoryList.value = res.data.items || []
    total.value = res.data.total || 0
  } catch (error) {
    console.error('获取类别列表失败:', error)
    // this.$message.error('获取类别列表失败') // 组件内 this 不适用，改用全局消息或外部注入
  } finally {
    loading.value = false
  }
}

function formatDate(date: string) {
  return moment(date).format('YYYY-MM-DD HH:mm:ss')
}

function handleAdd() {
  dialogTitle.value = '添加类别'
  form.category_id = undefined
  form.category_name = ''
  form.description = ''
  dialogVisible.value = true
}

function handleEdit(row: any) {
  dialogTitle.value = '编辑类别'
  form.category_id = row.category_id
  form.category_name = row.category_name
  form.description = row.description
  dialogVisible.value = true
}

async function handleDelete(row: any) {
  try {
    // await ElMessageBox.confirm('确认删除该类别吗？删除后关联的菜品将无法显示', '警告', {
    //   confirmButtonText: '确定',
    //   cancelButtonText: '取消',
    //   type: 'warning'
    // })
    const confirm = window.confirm('确认删除该类别吗？删除后关联的菜品将无法显示')
    if (!confirm) return

    // await deleteCategory(row.category_id)
    console.log('删除类别id:', row.category_id)
    // ElMessage.success('删除成功')
    getCategoryList()
  } catch (error) {
    console.error('删除类别失败:', error)
  }
}

function submitForm() {
  // @ts-ignore
  formRef.value.validate(async (valid: boolean) => {
    if (!valid) return

    try {
      if (form.category_id) {
        // await updateCategory(form.category_id, form)
        console.log('更新类别', form)
        // ElMessage.success('更新成功')
      } else {
        // await createCategory(form)
        console.log('添加类别', form)
        // ElMessage.success('添加成功')
      }
      dialogVisible.value = false
      getCategoryList()
    } catch (error) {
      console.error('保存类别失败:', error)
      // ElMessage.error('保存类别失败')
    }
  })
}

onMounted(() => {
  getCategoryList()
})
</script>

<style scoped lang="scss">
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
