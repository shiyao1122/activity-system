<template>
  <el-container class="layout-container">
    <el-header>
      <div class="logo">{{ $t('app.title') }}</div>
      <div class="header-right">
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
    <el-container>
      <el-aside width="200px">
        <el-menu
          mode="vertical"
          router
          :default-active="$route.path"
          class="nav-menu"
        >
          <el-menu-item index="/activities">
            <el-icon><Menu /></el-icon>
            <span>{{ $t('app.activities') }}</span>
          </el-menu-item>
          <el-menu-item index="/categories">
             <el-icon><Files /></el-icon>
            <span>{{ $t('app.categories') }}</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import { ArrowDown, Menu, Files } from '@element-plus/icons-vue';

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
  background-color: #fff;
  z-index: 1000;
}
.el-aside {
  border-right: 1px solid #dcdfe6;
  background-color: #f5f7fa;
}
.header-right {
  display: flex;
  align-items: center;
}
.nav-menu {
  border-right: none !important;
  background-color: transparent !important;
}
.logo {
  font-size: 1.2rem;
  font-weight: bold;
  color: #303133;
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
  background-color: #f5f7fa;
}
.el-main {
  background-color: #fff;
  padding: 20px;
}
</style>
