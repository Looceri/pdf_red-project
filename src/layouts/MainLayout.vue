<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-red text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" color="white" />
        <q-toolbar-title>
          <q-avatar>
            <img src="../assets/Sem título.svg" />
          </q-avatar>
          PDf REd
        </q-toolbar-title>
        <q-file v-if="pdfUrl" class="text-white" v-model="selectedFile" filled label="Pdf +" accept=".pdf" color="red"
          :label-color="isHovering ? 'red' : 'white'" :class="{ 'bg-white': isHovering }" outlined outlined-color="red"
          @update:model-value="adicionarPDF" style="box-shadow: none; width: 18vw" @mouseover="isHovering = true"
          @mouseleave="isHovering = false" />
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered style="margin: 0">
      <q-list>
        <q-item-label header class="text-white bg-red">
          PDFs Recentes
          <q-btn flat dense round icon="delete" @click="resetpdfs" class="float-right" size="sm" color="white" />
        </q-item-label>
        <q-separator />
        <q-scroll-area style="height: 44.7vh">
          <q-item v-for="(pdf, index) in pdfs" :key="index" clickable @click="openPdf(pdf.data, pdf.nome)">
            <q-item-section avatar>
              <q-icon name="description" color="red" />
            </q-item-section>
            <q-item-section>
              {{ pdf.nome }}
            </q-item-section>
            <q-btn flat dense round icon="delete" @click="removerPDF(index)" class="float-right" size="sm"
              color="red" />
          </q-item>
          <q-empty v-if="pdfs.length === 0" icon="description" message="Nenhum PDF adicionado." />
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
        <q-scroll-area style="height: 44.7vh">
          <q-item v-for="(pdf, index) in pdfsCarregados" :key="index" clickable @click="openPdf(pdf.url, pdf.nome)">
            <q-item-section avatar>
              <q-icon name="description" color="red" />
            </q-item-section>
            <q-item-section>
              {{ pdf.nome }}
            </q-item-section>
            <q-btn flat dense round icon="delete" @click="removerPDFCarregado(index)" class="float-right" size="sm"
              color="red" />
          </q-item>
          <q-empty v-if="pdfsCarregados.length === 0" icon="description" message="Nenhum PDF carregado." />
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
              <q-pdfviewer :src="pdfUrl" type="html5" style="height: 100%" />
            </q-card-section>
          </q-card>
        </div>
        <div v-else :class="{ 'col-12': !pdfUrl }" class="q-pa-md full-height column justify-center items-center">
          <q-file v-model="selectedFile" filled label="Selecione um PDF" accept=".pdf" style="width: 100%" color="red"
            outlined outlined-color="red" @update:model-value="adicionarPDF" />
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue';

export default {
  setup() {
    const leftDrawerOpen = ref(false);
    const pdfUrl = ref(null);
    const pdfs = ref([]); // PDFs Recentes (permanent)
    const pdfsCarregados = ref([]); // PDFs Carregados (temporary)
    const isLoading = ref(false);
    const selectedFile = ref(null);
    const isHovering = ref(false);
    const pdfBlobUrl = ref(null);

    onMounted(() => {
      carregarPDFsDoLocalStorage();
    });

    onBeforeUnmount(() => {
      if (pdfBlobUrl.value) {
        URL.revokeObjectURL(pdfBlobUrl.value);
      }
    });

    function toggleLeftDrawer() {
      leftDrawerOpen.value = !leftDrawerOpen.value;
    }

    function openPdf(data, nome) {
      isLoading.value = true;

      if (typeof data === 'string' && data.startsWith('data:application/pdf')) {
        const byteCharacters = atob(data.split(',')[1]);
        const byteArrays = new Uint8Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteArrays[i] = byteCharacters.charCodeAt(i);
        }
        const blob = new Blob([byteArrays], { type: 'application/pdf' });
        pdfBlobUrl.value = URL.createObjectURL(blob);
        pdfUrl.value = pdfBlobUrl.value;
        isLoading.value = false;
      } else {
        pdfUrl.value = data;
        isLoading.value = false;
      }
    }

    function adicionarPDF(file) {
      if (file && file.type.startsWith('application/pdf')) {
        console.log(file);
        const nomePDF = file.name;
        const fileReader = new FileReader();
        fileReader.onload = (e) => {
          const base64Data = e.target.result;
          pdfs.value.push({ nome: nomePDF, data: base64Data }); // Add to PDFs Recentes
          salvarPDFsNoLocalStorage();
          openPdf(base64Data, nomePDF);
          selectedFile.value = null;
        };
        fileReader.readAsDataURL(file);
      } else {
        console.error('Selecione um arquivo PDF válido.');
      }
    }

    function removerPDF(index) {
      pdfs.value.splice(index, 1);
      salvarPDFsNoLocalStorage();
    }

    function removerPDFCarregado(index) {
      pdfsCarregados.value.splice(index, 1);
    }

    function resetpdfs() {
      if (confirm('Tem certeza que deseja eliminar a lista de PDFs?')) {
        localStorage.clear();
        pdfs.value = [];
        pdfsCarregados.value = [];
      }
    }

    function carregarPDFsDoLocalStorage() {
      for (let i = 0; i < localStorage.length; i++) {
        const nome = localStorage.key(i);
        const data = localStorage.getItem(nome);
        pdfs.value.push({ nome, data });
      }
    }

    function salvarPDFsNoLocalStorage() {
      localStorage.clear();
      pdfs.value.forEach(pdf => {
        localStorage.setItem(pdf.nome, pdf.data);
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
      isHovering,
      pdfBlobUrl,
      toggleLeftDrawer,
      openPdf,
      adicionarPDF,
      removerPDF,
      removerPDFCarregado,
      resetpdfs,
      carregarPDFsDoLocalStorage,
      salvarPDFsNoLocalStorage,
      limparPDFsCarregados,
    };
  },
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
