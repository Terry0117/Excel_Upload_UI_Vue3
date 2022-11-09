<template >
    <nav class="fixed-top">
        <el-menu
        :default-active="activeIndex2"
        class="el-menu-demo"
        mode="horizontal"
        background-color="#545c64"
        text-color="#fff"
        active-text-color="#ffd04b"

        ellipsis
        router
        >
        <el-menu-item index="/createTable">CreateTable</el-menu-item>
        <el-menu-item index="/uploadExcel">Upload</el-menu-item>
        <el-menu-item index="/search">查詢</el-menu-item>
        </el-menu>
    </nav>
    <br>
    <br>
  </template>

  <script setup>
  import { ref, watchEffect } from 'vue'

  const activeIndex = ref('1')
  const activeIndex2 = ref('/'+location.href.split('/')[location.href.split('/').length-1])

  if(location.href.split('/')[location.href.split('/').length-1]==''){
    activeIndex2.value ='/createTable'
  }
  </script>

<style>

</style>