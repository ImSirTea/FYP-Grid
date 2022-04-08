<template>
  <span>{{ value }}</span>
</template>

<script lang="ts">
import { TextColumn } from "@/components/grid/columns/text/TextColumn";
import { AnyWithGridIndex } from "@/components/grid/GridState";
import { defineComponent, PropType } from "@vue/composition-api";

export default defineComponent({
  name: "GridTextView",
  props: {
    item: {
      type: Object as PropType<AnyWithGridIndex>,
      required: true,
    },
    column: {
      type: Object as PropType<TextColumn<AnyWithGridIndex>>,
      required: true,
    },
    value: {
      type: String,
      required: false,
    },
  },
});
</script>
