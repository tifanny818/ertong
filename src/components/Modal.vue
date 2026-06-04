<script setup lang="ts">
import { X } from 'lucide-vue-next'

// 属性
defineProps<{
  show: boolean
  title: string
}>()

// 事件
defineEmits<{
  close: []
}>()
</script>

<template>
  <teleport to="body">
    <transition name="modal">
      <div v-if="show" class="fixed inset-0 z-[90] flex items-center justify-center p-4">
        <!-- 遮罩层 -->
        <div class="absolute inset-0 bg-black/50" @click="$emit('close')"></div>

        <!-- 模态框内容 -->
        <div class="relative bg-baby-warm rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto z-10">
          <!-- 头部 -->
          <div class="sticky top-0 bg-baby-warm rounded-t-3xl px-6 py-4 border-b border-baby-pink/20 flex items-center justify-between">
            <h3 class="font-cute text-xl text-baby-dark">{{ title }}</h3>
            <button
              @click="$emit('close')"
              class="w-8 h-8 rounded-full bg-baby-pink/20 flex items-center justify-center text-baby-dark hover:bg-baby-pink/40 transition-all"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- 内容插槽 -->
          <div class="p-6">
            <slot></slot>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
