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
          <q-btn flat dense round icon="delete" @click="resetDownloadedPdfs" style="float: right;" />
        </q-item-label>

        <q-item
          v-for="(pdf, index) in downloadedPdfs"
          :key="index"
          clickable
          @click="openPdf(pdf.blob)"
        >
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

        <q-card v-if="downloadedPdf">
          <q-card-section>
            <q-pdf-viewer :src="downloadedPdf" />
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
const downloadedPdf = ref(null)
const downloadedPdfs = ref(['sagfdsa','asdasd'])
const selectedFile = ref(null)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function openPdf(blob) {
  downloadedPdf.value = URL.createObjectURL(blob);
}

// Lógica para lidar com o PDF selecionado no q-file
function handleFileSelected(file) {
  if (file.file) {
    // Adicione o PDF à lista downloadedPdfs
    downloadedPdfs.value.push({
      filename: file.file.name,
      blob: file.file,
    });


    console.log(downloadedPdfs)
    // Exiba o PDF
    downloadedPdf.value = URL.createObjectURL(file.file);
  }
}

// Lógica de download e armazenamento do PDF
async function downloadPDF(url) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const filename = url.split('/').pop();

    downloadedPdfs.value.push({ filename, blob }); // Armazena o Blob
  } catch (error) {
    console.error('Erro ao baixar PDF:', error);
  }
}

// Função para resetar a lista de PDFs baixados
function resetDownloadedPdfs() {
  if (confirm("Tem certeza que deseja eliminar a lista de PDFs baixados?")) {
    downloadedPdfs.value = [];
    localStorage.removeItem('downloadedPdfs');
  }
}

onMounted(() => {
  const savedPdfs = localStorage.getItem('downloadedPdfs');
  if (savedPdfs) {
    // Carregar PDFs baixados do localStorage (se houver)
    downloadedPdfs.value = JSON.parse(savedPdfs).map(pdf => ({
      filename: pdf.filename,
      blob: new Blob([pdf.blob], { type: 'application/pdf' })
    }));
  }
});

// Quando a lista de PDFs for atualizada, salve no localStorage:
watch(downloadedPdfs, (newPdfs) => {
  localStorage.setItem('downloadedPdfs', JSON.stringify(newPdfs.map(pdf => ({
    filename: pdf.filename,
    blob: Array.from(pdf.blob)
  }))));
});
</script>
