<template>
  <div
    :class="{ 'grid-cell-editing': isEditing }"
    @click="onCellClick"
    @dblclick="onCellDoubleClick"
  >
    <component
      v-bind="$attrs"
      :is="component"
      :item="item"
      :column="column"
      :value="internalValue"
      @input="$emit('input', $event)"
      role="gridcell"
      :col-key="column.key"
    />
  </div>
</template>

<script lang="ts">
import { AnyGridColumn } from "@/components/grid/columns/Column";
import { GridManager } from "@/components/grid/GridManager";
import { AnyWithGridIndex } from "@/components/grid/GridState";
import {
  defineComponent,
  PropType,
  computed,
  inject,
  ref,
} from "@vue/composition-api";
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
    const { gridState } = inject<GridManager>("gridManager")!;

    // Decides if we show view or edit renderers
    const isEditing = computed(() => {
      if (!gridState.cellEdited) {
        return false;
      }

      const { rowId, columnKey } = gridState.cellEdited;
      return (
        rowId === props.item["_grid-index"] && columnKey === props.column.key
      );
    });

    const internalValue = computed({
      get: () => props.column.value(props.item),
      set: (value) => context.emit("input", value),
    });

    const component = computed(() =>
      isEditing.value ? props.column.editRenderer : props.column.viewRenderer
    );

    // Cells handle row clicks so they can do cell-specific actions instead of row actions if needed
    const onCellClick = (event: PointerEvent) => {
      // Will also need preventDefault so we don't click link rows if we want this behaviour
      if (props.column.isEditable) {
        event.stopPropagation();
        return;
      }
    };

    const onCellDoubleClick = (event: PointerEvent) => {
      if (props.column.isEditable) {
        gridState.cellEdited = {
          rowId: props.item["_grid-index"],
          columnKey: props.column.key,
        };
      } else {
        // TODO: Show error state
      }
    };

    return {
      isEditing,
      component,
      internalValue,
      onCellClick,
      onCellDoubleClick,
    };
  },
});
</script>
