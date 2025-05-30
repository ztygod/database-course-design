<template>
  <div class="inventory-record-container">
    <div class="page-header">
      <h2>库存记录</h2>
      <el-button-group>
        <el-button type="primary" @click="handleInventoryIn">入库操作</el-button>
        <el-button type="warning" @click="handleInventoryOut">出库操作</el-button>
      </el-button-group>
    </div>
    
    <el-card shadow="hover" class="filter-container">
      <el-form :inline="true" :model="queryParams" ref="queryForm" size="small">
        <el-form-item label="原材料" prop="ingredient_id">
          <el-select v-model="queryParams.ingredient_id" placeholder="请选择原材料" clearable filterable>
            <el-option
              v-for="item in ingredientOptions"
              :key="item.ingredient_id"
              :label="item.ingredient_name"
              :value="item.ingredient_id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="操作类型" prop="operation_type">
          <el-select v-model="queryParams.operation_type" placeholder="请选择操作类型" clearable>
            <el-option label="入库" :value="1"></el-option>
            <el-option label="出库" :value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="操作日期" prop="date_range">
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
        :data="recordList"
        border
        style="width: 100%">
        <el-table-column type="index" width="50" align="center"></el-table-column>
        <el-table-column prop="ingredient_name" label="原材料名称" min-width="120"></el-table-column>
        <el-table-column prop="operation_type" label="操作类型" width="80">
          <template slot-scope="scope">
            <el-tag :type="scope.row.operation_type === 1 ? 'success' : 'warning'">
              {{ scope.row.operation_type === 1 ? '入库' : '出库' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量" min-width="100">
          <template slot-scope="scope">
            {{ scope.row.quantity }} {{ scope.row.unit || '单位' }}
          </template>
        </el-table-column>
        <el-table-column prop="operation_time" label="操作时间" min-width="160">
          <template slot-scope="scope">
            {{ formatDateTime(scope.row.operation_time) }}
          </template>
        </el-table-column>
        <el-table-column prop="employee_name" label="操作员" min-width="100"></el-table-column>
        <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip></el-table-column>
      </el-table>
      
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.page"
        :limit.sync="queryParams.limit"
        @pagination="getRecordList"
      />
    </el-card>
    
    <!-- 入库/出库对话框 -->
    <el-dialog :title="inventoryDialogTitle" :visible.sync="inventoryDialogVisible" width="500px" append-to-body>
      <el-form ref="inventoryForm" :model="inventoryForm" :rules="inventoryRules" label-width="80px">
        <el-form-item label="原材料" prop="ingredient_id">
          <el-select v-model="inventoryForm.ingredient_id" placeholder="请选择原材料" filterable style="width: 100%">
            <el-option
              v-for="item in ingredientOptions"
              :key="item.ingredient_id"
              :label="item.ingredient_name"
              :value="item.ingredient_id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="当前库存" v-if="selectedIngredient">
          <el-input :value="selectedIngredient.stock_quantity + ' ' + (selectedIngredient.unit || '单位')" disabled></el-input>
        </el-form-item>
        <el-form-item :label="inventoryForm.operation_type === 1 ? '入库数量' : '出库数量'" prop="quantity">
          <el-input-number v-model="inventoryForm.quantity" :precision="2" :step="0.1" :min="0.01" style="width: 100%"></el-input-number>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="inventoryForm.remark" type="textarea" placeholder="请输入备注"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="inventoryDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitInventoryForm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { getInventoryRecords, createInventoryRecord } from '@/api/inventory';
import { getAllIngredients, getIngredient } from '@/api/ingredient';
import { InventoryRecord, Ingredient } from '@/types';
import Pagination from '@/components/common/Pagination.vue';
import moment from 'moment';

@Component({
  components: {
    Pagination
  }
})
export default class InventoryRecord extends Vue {
  private loading = false;
  private recordList: InventoryRecord[] = [];
  private total = 0;
  private queryParams = {
    page: 1,
    limit: 10,
    ingredient_id: undefined,
    operation_type: undefined,
    start_date: '',
    end_date: ''
  };
  
  private dateRange: string[] = [];
  private ingredientOptions: Ingredient[] = [];
  
  // 入库/出库相关
  private inventoryDialogVisible = false;
  private inventoryDialogTitle = '';
  private inventoryForm = {
    ingredient_id: undefined,
    operation_type: 1, // 1-入库，2-出库
    quantity: 0.01,
    remark: ''
  };
  
  private inventoryRules = {
    ingredient_id: [{ required: true, message: '请选择原材料', trigger: 'change' }],
    quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }]
  };
  
  private selectedIngredient: Ingredient | null = null;
  
  created() {
    this.getRecordList();
    this.getIngredientOptions();
  }
  
  @Watch('inventoryForm.ingredient_id')
  async onIngredientChange(val: number) {
    if (val) {
      try {
        const res = await getIngredient(val);
        this.selectedIngredient = res.data;
      } catch (error) {
        console.error('获取原材料详情失败:', error);
        this.selectedIngredient = null;
      }
    } else {
      this.selectedIngredient = null;
    }
  }
  
  private async getRecordList() {
    this.loading = true;
    try {
      const res = await getInventoryRecords(this.queryParams);
      this.recordList = res.data.items || [];
      this.total = res.data.total || 0;
    } catch (error) {
      console.error('获取库存记录失败:', error);
      this.$message.error('获取库存记录失败');
    } finally {
      this.loading = false;
    }
  }
  
  private async getIngredientOptions() {
    try {
      const res = await getAllIngredients();
      this.ingredientOptions = res.data || [];
    } catch (error) {
      console.error('获取原材料列表失败:', error);
      this.$message.error('获取原材料列表失败');
    }
  }
  
  private formatDateTime(date: string) {
    return moment(date).format('YYYY-MM-DD HH:mm:ss');
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
    this.getRecordList();
  }
  
  private resetQuery() {
    this.dateRange = [];
    (this.$refs.queryForm as any).resetFields();
    this.queryParams.start_date = '';
    this.queryParams.end_date = '';
    this.handleQuery();
  }
  
  // 入库操作
  private handleInventoryIn() {
    this.inventoryDialogTitle = '原材料入库';
    this.inventoryForm = {
      ingredient_id: undefined,
      operation_type: 1, // 入库
      quantity: 0.01,
      remark: ''
    };
    this.selectedIngredient = null;
    this.inventoryDialogVisible = true;
  }
  
  // 出库操作
  private handleInventoryOut() {
    this.inventoryDialogTitle = '原材料出库';
    this.inventoryForm = {
      ingredient_id: undefined,
      operation_type: 2, // 出库
      quantity: 0.01,
      remark: ''
    };
    this.selectedIngredient = null;
    this.inventoryDialogVisible = true;
  }
  
  private async submitInventoryForm() {
    (this.$refs.inventoryForm as any).validate(async (valid: boolean) => {
      if (!valid) return;
      
      // 出库时检查库存是否足够
      if (this.inventoryForm.operation_type === 2 && this.selectedIngredient) {
        if (this.selectedIngredient.stock_quantity < this.inventoryForm.quantity) {
          this.$message.error('库存不足，无法出库');
          return;
        }
      }
      
      try {
        await createInventoryRecord({
          ingredient_id: this.inventoryForm.ingredient_id,
          operation_type: this.inventoryForm.operation_type,
          quantity: this.inventoryForm.quantity,
          remark: this.inventoryForm.remark,
          employee_id: 1 // 默认使用ID为1的员工，实际应该使用当前登录用户
        });
        
        this.$message.success(this.inventoryForm.operation_type === 1 ? '入库成功' : '出库成功');
        this.inventoryDialogVisible = false;
        this.getRecordList();
      } catch (error) {
        console.error('库存操作失败:', error);
        this.$message.error('库存操作失败');
      }
    });
  }
}
</script>

<style lang="scss" scoped>
.inventory-record-container {
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
