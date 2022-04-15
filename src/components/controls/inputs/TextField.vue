<template>
  <v-text-field
    v-bind="$attrs"
    v-model="internalValue"
    :type="$attrs.type || 'text'"
  />
</template>

<script lang="ts">
import { defineComponent, computed } from "@vue/composition-api";

export default defineComponent({
  name: "TextField",
  props: {
    value: {
      type: String,
      required: false,
      default: "",
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
