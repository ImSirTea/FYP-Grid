<script lang="ts">
import { GridConfiguration } from "@/components/grid/GridConfiguration";
import GridHeader from "@/components/grid/GridHeader.vue";
import { AnyWithGridIdx, GridState } from "@/components/grid/GridState";
import { VNode } from "vue";
import { h, defineComponent, PropType } from "@vue/composition-api";
import GridBody, { GridScrollEvent } from "@/components/grid/GridBody.vue";
import GridControlPanel from "@/components/GridControlPanel.vue";

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
  watch: {
    items: {
      handler: function () {
        this.indexedItems = this.gridState.injectGridIndexes(this.items);
      },
      immediate: true,
    },
  },
  data: () => {
    return {
      gridState: new GridState(),
      indexedItems: [] as AnyWithGridIdx[], // A copy of our prop.items with original indexes injected
      gridOffsetTop: 0,
      gridOffsetLeft: 0,
    };
  },
  computed: {
    internalItems(): AnyWithGridIdx[] {
      return this.gridState.filterAndSortItems(
        this.items,
        this.gridConfiguration
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
