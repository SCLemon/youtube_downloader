<template>
  <div class="body">
    <div class="content">
      <div class="title">Youtube Downloader</div>
      <div class="inputBox">
        <input class="input" type="text" v-model="url" :placeholder="placeholder">
        <div class="btn" @click="isLoading?'':send()">
          <span v-if="!isLoading">Download</span>
          <i v-else class="el-icon-loading"></i>
        </div>
      </div>
      <div class="output" v-if="!isFirst || (isFirst && isLoading)">
        <el-progress class="progress" type="circle" :percentage="percent" :status="status==''?undefined:status" :width="300" :stroke-width="10" :color="useCustomColor? colors : undefined"></el-progress>
        <div class="preview" v-if="percent>=100 && status == 'success'">
          <video class="video" :src="videoUrl" controls autoplay></video>
        </div>
      </div>
    </div>
    
  </div>
</template>

<script>
import axios from 'axios';
import { nanoid } from 'nanoid';
export default {
  name:'Main',
  data(){
    return {
      url:'',
      userID:nanoid(),
      placeholder:'Please Enter the Video URL',
      isLoading:false,
      isFirst:true,
      percent:0,
      status:'',
      videoUrl:'',
      useCustomColor:true,
      colors: [
        {color: '#e6a23c', percentage: 45},
        {color: '#1989fa', percentage: 70},
        {color: '#5cb87a', percentage: 85},
      ]
    }
  },

  mounted(){
    const ws = new WebSocket(`ws://${window.location.hostname}:3000`,this.userID); 
    ws.onmessage = (event) => {
      if(event.data.includes('%')){
        this.percent = Number(event.data.split('%')[0].trim())
        if(this.percent >= 100) this.status = 'success'
      }
    };
  },
  methods:{
    async send(){
      try{
        URL.revokeObjectURL(this.videoUrl);
        this.percent = 0
        this.status = ''
        this.isLoading = true
        this.isFirst = false
        const response = await axios.post('/download/video',{url: this.url.trim(), userID: this.userID},{ responseType:'blob' })
        const videoBlob = response.data;
        this.videoUrl = URL.createObjectURL(videoBlob);
        
        const a = document.createElement('a');
        a.href = this.videoUrl;
        a.download = `${new Date().getTime()}.mp4`;
        document.body.appendChild(a);
        a.click()
        document.body.removeChild(a);
      }
      catch(e){
        this.useCustomColor = false
        this.percent = 100
        this.status = 'exception'
      }
      finally{
        this.isLoading = false
      }
    }
  }
}
</script>

<style scoped>
  .body{
    width: 100vw;
    height: 100vh;
    margin: 0 auto;
    background: black;
  }
  .content{
    width: 60%;
    height: 180px;
    padding-top: 100px;
    margin: 0 auto;
  }
  .title{
    width: 100%;
    height: 80px;
    line-height: 80px;
    font-size: 48px;
    text-align: center;
    color: white;
  }
  .inputBox{
    width: 100%;
    height: 80px;
    border: 1px solid rgba(255,255,255);
    border-radius: 50px;
    margin-top: 40px;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
  }
  .input{
    width: 75%;
    height: 80px;
    line-height: 80px;
    font-size: 24px;
    border: 0;
    background: transparent;
    color: white;
  }
  .input:focus {
    outline: none;
    box-shadow: none;
    border: none;
  }
  .btn{
    width: 12%;
    text-align: center;
    color: rgba(255,255,255,0.8);
    border: 1px solid white;
    height: 50px;
    line-height: 50px;
    border-radius: 5px;
    background: rgba(255,255,255,0.1);
    border: 1px solid transparent;
  }
  .btn:hover{
    background: 0;
    border: 1px solid white;
    color: white;
    cursor: pointer;
  }
  .output{
    margin-top: 60px;
    height: 300px;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
  }
  .preview{
      width: 50%;
      height: 300px;
  }
  .video{
    width: 100%;
    height: 300px;
  }
</style>