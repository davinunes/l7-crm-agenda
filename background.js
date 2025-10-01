// background.js - VERSÃO FINAL CORRIGIDA

const rule = {
  conditions: [
    new chrome.declarativeContent.PageStateMatcher({
      pageUrl: {
        // Usamos 'urlMatches' com uma expressão regular que valida a URL inteira.
        urlMatches: 'https://crm-l7\\.vercel\\.app/tickets/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}'
      },
    })
  ],
  actions: [new chrome.declarativeContent.ShowAction()]
};

// Quando a extensão é instalada ou atualizada...
chrome.runtime.onInstalled.addListener(() => {
  // --- CORREÇÃO APLICADA AQUI ---
  // O nome correto do evento é 'onPageChanged', e não 'onChanged'.
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([rule]);
  });
  // ---------------------------------
});