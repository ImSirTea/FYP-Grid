<template>
  <v-container class="pa-0" fluid>
    <v-row no-gutters>
      <v-col cols="6">{{ $tc.hide }}</v-col>
      <v-col cols="6"> </v-col>
    </v-row>
    <v-row>
      <v-col cols="6">{{ $tc.pin }}</v-col>
      <v-col cols="6"> </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, inject, PropType } from "@vue/composition-api";
import { AnyGridColumn } from "@/components/grid/columns/Column";
import { GridState } from "@/components/grid/GridState";
import $tc from "@/textConstants";

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

    return {
      $tc,
    };
  },
});
</script>
