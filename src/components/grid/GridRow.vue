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
    /**
     *
     * @param column The column relevant to the cell
     * @param pin The column's pin
     * @param offset How far along the cell should get stuck
     * @param isLast For applying borders to the last sticky cells
     * @returns The sorting options and current index for a given column
     */
    const buildCell = (
      column: AnyGridColumn,
      pin: PinTypes,
      offset: number = 0,
      isLast: boolean = false
    ) => {
      return h(GridCell, {
        style: {
          width: gridState.columnStates[column.key].width + "px",
          left: pin === "left" ? offset + "px" : undefined,
          right: pin === "right" ? offset + "px" : undefined,
          "border-right":
            pin === "left" && isLast ? "solid 1px lightgray" : undefined,
          "border-left":
            pin === "right" && isLast ? "solid 1px lightgray" : undefined,
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

    const leftCells: VNode[] = [];
    const centreCells: VNode[] = none.map((column) =>
      this.buildCell(column, "none")
    );
    const rightCells: VNode[] = [];

    let leftOffset = 0;
    let rightOffset = 0;

    left.forEach((column, index) => {
      leftCells.push(
        this.buildCell(column, "left", leftOffset, index === left.length - 1)
      );
      leftOffset += this.gridState.columnStates[column.key].width;
    });

    right.forEach((column, index) => {
      rightCells.push(
        this.buildCell(column, "right", rightOffset, index === right.length - 1)
      );
      rightOffset += this.gridState.columnStates[column.key].width;
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
