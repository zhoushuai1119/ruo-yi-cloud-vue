<template>
  <el-form v-show="getShow" ref="registerRef" :model="registerForm" :rules="registerRules">
    <h3 class="title">RuoYi-Cloud-Plus多租户管理系统</h3>
    <el-form-item prop="tenantId" v-if="tenantEnabled">
      <el-select v-model="registerForm.tenantId" filterable placeholder="请选择/输入公司名称" style="width: 100%">
        <el-option v-for="item in tenantList" :key="item.tenantId" :label="item.companyName"
                   :value="item.tenantId"></el-option>
        <template #prefix>
          <svg-icon icon-class="company" class="el-input__icon input-icon"/>
        </template>
      </el-select>
    </el-form-item>
    <el-form-item prop="username">
      <el-input
        v-model="registerForm.username"
        prefix-icon="User"
        type="text"
        size="large"
        auto-complete="off"
        placeholder="账号">
      </el-input>
    </el-form-item>
    <el-form-item prop="password">
      <el-input
        v-model="registerForm.password"
        prefix-icon="Lock"
        type="password"
        size="large"
        auto-complete="off"
        placeholder="密码"
        @keyup.enter="handleRegister">
      </el-input>
    </el-form-item>
    <el-form-item prop="confirmPassword">
      <el-input
        v-model="registerForm.confirmPassword"
        prefix-icon="Lock"
        type="password"
        size="large"
        auto-complete="off"
        placeholder="确认密码"
        @keyup.enter="handleRegister">
      </el-input>
    </el-form-item>
    <el-form-item prop="code" v-if="captchaEnabled">
      <el-input size="large" v-model="registerForm.code" auto-complete="off" placeholder="验证码" style="width: 63%"
                @keyup.enter="handleRegister">
        <template #prefix>
          <svg-icon icon-class="validCode" class="el-input__icon input-icon"/>
        </template>
      </el-input>
      <div class="register-code">
        <img :src="codeUrl" @click="getCode" class="register-code-img"/>
      </div>
    </el-form-item>
    <el-form-item style="width:100%;">
      <el-button :loading="loading" size="large" type="primary" style="width:100%;" @click.prevent="handleRegister">
        <span v-if="!loading">注 册</span>
        <span v-else>注 册 中...</span>
      </el-button>
    </el-form-item>
    <div style="padding: 0px 0px 20px 0px;">
      <el-button plain size="large" style="width:100%;" @click="handleBackLogin">
        <span>使用已有账户登录</span>
      </el-button>
    </div>
  </el-form>
</template>

<script setup lang="ts">
import { getCodeImg, register, getTenantList } from '@/api/login';
import { LoginStateEnum, useLoginState } from './loginState';
import { RegisterForm, TenantVO } from '@/api/types';
import { to } from 'await-to-js';

const router = useRouter();

const { getLoginState,handleBackLogin } = useLoginState();
const getShow = computed(() => unref(getLoginState) === LoginStateEnum.REGISTER);

const registerForm = ref<RegisterForm>({
  tenantId: '000000',
  username: 'admin',
  password: 'admin123',
  confirmPassword: "admin123",
  code: "",
  uuid: "",
  userType: "sys_user"
});

// 租户开关
const tenantEnabled = ref(true);


const equalToPassword = (rule: any, value: string, callback: any) => {
  if (registerForm.value.password !== value) {
    callback(new Error("两次输入的密码不一致"));
  } else {
    callback();
  }
};

const registerRules: ElFormRules = {
  tenantId: [
    {required: true, trigger: "blur", message: "请输入您的租户编号"}
  ],
  username: [
    {required: true, trigger: "blur", message: "请输入您的账号"},
    {min: 2, max: 20, message: "用户账号长度必须介于 2 和 20 之间", trigger: "blur"}
  ],
  password: [
    {required: true, trigger: "blur", message: "请输入您的密码"},
    {min: 5, max: 20, message: "用户密码长度必须介于 5 和 20 之间", trigger: "blur"}
  ],
  confirmPassword: [
    {required: true, trigger: "blur", message: "请再次输入您的密码"},
    {required: true, validator: equalToPassword, trigger: "blur"}
  ],
  code: [{required: true, trigger: "change", message: "请输入验证码"}]
};
const codeUrl = ref("");
const loading = ref(false);
const captchaEnabled = ref(true);
const registerRef = ref<ElFormInstance>();
// 租户列表
const tenantList = ref<TenantVO[]>([]);

const handleRegister = () => {
  registerRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true;
      const [err] = await to(register(registerForm.value));
      if (!err) {
        const username = registerForm.value.username;
        await ElMessageBox.alert("<font color='red'>恭喜你，您的账号 " + username + " 注册成功！</font>", "系统提示", {
          dangerouslyUseHTMLString: true,
          type: "success",
        });
        await router.push("/login");
      } else {
        loading.value = false;
        if (captchaEnabled) {
          await getCode();
        }
      }
    }
  });
}

const getCode = async () => {
  const res = await getCodeImg();
  const {data} = res;
  captchaEnabled.value = data.captchaEnabled === undefined ? true : data.captchaEnabled;
  if (captchaEnabled.value) {
    codeUrl.value = 'data:image/gif;base64,' + data.img;
    registerForm.value.uuid = data.uuid;
  }
};

const initTenantList = async () => {
  const {data} = await getTenantList();
  tenantEnabled.value = data.tenantEnabled === undefined ? true : data.tenantEnabled;
  if (tenantEnabled.value) {
    tenantList.value = data.voList;
    if (tenantList.value != null && tenantList.value.length !== 0) {
      registerForm.value.tenantId = tenantList.value[0].tenantId;
    }
  }
}

onMounted(() => {
  getCode();
  initTenantList();
})
</script>

<style lang="scss" scoped>
.register-code {
  width: 33%;
  height: 40px;
  float: right;

  img {
    cursor: pointer;
    vertical-align: middle;
  }
}

.register-code-img {
  height: 40px;
  padding-left: 12px;
}
</style>
