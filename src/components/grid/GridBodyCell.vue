<template>
  <div
    :class="{ 'grid-cell-focused': isFocused, 'grid-cell-editing': isEditing }"
    @click="onClick"
    @dblclick="onDoubleClick"
    @keydown="onKeyDown"
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
      gridState.cellFocused = {
        rowId: props.item[rowIndex],
        columnKey: props.column.key,
      };

      // If the cell we clicked on isn't the one we are editing, clear our edit
      if (!isEditing.value) {
        gridState.cellEdited = null;
      }

      // Will also need preventDefault so we don't click link rows if we want this behaviour
      if (props.column.isEditable) {
        event.stopPropagation();
        event.preventDefault();
        return;
      }
    };

    // TODO: Add mobile support for dbl click
    const onDoubleClick = (event: PointerEvent) => {
      if (props.column.isEditable) {
        gridState.cellEdited = {
          rowId: props.item[rowIndex],
          columnKey: props.column.key,
        };
      } else {
        // TODO: Show error state
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "Tab": {
          // Prevent normal tabbing in this case
          event.preventDefault();

          // Get the parent, so we can get our current row index
          const parentElement = (event.target as HTMLElement).parentElement!;
          const targetRowIndex = Number(parentElement.ariaRowIndex);

          // Our next to focus element is +1 in column index
          const nextToFocus = document.querySelector(
            `[aria-rowindex="${targetRowIndex}"] > [aria-colindex="${
              props.columnIndex + 1
            }"]`
          ) as HTMLElement;

          // If we have a next child, focus that
          if (nextToFocus) {
            nextToFocus.focus();
          } else {
            // Otherwise, go to the next row's first child
            const nextRow = document.querySelector(
              `[aria-rowindex="${targetRowIndex + 1}"`
            )?.firstChild as HTMLElement;

            nextRow.focus();
          }
          break;
        }
        case "ArrowRight":
        
      }
      console.log(event.key, props.item[rowIndex], props.column.key);
    };

    const focusAdjacentCell = (rowMod: number, columnMod: number) => {
      const currentRowIndex = props.item[rowIndex]
      const cellToTarget = document.querySelector(`[aria-rowindex="${}"`)
    }

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
      cellErrors,
    };
  },
});
</script>
