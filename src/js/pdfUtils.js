// pdfUtils.js
export default {
  salvarRotaPDF(nomeDoArquivo, url) {
    localStorage.setItem(nomeDoArquivo, url);
  },

  obterRotaPDF(nomeDoArquivo) {
    return localStorage.getItem(nomeDoArquivo);
  }
};
