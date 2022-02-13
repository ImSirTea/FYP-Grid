<script lang="ts">
import { GridBuilder } from "@/components/grid/GridBuilder";
import { PropType, h, VNode, defineComponent } from "vue";

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
  computed: {
    maximumVisibleRows(): number {
      return Math.ceil(this.gridHeight / this.rowHeight) + this.bufferRows;
    },
    scrollIndexOffset(): number {
      return Math.floor((this.$refs.grid as HTMLDivElement).scrollTop);
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
        h(
          "div",
          {
            class: "grid-header",
          },
          headers
        )
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
      return h("div", { class: "grid-container", ref: "grid" }, [
        this.header(),
        this.body(),
      ]);
    },
  },
  render(): VNode {
    console.log(this.gridConfiguration);
    return h(this.table());
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
