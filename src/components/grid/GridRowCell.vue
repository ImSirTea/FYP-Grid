<template>
  <div
    :class="{ 'grid-cell-editing': isEditing }"
    @click="onCellClick"
    @dblclick="onCellDoubleClick"
  >
    <component
      :value="internalValue"
      :is="column.renderer"
      :item="item"
      :column="column"
      :is-editing="isEditing"
      :col-key="column.key"
      @input="updateValue"
    />
    <div v-if="cellErrors.length" class="grid-row-validation-error"></div>
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
  ref,
  watch,
} from "@vue/composition-api";

export default defineComponent({
  name: "GridRowCell",
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
    const internalValue = ref(props.column.value(props.item));
    const cellErrors = computed(() =>
      props.column.rules
        .map((rule) => rule(internalValue.value))
        .filter((ruleResult) => ruleResult !== true)
    );

    // Decides if we show view or edit renderers
    const isEditing = computed(() => {
      if (!gridState.cellEdited) {
        return false;
      }

      const { rowId, columnKey } = gridState.cellEdited;
      return rowId === props.item[rowIndex] && columnKey === props.column.key;
    });

    // Cells handle row clicks so they can do cell-specific actions instead of row actions if needed
    const onCellClick = (event: PointerEvent) => {
      // Will also need preventDefault so we don't click link rows if we want this behaviour
      if (props.column.isEditable) {
        event.stopPropagation();
        return;
      }
    };

    // TODO: Add mobile support for dbl click
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

    const updateValue = (newValue: any) => {
      props.column.setValue(props.item, newValue);
      internalValue.value = newValue;
      gridState.isDirty = true;
      validateCell();
    };

    // Make sure we're always updating on item change
    watch(
      () => props.item,
      () => {
        internalValue.value = props.column.value(props.item);
      },
      { deep: true }
    );

    const validateCell = () => {
      // If we have errors, add them to our global record so we can prevent saving, or remove if not
      if (cellErrors.value.length) {
        gridState.addCellError(props.item[rowIndex], props.column.key);
      } else {
        gridState.removeCellError(props.item[rowIndex], props.column.key);
      }
    };

    return {
      isEditing,
      internalValue,
      updateValue,
      onCellClick,
      onCellDoubleClick,
      cellErrors,
    };
  },
});
</script>
