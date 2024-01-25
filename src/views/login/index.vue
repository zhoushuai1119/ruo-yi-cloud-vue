<template>
  <div class="login">
    <div class="login-form">
      <Password />
      <QrCode />
      <Register />
      <Mobile />
      <div v-if="isAccountLogin">
        <div class="login-state-container">
          <el-button style="flex: 1" plain title="手机登录" @click="setLoginState(LoginStateEnum.MOBILE)">
            <span>手机登录</span>
          </el-button>
          <el-button style="flex: 1;margin: 0" plain title="二维码登录" @click="setLoginState(LoginStateEnum.QR_CODE)">
            <span>二维码登录</span>
          </el-button>
          <el-button style="flex: 1;margin: 0" plain title="注册" @click="setLoginState(LoginStateEnum.REGISTER)">
            <span>注册</span>
          </el-button>
        </div>
        <el-divider>第三方登录</el-divider>
        <div style="text-align: center">
          <el-form-item style="display: inline-block">
            <el-button circle title="微信登录" @click="doSocialLogin('wechat')">
              <svg-icon icon-class="wechat" />
            </el-button>
            <el-button circle title="Gitee登录" @click="doSocialLogin('gitee')">
              <svg-icon icon-class="gitee" />
            </el-button>
            <el-button circle title="Github登录" @click="doSocialLogin('github')">
              <svg-icon icon-class="github" />
            </el-button>
          </el-form-item>
        </div>
      </div>
    </div>
    <!--  底部  -->
    <div class="el-login-footer">
      <span>Copyright © 2018-2023 shuai.zhou All Rights Reserved.</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import {authBinding} from '@/api/system/social/auth';
import {HttpStatus} from "@/enums/RespEnum";
import {LoginStateEnum, useLoginState} from './components/loginState';

import Password from './components/password.vue';
import QrCode from './components/qrcode.vue';
import Register from './components/register.vue';
import Mobile from './components/mobile.vue';

const {getLoginState, setLoginState} = useLoginState();

// 是否是账号密码登录
const isAccountLogin = computed(() => unref(getLoginState) === LoginStateEnum.LOGIN);

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
