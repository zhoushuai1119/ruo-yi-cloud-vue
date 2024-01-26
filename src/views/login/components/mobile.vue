<template>
  <el-form v-show="getShow" ref="smsLoginRef" :model="smsLoginForm" :rules="smsLoginRules">
    <h3 class="title">RuoYi-Cloud-Plus多租户管理系统</h3>
    <el-form-item prop="tenantId" v-if="tenantEnabled">
      <el-select v-model="smsLoginForm.tenantId" filterable placeholder="请选择/输入公司名称" style="width: 100%">
        <el-option v-for="item in tenantList" :key="item.tenantId" :label="item.companyName" :value="item.tenantId"></el-option>
        <template #prefix>
          <svg-icon icon-class="company" class="el-input__icon input-icon" />
        </template>
      </el-select>
    </el-form-item>
    <el-form-item prop="phonenumber">
      <el-input v-model="smsLoginForm.phonenumber" type="text" size="large" auto-complete="off" placeholder="请输入手机号">
        <template #prefix>
          <svg-icon icon-class="phone" class="el-input__icon input-icon" />
        </template>
      </el-input>
    </el-form-item>
    <el-form-item prop="smsCode">
      <el-row style="width: 100%">
        <el-col>
          <el-input v-model="smsLoginForm.smsCode" prefix-icon="el-icon-circle-check" placeholder="请输入验证码">
            <template #append>
              <span v-if="mobileCodeTimer <= 0" @click="sendSmsCode">获取验证码</span>
              <span v-if="mobileCodeTimer > 0">{{ mobileCodeTimer }}秒后可重新获取</span>
            </template>
          </el-input>
        </el-col>
      </el-row>
    </el-form-item>
    <el-form-item style="padding: 10px 0px 0px 0px;">
      <el-button :loading="loading" size="large" type="primary" style="width:100%;" @click.prevent="handleLogin">
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
import { smsCode } from "@/api/system/sms";
import { LoginData, TenantVO } from '@/api/types';
import { to } from "await-to-js";

const mobileCodeTimer = ref(0);
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
  grantType: 'sms',
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

const sendSmsCode = async () => {
  let phonenumber = smsLoginForm.value.phonenumber;
  console.log('发送短信验证码手机号为:', phonenumber);
  await smsCode(phonenumber as string).then(async () => {
    ElMessage.success('短信验证码已发送!');
    // 设置倒计时
    mobileCodeTimer.value = 60;
    let msgTimer = setInterval(() => {
      mobileCodeTimer.value = mobileCodeTimer.value - 1;
      if (mobileCodeTimer.value <= 0) {
        clearInterval(msgTimer);
      }
    }, 1000);
  });
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

//检测租户选择框的变化
watch(() => smsLoginForm.value.tenantId, () => {
  localStorage.setItem("tenantId", String(smsLoginForm.value.tenantId))
});

onMounted(() => {
  initTenantList();
});
</script>
