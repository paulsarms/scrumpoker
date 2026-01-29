<template>
  <div
    class="bullet"
    :style="{
      left: `${x * 100}%`,
      top: `${y * 100}%`,
      transform: `translate(-50%, -50%) rotate(${rotation}rad)`
    }"
  />
</template>

<script setup>
defineProps({
  x: {
    type: Number,
    required: true
  },
  y: {
    type: Number,
    required: true
  },
  rotation: {
    type: Number,
    required: true
  }
})
</script>

<style scoped>
.bullet {
  position: absolute;
  width: 12px;
  height: 6px;
  background: var(--color-black);
  border-radius: 3px;
  box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.3);
}

.bullet::after {
  content: '';
  position: absolute;
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 4px;
  background: linear-gradient(to left, #ff6b35, #ffcc00, transparent);
  border-radius: 2px;
}
</style>
