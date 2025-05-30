<template>
  <div class="order-list-container">
    <div class="page-header">
      <h2>订单列表</h2>
      <el-button type="primary" @click="handleCreateOrder">创建订单</el-button>
    </div>
    
    <el-card shadow="hover" class="filter-container">
      <el-form :inline="true" :model="queryParams" ref="queryForm" size="small">
        <el-form-item label="订单编号" prop="order_number">
          <el-input v-model="queryParams.order_number" placeholder="请输入订单编号" clearable></el-input>
        </el-form-item>
        <el-form-item label="餐桌号" prop="table_number">
          <el-input v-model="queryParams.table_number" placeholder="请输入餐桌号" clearable></el-input>
        </el-form-item>
        <el-form-item label="订单状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="请选择订单状态" clearable>
            <el-option label="未付款" :value="0"></el-option>
            <el-option label="已付款" :value="1"></el-option>
            <el-option label="已取消" :value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="下单日期" prop="date_range">
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
          <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <el-card shadow="hover" class="table-container">
      <el-table
        v-loading="loading"
        :data="orderList"
        border
        style="width: 100%">
        <el-table-column type="index" width="50" align="center"></el-table-column>
        <el-table-column prop="order_number" label="订单编号" min-width="120"></el-table-column>
        <el-table-column prop="table_number" label="餐桌号" width="80"></el-table-column>
        <el-table-column prop="customer_count" label="就餐人数" width="80" align="center"></el-table-column>
        <el-table-column prop="employee_name" label="服务员" min-width="100"></el-table-column>
        <el-table-column prop="member_name" label="会员" min-width="100">
          <template slot-scope="scope">
            {{ scope.row.member_name || '非会员' }}
          </template>
        </el-table-column>
        <el-table-column prop="total_amount" label="订单金额" min-width="100">
          <template slot-scope="scope">
            {{ scope.row.total_amount.toFixed(2) }} 元
          </template>
        </el-table-column>
        <el-table-column prop="actual_amount" label="实付金额" min-width="100">
          <template slot-scope="scope">
            {{ scope.row.actual_amount.toFixed(2) }} 元
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template slot-scope="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="order_time" label="下单时间" min-width="160">
          <template slot-scope="scope">
            {{ formatDateTime(scope.row.order_time) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="handleViewDetail(scope.row)">详情</el-button>
            <el-button 
              v-if="scope.row.status === 0"
              size="mini" 
              type="success" 
              @click="handleSettle(scope.row)">结算</el-button>
            <el-button 
              v-if="scope.row.status === 0"
              size="mini" 
              type="danger" 
              @click="handleCancel(scope.row)">取消</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.page"
        :limit.sync="queryParams.limit"
        @pagination="getOrderList"
      />
    </el-card>
    
    <!-- 结算订单对话框 -->
    <el-dialog title="订单结算" :visible.sync="settleDialogVisible" width="500px" append-to-body>
      <el-form ref="settleForm" :model="settleForm" :rules="settleRules" label-width="100px">
        <el-form-item label="订单编号">
          <span>{{ currentOrder.order_number }}</span>
        </el-form-item>
        <el-form-item label="餐桌号">
          <span>{{ currentOrder.table_number }}</span>
        </el-form-item>
        <el-form-item label="订单金额">
          <span>{{ currentOrder.total_amount ? currentOrder.total_amount.toFixed(2) : '0.00' }} 元</span>
        </el-form-item>
        <el-form-item label="优惠金额" prop="discount_amount">
          <el-input-number 
            v-model="settleForm.discount_amount" 
            :precision="2" 
            :step="1" 
            :min="0" 
            :max="currentOrder.total_amount || 0"
            style="width: 100%">
          </el-input-number>
        </el-form-item>
        <el-form-item label="实付金额">
          <span>{{ getActualAmount() }} 元</span>
        </el-form-item>
        <el-form-item label="支付方式" prop="payment_method">
          <el-select v-model="settleForm.payment_method" placeholder="请选择支付方式" style="width: 100%">
            <el-option label="现金" value="现金"></el-option>
            <el-option label="微信支付" value="微信支付"></el-option>
            <el-option label="支付宝" value="支付宝"></el-option>
            <el-option label="银行卡" value="银行卡"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="settleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitSettleForm">确认结算</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { getOrders, getOrder, settleOrder, cancelOrder } from '@/api/order';
import { Order } from '@/types';
import Pagination from '@/components/common/Pagination.vue';
import moment from 'moment';

@Component({
  components: {
    Pagination
  }
})
export default class OrderList extends Vue {
  private loading = false;
  private orderList: Order[] = [];
  private total = 0;
  private queryParams = {
    page: 1,
    limit: 10,
    order_number: '',
    table_number: '',
    status: undefined,
    start_date: '',
    end_date: ''
  };
  
  private dateRange: string[] = [];
  
  // 结算相关
  private settleDialogVisible = false;
  private currentOrder: Partial<Order> = {};
  private settleForm = {
    discount_amount: 0,
    payment_method: ''
  };
  
  private settleRules = {
    payment_method: [{ required: true, message: '请选择支付方式', trigger: 'change' }]
  };
  
  created() {
    this.getOrderList();
  }
  
  private async getOrderList() {
    this.loading = true;
    try {
      const res = await getOrders(this.queryParams);
      this.orderList = res.data.items || [];
      this.total = res.data.total || 0;
    } catch (error) {
      console.error('获取订单列表失败:', error);
      this.$message.error('获取订单列表失败');
    } finally {
      this.loading = false;
    }
  }
  
  private formatDateTime(date: string) {
    return moment(date).format('YYYY-MM-DD HH:mm:ss');
  }
  
  private getStatusText(status: number) {
    switch (status) {
      case 0: return '未付款';
      case 1: return '已付款';
      case 2: return '已取消';
      default: return '未知';
    }
  }
  
  private getStatusType(status: number) {
    switch (status) {
      case 0: return 'warning';
      case 1: return 'success';
      case 2: return 'info';
      default: return '';
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
    this.queryParams.page = 1;
    this.getOrderList();
  }
  
  private resetQuery() {
    this.dateRange = [];
    (this.$refs.queryForm as any).resetFields();
    this.queryParams.start_date = '';
    this.queryParams.end_date = '';
    this.handleQuery();
  }
  
  private handleCreateOrder() {
    this.$router.push('/order/create');
  }
  
  private handleViewDetail(row: Order) {
    this.$router.push(`/order/detail/${row.order_id}`);
  }
  
  private handleSettle(row: Order) {
    this.currentOrder = { ...row };
    this.settleForm = {
      discount_amount: 0,
      payment_method: ''
    };
    this.settleDialogVisible = true;
  }
  
  private getActualAmount() {
    const totalAmount = this.currentOrder.total_amount || 0;
    const discountAmount = this.settleForm.discount_amount || 0;
    return (totalAmount - discountAmount).toFixed(2);
  }
  
  private async submitSettleForm() {
    (this.$refs.settleForm as any).validate(async (valid: boolean) => {
      if (!valid) return;
      
      try {
        await settleOrder(this.currentOrder.order_id!, {
          payment_method: this.settleForm.payment_method,
          discount_amount: this.settleForm.discount_amount
        });
        
        this.$message.success('订单结算成功');
        this.settleDialogVisible = false;
        this.getOrderList();
      } catch (error) {
        console.error('订单结算失败:', error);
        this.$message.error('订单结算失败');
      }
    });
  }
  
  private async handleCancel(row: Order) {
    try {
      await this.$confirm('确认取消该订单吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      });
      
      await cancelOrder(row.order_id);
      this.$message.success('订单取消成功');
      this.getOrderList();
    } catch (error) {
      console.error('订单取消失败:', error);
    }
  }
}
</script>

<style lang="scss" scoped>
.order-list-container {
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
}
</style>
