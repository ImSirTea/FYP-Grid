<script lang="ts">
import { VNode } from "vue";
import GridCell from "@/components/grid/GridCell.vue";
import { defineComponent, h, PropType, inject } from "@vue/composition-api";
import { AnyWithGridIndex } from "@/components/grid/GridState";
import { GridManager } from "@/components/grid/GridManager";
import { AnyGridColumn } from "@/components/grid/columns/Column";

export default defineComponent({
  name: "GridRow",
  props: {
    index: {
      type: Number,
      required: true,
    },
    item: {
      type: Object as PropType<AnyWithGridIndex>,
      required: true,
    },
    columns: {
      type: Array as PropType<AnyGridColumn[]>,
      required: true,
    },
  },
  setup(props, context) {
    const { gridState, gridConfiguration } =
      inject<GridManager>("gridManager")!;

    // ONLY USE IN CONTEXT OF RENDERING
    const buildCell = (column: AnyGridColumn) => {
      return h(GridCell, {
        style: {
          width: gridState.columnStates[column.key].width + "px",
        },
        class: {
          "grid-row-cell": true,
          "grid-column-dragged": gridState.columnDragged?.key === column.key,
        },
        props: { item: props.item, column },
        on: {
          input: (value) => {
            column.setValue(props.item, value);
            context.emit("update:items");
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

    if (this.gridConfiguration.rowRoute) {
      return h(
        "router-link",
        {
          props: { to: this.gridConfiguration.rowRoute(this.item) },
          class: { "grid-row-clickable": isRowClickable },
        },
        this.columns.map((column) => this.buildCell(column))
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
      this.columns.map((column) => this.buildCell(column))
    );
  },
});
</script>
