<template>
  <span>{{ value }}</span>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";

export default defineComponent({
  name: "GridTextView",
  props: {
    value: {
      type: String,
      required: true,
    },
  },
});
</script>
