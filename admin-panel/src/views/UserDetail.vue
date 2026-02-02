<template>
  <div>
    <div class="header-actions">
      <h2>{{ $t('user.userDetails') }}: {{ email }}</h2>
      <el-button @click="$router.back()">{{ $t('app.back') }}</el-button>
    </div>

    <el-card class="user-info">
      <div class="info-item">
        <span class="label">{{ $t('user.activityId') }}:</span> {{ activityId }}
      </div>
      <div class="info-item">
        <span class="label">{{ $t('user.totalPoints') }}:</span> <span class="points">{{ userStatus.totalPoints }}</span>
      </div>
      <el-button type="warning" size="small" @click="showAdjustDialog = true">{{ $t('user.adjustPoints') }}</el-button>
    </el-card>

    <h3>{{ $t('user.taskHistory') }}</h3>
    <el-table :data="userStatus.tasks" style="width: 100%">
      <el-table-column prop="taskName" :label="$t('task.taskName')" />
      <el-table-column prop="description" :label="$t('task.descJson')" />
      <el-table-column prop="points" :label="$t('task.pointsPerTask')" />
      <el-table-column :label="$t('task.completed')">
        <template #default="scope">
          {{ scope.row.completed.daily }} / {{ scope.row.limits.daily || '∞' }} ({{ $t('task.dailyLimit') }}) <br>
          {{ scope.row.completed.total }} / {{ scope.row.limits.total || '∞' }} ({{ $t('task.totalLimit') }})
        </template>
      </el-table-column>
      <el-table-column :label="$t('task.status')">
        <template #default="scope">
          <el-tag :type="scope.row.isFinished ? 'success' : 'info'">
            {{ scope.row.isFinished ? $t('task.finished') : $t('task.inProgress') }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="showAdjustDialog" :title="$t('user.adjustPoints')">
      <el-form :model="adjustForm" label-width="120px">
        <el-form-item :label="$t('task.points')">
          <el-input-number v-model="adjustForm.points" />
          <span class="hint">{{ $t('task.hint') }}</span>
        </el-form-item>
        <el-form-item :label="$t('user.reason')">
          <el-input v-model="adjustForm.reason" placeholder="e.g. System Error Compensation" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAdjustDialog = false">{{ $t('app.cancel') }}</el-button>
          <el-button type="primary" @click="adjustPoints">{{ $t('app.confirm') }}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useRoute } from 'vue-router';
import api, { clientApi } from '../api';
// Admin API doesn't have "get user status" endpoint explicitly defined in TDD, but Client API does.
// We can use Client API endpoint for viewing status, or add one to Admin API.
// Let's use Client API endpoint `GET /api/v1/user/status` for simplicity, assuming admin can call it.
// Or better, implement `getUserDetail` in Admin API.
// TDD says "Admin API: ... Manual adjust".
// "Client API: GET /user/status".
// I'll use the Client API endpoint here, but via the admin proxy or just direct call.
// Since I set base URL to `/api/admin` in `api/index.js`, I'll use a separate call.

const route = useRoute();
const activityId = route.params.activityId;
const email = route.params.email;
const userStatus = reactive({
  totalPoints: 0,
  tasks: [],
});
const showAdjustDialog = ref(false);
const adjustForm = reactive({
  points: 0,
  reason: '',
});

const fetchUserStatus = async () => {
  try {
    // Calling Client API
    const res = await clientApi.get(`/user/status`, {
      params: { email, activityId, lang: 'en' }
    });
    userStatus.totalPoints = res.data.totalPoints;
    userStatus.tasks = res.data.tasks;
  } catch (error) {
    console.error(error);
  }
};

const adjustPoints = async () => {
  try {
    await api.post('/task/adjust', {
      email,
      activityId: parseInt(activityId),
      points: adjustForm.points,
      reason: adjustForm.reason,
    });
    showAdjustDialog.value = false;
    fetchUserStatus();
  } catch (error) {
    console.error(error);
  }
};

onMounted(fetchUserStatus);
</script>

<style scoped>
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.user-info {
  margin-bottom: 20px;
}
.info-item {
  margin-bottom: 10px;
  font-size: 16px;
}
.label {
  font-weight: bold;
  margin-right: 10px;
}
.points {
  color: #E6A23C;
  font-weight: bold;
  font-size: 20px;
}
.hint {
  margin-left: 10px;
  color: #909399;
  font-size: 12px;
}
</style>
