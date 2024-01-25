<template>
  <el-form v-show="getShow" ref="smsLoginRef" :model="smsLoginForm" :rules="smsLoginRules">
    <h3 class="title">RuoYi-Cloud-Plus多租户管理系统</h3>
    <el-form-item prop="tenantId" v-if="tenantEnabled">
      <el-select v-model="smsLoginForm.tenantId" filterable placeholder="请选择/输入公司名称" style="width: 100%">
        <el-option v-for="item in tenantList" :key="item.tenantId" :label="item.companyName"
                   :value="item.tenantId"></el-option>
        <template #prefix>
          <svg-icon icon-class="company" class="el-input__icon input-icon"/>
        </template>
      </el-select>
    </el-form-item>
    <el-form-item prop="phonenumber">
      <el-input v-model="smsLoginForm.phonenumber" type="text" size="large" auto-complete="off" placeholder="手机号">
        <template #prefix>
          <svg-icon icon-class="phone" class="el-input__icon input-icon"/>
        </template>
      </el-input>
    </el-form-item>
    <el-form-item prop="smsCode">
      <el-input v-model="smsLoginForm.smsCode" size="large" auto-complete="off" placeholder="验证码" style="width: 63%">
        <template #prefix>
          <svg-icon icon-class="validCode" class="el-input__icon input-icon"/>
        </template>
      </el-input>
    </el-form-item>
    <el-form-item style="padding: 10px 0px 0px 0px;">
      <el-button :loading="loading" size="large" type="primary" style="width:100%;" @click.prevent="loginbtn">
        <span v-if="!loading">登 录</span>
        <span v-else>登 录 中...</span>
      </el-button>
    </el-form-item>
    <div style="padding: 0px 0px 20px 0px;">
      <el-button plain size="large" style="width:100%;" @click="handleBackLogin">
        <span>返回</span>
      </el-button>
    </div>
  </el-form>
</template>

<script setup lang="ts">
import { getTenantList } from '@/api/login';
import { LoginStateEnum, useLoginState } from './loginState';
import { useUserStore } from '@/store/modules/user';
import { LoginData, TenantVO } from '@/api/types';
import "@/assets/styles/captcha/css/tac.css";
import "@/assets/styles/captcha/js/jquery.min.js";
import "@/assets/styles/captcha/js/tac.min.js";
import { to } from "await-to-js";

const userStore = useUserStore();
const router = useRouter();

const {getLoginState, handleBackLogin} = useLoginState();
const getShow = computed(() => unref(getLoginState) === LoginStateEnum.MOBILE);

const redirect = ref(undefined);
const smsLoginRef = ref<ElFormInstance>();
// 租户列表
const tenantList = ref<TenantVO[]>([]);
// 租户开关
const tenantEnabled = ref(true);
const loading = ref(false);

const smsLoginForm = ref<LoginData>({
  tenantId: '000000',
  phonenumber: '17756228281',
  smsCode: '',
  uuid: ''
} as LoginData);

const smsLoginRules: ElFormRules = {
  tenantId: [{required: true, trigger: "blur", message: "请输入您的租户编号"}],
  phonenumber: [{required: true, trigger: 'blur', message: '请输入您的手机号'}],
  smsCode: [{required: true, trigger: 'change', message: '请输入验证码'}]
};

/**
 * 获取租户列表
 */
const initTenantList = async () => {
  const {data} = await getTenantList();
  tenantEnabled.value = data.tenantEnabled === undefined ? true : data.tenantEnabled;
  if (tenantEnabled.value) {
    tenantList.value = data.voList;
    if (tenantList.value != null && tenantList.value.length !== 0) {
      smsLoginForm.value.tenantId = tenantList.value[0].tenantId;
    }
  }
}

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
  smsLoginRef.value?.validate(async (valid: boolean, fields: any) => {
    if (valid) {
      loading.value = true;
      // 否则移除
      localStorage.removeItem("tenantId");
      localStorage.removeItem('phonenumber');
      localStorage.removeItem('smsCode');
      // 调用action的登录方法
      const [err] = await to(userStore.login(smsLoginForm.value));
      if (!err) {
        await router.push({path: redirect.value || '/'});
        loading.value = false;
      } else {
        loading.value = false;
      }
    } else {
      console.log('error submit!', fields);
    }
  });
};

onMounted(() => {
  initTenantList();
});
</script>

<style lang="scss" scoped>

</style>
