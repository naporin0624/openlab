<template>
  <div></div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import mqtt, { Client } from "mqtt";

export default class MqttGraph extends Vue {
  public client: Client = mqtt.connect("192.168.11.85", {
    port: 1884,
    username: "numalab",
    password: "Numa0Lab"
  });
}
</script>
