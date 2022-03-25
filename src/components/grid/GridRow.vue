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
    const cells = this.gridConfiguration.columns.map((column) =>
      h(GridCell, {
        style: {
          width: this.gridState.columnStates[column.key].width + "px",
        },
        class: "grid-row-cell",
        attrs: { readonly: true, role: "gridcell" },
        props: { item: this.item, column },
      })
    );

    return h("div", cells);
  },
});
</script>
