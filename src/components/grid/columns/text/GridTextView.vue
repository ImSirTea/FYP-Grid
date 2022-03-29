<template>
  <span>{{ value }}</span>
</template>

<script lang="ts">
import { TextColumn } from "@/components/grid/columns/text/TextColumn";
import { defineComponent, PropType } from "@vue/composition-api";

export default defineComponent({
  name: "GridTextView",
  props: {
    item: {
      type: Object as PropType<Record<string, any>>,
      required: true,
    },
    column: {
      type: Object as PropType<TextColumn<any>>,
      required: true,
    },
    value: {
      type: String,
      required: false,
    },
  },
});
</script>
