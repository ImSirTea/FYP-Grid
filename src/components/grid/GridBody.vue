<script lang="ts">
import { Column } from "@/components/grid/columns/Column";
import { GridConfiguration } from "@/components/grid/GridConfiguration";
import { defineComponent, h, PropType } from "@vue/composition-api";
import { VNode } from "vue";

export interface GridScrollEvent {
  gridOffsetTop: number;
  gridOffsetLeft: number;
}

export default defineComponent({
  name: "GridBody",
  props: {
    internalItems: {
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
    gridOffsetTop: {
      type: Number,
      required: true,
    },
  },
  methods: {
    gridScroll(e: any) {
      // You could _potentially_ add a debounce here, but it might be a little jarring
      this.$emit("update:scroll", {
        gridOffsetTop: e.target.scrollTop,
        gridOffsetLeft: e.target.scrollLeft,
      } as GridScrollEvent);
    },
    buildCell(item: any, column: Column<any, any>) {
      return h(
        "div",
        {
          style: {
            width: column.widthWithUnit,
          },
          class: "grid-row-cell",
        },
        [h("span", {}, column.value(item))]
      );
    },
    buildRow(item: any, idx: number) {
      return h(
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
          return this.buildCell(item, column);
        })
      );
    },
  },
  computed: {
    totalGridHeight(): string {
      return this.internalItems.length * this.rowHeight + "px";
    },
    rowsOffset(): number {
      return Math.floor(this.gridOffsetTop / this.rowHeight);
    },
    maximumVisibleRows(): number {
      return Math.ceil(this.gridHeight / this.rowHeight) + this.bufferRows;
    },
    rows(): VNode[] {
      return this.internalItems
        .slice(
          Math.max(this.rowsOffset - this.bufferRows, 0),
          Math.min(
            this.rowsOffset + this.maximumVisibleRows + this.bufferRows,
            this.internalItems.length
          )
        )
        .map((item, idx) => {
          return this.buildRow(item, idx);
        });
    },
  },
  render(): VNode {
    return h(
      "div",
      {
        class: "grid-row-container",
        style: {
          height: this.gridHeight + "px",
        },
        on: {
          scroll: this.gridScroll,
        },
      },
      [
        h(
          "div",
          {
            class: "grid-row-height-wrapper",
            style: {
              height: this.totalGridHeight,
              "padding-top": this.rowsOffset * this.rowHeight + "px",
            },
          },
          this.rows
        ),
      ]
    );
  },
});
</script>
