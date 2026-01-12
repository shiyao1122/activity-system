<template>
  <div>
    <div class="header-actions">
      <h2>{{ $t('app.dashboard') }} - {{ $t('activity.id') }} {{ activityId }}</h2>
      <el-button type="success" @click="exportRank">{{ $t('dashboard.exportRank') }}</el-button>
    </div>

    <el-row :gutter="20" class="stats-row">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>{{ $t('dashboard.totalUsers') }}</template>
          <div class="stat-value">{{ stats.totalUsers }}</div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>{{ $t('dashboard.totalPoints') }}</template>
          <div class="stat-value">{{ stats.totalPoints }}</div>
        </el-card>
      </el-col>
    </el-row>

    <h3>{{ $t('dashboard.leaderboard') }}</h3>
    <el-table :data="stats.leaderboard" style="width: 100%">
      <el-table-column type="index" width="50" />
      <el-table-column prop="email" :label="$t('dashboard.email')" />
      <el-table-column prop="totalPoints" :label="$t('user.totalPoints')" sortable />
      <el-table-column prop="updatedAt" :label="$t('dashboard.lastUpdated')" />
      <el-table-column :label="$t('app.actions')" width="150">
        <template #default="scope">
          <el-button size="small" @click="viewUser(scope.row.email)">{{ $t('dashboard.details') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../api';

const route = useRoute();
const router = useRouter();
const activityId = route.params.id;
const stats = reactive({
  totalUsers: 0,
  totalPoints: 0,
  leaderboard: [],
});

const fetchStats = async () => {
  try {
    const res = await api.get(`/stats/${activityId}`);
    stats.totalUsers = res.data.totalUsers;
    stats.totalPoints = res.data.totalPoints;
    stats.leaderboard = res.data.leaderboard;
  } catch (error) {
    console.error(error);
  }
};

const exportRank = () => {
  window.open(`http://localhost:3000/api/admin/export/rank?activityId=${activityId}`, '_blank');
};

const viewUser = (email) => {
  router.push(`/user/${activityId}/${email}`);
};

onMounted(fetchStats);
</script>

<style scoped>
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.stats-row {
  margin-bottom: 20px;
}
.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
}
</style>
