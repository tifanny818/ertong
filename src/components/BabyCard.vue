<script setup lang="ts">
import type { Baby } from '@/lib/api'

// 宝宝信息属性
defineProps<{
  baby: Baby
}>()
</script>

<template>
  <div class="card gradient-pink relative overflow-hidden">
    <!-- 星星装饰 -->
    <div class="absolute top-3 right-6 text-baby-yellow text-xl star-twinkle">★</div>
    <div class="absolute top-8 right-16 text-white/50 text-sm star-twinkle" style="animation-delay: 0.3s;">★</div>
    <div class="absolute bottom-4 left-4 text-white/40 text-lg star-twinkle" style="animation-delay: 0.7s;">★</div>

    <div class="flex flex-col items-center text-center">
      <!-- 头像 -->
      <div class="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg overflow-hidden mb-4 animate-float">
        <img
          v-if="baby.avatar_url"
          :src="baby.avatar_url"
          :alt="baby.name"
          class="w-full h-full object-cover"
        />
        <div v-else class="w-full h-full bg-white/50 flex items-center justify-center">
          <svg viewBox="0 0 120 120" class="w-16 h-16 md:w-20 md:h-20" fill="none">
            <circle cx="60" cy="45" r="28" fill="#FFB6C1"/>
            <circle cx="60" cy="45" r="24" fill="#FFD6E0"/>
            <circle cx="50" cy="40" r="3" fill="#5B4A6A"/>
            <circle cx="70" cy="40" r="3" fill="#5B4A6A"/>
            <ellipse cx="60" cy="52" rx="4" ry="3" fill="#FF99AA"/>
            <path d="M54 50 Q60 56 66 50" stroke="#5B4A6A" stroke-width="2" fill="none" stroke-linecap="round"/>
            <path d="M35 30 Q40 15 55 22 Q60 18 65 22 Q80 15 85 30" fill="#E8A87C"/>
            <circle cx="60" cy="80" r="25" fill="#FFD6E0"/>
            <path d="M45 75 Q60 70 75 75" stroke="#FF99AA" stroke-width="2" fill="none"/>
          </svg>
        </div>
      </div>

      <!-- 名字 -->
      <h2 class="font-cute text-2xl md:text-3xl text-white mb-1">
        {{ baby.name }}
      </h2>

      <!-- 出生日期 -->
      <p class="text-white/80 text-sm mb-2">
        🎂 {{ baby.birth_date }}
      </p>

      <!-- 简介 -->
      <p v-if="baby.bio" class="text-white/90 text-sm max-w-xs">
        {{ baby.bio }}
      </p>
    </div>
  </div>
</template>
