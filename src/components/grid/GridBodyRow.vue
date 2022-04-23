<script lang="ts">
import { VNode } from "vue";
import GridBodyCell from "@/components/grid/GridBodyCell.vue";
import { defineComponent, h, PropType, inject } from "@vue/composition-api";
import { AnyGridColumn } from "@/components/grid/columns/AbstractColumn";
import {
  AnyWithRowIndex,
  GridState,
  rowIndex,
} from "@/components/grid/GridState";
import { GridConfiguration } from "@/components/grid/GridConfiguration";

export default defineComponent({
  name: "GridBodyRow",
  props: {
    item: {
      type: Object as PropType<AnyWithRowIndex>,
      required: true,
    },
    columns: {
      type: Array as PropType<AnyGridColumn[]>,
      required: true,
    },
    columnStartIndex: {
      type: Number,
      required: true,
    },
  },
  setup(props, context) {
    const gridConfiguration =
      inject<GridConfiguration<any>>("gridConfiguration")!;
    const gridState = inject<GridState>("gridState")!;

    // ONLY USE IN CONTEXT OF RENDERING
    const buildCell = (column: AnyGridColumn, columnIndex: number) => {
      const currentColumnIndex = props.columnStartIndex + columnIndex;
      return h(GridBodyCell, {
        key: column.key,
        style: {
          width: gridState.columnStates[column.key].width + "px",
          "justify-content": column.alignment,
        },
        class: {
          "grid-row-cell": true,
          "grid-column-dragged": gridState.columnDragged?.key === column.key,
        },
        props: { item: props.item, column },
        attrs: {
          role: "gridcell",
          "col-index": currentColumnIndex,
          tabindex: -1,
        },
        nativeOn: {
          keydown: (event: KeyboardEvent) => {
            if (event.key === "Tab") {
              // Prevent normal tabbing in this case
              event.preventDefault();

              // Get the parent, so we can get our current row index
              const parentElement = (event.target as HTMLElement)
                .parentElement!;
              const targetRowIndex = Number(parentElement.ariaRowIndex);

              // Our next to focus element is +1 in column index
              const nextToFocus = document.querySelector(
                `[aria-rowindex="${targetRowIndex}"] > [col-index="${
                  currentColumnIndex + 1
                }"]`
              );

              // If we have a next child, focus that
              if (nextToFocus) {
                (nextToFocus as HTMLElement).focus();
              } else {
                // Otherwise, go to the next row's first child
                (
                  document.querySelector(
                    `[aria-rowindex="${targetRowIndex + 1}"`
                  )?.firstChild as HTMLElement
                ).focus();
              }
            }
          },
        },
      });
    };

    return {
      gridState,
      gridConfiguration,
      buildCell,
    };
  },
  render(): VNode {
    const isRowClickable = !!(
      this.gridConfiguration.rowAction || this.gridConfiguration.rowRoute
    );

    const classes = {
      "grid-row-clickable": isRowClickable,
      "grid-row-hovered": this.item[rowIndex] === this.gridState.rowHovered,
    };

    const cells = this.columns.map((column, index) =>
      this.buildCell(column, index)
    );

    if (this.gridConfiguration.rowRoute) {
      return h(
        "router-link",
        {
          props: { to: this.gridConfiguration.rowRoute(this.item) },
          class: classes,
        },
        cells
      );
    }

    const rowType = this.gridConfiguration.rowAction ? "a" : "div";

    return h(
      rowType,
      {
        class: classes,
        on: {
          click: () => {
            if (isRowClickable) {
              this.gridConfiguration.rowAction!(this.item);
            }
          },
        },
      },
      cells
    );
  },
});
</script>
