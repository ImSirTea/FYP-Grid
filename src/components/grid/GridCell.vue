<template>
  <div
    :class="{ 'grid-cell-editing': isEditing }"
    @click="onCellClick"
    @dblclick="onCellDoubleClick"
  >
    <component
      v-bind="$attrs"
      v-model="internalValue"
      :is="column.renderer"
      :item="item"
      :column="column"
      :is-editing="isEditing"
      role="gridcell"
      :col-key="column.key"
    />
  </div>
</template>

<script lang="ts">
import { AnyGridColumn } from "@/components/grid/columns/AbstractColumn";
import {
  AnyWithRowIndex,
  GridState,
  rowIndex,
} from "@/components/grid/GridState";
import {
  defineComponent,
  PropType,
  computed,
  inject,
} from "@vue/composition-api";

export default defineComponent({
  name: "GridCell",
  props: {
    item: {
      type: Object as PropType<AnyWithRowIndex>,
      required: true,
    },
    column: {
      type: Object as PropType<AnyGridColumn>,
      required: true,
    },
  },
  setup(props, context) {
    const gridState = inject<GridState>("gridState")!;

    // Decides if we show view or edit renderers
    const isEditing = computed(() => {
      if (!gridState.cellEdited) {
        return false;
      }

      const { rowId, columnKey } = gridState.cellEdited;
      return rowId === props.item[rowIndex] && columnKey === props.column.key;
    });

    const internalValue = computed({
      get: () => props.column.value(props.item),
      set: (value) => context.emit("input", value),
    });

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
          rowId: props.item[rowIndex],
          columnKey: props.column.key,
        };
      } else {
        // TODO: Show error state
      }
    };

    return {
      isEditing,
      internalValue,
      onCellClick,
      onCellDoubleClick,
    };
  },
});
</script>
