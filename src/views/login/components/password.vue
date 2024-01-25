<template>
  <el-form v-show="getShow" ref="loginRef" :model="loginForm" :rules="loginRules">
    <h3 class="title">RuoYi-Cloud-Plus多租户管理系统</h3>
    <el-form-item prop="tenantId" v-if="tenantEnabled">
      <el-select v-model="loginForm.tenantId" filterable placeholder="请选择/输入公司名称" style="width: 100%">
        <el-option v-for="item in tenantList" :key="item.tenantId" :label="item.companyName"
                   :value="item.tenantId"></el-option>
        <template #prefix>
          <svg-icon icon-class="company" class="el-input__icon input-icon"/>
        </template>
      </el-select>
    </el-form-item>
    <el-form-item prop="username">
      <el-input v-model="loginForm.username" type="text" size="large" auto-complete="off" placeholder="账号">
        <template #prefix>
          <svg-icon icon-class="user" class="el-input__icon input-icon"/>
        </template>
      </el-input>
    </el-form-item>
    <el-form-item prop="password">
      <el-input v-model="loginForm.password" type="password" size="large" auto-complete="off" placeholder="密码"
                @keyup.enter="handleLogin">
        <template #prefix>
          <svg-icon icon-class="password" class="el-input__icon input-icon"/>
        </template>
      </el-input>
    </el-form-item>
    <el-form-item prop="code" v-if="captchaEnabled">
      <el-input v-model="loginForm.code" size="large" auto-complete="off" placeholder="验证码" style="width: 63%"
                @keyup.enter="handleLogin">
        <template #prefix>
          <svg-icon icon-class="validCode" class="el-input__icon input-icon"/>
        </template>
      </el-input>
      <div class="login-code">
        <img :src="codeUrl" @click="getCode" class="login-code-img"/>
      </div>
    </el-form-item>
    <el-checkbox v-model="loginForm.rememberMe" style="margin:0px 0px 0px 0px;">记住密码</el-checkbox>
    <el-form-item style="padding: 10px 0px 0px 0px;">
      <el-button :loading="loading" size="large" type="primary" style="width:100%;" @click.prevent="loginbtn">
        <span v-if="!loading">登 录</span>
        <span v-else>登 录 中...</span>
      </el-button>
    </el-form-item>
  </el-form>
  <div id="captcha-div"></div>
</template>

<script setup lang="ts">
import { getCodeImg, getTenantList } from '@/api/login';
import { LoginStateEnum, useLoginState } from './loginState';
import { useUserStore } from '@/store/modules/user';
import { LoginData, TenantVO } from '@/api/types';
import { to } from 'await-to-js';
import "@/assets/styles/captcha/css/tac.css";
import "@/assets/styles/captcha/js/jquery.min.js";
import "@/assets/styles/captcha/js/tac.min.js";

const userStore = useUserStore();
const router = useRouter();

const { getLoginState } = useLoginState();
const getShow = computed(() => unref(getLoginState) === LoginStateEnum.LOGIN);

const loginForm = ref<LoginData>({
  tenantId: '000000',
  username: 'admin',
  password: 'admin123',
  rememberMe: false,
  code: '',
  uuid: ''
} as LoginData);

const loginRules: ElFormRules = {
  tenantId: [{required: true, trigger: "blur", message: "请输入您的租户编号"}],
  username: [{required: true, trigger: 'blur', message: '请输入您的账号'}],
  password: [{required: true, trigger: 'blur', message: '请输入您的密码'}],
  code: [{required: true, trigger: 'change', message: '请输入验证码'}]
};

const codeUrl = ref('');
const loading = ref(false);
// 验证码开关
const captchaEnabled = ref(true);
// 租户开关
const tenantEnabled = ref(true);


const redirect = ref(undefined);
const loginRef = ref<ElFormInstance>();
// 租户列表
const tenantList = ref<TenantVO[]>([]);

watch(() => router.currentRoute.value, (newRoute: any) => {
  redirect.value = newRoute.query && newRoute.query.redirect;
}, {immediate: true});

const loginbtn = () => {
  const config = {
    requestCaptchaDataUrl: import.meta.env.VITE_APP_BASE_API + "/auth/slider/captcha/image?type=RANDOM",
    validCaptchaUrl: import.meta.env.VITE_APP_BASE_API + "/auth/slider/captcha/check",
    bindEl: "#captcha-div",
    // 验证成功回调函数
    validSuccess: (res: any, c: any, tac: any) => {
      handleLogin();
      tac.destroyWindow();
    },
    // 验证失败的回调函数(可忽略; 如果不自定义会使用默认的)
    validFail: (res: any, c: any, tac: any) => {
      console.log('滑块验证码验证失败重新拉取验证码');
      // 验证失败后重新拉取验证码
      tac.reloadCaptcha();
    }
  };
  const style = {
    logoUrl: "src/assets/images/captcha-slider.png"
  };
  new (window as any).TAC(config, style).init();
};

const handleLogin = () => {
  loginRef.value?.validate(async (valid: boolean, fields: any) => {
    if (valid) {
      loading.value = true;
      // 勾选了需要记住密码设置在 localStorage 中设置记住用户名和密码
      if (loginForm.value.rememberMe) {
        localStorage.setItem("tenantId", String(loginForm.value.tenantId));
        localStorage.setItem('username', String(loginForm.value.username));
        localStorage.setItem('password', String(loginForm.value.password));
        localStorage.setItem('rememberMe', String(loginForm.value.rememberMe));
      } else {
        // 否则移除
        localStorage.removeItem("tenantId");
        localStorage.removeItem('username');
        localStorage.removeItem('password');
        localStorage.removeItem('rememberMe');
      }
      // 调用action的登录方法
      const [err] = await to(userStore.login(loginForm.value));
      if (!err) {
        await router.push({path: redirect.value || '/'});
        loading.value = false;
      } else {
        loading.value = false;
        // 重新获取验证码
        if (captchaEnabled.value) {
          await getCode();
        }
      }
    } else {
      console.log('error submit!', fields);
    }
  });
};

/**
 * 获取验证码
 */
const getCode = async () => {
  const res = await getCodeImg();
  const {data} = res;
  captchaEnabled.value = data.captchaEnabled === undefined ? true : data.captchaEnabled;
  if (captchaEnabled.value) {
    codeUrl.value = 'data:image/gif;base64,' + data.img;
    loginForm.value.uuid = data.uuid;
  }
};

const getLoginData = () => {
  const tenantId = localStorage.getItem("tenantId");
  const username = localStorage.getItem('username');
  const password = localStorage.getItem('password');
  const rememberMe = localStorage.getItem('rememberMe');
  loginForm.value = {
    tenantId: tenantId === null ? String(loginForm.value.tenantId) : tenantId,
    username: username === null ? String(loginForm.value.username) : username,
    password: password === null ? String(loginForm.value.password) : String(password),
    rememberMe: rememberMe === null ? false : Boolean(rememberMe)
  } as LoginData;
}


/**
 * 获取租户列表
 */
const initTenantList = async () => {
  const {data} = await getTenantList();
  tenantEnabled.value = data.tenantEnabled === undefined ? true : data.tenantEnabled;
  if (tenantEnabled.value) {
    tenantList.value = data.voList;
    if (tenantList.value != null && tenantList.value.length !== 0) {
      loginForm.value.tenantId = tenantList.value[0].tenantId;
    }
  }
}

//检测租户选择框的变化
watch(() => loginForm.value.tenantId, () => {
  localStorage.setItem("tenantId", String(loginForm.value.tenantId))
});

onMounted(() => {
  getCode();
  initTenantList();
  getLoginData();
});
</script>

<style lang="scss" scoped>
.login-tip {
  font-size: 13px;
  text-align: center;
  color: #bfbfbf;
}

.login-code {
  width: 33%;
  height: 40px;
  float: right;

  img {
    cursor: pointer;
    vertical-align: middle;
  }
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

.login-code-img {
  height: 40px;
  padding-left: 12px;
}

#captcha-div {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
