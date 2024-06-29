<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          Quasar App
        </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <q-item-label
          header
        >
          Essential Links
        </q-item-label>

        <EssentialLink
          v-for="link in linksList"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <q-page padding>
        <q-input v-model="pdfUrl" label="URL do PDF" />
        <q-btn @click="downloadPDF" label="Baixar PDF" />

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
import { ref } from 'vue'
import EssentialLink from 'components/EssentialLink.vue'
import { saveAs } from 'file-saver'; // Importar a biblioteca file-saver

defineOptions({
  name: 'MainLayout'
})

const linksList = [
  // ... (seus links)
]

const leftDrawerOpen = ref(false)
const pdfUrl = ref('')
const downloadedPdf = ref(null)

function toggleLeftDrawer () {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

async function downloadPDF() {
  try {
    const response = await fetch('http://localhost:8081/' + pdfUrl.value); // Use o proxy
    const blob = await response.blob();
    const filename = pdfUrl.value.split('/').pop();
    saveAs(blob, filename);
    downloadedPdf.value = URL.createObjectURL(blob);
  } catch (error) {
    console.error('Erro ao baixar PDF:', error);
  }
}
</script>
