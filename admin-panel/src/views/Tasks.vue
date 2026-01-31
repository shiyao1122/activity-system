<template>
  <div>
    <div class="header-actions">
      <h2>{{ $t('app.tasks') }} - {{ $t('activity.id') }} {{ activityId }}</h2>
      <div v-if="activityStatus === 'DRAFT'">
          <el-button type="primary" @click="openCreateDialog">{{ $t('task.createTask') }}</el-button>
          <el-upload
            class="upload-excel"
            action=""
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleImport"
            accept=".xlsx, .xls"
            style="display: inline-block; margin-left: 10px;"
          >
            <el-button type="success">{{ $t('task.importTasks') }}</el-button>
          </el-upload>
      </div>
    </div>

    <el-table :data="tasks" style="width: 100%">
      <el-table-column prop="id" :label="$t('activity.id')" width="80" />
      <el-table-column prop="taskName" :label="$t('task.taskName')" />
      <el-table-column prop="targetTaskName" :label="$t('task.targetTaskName')" />
      <el-table-column prop="points" :label="$t('task.points')" />
      <el-table-column prop="platform" :label="$t('task.platform')" width="100">
        <template #default="scope">
          {{ scope.row.platform || 'mobile' }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('task.category')" width="120">
        <template #default="scope">
          {{ categories.find(c => c.id === scope.row.categoryId)?.name || '-' }}
        </template>
      </el-table-column>
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
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item :label="$t('task.taskName')" prop="taskName">
          <el-input v-model="form.taskName" placeholder="e.g. register, login" />
        </el-form-item>
        <el-form-item :label="$t('task.targetTaskName')" prop="targetTaskName">
          <el-input v-model="form.targetTaskName" placeholder="Optional: e.g. register (for invite tasks)" />
        </el-form-item>
        <el-form-item :label="$t('task.platform')" prop="platform">
          <el-select v-model="form.platform" placeholder="Select platform">
            <el-option label="APP" value="APP" />
            <el-option label="PC" value="PC" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('task.category')" prop="categoryId">
          <el-select v-model="form.categoryId" placeholder="Select Category" clearable>
            <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
          </el-select>
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
        <el-form-item :label="$t('task.descriptionEn')">
          <el-input v-model="descForm.en" placeholder="En Description" />
        </el-form-item>
        <el-form-item :label="$t('task.selectLanguages')">
          <el-select
            v-model="selectedLangs"
            multiple
            placeholder="Select languages"
            style="width: 100%"
          >
            <el-option
              v-for="lang in supportedLangs"
              :key="lang.value"
              :label="lang.label"
              :value="lang.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-for="langCode in selectedLangs"
          :key="langCode"
          :label="getLangLabel(langCode)"
        >
           <el-input v-model="descForm.others[langCode]" :placeholder="getLangLabel(langCode)" />
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
import * as XLSX from 'xlsx';

const { t } = useI18n();
const route = useRoute();
const activityId = route.params.activityId;
const tasks = ref([]);
const activityStatus = ref('');
const showDialog = ref(false);
const isEdit = ref(false);
const form = ref({
  id: null,
  taskName: '',
  targetTaskName: '',
  platform: 'mobile',
  categoryId: null,
  points: 0,
  dailyLimit: 0,
  totalLimit: 0,
  // descJson removed from here, handled by descForm
});

const descForm = reactive({
  en: '',
  others: {}
});
const formRef = ref(null);
const rules = {
  taskName: [
    { required: true, message: 'Please input Task Name', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_-]+$/, message: 'Task Name must be alphanumeric/dashes only (No spaces)', trigger: 'blur' }
  ]
};

const selectedLangs = ref([]);
const supportedLangs = [
  { value: 'zh', label: 'Chinese (zh)' },
  { value: 'ja', label: 'Japanese (ja)' },
  { value: 'ko', label: 'Korean (ko)' },
  { value: 'de', label: 'German (de)' },
  { value: 'fr', label: 'French (fr)' },
  { value: 'es', label: 'Spanish (es)' },
  { value: 'pt', label: 'Portuguese (pt)' },
  { value: 'ru', label: 'Russian (ru)' },
  { value: 'ar', label: 'Arabic (ar)' },
  { value: 'vi', label: 'Vietnamese (vi)' },
  { value: 'th', label: 'Thai (th)' },
  { value: 'id', label: 'Indonesian (id)' },
];

const getLangLabel = (code) => {
  const found = supportedLangs.find(l => l.value === code);
  return found ? found.label : code;
};

const categories = ref([]);
const fetchCategories = async () => {
    try {
        const res = await api.get('/category');
        categories.value = res.data;
    } catch (error) {
        console.error(error);
    }
};

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
  form.value = { taskName: '', targetTaskName: '', platform: 'mobile', categoryId: null, points: 0, dailyLimit: 0, totalLimit: 0 };
  descForm.en = '';
  descForm.others = {};
  selectedLangs.value = [];
  showDialog.value = true;
};

const openEditDialog = (row) => {
  isEdit.value = true;
  form.value = {
    id: row.id,
    taskName: row.taskName,
    targetTaskName: row.targetTaskName || '',
    platform: row.platform || 'mobile',
    categoryId: row.categoryId || null,
    points: row.points,
    dailyLimit: row.dailyLimit,
    totalLimit: row.totalLimit,
  };
  
  // Parse JSON
  try {
    const json = JSON.parse(row.descJson || '{}');
    descForm.en = json.en || '';
    descForm.others = {};
    selectedLangs.value = [];
    
    Object.keys(json).forEach(key => {
      if (key !== 'en') {
        if (!supportedLangs.find(l => l.value === key)) {
           // Optionally add unknown languages dynamically if needed, or just ignore/show as custom
        }
        selectedLangs.value.push(key);
        descForm.others[key] = json[key];
      }
    });
  } catch (e) {
    console.error('Failed to parse descJson', e);
    descForm.en = row.descJson || ''; // Fallback
    descForm.others = {};
    selectedLangs.value = [];
  }

  showDialog.value = true;
};

import { watch } from 'vue';

watch(selectedLangs, async (newVal, oldVal) => {
  // Find newly added languages
  const added = newVal.filter(lang => !oldVal.includes(lang));
  if (added.length === 0) return;

  // If there is English text, auto translate
  if (descForm.en && descForm.en.trim() !== '') {
    // Check if we need to translate for any added language
    const langsToTranslate = added.filter(lang => !descForm.others[lang]);

    if (langsToTranslate.length > 0) {
      try {
        const res = await api.post('/translate', {
            text: descForm.en,
            targetLangs: langsToTranslate
        });

        // Update form with results
        Object.keys(res.data).forEach(lang => {
            descForm.others[lang] = res.data[lang];
        });
        
        ElMessage.success(t('app.translateSuccess') || 'Auto Translate Success');
      } catch (error) {
        console.error('Translation error', error);
        ElMessage.warning('Auto translation failed: ' + (error.response?.data?.error || error.message));
      }
    }
  }
});

const handleImport = (file) => {
  if (!file) return;
  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);

      if (json.length === 0) {
        ElMessage.warning('Empty file');
        return;
      }

      // Map columns
      // Headers based on user image:
      // A: 任务名称 (Description En)
      // B: taskName(唯一值)
      // C: Platform(mobile/desktop)
      // D: category
      // E: Points
      // F: Total Limit
      // G: Daily Limit
      // H: Target Task Name

      const tasksToImport = json.map(row => {
        // Need to identify keys dynamically or assume standard
        // Keys will be what is in the first row. 
        // Assuming user uses English headers or specific Chinese headers as per image?
        // The image has headers in Row 1.
        // Let's try to access by vague matching or exact strings from image if possible.
        // Better: access by index if we used header: 1 option? No, json object has keys.
        // Image Headers: "任务名称", "taskName(唯一值)", "Platform(mobile/desktop)", "category", "Points", "Total Limit", "Daily Limit", "Target Task Name"
        
        return {
           descriptionEn: row['任务名称'],
           taskName: row['taskName(唯一值)'],
           platform: row['Platform(mobile/desktop)'],
           categoryName: row['category'],
           points: row['Points'],
           totalLimit: row['Total Limit'],
           dailyLimit: row['Daily Limit'],
           targetTaskName: row['Target Task Name']
        };
      });

      // Send to backend
      api.post('/task/import', {
          activityId: parseInt(activityId),
          tasks: tasksToImport
      }).then(res => {
          const { success, failed, errors } = res.data;
          if (failed > 0) {
              ElMessageBox.alert(
                  `Imported: ${success}, Failed: ${failed}. \nErrors: \n${errors.join('\n')}`,
                  'Import Result',
                  { confirmButtonText: 'OK' }
              );
          } else {
              ElMessage.success(`Successfully imported ${success} tasks.`);
          }
          fetchTasks(); 
          fetchCategories(); // Reload categories in case new ones were created
      }).catch(err => {
          ElMessage.error('Import failed: ' + (err.response?.data?.error || err.message));
      });

    } catch (e) {
      console.error(e);
      ElMessage.error('Failed to parse file');
    }
  };
  reader.readAsArrayBuffer(file.raw);
};

const submitTask = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid, fields) => {
    if (valid) {
      try {
        // Construct JSON
        const descObj = { en: descForm.en };
        selectedLangs.value.forEach(lang => {
          if (descForm.others[lang]) {
            descObj[lang] = descForm.others[lang];
          }
        });

        const payload = {
      activityId: parseInt(activityId),
      taskName: form.value.taskName,
      targetTaskName: form.value.targetTaskName || null,
      platform: form.value.platform,
      categoryId: form.value.categoryId || null,
      points: form.value.points,
      dailyLimit: form.value.dailyLimit,
      totalLimit: form.value.totalLimit,
      descJson: JSON.stringify(descObj),
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
    } else {
        ElMessage.warning('Please check form validation');
    }
  });
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
  fetchCategories();
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
