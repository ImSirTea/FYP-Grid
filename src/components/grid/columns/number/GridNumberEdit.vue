<template>
  <number-field v-model="internalValue" />
</template>

<script lang="ts">
import NumberField from "@/components/controls/inputs/NumberField.vue";
import { NumberColumn } from "@/components/grid/columns/number/NumberColumn";
import { defineComponent, computed, PropType } from "@vue/composition-api";

export default defineComponent({
  name: "GridNumberEdit",
  components: { NumberField },
  model: {
    event: "input",
    prop: "value",
  },
  props: {
    item: {
      type: Object as PropType<Record<string, any>>,
      required: true,
    },
    column: {
      type: Object as PropType<NumberColumn<any>>,
      required: true,
    },
    value: {
      type: Number,
      required: false,
    },
  },
  setup(props, context) {
    const internalValue = computed({
      get: () => props.value,
      set: (value) => context.emit("input", value),
    });

    const updateValue = (value) => {
      context.emit("input", value);
    };

    return {
      internalValue,
      updateValue,
    };
  },
});
</script>
