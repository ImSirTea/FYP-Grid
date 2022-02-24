<template>
  <v-text-field
    v-bind="$attrs"
    :value="value"
    :min="min"
    :max="max"
    type="number"
    @input="updateValue"
  />
</template>

<script lang="ts">
import { defineComponent, ref } from "@vue/composition-api";

export default defineComponent({
  name: "NumberField",
  props: {
    value: {
      type: Number,
      required: false,
      default: () => undefined,
    },
    min: {
      type: Number,
      required: false,
      default: () => undefined,
    },
    max: {
      type: Number,
      required: false,
      default: () => undefined,
    },
  },
  setup(props, context) {
    const internalValue = ref(props.value);

    const updateValue = () => {
      context.emit("");
    };

    return {
      internalValue,
      updateValue,
    };
  },
});
</script>
