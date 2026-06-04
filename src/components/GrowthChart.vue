<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import type { GrowthRecord } from '@/lib/api'

// 注册 Chart.js 组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

// 成长记录属性
const props = defineProps<{
  records: GrowthRecord[]
}>()

// 按日期排序的记录
const sortedRecords = computed(() =>
  [...props.records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
)

// 图表数据
const chartData = computed(() => ({
  labels: sortedRecords.value.map(r => r.date),
  datasets: [
    {
      label: '身高 (cm)',
      data: sortedRecords.value.map(r => r.height),
      borderColor: '#FFB6C1',
      backgroundColor: 'rgba(255, 182, 193, 0.1)',
      fill: true,
      tension: 0.4,
      yAxisID: 'y',
      pointBackgroundColor: '#FFB6C1',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 5,
    },
    {
      label: '体重 (kg)',
      data: sortedRecords.value.map(r => r.weight),
      borderColor: '#A8D8EA',
      backgroundColor: 'rgba(168, 216, 234, 0.1)',
      fill: true,
      tension: 0.4,
      yAxisID: 'y1',
      pointBackgroundColor: '#A8D8EA',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 5,
    },
  ],
}))

// 图表选项
const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index' as const,
    intersect: false,
  },
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          family: '"Noto Sans SC", sans-serif',
          size: 12,
        },
      },
    },
    title: {
      display: false,
    },
    tooltip: {
      backgroundColor: 'rgba(93, 90, 111, 0.9)',
      titleFont: { family: '"Noto Sans SC", sans-serif' },
      bodyFont: { family: '"Noto Sans SC", sans-serif' },
      cornerRadius: 12,
      padding: 12,
    },
  },
  scales: {
    x: {
      grid: {
        color: 'rgba(255, 182, 193, 0.1)',
      },
      ticks: {
        font: {
          family: '"Noto Sans SC", sans-serif',
          size: 11,
        },
        color: '#8B87A0',
      },
    },
    y: {
      type: 'linear' as const,
      display: true,
      position: 'left' as const,
      title: {
        display: true,
        text: '身高 (cm)',
        color: '#FFB6C1',
        font: {
          family: '"Noto Sans SC", sans-serif',
          size: 12,
        },
      },
      grid: {
        color: 'rgba(255, 182, 193, 0.1)',
      },
      ticks: {
        color: '#FFB6C1',
      },
    },
    y1: {
      type: 'linear' as const,
      display: true,
      position: 'right' as const,
      title: {
        display: true,
        text: '体重 (kg)',
        color: '#A8D8EA',
        font: {
          family: '"Noto Sans SC", sans-serif',
          size: 12,
        },
      },
      grid: {
        drawOnChartArea: false,
      },
      ticks: {
        color: '#A8D8EA',
      },
    },
  },
}))
</script>

<template>
  <div class="card" v-if="records.length > 0">
    <h3 class="font-cute text-lg text-baby-dark mb-4">📊 成长曲线</h3>
    <div class="h-64 md:h-80">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>
