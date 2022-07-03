<template>
  <div class="flex flex-col justify-center items-center w-screen h-screen">
    <p class="m-2 text-black text-4xl">
      このデバイスには対応していません。
    </p>
    <button class="btn btn-outline" @click="$router.go(-1)">戻る</button>
  </div>
</template>
