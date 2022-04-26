<template>
  <div
    :class="{ 'grid-cell-focused': isFocused, 'grid-cell-editing': isEditing }"
    @click="onClick"
    @dblclick="onDoubleClick"
    @keydown="onKeyDown"
    @focus="onFocus"
  >
    <component
      :value="internalValue"
      :is="column.renderer"
      :item="item"
      :column="column"
      :is-editing="isEditing"
      :col-key="column.key"
      autofocus
      @input="updateValue"
    />
    <div v-if="cellErrors.length" class="grid-row-validation-error" />
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
import { GridManager } from "@/components/grid/GridManager";

export default defineComponent({
  name: "GridBodyCell",
  props: {
    item: {
      type: Object as PropType<AnyWithRowIndex>,
      required: true,
    },
    column: {
      type: Object as PropType<AnyGridColumn>,
      required: true,
    },
    columnIndex: {
      type: Number,
      required: true,
    },
  },
  setup(props, context) {
    const gridState = inject<GridState>("gridState")!;
    const gridManager = inject<GridManager>("gridManager")!;
    const internalValue = ref(props.column.value(props.item));
    const cellErrors = computed(() =>
      props.column.rules
        .map((rule) => rule(internalValue.value))
        .filter((ruleResult) => ruleResult !== true)
    );

    // Decides if we show view or edit renderers
    const isFocused = computed(() => {
      if (!gridState.cellFocused) {
        return false;
      }

      const { rowId, columnKey } = gridState.cellFocused;
      return rowId === props.item[rowIndex] && columnKey === props.column.key;
    });

    // Decides if we show view or edit renderers
    const isEditing = computed(() => {
      if (!gridState.cellEdited) {
        return false;
      }

      const { rowId, columnKey } = gridState.cellEdited;
      return rowId === props.item[rowIndex] && columnKey === props.column.key;
    });

    // Cells handle row clicks so they can do cell-specific actions instead of row actions if needed
    const onClick = (event: PointerEvent) => {
      onFocus();

      // Will also need preventDefault so we don't click link rows if we want this behaviour
      if (props.column.isEditable) {
        event.stopPropagation();
        event.preventDefault();
        return;
      }
    };

    const toggleEditState = () => {
      if (props.column.isEditable) {
        gridState.cellEdited = {
          rowId: props.item[rowIndex],
          columnKey: props.column.key,
        };
      }
    };

    // TODO: Add mobile support for dbl click
    const onDoubleClick = (event: PointerEvent) => {
      if (props.column.isEditable) {
        toggleEditState();
      } else {
        // TODO: Show unable to edit state
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowDown":
          focusAdjacentCell(event, 0, 1);
          break;

        case "ArrowUp":
          focusAdjacentCell(event, 0, -1);
          break;

        case "ArrowLeft":
          focusAdjacentCell(event, -1, 0);
          break;

        case "Tab":
        case "ArrowRight":
          focusAdjacentCell(event, 1, 0);
          break;

        case " ":
          event.preventDefault();
          gridState.toggleRowSelect(props.item[rowIndex]);
          break;

        case "Enter":
          event.preventDefault();
          toggleEditState();
          break;
      }
    };

    const focusAdjacentCell = (
      event: KeyboardEvent,
      columnMod: number,
      rowMod: number
    ) => {
      event.preventDefault();

      const currentRow = (event.target as HTMLElement).closest("[role='row']")!;
      const currentRowIndex = Number(currentRow.ariaRowIndex!);
      let targetRowIndex = currentRowIndex + rowMod;
      let targetColumnIndex = props.columnIndex + columnMod;

      if (targetColumnIndex < 1) {
        targetRowIndex--;
        targetColumnIndex = gridManager.visibleColumns.length;
      }

      if (targetColumnIndex > gridManager.visibleColumns.length) {
        targetRowIndex++;
        targetColumnIndex = 1;
      }

      let cellToTarget = document.querySelector(
        `[aria-rowindex="${targetRowIndex}"] > [aria-colindex="${targetColumnIndex}"]`
      );

      (cellToTarget as HTMLElement | null)?.focus();
    };

    const onFocus = () => {
      gridState.cellFocused = {
        rowId: props.item[rowIndex],
        columnKey: props.column.key,
      };

      // If the cell we clicked on isn't the one we are editing, clear our edit
      if (!isEditing.value) {
        gridState.cellEdited = null;
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
      isFocused,
      isEditing,
      internalValue,
      updateValue,
      onClick,
      onDoubleClick,
      onKeyDown,
      onFocus,
      cellErrors,
    };
  },
});
</script>
