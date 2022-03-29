<template>
  <v-container fluid>
    <v-row>
      <v-col cols="auto">
        <component
          v-bind="$attrs"
          :is="component"
          :item="item"
          :column="column"
          :value="internalValue"
          @input="$emit('input', value)"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { AnyGridColumn } from "@/components/grid/columns/Column";
import { defineComponent, PropType, ref, computed } from "@vue/composition-api";

export default defineComponent({
  name: "GridCell",
  props: {
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
    const readonly = ref(false);

    const internalValue = computed({
      get: () => props.column.value(props.item),
      set: (value) => context.emit("input", value),
    });

    const component = computed(() =>
      readonly.value ? props.column.viewRenderer : props.column.editRenderer
    );

    return {
      component,
      internalValue,
    };
  },
});
</script>
