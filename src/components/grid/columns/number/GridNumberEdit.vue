<template>
  <span>{{ value }}</span>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";

export default defineComponent({
  name: "GridNumberEdit",
  props: {
    value: {
      type: Number,
      required: true,
    },
  },
});
</script>
