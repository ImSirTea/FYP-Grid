<template>
  <v-text-field
    v-if="!readonly"
    v-bind="$attrs"
    :value="value"
    :type="$attrs.type || 'text'"
    @input="updateValue"
  />
  <span v-else> {{ value }} </span>
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
    readonly: {
      type: Boolean,
      required: false,
      default: false,
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
