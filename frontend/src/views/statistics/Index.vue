<template>
  <div class="statistics-container">
    <div class="page-header">
      <h2>销售统计分析</h2>
    </div>
    
    <el-card shadow="hover" class="filter-container">
      <el-form :inline="true" :model="queryParams" ref="queryForm" size="small">
        <el-form-item label="统计周期" prop="period">
          <el-select v-model="queryParams.period" placeholder="请选择统计周期" @change="handlePeriodChange">
            <el-option label="今日" value="today"></el-option>
            <el-option label="本周" value="week"></el-option>
            <el-option label="本月" value="month"></el-option>
            <el-option label="本季度" value="quarter"></el-option>
            <el-option label="本年" value="year"></el-option>
            <el-option label="自定义" value="custom"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="日期范围" prop="date_range" v-if="queryParams.period === 'custom'">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
            @change="handleDateRangeChange">
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleQuery">查询</el-button>
          <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 销售概览卡片 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="6" v-for="(item, index) in statCards" :key="index">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-card-content">
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
    
    <!-- 销售趋势图表 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card shadow="hover">
          <div slot="header" class="clearfix">
            <span>销售趋势</span>
            <el-radio-group v-model="trendType" size="small" style="float: right;">
              <el-radio-button label="amount">销售额</el-radio-button>
              <el-radio-button label="count">订单数</el-radio-button>
            </el-radio-group>
          </div>
          <div ref="salesTrendChart" style="height: 400px;"></div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 热销菜品和销售分布 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card shadow="hover">
          <div slot="header" class="clearfix">
            <span>热销菜品TOP10</span>
          </div>
          <div ref="hotDishesChart" style="height: 400px;"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <div slot="header" class="clearfix">
            <span>菜品类别销售分布</span>
          </div>
          <div ref="categoryDistributionChart" style="height: 400px;"></div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 会员消费分析 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card shadow="hover">
          <div slot="header" class="clearfix">
            <span>会员消费分析</span>
          </div>
          <el-table
            v-loading="memberLoading"
            :data="memberConsumptionList"
            border
            style="width: 100%">
            <el-table-column type="index" width="50" align="center"></el-table-column>
            <el-table-column prop="member_name" label="会员姓名" min-width="100"></el-table-column>
            <el-table-column prop="card_number" label="会员卡号" min-width="120"></el-table-column>
            <el-table-column prop="level_name" label="会员等级" width="100">
              <template slot-scope="scope">
                <el-tag :type="getLevelType(scope.row.level)">
                  {{ scope.row.level_name }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="order_count" label="消费次数" width="100" align="center"></el-table-column>
            <el-table-column prop="total_amount" label="消费总额" min-width="120">
              <template slot-scope="scope">
                {{ scope.row.total_amount.toFixed(2) }} 元
              </template>
            </el-table-column>
            <el-table-column prop="average_amount" label="平均消费" min-width="120">
              <template slot-scope="scope">
                {{ scope.row.average_amount.toFixed(2) }} 元
              </template>
            </el-table-column>
            <el-table-column prop="last_consumption" label="最近消费" min-width="160">
              <template slot-scope="scope">
                {{ formatDateTime(scope.row.last_consumption) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { getSalesStatistics, getMemberStatistics, getHotDishes, getSalesTrend } from '@/api/statistics';
import moment from 'moment';

@Component
export default class StatisticsIndex extends Vue {
  private loading = false;
  private memberLoading = false;
  private queryParams = {
    period: 'month',
    start_date: '',
    end_date: ''
  };
  
  private dateRange: string[] = [];
  private trendType = 'amount';
  
  // 统计数据
  private salesData: any = {};
  private memberConsumptionList: any[] = [];
  private hotDishesList: any[] = [];
  private categoryDistribution: any[] = [];
  private salesTrend: any[] = [];
  
  // 图表实例
  private salesTrendChart: any = null;
  private hotDishesChart: any = null;
  private categoryDistributionChart: any = null;
  
  get statCards() {
    return [
      {
        title: '总销售额',
        value: `${(this.salesData.total_amount || 0).toFixed(2)} 元`,
        icon: 'el-icon-money',
        color: '#409EFF'
      },
      {
        title: '总订单数',
        value: this.salesData.order_count || 0,
        icon: 'el-icon-s-order',
        color: '#67C23A'
      },
      {
        title: '客单价',
        value: `${(this.salesData.average_amount || 0).toFixed(2)} 元`,
        icon: 'el-icon-shopping-cart-full',
        color: '#E6A23C'
      },
      {
        title: '会员消费占比',
        value: `${(this.salesData.member_percentage || 0).toFixed(2)}%`,
        icon: 'el-icon-user',
        color: '#F56C6C'
      }
    ];
  }
  
  created() {
    this.initDateRange();
    this.fetchAllStatistics();
  }
  
  @Watch('trendType')
  onTrendTypeChange() {
    this.renderSalesTrendChart();
  }
  
  private initDateRange() {
    const now = moment();
    switch (this.queryParams.period) {
      case 'today':
        this.queryParams.start_date = now.format('YYYY-MM-DD');
        this.queryParams.end_date = now.format('YYYY-MM-DD');
        break;
      case 'week':
        this.queryParams.start_date = now.startOf('week').format('YYYY-MM-DD');
        this.queryParams.end_date = now.endOf('week').format('YYYY-MM-DD');
        break;
      case 'month':
        this.queryParams.start_date = now.startOf('month').format('YYYY-MM-DD');
        this.queryParams.end_date = now.endOf('month').format('YYYY-MM-DD');
        break;
      case 'quarter':
        this.queryParams.start_date = now.startOf('quarter').format('YYYY-MM-DD');
        this.queryParams.end_date = now.endOf('quarter').format('YYYY-MM-DD');
        break;
      case 'year':
        this.queryParams.start_date = now.startOf('year').format('YYYY-MM-DD');
        this.queryParams.end_date = now.endOf('year').format('YYYY-MM-DD');
        break;
    }
    
    if (this.queryParams.period === 'custom') {
      this.dateRange = [this.queryParams.start_date, this.queryParams.end_date];
    }
  }
  
  private handlePeriodChange(val: string) {
    if (val !== 'custom') {
      this.initDateRange();
    }
  }
  
  private handleDateRangeChange(val: string[]) {
    if (val) {
      this.queryParams.start_date = val[0];
      this.queryParams.end_date = val[1];
    } else {
      this.queryParams.start_date = '';
      this.queryParams.end_date = '';
    }
  }
  
  private handleQuery() {
    this.fetchAllStatistics();
  }
  
  private resetQuery() {
    this.queryParams.period = 'month';
    this.dateRange = [];
    this.initDateRange();
    this.fetchAllStatistics();
  }
  
  private async fetchAllStatistics() {
    this.loading = true;
    try {
      // 获取销售统计数据
      const salesRes = await getSalesStatistics({
        start_date: this.queryParams.start_date,
        end_date: this.queryParams.end_date
      });
      this.salesData = salesRes.data || {};
      
      // 获取热销菜品数据
      const hotDishesRes = await getHotDishes({
        start_date: this.queryParams.start_date,
        end_date: this.queryParams.end_date,
        limit: 10
      });
      this.hotDishesList = hotDishesRes.data || [];
      
      // 获取销售趋势数据
      const trendRes = await getSalesTrend({
        startDate: this.queryParams.start_date,
        endDate: this.queryParams.end_date
      });
      this.salesTrend = trendRes.data || [];
      
      // 获取会员消费数据
      this.memberLoading = true;
      const memberRes = await getMemberStatistics();
      this.memberConsumptionList = memberRes.data || [];
      this.memberLoading = false;
      
      // 处理菜品类别分布数据
      this.processCategoryDistribution();
      
      // 渲染图表
      this.$nextTick(() => {
        this.renderSalesTrendChart();
        this.renderHotDishesChart();
        this.renderCategoryDistributionChart();
      });
    } catch (error) {
      console.error('获取统计数据失败:', error);
      this.$message.error('获取统计数据失败');
    } finally {
      this.loading = false;
    }
  }
  
  private processCategoryDistribution() {
    // 按类别分组统计销售额
    const categoryMap = new Map();
    
    this.hotDishesList.forEach(dish => {
      const categoryName = dish.category_name || '未分类';
      const amount = dish.total_amount || 0;
      
      if (categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, categoryMap.get(categoryName) + amount);
      } else {
        categoryMap.set(categoryName, amount);
      }
    });
    
    this.categoryDistribution = Array.from(categoryMap).map(([name, value]) => ({
      name,
      value
    }));
  }
  
  private renderSalesTrendChart() {
    if (!this.$refs.salesTrendChart) return;
    
    const chartDom = this.$refs.salesTrendChart as HTMLElement;
    if (this.salesTrendChart) {
      this.salesTrendChart.dispose();
    }
    this.salesTrendChart = this.$echarts.init(chartDom);
    
    const dates = this.salesTrend.map(item => item.date);
    const values = this.trendType === 'amount' 
      ? this.salesTrend.map(item => item.total_amount)
      : this.salesTrend.map(item => item.order_count);
    
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: {
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        name: this.trendType === 'amount' ? '销售额(元)' : '订单数'
      },
      series: [
        {
          name: this.trendType === 'amount' ? '销售额' : '订单数',
          type: 'line',
          data: values,
          smooth: true,
          markPoint: {
            data: [
              { type: 'max', name: '最大值' },
              { type: 'min', name: '最小值' }
            ]
          }
        }
      ]
    };
    
    this.salesTrendChart.setOption(option);
    
    // 窗口大小变化时重绘图表
    window.addEventListener('resize', () => {
      this.salesTrendChart.resize();
    });
  }
  
  private renderHotDishesChart() {
    if (!this.$refs.hotDishesChart) return;
    
    const chartDom = this.$refs.hotDishesChart as HTMLElement;
    if (this.hotDishesChart) {
      this.hotDishesChart.dispose();
    }
    this.hotDishesChart = this.$echarts.init(chartDom);
    
    const dishNames = this.hotDishesList.map(item => item.dish_name);
    const dishValues = this.hotDishesList.map(item => item.total_amount);
    
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: dishNames,
        axisLabel: {
          interval: 0,
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        name: '销售额(元)'
      },
      series: [
        {
          name: '销售额',
          type: 'bar',
          data: dishValues,
          itemStyle: {
            color: function(params: any) {
              const colorList = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399', '#9B59B6', '#3498DB', '#1ABC9C', '#F39C12', '#D35400'];
              return colorList[params.dataIndex % colorList.length];
            }
          }
        }
      ]
    };
    
    this.hotDishesChart.setOption(option);
    
    // 窗口大小变化时重绘图表
    window.addEventListener('resize', () => {
      this.hotDishesChart.resize();
    });
  }
  
  private renderCategoryDistributionChart() {
    if (!this.$refs.categoryDistributionChart) return;
    
    const chartDom = this.$refs.categoryDistributionChart as HTMLElement;
    if (this.categoryDistributionChart) {
      this.categoryDistributionChart.dispose();
    }
    this.categoryDistributionChart = this.$echarts.init(chartDom);
    
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
        data: this.categoryDistribution.map(item => item.name)
      },
      series: [
        {
          name: '类别销售额',
          type: 'pie',
          radius: ['50%', '70%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '16',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: this.categoryDistribution
        }
      ]
    };
    
    this.categoryDistributionChart.setOption(option);
    
    // 窗口大小变化时重绘图表
    window.addEventListener('resize', () => {
      this.categoryDistributionChart.resize();
    });
  }
  
  private formatDateTime(date: string) {
    return moment(date).format('YYYY-MM-DD HH:mm:ss');
  }
  
  private getLevelType(level: number) {
    switch (level) {
      case 1: return '';
      case 2: return 'success';
      case 3: return 'warning';
      default: return 'info';
    }
  }
}
</script>

<style lang="scss" scoped>
.statistics-container {
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
  
  .stat-card {
    .stat-card-content {
      display: flex;
      align-items: center;
      
      .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-right: 15px;
        
        i {
          font-size: 24px;
          color: #fff;
        }
      }
      
      .stat-info {
        .stat-title {
          font-size: 14px;
          color: #909399;
        }
        
        .stat-value {
          font-size: 20px;
          font-weight: bold;
          margin-top: 5px;
        }
      }
    }
  }
}
</style>
