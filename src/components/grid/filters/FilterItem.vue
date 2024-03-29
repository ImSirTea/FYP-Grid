<template>
  <v-container fluid pa-0>
    <v-row no-gutters justify="center" align="center">
      <!-- Conditions -->
      <v-col cols="10">
        <v-select
          :value="filter.condition"
          :label="$tc.condition"
          :items="column.filterOptions.conditions"
          :rules="[required]"
          item-text="name"
          return-object
          dense
          @input="updateCondition"
        />
      </v-col>

      <v-col cols="2">
        <v-btn color="error" large icon depressed @click="removeFilter">
          <v-icon>mdi-trash-can</v-icon>
        </v-btn>
      </v-col>

      <!-- Value -->
      <v-col cols="12">
        <component
          :is="column.renderer"
          :value="filter.value"
          :label="$tc.value"
          :rules="[required]"
          :is-editing="true"
          dense
          @input="updateValue"
        />
      </v-col>

      <!-- Operator -->
      <v-col v-if="!isLast" cols="auto">
        <v-radio-group
          :value="filter.operator"
          :rules="[required]"
          dense
          row
          @change="updateOperator"
        >
          <v-radio
            v-for="{ name, operator } in column.filterOptions.operators"
            :key="column.key + name"
            :label="name"
            :value="operator"
          />
        </v-radio-group>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import NumberField from "@/components/controls/inputs/NumberField.vue";
import TextField from "@/components/controls/inputs/TextField.vue";
import { AnyGridColumn } from "@/components/grid/columns/AbstractColumn";
import {
  FilterCondition,
  FilterConnection,
  FilterOption,
} from "@/components/grid/filters/types";
import {
  defineComponent,
  PropType,
  inject,
  computed,
} from "@vue/composition-api";
import $tc from "@/textConstants";
import { debounce } from "lodash";
import { GridState } from "@/components/grid/GridState";

export default defineComponent({
  name: "FilterItem",
  components: { NumberField, TextField },
  props: {
    column: {
      type: Object as PropType<AnyGridColumn>,
      required: true,
    },
    filter: {
      type: Object as PropType<FilterOption<any>>,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
  },
  setup(props, context) {
    const gridState = inject<GridState>("gridState")!;

    const updateCondition = (newCondition: FilterCondition<any>) => {
      context.emit("update:condition", newCondition);
      gridState.buildFilterFunctionsForColumn(props.column.key);
    };

    // Debounce value changes to allow for inputs to be typed
    const updateValue = debounce((newValue: any) => {
      context.emit("update:value", newValue);
      gridState.buildFilterFunctionsForColumn(props.column.key);
    }, 250);

    const updateOperator = (newOperator: FilterConnection) => {
      context.emit("update:operator", newOperator);
      gridState.buildFilterFunctionsForColumn(props.column.key);
    };

    const removeFilter = () => {
      gridState.removeFilter(props.column, props.index);
    };

    const isLast = computed(
      () =>
        props.index + 1 ===
        gridState.columnStates[props.column.key].filterOptions.length
    );

    return {
      required: (value: any) => typeof value !== "undefined" || $tc.required,
      updateCondition,
      updateValue,
      updateOperator,
      removeFilter,
      isLast,
      $tc,
    };
  },
});
</script>
