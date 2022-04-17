<script lang="ts">
import { AnyGridColumn } from "@/components/grid/columns/AbstractColumn";
import { GridManager } from "@/components/grid/GridManager";
import {
  defineComponent,
  inject,
  h,
  computed,
  watch,
  ref,
} from "@vue/composition-api";
import { VNode } from "vue";
import { GridState } from "@/components/grid/GridState";
import { GridConfiguration } from "@/components/grid/GridConfiguration";
import GridHeaderCell from "@/components/grid/GridHeaderCell.vue";

export default defineComponent({
  name: "GridHeaderRow",
  components: { GridHeaderCell },
  props: {
    rowHeight: {
      type: Number,
      required: false,
      default: 36,
    },
    gridOffsetLeft: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const gridConfiguration =
      inject<GridConfiguration<any>>("gridConfiguration")!;
    const gridState = inject<GridState>("gridState")!;
    const gridManager = inject<GridManager>("gridManager")!;
    const scrollableDiv = ref<HTMLElement | null>(null);

    // How wide should our header row should be to align with the grid
    const totalGridWidth = computed(() =>
      gridConfiguration.columns.reduce(
        (totalWidth, column) =>
          totalWidth + gridState.columnStates[column.key].width,
        0
      )
    );

    // ONLY USE IN CONTEXT OF RENDERING
    const buildHeaderRow = () => {
      const { left, centre, right } = gridManager.columns;
      const { leftWidth, centreWidth, rightWidth } = gridManager.columnSizes;

      return [
        h(
          "div",
          {
            class: "grid-column-wrapper",
            style: { width: leftWidth + "px", "min-width": leftWidth + "px" },
            attrs: {
              role: "row",
              "aria-rowindex": 1,
            },
          },
          left.map((column) => buildCell(column.definition))
        ),
        h(
          "div",
          {
            ref: "scrollableDiv",
            class: "grid-column-cropper",
            attrs: {
              role: "presentation",
            },
          },
          [
            h(
              "div",
              {
                class: "grid-column-wrapper",
                style: {
                  width: centreWidth + "px",
                },
                attrs: {
                  role: "row",
                  "aria-rowindex": 1,
                },
              },
              centre.map((column) => buildCell(column.definition))
            ),
          ]
        ),
        h(
          "div",
          {
            class: "grid-column-wrapper",
            style: {
              width: rightWidth + "px",
              "min-width": rightWidth + "px",
              "margin-right": "17px",
            },
            attrs: {
              role: "row",
              "aria-rowindex": 1,
            },
          },
          right.map((column) => buildCell(column.definition))
        ),
      ];
    };

    // ONLY USE IN CONTEXT OF RENDERING
    const buildCell = (column: AnyGridColumn) => {
      return h(GridHeaderCell, { props: { column } });
    };

    watch(
      () => props.gridOffsetLeft,
      () => {
        if (scrollableDiv.value) {
          scrollableDiv.value.scrollTo({ left: props.gridOffsetLeft });
        }
      }
    );

    return {
      buildHeaderRow,
      totalGridWidth,
      scrollableDiv,
    };
  },
  render(): VNode {
    // Returns them has a group, inside their container
    return h(
      "div",
      {
        class: {
          "grid-header-container": true,
        },
        style: {
          height: this.rowHeight + "px",
        },
        attrs: {
          role: "rowgroup",
        },
      },
      [this.buildHeaderRow()]
    );
  },
});
</script>
