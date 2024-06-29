<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-red text-white">
      <q-toolbar>
        <q-btn
          dense
          flat
          round
          icon="menu"
          @click="toggleLeftDrawer"
          color="white"
        />
        <q-toolbar-title>
          <q-avatar>
            <img src="../assets/Sem título.svg" />
          </q-avatar>
          PDf REd
        </q-toolbar-title>
        <q-file
          v-if="pdfUrl"
          class="text-white"
          v-model="selectedFile"
          filled
          label="Pdf +"
          accept=".pdf"
          color="red"
          :label-color="isHovering ? 'red' : 'white'"
          :class="{ 'bg-white': isHovering }"
          outlined
          outlined-color="red"
          @update:model-value="adicionarPDF"
          style="box-shadow: none; width: 18vw"
          @mouseover="isHovering = true"
          @mouseleave="isHovering = false"
        />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      side="left"
      bordered
      :width="250"
    >
      <q-list>
        <q-expansion-item
          expand-icon="chevron_down"
          :label="'PDFs Recentes'"
          :header-class="'text-white bg-red'"
          class="q-pa-sm"
        >
          <template v-slot:header-actions> </template>
          <q-separator />
          <q-btn
            flat
            dense
            round
            icon="delete"
            @click="resetpdfs"
            class="float-right"
            size="sm"
            color="red"
          />
          <q-scroll-area style="height: 200px">
            <q-item
              v-for="(pdf, index) in pdfs"
              :key="index"
              clickable
              @click="openPdf(pdf.data, pdf.nome)"
            >
              <q-item-section avatar>
                <q-icon name="description" color="red" />
              </q-item-section>
              <q-item-section>
                {{ pdf.nome }}
              </q-item-section>
              <q-btn
                flat
                dense
                round
                icon="delete"
                @click="removerPDF(index)"
                class="float-right"
                size="sm"
                color="red"
              />
            </q-item>
            <q-empty
              v-if="pdfs.length === 0"
              icon="description"
              message="Nenhum PDF adicionado."
            />
          </q-scroll-area>
        </q-expansion-item>

        <q-separator />

        <q-expansion-item
          expand-icon="chevron_down"
          :label="'PDFs Carregados'"
          :header-class="'text-grey-8'"
          class="q-pa-sm"
        >
          <template v-slot:header-actions> </template>
          <q-separator />
          <q-btn
            flat
            dense
            round
            icon="delete"
            @click="limparPDFsCarregados"
            class="float-right"
            size="sm"
            color="red"
          />
          <q-scroll-area style="height: 200px">
            <q-item
              v-for="(pdf, index) in pdfsCarregados"
              :key="index"
              clickable
              @click="openPdf(pdf.data, pdf.nome)"
            >
              <q-item-section avatar>
                <q-icon name="description" />
              </q-item-section>
              <q-item-section>
                {{ pdf.nome }}
              </q-item-section>
              <q-btn
                flat
                dense
                round
                icon="delete"
                @click="removerPDFCarregado(index)"
                class="float-right"
                size="sm"
                color="red"
              />
            </q-item>
            <q-empty
              v-if="pdfsCarregados.length === 0"
              icon="description"
              message="Nenhum PDF carregado."
            />
          </q-scroll-area>
        </q-expansion-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <q-page class="row">
        <div v-if="pdfUrl" class="col-12 q-pa-md">
          <q-card flat bordered class="full-height bg-transparent">
            <q-card-section
              class="bg-grey-1 full-height column bg-transparent"
            >
              <q-inner-loading
                :showing="isLoading"
                class="absolute-center bg-transparent"
              >
                <q-spinner-gears
                  size="100%"
                  color="red"
                  class="bg-transparent"
                />
              </q-inner-loading>
              <q-pdfviewer
                :src="pdfUrl"
                type="html5"
                style="height: 100%"
              ></q-pdfviewer>
            </q-card-section>
          </q-card>
        </div>
        <div
          v-else
          :class="{ 'col-12': !pdfUrl }"
          class="q-pa-md full-height column justify-center items-center"
        >
          <q-file
            v-model="selectedFile"
            filled
            label="Selecione um PDF"
            accept=".pdf"
            style="width: 100%"
            color="red"
            outlined
            outlined-color="red"
            @update:model-value="adicionarPDF"
          />
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
    const pdfUrl = ref(null);
    const pdfs = ref([]);
    const pdfsCarregados = ref([]);
    const isLoading = ref(false);
    const selectedFile = ref(null);
    const isHovering = ref(false);

    onMounted(() => {
      carregarPDFsDoLocalStorage();
    });

    function toggleLeftDrawer() {
      leftDrawerOpen.value = !leftDrawerOpen.value;
    }

    function openPdf(data, nome) {
      isLoading.value = true;
      setTimeout(() => {
        pdfUrl.value = data;
        isLoading.value = false;
        // Atualiza o título da página com o nome do PDF (opcional)
        document.title = nome || 'PDF Viewer';
      }, 500);
    }

    function adicionarPDF(file) {
      if (file) {
        if (file.type.startsWith('application/pdf')) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64Data = event.target.result;
            const nomePDF = file.name;
            pdfsCarregados.value.push({ nome: nomePDF, data: base64Data });
            openPdf(base64Data, nomePDF);
            selectedFile.value = null;
          };
          reader.readAsDataURL(file);
        } else {
          // Utilize um componente Quasar para exibir a mensagem de erro
          this.$q.notify({
            message: 'O arquivo selecionado não é um PDF.',
            color: 'negative',
          });
        }
      } else {
        // Utilize um componente Quasar para exibir a mensagem de erro
        this.$q.notify({
          message: 'Por favor, selecione um PDF.',
          color: 'negative',
        });
      }
    }

    function removerPDF(index) {
      const pdfRemovido = pdfs.value.splice(index, 1)[0];
      localStorage.removeItem(pdfRemovido.nome);
    }

    function removerPDFCarregado(index) {
      pdfsCarregados.value.splice(index, 1);
    }

    function resetpdfs() {
      // Utilize um componente Quasar para exibir o diálogo de confirmação
      this.$q
        .dialog({
          title: 'Confirmação',
          message:
            'Tem certeza que deseja eliminar a lista de PDFs todos recentes?',
          cancel: true,
        })
        .onOk(() => {
          localStorage.clear();
          pdfs.value = [];
        });
    }

    function carregarPDFsDoLocalStorage() {
      for (let i = 0; i < localStorage.length; i++) {
        const nome = localStorage.key(i);
        const data = localStorage.getItem(nome);
        pdfs.value.push({ nome, data });
      }
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
      toggleLeftDrawer,
      openPdf,
      adicionarPDF,
      removerPDF,
      removerPDFCarregado,
      resetpdfs,
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
