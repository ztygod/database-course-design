<template>
  <div class="member-container">
    <div class="page-header">
      <h2>会员管理</h2>
      <el-button type="primary" @click="handleAdd">添加会员</el-button>
    </div>
    
    <el-card shadow="hover" class="filter-container">
      <el-form :inline="true" :model="queryParams" ref="queryForm" size="small">
        <el-form-item label="会员卡号" prop="card_number">
          <el-input v-model="queryParams.card_number" placeholder="请输入会员卡号" clearable></el-input>
        </el-form-item>
        <el-form-item label="会员姓名" prop="member_name">
          <el-input v-model="queryParams.member_name" placeholder="请输入会员姓名" clearable></el-input>
        </el-form-item>
        <el-form-item label="会员等级" prop="level">
          <el-select v-model="queryParams.level" placeholder="请选择会员等级" clearable>
            <el-option label="普通会员" :value="1"></el-option>
            <el-option label="银卡会员" :value="2"></el-option>
            <el-option label="金卡会员" :value="3"></el-option>
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
        :data="memberList"
        border
        style="width: 100%">
        <el-table-column type="index" width="50" align="center"></el-table-column>
        <el-table-column prop="card_number" label="会员卡号" min-width="120"></el-table-column>
        <el-table-column prop="member_name" label="会员姓名" min-width="100"></el-table-column>
        <el-table-column prop="phone" label="联系电话" min-width="120"></el-table-column>
        <el-table-column prop="level" label="会员等级" width="100">
          <template slot-scope="scope">
            <el-tag :type="getLevelType(scope.row.level)">
              {{ getLevelText(scope.row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="points" label="积分" width="80" align="center"></el-table-column>
        <el-table-column prop="register_date" label="注册日期" min-width="120">
          <template slot-scope="scope">
            {{ formatDate(scope.row.register_date) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="mini" type="success" @click="handleConsumption(scope.row)">消费记录</el-button>
            <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.page"
        :limit.sync="queryParams.limit"
        @pagination="getMemberList"
      />
    </el-card>
    
    <!-- 添加/编辑会员对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="会员卡号" prop="card_number">
          <el-input v-model="form.card_number" placeholder="请输入会员卡号"></el-input>
        </el-form-item>
        <el-form-item label="会员姓名" prop="member_name">
          <el-input v-model="form.member_name" placeholder="请输入会员姓名"></el-input>
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入联系电话"></el-input>
        </el-form-item>
        <el-form-item label="会员等级" prop="level">
          <el-select v-model="form.level" placeholder="请选择会员等级" style="width: 100%">
            <el-option label="普通会员" :value="1"></el-option>
            <el-option label="银卡会员" :value="2"></el-option>
            <el-option label="金卡会员" :value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="积分" prop="points">
          <el-input-number v-model="form.points" :min="0" :step="100" style="width: 100%"></el-input-number>
        </el-form-item>
        <el-form-item label="注册日期" prop="register_date">
          <el-date-picker
            v-model="form.register_date"
            type="date"
            placeholder="选择日期"
            value-format="yyyy-MM-dd"
            style="width: 100%">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </div>
    </el-dialog>
    
    <!-- 会员消费记录对话框 -->
    <el-dialog title="会员消费记录" :visible.sync="consumptionDialogVisible" width="800px" append-to-body>
      <div v-if="currentMember.member_id">
        <div class="member-info">
          <p><strong>会员卡号：</strong>{{ currentMember.card_number }}</p>
          <p><strong>会员姓名：</strong>{{ currentMember.member_name }}</p>
          <p><strong>会员等级：</strong>{{ getLevelText(currentMember.level) }}</p>
          <p><strong>当前积分：</strong>{{ currentMember.points }}</p>
        </div>
        
        <el-table
          v-loading="consumptionLoading"
          :data="consumptionList"
          border
          style="width: 100%; margin-top: 20px;">
          <el-table-column prop="order_number" label="订单编号" min-width="120"></el-table-column>
          <el-table-column prop="order_time" label="消费时间" min-width="160">
            <template slot-scope="scope">
              {{ formatDateTime(scope.row.order_time) }}
            </template>
          </el-table-column>
          <el-table-column prop="total_amount" label="消费金额" min-width="100">
            <template slot-scope="scope">
              {{ scope.row.total_amount.toFixed(2) }} 元
            </template>
          </el-table-column>
          <el-table-column prop="discount_amount" label="优惠金额" min-width="100">
            <template slot-scope="scope">
              {{ scope.row.discount_amount.toFixed(2) }} 元
            </template>
          </el-table-column>
          <el-table-column prop="actual_amount" label="实付金额" min-width="100">
            <template slot-scope="scope">
              {{ scope.row.actual_amount.toFixed(2) }} 元
            </template>
          </el-table-column>
          <el-table-column prop="payment_method" label="支付方式" min-width="100"></el-table-column>
        </el-table>
        
        <div v-if="consumptionList.length === 0" class="no-data">
          <p>暂无消费记录</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { getMembers, getMember, createMember, updateMember, deleteMember, getMemberConsumption } from '@/api/member';
import { Member } from '@/types';
import Pagination from '@/components/common/Pagination.vue';
import moment from 'moment';

@Component({
  components: {
    Pagination
  }
})
export default class MemberIndex extends Vue {
  private loading = false;
  private memberList: Member[] = [];
  private total = 0;
  private queryParams = {
    page: 1,
    limit: 10,
    card_number: '',
    member_name: '',
    level: undefined
  };
  
  private dialogVisible = false;
  private dialogTitle = '';
  private form: Partial<Member> = {
    card_number: '',
    member_name: '',
    phone: '',
    level: 1,
    points: 0,
    register_date: moment().format('YYYY-MM-DD')
  };
  
  private rules = {
    card_number: [{ required: true, message: '请输入会员卡号', trigger: 'blur' }],
    member_name: [{ required: true, message: '请输入会员姓名', trigger: 'blur' }],
    level: [{ required: true, message: '请选择会员等级', trigger: 'change' }],
    register_date: [{ required: true, message: '请选择注册日期', trigger: 'change' }]
  };
  
  // 消费记录相关
  private consumptionDialogVisible = false;
  private consumptionLoading = false;
  private currentMember: Partial<Member> = {};
  private consumptionList: any[] = [];
  
  created() {
    this.getMemberList();
  }
  
  private async getMemberList() {
    this.loading = true;
    try {
      const res = await getMembers(this.queryParams);
      this.memberList = res.data.items || [];
      this.total = res.data.total || 0;
    } catch (error) {
      console.error('获取会员列表失败:', error);
      this.$message.error('获取会员列表失败');
    } finally {
      this.loading = false;
    }
  }
  
  private formatDate(date: string) {
    return moment(date).format('YYYY-MM-DD');
  }
  
  private formatDateTime(date: string) {
    return moment(date).format('YYYY-MM-DD HH:mm:ss');
  }
  
  private getLevelText(level: number) {
    switch (level) {
      case 1: return '普通会员';
      case 2: return '银卡会员';
      case 3: return '金卡会员';
      default: return '未知';
    }
  }
  
  private getLevelType(level: number) {
    switch (level) {
      case 1: return '';
      case 2: return 'success';
      case 3: return 'warning';
      default: return 'info';
    }
  }
  
  private handleQuery() {
    this.queryParams.page = 1;
    this.getMemberList();
  }
  
  private resetQuery() {
    (this.$refs.queryForm as any).resetFields();
    this.handleQuery();
  }
  
  private handleAdd() {
    this.dialogTitle = '添加会员';
    this.form = {
      card_number: '',
      member_name: '',
      phone: '',
      level: 1,
      points: 0,
      register_date: moment().format('YYYY-MM-DD')
    };
    this.dialogVisible = true;
  }
  
  private handleEdit(row: Member) {
    this.dialogTitle = '编辑会员';
    this.form = { ...row };
    this.dialogVisible = true;
  }
  
  private async handleDelete(row: Member) {
    try {
      await this.$confirm('确认删除该会员吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      });
      
      await deleteMember(row.member_id);
      this.$message.success('删除成功');
      this.getMemberList();
    } catch (error) {
      console.error('删除会员失败:', error);
    }
  }
  
  private async submitForm() {
    (this.$refs.form as any).validate(async (valid: boolean) => {
      if (!valid) return;
      
      try {
        if (this.form.member_id) {
          // 更新
          await updateMember(this.form.member_id, this.form);
          this.$message.success('更新成功');
        } else {
          // 新增
          await createMember(this.form);
          this.$message.success('添加成功');
        }
        
        this.dialogVisible = false;
        this.getMemberList();
      } catch (error) {
        console.error('保存会员失败:', error);
        this.$message.error('保存会员失败');
      }
    });
  }
  
  // 查看会员消费记录
  private async handleConsumption(row: Member) {
    this.currentMember = { ...row };
    this.consumptionDialogVisible = true;
    this.getMemberConsumptionList(row.member_id);
  }
  
  private async getMemberConsumptionList(memberId: number) {
    this.consumptionLoading = true;
    try {
      const res = await getMemberConsumption(memberId);
      this.consumptionList = res.data || [];
    } catch (error) {
      console.error('获取会员消费记录失败:', error);
      this.$message.error('获取会员消费记录失败');
    } finally {
      this.consumptionLoading = false;
    }
  }
}
</script>

<style lang="scss" scoped>
.member-container {
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
  
  .member-info {
    background-color: #f5f7fa;
    padding: 15px;
    border-radius: 4px;
    margin-bottom: 20px;
    
    p {
      margin: 5px 0;
    }
  }
  
  .no-data {
    text-align: center;
    color: #909399;
    padding: 30px 0;
  }
}
</style>
