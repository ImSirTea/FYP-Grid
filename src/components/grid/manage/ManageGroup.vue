<template>
  <v-container class="pa-0" fluid>
    <v-row no-gutters>
      <v-col cols="auto">
        <v-select v-model="pinnedColumn" :label="$tc.pin" :items="pinValues" />
      </v-col>
      <v-col cols="auto">
        <v-switch v-model="isHidden" :label="$tc.hide" dense />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import {
  defineComponent,
  inject,
  PropType,
  computed,
} from "@vue/composition-api";
import {
  AnyGridColumn,
  pinValues,
} from "@/components/grid/columns/AbstractColumn";
import $tc from "@/textConstants";
import { GridState } from "@/components/grid/GridState";

export default defineComponent({
  name: "ManageGroup",
  props: {
    column: {
      type: Object as PropType<AnyGridColumn>,
      required: true,
    },
  },
  setup(props, context) {
    const gridState = inject<GridState>("gridState")!;

    const isHidden = computed({
      get: () => gridState.columnStates[props.column.key].isHidden,
      set: (newHidden) => {
        gridState.columnStates[props.column.key].isHidden = newHidden;
      },
    });

    const pinnedColumn = computed({
      get: () => gridState.columnStates[props.column.key].pin,
      set: (newPinned) => {
        gridState.columnStates[props.column.key].pin = newPinned;
      },
    });

    return {
      isHidden,
      pinnedColumn,
      gridState,
      $tc,
      pinValues,
    };
  },
});
</script>
