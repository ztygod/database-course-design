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

<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue'

const props = defineProps<{
  total: number;
  page: number;
  limit: number;
}>()

const emit = defineEmits<{
  (event: 'update:limit', val: number): void;
  (event: 'update:page', val: number): void;
  (event: 'pagination', payload: { page: number; limit: number }): void;
}>()

const currentPage = computed(() => props.page)
const pageSize = computed(() => props.limit)

function handleSizeChange(val: number) {
  emit('update:limit', val)
  emit('pagination', { page: currentPage.value, limit: val })
}

function handleCurrentChange(val: number) {
  emit('update:page', val)
  emit('pagination', { page: val, limit: pageSize.value })
}
</script>

<style lang="scss" scoped>
.pagination-container {
  padding: 15px 0;
  text-align: right;
}
</style>
