<template>
  <div class="member-list">
    <div class="page-header">
      <h2>会员管理</h2>
      <el-button type="primary" @click="handleAdd">添加会员</el-button>
    </div>
    
    <el-card shadow="hover" class="filter-container">
      <el-form :inline="true" :model="queryParams" ref="queryForm">
        <el-form-item label="会员姓名">
          <el-input v-model="queryParams.member_name" placeholder="请输入会员姓名" clearable></el-input>
        </el-form-item>
        <el-form-item label="会员卡号">
          <el-input v-model="queryParams.card_number" placeholder="请输入会员卡号" clearable></el-input>
        </el-form-item>
        <el-form-item label="会员等级">
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
        <el-table-column prop="card_number" label="会员卡号" width="120"></el-table-column>
        <el-table-column prop="member_name" label="会员姓名" min-width="100"></el-table-column>
        <el-table-column prop="gender" label="性别" width="60" align="center">
          <template slot-scope="scope">
            {{ scope.row.gender === 'M' ? '男' : (scope.row.gender === 'F' ? '女' : '未知') }}
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="联系电话" min-width="120"></el-table-column>
        <el-table-column prop="level" label="会员等级" width="100">
          <template slot-scope="scope">
            <el-tag :type="getLevelType(scope.row.level)">
              {{ getLevelName(scope.row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="points" label="积分" width="80" align="center"></el-table-column>
        <el-table-column prop="register_date" label="注册日期" width="120">
          <template slot-scope="scope">
            {{ scope.row.register_date | formatDate }}
          </template>
        </el-table-column>
        <el-table-column prop="birthday" label="生日" width="120">
          <template slot-scope="scope">
            {{ scope.row.birthday | formatDate }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="mini" type="info" @click="handleConsumption(scope.row)">消费记录</el-button>
            <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
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
    
    <!-- 添加/编辑会员对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="会员卡号" prop="card_number">
          <el-input v-model="form.card_number" placeholder="请输入会员卡号"></el-input>
        </el-form-item>
        <el-form-item label="会员姓名" prop="member_name">
          <el-input v-model="form.member_name" placeholder="请输入会员姓名"></el-input>
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="form.gender">
            <el-radio label="M">男</el-radio>
            <el-radio label="F">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入联系电话"></el-input>
        </el-form-item>
        <el-form-item label="会员等级" prop="level">
          <el-select v-model="form.level" placeholder="请选择会员等级" style="width: 100%;">
            <el-option label="普通会员" :value="1"></el-option>
            <el-option label="银卡会员" :value="2"></el-option>
            <el-option label="金卡会员" :value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="积分" prop="points">
          <el-input-number v-model="form.points" :min="0" :step="100" style="width: 100%;"></el-input-number>
        </el-form-item>
        <el-form-item label="生日" prop="birthday">
          <el-date-picker
            v-model="form.birthday"
            type="date"
            placeholder="选择日期"
            value-format="yyyy-MM-dd"
            style="width: 100%;">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input type="textarea" v-model="form.address" placeholder="请输入地址"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </div>
    </el-dialog>
    
    <!-- 会员消费记录对话框 -->
    <el-dialog title="会员消费记录" :visible.sync="consumptionDialogVisible" width="800px">
      <div v-if="currentMember" class="member-info">
        <p><strong>会员：</strong>{{ currentMember.member_name }}</p>
        <p><strong>卡号：</strong>{{ currentMember.card_number }}</p>
        <p><strong>等级：</strong>
          <el-tag :type="getLevelType(currentMember.level)">
            {{ getLevelName(currentMember.level) }}
          </el-tag>
        </p>
        <p><strong>积分：</strong>{{ currentMember.points }}</p>
      </div>
      
      <el-table
        v-loading="consumptionLoading"
        :data="consumptionList"
        border
        style="width: 100%; margin-top: 20px;">
        <el-table-column prop="order_number" label="订单号" width="180"></el-table-column>
        <el-table-column prop="order_time" label="消费时间" width="180">
          <template slot-scope="scope">
            {{ scope.row.order_time | formatDateTime }}
          </template>
        </el-table-column>
        <el-table-column prop="total_amount" label="消费金额" width="120">
          <template slot-scope="scope">
            {{ scope.row.total_amount | formatMoney }} 元
          </template>
        </el-table-column>
        <el-table-column prop="points_earned" label="获得积分" width="100" align="center"></el-table-column>
        <el-table-column prop="payment_method" label="支付方式" width="100"></el-table-column>
        <el-table-column prop="notes" label="备注" min-width="150"></el-table-column>
      </el-table>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="consumptionDialogVisible = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getMembers, getMember, createMember, updateMember, deleteMember, getMemberConsumption } from '@/api/member';

export default {
  name: 'MemberIndex',
  data() {
    return {
      loading: false,
      memberList: [],
      total: 0,
      queryParams: {
        page: 1,
        limit: 10,
        member_name: '',
        card_number: '',
        level: ''
      },
      
      dialogVisible: false,
      dialogTitle: '',
      form: {
        card_number: '',
        member_name: '',
        gender: 'M',
        phone: '',
        level: 1,
        points: 0,
        birthday: '',
        email: '',
        address: ''
      },
      
      rules: {
        card_number: [{ required: true, message: '请输入会员卡号', trigger: 'blur' }],
        member_name: [{ required: true, message: '请输入会员姓名', trigger: 'blur' }],
        phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
        level: [{ required: true, message: '请选择会员等级', trigger: 'change' }]
      },
      
      consumptionDialogVisible: false,
      consumptionLoading: false,
      currentMember: null,
      consumptionList: []
    }
  },
  created() {
    this.getMemberList();
  },
  methods: {
    async getMemberList() {
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
    },
    
    getLevelName(level) {
      switch (level) {
        case 1: return '普通会员';
        case 2: return '银卡会员';
        case 3: return '金卡会员';
        default: return '未知';
      }
    },
    
    getLevelType(level) {
      switch (level) {
        case 1: return '';
        case 2: return 'success';
        case 3: return 'warning';
        default: return 'info';
      }
    },
    
    handleQuery() {
      this.queryParams.page = 1;
      this.getMemberList();
    },
    
    resetQuery() {
      this.queryParams = {
        page: 1,
        limit: 10,
        member_name: '',
        card_number: '',
        level: ''
      };
      this.getMemberList();
    },
    
    handleSizeChange(val) {
      this.queryParams.limit = val;
      this.getMemberList();
    },
    
    handleCurrentChange(val) {
      this.queryParams.page = val;
      this.getMemberList();
    },
    
    handleAdd() {
      this.dialogTitle = '添加会员';
      this.form = {
        card_number: '',
        member_name: '',
        gender: 'M',
        phone: '',
        level: 1,
        points: 0,
        birthday: '',
        email: '',
        address: ''
      };
      this.dialogVisible = true;
    },
    
    handleEdit(row) {
      this.dialogTitle = '编辑会员';
      this.form = JSON.parse(JSON.stringify(row));
      this.dialogVisible = true;
    },
    
    async handleDelete(row) {
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
    },
    
    async handleConsumption(row) {
      this.currentMember = row;
      this.consumptionDialogVisible = true;
      this.consumptionLoading = true;
      this.consumptionList = [];
      
      try {
        const res = await getMemberConsumption(row.member_id);
        this.consumptionList = res.data || [];
      } catch (error) {
        console.error('获取会员消费记录失败:', error);
        this.$message.error('获取会员消费记录失败');
      } finally {
        this.consumptionLoading = false;
      }
    },
    
    submitForm() {
      this.$refs.form.validate(async valid => {
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
  }
}
</script>

<style scoped>
.member-list {
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

.member-info {
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.member-info p {
  margin: 8px 0;
}
</style>
