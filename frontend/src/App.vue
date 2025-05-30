<template>
  <div id="app">
    <el-container style="height: 100vh;">
      <el-aside width="200px">
        <sidebar />
      </el-aside>
      
      <el-container>
        <el-header>
          <navbar />
        </el-header>
        
        <el-main>
          <router-view />
        </el-main>
        
        <el-footer>
          <app-footer />
        </el-footer>
      </el-container>
    </el-container>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Sidebar from '@/components/layout/Sidebar.vue';
import Navbar from '@/components/layout/Navbar.vue';
import AppFooter from '@/components/layout/Footer.vue';

@Component({
  components: {
    Sidebar,
    Navbar,
    AppFooter
  }
})
export default class App extends Vue {}
</script>

<style lang="scss">
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif;
}

#app {
  height: 100%;
}

.el-header {
  background-color: #409EFF;
  color: #fff;
  line-height: 60px;
}

.el-aside {
  background-color: #545c64;
  color: #fff;
}

.el-footer {
  background-color: #f2f2f2;
  color: #666;
  line-height: 60px;
  text-align: center;
}

.el-main {
  padding: 20px;
  background-color: #f5f7fa;
}
</style>
