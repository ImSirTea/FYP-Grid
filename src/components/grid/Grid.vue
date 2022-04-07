<script lang="ts">
import { GridConfiguration } from "@/components/grid/GridConfiguration";
import { GridManager } from "@/components/grid/GridManager";
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
  watch,
  shallowRef,
  ref,
} from "@vue/composition-api";
import GridBody from "@/components/grid/GridBody.vue";
import GridControlPanel from "@/components/grid/GridControlPanel.vue";

/**
 * Manages creating a grid with given specifications
 */
export default defineComponent({
  name: "Grid",
  components: { GridHeader, GridBody, GridControlPanel },
  props: {
    items: {
      type: Array as PropType<Record<string, any>[]>,
      required: true,
      default: () => [],
    },
    gridConfiguration: {
      type: Object as PropType<GridConfiguration<Record<string, any>>>,
      required: true,
    },
    gridState: {
      type: Object as PropType<GridState>,
      required: false,
    },
    rowHeight: {
      type: Number,
      required: false,
      default: 45,
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
  },
  setup(props) {
    // Desperately avoid using ref here, it's painfully slow
    const internalItems = shallowRef<Record<string, any>[]>([]);
    const gridState = reactive(
      props.gridState ?? props.gridConfiguration.defaultState
    );
    const gridManager = new GridManager(
      gridState as GridState,
      props.gridConfiguration
    );
    const gridRef = ref(null);
    const scrollOffsetLeft = ref(0);
    let currentTouchX = 0;

    provide("gridState", gridState);
    provide("gridConfiguration", props.gridConfiguration);
    provide("gridManager", gridManager);

    // Copy our items, with inserted indexes of their original sorting order
    // Pulled out seperately to prevent iterating over the same list of items and injecting what existed
    const indexedItems = computed(() =>
      gridState.injectGridIndexes(props.items)
    );

    const totalGridWidth = computed(() =>
      props.gridConfiguration.columns.reduce(
        (totalWidth, column) =>
          totalWidth + gridState.columnStates[column.key].width,
        0
      )
    );

    const actualGridWidth = computed(() => {
      if (gridRef.value) {
        return (gridRef.value as HTMLElement).clientWidth;
      }

      return 0;
    });

    // If our indexes, config, or state has changed, we should re-filter and sort
    watch(
      () => [props.gridConfiguration, gridState, indexedItems.value],
      () => {
        internalItems.value.length = 0;
        internalItems.value = gridState
          .filterAndSortItems(indexedItems.value, props.gridConfiguration)
          .slice(); // Create a clone
      },
      { immediate: true, deep: true }
    );

    const buildVirtualScrollbars = () => {
      const leftWidth = gridManager.pinnedSortedAndVisibleColumns.left.reduce(
        (width, column) => width + gridState.columnStates[column.key].width,
        0
      );

      const centreWidth =
        gridManager.pinnedSortedAndVisibleColumns.centre.reduce(
          (width, column) => width + gridState.columnStates[column.key].width,
          0
        );

      const rightWidth = gridManager.pinnedSortedAndVisibleColumns.right.reduce(
        (width, column) => width + gridState.columnStates[column.key].width,
        0
      );

      return h(
        "div",
        {
          class: "virtual-scroll-bar-container",
        },
        [
          h("div", {
            class: "virtual-scroll-bar",
            style: { width: leftWidth + "px" },
          }),
          h(
            "div",
            {
              class: "virtual-scroll-bar",
              style: { width: "100%", height: "17px" },
              on: {
                scroll: (event: Event) => {
                  scrollOffsetLeft.value = (
                    event.target as HTMLElement
                  ).scrollLeft;
                },
              },
            },
            [h("div", { style: { width: centreWidth + "px", height: "17px" } })]
          ),
          h("div", {
            class: "virtual-scroll-bar",
            style: { width: rightWidth + "px" },
          }),
        ]
      );
    };

    // Reacts to scroll events, ONLY USE IN CONTEXT OF RENDERING
    const buildBody = () => {
      return h(GridBody, {
        props: {
          internalItems: internalItems.value,
          rowHeight: props.rowHeight,
          gridHeight: props.gridHeight,
          gridOffsetLeft: scrollOffsetLeft.value,
        },
        // Allow for touch dragging events for mobile support
        // A little jank as it doesn't allow for velocities
        nativeOn: {
          touchstart: (event: TouchEvent) => {
            currentTouchX += event.touches[0].clientX;
          },
          touchmove: (event: TouchEvent) => {
            const wantedOffsetLeft = currentTouchX - event.touches[0].clientX;
            const clampedOffsetLeft = Math.min(
              Math.max(0, wantedOffsetLeft),
              totalGridWidth.value - actualGridWidth.value
            );
            scrollOffsetLeft.value = clampedOffsetLeft;
          },
          touchend: () => {
            currentTouchX = scrollOffsetLeft.value;
          },
        },
      });
    };

    // ONLY USE IN CONTEXT OF RENDERING
    const buildHeader = () => {
      return h(GridHeader, {
        props: {
          gridConfiguration: props.gridConfiguration,
          gridState,
          rowHeight: props.rowHeight,
          gridOffsetLeft: scrollOffsetLeft.value,
          totalGridWidth: totalGridWidth.value,
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
          style: { width: props.width ? props.width + "px" : "100%" },
          ref: "gridRef",
        },
        [
          buildControlPanel(),
          buildHeader(),
          buildBody(),
          buildVirtualScrollbars(),
        ]
      );
    };

    return {
      gridRef,
      buildTable,
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
