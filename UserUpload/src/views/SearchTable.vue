<script setup>
import { ref, watchEffect } from 'vue'
import axios from 'axios'
import {Search} from '@element-plus/icons-vue'

const selectValue = ref('');                    //選擇的Table
const baseURL = 'http://10.55.27.205:3000';     //server URL
const selectData = ref([]);                     //資料庫內的Table Name
const tableName = ref('');                      //要查詢的Table Name
const tableData = ref([]);                      //查詢的資料內容
const header = ref([]);                         //查詢的Column Name
const loading = ref(false);                     //載入狀態

//查詢Table Name
function selectName(){
    axios.post(baseURL+'/upload/items')
    .then((res) => {
        selectData.value = res.data;
    })
    .catch((err) => {
        console.log(err);
    });
}
selectName();

//監聽選擇的Table
// watchEffect(()=>{
//     console.log(selectValue.value);
// })

function SearchTable(){
    tableData.value = [];
    header.value = [];
    loading.value=true;
    tableName.value = selectValue.value;
    if(selectValue.value==''){
        alert('請選擇要查詢的Table');
        loading.value=false;
        return ;
    }
    axios.post(baseURL+'/search',({name:tableName.value}))
    .then((res)=>{
        tableData.value = res.data.data;
        if(tableData.value.length==0){
            loading.value=false;
        }
        Object.keys(res.data.headers).forEach((head)=>{
            header.value.push(res.data.headers[head].name)
        })
        loading.value=false;
    })
}


</script>

<template>
    <div class="select_table">
        <el-form class="mt-4">
            <el-form-item label="選擇Table :">
                <el-select v-model="selectValue" class="m-2" placeholder="Select">
                <el-option
                v-for="item in selectData"
                :key="item['TABLE_NAME']"
                :label="item['TABLE_NAME']"
                :value="item['TABLE_NAME']"
                />
                </el-select>
            </el-form-item>
        </el-form>
        <el-button type="primary" :icon="Search" @click="SearchTable" >Search</el-button>
    </div>

    <div class="preView">
        <h4>Table Name: {{tableName}}</h4>
        <el-scrollbar height="80vh">
            <el-table :data="tableData" border  height="500" v-loading="loading" >
                <el-table-column v-for="i in header" :prop="i" :label="i" width="180"  />
            </el-table>
        </el-scrollbar>
    </div>
</template>

<style>
.select_table{
    width:25vw;
    float:left;
}
.preView{
    width:60vw;
    float:right;
    height:38vw
}
</style>