<template>
  <div>
    <div class="header-actions">
      <h2>{{ $t('app.tasks') }} - {{ $t('activity.id') }} {{ activityId }}</h2>
      <el-button type="primary" @click="openCreateDialog" v-if="activityStatus === 'DRAFT'">{{ $t('task.createTask') }}</el-button>
    </div>

    <el-table :data="tasks" style="width: 100%">
      <el-table-column prop="id" :label="$t('activity.id')" width="80" />
      <el-table-column prop="groupName" :label="$t('task.groupName')" />
      <el-table-column prop="targetGroupName" :label="$t('task.targetGroupName')" />
      <el-table-column prop="points" :label="$t('task.points')" />
      <el-table-column prop="dailyLimit" :label="$t('task.dailyLimit')" />
      <el-table-column prop="totalLimit" :label="$t('task.totalLimit')" />
      <el-table-column prop="descJson" :label="$t('task.descJson')" show-overflow-tooltip />
      <el-table-column :label="$t('app.actions')" width="200">
        <template #default="scope">
          <el-button size="small" type="primary" v-if="activityStatus === 'DRAFT'" @click="openEditDialog(scope.row)">{{ $t('app.edit') }}</el-button>
          <el-button size="small" type="danger" v-if="activityStatus === 'DRAFT'" @click="deleteTask(scope.row)">{{ $t('app.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="showDialog" :title="isEdit ? $t('app.updateTask') : $t('task.createTask')">
      <el-form :model="form" label-width="120px">
        <el-form-item :label="$t('task.groupName')">
          <el-input v-model="form.groupName" placeholder="e.g. register, login" />
        </el-form-item>
        <el-form-item :label="$t('task.targetGroupName')">
          <el-input v-model="form.targetGroupName" placeholder="Optional: e.g. register (for invite tasks)" />
        </el-form-item>
        <el-form-item :label="$t('task.points')">
          <el-input-number v-model="form.points" />
        </el-form-item>
        <el-form-item :label="$t('task.dailyLimit')">
          <el-input-number v-model="form.dailyLimit" :min="0" />
          <span class="hint">{{ $t('task.unlimited') }}</span>
        </el-form-item>
        <el-form-item :label="$t('task.totalLimit')">
          <el-input-number v-model="form.totalLimit" :min="0" />
          <span class="hint">{{ $t('task.unlimited') }}</span>
        </el-form-item>
        <el-form-item :label="$t('task.descJson')">
          <el-input v-model="form.descJson" type="textarea" placeholder='{"en": "Follow Twitter", "zh": "关注推特"}' />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showDialog = false">{{ $t('app.cancel') }}</el-button>
          <el-button type="primary" @click="submitTask">{{ $t('app.confirm') }}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useRoute } from 'vue-router';
import api from '../api';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const route = useRoute();
const activityId = route.params.activityId;
const tasks = ref([]);
const activityStatus = ref('');
const showDialog = ref(false);
const isEdit = ref(false);
const form = ref({
  id: null,
  groupName: '',
  targetGroupName: '',
  points: 0,
  dailyLimit: 0,
  totalLimit: 0,
  descJson: '',
});

const fetchActivity = async () => {
  try {
    const res = await api.get(`/activity/${activityId}`);
    activityStatus.value = res.data.status;
  } catch (error) {
    console.error(error);
  }
};

const fetchTasks = async () => {
  try {
    const res = await api.get('/task', { params: { activityId } });
    tasks.value = res.data;
  } catch (error) {
    console.error(error);
  }
};

const openCreateDialog = () => {
  isEdit.value = false;
  form.value = { groupName: '', targetGroupName: '', points: 0, dailyLimit: 0, totalLimit: 0, descJson: '' };
  showDialog.value = true;
};

const openEditDialog = (row) => {
  isEdit.value = true;
  form.value = {
    id: row.id,
    groupName: row.groupName,
    targetGroupName: row.targetGroupName || '',
    points: row.points,
    dailyLimit: row.dailyLimit,
    totalLimit: row.totalLimit,
    descJson: row.descJson,
  };
  showDialog.value = true;
};

const submitTask = async () => {
  try {
    const payload = {
      activityId: parseInt(activityId),
      groupName: form.value.groupName,
      targetGroupName: form.value.targetGroupName || null,
      points: form.value.points,
      dailyLimit: form.value.dailyLimit,
      totalLimit: form.value.totalLimit,
      descJson: form.value.descJson,
    };

    if (isEdit.value) {
      await api.put(`/task/${form.value.id}`, payload);
      ElMessage.success(t('app.updateTask') + ' Success');
    } else {
      await api.post('/task', payload);
      ElMessage.success(t('task.createTask') + ' Success');
    }
    showDialog.value = false;
    fetchTasks();
  } catch (error) {
    ElMessage.error(error.response?.data?.error || error.message);
  }
};

const deleteTask = (row) => {
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
      await api.delete(`/task/${row.id}`);
      ElMessage.success(t('app.delete') + ' Success');
      fetchTasks();
    } catch (error) {
      ElMessage.error(error.response?.data?.error || error.message);
    }
  });
};

onMounted(() => {
  fetchActivity();
  fetchTasks();
});
</script>

<style scoped>
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.hint {
  font-size: 12px;
  color: #999;
  margin-left: 10px;
}
</style>
