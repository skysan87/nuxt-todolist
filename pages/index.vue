<template>
  <div class="container">
    <div>
      <h1>What to do today</h1>
      <h2>-- This is index page. --</h2>
      <nuxt-link to="/todolist">
        TodoList
      </nuxt-link>
    </div>
  </div>
</template>

<style scoped>
.container {
  @apply min-h-screen flex justify-center items-center text-center mx-auto;
}
</style>
