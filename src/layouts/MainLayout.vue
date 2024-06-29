<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          Quasar App
        </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header>
          PDFs Baixados
          <q-btn flat dense round icon="delete" @click="resetpdfs" style="float: right;" />
        </q-item-label>

        <q-item v-for="(pdf, index) in pdfs" :key="index" clickable @click="openPdf(pdf.blob)">
          <q-item-section avatar>
            <q-icon name="description" />
          </q-item-section>
          <q-item-section>
            {{ pdf.filename }}
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <q-page padding>
        <q-file v-model="selectedFile" label="Selecionar PDF do dispositivo" @input="handleFileSelected" />

        <q-card v-if="pdf">
          <q-card-section style="max-width: 100%; height: 85vh;"> <!-- Add styles here -->
            <q-pdfviewer type="html5" :src="pdf" />
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

defineOptions({
  name: 'MainLayout'
})

const leftDrawerOpen = ref(false)
const pdf = ref(null)
const pdfs = ref([])
const selectedFile = ref(null)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function openPdf(blob) {
  pdf.value = URL.createObjectURL(blob); // Convert Blob to URL
}

// Lógica para lidar com o PDF selecionado no q-file
function handleFileSelected(file) {
  const selectedFile = file.target.files[0];
  if (selectedFile) {
    pdfs.value.push({
      filename: selectedFile.name,
      blob: selectedFile,
    });

    pdf.value = URL.createObjectURL(selectedFile);
  }
}


// Função para resetar a lista de PDFs baixados
function resetpdfs() {
  if (confirm("Tem certeza que deseja eliminar a lista de PDFs baixados?")) {
    pdfs.value = [];
    localStorage.removeItem('pdfs');
  }
}

onMounted(() => {
  const savedPdfs = localStorage.getItem('pdfs');
  if (savedPdfs) {
    // Carregar PDFs baixados do localStorage (se houver)
    pdfs.value = JSON.parse(savedPdfs).map(pdf => ({
      filename: pdf.filename,
      blob: new Blob([pdf.blob], { type: 'application/pdf' })
    }));
  }
});

// Quando a lista de PDFs for atualizada, salve no localStorage:
watch(pdfs, (newPdfs) => {
  localStorage.setItem('pdfs', JSON.stringify(newPdfs.map(pdf => ({
    filename: pdf.filename,
    blob: Array.from(pdf.blob)
  }))));
});
</script>

<style scoped>
.q-card-section {
  display: flex;
  justify-content: center;
  align-items: center;
}

.q-pdfviewer {
  width: 100%;
  height: 100%;
}
</style>
