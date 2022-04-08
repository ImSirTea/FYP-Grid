<template>
  <span>{{ value }}</span>
</template>

<script lang="ts">
import { NumberColumn } from "@/components/grid/columns/number/NumberColumn";
import { AnyWithGridIndex } from "@/components/grid/GridState";
import { defineComponent, PropType } from "@vue/composition-api";

export default defineComponent({
  name: "GridNumberView",
  props: {
    item: {
      type: Object as PropType<AnyWithGridIndex>,
      required: true,
    },
    column: {
      type: Object as PropType<NumberColumn<AnyWithGridIndex>>,
      required: true,
    },
    value: {
      type: Number,
      required: false,
    },
  },
});
</script>
