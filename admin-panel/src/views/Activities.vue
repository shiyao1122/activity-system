<template>
  <div>
    <div class="header-actions">
      <h2>{{ $t('app.activities') }}</h2>
      <el-button type="primary" @click="openCreateDialog">{{ $t('app.createActivity') }}</el-button>
    </div>

    <el-table :data="activities" style="width: 100%">
      <el-table-column prop="id" :label="$t('activity.id')" width="80" />
      <el-table-column prop="name" :label="$t('activity.name')" />
      <el-table-column prop="startTime" :label="$t('activity.startTime')" width="200" />
      <el-table-column prop="endTime" :label="$t('activity.endTime')" width="200" />
      <el-table-column prop="status" :label="$t('activity.status')" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 'ACTIVE' ? 'success' : 'info'">
            {{ scope.row.status === 'ACTIVE' ? $t('activity.active') : (scope.row.status === 'DRAFT' ? $t('activity.draft') : $t('activity.ended')) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('app.actions')" width="400">
        <template #default="scope">
          <el-button size="small" @click="$router.push(`/dashboard/${scope.row.id}`)">{{ $t('app.dashboard') }}</el-button>
          <el-button size="small" @click="$router.push(`/tasks/${scope.row.id}`)">{{ $t('app.tasks') }}</el-button>
          <el-button size="small" type="success" @click="cloneActivity(scope.row)">{{ $t('app.clone') }}</el-button>
          <el-button size="small" type="primary" v-if="scope.row.status === 'DRAFT'" @click="openEditDialog(scope.row)">{{ $t('app.edit') }}</el-button>
          <el-button size="small" type="danger" v-if="scope.row.status === 'DRAFT'" @click="deleteActivity(scope.row)">{{ $t('app.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="showDialog" :title="isEdit ? $t('app.updateActivity') : $t('app.createActivity')">
      <el-form :model="form" label-width="120px">
        <el-form-item :label="$t('activity.name')">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item :label="$t('activity.timeRange')">
          <el-date-picker
            v-model="form.timeRange"
            type="datetimerange"
            range-separator="To"
            start-placeholder="Start date"
            end-placeholder="End date"
          />
        </el-form-item>
        <el-form-item :label="$t('activity.status')">
          <el-select v-model="form.status">
            <el-option :label="$t('activity.draft')" value="DRAFT" />
            <el-option :label="$t('activity.active')" value="ACTIVE" />
            <el-option :label="$t('activity.ended')" value="ENDED" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showDialog = false">{{ $t('app.cancel') }}</el-button>
          <el-button type="primary" @click="submitActivity">{{ $t('app.confirm') }}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../api';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();
const isZh = ref(locale.value === 'zh'); // Simple check
const activities = ref([]);
const showDialog = ref(false);
const isEdit = ref(false);
const form = ref({
  id: null,
  name: '',
  timeRange: [],
  status: 'DRAFT',
});

const fetchActivities = async () => {
  try {
    const res = await api.get('/activity');
    activities.value = res.data;
  } catch (error) {
    console.error(error);
  }
};

const openCreateDialog = () => {
  isEdit.value = false;
  form.value = { name: '', timeRange: [], status: 'DRAFT' };
  showDialog.value = true;
};

const openEditDialog = (row) => {
  isEdit.value = true;
  form.value = {
    id: row.id,
    name: row.name,
    timeRange: [new Date(row.startTime), new Date(row.endTime)],
    status: row.status,
  };
  showDialog.value = true;
};

const submitActivity = async () => {
  try {
    const payload = {
      name: form.value.name,
      startTime: form.value.timeRange[0],
      endTime: form.value.timeRange[1],
      status: form.value.status,
    };

    if (isEdit.value) {
      await api.put(`/activity/${form.value.id}`, payload);
      ElMessage.success(t('app.updateActivity') + ' Success');
    } else {
      await api.post('/activity', payload);
      ElMessage.success(t('app.createActivity') + ' Success');
    }
    showDialog.value = false;
    fetchActivities();
  } catch (error) {
    ElMessage.error(error.response?.data?.error || error.message);
  }
};

const deleteActivity = (row) => {
  ElMessageBox.confirm(
    t('app.deleteConfirm'),
    'Warning',
    {
      confirmButtonText: t('app.confirm'),
      cancelButtonText: t('app.cancel'),
      type: 'warning',
    }
  ).then(async () => {
    try {
      await api.delete(`/activity/${row.id}`);
      ElMessage.success(t('app.delete') + ' Success');
      fetchActivities();
    } catch (error) {
      ElMessage.error(error.response?.data?.error || error.message);
    }
  });
};

const cloneActivity = async (row) => {
  ElMessageBox.confirm(
    t('app.cloneConfirm').replace('this activity', `"${row.name}"`).replace('该活动', `"${row.name}"`), // Crude replacement, ideally use named params in i18n
    'Warning',
    {
      confirmButtonText: t('app.confirm'),
      cancelButtonText: t('app.cancel'),
      type: 'info',
    }
  ).then(async () => {
    try {
      await api.post(`/activity/${row.id}/clone`);
      ElMessage.success(t('app.cloneSuccess'));
      fetchActivities();
    } catch (error) {
      ElMessage.error(error.response?.data?.error || error.message);
    }
  });
};

onMounted(fetchActivities);
</script>

<style scoped>
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
</style>
