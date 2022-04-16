<script lang="ts">
import { AnyGridColumn } from "@/components/grid/columns/AbstractColumn";
import { GridManager } from "@/components/grid/GridManager";
import { GridData } from "@/components/grid/GridData";
import GridRow from "@/components/grid/GridRow.vue";
import {
  AnyWithRowIndex,
  GridState,
  rowIndex,
} from "@/components/grid/GridState";
import {
  defineComponent,
  h,
  PropType,
  computed,
  watch,
  inject,
  ref,
} from "@vue/composition-api";
import { VNode } from "vue";
import { GridConfiguration } from "@/components/grid/GridConfiguration";

/**
 * Container for all grid rows, handling scroll events, offsets, and rendering
 */
export default defineComponent({
  name: "GridBody",
  components: { GridRow },
  props: {
    internalItems: {
      type: Array as PropType<AnyWithRowIndex[]>,
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
    gridOffsetLeft: {
      type: Number,
      required: true,
    },
  },
  setup(props, context) {
    const gridState = inject<GridState>("gridState")!;
    const gridConfiguration =
      inject<GridConfiguration<any>>("gridConfiguration")!;
    const gridManager = inject<GridManager>("gridManager")!;
    const scrollableDiv = ref<HTMLElement | null>(null);
    const gridData = new GridData(
      gridConfiguration,
      gridState,
      props.internalItems,
      props.rowHeight
    );

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
    const rowIndexBoundaries = computed((): { min: number; max: number } => ({
      min: Math.max(0, rowsOffset.value - props.bufferRows),
      max: Math.min(
        props.internalItems.length,
        rowsOffset.value + maximumVisibleRows.value + props.bufferRows
      ),
    }));

    // Manages scroll events passthrough
    const gridTopScroll = (e: Event) => {
      context.emit("update:scroll-top", (e.target as HTMLElement).scrollTop);
    };
    const gridLeftScroll = (e: Event) => {
      context.emit("update:scroll-left", (e.target as HTMLElement).scrollLeft);
    };

    watch(
      totalGridHeight,
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

    watch(
      () => props.gridOffsetLeft,
      () => {
        if (scrollableDiv.value) {
          scrollableDiv.value.scrollTo({ left: props.gridOffsetLeft });
        }
      }
    );

    return {
      gridTopScroll,
      gridLeftScroll,
      rowsOffset,
      totalGridHeight,
      rowIndexBoundaries,
      gridManager,
      scrollableDiv,
      gridData,
    };
  },
  render(): VNode {
    const { min, max } = this.rowIndexBoundaries;
    const { leftWidth, centreWidth, rightWidth } = this.gridManager.columnSizes;
    const { left, centre, right } = this.gridData.buildBodyRows(min, max);

    return h(
      "div",
      {
        class: "grid-row-container",
        style: {
          height: this.gridHeight + "px",
        },
        on: {
          scroll: this.gridTopScroll,
        },
        attrs: {
          role: "presentation",
        },
      },
      [
        h(
          "div",
          {
            style: {
              height: this.totalGridHeight + "px",
              width: leftWidth + "px",
              "min-width": leftWidth + "px",
            },
            attrs: {
              role: "rowgroup",
            },
          },
          left
        ),
        h(
          "div",
          {
            class: "grid-column-cropper",
            style: {
              height: this.totalGridHeight + "px",
              width: centreWidth + "px",
            },
            attrs: {
              role: "presentation",
            },
          },
          [
            h(
              "div",
              {
                ref: "scrollableDiv",
                class: "grid-row-center-wrapper",
                style: {
                  height: this.totalGridHeight + "px",
                },
                on: {
                  scroll: this.gridLeftScroll,
                },
                attrs: {
                  role: "rowgroup",
                },
              },
              centre
            ),
          ]
        ),
        h(
          "div",
          {
            style: {
              height: this.totalGridHeight + "px",
              width: rightWidth + "px",
              "min-width": rightWidth + "px",
            },
            attrs: {
              role: "rowgroup",
            },
          },
          right
        ),
      ]
    );
  },
});
</script>
