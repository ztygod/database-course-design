<template>
  <div class="dashboard">
    <h2>餐饮经营管理系统</h2>
    
    <el-row :gutter="20">
      <el-col :span="6" v-for="(item, index) in statCards" :key="index">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" :style="{backgroundColor: item.color}">
              <i :class="item.icon"></i>
            </div>
            <div class="stat-info">
              <div class="stat-title">{{ item.title }}</div>
              <div class="stat-value">{{ item.value }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span>销售趋势</span>
          </template>
          <div id="salesChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span>热销菜品</span>
          </template>
          <el-table :data="hotDishes" style="width: 100%" height="300">
            <el-table-column prop="dish_name" label="菜品名称"></el-table-column>
            <el-table-column prop="total_quantity" label="销售数量"></el-table-column>
            <el-table-column prop="total_amount" label="销售金额">
              <template #default="scope">
                {{ formatMoney(scope.row.total_amount) }} 元
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <span>库存预警</span>
          </template>
          <el-table :data="warningIngredients" style="width: 100%" height="250">
            <el-table-column prop="ingredient_name" label="原材料名称"></el-table-column>
            <el-table-column prop="supplier_name" label="供应商"></el-table-column>
            <el-table-column prop="stock_quantity" label="当前库存">
              <template #default="scope">
                {{ scope.row.stock_quantity }} {{ scope.row.unit || '单位' }}
              </template>
            </el-table-column>
            <el-table-column prop="cost_price" label="成本价">
              <template #default="scope">
                {{ formatMoney(scope.row.cost_price) }} 元
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="scope">
                <el-button size="mini" type="primary" @click="handleInventoryIn(scope.row)">入库</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getDashboardData } from '../../api/statistics';
import { getWarningIngredients } from '../../api/ingredient';

export default {
  name: 'Dashboard',
  setup() {
    const router = useRouter();
    const dashboardData = ref({});
    const hotDishes = ref([]);
    const warningIngredients = ref([]);
    const loading = ref(false);

    const statCards = computed(() => [
      {
        title: '今日订单',
        value: dashboardData.value.today_orders || 0,
        icon: 'el-icon-s-order',
        color: '#409EFF'
      },
      {
        title: '今日销售额',
        value: `${(dashboardData.value.today_sales || 0).toFixed(2)} 元`,
        icon: 'el-icon-money',
        color: '#67C23A'
      },
      {
        title: '会员总数',
        value: dashboardData.value.member_count || 0,
        icon: 'el-icon-user',
        color: '#E6A23C'
      },
      {
        title: '库存预警',
        value: dashboardData.value.warning_count || 0,
        icon: 'el-icon-warning',
        color: '#F56C6C'
      }
    ]);

    const fetchData = async () => {
      loading.value = true;
      try {
        const dashboardRes = await getDashboardData();
        dashboardData.value = dashboardRes.data || {};
        hotDishes.value = dashboardData.value.hot_dishes || [];

        const warningRes = await getWarningIngredients();
        warningIngredients.value = warningRes.data || [];
      } catch (error) {
        console.error('获取仪表盘数据失败:', error);
        // this.$message.error('获取仪表盘数据失败');
      } finally {
        loading.value = false;
      }
    };

    const handleInventoryIn = (row) => {
      router.push('/inventory');
    };

    const formatMoney = (value) => {
      return value.toFixed(2);
    };

    onMounted(() => {
      fetchData();
    });

    return {
      statCards,
      hotDishes,
      warningIngredients,
      handleInventoryIn,
      formatMoney
    };
  }
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.stat-card {
  margin-bottom: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 15px;
}

.stat-icon i {
  font-size: 24px;
  color: #fff;
}

.stat-title {
  font-size: 14px;
  color: #909399;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  margin-top: 5px;
}
</style>
