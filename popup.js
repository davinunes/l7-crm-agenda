// popup.js - VERSÃO FINAL CORRIGIDA

document.getElementById('syncButton').addEventListener('click', () => {
    const statusEl = document.getElementById('status');
    statusEl.textContent = 'Capturando dados...';

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            files: ['content.js']
        }).then(() => {
            chrome.tabs.sendMessage(tabs[0].id, { action: "scrapeData" }, (response) => {
                if (chrome.runtime.lastError) {
                    statusEl.textContent = `Erro: ${chrome.runtime.lastError.message}`;
                    return;
                }

                if (response && response.error) {
                    statusEl.textContent = `Erro: ${response.error}`;
                
                // --- CORREÇÃO APLICADA AQUI ---
                // Verificando pelo campo 'ticketUUID' em vez do antigo 'ticketId'
                } else if (response && response.ticketUUID) {
                // ---------------------------------
                    statusEl.textContent = 'Dados capturados! Enviando...';
                    sendToN8n(response);
                } else {
                    statusEl.textContent = 'Nenhum dado de ticket encontrado.';
                }
            });
        });
    });
});

async function sendToN8n(data) {
    const webhookUrl = 'https://evolution1.acessodf.net/webhook-test/layer7-agenda';
    const statusEl = document.getElementById('status');

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            statusEl.textContent = '✅ Sucesso! Enviado para o n8n.';
        } else {
            const errorData = await response.json();
            statusEl.textContent = `Falha no envio: ${errorData.message || response.statusText}`;
        }
    } catch (error) {
        console.error('Erro ao chamar o webhook:', error);
        statusEl.textContent = 'Erro de conexão com o n8n.';
    }
}