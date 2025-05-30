<template>
  <div class="footer">
    餐饮经营管理系统 &copy; {{ currentYear }} 数据库课程设计
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class Footer extends Vue {
  get currentYear(): number {
    return new Date().getFullYear();
  }
}
</script>

<style lang="scss" scoped>
.footer {
  text-align: center;
  font-size: 14px;
  color: #666;
}
</style>
