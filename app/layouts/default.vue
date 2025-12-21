<template>
  <div class="flex flex-col min-h-screen">
    <MyHeader />

    <UMain class="flex-1">
      <slot />
    </UMain>
    
    <MyFooter />
  </div>
</template>