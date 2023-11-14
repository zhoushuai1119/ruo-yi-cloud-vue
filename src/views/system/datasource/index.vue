<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="search" v-show="showSearch">
        <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
          <el-form-item label="租户" prop="tenantId" v-if="tenantEnabled">
            <el-select v-model="queryParams.tenantId" placeholder="请选择租户" clearable style="width: 240px">
              <el-option v-for="item in tenantList" :key="item.tenantId" :label="item.companyName" :value="item.tenantId"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </transition>

    <el-card shadow="never">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['system:datasource:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['system:datasource:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['system:datasource:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['system:datasource:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="datasourceList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="租户编号" align="center" prop="tenantId" />
        <el-table-column label="数据源名称" align="center" prop="name" />
        <el-table-column label="数据库驱动" align="center" prop="driverClassName" />
        <el-table-column label="数据库连接地址" align="center" prop="url" />
        <el-table-column label="数据库用户名" align="center" prop="userName" />
        <el-table-column label="数据库密码" align="center" prop="password" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:datasource:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:datasource:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination
          v-show="total>0"
          :total="total"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          @pagination="getList"
      />
    </el-card>
    <!-- 添加或修改多数据源配置对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" @close="cancel" append-to-body>
      <el-form ref="datasourceFormRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="租户" prop="tenantId" v-if="tenantEnabled">
          <el-select v-model="form.tenantId" :disabled="dialog.isEdit" placeholder="请选择租户" clearable style="width: 240px">
            <el-option v-for="item in tenantList" :key="item.tenantId" :label="item.companyName" :value="item.tenantId"/>
          </el-select>
        </el-form-item>
        <el-form-item label="数据源名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入数据源名称" />
        </el-form-item>
        <el-form-item label="数据库驱动" prop="driverClassName">
          <el-input v-model="form.driverClassName" placeholder="请输入数据库驱动" />
        </el-form-item>
        <el-form-item label="数据库连接地址" prop="url">
          <el-input v-model="form.url" placeholder="请输入数据库连接地址" />
        </el-form-item>
        <el-form-item label="数据库用户名" prop="userName">
          <el-input v-model="form.userName" placeholder="请输入数据库用户名" />
        </el-form-item>
        <el-form-item label="数据库密码" prop="password">
          <el-input v-model="form.password" placeholder="请输入数据库密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Datasource" lang="ts">
import {getDatasource, delDatasource, addDatasource, updateDatasource, listDatasource} from '@/api/system/datasource';
import { DatasourceVO, DatasourceQuery, DatasourceForm } from '@/api/system/datasource/types';
import {getTenantList} from "@/api/login";
import {TenantVO} from "@/api/types";

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const datasourceList = ref<DatasourceVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
// 租户开关
const tenantEnabled = ref(true);
// 租户列表
const tenantList = ref<TenantVO[]>([]);

const queryFormRef = ref<ElFormInstance>();
const datasourceFormRef = ref<ElFormInstance>();

const dialog = reactive<EditDialogOption>({
  visible: false,
  title: '',
  isEdit: false,
});

const initFormData: DatasourceForm = {
  id: undefined,
  tenantId: undefined,
  name: undefined,
  driverClassName: undefined,
  url: undefined,
  userName: undefined,
  password: undefined,
}
const data = reactive<PageData<DatasourceForm, DatasourceQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    tenantId: undefined,
    name: undefined,
    driverClassName: undefined,
    url: undefined,
    userName: undefined,
    password: undefined
  },
  rules: {
    id: [
      { required: true, message: "主键ID不能为空", trigger: "blur" }
    ],
    tenantId: [
      { required: true, message: "租户不能为空", trigger: "blur" }
    ],
    name: [
      { required: true, message: "数据源名称不能为空", trigger: "blur" }
    ],
    driverClassName: [
      { required: true, message: "数据库驱动不能为空", trigger: "blur" }
    ],
    url: [
      { required: true, message: "数据库连接地址不能为空", trigger: "blur" }
    ],
    userName: [
      { required: true, message: "数据库用户名不能为空", trigger: "blur" }
    ],
    password: [
      { required: true, message: "数据库密码不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询多数据源配置列表 */
const getList = async () => {
  loading.value = true;
  const res = await listDatasource(queryParams.value);
  datasourceList.value = res.rows;
  total.value = res.total;
  loading.value = false;
}

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
  dialog.isEdit = false;
}

/** 表单重置 */
const reset = () => {
  form.value = {...initFormData};
  datasourceFormRef.value?.resetFields();
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
}

/** 多选框选中数据 */
const handleSelectionChange = (selection: DatasourceVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/**
 * 获取租户列表
 */
const initTenantList = async () => {
  const { data } = await getTenantList();
  tenantEnabled.value = data.tenantEnabled === undefined ? true : data.tenantEnabled;
  if (tenantEnabled.value) {
    tenantList.value = data.voList;
  }
}

/** 新增按钮操作 */
const handleAdd = () => {
  dialog.visible = true;
  dialog.title = "添加多数据源配置";
  nextTick(() => {
    reset();
  });
}

/** 修改按钮操作 */
const handleUpdate = (row?: DatasourceVO) => {
  loading.value = true
  dialog.visible = true;
  dialog.isEdit = true;
  dialog.title = "修改多数据源配置";
  nextTick(async () => {
    reset();
    const _id = row?.id || ids.value[0]
    const res = await getDatasource(_id);
    loading.value = false;
    Object.assign(form.value, res.data);
  });
}

/** 提交按钮 */
const submitForm = () => {
  datasourceFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateDatasource(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addDatasource(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("修改成功");
      dialog.visible = false;
      dialog.isEdit = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: DatasourceVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除多数据源配置编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delDatasource(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('system/datasource/export', {
    ...queryParams.value
  }, `datasource_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
  initTenantList();
});
</script>
