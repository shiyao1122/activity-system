<template>
  <el-container class="layout-container">
    <el-header>
      <div class="logo">{{ $t('app.title') }}</div>
      <div class="header-right">
        <el-menu mode="horizontal" router :default-active="$route.path" class="nav-menu">
          <el-menu-item index="/activities">{{ $t('app.activities') }}</el-menu-item>
        </el-menu>
        <el-dropdown @command="handleLangCommand">
          <span class="el-dropdown-link">
            {{ currentLang === 'zh' ? '中文' : 'English' }}
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="zh">中文</el-dropdown-item>
              <el-dropdown-item command="en">English</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>
    <el-main>
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import { ArrowDown } from '@element-plus/icons-vue';

const { locale } = useI18n();
const currentLang = computed(() => locale.value);

const handleLangCommand = (command) => {
  locale.value = command;
};
</script>

<style>
.layout-container {
  height: 100vh;
}
.el-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #dcdfe6;
}
.header-right {
  display: flex;
  align-items: center;
}
.nav-menu {
  border-bottom: none !important;
  margin-right: 20px;
}
.logo {
  font-size: 1.2rem;
  font-weight: bold;
}
.el-dropdown-link {
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #409EFF;
}
body {
  margin: 0;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
}
</style>
