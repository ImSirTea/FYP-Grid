<template>
  <div ref="container" @click="onCellClick">
    <component
      ref="renderer"
      v-bind="$attrs"
      :is="component"
      :item="item"
      :column="column"
      :value="internalValue"
      @input="$emit('input', value)"
      role="gridcell"
      :col-key="column.key"
    />
  </div>
</template>

<script lang="ts">
import { AnyGridColumn } from "@/components/grid/columns/Column";
import { AnyWithGridIndex } from "@/components/grid/GridState";
import { defineComponent, PropType, ref, computed } from "@vue/composition-api";
import Vue from "vue";

export default defineComponent({
  name: "GridCell",
  props: {
    item: {
      type: Object as PropType<AnyWithGridIndex>,
      required: true,
    },
    column: {
      type: Object as PropType<AnyGridColumn>,
      required: true,
    },
  },
  setup(props, context) {
    // Decides if we show view or edit renderers
    const readonly = ref(true);

    // References to DOM elements, used for overflow detection and click target detection
    const container = ref<HTMLAnchorElement | null>(null);
    const renderer = ref<Vue | null>(null);

    const internalValue = computed({
      get: () => props.column.value(props.item),
      set: (value) => context.emit("input", value),
    });

    const component = computed(() =>
      readonly.value ? props.column.viewRenderer : props.column.editRenderer
    );

    // Cells handle row clicks so they can do cell-specific actions instead of row actions if needed
    const onCellClick = (event: PointerEvent) => {
      if (renderer.value && container.value) {
        const isOverflowing =
          renderer.value.$el.scrollWidth > container.value.clientWidth;

        if (isOverflowing) {
          console.log("Show truncated text");
          event.preventDefault();
        }
      }
    };

    return {
      component,
      internalValue,
      onCellClick,
      container,
      renderer,
    };
  },
});
</script>
