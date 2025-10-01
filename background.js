// background.js

// Regex para validar um padrão de UUID: 8-4-4-4-12 caracteres hexadecimais
const uuidRegex = '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}';

// A regra que será aplicada
const rule = {
  conditions: [
    new chrome.declarativeContent.PageStateMatcher({
      pageUrl: {
        hostEquals: 'crm-l7.vercel.app',
        // Usamos uma regex para garantir que a URL seja exatamente /tickets/ seguido de um UUID
        pathMatches: `/tickets/${uuidRegex}`
      },
    })
  ],
  actions: [new chrome.declarativeContent.ShowAction()]
};

// Quando a extensão é instalada ou atualizada, configuramos as regras
chrome.runtime.onInstalled.addListener(() => {
  // Limpa regras antigas para evitar duplicação
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    // Adiciona a nossa nova regra
    chrome.declarativeContent.onPageChanged.addRules([rule]);
  });
});