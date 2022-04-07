<script lang="ts">
import { VNode } from "vue";
import GridCell from "@/components/grid/GridCell.vue";
import { GridConfiguration } from "@/components/grid/GridConfiguration";
import { defineComponent, h, PropType, inject } from "@vue/composition-api";
import { GridState } from "@/components/grid/GridState";
import { GridManager } from "@/components/grid/GridManager";
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
    const buildCell = (column: AnyGridColumn) => {
      return h(GridCell, {
        style: {
          width: gridState.columnStates[column.key].width + "px",
        },
        class: "grid-row-cell",
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

    const leftCells: VNode[] = [];
    const centreCells: VNode[] = none.map((column) => this.buildCell(column));
    const rightCells: VNode[] = [];

    left.forEach((column, index) => {
      leftCells.push(this.buildCell(column));
    });

    right.forEach((column, index) => {
      rightCells.push(this.buildCell(column));
    });

    if (this.gridConfiguration.rowRoute) {
      return h(
        "router-link",
        {
          props: { to: this.gridConfiguration.rowRoute(this.item) },
          class: { "grid-row-clickable": isRowClickable },
        },
        [leftCells, centreCells, rightCells]
      );
    }

    const rowType = this.gridConfiguration.rowAction ? "a" : "div";

    return h(rowType, { class: { "grid-row-clickable": isRowClickable } }, [
      leftCells,
      centreCells,
      rightCells,
    ]);
  },
});
</script>
