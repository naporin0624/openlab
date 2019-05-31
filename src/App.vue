<template>
  <v-app>
    <v-toolbar app color="#FFC107" flat>
      <v-toolbar-title class="headline text-uppercase">
        <span to="/">Open Lab</span>
        <span class="font-weight-light">Welcome to Numalab...</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn flat to="/">
        <span class="mr-2">Home</span>
      </v-btn>
      <v-btn flat to="/face-emotion">
        <span class="mr-2">DEMO1</span>
      </v-btn>
    </v-toolbar>

    <v-content>
      <transition>
        <router-view></router-view>
      </transition>
    </v-content>
  </v-app>
</template>

<style scoped>
.v-enter-active {
  transition: opacity 1.5s;
}
.v-enter {
  opacity: 0;
}
</style>

<script>
export default {
  name: "App",
  data() {
    return {
      //
    };
  }
};
</script>
