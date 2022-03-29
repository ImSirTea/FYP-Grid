<template>
  <span>{{ value }}</span>
</template>

<script lang="ts">
import { NumberColumn } from "@/components/grid/columns/number/NumberColumn";
import { defineComponent, PropType } from "@vue/composition-api";

export default defineComponent({
  name: "GridNumberView",
  props: {
    item: {
      type: Object as PropType<Record<string, any>>,
      required: true,
    },
    column: {
      type: Object as PropType<NumberColumn<any>>,
      required: true,
    },
    value: {
      type: Number,
      required: false,
    },
  },
});
</script>
