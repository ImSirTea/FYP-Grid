<script lang="ts">
import { GridBuilder } from "@/components/grid/GridBuilder";
import { VNode } from "vue";
import { h, defineComponent, PropType } from "@vue/composition-api";

export default defineComponent({
  name: "Grid",
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
      default: 20,
    },
    gridHeight: {
      type: Number,
      required: false,
      default: 100,
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
    };
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
    totalHeaderHeight(): string {
      return this.rowHeight + "px";
    },
    totalBodyHeight(): string {
      return this.items.length * this.rowHeight + "px";
    },
  },
  methods: {
    gridScroll(e: any) {
      this.gridOffsetTop = e.target.scrollTop;
    },
    header() {
      // Creates each header cell
      const headers = this.gridConfiguration.columns.map((column) => {
        const header = h(
          "div",
          {
            style: {
              width: column.widthWithUnit,
            },
            class: "grid-header-cell",
          },
          column.name
        );

        return header;
      });

      // Returns them has a group, inside their container
      return h(
        "div",
        {
          class: "grid-header-container",
          style: {
            width: this.totalGridWidth,
            height: this.totalHeaderHeight,
          },
        },
        [
          h(
            "div",
            {
              class: "grid-header",
            },
            headers
          ),
        ]
      );
    },
    body() {
      // For each item, creates a row group with each row-cell inside
      const rows = this.items.map((item, idx) => {
        const rowGroup = h(
          "div",
          {
            class: "grid-row",
            style: {
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
              column.value(item)
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
          style: { width: this.totalGridWidth, height: this.totalBodyHeight },
        },
        rows
      );
    },
    table() {
      return h(
        "div",
        {
          class: "grid-container",
          on: {
            scroll: this.gridScroll,
          },
        },
        [this.header(), this.body()]
      );
    },
  },
  render(): VNode {
    return this.table();
  },
});
</script>

<style lang="scss">
.grid-header-cell,
.grid-row-cell {
  display: inline-block;
  text-align: left;
  background-color: inherit;
}

.grid-row:nth-child(even) {
  background-color: lightgray;
}

.grid-header-container {
  position: sticky;
  top: 0;
  background-color: magenta;
  z-index: 1;
}

.grid-row-container {
  position: relative;
}

.grid-container {
  width: 200ch;
  height: 300px;
  overflow: auto;
}
</style>
