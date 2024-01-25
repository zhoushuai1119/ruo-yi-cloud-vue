<template>
  <el-form v-show="getShow">
    11111
    <el-button plain size="large" style="width:100%;" @click="handleBackLogin">
      <span>返回</span>
    </el-button>
  </el-form>
</template>

<script setup lang="ts">
import { LoginStateEnum, useLoginState } from './loginState';

const { getLoginState, handleBackLogin } = useLoginState();
const getShow = computed(() => unref(getLoginState) === LoginStateEnum.QR_CODE);
</script>

<style lang="scss" scoped>

</style>
