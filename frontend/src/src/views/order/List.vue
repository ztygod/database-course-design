<template>
  <div class="order-list">
    <div class="page-header">
      <h2>订单管理</h2>
      <el-button type="primary" @click="handleAdd">新建订单</el-button>
    </div>
    
    <el-card shadow="hover" class="filter-container">
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
    </el-card>
    
    <el-card shadow="hover" class="table-container">
      <el-table
        v-loading="loading"
        :data="orderList"
        border
        style="width: 100%">
        <el-table-column type="index" width="50" align="center"></el-table-column>
        <el-table-column prop="order_number" label="订单号" width="180"></el-table-column>
        <el-table-column prop="order_time" label="下单时间" width="180">
          <template slot-scope="scope">
            {{ scope.row.order_time | formatDateTime }}
          </template>
        </el-table-column>
        <el-table-column prop="total_amount" label="总金额" width="120">
          <template slot-scope="scope">
            {{ scope.row.total_amount | formatMoney }} 元
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="member_name" label="会员" width="120"></el-table-column>
        <el-table-column prop="employee_name" label="服务员" width="120"></el-table-column>
        <el-table-column prop="notes" label="备注" min-width="150"></el-table-column>
        <el-table-column label="操作" width="250" align="center">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="handleView(scope.row)">查看</el-button>
            <el-button 
              size="mini" 
              type="success" 
              v-if="scope.row.status === 0"
              @click="handleSettle(scope.row)">
              结算
            </el-button>
            <el-button 
              size="mini" 
              type="warning" 
              v-if="scope.row.status === 0"
              @click="handleEdit(scope.row)">
              编辑
            </el-button>
            <el-button 
              size="mini" 
              type="danger" 
              v-if="scope.row.status === 0"
              @click="handleCancel(scope.row)">
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
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="800px">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
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
          <el-table-column prop="dish_name" label="菜品名称" min-width="150"></el-table-column>
          <el-table-column prop="price" label="单价" width="100">
            <template slot-scope="scope">
              {{ scope.row.price | formatMoney }} 元
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="100">
            <template slot-scope="scope">
              <el-input-number 
                v-model="scope.row.quantity" 
                :min="1" 
                :max="99"
                size="small"
                @change="calculateTotal">
              </el-input-number>
            </template>
          </el-table-column>
          <el-table-column prop="subtotal" label="小计" width="120">
            <template slot-scope="scope">
              {{ (scope.row.price * scope.row.quantity) | formatMoney }} 元
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80" align="center">
            <template slot-scope="scope">
              <el-button 
                type="danger" 
                icon="el-icon-delete" 
                size="mini" 
                circle
                @click="removeOrderItem(scope.$index)">
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <div class="order-total">
          <span>总金额：<strong>{{ form.total_amount | formatMoney }}</strong> 元</span>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">保 存</el-button>
      </div>
    </el-dialog>
    
    <!-- 添加菜品对话框 -->
    <el-dialog title="添加菜品" :visible.sync="itemDialogVisible" width="600px">
      <el-form :inline="true" :model="itemForm">
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
      </el-form>
      
      <el-table
        v-loading="dishLoading"
        :data="dishOptions"
        border
        height="300"
        style="width: 100%">
        <el-table-column prop="dish_name" label="菜品名称" min-width="150"></el-table-column>
        <el-table-column prop="category_name" label="类别" width="120"></el-table-column>
        <el-table-column prop="price" label="价格" width="100">
          <template slot-scope="scope">
            {{ scope.row.price | formatMoney }} 元
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="addDishToOrder(scope.row)">添加</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="itemDialogVisible = false">关 闭</el-button>
      </div>
    </el-dialog>
    
    <!-- 查看订单详情对话框 -->
    <el-dialog title="订单详情" :visible.sync="viewDialogVisible" width="700px">
      <div v-if="currentOrder" class="order-detail">
        <div class="order-info">
          <p><strong>订单号：</strong>{{ currentOrder.order_number }}</p>
          <p><strong>下单时间：</strong>{{ currentOrder.order_time | formatDateTime }}</p>
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
            <template slot-scope="scope">
              {{ scope.row.price | formatMoney }} 元
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="80" align="center"></el-table-column>
          <el-table-column prop="subtotal" label="小计" width="120">
            <template slot-scope="scope">
              {{ (scope.row.price * scope.row.quantity) | formatMoney }} 元
            </template>
          </el-table-column>
        </el-table>
        
        <div class="order-summary">
          <p><strong>总金额：</strong>{{ currentOrder.total_amount | formatMoney }} 元</p>
          <p v-if="currentOrder.status === 1"><strong>结算时间：</strong>{{ currentOrder.settlement_time | formatDateTime }}</p>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="viewDialogVisible = false">关 闭</el-button>
      </div>
    </el-dialog>
    
    <!-- 结算订单对话框 -->
    <el-dialog title="订单结算" :visible.sync="settleDialogVisible" width="500px">
      <div v-if="currentOrder" class="settle-form">
        <p><strong>订单号：</strong>{{ currentOrder.order_number }}</p>
        <p><strong>总金额：</strong>{{ currentOrder.total_amount | formatMoney }} 元</p>
        
        <el-form ref="settleForm" :model="settleForm" :rules="settleRules" label-width="100px">
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
      <div slot="footer" class="dialog-footer">
        <el-button @click="settleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitSettle">确认结算</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getOrders, getOrder, createOrder, updateOrder, deleteOrder, settleOrder, cancelOrder, addOrderDetail, deleteOrderDetail } from '@/api/order';
import { getAllMembers } from '@/api/member';
import { getAllEmployees } from '@/api/employee';
import { getAllCategories } from '@/api/category';
import { getDishes } from '@/api/dish';

export default {
  name: 'OrderList',
  data() {
    return {
      loading: false,
      orderList: [],
      total: 0,
      queryParams: {
        page: 1,
        limit: 10,
        order_number: '',
        status: '',
        start_date: '',
        end_date: ''
      },
      dateRange: [],
      
      memberOptions: [],
      employeeOptions: [],
      categoryOptions: [],
      dishOptions: [],
      
      dialogVisible: false,
      dialogTitle: '',
      form: {
        member_id: '',
        employee_id: '',
        notes: '',
        order_items: [],
        total_amount: 0
      },
      
      rules: {
        employee_id: [{ required: true, message: '请选择服务员', trigger: 'change' }]
      },
      
      itemDialogVisible: false,
      dishLoading: false,
      itemForm: {
        category_id: '',
        keyword: ''
      },
      
      viewDialogVisible: false,
      currentOrder: null,
      orderDetails: [],
      
      settleDialogVisible: false,
      settleForm: {
        payment_method: 'cash',
        actual_amount: 0,
        notes: ''
      },
      settleRules: {
        payment_method: [{ required: true, message: '请选择支付方式', trigger: 'change' }],
        actual_amount: [{ required: true, message: '请输入实收金额', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getOrderList();
    this.getMemberOptions();
    this.getEmployeeOptions();
    this.getCategoryOptions();
  },
  methods: {
    async getOrderList() {
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
    },
    
    async getMemberOptions() {
      try {
        const res = await getAllMembers();
        this.memberOptions = res.data || [];
      } catch (error) {
        console.error('获取会员列表失败:', error);
      }
    },
    
    async getEmployeeOptions() {
      try {
        const res = await getAllEmployees();
        this.employeeOptions = res.data || [];
      } catch (error) {
        console.error('获取员工列表失败:', error);
      }
    },
    
    async getCategoryOptions() {
      try {
        const res = await getAllCategories();
        this.categoryOptions = res.data || [];
      } catch (error) {
        console.error('获取菜品类别失败:', error);
      }
    },
    
    handleDateChange(val) {
      if (val) {
        this.queryParams.start_date = val[0];
        this.queryParams.end_date = val[1];
      } else {
        this.queryParams.start_date = '';
        this.queryParams.end_date = '';
      }
    },
    
    handleQuery() {
      this.queryParams.page = 1;
      this.getOrderList();
    },
    
    resetQuery() {
      this.dateRange = [];
      this.queryParams = {
        page: 1,
        limit: 10,
        order_number: '',
        status: '',
        start_date: '',
        end_date: ''
      };
      this.getOrderList();
    },
    
    handleSizeChange(val) {
      this.queryParams.limit = val;
      this.getOrderList();
    },
    
    handleCurrentChange(val) {
      this.queryParams.page = val;
      this.getOrderList();
    },
    
    getStatusText(status) {
      switch (status) {
        case 0: return '未结算';
        case 1: return '已结算';
        case 2: return '已取消';
        default: return '未知';
      }
    },
    
    getStatusType(status) {
      switch (status) {
        case 0: return 'warning';
        case 1: return 'success';
        case 2: return 'info';
        default: return '';
      }
    },
    
    handleAdd() {
      this.dialogTitle = '新建订单';
      this.form = {
        member_id: '',
        employee_id: '',
        notes: '',
        order_items: [],
        total_amount: 0
      };
      this.dialogVisible = true;
    },
    
    async handleEdit(row) {
      this.dialogTitle = '编辑订单';
      try {
        const res = await getOrder(row.order_id);
        const orderData = res.data || {};
        
        this.form = {
          order_id: orderData.order_id,
          member_id: orderData.member_id || '',
          employee_id: orderData.employee_id,
          notes: orderData.notes || '',
          order_items: orderData.order_items || [],
          total_amount: orderData.total_amount || 0
        };
        
        this.dialogVisible = true;
      } catch (error) {
        console.error('获取订单详情失败:', error);
        this.$message.error('获取订单详情失败');
      }
    },
    
    async handleView(row) {
      try {
        const res = await getOrder(row.order_id);
        this.currentOrder = res.data || {};
        this.orderDetails = this.currentOrder.order_items || [];
        this.viewDialogVisible = true;
      } catch (error) {
        console.error('获取订单详情失败:', error);
        this.$message.error('获取订单详情失败');
      }
    },
    
    async handleSettle(row) {
      this.currentOrder = row;
      this.settleForm = {
        payment_method: 'cash',
        actual_amount: row.total_amount,
        notes: ''
      };
      this.settleDialogVisible = true;
    },
    
    async handleCancel(row) {
      try {
        await this.$confirm('确认取消该订单吗？', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        
        await cancelOrder(row.order_id);
        this.$message.success('订单已取消');
        this.getOrderList();
      } catch (error) {
        console.error('取消订单失败:', error);
      }
    },
    
    showAddItem() {
      this.itemForm = {
        category_id: '',
        keyword: ''
      };
      this.dishOptions = [];
      this.itemDialogVisible = true;
      this.searchDishes();
    },
    
    handleCategoryChange() {
      this.searchDishes();
    },
    
    async searchDishes() {
      this.dishLoading = true;
      try {
        const params = {
          category_id: this.itemForm.category_id,
          dish_name: this.itemForm.keyword,
          status: 1, // 只查询上架的菜品
          limit: 100
        };
        
        const res = await getDishes(params);
        this.dishOptions = res.data.items || [];
      } catch (error) {
        console.error('搜索菜品失败:', error);
      } finally {
        this.dishLoading = false;
      }
    },
    
    addDishToOrder(dish) {
      // 检查是否已存在该菜品
      const existingIndex = this.form.order_items.findIndex(item => item.dish_id === dish.dish_id);
      
      if (existingIndex >= 0) {
        // 已存在，数量+1
        this.form.order_items[existingIndex].quantity += 1;
      } else {
        // 不存在，添加新项
        this.form.order_items.push({
          dish_id: dish.dish_id,
          dish_name: dish.dish_name,
          price: dish.price,
          quantity: 1
        });
      }
      
      this.calculateTotal();
      this.$message.success(`已添加 ${dish.dish_name}`);
    },
    
    removeOrderItem(index) {
      this.form.order_items.splice(index, 1);
      this.calculateTotal();
    },
    
    calculateTotal() {
      this.form.total_amount = this.form.order_items.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
      }, 0);
    },
    
    submitForm() {
      if (this.form.order_items.length === 0) {
        this.$message.warning('请至少添加一个菜品');
        return;
      }
      
      this.$refs.form.validate(async valid => {
        if (!valid) return;
        
        try {
          if (this.form.order_id) {
            // 更新订单
            await updateOrder(this.form.order_id, this.form);
            this.$message.success('更新成功');
          } else {
            // 新建订单
            await createOrder(this.form);
            this.$message.success('创建成功');
          }
          
          this.dialogVisible = false;
          this.getOrderList();
        } catch (error) {
          console.error('保存订单失败:', error);
          this.$message.error('保存订单失败');
        }
      });
    },
    
    submitSettle() {
      this.$refs.settleForm.validate(async valid => {
        if (!valid) return;
        
        try {
          await settleOrder(this.currentOrder.order_id, this.settleForm);
          this.$message.success('结算成功');
          this.settleDialogVisible = false;
          this.getOrderList();
        } catch (error) {
          console.error('结算订单失败:', error);
          this.$message.error('结算订单失败');
        }
      });
    }
  }
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
