<template>
  <span>{{ value }}</span>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";

export default defineComponent({
  name: "GridTextEdit",
  props: {
    value: {
      type: String,
      required: true,
    },
  },
});
</script>
