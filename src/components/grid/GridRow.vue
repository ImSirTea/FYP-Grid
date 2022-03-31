<script lang="ts">
import { VNode } from "vue";
import GridCell from "@/components/grid/GridCell.vue";
import { GridConfiguration } from "@/components/grid/GridConfiguration";
import { defineComponent, h, PropType, inject } from "@vue/composition-api";
import { GridState } from "@/components/grid/GridState";

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

    return {
      gridState,
      gridConfiguration,
    };
  },
  render(): VNode {
    const isRowClickable = !!(
      this.gridConfiguration.rowAction || this.gridConfiguration.rowRoute
    );

    const cells = this.gridConfiguration.columns.map((column) =>
      h(GridCell, {
        style: {
          width: this.gridState.columnStates[column.key].width + "px",
        },
        class: "grid-row-cell",
        props: { item: this.item, column },
        on: {
          input: (value) => {
            console.log(
              "Logic on assignment will need to be applied",
              value,
              this.item
            );
          },
        },
      })
    );

    if (this.gridConfiguration.rowRoute) {
      return h(
        "router-link",
        {
          props: { to: this.gridConfiguration.rowRoute(this.item) },
          class: { "grid-row-clickable": isRowClickable },
        },
        [cells]
      );
    }

    const rowType = this.gridConfiguration.rowAction ? "a" : "div";

    return h(
      rowType,
      { class: { "grid-row-clickable": isRowClickable } },
      cells
    );
  },
});
</script>
