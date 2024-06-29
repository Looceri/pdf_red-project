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
          @update:model-value="adicionarPDF" style="box-shadow: none;
                 width: 10vw;" @mouseover="isHovering = true" @mouseleave="isHovering = false" />
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered>
      <q-list>
        <q-item-label header class="text-white bg-red"> <!--- Cor do cabeçalho da lista -->
          PDFs Recentes
          <q-btn flat dense round icon="delete" @click="resetpdfs" class="float-right" size="sm" color="white" />
        </q-item-label>
        <q-separator />
        <q-scroll-area style="height: calc(100% - 50px);">
          <q-item v-for="(pdf, index) in pdfs" :key="index" clickable @click="openPdf(pdf.url)">
            <q-item-section avatar>
              <q-icon name="description" color="white" /> <!--- Cor do ícone -->
            </q-item-section>
            <q-item-section>
              {{ pdf.nome }}
            </q-item-section>
            <q-btn flat dense round icon="delete" @click="removerPDF(index)" class="float-right" size="sm"
              color="white" />
          </q-item>
          <q-empty v-if="pdfs && pdfs.length === 0" icon="description" message="Nenhum PDF adicionado." />
        </q-scroll-area>
      </q-list>

      <q-separator />

      <q-list>
        <q-item-label header class="text-grey-8">
          PDFs Carregados
          <q-btn flat dense round icon="delete" @click="limparPDFsCarregados" class="float-right" size="sm"
            color="red" />
        </q-item-label>
        <q-separator />
        <q-scroll-area style="height: calc(100% - 50px);">
          <q-item v-for="(pdf, index) in pdfsCarregados" :key="index" clickable @click="openPdf(pdf.url)">
            <q-item-section avatar>
              <q-icon name="description" />
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
        <div v-if="pdfUrl" class="col-12 q-pa-md"> <!--- Mudança aqui -->
          <q-card flat bordered class="full-height bg-transparent">
            <q-card-section class="bg-grey-1 full-height column bg-transparent">
              <q-inner-loading :showing="isLoading" class="absolute-center bg-transparent">
                <q-spinner-gears size="100%" color="red" class="bg-transparent" />
              </q-inner-loading>
              <q-pdfviewer :src="pdfUrl" type="html5" style="height: 100%;"></q-pdfviewer>
            </q-card-section>
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

export default {
  setup() {
    const leftDrawerOpen = ref(false);
    const leftDrawerWidth = ref(250);
    const pdfUrl = ref(null);
    const pdfs = ref([]); // PDFs recentes do LocalStorage
    const pdfsCarregados = ref([]); // PDFs carregados recentemente
    const isLoading = ref(false);
    const selectedFile = ref(null);
    const filePickerVisible = ref(false); // Para controlar a cor do botão "add"
    const isHovering = ref(false);

    onMounted(() => {
      carregarPDFsDoLocalStorage();
    });

    function toggleLeftDrawer() {
      leftDrawerOpen.value = !leftDrawerOpen.value;
    }

    function openPdf(url) {
      isLoading.value = true;
      setTimeout(() => {
        pdfUrl.value = url;
        isLoading.value = false;
      }, 500);
    }

    function adicionarPDF(file) {
      if (file) {
        if (file.type.startsWith('application/pdf')) {
          const url = URL.createObjectURL(file);
          const nomePDF = file.name;
          pdfsCarregados.value.push({ nome: nomePDF, url: url });
          salvarPDFNoLocalStorage(nomePDF, url);
          openPdf(url);
          selectedFile.value = null; // Limpa o q-file após a seleção
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
      leftDrawerWidth,
      pdfUrl,
      pdfs,
      pdfsCarregados,
      isLoading,
      selectedFile, // Variável para o q-file
      toggleLeftDrawer,
      openPdf,
      adicionarPDF,
      removerPDF,
      removerPDFCarregado,
      resetpdfs,
      limparPDFsCarregados,
      filePickerVisible,
      isHovering
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
