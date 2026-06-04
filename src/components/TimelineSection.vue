<script setup lang="ts">
import type { TimelineEvent } from '@/lib/api'

// 时光轴事件属性
defineProps<{
  events: TimelineEvent[]
}>()

// 获取事件类型对应的颜色
function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    成长: 'bg-baby-pink',
    里程碑: 'bg-baby-mint',
    疫苗: 'bg-baby-yellow',
    日记: 'bg-baby-lavender',
    照片: 'bg-baby-blue',
  }
  return colors[type] || 'bg-baby-pink'
}

// 获取事件类型对应的图标
function getTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    成长: '🌱',
    里程碑: '⭐',
    疫苗: '💉',
    日记: '📝',
    照片: '📷',
  }
  return icons[type] || '🎈'
}
</script>

<template>
  <div class="relative">
    <!-- 时间轴中轴线 -->
    <div class="timeline-line hidden md:block" style="top: 0; bottom: 0;"></div>

    <!-- 事件列表 -->
    <div class="space-y-6 md:space-y-8">
      <div
        v-for="(event, index) in events"
        :key="event.id"
        class="relative flex flex-col md:flex-row items-start"
        :class="index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'"
      >
        <!-- 时间轴圆点 -->
        <div class="hidden md:flex absolute left-1/2 -translate-x-1/2 z-10">
          <div class="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-lg">
            {{ getTypeIcon(event.type) }}
          </div>
        </div>

        <!-- 事件卡片 -->
        <div
          class="w-full md:w-[calc(50%-2rem)] card"
          :class="index % 2 === 0 ? 'md:mr-auto md:pr-8' : 'md:ml-auto md:pl-8'"
        >
          <!-- 移动端图标 -->
          <div class="md:hidden flex items-center gap-2 mb-2">
            <span class="text-lg">{{ getTypeIcon(event.type) }}</span>
            <span
              class="px-2 py-0.5 rounded-full text-xs text-white"
              :class="getTypeColor(event.type)"
            >
              {{ event.type }}
            </span>
          </div>

          <!-- 日期 -->
          <p class="text-baby-medium text-xs mb-1">{{ event.date }}</p>

          <!-- 标题 -->
          <h4 class="font-cute text-lg text-baby-dark mb-1">{{ event.title }}</h4>

          <!-- 描述 -->
          <p v-if="event.description" class="text-baby-medium text-sm">
            {{ event.description }}
          </p>
        </div>
      </div>
    </div>

    <!-- 云朵装饰 -->
    <div class="hidden md:block absolute -left-8 top-1/4 opacity-20 pointer-events-none">
      <div class="cloud-shape w-16 h-5 bg-white/50" style="width:64px; height:20px;">
        <div style="position:absolute; width:26px; height:26px; background:rgba(255,255,255,0.5); border-radius:50%; top:-13px; left:8px;"></div>
        <div style="position:absolute; width:36px; height:36px; background:rgba(255,255,255,0.5); border-radius:50%; top:-22px; left:22px;"></div>
      </div>
    </div>
  </div>
</template>
