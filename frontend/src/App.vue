<template>
  <div id="app">
    <el-container>
      <el-aside width="200px">
        <div class="logo">餐饮管理系统</div>
        <el-menu
          :router="true"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF">
          <el-menu-item index="/dashboard">
            <i class="el-icon-s-home"></i>
            <span>首页</span>
          </el-menu-item>
          <el-submenu index="1">
            <template slot="title">
              <i class="el-icon-dish"></i>
              <span>菜品管理</span>
            </template>
            <el-menu-item index="/dish">菜品列表</el-menu-item>
            <el-menu-item index="/category">菜品类别</el-menu-item>
          </el-submenu>
          <el-menu-item index="/supplier">
            <i class="el-icon-truck"></i>
            <span>供应商管理</span>
          </el-menu-item>
          <el-menu-item index="/ingredient">
            <i class="el-icon-shopping-bag-1"></i>
            <span>原材料管理</span>
          </el-menu-item>
          <el-menu-item index="/order">
            <i class="el-icon-s-order"></i>
            <span>订单管理</span>
          </el-menu-item>
          <el-menu-item index="/inventory">
            <i class="el-icon-box"></i>
            <span>库存管理</span>
          </el-menu-item>
          <el-menu-item index="/member">
            <i class="el-icon-user"></i>
            <span>会员管理</span>
          </el-menu-item>
          <el-menu-item index="/employee">
            <i class="el-icon-user-solid"></i>
            <span>员工管理</span>
          </el-menu-item>
          <el-menu-item index="/statistics">
            <i class="el-icon-data-analysis"></i>
            <span>统计分析</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header>
          <div class="header-right">
            <span>管理员</span>
            <el-dropdown>
              <span class="el-dropdown-link">
                <i class="el-icon-user"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item>个人信息</el-dropdown-item>
                <el-dropdown-item>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </el-header>
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif;
}

#app {
  height: 100vh;
}

.el-container {
  height: 100%;
}

.el-aside {
  background-color: #304156;
  color: #fff;
}

.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  background-color: #2b3649;
}

.el-header {
  background-color: #fff;
  color: #333;
  line-height: 60px;
  border-bottom: 1px solid #e6e6e6;
}

.header-right {
  float: right;
  display: flex;
  align-items: center;
}

.header-right span {
  margin-right: 10px;
}

.el-main {
  background-color: #f0f2f5;
  padding: 20px;
}
</style>
