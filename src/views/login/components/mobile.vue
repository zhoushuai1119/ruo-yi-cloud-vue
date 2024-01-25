<template>
  <el-form v-show="getShow">
    <h3 class="title">手机号登录</h3>
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
const getShow = computed(() => unref(getLoginState) === LoginStateEnum.MOBILE);
</script>

<style lang="scss" scoped>

</style>
