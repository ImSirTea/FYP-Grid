<script lang="ts">
import { Column } from "@/components/grid/columns/Column";
import { GridConfiguration } from "@/components/grid/GridConfiguration";
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

    // How wide should our header row should be to align with the grid
    const totalGridWidth = computed(
      () =>
        gridConfiguration.columns.reduce(
          (totalWidth, column) => totalWidth + column.width,
          0
        ) + "ch"
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
            width: totalGridWidth.value,
            height: props.rowHeight + "px",
            transform: `translateX(${-props.gridOffsetLeft + "px"}`,
          },
        },
        gridConfiguration.columns.map((column) => buildCell(column))
      );
    };

    // ONLY USE IN CONTEXT OF RENDERING
    const buildCell = (column: Column<Record<string, any>, any>) => {
      return h(
        "div",
        {
          style: {
            width: column.widthWithUnit,
            height: props.rowHeight,
          },
          class: "grid-header-cell",
          on: {
            click: () => {
              // Toggle our sorting behaviours
              gridState.toggleSort(column.key);
            },
          },
        },
        [column.key, buildSortIcon(column)]
      );
    };

    // ONLY USE IN CONTEXT OF RENDERING
    const buildSortIcon = (column: Column<Record<string, any>, any>) => {
      const isSortingOn = gridState.isSortingOnKey(column.key);
      const sortingIcon =
        isSortingOn?.options.direction === "desc"
          ? column.descIcon
          : column.ascIcon;

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
      gridConfiguration,
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
