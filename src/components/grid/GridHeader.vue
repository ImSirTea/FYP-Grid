<script lang="ts">
import { GridBuilder } from "@/components/grid/GridBuilder";
import { GridState } from "@/components/grid/GridState";
import { defineComponent, PropType, h } from "@vue/composition-api";
import { VNode } from "vue";
import { VIcon } from "vuetify/lib/components";

export default defineComponent({
  name: "GridHeader",
  props: {
    gridConfiguration: {
      type: Object as PropType<GridBuilder<any>>,
      required: true,
    },
    gridState: {
      type: Object as PropType<GridState>,
      required: true,
    },
    rowHeight: {
      type: Number,
      required: false,
      default: 36,
    },
  },
  computed: {
    headerCells(): VNode[] {
      return this.gridConfiguration.columns.map((column) => {
        const isSortingOn = this.gridState.isSortingOnKey(column.key);

        const header = h(
          "div",
          {
            style: {
              width: column.widthWithUnit,
              height: this.rowHeight,
            },
            class: "grid-header-cell",
            on: {
              click: () => {
                // Toggle our sorting behaviours
                this.gridState.toggleSort(column.key);
                this.$emit("update-sort");
              },
            },
          },
          [
            column.key,
            h(
              VIcon,
              {
                class: {
                  "grid-sort-icon": true,
                  "grid-sort-active": !!isSortingOn,
                  "grid-sort-desc": isSortingOn?.options.direction === "desc",
                },
                props: { small: true },
              },
              ["mdi-chevron-up"]
            ),
            h(
              "span",
              { class: "grid-sorting-index" },
              isSortingOn?.index.toString() ?? ""
            ),
          ]
        );

        return header;
      });
    },
  },
  render(): VNode {
    // Returns them has a group, inside their container
    return h(
      "div",
      {
        class: "grid-header-container",
        style: {
          width: this.totalGridWidth,
          height: this.rowHeight + "px",
        },
      },
      [
        h(
          "div",
          {
            class: "grid-header",
          },
          this.headerCells
        ),
      ]
    );
  },
});
</script>
