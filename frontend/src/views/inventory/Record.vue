<template>
  <div class="inventory-list">
    <div class="page-header">
      <h2>库存管理</h2>
      <div>
        <el-button type="primary" @click="handleInStock">入库登记</el-button>
        <el-button type="warning" @click="handleOutStock">出库登记</el-button>
      </div>
    </div>
    
    <el-card shadow="hover" class="filter-container">
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
    </el-card>
    
    <el-card shadow="hover" class="table-container">
      <el-table
        v-loading="loading"
        :data="inventoryList"
        border
        style="width: 100%">
        <el-table-column type="index" width="50" align="center"></el-table-column>
        <el-table-column prop="record_time" label="记录时间" width="180">
          <template slot-scope="scope">
            {{ scope.row.record_time | formatDateTime }}
          </template>
        </el-table-column>
        <el-table-column prop="ingredient_name" label="原材料名称" min-width="120"></el-table-column>
        <el-table-column prop="type" label="类型" width="80">
          <template slot-scope="scope">
            <el-tag :type="scope.row.type === 'in' ? 'success' : 'danger'">
              {{ scope.row.type === 'in' ? '入库' : '出库' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量" width="120">
          <template slot-scope="scope">
            {{ scope.row.quantity }} {{ scope.row.unit || '单位' }}
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
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
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
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getInventoryRecords, createInventoryRecord } from '@/api/inventory';
import { getAllIngredients } from '@/api/ingredient';

export default {
  name: 'InventoryRecord',
  data() {
    return {
      loading: false,
      inventoryList: [],
      total: 0,
      queryParams: {
        page: 1,
        limit: 10,
        ingredient_id: '',
        type: '',
        start_date: '',
        end_date: ''
      },
      dateRange: [],
      
      ingredientOptions: [],
      
      dialogVisible: false,
      dialogTitle: '',
      form: {
        ingredient_id: '',
        type: 'in',
        quantity: 1,
        notes: ''
      },
      
      rules: {
        ingredient_id: [{ required: true, message: '请选择原材料', trigger: 'change' }],
        quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getInventoryList();
    this.getIngredientOptions();
  },
  methods: {
    async getInventoryList() {
      this.loading = true;
      try {
        const res = await getInventoryRecords(this.queryParams);
        this.inventoryList = res.data.items || [];
        this.total = res.data.total || 0;
      } catch (error) {
        console.error('获取库存记录失败:', error);
        this.$message.error('获取库存记录失败');
      } finally {
        this.loading = false;
      }
    },
    
    async getIngredientOptions() {
      try {
        const res = await getAllIngredients();
        this.ingredientOptions = res.data || [];
      } catch (error) {
        console.error('获取原材料列表失败:', error);
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
      this.getInventoryList();
    },
    
    resetQuery() {
      this.dateRange = [];
      this.queryParams = {
        page: 1,
        limit: 10,
        ingredient_id: '',
        type: '',
        start_date: '',
        end_date: ''
      };
      this.getInventoryList();
    },
    
    handleSizeChange(val) {
      this.queryParams.limit = val;
      this.getInventoryList();
    },
    
    handleCurrentChange(val) {
      this.queryParams.page = val;
      this.getInventoryList();
    },
    
    handleInStock() {
      this.dialogTitle = '原材料入库';
      this.form = {
        ingredient_id: '',
        type: 'in',
        quantity: 1,
        notes: ''
      };
      this.dialogVisible = true;
    },
    
    handleOutStock() {
      this.dialogTitle = '原材料出库';
      this.form = {
        ingredient_id: '',
        type: 'out',
        quantity: 1,
        notes: ''
      };
      this.dialogVisible = true;
    },
    
    submitForm() {
      this.$refs.form.validate(async valid => {
        if (!valid) return;
        
        try {
          // 如果是出库，检查库存是否足够
          if (this.form.type === 'out') {
            const ingredient = this.ingredientOptions.find(item => item.ingredient_id === this.form.ingredient_id);
            if (ingredient && ingredient.stock_quantity < this.form.quantity) {
              this.$message.warning(`库存不足，当前库存: ${ingredient.stock_quantity} ${ingredient.unit || '单位'}`);
              return;
            }
          }
          
          await createInventoryRecord(this.form);
          this.$message.success(this.form.type === 'in' ? '入库成功' : '出库成功');
          this.dialogVisible = false;
          this.getInventoryList();
          this.getIngredientOptions(); // 刷新原材料列表以更新库存数量
        } catch (error) {
          console.error('保存库存记录失败:', error);
          this.$message.error('保存库存记录失败');
        }
      });
    }
  }
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
