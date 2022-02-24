<script lang="ts">
import { GridConfiguration } from "@/components/grid/GridConfiguration";
import GridHeader from "@/components/grid/GridHeader.vue";
import { GridState } from "@/components/grid/GridState";
import { VNode } from "vue";
import {
  h,
  defineComponent,
  PropType,
  computed,
  reactive,
  provide,
} from "@vue/composition-api";
import GridBody, { GridScrollEvent } from "@/components/grid/GridBody.vue";
import GridControlPanel from "@/components/GridControlPanel.vue";

/**
 * Manages creating a grid with given specifications
 */
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
      default: 35,
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
  setup(props) {
    const gridState = reactive(new GridState());
    provide("gridState", gridState);
    provide("gridConfiguration", props.gridConfiguration);

    // Scroll offsets
    const gridOffsets = reactive({
      top: 0,
      left: 0,
    });

    // Copy our items, with inserted indexes of their original sorting order
    // Pulled out seperately to prevent iterating over the same list of items and injecting what existed
    const indexedItems = computed(() =>
      gridState.injectGridIndexes(props.items)
    );

    const internalItems = computed(() => {
      return gridState.filterAndSortItems(
        indexedItems.value,
        props.gridConfiguration
      );
    });

    // Reacts to scroll events, ONLY USE IN CONTEXT OF RENDERING
    const buildBody = () => {
      return h(GridBody, {
        props: {
          internalItems: internalItems.value,
          gridConfiguration: props.gridConfiguration,
          gridOffsetTop: gridOffsets.top,
          rowHeight: props.rowHeight,
          gridHeight: props.gridHeight,
          bufferRows: props.bufferRows,
        },
        on: {
          // We want the scrolling to be within the rows, not the entire grid, so listen for these events
          "update:scroll": (scroll: GridScrollEvent) => {
            gridOffsets.top = scroll.gridOffsetTop;
            gridOffsets.left = scroll.gridOffsetLeft;
          },
        },
      });
    };

    // ONLY USE IN CONTEXT OF RENDERING
    const buildHeader = () => {
      return h(GridHeader, {
        props: {
          gridConfiguration: props.gridConfiguration,
          gridState: gridState,
          rowHeight: props.rowHeight,
          gridOffsetLeft: gridOffsets.left,
        },
      });
    };

    // ONLY USE IN CONTEXT OF RENDERING
    const buildControlPanel = (): VNode => {
      return h(GridControlPanel, {
        props: {
          gridState: gridState,
          gridConfiguration: props.gridConfiguration,
        },
      });
    };

    // ONLY USE IN CONTEXT OF RENDERING
    const buildTable = () => {
      return h(
        "div",
        {
          class: "grid-container",
        },
        [buildControlPanel(), buildHeader(), buildBody()]
      );
    };

    return {
      buildTable,
      internalItems,
    };
  },
  render(): VNode {
    return this.buildTable();
  },
});
</script>

<style lang="scss">
@import "@/styles/_grid.scss";
</style>
