<template>
  <v-container fluid>
    <v-row>
      <v-col cols="auto">
        <component
          v-if="!readonly"
          v-bind="$attrs"
          :is="component"
          :value="internalValue"
          :readonly="readonly"
          @input="internalValue = $event"
        />
        <span v-else>{{ internalValue }}</span>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { AnyGridColumn } from "@/components/grid/columns/Column";
import { defineComponent, PropType, ref, computed } from "@vue/composition-api";
import { Component } from "vue";

export default defineComponent({
  name: "GridCell",
  props: {
    component: {
      type: Object as PropType<Component>,
      required: true,
    },
    item: {
      type: Object as PropType<Record<string, any>>,
      required: true,
    },
    column: {
      type: Object as PropType<AnyGridColumn>,
      required: true,
    },
  },
  setup(props, context) {
    const readonly = ref(true);
    const internalValue = computed({
      get: () => props.column.value(props.item),
      set: (newValue: any) => {
        context.emit("input", newValue);
      },
    });

    return {
      internalValue,
      readonly,
    };
  },
});
</script>
