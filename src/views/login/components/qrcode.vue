<template>
  <el-form v-show="getShow">
    <h3 class="title">二维码登录</h3>
    <el-divider>扫描二维码登录</el-divider>
    <div style="padding: 0px 0px 20px 0px;">
      <el-button plain size="large" style="width:100%;" @click="handleBackLogin">
        <span>返回</span>
      </el-button>
    </div>
  </el-form>
</template>

<script setup lang="ts">
import { LoginStateEnum, useLoginState } from './loginState';

const { getLoginState, handleBackLogin } = useLoginState();
const getShow = computed(() => unref(getLoginState) === LoginStateEnum.QR_CODE);
</script>

<style lang="scss" scoped>

</style>
