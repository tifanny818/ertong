<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

// 出生日期属性
const props = defineProps<{
  birthDate: string
}>()

// 年龄数据
const age = ref({
  years: 0,
  months: 0,
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
})

// 计算年龄
function calculateAge() {
  // 解析出生日期，按本地时间解析避免时区问题
  const parts = props.birthDate.split('-')
  const birth = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
  const now = new Date()

  let years = now.getFullYear() - birth.getFullYear()
  let months = now.getMonth() - birth.getMonth()
  let days = now.getDate() - birth.getDate()
  let hours = now.getHours() - birth.getHours()
  let minutes = now.getMinutes() - birth.getMinutes()
  let seconds = now.getSeconds() - birth.getSeconds()

  // 处理借位
  if (seconds < 0) {
    seconds += 60
    minutes--
  }
  if (minutes < 0) {
    minutes += 60
    hours--
  }
  if (hours < 0) {
    hours += 24
    days--
  }
  if (days < 0) {
    // 获取上个月的天数
    const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
    days += lastMonth.getDate()
    months--
  }
  if (months < 0) {
    months += 12
    years--
  }

  age.value = { years, months, days, hours, minutes, seconds }
}

// 格式化数字为两位
const pad = (n: number) => String(n).padStart(2, '0')

// 数字单元列表
const ageUnits = computed(() => [
  { value: age.value.years, label: '岁' },
  { value: age.value.months, label: '月' },
  { value: age.value.days, label: '天' },
])

// 定时器（每分钟更新一次即可）
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  calculateAge()
  timer = setInterval(calculateAge, 60000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<template>
  <div class="card gradient-blue relative overflow-hidden">
    <!-- 云朵装饰 -->
    <div class="absolute top-2 left-4 opacity-20">
      <div class="cloud-shape w-12 h-4 bg-white/50" style="width:48px; height:16px;">
        <div style="position:absolute; width:20px; height:20px; background:rgba(255,255,255,0.5); border-radius:50%; top:-10px; left:6px;"></div>
        <div style="position:absolute; width:28px; height:28px; background:rgba(255,255,255,0.5); border-radius:50%; top:-16px; left:16px;"></div>
      </div>
    </div>

    <h3 class="font-cute text-xl text-white text-center mb-4">🕐 我已经长大啦</h3>

    <div class="flex flex-wrap justify-center gap-2 md:gap-3">
      <div v-for="unit in ageUnits" :key="unit.label" class="flex flex-col items-center">
        <div class="flip-number text-baby-dark">
          {{ unit.value }}
        </div>
        <span class="text-white/80 text-xs mt-1 font-medium">{{ unit.label }}</span>
      </div>
    </div>
  </div>
</template>
