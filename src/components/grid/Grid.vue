<script lang="ts">
import { GridConfiguration } from "@/components/grid/GridConfiguration";
import { GridManager } from "@/components/grid/GridManager";
import GridHeader from "@/components/grid/GridHeader.vue";
import { AnyWithGridIndex, GridState } from "@/components/grid/GridState";
import { VNode } from "vue";
import {
  h,
  defineComponent,
  PropType,
  computed,
  reactive,
  provide,
  watch,
  shallowRef,
  ref,
} from "@vue/composition-api";
import GridBody from "@/components/grid/GridBody.vue";
import GridControlPanel from "@/components/grid/GridControlPanel.vue";
import Vue from "vue";

/**
 * Manages creating a grid with given specifications
 */
export default defineComponent({
  name: "Grid",
  components: { GridHeader, GridBody, GridControlPanel },
  model: {
    event: "update:items",
    prop: "items",
  },
  props: {
    items: {
      type: Array as PropType<any[]>,
      required: true,
      default: () => [],
    },
    gridConfiguration: {
      type: Object as PropType<GridConfiguration<AnyWithGridIndex>>,
      required: true,
    },
    gridState: {
      type: Object as PropType<GridState>,
      required: false,
    },
    rowHeight: {
      type: Number,
      required: false,
      default: 50,
    },
    gridHeight: {
      type: Number,
      required: false,
      default: 300,
    },
    width: {
      type: Number,
      required: false,
      default: undefined,
    },
    bufferRows: {
      type: Number,
      required: false,
      default: 1,
    },
  },
  setup(props, context) {
    // A copy of our items, indexed with their original positions
    // Keep this seperate so we only build it once per props.items change
    const indexedItems = shallowRef<AnyWithGridIndex[]>([]);

    // Desperately avoid using ref here, it's painfully slow
    const internalItems = shallowRef<AnyWithGridIndex[]>([]);
    const gridState = reactive(
      props.gridState ?? props.gridConfiguration.defaultState
    );
    const gridManager = new GridManager(
      gridState as GridState,
      props.gridConfiguration
    );
    provide("gridManager", gridManager);

    const centreBar = ref<HTMLElement | null>(null);

    // Scroll offsets
    const gridOffsets = reactive({
      top: 0,
      left: 0,
    });

    const totalGridWidth = computed(() =>
      props.width ? props.width + "px" : "100%"
    );

    watch(
      () => props.items,
      () => {
        // Reset, and remake when we update our items
        indexedItems.value.length = 0;
        indexedItems.value = gridState.injectGridIndexes(props.items);

        // Now update our items

        internalItems.value = gridState
          .filterAndSortItems(indexedItems.value, props.gridConfiguration)
          .slice();
      },
      { immediate: true, deep: true }
    );

    // If our indexes, config, or state has changed, we should re-filter and sort
    watch(
      () => [
        props.gridConfiguration,
        gridState.searchValue,
        gridState.columnStates,
        gridState.sortOptions,
      ],
      () => {
        internalItems.value.length = 0;
        internalItems.value = gridState
          .filterAndSortItems(indexedItems.value, props.gridConfiguration)
          .slice();
      },
      { deep: true }
    );

    // Reacts to scroll events, ONLY USE IN CONTEXT OF RENDERING
    const buildBody = () => {
      return h(GridBody, {
        props: {
          internalItems: internalItems.value,
          gridOffsetTop: gridOffsets.top,
          gridOffsetLeft: gridOffsets.left,
          rowHeight: props.rowHeight,
          gridHeight: props.gridHeight,
          bufferRows: props.bufferRows,
        },
        on: {
          // We want the scrolling to be within the rows, not the entire grid, so listen for these events
          "update:scroll-top": (offsetTop: number) => {
            gridOffsets.top = offsetTop;
          },
          "update:scroll-left": (offsetLeft: number) => {
            gridOffsets.left = offsetLeft;
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
        on: {
          "update:items": () => {
            context.emit(
              "update:items",
              internalItems.value.map((item): any => {
                delete (item as any)["_grid-index"];
                return item;
              })
            );
          },
        },
      });
    };

    const buildVirtualScrollbars = () => {
      const { leftWidth, centreWidth, rightWidth } = gridManager.columnSizes;

      return h(
        "div",
        {
          class: "virtual-scroll-bar-container",
        },
        [
          h("div", {
            class: "virtual-scroll-bar",
            style: { width: leftWidth + "px", "min-width": leftWidth + "px" },
          }),
          h(
            "div",
            {
              ref: "centreBar",
              class: "virtual-scroll-bar",
              style: { width: "100%", height: "17px" },
              on: {
                scroll: (event: Event) => {
                  gridOffsets.left = (event.target as HTMLElement).scrollLeft;
                },
              },
            },
            [h("div", { style: { width: centreWidth + "px", height: "17px" } })]
          ),
          h("div", {
            class: "virtual-scroll-bar",
            style: { width: rightWidth + "px", "min-width": rightWidth + "px" },
          }),
        ]
      );
    };

    // ONLY USE IN CONTEXT OF RENDERING
    const buildTable = () => {
      return h(
        "div",
        {
          class: "grid-container",
          style: { width: totalGridWidth.value },
        },
        [
          buildControlPanel(),
          buildHeader(),
          buildBody(),
          buildVirtualScrollbars(),
        ]
      );
    };

    watch(
      () => gridOffsets.left,
      () => {
        if (centreBar.value) {
          centreBar.value.scrollTo({ left: gridOffsets.left });
        }
      }
    );

    return {
      buildTable,
      centreBar,
      gridOffsets,
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
