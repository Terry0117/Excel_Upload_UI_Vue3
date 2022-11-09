<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { genFileId, timeUnits } from 'element-plus'
import type { UploadInstance, UploadProps, UploadRawFile } from 'element-plus'
import axios from 'axios'
import {read,utils} from 'xlsx'

const option = ref('1');                                    //動作
const upload = ref<UploadInstance>()
const btnFlag = ref(false);                                 //Loading Flag
const baseURL = 'http://10.55.27.205:3000';                 //server URL

const handleExceed: UploadProps['onExceed'] = (files) => {
    upload.value!.clearFiles()
    // console.log(files[0]);
    const file = files[0] as UploadRawFile
    file.uid = genFileId()
    upload.value!.handleStart(file)
}

//讀取Excel檔案
function readFile(file)  {
    return new Promise(resolve => {
        let reader = new FileReader()
        reader.readAsBinaryString(file)
        reader.onload = ev => {
            resolve(ev.target.result)
        }
    })
}

const excelCol = ref([]) ;      //Excel Column Name
const excelData = ref({});      //Excel Data

//選擇檔案改變時觸發
async function change (file){
    selectExcelValue.value=[];
    excelCol.value = [];
    let dataBinary = await readFile(file.raw)
    let workBook = read(dataBinary, {type: 'binary', cellDates: true})
    let workSheet = workBook.Sheets[workBook.SheetNames[0]]
    excelData.value = utils.sheet_to_json(workSheet)

    Object.keys(excelData.value[0]).forEach((i)=>{
        excelCol.value.push({name:i});
    })
}

const selectValue = ref('');        //選擇Table
const selectExcelValue = ref([]);   //選擇Excel Column Name
const data = ref([]);               //Table Names

//回傳Table Names
function selectName(){
    axios.post(baseURL+'/upload/items')
    .then((res) => {
        data.value = res.data;
    })
    .catch((err) => {
        console.log(err);
    });
}
selectName();

const colName = ref([]);
const checkeds = ref([false]);      //選擇的Key值
const checksData = ref({});         //Key值 Object

//更新col欄位名稱
watchEffect(()=>{
    if(selectValue.value!=''){
        axios.post(baseURL+'/upload/columns',JSON.stringify({name:selectValue.value}))
        .then((res)=>{
            colName.value = res.data;
            Object.keys(checkeds.value).forEach((i)=>{checkeds.value[i]=false})
            selectExcelValue.value=[];
        })
        .catch((err)=>{
            console.log(err);
        })
    }
    else{
    }
})

//CheckBox變更時觸發
function checked(){
    checksData.value = {};
    Object.keys(checkeds.value).forEach((i)=>{
        checksData.value[colName.value[i]['COLUMN_NAME']]=checkeds.value[i];

    })
}

//上傳
function Upload(){
    let check = false;                          //判斷是否有誤

    const uploadData = ref([]);                 //傳入Server的資料

    if(Object.keys(excelData.value).length==0){
        check = true;
        alert('請上傳檔案 !');
    }
    else{
        uploadData.value.push(excelData.value); //Excel資料
    }
    if(Object.keys(selectExcelValue.value).length < Object.keys(colName.value).length){
        check = true;
        alert('請選擇對應欄位 !')
    }
    else{
        let temp = {};
        selectExcelValue.value.forEach((i,index)=>{
            let col = colName.value[index]['COLUMN_NAME'];
            let excelCol = i;
            temp[col] = excelCol;
        });
        uploadData.value.push(temp);            //對應欄位資訊
    }

    uploadData.value.push(option.value);        //動作
    uploadData.value.push(selectValue.value);   //Table名稱

    let checkFlag = false;
    Object.keys(checkeds.value).forEach((i)=>{  //判斷是否有選擇Key值
        if(checkeds.value[i]==true){
            checkFlag=true;
        }
    })
    if(option.value=='2' && checkFlag==false){
        alert("請選擇Key值 !");
        check = true;
    }
    else if(option.value=='2' && checkFlag==true){
        uploadData.value.push(checksData.value);  //Key值
    }
    if(check == false){
        btnFlag.value=true;

        axios.post(baseURL+'/upload',({data:uploadData.value}))
        .then((res)=>{
            // console.log(res.data);
            if(res.data.substr(0,4)=='資料有誤'){
                alert(res.data);
                btnFlag.value=false;
            }
            else if(res.data=='success'){
                alert('上傳成功 !');
                upload.value!.clearFiles();
                selectValue.value='';
                selectExcelValue.value=[];
                colName.value=[];
                excelCol.value=[];
                excelData.value={};
                btnFlag.value=false;
            }
            // location.reload();           //頁面重整
        })
        .catch((err)=>{
            console.log(err);
            })
    }
}

</script>

<template>
    <div class="upload">
        <el-form class="mt-4">
        <el-form-item label="選擇Table :">
            <el-select v-model="selectValue" class="m-2" placeholder="Select">
            <el-option
            v-for="item in data"
            :key="item['TABLE_NAME']"
            :label="item['TABLE_NAME']"
            :value="item['TABLE_NAME']"
            />
            </el-select>
        </el-form-item>
        <el-form-item label="動作 :" class="mt-1">
                <el-radio-group v-model="option" class="ml-4">
                    <el-radio label="1" size="large">取代Table內資料</el-radio>
                    <el-radio label="2" size="large">新增/修改</el-radio>
                </el-radio-group>
            </el-form-item>
        </el-form>
        <el-upload
        ref="upload"
        class="upload-demo"
        :limit="1"
        :on-exceed="handleExceed"
        :auto-upload="false"
        accept=".xlsx"
        :on-change="change"
        >
            <template #trigger>
                <el-button type="primary" style="margin-right: 10px;">選擇檔案</el-button>
            </template>

            <template #tip>
                <div class="el-upload__tip text-red">
                只能上傳 .xlsx檔案
                </div>
            </template>
        </el-upload>
    </div>

    <div class="preView" v-if="colName.length>0">
        <div v-if="option=='1'">選擇對應的欄位</div>
        <div v-else>選擇對應的欄位/Key值</div>
        <el-form-item v-for="name,index in colName"  class="mt-3">
            <el-checkbox v-model="checkeds[index]" size="large"  @change="checked" v-if="option=='2'" class="m-2" />

            <div class="text">{{name['COLUMN_NAME']}}:</div>

            <el-select v-model="selectExcelValue[index]" class="m-2" placeholder="Select">
            <el-option
            v-for="item in excelCol"
            :key="item['name']"
            :label="item['name']"
            :value="item['name']"
            />
            </el-select>
        </el-form-item>

        <el-button class="mt-3" type="success" @click="Upload" v-if="btnFlag==false">
                上傳
            </el-button>

        <el-button type="primary" loading v-if="btnFlag==true">Loading</el-button>
    </div>
</template>

<style scoped>
.upload{
    width:35vw;
    float:left;
}
.preView{
    width:50vw;
    float:right;
}
.text{
    font-size:large;
}
.el-button .custom-loading .circular {
  margin-right: 6px;
  width: 18px;
  height: 18px;
  animation: loading-rotate 2s linear infinite;
}
.el-button .custom-loading .circular .path {
  animation: loading-dash 1.5s ease-in-out infinite;
  stroke-dasharray: 90, 150;
  stroke-dashoffset: 0;
  stroke-width: 2;
  stroke: var(--el-button-text-color);
  stroke-linecap: round;
}
</style>