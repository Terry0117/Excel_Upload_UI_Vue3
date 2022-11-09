<script setup>
    import { ref, watchEffect } from 'vue'
    import {
    Plus
    } from '@element-plus/icons-vue'
    import axios from "axios";

    const disable = ref(false);                         //Table Name disable
    const tableName = ref('');
    const colName = ref('');
    const colContent =ref('1');                         //Column Type
    const formFlag = ref(false);                        //新增Column
    const textLen = ref('');                            //內容最大長度
    const tableData =ref([]);
    const dialogVisible = ref(false);
    const loading = ref(false);
    const baseURL = 'http://10.55.27.205:3000';         //server URL

    //判斷是否為數字
    function isNum(val){
        return !isNaN(val);
    }

    //新增欄位&判斷Table名稱
    function addCol (){
        loading.value = true;
        axios.post(baseURL+"/create/check",({
            name:tableName.value}))
        .then((res)=>{
            let pattern = new RegExp("[\u4E00-\u9FA5]+"); //判斷是否為中文
            let flag = false;
            tableName.value = tableName.value.trim();
            for(let i=0;i<tableName.value.length;i++){    //判斷Table名稱內是否有空白
                if(tableName.value.charAt(i)==" "){
                    flag=true;
                }
            }
            if(tableName.value == ''){
                alert('請輸入Table Name !');
                formFlag.value = false;
            }
            else if(isNum(tableName.value[0])){
                alert('開頭不能為數字 !');
                formFlag.value = false;
            }
            else if((tableName.value).length>30){
                alert('名稱太長 !');
                formFlag.value = false;
            }
            else if(flag==true){
                alert('名稱內有空白 !');
                formFlag.value = false;
            }
            else if(res.data=='exist'){
                alert('Table名稱重複 !');
                formFlag.value = false;
                tableName.value = '';
            }
            else if(pattern.test(tableName.value)==true){
                alert('Table名稱內有中文');
                formFlag.value = false;
                tableName.value = '';
            }
            else{
                disable.value = true;
                colName.value='';
                textLen.value='';
                colContent.value='1';
                formFlag.value = true;

            }
            loading.value = false;
        })

    }
    //判斷新增欄位的資訊&新增
    function add(){
        let flag = false;
        let flag2 = false;
        colName.value = colName.value.trim();
        for(let i=0;i<colName.value.length;i++){                              //判斷Column名稱內是否有空白
            if(colName.value.charAt(i)==" "){
                flag=true;
            }
        }
        tableData.value.forEach((tName)=>{                                     //判斷Column名稱是否重複
            if(colName.value.toUpperCase() == tName.name.toUpperCase() ){
                flag2 = true;
            }
        })
        const temp = {};
        if(colName.value=='')alert('請輸入欄位名稱');
        else if(textLen.value=='' && colContent.value=='1')alert('請輸入欄位長度');
        else if(textLen.value>4000){
            alert("長度需小於4000 !");
            textLen.value = '';
        }
        else if(flag==true){
            alert('名稱內有空白 !');

        }
        else if(flag2==true){
            alert('名稱重複 !');
            flag2==false;
        }
        else if(isNum(colName.value[0])){
            alert('開頭不能為數字 !');
        }
        else
        {
            temp['name']=colName.value;
            if(colContent.value=='1')
            {
                // console.log('文字');
                temp['content']= '文字';
                temp['len']=textLen.value;
            }
            else
            {
                // console.log('數字');
                temp['content']= '數字';
                temp['len']='';
            }
            tableData.value.push(temp);
            formFlag.value = false;
            // console.log(tableData.value);
        }
    }

    //建立Table
    function create(){
        dialogVisible.value = false;
        // console.log(JSON.stringify(tableData.value));
        axios.post(baseURL+"/create",({
            name:tableName.value,
            data:(tableData.value)}))
        .then((res)=>{
            if(res.data=='ORA-00955: name is already used by an existing object'){
                alert('Table名稱重複 !');
                // console.log(res.data);
                clean()
            }
            else if(res.data.substr(0,4)=='ORA-'){
                alert(res.data);
                // console.log(res.data);
                clean()
            }
            else if(res.data=='success'){
                alert('新增成功 !');
                clean()
            }
        })
        .catch((err) => {
            console.log(err);
        })
    }

    function clean(){
        disable.value = false;
        formFlag.value=false;
        tableName.value='';
        tableData.value=[];
    }

    //監聽Column Type
    // watchEffect(()=>{
    //     if(colContent.value=='1')console.log('文字');
    //     else console.log('數字');
    // }
    // );

</script>

<template>
    <div class="create">
        <h3>命名規則</h3>
        <ul>
            <li>開頭不能為數字</li>
            <li>Table名稱不能有中文字</li>
            <li>長度小於30字</li>
            <li>名稱內不能有空白</li>
            <li>內容最大長度小於4000</li>
        </ul>
        <el-form  label-width="120px" label-position="left" class="mt-3">
            <el-form-item label="Table name" required>
                <el-input v-model="tableName" placeholder="Please input table name" autosize clearable :disabled="disable" maxlength="30" show-word-limit />
            </el-form-item>
            <el-button type="primary" :icon="Plus" @click="addCol" :loading="loading" />
        </el-form>
        <el-form  label-width="120px" label-position="left" v-if="formFlag">
            <el-form-item label="欄位名稱" class="mt-4" required>
                <el-input v-model="colName" placeholder="Please input column name" autosize clearable/>
            </el-form-item>
            <el-form-item label="欄位內容" class="mt-1" required>
                <el-radio-group v-model="colContent" class="ml-4">
                    <el-radio label="1" size="large">文字</el-radio>
                    <el-radio label="2" size="large">數字</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="內容最大長度" class="mt-1" v-if="colContent=='1'" required>
                <el-input v-model="textLen" placeholder="Please input length" autosize type="number"  />
            </el-form-item>
            <el-button type="primary" style="float:right;" @click="add">新增</el-button>
        </el-form>
    </div>
    <div class="preView">
        <h4>Table Name:{{tableName}}</h4>
        <el-table :data="tableData" border style="width: 100%">
            <el-table-column prop="name" label="欄位名稱" width="180" />
            <el-table-column prop="content" label="欄位內容" width="180" />
            <el-table-column prop="len" label="內容最大長度" />
        </el-table>
        <el-button type="primary" style="float:right;" @click="dialogVisible = true" class="mt-2" v-if="tableData!=''">建立</el-button>
        <el-button type="primary" style="float:right; margin-right: 10px;" @click="clean" class="mt-2" v-if="tableData!=''">重設</el-button>
        <el-dialog
        v-model="dialogVisible"
        title="請確認是否正確"
        width="30%"
        >
            <span>
                <el-table :data="tableData" border style="width: 100%">
                  <el-table-column prop="name" label="欄位名稱" width="100" />
                  <el-table-column prop="content" label="欄位內容" width="180" />
                  <el-table-column prop="len" label="文字最大長度" />
                </el-table>
            </span>
            <template #footer>
            <span class="dialog-footer">
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="create">
                確認
                </el-button>
            </span>
            </template>
        </el-dialog>
    </div>
</template>

<style>
.create{
    width:35vw;
    float:left;
}
.preView{
    width:50vw;
    float:right;
}
.dialog-footer button:first-child {
  margin-right: 10px;
}
.top{
    vertical-align: top;
}
</style>