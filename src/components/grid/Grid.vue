<script lang="ts">
import { GridConfiguration } from "@/components/grid/GridConfiguration";
import GridHeader from "@/components/grid/GridHeader.vue";
import { GridState } from "@/components/grid/GridState";
import { VNode } from "vue";
import { h, defineComponent, PropType } from "@vue/composition-api";
import GridBody from "@/components/grid/GridBody.vue";

const gridIndexId = "_grid-idx";
type AnyWithGridIdx = { [gridIndexId]: number };

export default defineComponent({
  name: "Grid",
  components: { GridHeader, GridBody },
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
      gridOffsetTop: 0,
      internalItems: [] as AnyWithGridIdx[],
      gridState: new GridState(),
    };
  },
  created() {
    // Create a local copy we can mutate, and inject the grid items idx for sort resetting
    this.internalItems = this.items.map((item, idx) => ({
      [gridIndexId]: idx,
      ...item,
    }));
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
    totalGridHeight(): string {
      return this.internalItems.length * this.rowHeight + "px";
    },
  },
  methods: {
    gridScroll(e: any) {
      // You could _potentially_ add a debounce here, but it might be a little jarring
      this.gridOffsetTop = e.target.scrollTop;
    },
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
        style: {
          height: this.totalGridHeight,
          width: this.totalGridWidth,
        },
      });
    },
    header() {
      return h(GridHeader, {
        props: {
          gridState: this.gridState,
          gridConfiguration: this.gridConfiguration,
        },
        style: {
          width: this.totalGridWidth,
        },
        on: {
          "update-sort": () => {
            this.internalItems.sort(this.gridState.sortBy);
          },
        },
      });
    },
    table() {
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
@import "@/styles/_grid.scss";
</style>
