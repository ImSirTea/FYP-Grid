<script lang="ts">
import { VNode } from "vue";
import GridCell from "@/components/grid/GridCell.vue";
import { GridConfiguration } from "@/components/grid/GridConfiguration";
import { defineComponent, h, PropType, inject } from "@vue/composition-api";
import { GridState } from "@/components/grid/GridState";
import { GridManager, PinnedColumnGroups } from "@/components/grid/GridManager";
import { AnyGridColumn, PinTypes } from "@/components/grid/columns/Column";

export default defineComponent({
  name: "GridRow",
  props: {
    index: {
      type: Number,
      required: true,
    },
    item: {
      type: Object as PropType<Record<string, any>>,
      required: true,
    },
  },
  setup(props) {
    const gridConfiguration =
      inject<GridConfiguration<Record<string, any>>>("gridConfiguration")!;
    const gridState = inject<GridState>("gridState")!;
    const gridManager = inject<GridManager>("gridManager")!;

    // ONLY USE IN CONTEXT OF RENDERING
    const buildCell = (column: AnyGridColumn, pin: PinTypes) => {
      return h(GridCell, {
        style: {
          width: gridState.columnStates[column.key].width + "px",
          left: pin === "left" ? 0 : undefined,
          right: pin === "right" ? 0 : undefined,
        },
        class: { "grid-row-cell": true, sticky: pin !== "none" },
        props: { item: props.item, column },
        on: {
          input: (value) => {
            console.log(
              "Logic on assignment will need to be applied",
              value,
              props.item
            );
          },
        },
      });
    };

    return {
      gridState,
      gridConfiguration,
      gridManager,
      buildCell,
    };
  },
  render(): VNode {
    const isRowClickable = !!(
      this.gridConfiguration.rowAction || this.gridConfiguration.rowRoute
    );

    const { left, none, right } =
      this.gridManager.pinnedSortedAndVisibleColumns;

    const cells = {
      left: left.map((column) => this.buildCell(column, "left")),
      none: none.map((column) => this.buildCell(column, "none")),
      right: right.map((column) => this.buildCell(column, "right")),
    };

    if (this.gridConfiguration.rowRoute) {
      return h(
        "router-link",
        {
          props: { to: this.gridConfiguration.rowRoute(this.item) },
          class: { "grid-row-clickable": isRowClickable },
        },
        [cells.left, cells.none, cells.right]
      );
    }

    const rowType = this.gridConfiguration.rowAction ? "a" : "div";

    return h(rowType, { class: { "grid-row-clickable": isRowClickable } }, [
      cells.left,
      cells.none,
      cells.right,
    ]);
  },
});
</script>
