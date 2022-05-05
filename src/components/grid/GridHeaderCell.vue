<template>
  <div
    :style="style"
    :col-key="column.key"
    :class="classes"
    :draggable="column.options.isManageable && !isResizing"
    @dragstart="dragStart($event, column)"
    @touchstart="dragStart($event, column)"
    @drag="dragOrTouch"
    @touchmove="dragOrTouch"
    @dragover="showDragging"
    @dragend="dragEnd"
    @touchend="dragEnd"
    @click="onHeaderClick"
  >
    <component
      v-if="column.options.useRendererForHeader"
      :is="column.renderer"
      :column="column"
      is-header-row
    />
    <template v-else>
      {{ columnName }}
    </template>
    <!-- Sorting Icon -->
    <template v-if="column.options.isSortable">
      <v-icon :class="sortingState.classes" small>
        {{ sortingState.icon }}
      </v-icon>
      <sup class="grid-sorting-index">{{ sortingState.index }}</sup>
    </template>
    <!-- Resize bar -->
    <grid-header-resize
      v-if="column.options.isManageable"
      :column="column"
      @is-resizing="isResizing = $event"
    />
  </div>
</template>

<script lang="ts">
import { AnyGridColumn } from "@/components/grid/columns/AbstractColumn";
import { useColumnOrderEvents } from "@/components/grid/events/ColumnOrderEvents";
import { GridConfiguration } from "@/components/grid/GridConfiguration";
import { GridState } from "@/components/grid/GridState";
import {
  defineComponent,
  inject,
  computed,
  PropType,
  ref,
} from "@vue/composition-api";
import GridHeaderResize from "@/components/grid/GridHeaderResize.vue";
import { SelectColumn } from "@/components/grid/columns/select/SelectColumn";

export default defineComponent({
  name: "GridHeaderCell",
  components: { GridHeaderResize },
  props: {
    column: {
      type: Object as PropType<AnyGridColumn>,
      required: true,
    },
  },
  setup(props, context) {
    const gridState = inject<GridState>("gridState")!;
    const gridConfiguration =
      inject<GridConfiguration<any>>("gridConfiguration")!;

    const { dragStart, drag, dragEnd, showDragging } = useColumnOrderEvents(
      gridState,
      gridConfiguration,
      "horizontal"
    );

    let isResizing = ref(false);

    const style = computed(() => {
      const width = gridState.columnStates[props.column.key].width;

      return {
        width: width + "px",
        "min-width": width + "px",
        "justify-content": props.column.alignment,
      };
    });

    const classes = computed(() => {
      const draggedColumnKey = gridState.columnDragged?.key ?? null;
      return {
        "grid-header-cell": true,
        "grid-column-dragged": draggedColumnKey === props.column.key,
        "grid-header-no-hover": draggedColumnKey
          ? draggedColumnKey !== props.column.key
          : false,
      };
    });

    const onHeaderClick = () => {
      if (props.column.options.isSortable) {
        gridState.toggleSort(props.column);
      }

      // TODO: Would be nice to have some way of setting this behaviour as part of the header cell?
      // Not a fan of how specific this is here
      if (props.column instanceof SelectColumn) {
        // Reset all selected for convenience
        if (gridState.selectAllRows) {
          gridState.selectedRowIds.length = 0;
        }

        gridState.selectAllRows = !gridState.selectAllRows;
      }
    };

    const dragOrTouch = (event: DragEvent | TouchEvent) => {
      if (isResizing.value) {
        return;
      }

      drag(event);
    };

    const sortingState = computed(() => {
      const sorting = gridState.isSortingOnKey(props.column);

      const icon =
        sorting?.direction === "desc"
          ? props.column.options.descIcon
          : props.column.options.ascIcon;

      const index = sorting?.index.toString();

      return {
        classes: {
          "grid-sort-icon": true,
          "grid-sort-active": !!sorting,
        },
        icon,
        index,
      };
    });

    const columnName = computed(() =>
      props.column.options.hideColumnName ? "" : props.column.key
    );

    return {
      // General
      style,
      classes,
      columnName,
      onHeaderClick,

      // Sorting
      sortingState,

      // Column order
      showDragging,
      dragStart,
      dragOrTouch,
      dragEnd,

      // Resizing
      isResizing,
    };
  },
});
</script>
