<template>
  <div class="w-full h-full p-4">
    <h2 class="text-lg font-bold mb-4">人物關係圖</h2>
    
    <!-- 左右佈局 -->
    <div class="flex gap-4 h-[calc(100vh-120px)]">
      <!-- 左側：人物關係圖 -->
      <div class="flex-1">
        <PersonGraphViewer />
      </div>
      
      <!-- 右側：對話區 -->
      <div class="flex-1">
        <PersonGraphChat />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PersonGraphViewer from './PersonGraphViewer.vue'
import PersonGraphChat from './PersonGraphChat.vue'
</script>

