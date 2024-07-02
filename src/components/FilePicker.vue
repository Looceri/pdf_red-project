<!-- FilePicker.vue -->
<template>
  <q-file v-if="showPicker" filled label="Selecione um PDF" accept=".pdf" style="width: 100%;" color="red" outlined
    outlined-color="red" v-model="selectedFile" @update:model-value="onFileSelected" />
</template>

<script>
import { ref } from 'vue';

export default {
  props: ['showPicker'],
  emits: ['file-selected'],
  setup(props, { emit }) {
    const selectedFile = ref(null);

    function onFileSelected(file) {
      emit('file-selected', file);
      selectedFile.value = null; // Clear the input after emitting
    }

    return {
      selectedFile,
      onFileSelected
    };
  }
};
</script>
