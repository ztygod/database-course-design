<template>
  <div class="statistics">
    <div class="page-header">
      <h2>统计分析</h2>
    </div>

    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <template #header>
            <div class="clearfix">
              <span>今日营业额</span>
            </div>
          </template>
          <div class="card-body">
            <h3>{{ todaySales | formatMoney }} 元</h3>
            <div class="trend">
              <span :class="todayTrend >= 0 ? 'up' : 'down'">
                {{ Math.abs(todayTrend) }}%
                <i :class="todayTrend >= 0 ? 'el-icon-top' : 'el-icon-bottom'"></i>
              </span>
              <span class="trend-text">较昨日</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <template #header>
            <div class="clearfix">
              <span>本月营业额</span>
            </div>
          </template>
          <div class="card-body">
            <h3>{{ monthSales | formatMoney }} 元</h3>
            <div class="trend">
              <span :class="monthTrend >= 0 ? 'up' : 'down'">
                {{ Math.abs(monthTrend) }}%
                <i :class="monthTrend >= 0 ? 'el-icon-top' : 'el-icon-bottom'"></i>
              </span>
              <span class="trend-text">较上月</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <template #header>
            <div class="clearfix">
              <span>今日订单数</span>
            </div>
          </template>
          <div class="card-body">
            <h3>{{ todayOrders }} 单</h3>
            <div class="trend">
              <span :class="orderTrend >= 0 ? 'up' : 'down'">
                {{ Math.abs(orderTrend) }}%
                <i :class="orderTrend >= 0 ? 'el-icon-top' : 'el-icon-bottom'"></i>
              </span>
              <span class="trend-text">较昨日</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <template #header>
            <div class="clearfix">
              <span>会员总数</span>
            </div>
          </template>
          <div class="card-body">
            <h3>{{ memberCount }} 人</h3>
            <div class="trend">
              <span class="up">
                {{ newMembers }} 人
                <i class="el-icon-top"></i>
              </span>
              <span class="trend-text">本月新增</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="clearfix">
              <span>销售趋势</span>
              <el-radio-group v-model="salesTimeRange" size="mini" style="float: right;">
                <el-radio-button label="week">近7天</el-radio-button>
                <el-radio-button label="month">近30天</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-container">
            <div ref="salesChart" style="width: 100%; height: 300px;"></div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="clearfix">
              <span>菜品类别销售占比</span>
            </div>
          </template>
          <div class="chart-container">
            <div ref="categoryChart" style="width: 100%; height: 300px;"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <div class="clearfix">
              <span>热销菜品排行</span>
            </div>
          </template>
          <el-table
            :data="hotDishes"
            border
            style="width: 100%">
            <el-table-column type="index" width="50" align="center" label="排名"></el-table-column>
            <el-table-column prop="dish_name" label="菜品名称" min-width="150"></el-table-column>
            <el-table-column prop="category_name" label="所属类别" width="120"></el-table-column>
            <el-table-column prop="price" label="单价" width="100">
              <template #default="{ row }">
                {{ row.price | formatMoney }} 元
              </template>
            </el-table-column>
            <el-table-column prop="sales_count" label="销售数量" width="100" align="center"></el-table-column>
            <el-table-column prop="sales_amount" label="销售金额" width="120">
              <template #default="{ row }">
                {{ row.sales_amount | formatMoney }} 元
              </template>
            </el-table-column>
            <el-table-column label="销售占比" width="180">
              <template #default="{ row }">
                <el-progress :percentage="row.percentage" :color="getColorByPercentage(row.percentage)"></el-progress>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="clearfix">
              <span>库存预警</span>
            </div>
          </template>
          <el-table
            :data="lowStockIngredients"
            border
            style="width: 100%">
            <el-table-column type="index" width="50" align="center"></el-table-column>
            <el-table-column prop="ingredient_name" label="原材料名称" min-width="120"></el-table-column>
            <el-table-column prop="stock_quantity" label="当前库存" width="100">
              <template #default="{ row }">
                {{ row.stock_quantity }} {{ row.unit || '单位' }}
              </template>
            </el-table-column>
            <el-table-column prop="warning_quantity" label="预警数量" width="100">
              <template #default="{ row }">
                {{ row.warning_quantity }} {{ row.unit || '单位' }}
              </template>
            </el-table-column>
            <el-table-column label="库存状态" width="120">
              <template #default="{ row }">
                <el-tag type="danger" v-if="row.stock_quantity === 0">无库存</el-tag>
                <el-tag type="warning" v-else>库存不足</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" align="center">
              <template #default="{ row }">
                <el-button size="mini" type="primary" @click="handleStockIn(row)">入库</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="clearfix">
              <span>会员等级分布</span>
            </div>
          </template>
          <div class="chart-container">
            <div ref="memberChart" style="width: 100%; height: 300px;"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 入库对话框 -->
    <el-dialog title="原材料入库" v-model:visible="stockDialogVisible" width="400px">
      <el-form ref="stockForm" :model="stockForm" :rules="stockRules" label-width="100px">
        <el-form-item label="原材料">
          <span>{{ currentIngredient.ingredient_name }}</span>
        </el-form-item>
        <el-form-item label="当前库存">
          <span>{{ currentIngredient.stock_quantity }} {{ currentIngredient.unit || '单位' }}</span>
        </el-form-item>
        <el-form-item label="入库数量" prop="quantity">
          <el-input-number v-model="stockForm.quantity" :precision="2" :step="1" :min="0.01" style="width: 100%;"></el-input-number>
        </el-form-item>
        <el-form-item label="备注" prop="notes">
          <el-input type="textarea" v-model="stockForm.notes" placeholder="请输入备注"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="stockDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitStockIn">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { getSalesStatistics, getSalesTrend, getDashboardData, getHotDishes, getInventoryStatistics, getMemberStatistics } from '@/api/statistics'
import { createInventoryRecord } from '@/api/inventory'

// 概览数据
const todaySales = ref(0)
const todayTrend = ref(0)
const monthSales = ref(0)
const monthTrend = ref(0)
const todayOrders = ref(0)
const orderTrend = ref(0)
const memberCount = ref(0)
const newMembers = ref(0)

// 图表数据
const salesTimeRange = ref('week')
const salesChart = ref(null)
const categoryChart = ref(null)
const memberChart = ref(null)

// 热销菜品
const hotDishes = ref([])

// 库存预警
const lowStockIngredients = ref([])

// 入库对话框
const stockDialogVisible = ref(false)
const currentIngredient = ref({})
const stockForm = reactive({
  quantity: 1,
  notes: ''
})
const stockRules = {
  quantity: [{ required: true, message: '请输入入库数量', trigger: 'blur' }]
}

// const message = useMessage()

onMounted(() => {
  fetchStatisticsData()
  initCharts()
})

// 监控销售时间范围变化
watch(salesTimeRange, () => {
  fetchSalesTrend()
})

async function fetchStatisticsData() {
  try {
    // 获取概览数据
    const statsRes = await getSalesStatistics()
    const statsData = statsRes.data || {}

    todaySales.value = statsData.today_sales || 0
    todayTrend.value = statsData.today_trend || 0
    monthSales.value = statsData.month_sales || 0
    monthTrend.value = statsData.month_trend || 0
    todayOrders.value = statsData.today_orders || 0
    orderTrend.value = statsData.order_trend || 0
    memberCount.value = statsData.member_count || 0
    newMembers.value = statsData.new_members || 0

    // 获取热销菜品
    const hotDishesRes = await getHotDishes()
    hotDishes.value = hotDishesRes.data || []

    // 计算百分比
    const totalSales = hotDishes.value.reduce((sum, dish) => sum + dish.sales_amount, 0)
    hotDishes.value.forEach(dish => {
      dish.percentage = totalSales > 0 ? Math.round((dish.sales_amount / totalSales) * 100) : 0
    })

    // 获取库存预警
    const lowStockRes = await getInventoryStatistics()
    lowStockIngredients.value = lowStockRes.data || []

    // 获取图表数据
    fetchSalesTrend()
    fetchCategorySales()
    fetchMemberDistribution()
  } catch (error) {
    console.error('获取统计数据失败:', error)
    ElMessage.error('获取统计数据失败')
  }
}

async function fetchSalesTrend() {
  try {
    const res = await getSalesTrend({ time_range: salesTimeRange.value })
    const data = res.data || []

    const xAxisData = data.map(item => item.date)
    const seriesData = data.map(item => item.sales)

    updateSalesChart(xAxisData, seriesData)
  } catch (error) {
    console.error('获取销售趋势数据失败:', error)
  }
}

async function fetchCategorySales() {
  try {
    const res = await getDashboardData()
    const data = res.data || []

    updateCategoryChart(data)
  } catch (error) {
    console.error('获取类别销售数据失败:', error)
  }
}

async function fetchMemberDistribution() {
  try {
    const res = await getMemberStatistics()
    const data = res.data || []

    updateMemberChart(data)
  } catch (error) {
    console.error('获取会员分布数据失败:', error)
  }
}

function initCharts() {
  // 初始化销售趋势图表
  salesChart.value = echarts.init(document.querySelector('[ref="salesChart"]'))

  // 初始化类别销售占比图表
  categoryChart.value = echarts.init(document.querySelector('[ref="categoryChart"]'))

  // 初始化会员等级分布图表
  memberChart.value = echarts.init(document.querySelector('[ref="memberChart"]'))

  // 监听窗口大小变化，调整图表大小
  window.addEventListener('resize', () => {
    salesChart.value && salesChart.value.resize()
    categoryChart.value && categoryChart.value.resize()
    memberChart.value && memberChart.value.resize()
  })
}

function updateSalesChart(xAxisData, seriesData) {
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br />{a}: {c} 元'
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisLine: {
        lineStyle: {
          color: '#999'
        }
      },
      axisLabel: {
        color: '#666'
      }
    },
    yAxis: {
      type: 'value',
      name: '销售额(元)',
      axisLine: {
        show: false
      },
      axisLabel: {
        color: '#666'
      },
      splitLine: {
        lineStyle: {
          type: 'dashed',
          color: '#eee'
        }
      }
    },
    series: [{
      name: '销售额',
      type: 'line',
      data: seriesData,
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      itemStyle: {
        color: '#409EFF'
      },
      lineStyle: {
        width: 3
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0,
            color: 'rgba(64, 158, 255, 0.3)'
          }, {
            offset: 1,
            color: 'rgba(64, 158, 255, 0.1)'
          }]
        }
      }
    }]
  }

  salesChart.value.setOption(option)
}

function updateCategoryChart(data) {
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      data: data.map(item => item.category_name)
    },
    series: [{
      name: '类别销售',
      type: 'pie',
      radius: ['50%', '70%'],
      center: ['40%', '50%'],
      avoidLabelOverlap: false,
      label: {
        show: false
      },
      emphasis: {
        label: {
          show: true,
          fontSize: '14',
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: data.map(item => ({
        name: item.category_name,
        value: item.sales_amount
      }))
    }]
  }

  categoryChart.value.setOption(option)
}

function updateMemberChart(data) {
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      data: data.map(item => item.level_name)
    },
    series: [{
      name: '会员等级',
      type: 'pie',
      radius: '70%',
      center: ['40%', '50%'],
      data: data.map(item => ({
        name: item.level_name,
        value: item.count
      })),
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  }

  memberChart.value.setOption(option)
}

function getColorByPercentage(percentage) {
  if (percentage >= 60) {
    return '#67C23A'
  } else if (percentage >= 30) {
    return '#409EFF'
  } else {
    return '#E6A23C'
  }
}

function handleStockIn(row) {
  currentIngredient.value = row
  stockForm.quantity = 1
  stockForm.notes = `补充库存至安全水平，当前库存${row.stock_quantity}${row.unit || '单位'}，预警数量${row.warning_quantity}${row.unit || '单位'}`
  stockDialogVisible.value = true
}

async function submitStockIn() {
  const formRef = ref(null)
  formRef.value.validate(async valid => {
    if (!valid) return

    try {
      await createInventoryRecord({
        ingredient_id: currentIngredient.value.ingredient_id,
        type: 'in',
        quantity: stockForm.quantity,
        notes: stockForm.notes
      })

      ElMessage.success('入库成功')
      stockDialogVisible.value = false

      // 刷新库存预警数据
      const lowStockRes = await getInventoryStatistics()
      lowStockIngredients.value = lowStockRes.data || []
    } catch (error) {
      console.error('入库失败:', error)
      ElMessage.error('入库失败')
    }
  })
}
</script>

<style scoped>
.statistics {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.data-card {
  height: 120px;
}

.card-body {
  text-align: center;
}

.card-body h3 {
  font-size: 24px;
  margin: 10px 0;
}

.trend {
  font-size: 14px;
}

.trend .up {
  color: #67C23A;
}

.trend .down {
  color: #F56C6C;
}

.trend-text {
  color: #909399;
  margin-left: 5px;
}

.chart-card {
  margin-bottom: 20px;
}

.chart-container {
  padding: 10px 0;
}
</style>
