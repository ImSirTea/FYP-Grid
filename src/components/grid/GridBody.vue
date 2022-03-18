<script lang="ts">
import GridRow from "@/components/grid/GridRow.vue";
import { GridState } from "@/components/grid/GridState";
import {
  defineComponent,
  h,
  PropType,
  computed,
  reactive,
  watch,
  inject,
  shallowRef,
} from "@vue/composition-api";
import { VNode } from "vue";
export interface GridScrollEvent {
  gridOffsetTop: number;
  gridOffsetLeft: number;
}

/**
 * Container for all grid rows, handling scroll events, offsets, and rendering
 */
export default defineComponent({
  name: "GridBody",
  components: { GridRow },
  props: {
    internalItems: {
      type: Array as PropType<Record<string, any>[]>,
      required: true,
      default: () => [],
    },
    rowHeight: {
      type: Number,
      required: true,
    },
    gridHeight: {
      type: Number,
      required: true,
    },
    gridOffsetTop: {
      type: Number,
      required: true,
    },
    bufferRows: {
      type: Number,
      required: true,
    },
  },
  setup(props, context) {
    const gridState = inject<GridState>("gridState")!;
    const key = shallowRef(1);
    // Total height of all rows, used for scrolling
    const totalGridHeight = computed((): number => {
      return props.internalItems.length * props.rowHeight;
    });

    // How many rows have we scrolled passed (effectively the topmost id of visible rows)
    const rowsOffset = computed((): number => {
      return Math.floor(props.gridOffsetTop / props.rowHeight);
    });

    // Maximum number of rows visible within the grid's height
    const maximumVisibleRows = computed((): number => {
      const viewportMax = Math.ceil(props.gridHeight / props.rowHeight);

      return Math.min(viewportMax, props.internalItems.length);
    });

    // Row boundaries to build rows between, defaults to -1 so our watcher can compute them correctly in a single place
    const rowIndexBoundaries = reactive<{ min: number; max: number }>({
      min: -1,
      max: -1,
    });

    // Watch for if we try to peep out of bounds, and then force an update our bounds to force grouped refreshes
    watch(
      rowsOffset,
      (newValue) => {
        const needsNewBoundaries =
          newValue + maximumVisibleRows.value >= rowIndexBoundaries.max ||
          newValue <= rowIndexBoundaries.min;

        if (needsNewBoundaries) {
          Object.assign(rowIndexBoundaries, {
            min: Math.max(0, rowsOffset.value - props.bufferRows),
            max: Math.min(
              props.internalItems.length,
              rowsOffset.value +
                maximumVisibleRows.value +
                props.bufferRows +
                Math.max(0, props.bufferRows - rowsOffset.value)
            ),
          });
        }
      },
      { immediate: true }
    );

    // ONLY USE IN CONTEXT OF RENDERING
    const buildRow = (item: any, index: number) => {
      const needsObserver =
        index === rowIndexBoundaries.min ||
        index === rowIndexBoundaries.max - 1;

      return h(GridRow, {
        attrs: {
          role: "row",
        },
        class: {
          "grid-row": true,
          "grid-row-odd": index % 2,
        },
        style: {
          top: index * props.rowHeight + "px",
          height: props.rowHeight + "px",
        },
        props: {
          item,
          index,
          needsObserver,
        },
      });
    };

    // Manages scroll events passthrough
    const gridScroll = (e: any) => {
      context.emit("update:scroll", {
        gridOffsetTop: e.target.scrollTop,
        gridOffsetLeft: e.target.scrollLeft,
      } as GridScrollEvent);
    };

    watch(
      () => props.internalItems,
      () => {
        // TODO: This should probably not be hard coded
        if (totalGridHeight.value > 33554400) {
          console.error(
            "Too many rows for the grid to process due to HTML pixel value maximums."
          );
        }
      },
      { immediate: true }
    );

    // Whenever our gridstate changes, update our key to force a re-render
    // This is a little magical, Vue isn't reactive to props.internalItems updating
    // So we have to manually force it here by setting our key to 1/0 when it changes
    watch(
      () => gridState,
      () => {
        key.value = 1 - key.value;
      },
      { deep: true }
    );

    return {
      buildRow,
      gridScroll,
      rowsOffset,
      totalGridHeight,
      rowIndexBoundaries,
      gridState,
      key,
    };
  },
  render(): VNode {
    const { min, max } = this.rowIndexBoundaries;
    const rows: VNode[] = [];
    for (let i = min; i < max; i++) {
      rows.push(this.buildRow(this.internalItems[i], i));
    }

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
        key: this.key,
      },
      [
        h(
          "div",
          {
            class: "grid-row-height-wrapper",
            style: {
              height: this.totalGridHeight + "px",
            },
            attrs: {
              role: "grid",
            },
          },
          rows
        ),
      ]
    );
  },
});
</script>
