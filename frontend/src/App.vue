<template>
  <div id="app">
    <el-container>
      <el-aside width="200px">
        <el-menu
          :router="true"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF">
          <!-- <el-menu-item index="/dashboard">
              <el-icon><House /></el-icon>
            <span>首页</span>
          </el-menu-item> -->
          <el-menu-item index="/dish">
            <el-icon><Notification /></el-icon>
            <span>菜品列表</span>
          </el-menu-item>
          <el-menu-item index="/category">
            <el-icon><PieChart /></el-icon>
            <span>菜品类别</span>
          </el-menu-item>
          <el-menu-item index="/supplier">
            <el-icon><Compass /></el-icon>
            <span>供应商管理</span>
          </el-menu-item>
          <el-menu-item index="/ingredient">
            <el-icon><Edit /></el-icon>
            <span>原材料管理</span>
          </el-menu-item>
          <el-menu-item index="/order">
            <el-icon><Finished /></el-icon>
            <span>订单管理</span>
          </el-menu-item>
          <el-menu-item index="/inventory">
            <el-icon><MessageBox /></el-icon>
            <span>库存管理</span>
          </el-menu-item>
          <el-menu-item index="/member">
            <el-icon><Crop /></el-icon>
            <span>会员管理</span>
          </el-menu-item>
          <el-menu-item index="/employee">
            <el-icon><ZoomIn /></el-icon>
            <span>员工管理</span>
          </el-menu-item>
          <!-- <el-menu-item index="/statistics">
            <el-icon><Grid /></el-icon>
            <span>统计分析</span>
          </el-menu-item> -->
        </el-menu>
      </el-aside>
      <el-container>
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
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


