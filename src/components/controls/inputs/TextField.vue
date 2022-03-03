<template>
  <v-text-field
    v-bind="$attrs"
    :value="value"
    type="text"
    @input="updateValue"
  />
</template>

<script lang="ts">
import { defineComponent, ref } from "@vue/composition-api";

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
    const internalValue = ref(props.value);

    const updateValue = (newValue: string) => {
      context.emit("input", newValue);
    };

    return {
      internalValue,
      updateValue,
    };
  },
});
</script>
