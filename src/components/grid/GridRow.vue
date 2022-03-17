<script lang="ts">
import { VNode } from "vue";
import GridCell from "@/components/grid/GridCell.vue";
import { GridConfiguration } from "@/components/grid/GridConfiguration";
import { defineComponent, h, PropType, inject } from "@vue/composition-api";

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

    return {
      gridConfiguration,
    };
  },
  render(): VNode {
    const cells = this.gridConfiguration.columns.map((column) =>
      h(GridCell, {
        style: {
          width: column.widthWithUnit,
        },
        class: "grid-row-cell",
        attrs: { readonly: true },
        props: { component: column.component, item: this.item, column },
      })
    );

    return h("div", cells);
  },
});
</script>
