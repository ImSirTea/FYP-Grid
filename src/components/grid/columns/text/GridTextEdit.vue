<template>
  <text-field v-model="internalValue" class="pa-0 ma-0" dense hide-details />
</template>

<script lang="ts">
import TextField from "@/components/controls/inputs/TextField.vue";
import { defineComponent, computed } from "@vue/composition-api";

export default defineComponent({
  name: "GridTextEdit",
  components: { TextField },
  model: {
    event: "input",
    prop: "value",
  },
  props: {
    value: {
      type: String,
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
