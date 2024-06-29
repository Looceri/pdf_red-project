<template>
  <div v-if="pdfUrl">
    <iframe :src="pdfUrl" width="100%" height="600px" />
  </div>
  <div v-else>
    Carregando PDF...
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'PdfViewer',
  data() {
    return {
      pdfUrl: null,
    }
  },
  // Em PdfViewer.vue
  mounted() {
    window.resolveLocalFileSystemURL(
      cordova.file.dataDirectory + 'pdf.pdf',
      (fileEntry) => {
        this.pdfUrl = fileEntry.toURL();
      },
      (error) => {
        console.error('Erro ao acessar o arquivo:', error);
      }
    );
  }
})
</script>
