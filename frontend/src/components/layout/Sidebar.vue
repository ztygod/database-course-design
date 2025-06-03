<template>
  <div class="sidebar-container">
    <el-menu
      :default-active="activeMenu"
      class="el-menu-vertical"
      :collapse="isCollapse"
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#ffd04b"
      router>
      
      <el-menu-item index="/dashboard">
        <i class="el-icon-s-home"></i>
        <span slot="title">首页</span>
      </el-menu-item>
      
      <el-submenu index="/dish">
        <template slot="title">
          <i class="el-icon-dish"></i>
          <span>菜品管理</span>
        </template>
        <el-menu-item index="/dish/list">菜品列表</el-menu-item>
        <el-menu-item index="/dish/category">菜品类别</el-menu-item>
      </el-submenu>
      
      <el-submenu index="/ingredient">
        <template slot="title">
          <i class="el-icon-shopping-cart-full"></i>
          <span>原材料管理</span>
        </template>
        <el-menu-item index="/ingredient">原材料列表</el-menu-item>
        <el-menu-item index="/supplier">供应商管理</el-menu-item>
      </el-submenu>
      
      <el-submenu index="/order">
        <template slot="title">
          <i class="el-icon-s-order"></i>
          <span>订单管理</span>
        </template>
        <el-menu-item index="/order/list">订单列表</el-menu-item>
        <el-menu-item index="/order/create">创建订单</el-menu-item>
      </el-submenu>
      
      <el-submenu index="/inventory">
        <template slot="title">
          <i class="el-icon-s-management"></i>
          <span>库存管理</span>
        </template>
        <el-menu-item index="/inventory/record">库存记录</el-menu-item>
        <el-menu-item index="/inventory/warning">库存预警</el-menu-item>
      </el-submenu>
      
      <el-menu-item index="/member">
        <i class="el-icon-user"></i>
        <span slot="title">会员管理</span>
      </el-menu-item>
      
      <el-menu-item index="/employee">
        <i class="el-icon-s-custom"></i>
        <span slot="title">员工管理</span>
      </el-menu-item>
      
      <el-submenu index="/statistics">
        <template slot="title">
          <i class="el-icon-s-data"></i>
          <span>统计分析</span>
        </template>
        <el-menu-item index="/statistics/sales">销售统计</el-menu-item>
        <el-menu-item index="/statistics/member">会员统计</el-menu-item>
        <el-menu-item index="/statistics/inventory">库存统计</el-menu-item>
      </el-submenu>
    </el-menu>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
  computed: {
    ...mapGetters(['sidebarCollapsed'])
  }
})
export default class Sidebar extends Vue {
  private sidebarCollapsed!: boolean;
  
  get isCollapse(): boolean {
    return this.sidebarCollapsed;
  }
  
  get activeMenu(): string {
    const { path } = this.$route;
    return path;
  }
}
</script>

<style lang="scss" scoped>
.sidebar-container {
  height: 100%;
  
  .el-menu-vertical {
    height: 100%;
    border-right: none;
    
    &:not(.el-menu--collapse) {
      width: 200px;
    }
  }
}
</style>
