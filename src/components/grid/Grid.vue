<script lang="ts">
import { GridConfiguration } from "@/components/grid/GridConfiguration";
import { GridManager } from "@/components/grid/GridManager";
import GridHeaderRow from "@/components/grid/GridHeaderRow.vue";
import {
  AnyWithRowIndex,
  rowIndex,
  GridState,
} from "@/components/grid/GridState";
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

export function useGrid<T>() {
  const gridRef = ref<GridComponent<T> | null>(null);

  return {
    gridRef,
  };
}

export interface GridComponent<T> {
  getSelectedRows: () => T[];
}

/**
 * Manages creating a grid with given specifications
 */
export default defineComponent({
  name: "Grid",
  components: { GridHeaderRow, GridBody, GridControlPanel },
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
      type: Object as PropType<GridConfiguration<any>>,
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
    const internalItems = shallowRef<AnyWithRowIndex[]>([]);
    const indexedItems = shallowRef<AnyWithRowIndex[]>([]);

    const gridState = reactive(
      props.gridState ?? props.gridConfiguration.defaultState
    );

    const gridManager = new GridManager(
      gridState as GridState,
      props.gridConfiguration
    );
    provide("gridState", gridState);
    provide("gridConfiguration", props.gridConfiguration);
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

    // If our prop items change, we need to re-inject grid indexes
    // This should also trigger a filterAndSort re-render
    watch(
      () => props.items,
      () => {
        indexedItems.value = gridState.injectGridIndexes(props.items);
      },
      { immediate: true, deep: true }
    );

    // If our items change, or any important state does, re-filter and sort
    watch(
      () => [
        indexedItems.value,
        gridState.columnStates,
        gridState.sortOptions,
        gridState.searchValue,
      ],
      () => {
        if (!gridState.filtersAreValid) {
          return;
        }

        internalItems.value = gridState.filterAndSortItems(
          indexedItems.value,
          props.gridConfiguration
        );
      },
      { immediate: true, deep: true }
    );

    // Select all if we have done so
    watch(
      () => gridState.selectedRowIds,
      () => {
        if (gridState.selectedRowIds.length === internalItems.value.length) {
          gridState.selectAllRows = true;
          return;
        }

        gridState.selectAllRows = false;
      }
    );

    // Provide a function to externally call this, so we don't keep another copy of items in memory
    const getSelectedRows: GridComponent<any>["getSelectedRows"] = () => {
      if (gridState.selectAllRows) {
        return gridState.removeGridIndexes(internalItems.value);
      }

      return gridState.removeGridIndexes(
        internalItems.value.filter((item) =>
          gridState.selectedRowIds.includes(item[rowIndex])
        )
      );
    };

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
      return h(GridHeaderRow, {
        props: {
          rowHeight: props.rowHeight,
          gridOffsetLeft: gridOffsets.left,
        },
      });
    };

    // ONLY USE IN CONTEXT OF RENDERING
    const buildControlPanel = (): VNode => {
      return h(GridControlPanel, {
        on: {
          "apply:item-changes": () => {
            const existingErrors = Object.entries(gridState.rowCellsWithErrors);

            // If we have errors, scroll to them instead of pushing our changes
            if (existingErrors.length) {
              const [rowNumber] = existingErrors[0];
              gridOffsets.top = Math.max(
                0,
                Number(rowNumber) * props.rowHeight - props.gridHeight
              );
              return;
            }

            // Otherwise just push our errors up
            context.emit(
              "update:items",
              internalItems.value.map((item) => {
                delete (item as any)[rowIndex];
                return item;
              })
            );
            gridState.isDirty = false;
          },
          "reset:item-changes": () => {
            internalItems.value = gridState.injectGridIndexes(props.items);
            gridState.rowCellsWithErrors = {};
            gridState.isDirty = false;
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
          attrs: {
            role: "grid",
            "aria-rowcount": props.items.length + 1, // +1 For the header
          },
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
      getSelectedRows,
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
