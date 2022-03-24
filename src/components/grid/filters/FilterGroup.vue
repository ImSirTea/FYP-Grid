<template>
  <v-form ref="form" v-model="valid" lazy-validation>
    <v-container fluid pa-0>
      <v-row justify="center">
        <v-col
          :key="column.key + index"
          v-for="(filter, index) in relevantFilters"
          cols="12"
        >
          <filter-item :column="column" :filter="filter" :index="index" />
        </v-col>
        <v-col cols="auto" class="pt-0">
          <v-btn
            color="success"
            small
            icon
            depressed
            outlined
            :disabled="!valid"
            @click="addNewFilter"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script lang="ts">
import { AnyGridColumn } from "@/components/grid/columns/Column";
import { GridState } from "@/components/grid/GridState";
import {
  defineComponent,
  PropType,
  computed,
  inject,
  ref,
} from "@vue/composition-api";
import $tc from "@/textConstants";
import FilterItem from "@/components/grid/filters/FilterItem.vue";

export default defineComponent({
  name: "FilterGroup",
  components: { FilterItem },
  props: {
    column: {
      type: Object as PropType<AnyGridColumn>,
      required: true,
    },
  },
  setup(props, context) {
    const gridState = inject<GridState>("gridState")!;
    const form = ref(null);

    const validate = () => (form.value as any)?.validate();

    const relevantFilters = computed(
      () => gridState.getColumnState(props.column.key).filterOptions
    );

    const addNewFilter = () => {
      if (!validate()) return;

      gridState.addNewFilter(props.column);
    };

    return {
      valid: ref(true),
      form,
      gridState,
      addNewFilter,
      relevantFilters,
      $tc,
    };
  },
});
</script>
