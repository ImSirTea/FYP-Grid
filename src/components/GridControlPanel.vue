<template>
  <v-container fluid class="grid-control-panel-container">
    <v-row>
      <v-spacer />
      <v-col cols="4" sm="3" md="2">
        <v-text-field
          :value="gridState.searchValue"
          append-icon="mdi-magnify"
          placeholder="Search for"
          @input="updateSearchValue"
        />
      </v-col>
      <v-spacer />
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { GridState } from "@/components/grid/GridState";
import { defineComponent, PropType } from "@vue/composition-api";

/**
 * Parent component to all (mostly state) management functions
 */
export default defineComponent({
  name: "GridControlPanel",
  props: {
    gridState: {
      type: Object as PropType<GridState>,
      required: true,
    },
  },
  setup(props) {
    const updateSearchValue = (newValue: string) => {
      props.gridState.setSearchValue(newValue);
    };

    return {
      updateSearchValue,
    };
  },
});
</script>
