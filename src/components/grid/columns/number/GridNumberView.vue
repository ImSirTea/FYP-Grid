<template>
  <span>{{ value }}</span>
</template>

<script lang="ts">
import { NumberColumn } from "@/components/grid/columns/number/NumberColumn";
import { AnyWithRowIndex } from "@/components/grid/GridState";
import { defineComponent, PropType } from "@vue/composition-api";

export default defineComponent({
  name: "GridNumberView",
  props: {
    item: {
      type: Object as PropType<AnyWithRowIndex>,
      required: true,
    },
    column: {
      type: Object as PropType<NumberColumn<AnyWithRowIndex>>,
      required: true,
    },
    value: {
      type: Number,
      required: false,
    },
  },
});
</script>
