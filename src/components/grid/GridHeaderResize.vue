<template>
  <div
    class="grid-header-resize"
    @click="onResizeClick"
    @dblclick="onResizeDblClick"
    @pointerdown="dragStart"
    @pointermove="drag"
    @pointerup="dragEnd"
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
    let lastResizeX: number | null = null;

    const onResizeClick = (event: PointerEvent) => {
      event.stopPropagation();
      event.preventDefault();
    };

    const onResizeDblClick = () => {
      console.log("resize dbl");
      const relevantCells = Array.from(
        document.querySelectorAll(
          `[role=gridcell] > [col-key=${props.column.key}]`
        )
      );

      console.log(relevantCells);

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

          console.log(
            cell.scrollWidth + parentPaddingLeft + parentPaddingRight + 1
          );

          return (
            cell.scrollWidth + parentPaddingLeft + parentPaddingRight + 1 // +1 so we aren't a tiny fraction off
          );
        })
      );

      console.log(largestWidth);

      gridState.columnStates[props.column.key].width = largestWidth;
    };

    const dragStart = (event: PointerEvent) => {
      context.emit("is-resizing", true);
      lastResizeX = event.clientX;

      // Allows the target element to remain the pointer event focus, so events go to the orignal target
      // rather than the new one if you hover over something else
      (event.target as Element).setPointerCapture(event.pointerId);
    };

    const drag = debounce((event: PointerEvent) => {
      // Don't resize if there is no X data provided
      if (!event.clientX || lastResizeX === null) {
        return;
      }

      const resizeDelta = event.clientX - lastResizeX;
      const width = gridState.columnStates[props.column.key].width;
      gridState.columnStates[props.column.key].width = width + resizeDelta;
      lastResizeX = event.clientX;
    });

    const dragEnd = (event: PointerEvent) => {
      lastResizeX = null;
      (event.target as Element).releasePointerCapture(event.pointerId);
      context.emit("is-resizing", false);
    };

    return {
      onResizeClick,
      onResizeDblClick,

      dragStart,
      drag,
      dragEnd,
    };
  },
});
</script>
