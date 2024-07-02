<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-red text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" color="white" />
        <q-toolbar-title>
          <q-avatar>
            <img src="../assets/Sem título.svg" />
          </q-avatar>
          PDF Red
        </q-toolbar-title>
        <q-file v-if="pdfUrl" class="text-white" v-model="selectedFile" filled label="Pdf +" accept=".pdf" color="red"
          :label-color="isHovering ? 'red' : 'white'" :class="{ 'bg-white': isHovering }" outlined outlined-color="red"
          @update:model-value="adicionarPDF" style="box-shadow: none;
                 width: 18vw;" @mouseover="isHovering = true" @mouseleave="isHovering = false" />
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered style="margin: 0">
      <q-list>
        <q-item-label header class="text-white bg-red">
          PDFs Recentes
          <q-btn flat dense round icon="delete" @click="resetpdfs" class="float-right" size="sm" color="white" />
        </q-item-label>
        <q-separator />
        <q-scroll-area style="height: 44.7vh;">
          <q-item v-for="(pdf, index) in pdfs" :key="index" clickable @click="openPdf(pdf.url)">
            <q-item-section avatar>
              <q-icon name="description" color="red" />
            </q-item-section>
            <q-item-section>
              {{ pdf.nome }}
            </q-item-section>
            <q-btn flat dense round icon="delete" @click="removerPDF(index)" class="float-right" size="sm"
              color="red" />
          </q-item>
          <q-empty v-if="pdfs && pdfs.length === 0" icon="description" message="Nenhum PDF adicionado." />
        </q-scroll-area>
      </q-list>

      <q-separator />

      <q-list>
        <q-item-label header class="text-white bg-red">
          PDFs Carregados
          <q-btn flat dense round icon="delete" @click="limparPDFsCarregados" class="float-right" size="sm"
            color="white" />
        </q-item-label>
        <q-separator />
        <q-scroll-area style="height: 44.7vh;">
          <q-item v-for="(pdf, index) in pdfsCarregados" :key="index" clickable @click="openPdf(pdf.url)">
            <q-item-section avatar>
              <q-icon name="description" color="red" />
            </q-item-section>
            <q-item-section>
              {{ pdf.nome }}
            </q-item-section>
            <q-btn flat dense round icon="delete" @click="removerPDFCarregado(index)" class="float-right" size="sm"
              color="red" />
          </q-item>
          <q-empty v-if="pdfsCarregados && pdfsCarregados.length === 0" icon="description"
            message="Nenhum PDF carregado." />
        </q-scroll-area>
      </q-list>
    </q-drawer>

    <q-page-container>
      <q-page class="row">
        <div v-if="pdfUrl" class="col-12 q-pa-md">
          <q-card flat bordered class="full-height bg-transparent">
            <q-card-section class="bg-grey-1 full-height column bg-transparent">
              <q-inner-loading :showing="isLoading" class="absolute-center">
                <q-spinner-gears size="100%" color="red" class="bg-transparent" />
              </q-inner-loading>
              <canvas ref="canvasRef" class="full-height"></canvas> </q-card-section>
          </q-card>
        </div>
        <div v-else :class="{ 'col-12': !pdfUrl }" class="q-pa-md full-height column justify-center items-center">
          <q-file v-model="selectedFile" filled label="Selecione um PDF" accept=".pdf" style="width: 100%;" color="red"
            outlined outlined-color="red" @update:model-value="adicionarPDF" />
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { ref, onMounted } from 'vue';
import { getDocument } from 'pdfjs-dist';

export default {
  setup() {
    const leftDrawerOpen = ref(false);
    const pdfUrl = ref(null);
    const pdfs = ref([]);
    const pdfsCarregados = ref([]);
    const isLoading = ref(false);
    const selectedFile = ref(null);
    const canvasRef = ref(null);

    onMounted(() => {
      carregarPDFsDoLocalStorage();
    });

    function toggleLeftDrawer() {
      leftDrawerOpen.value = !leftDrawerOpen.value;
    }

    async function openPdf(url) {
      isLoading.value = true;
      try {
        // Wait for getDocument promise to resolve
        const pdfDoc = await getDocument(url).promise;

        const numPages = pdfDoc.numPages;
        renderPage(pdfDoc, 1); // Now safe to call renderPage
      } catch (error) {
        console.error('Error loading PDF:', error);
      } finally {
        isLoading.value = false;
      }
    }

    async function renderPage(pdfDoc, pageNumber) {
      const page = await pdfDoc.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.5 });

      const canvas = canvasRef.value;
      const context = canvas.getContext('2d');

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext);
    }

    function adicionarPDF(file) {
      if (file) {
        if (file.type.startsWith('application/pdf')) {
          const url = URL.createObjectURL(file);
          const nomePDF = file.name;
          pdfsCarregados.value.push({ nome: nomePDF, url: url });
          salvarPDFNoLocalStorage(nomePDF, url);
          openPdf(url);
          selectedFile.value = null;
        } else {
          console.error("O arquivo selecionado não é um PDF.");
        }
      } else {
        console.error("Por favor, selecione um PDF.");
      }
    }

    function removerPDF(index) {
      pdfs.value.splice(index, 1);
      // Atualizar o LocalStorage
      salvarPDFsNoLocalStorage();
    }

    function removerPDFCarregado(index) {
      pdfsCarregados.value.splice(index, 1);
    }

    function resetpdfs() {
      if (confirm('Tem certeza que deseja eliminar a lista de PDFs?')) {
        localStorage.clear();
        pdfs.value = [];
        pdfsCarregados.value = []; // Limpa também a lista de PDFs carregados
      }
    }

    // Funções auxiliares
    function salvarPDFNoLocalStorage(nome, url) {
      localStorage.setItem(nome, url);
    }

    function carregarPDFsDoLocalStorage() {
      for (let i = 0; i < localStorage.length; i++) {
        const nome = localStorage.key(i);
        const url = localStorage.getItem(nome);
        pdfs.value.push({ nome, url });
      }
    }

    function salvarPDFsNoLocalStorage() {
      // NÃO LIMPE O localStorage
      // localStorage.clear(); // Limpa o localStorage

      pdfs.value.forEach(pdf => {
        localStorage.setItem(pdf.nome, pdf.url);
      });
    }

    function limparPDFsCarregados() {
      pdfsCarregados.value = [];
    }

    return {
      leftDrawerOpen,
      pdfUrl,
      pdfs,
      pdfsCarregados,
      isLoading,
      selectedFile,
      canvasRef,
      toggleLeftDrawer,
      openPdf,
      adicionarPDF,
      removerPDF,
      removerPDFCarregado,
      resetpdfs,
      limparPDFsCarregados,
    };
  }
};
</script>

<style scoped>
.full-height {
  height: calc(100vh - 64px);
}

.q-spinner-gears {
  background-color: transparent;
}
</style>
