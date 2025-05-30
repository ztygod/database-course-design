<template>
  <div class="pagination-container">
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="currentPage"
      :page-sizes="[10, 20, 30, 50]"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

@Component
export default class Pagination extends Vue {
  @Prop({ required: true }) readonly total!: number;
  @Prop({ default: 1 }) readonly page!: number;
  @Prop({ default: 10 }) readonly limit!: number;
  
  get currentPage(): number {
    return this.page;
  }
  
  get pageSize(): number {
    return this.limit;
  }
  
  handleSizeChange(val: number) {
    this.$emit('update:limit', val);
    this.$emit('pagination', { page: this.currentPage, limit: val });
  }
  
  handleCurrentChange(val: number) {
    this.$emit('update:page', val);
    this.$emit('pagination', { page: val, limit: this.pageSize });
  }
}
</script>

<style lang="scss" scoped>
.pagination-container {
  padding: 15px 0;
  text-align: right;
}
</style>
