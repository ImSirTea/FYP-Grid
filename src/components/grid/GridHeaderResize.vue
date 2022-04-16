<template>
  <div
    class="grid-header-resize"
    draggable
    @click="onResizeClick"
    @dblclick="onResizeDblClick"
    @dragstart="dragStart"
    @drag="drag"
    @dragover="dragOver"
    @dragend="dragEnd"
  />
</template>

<script lang="ts">
import { AnyGridColumn } from "@/components/grid/columns/AbstractColumn";
import { GridState } from "@/components/grid/GridState";
import { defineComponent, PropType, inject } from "@vue/composition-api";
import { debounce } from "lodash";

export default defineComponent({
  name: "GridHeaderResize",
  props: {
    column: {
      type: Object as PropType<AnyGridColumn>,
      required: true,
    },
  },
  setup(props, context) {
    const gridState = inject<GridState>("gridState")!;
    let lastResizeX: number = 0;

    const onResizeClick = (event: PointerEvent) => {
      event.stopPropagation();
      event.preventDefault();
    };

    const onResizeDblClick = () => {
      const relevantCells = Array.from(
        document.querySelectorAll(
          `[role=gridcell] > [col-key=${props.column.key}]`
        )
      );
      // Largest size, plus the parent's padding, and extra for kindness
      const largestWidth = Math.max(
        ...relevantCells.map((cell) => {
          //const parentPadding = cell.parentElement.wid
          const parentStyle = window.getComputedStyle(cell.parentElement!);

          // Strips out all non-number values
          const parentPaddingLeft = Number(
            parentStyle.paddingLeft.replace(/\D/g, "")
          );

          const parentPaddingRight = Number(
            parentStyle.paddingLeft.replace(/\D/g, "")
          );

          return (
            cell.scrollWidth + parentPaddingLeft + parentPaddingRight + 1 // +1 so we aren't a tiny fraction off
          );
        })
      );

      gridState.columnStates[props.column.key].width = largestWidth;
    };

    const dragStart = (event: DragEvent) => {
      context.emit("is-resizing", true);
      lastResizeX = event.clientX;

      // Hide ghost when resizing
      event.dataTransfer!.setDragImage(new Image(), 0, 0);
    };

    const dragOver = (event: DragEvent) => {
      event.preventDefault();
    };

    const drag = debounce((event: DragEvent) => {
      // Don't resize if there is no X data provided
      if (!event.clientX) {
        return;
      }

      const resizeDelta = event.clientX - lastResizeX;
      const width = gridState.columnStates[props.column.key].width;
      gridState.columnStates[props.column.key].width = width + resizeDelta;
      lastResizeX = event.clientX;
    });

    const dragEnd = () => {
      context.emit("is-resizing", false);
    };

    return {
      onResizeClick,
      onResizeDblClick,

      dragStart,
      dragOver,
      drag,
      dragEnd,
    };
  },
});
</script>
