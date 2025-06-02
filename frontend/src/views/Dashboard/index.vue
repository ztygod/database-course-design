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
          <div slot="header">
            <span>销售趋势</span>
          </div>
          <div id="salesChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <div slot="header">
            <span>热销菜品</span>
          </div>
          <el-table :data="hotDishes" style="width: 100%" height="300">
            <el-table-column prop="dish_name" label="菜品名称"></el-table-column>
            <el-table-column prop="total_quantity" label="销售数量"></el-table-column>
            <el-table-column prop="total_amount" label="销售金额">
              <template slot-scope="scope">
                {{ scope.row.total_amount | formatMoney }} 元
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card shadow="hover">
          <div slot="header">
            <span>库存预警</span>
          </div>
          <el-table :data="warningIngredients" style="width: 100%" height="250">
            <el-table-column prop="ingredient_name" label="原材料名称"></el-table-column>
            <el-table-column prop="supplier_name" label="供应商"></el-table-column>
            <el-table-column prop="stock_quantity" label="当前库存">
              <template slot-scope="scope">
                {{ scope.row.stock_quantity }} {{ scope.row.unit || '单位' }}
              </template>
            </el-table-column>
            <el-table-column prop="cost_price" label="成本价">
              <template slot-scope="scope">
                {{ scope.row.cost_price | formatMoney }} 元
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template slot-scope="scope">
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
import { getDashboardData } from '../../api/statistics';
import { getWarningIngredients } from '../../api/ingredient';

export default {
  name: 'Dashboard',
  data() {
    return {
      dashboardData: {},
      hotDishes: [],
      warningIngredients: [],
      loading: false
    }
  },
  computed: {
    statCards() {
      return [
        {
          title: '今日订单',
          value: this.dashboardData.today_orders || 0,
          icon: 'el-icon-s-order',
          color: '#409EFF'
        },
        {
          title: '今日销售额',
          value: `${(this.dashboardData.today_sales || 0).toFixed(2)} 元`,
          icon: 'el-icon-money',
          color: '#67C23A'
        },
        {
          title: '会员总数',
          value: this.dashboardData.member_count || 0,
          icon: 'el-icon-user',
          color: '#E6A23C'
        },
        {
          title: '库存预警',
          value: this.dashboardData.warning_count || 0,
          icon: 'el-icon-warning',
          color: '#F56C6C'
        }
      ]
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      this.loading = true;
      try {
        // 获取仪表盘数据
        const dashboardRes = await getDashboardData();
        this.dashboardData = dashboardRes.data || {};
        this.hotDishes = this.dashboardData.hot_dishes || [];
        
        // 获取库存预警数据
        const warningRes = await getWarningIngredients();
        this.warningIngredients = warningRes.data || [];
      } catch (error) {
        console.error('获取仪表盘数据失败:', error);
        this.$message.error('获取仪表盘数据失败');
      } finally {
        this.loading = false;
      }
    },
    handleInventoryIn(row) {
      this.$router.push('/inventory');
    }
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
