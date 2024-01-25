<template>
  <div class="login">
    <div class="login-form">
      <h3 class="title">RuoYi-Cloud-Plus多租户管理系统</h3>
      <Password />
      <QrCode />
      <el-form-item style="padding: 0px 0px 15px 0px;">
        <el-button plain size="large" style="width:100%;" @click="setLoginState(LoginStateEnum.QR_CODE)">
          <span>二维码登录</span>
        </el-button>
      </el-form-item>
      <el-divider>第三方登录</el-divider>
      <div style="text-align: center">
        <el-form-item style="display: inline-block">
          <el-button circle title="微信登录" @click="doSocialLogin('wechat')">
            <svg-icon icon-class="wechat"/>
          </el-button>
          <el-button circle title="Gitee登录" @click="doSocialLogin('gitee')">
            <svg-icon icon-class="gitee"/>
          </el-button>
          <el-button circle title="Github登录" @click="doSocialLogin('github')">
            <svg-icon icon-class="github"/>
          </el-button>
        </el-form-item>
      </div>
    </div>
    <!--  底部  -->
    <div class="el-login-footer">
      <span>Copyright © 2018-2023 shuai.zhou All Rights Reserved.</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { authBinding } from '@/api/system/social/auth';
import { HttpStatus } from "@/enums/RespEnum";
import { LoginStateEnum, useLoginState } from './components/loginState';

import Password from './components/password.vue';
import QrCode from './components/qrcode.vue';

const { setLoginState } = useLoginState();

/**
 * 第三方登录
 * @param type
 */
const doSocialLogin = (type: string) => {
  authBinding(type).then((res: any) => {
    if (res.code === HttpStatus.SUCCESS) {
      // 获取授权地址跳转
      window.location.href = res.data;
    } else {
      ElMessage.error(res.msg);
    }
  });
};
</script>

<style lang="scss" scoped>
.title {
  margin: 0px auto 30px auto;
  text-align: center;
  color: #707070;
}

.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-image: url("@/assets/images/login-background.jpg");
  background-size: cover;
}

.el-login-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #fff;
  font-family: Arial, serif;
  font-size: 12px;
  letter-spacing: 1px;
}
</style>
