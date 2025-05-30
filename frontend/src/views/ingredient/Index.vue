<template>
  <div class="ingredient-container">
    <div class="page-header">
      <h2>原材料管理</h2>
      <el-button type="primary" @click="handleAdd">添加原材料</el-button>
    </div>
    
    <el-card shadow="hover" class="filter-container">
      <el-form :inline="true" :model="queryParams" ref="queryForm" size="small">
        <el-form-item label="原材料名称" prop="ingredient_name">
          <el-input v-model="queryParams.ingredient_name" placeholder="请输入原材料名称" clearable></el-input>
        </el-form-item>
        <el-form-item label="供应商" prop="supplier_id">
          <el-select v-model="queryParams.supplier_id" placeholder="请选择供应商" clearable>
            <el-option
              v-for="item in supplierOptions"
              :key="item.supplier_id"
              :label="item.supplier_name"
              :value="item.supplier_id">
            </el-option>
          </el-select>
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
        :data="ingredientList"
        border
        style="width: 100%">
        <el-table-column type="index" width="50" align="center"></el-table-column>
        <el-table-column prop="ingredient_name" label="原材料名称" min-width="120"></el-table-column>
        <el-table-column prop="supplier_name" label="供应商" min-width="120"></el-table-column>
        <el-table-column prop="stock_quantity" label="库存数量" min-width="100">
          <template slot-scope="scope">
            {{ scope.row.stock_quantity }} {{ scope.row.unit || '单位' }}
          </template>
        </el-table-column>
        <el-table-column prop="cost_price" label="成本价" min-width="100">
          <template slot-scope="scope">
            {{ scope.row.cost_price.toFixed(2) }} 元
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="mini" type="success" @click="handleInventoryIn(scope.row)">入库</el-button>
            <el-button size="mini" type="warning" @click="handleInventoryOut(scope.row)">出库</el-button>
            <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.page"
        :limit.sync="queryParams.limit"
        @pagination="getIngredientList"
      />
    </el-card>
    
    <!-- 添加/编辑原材料对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="原材料名称" prop="ingredient_name">
          <el-input v-model="form.ingredient_name" placeholder="请输入原材料名称"></el-input>
        </el-form-item>
        <el-form-item label="供应商" prop="supplier_id">
          <el-select v-model="form.supplier_id" placeholder="请选择供应商" style="width: 100%">
            <el-option
              v-for="item in supplierOptions"
              :key="item.supplier_id"
              :label="item.supplier_name"
              :value="item.supplier_id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="库存数量" prop="stock_quantity">
          <el-input-number v-model="form.stock_quantity" :precision="2" :step="0.1" :min="0" style="width: 100%"></el-input-number>
        </el-form-item>
        <el-form-item label="单位" prop="unit">
          <el-input v-model="form.unit" placeholder="请输入单位"></el-input>
        </el-form-item>
        <el-form-item label="成本价" prop="cost_price">
          <el-input-number v-model="form.cost_price" :precision="2" :step="0.1" :min="0" style="width: 100%"></el-input-number>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </div>
    </el-dialog>
    
    <!-- 入库/出库对话框 -->
    <el-dialog :title="inventoryDialogTitle" :visible.sync="inventoryDialogVisible" width="500px" append-to-body>
      <el-form ref="inventoryForm" :model="inventoryForm" :rules="inventoryRules" label-width="80px">
        <el-form-item label="原材料" prop="ingredient_name">
          <el-input v-model="inventoryForm.ingredient_name" disabled></el-input>
        </el-form-item>
        <el-form-item label="当前库存" prop="current_stock">
          <el-input v-model="inventoryForm.current_stock" disabled>
            <template slot="append">{{ inventoryForm.unit }}</template>
          </el-input>
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
import { Component, Vue } from 'vue-property-decorator';
import { getIngredients, getIngredient, createIngredient, updateIngredient, deleteIngredient } from '@/api/ingredient';
import { getAllSuppliers } from '@/api/supplier';
import { createInventoryRecord } from '@/api/inventory';
import { Ingredient, Supplier } from '@/types';
import Pagination from '@/components/common/Pagination.vue';

@Component({
  components: {
    Pagination
  }
})
export default class IngredientIndex extends Vue {
  private loading = false;
  private ingredientList: Ingredient[] = [];
  private total = 0;
  private queryParams = {
    page: 1,
    limit: 10,
    ingredient_name: '',
    supplier_id: undefined
  };
  
  private dialogVisible = false;
  private dialogTitle = '';
  private form: Partial<Ingredient> = {
    ingredient_name: '',
    supplier_id: undefined,
    stock_quantity: 0,
    unit: '',
    cost_price: 0
  };
  
  private rules = {
    ingredient_name: [{ required: true, message: '请输入原材料名称', trigger: 'blur' }],
    supplier_id: [{ required: true, message: '请选择供应商', trigger: 'change' }],
    cost_price: [{ required: true, message: '请输入成本价', trigger: 'blur' }]
  };
  
  private supplierOptions: Supplier[] = [];
  
  // 入库/出库相关
  private inventoryDialogVisible = false;
  private inventoryDialogTitle = '';
  private inventoryForm = {
    ingredient_id: 0,
    ingredient_name: '',
    current_stock: '',
    unit: '',
    operation_type: 1, // 1-入库，2-出库
    quantity: 0.01,
    remark: ''
  };
  
  private inventoryRules = {
    quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }]
  };
  
  created() {
    this.getIngredientList();
    this.getSupplierOptions();
  }
  
  private async getIngredientList() {
    this.loading = true;
    try {
      const res = await getIngredients(this.queryParams);
      this.ingredientList = res.data.items || [];
      this.total = res.data.total || 0;
    } catch (error) {
      console.error('获取原材料列表失败:', error);
      this.$message.error('获取原材料列表失败');
    } finally {
      this.loading = false;
    }
  }
  
  private async getSupplierOptions() {
    try {
      const res = await getAllSuppliers();
      this.supplierOptions = res.data || [];
    } catch (error) {
      console.error('获取供应商列表失败:', error);
      this.$message.error('获取供应商列表失败');
    }
  }
  
  private handleQuery() {
    this.queryParams.page = 1;
    this.getIngredientList();
  }
  
  private resetQuery() {
    (this.$refs.queryForm as any).resetFields();
    this.handleQuery();
  }
  
  private handleAdd() {
    this.dialogTitle = '添加原材料';
    this.form = {
      ingredient_name: '',
      supplier_id: undefined,
      stock_quantity: 0,
      unit: '',
      cost_price: 0
    };
    this.dialogVisible = true;
  }
  
  private handleEdit(row: Ingredient) {
    this.dialogTitle = '编辑原材料';
    this.form = { ...row };
    this.dialogVisible = true;
  }
  
  private async handleDelete(row: Ingredient) {
    try {
      await this.$confirm('确认删除该原材料吗？删除后关联的菜品配料将无法显示', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      });
      
      await deleteIngredient(row.ingredient_id);
      this.$message.success('删除成功');
      this.getIngredientList();
    } catch (error) {
      console.error('删除原材料失败:', error);
    }
  }
  
  private async submitForm() {
    (this.$refs.form as any).validate(async (valid: boolean) => {
      if (!valid) return;
      
      try {
        if (this.form.ingredient_id) {
          // 更新
          await updateIngredient(this.form.ingredient_id, this.form);
          this.$message.success('更新成功');
        } else {
          // 新增
          await createIngredient(this.form);
          this.$message.success('添加成功');
        }
        
        this.dialogVisible = false;
        this.getIngredientList();
      } catch (error) {
        console.error('保存原材料失败:', error);
        this.$message.error('保存原材料失败');
      }
    });
  }
  
  // 入库操作
  private handleInventoryIn(row: Ingredient) {
    this.inventoryDialogTitle = '原材料入库';
    this.inventoryForm = {
      ingredient_id: row.ingredient_id,
      ingredient_name: row.ingredient_name,
      current_stock: `${row.stock_quantity}`,
      unit: row.unit || '单位',
      operation_type: 1, // 入库
      quantity: 0.01,
      remark: ''
    };
    this.inventoryDialogVisible = true;
  }
  
  // 出库操作
  private handleInventoryOut(row: Ingredient) {
    this.inventoryDialogTitle = '原材料出库';
    this.inventoryForm = {
      ingredient_id: row.ingredient_id,
      ingredient_name: row.ingredient_name,
      current_stock: `${row.stock_quantity}`,
      unit: row.unit || '单位',
      operation_type: 2, // 出库
      quantity: 0.01,
      remark: ''
    };
    this.inventoryDialogVisible = true;
  }
  
  private async submitInventoryForm() {
    (this.$refs.inventoryForm as any).validate(async (valid: boolean) => {
      if (!valid) return;
      
      // 出库时检查库存是否足够
      if (this.inventoryForm.operation_type === 2) {
        const currentStock = parseFloat(this.inventoryForm.current_stock);
        if (currentStock < this.inventoryForm.quantity) {
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
        this.getIngredientList();
      } catch (error) {
        console.error('库存操作失败:', error);
        this.$message.error('库存操作失败');
      }
    });
  }
}
</script>

<style lang="scss" scoped>
.ingredient-container {
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
