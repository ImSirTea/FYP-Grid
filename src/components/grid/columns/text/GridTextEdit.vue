<template>
  <text-field :value="internalValue" @input="updateValue" />
</template>

<script lang="ts">
import TextField from "@/components/controls/inputs/TextField.vue";
import { defineComponent, ref } from "@vue/composition-api";

export default defineComponent({
  name: "GridTextEdit",
  components: { TextField },
  props: {
    value: {
      type: Text,
      required: false,
    },
  },
  setup(props, context) {
    const internalValue = ref(props.value);

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
