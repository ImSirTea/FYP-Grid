<script lang="ts">
import { VNode } from "vue";
import GridCell from "@/components/grid/GridCell.vue";
import { defineComponent, h, PropType, inject } from "@vue/composition-api";
import { AnyGridColumn } from "@/components/grid/columns/AbstractColumn";
import { AnyWithRowIndex, GridState } from "@/components/grid/GridState";
import { GridConfiguration } from "@/components/grid/GridConfiguration";

export default defineComponent({
  name: "GridRow",
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
      return h(GridCell, {
        style: {
          width: gridState.columnStates[column.key].width + "px",
          "justify-content": column.alignment,
        },
        class: {
          "grid-row-cell": true,
          "grid-column-dragged": gridState.columnDragged?.key === column.key,
        },
        props: { item: props.item, column },
        on: {
          input: (value) => {
            column.setValue(props.item, value);
            gridState.isDirty = true;
          },
        },
        attrs: {
          role: "gridcell",
          tabindex: props.columnStartIndex + columnIndex,
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

    if (this.gridConfiguration.rowRoute) {
      return h(
        "router-link",
        {
          props: { to: this.gridConfiguration.rowRoute(this.item) },
          class: { "grid-row-clickable": isRowClickable },
        },
        this.columns.map((column, index) => this.buildCell(column, index))
      );
    }

    const rowType = this.gridConfiguration.rowAction ? "a" : "div";

    return h(
      rowType,
      {
        class: {
          "grid-row-clickable": isRowClickable,
        },
        on: {
          click: () => {
            if (isRowClickable) {
              this.gridConfiguration.rowAction!(this.item);
            }
          },
        },
      },
      this.columns.map((column, index) => this.buildCell(column, index))
    );
  },
});
</script>
