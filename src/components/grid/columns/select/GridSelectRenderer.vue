<template>
  <checkbox-field
    v-model="rowIsSelected"
    :ripple="false"
    class="pa-0 ma-0"
    dense
    hide-details
  />
</template>

<script lang="ts">
import CheckboxField from "@/components/controls/inputs/CheckboxField.vue";
import {
  AnyWithRowIndex,
  GridState,
  rowIndex,
} from "@/components/grid/GridState";
import {
  defineComponent,
  PropType,
  inject,
  computed,
} from "@vue/composition-api";

export default defineComponent({
  components: { CheckboxField },
  name: "GridSelectRenderer",
  props: {
    item: {
      type: Object as PropType<AnyWithRowIndex>,
      required: false,
    },
    isHeaderRow: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  setup(props) {
    const gridState = inject<GridState>("gridState")!;

    const rowIsSelected = computed({
      get: () => {
        if (gridState.selectAllRows) {
          return true;
        }

        if (!props.item) {
          return false;
        }

        return gridState.selectedRowIds.includes(props.item[rowIndex]);
      },
      set: (isSelected) => {
        if (!props.item) {
          return;
        }

        gridState.toggleRowSelect(props.item[rowIndex]);
      },
    });

    return {
      rowIsSelected,
    };
  },
});
</script>
