<template>
  <div class="categories-container">
    <div class="header-actions">
      <h2>{{ $t('app.categories') }}</h2>
      <el-button type="primary" @click="openCreateDialog">{{ $t('app.createCategory') }}</el-button>
    </div>

    <el-table :data="categories" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" :label="$t('category.name')" />
      <el-table-column :label="$t('app.actions')" width="200">
        <template #default="scope">
          <el-button size="small" type="primary" @click="openEditDialog(scope.row)">{{ $t('app.edit') }}</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)">{{ $t('app.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Dialog -->
    <el-dialog v-model="showDialog" :title="isEdit ? $t('app.updateCategory') : $t('app.createCategory')">
      <el-form :model="form" ref="formRef" label-width="100px">
        <el-form-item :label="$t('category.name')" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showDialog = false">{{ $t('app.cancel') }}</el-button>
          <el-button type="primary" @click="handleSubmit">{{ $t('app.confirm') }}</el-button>
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

const { t } = useI18n();
const categories = ref([]);
const loading = ref(false);
const showDialog = ref(false);
const isEdit = ref(false);
const form = ref({
  id: null,
  name: '',
});

const fetchCategories = async () => {
  loading.value = true;
  try {
    const res = await api.get('/category');
    categories.value = res.data;
  } catch (error) {
    ElMessage.error(error.message);
  } finally {
    loading.value = false;
  }
};

const openCreateDialog = () => {
  isEdit.value = false;
  form.value = { id: null, name: '' };
  showDialog.value = true;
};

const openEditDialog = (row) => {
  isEdit.value = true;
  form.value = { ...row };
  showDialog.value = true;
};

const handleSubmit = async () => {
  if (!form.value.name) return;
  try {
    if (isEdit.value) {
      await api.put(`/category/${form.value.id}`, { name: form.value.name });
      ElMessage.success(t('app.updateSuccess') || 'Success');
    } else {
      await api.post('/category', { name: form.value.name });
      ElMessage.success(t('app.createSuccess') || 'Success');
    }
    showDialog.value = false;
    fetchCategories();
  } catch (error) {
    ElMessage.error(error.response?.data?.error || error.message);
  }
};

const handleDelete = (row) => {
  ElMessageBox.confirm(
    t('app.deleteConfirm'),
    t('app.warning'),
    { type: 'warning' }
  ).then(async () => {
    try {
      await api.delete(`/category/${row.id}`);
      ElMessage.success(t('app.deleteSuccess') || 'Deleted');
      fetchCategories();
    } catch (error) {
        ElMessage.error(error.response?.data?.error || error.message);
    }
  });
};

onMounted(() => {
  fetchCategories();
});
</script>

<style scoped>
.categories-container {
  padding: 20px;
}
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
</style>
