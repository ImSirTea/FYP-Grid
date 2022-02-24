<template>
  <v-container fluid pa-0>
    <v-row no-gutters justify="center" align="center">
      <!-- Conditions -->
      <v-col cols="10">
        <v-select
          :value="filter.condition"
          :label="$tc.condition"
          :items="column.filterOptions.conditions"
          item-text="name"
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
          :is="column.component"
          :value="filter.value"
          :label="$tc.value"
          dense
          @input="updateValue"
        />
      </v-col>

      <!-- Connection -->
      <v-col v-if="!isLast" cols="auto">
        <v-radio-group
          :value="filter.connection"
          dense
          row
          @input="updateConnection"
        >
          <v-radio
            v-for="connection in column.filterOptions.connections"
            :key="column.key + connection.name"
            :label="connection.name"
            :value="connection"
          />
        </v-radio-group>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import NumberField from "@/components/controls/inputs/NumberField.vue";
import TextField from "@/components/controls/inputs/TextField.vue";
import { Column } from "@/components/grid/columns/Column";
import {
  FilterCondition,
  FilterConnection,
  FilterOption,
} from "@/components/grid/filters/types";
import { GridState } from "@/components/grid/GridState";
import {
  defineComponent,
  PropType,
  inject,
  computed,
} from "@vue/composition-api";
import $tc from "@/textConstants";

export default defineComponent({
  name: "FilterItem",
  components: { NumberField, TextField },
  props: {
    column: {
      type: Object as PropType<Column<any, any>>,
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
      gridState.setFilter(props.filter, { condition: newCondition });
    };

    const updateValue = (newValue: any) => {
      gridState.setFilter(props.filter, { value: newValue });
    };

    const updateConnection = (newConnection: FilterConnection) => {
      gridState.setFilter(props.filter, { connection: newConnection });
    };

    const removeFilter = () => {
      gridState.removeFilter(props.column, props.index);
    };

    const isLast = computed(
      () => props.index + 1 === gridState.filterOptions[props.column.key].length
    );

    return {
      updateCondition,
      updateValue,
      updateConnection,
      removeFilter,
      isLast,
      $tc,
    };
  },
});
</script>
