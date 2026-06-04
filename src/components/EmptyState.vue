<script setup lang="ts">
// 空状态消息属性
defineProps<{
  message: string
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 text-center">
    <!-- 可爱的空状态插图 -->
    <div class="relative mb-6">
      <!-- 云朵 -->
      <div class="cloud-shape w-24 h-8 bg-baby-blue/30 mx-auto" style="width:96px; height:32px;">
        <div style="position:absolute; width:40px; height:40px; background:rgba(168,216,234,0.3); border-radius:50%; top:-20px; left:12px;"></div>
        <div style="position:absolute; width:56px; height:56px; background:rgba(168,216,234,0.3); border-radius:50%; top:-32px; left:32px;"></div>
      </div>
      <!-- 星星 -->
      <div class="absolute -top-2 -right-4 text-baby-yellow text-xl star-twinkle">★</div>
      <div class="absolute -bottom-1 -left-4 text-baby-pink text-sm star-twinkle" style="animation-delay: 0.5s;">★</div>
    </div>

    <!-- 消息文本 -->
    <p class="text-baby-medium font-medium text-lg mb-2">{{ message }}</p>
    <p class="text-baby-medium/60 text-sm">快来记录宝贝的成长吧~ ✨</p>
  </div>
</template>
