<template>
  <span>{{ value }}</span>
</template>

<script lang="ts">
import { TextColumn } from "@/components/grid/columns/text/TextColumn";
import { AnyWithRowIndex } from "@/components/grid/GridState";
import { defineComponent, PropType } from "@vue/composition-api";

export default defineComponent({
  name: "GridTextView",
  props: {
    item: {
      type: Object as PropType<AnyWithRowIndex>,
      required: true,
    },
    column: {
      type: Object as PropType<TextColumn<AnyWithRowIndex>>,
      required: true,
    },
    value: {
      type: String,
      required: false,
    },
  },
});
</script>
