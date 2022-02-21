<script lang="ts">
import { GridConfiguration } from "@/components/grid/GridConfiguration";
import GridHeader from "@/components/grid/GridHeader.vue";
import { GridState } from "@/components/grid/GridState";
import { VNode } from "vue";
import { h, defineComponent, PropType } from "@vue/composition-api";
import GridBody, { GridScrollEvent } from "@/components/grid/GridBody.vue";
import GridControlPanel from "@/components/GridControlPanel.vue";

const gridIndexId = "_grid-idx";
type AnyWithGridIdx = { [gridIndexId]: number };

export default defineComponent({
  name: "Grid",
  components: { GridHeader, GridBody, GridControlPanel },
  props: {
    items: {
      type: Array as PropType<any[]>,
      required: true,
      default: () => [],
    },
    gridConfiguration: {
      type: Object as PropType<GridConfiguration<any>>,
      required: true,
    },
    rowHeight: {
      type: Number,
      required: false,
      default: 36,
    },
    gridHeight: {
      type: Number,
      required: false,
      default: 300,
    },
    bufferRows: {
      type: Number,
      required: false,
      default: 5,
    },
  },
  data: () => {
    return {
      gridState: new GridState(),
      gridOffsetTop: 0,
      gridOffsetLeft: 0,
    };
  },
  computed: {
    totalGridWidth(): string {
      return (
        this.gridConfiguration.columns.reduce(
          (totalWidth, column) => totalWidth + column.width,
          0
        ) + "ch"
      );
    },
    internalItems(): AnyWithGridIdx[] {
      return (
        this.items
          // Append our sorting ID
          .map((item, idx) => ({
            [gridIndexId]: idx,
            ...item,
          }))
          // Remove our unwanted values
          .filter((item) =>
            this.gridConfiguration.columns.reduce(
              (isValid, column) => {
                const itemValueForColumn = column
                  .value(item)
                  .toString()
                  .toLowerCase()
                  .trim();

                const searchByValue = this.gridState.searchValue
                  .toLowerCase()
                  .trim();

                return isValid || itemValueForColumn.includes(searchByValue);
              },
              false as boolean // ??? Thanks TypeScript
            )
          )
          // Order by
          .sort(this.gridState.sortBy)
      );
    },
  },
  methods: {
    body() {
      return h(GridBody, {
        props: {
          internalItems: this.internalItems,
          gridConfiguration: this.gridConfiguration,
          gridOffsetTop: this.gridOffsetTop,
          rowHeight: this.rowHeight,
          gridHeight: this.gridHeight,
          bufferRows: this.bufferRows,
        },
        on: {
          // We want the scrolling to be within the rows, not the entire grid, so listen for these events
          "update:scroll": (scroll: GridScrollEvent) => {
            this.gridOffsetTop = scroll.gridOffsetTop;
            this.gridOffsetLeft = scroll.gridOffsetLeft;
          },
        },
      });
    },
    header() {
      return h(GridHeader, {
        props: {
          gridConfiguration: this.gridConfiguration,
          gridState: this.gridState,
          rowHeight: this.rowHeight,
          totalGridWidth: this.totalGridWidth,
          gridOffsetLeft: this.gridOffsetLeft,
        },
      });
    },
    controlPanel(): VNode {
      return h(GridControlPanel, {
        props: { gridState: this.gridState },
      });
    },
    table() {
      return h(
        "div",
        {
          class: "grid-container",
        },
        [this.controlPanel(), this.header(), this.body()]
      );
    },
  },
  render(): VNode {
    return this.table();
  },
});
</script>

<style lang="scss">
@import "@/styles/_grid.scss";
</style>
