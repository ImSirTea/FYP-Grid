<script lang="ts">
import { GridBuilder } from "@/components/grid/GridBuilder";
import GridHeader from "@/components/grid/GridHeader.vue";
import { GridState } from "@/components/grid/GridState";
import { VNode } from "vue";
import { h, defineComponent, PropType } from "@vue/composition-api";

type AnyWithGridIdx = { "_grid-idx": number };

export default defineComponent({
  name: "Grid",
  components: { GridHeader },
  props: {
    items: {
      type: Array as PropType<any[]>,
      required: true,
      default: () => [],
    },
    gridConfiguration: {
      type: Object as PropType<GridBuilder<any>>,
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
      default: 0,
    },
  },
  data: () => {
    return {
      gridOffsetTop: 0,
      internalItems: [] as AnyWithGridIdx[],
      gridState: new GridState(),
    };
  },
  created() {
    // Create a local copy we can mutate, and inject the grid items idx for sort resetting
    this.internalItems = this.items.map((item, idx) => ({
      "_grid-idx": idx,
      ...item,
    }));
  },
  computed: {
    rowsOffset(): number {
      return Math.floor(this.gridOffsetTop / this.rowHeight);
    },
    maximumVisibleRows(): number {
      return Math.ceil(this.gridHeight / this.rowHeight) + this.bufferRows;
    },
    totalGridWidth(): string {
      return (
        this.gridConfiguration.columns.reduce(
          (totalWidth, column) => totalWidth + column.width,
          0
        ) + "ch"
      );
    },
    totalBodyHeight(): string {
      return this.internalItems.length * this.rowHeight + "px";
    },
  },
  methods: {
    gridScroll(e: any) {
      this.gridOffsetTop = e.target.scrollTop;
    },
    body() {
      // For each item, creates a row group with each row-cell inside
      const rows = this.internalItems
        .slice(
          Math.max(this.rowsOffset, 0),
          Math.min(
            this.rowsOffset + this.maximumVisibleRows,
            this.internalItems.length
          )
        )
        .map((item, idx) => {
          const rowGroup = h(
            "div",
            {
              class: {
                "grid-row": true,
                "grid-row-odd": (this.rowsOffset + idx) % 2,
              },
              style: {
                transform: `translateY(${idx * this.rowHeight + "px"})`,
                height: this.rowHeight + "px",
              },
            },
            this.gridConfiguration.columns.map((column) => {
              const rowCell = h(
                "div",
                {
                  style: {
                    width: column.widthWithUnit,
                  },
                  class: "grid-row-cell",
                },
                [h("span", {}, column.value(item))]
              );
              return rowCell;
            })
          );
          return rowGroup;
        });
      // Returns all row groups, inside their container
      return h(
        "div",
        {
          class: "grid-row-container",
          style: {
            height: this.totalBodyHeight,
            "padding-top": this.rowsOffset * this.rowHeight + "px",
          },
        },
        rows
      );
    },
    table() {
      const header = h(GridHeader, {
        props: {
          gridState: this.gridState,
          gridConfiguration: this.gridConfiguration,
        },
        on: {
          "update-sort": () => {
            this.internalItems.sort(this.gridState.sortBy);
          },
        },
      });
      return h(
        "div",
        {
          class: "grid-container",
          style: {
            height: this.gridHeight + "px",
          },
          on: {
            scroll: this.gridScroll,
          },
        },
        [header, this.body()]
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
