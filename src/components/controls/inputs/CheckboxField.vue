<template>
  <v-checkbox v-bind="$attrs" :value="internalValue" @input="updateValue" />
</template>

<script lang="ts">
import { defineComponent, ref } from "@vue/composition-api";

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
    const internalValue = ref(props.value);

    const updateValue = (newValue: boolean) => {
      context.emit("input", newValue);
    };

    return {
      internalValue,
      updateValue,
    };
  },
});
</script>
