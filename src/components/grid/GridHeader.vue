<script lang="ts">
import { AnyGridColumn } from "@/components/grid/columns/Column";
import { GridConfiguration } from "@/components/grid/GridConfiguration";
import { GridManager } from "@/components/grid/GridManager";
import { GridState } from "@/components/grid/GridState";
import { defineComponent, inject, h, computed } from "@vue/composition-api";
import { VNode } from "vue";
import { VIcon } from "vuetify/lib/components";

export default defineComponent({
  name: "GridHeader",
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
      inject<GridConfiguration<Record<string, any>>>("gridConfiguration")!;
    const gridState = inject<GridState>("gridState")!;
    const gridManager = inject<GridManager>("gridManager")!;

    // How wide should our header row should be to align with the grid
    const totalGridWidth = computed(() =>
      gridConfiguration.columns.reduce(
        (totalWidth, column) =>
          totalWidth + gridState.columnStates[column.key].width,
        0
      )
    );

    // Generate our header rows
    const headers = computed(() => [buildHeaderRow()]);

    // ONLY USE IN CONTEXT OF RENDERING
    const buildHeaderRow = () => {
      return h(
        "div",
        {
          class: "grid-header",
          style: {
            width: totalGridWidth.value + "px",
            height: props.rowHeight + "px",
            transform: `translateX(${-props.gridOffsetLeft + "px"}`,
          },
        },
        gridManager.visibleColumns.map((column) => buildCell(column))
      );
    };

    // ONLY USE IN CONTEXT OF RENDERING
    const buildCell = (column: AnyGridColumn) => {
      const sortIcon = column.options.isSortable
        ? buildSortIcon(column)
        : undefined;

      return h(
        "div",
        {
          style: {
            width: gridState.columnStates[column.key].width + "px",
            height: props.rowHeight + "px",
          },
          class: "grid-header-cell",
          on: {
            click: () => {
              // Toggle our sorting behaviours
              gridState.toggleSort(column);
            },
          },
        },
        [column.key, sortIcon]
      );
    };

    // ONLY USE IN CONTEXT OF RENDERING
    const buildSortIcon = (column: AnyGridColumn) => {
      const isSortingOn = gridState.isSortingOnKey(column);
      const sortingIcon =
        isSortingOn?.direction === "desc"
          ? column.options.descIcon
          : column.options.ascIcon;

      return [
        h(
          VIcon,
          {
            class: {
              "grid-sort-icon": true,
              "grid-sort-active": !!isSortingOn,
            },
            props: { small: true },
          },
          sortingIcon
        ),
        h(
          "sup",
          { class: "grid-sorting-index" },
          isSortingOn?.index.toString() ?? ""
        ),
      ];
    };

    return {
      headers,
      totalGridWidth,
    };
  },
  render(): VNode {
    // Returns them has a group, inside their container
    return h(
      "div",
      {
        class: "grid-header-container",
      },
      this.headers
    );
  },
});
</script>
