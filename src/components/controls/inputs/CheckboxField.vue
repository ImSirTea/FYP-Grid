<template>
  <v-checkbox v-bind="$attrs" v-model="internalValue" />
</template>

<script lang="ts">
import { defineComponent, computed } from "@vue/composition-api";

export default defineComponent({
  name: "CheckboxField",
  model: {
    prop: "value",
    event: "input",
  },
  props: {
    value: {
      type: Boolean,
      required: false,
      default: () => undefined,
    },
  },
  setup(props, context) {
    const internalValue = computed({
      get: () => props.value,
      set: (newValue) => context.emit("input", newValue),
    });

    return {
      internalValue,
    };
  },
});
</script>
