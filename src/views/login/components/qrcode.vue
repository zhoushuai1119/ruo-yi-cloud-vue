<template>
  <el-form v-show="getShow">
    <h3 class="title">二维码登录</h3>
    <div class="login-scan-container">
      <qrcode-vue :value="qrCodeUrl" :size="300" level="H"></qrcode-vue>
    </div>
    <el-divider>扫描二维码登录</el-divider>
    <div style="padding: 0px 0px 20px 0px;">
      <el-button plain size="large" style="width:100%;" @click="handleBackLogin">
        <span>返回</span>
      </el-button>
    </div>
  </el-form>
</template>

<script setup lang="ts">
import QrcodeVue from 'qrcode.vue';
import { LoginStateEnum, useLoginState } from './loginState';

const { getLoginState, handleBackLogin } = useLoginState();
const getShow = computed(() => unref(getLoginState) === LoginStateEnum.QR_CODE);

const qrCodeUrl = ref('www.baidu.con');
</script>

<style lang="scss" scoped>
.login-scan-container {
  padding: 0 20px 20px;
  text-align: center;
}
</style>
