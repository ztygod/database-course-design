<template>
  <div class="navbar">
    <div class="left-menu">
      <div class="hamburger-container" @click="toggleSidebar">
        <i :class="['el-icon-s-fold', isCollapse ? 'is-active' : '']"></i>
      </div>
      <div class="breadcrumb-container">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-if="$route.meta && $route.meta.title">{{ $route.meta.title }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>
    
    <div class="right-menu">
      <el-dropdown trigger="click">
        <span class="el-dropdown-link">
          <i class="el-icon-user"></i> 管理员 <i class="el-icon-arrow-down el-icon--right"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item>个人信息</el-dropdown-item>
          <el-dropdown-item>修改密码</el-dropdown-item>
          <el-dropdown-item divided>退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
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
export default class Navbar extends Vue {
  private sidebarCollapsed!: boolean;
  
  get isCollapse(): boolean {
    return this.sidebarCollapsed;
  }
  
  private toggleSidebar(): void {
    this.$store.dispatch('toggleSidebar');
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  
  .left-menu {
    display: flex;
    align-items: center;
    
    .hamburger-container {
      padding: 0 15px;
      cursor: pointer;
      font-size: 20px;
      
      .is-active {
        transform: rotate(180deg);
      }
    }
    
    .breadcrumb-container {
      margin-left: 15px;
    }
  }
  
  .right-menu {
    .el-dropdown-link {
      color: #fff;
      cursor: pointer;
    }
  }
}
</style>
