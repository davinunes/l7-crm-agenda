// popup.js - VERSÃO COM MELHOR EXIBIÇÃO DE ERROS

document.getElementById('syncButton').addEventListener('click', () => {
    const statusEl = document.getElementById('status');
    statusEl.textContent = 'Capturando dados...';

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        // Garante que o content.js já foi injetado antes de enviar a mensagem
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            files: ['content.js']
        }).then(() => {
            chrome.tabs.sendMessage(tabs[0].id, { action: "scrapeData" }, (response) => {
                if (chrome.runtime.lastError) {
                    statusEl.textContent = `Erro: ${chrome.runtime.lastError.message}`;
                    return;
                }

                // --- LÓGICA DE EXIBIÇÃO DE ERRO MELHORADA ---
                if (response && response.error) {
                    // Exibe o erro específico enviado pelo content.js
                    statusEl.textContent = `Erro: ${response.error}`;
                } else if (response && response.ticketId) {
                    // Sucesso, envia para o n8n
                    statusEl.textContent = 'Dados capturados! Enviando...';
                    sendToN8n(response);
                } else {
                    // Erro genérico se a resposta for vazia
                    statusEl.textContent = 'Nenhum dado de ticket encontrado.';
                }
            });
        });
    });
});

async function sendToN8n(data) {
    const webhookUrl = 'https://evolution1.acessodf.net/webhook-test/layer7-agenda'; // ⚠️ TROQUE PELA SUA URL REAL
    const statusEl = document.getElementById('status');

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            statusEl.textContent = '✅ Sucesso! Agendamento enviado.';
        } else {
            const errorData = await response.json();
            statusEl.textContent = `Falha no envio: ${errorData.message || response.statusText}`;
        }
    } catch (error) {
        console.error('Erro ao chamar o webhook:', error);
        statusEl.textContent = 'Erro de conexão com o n8n.';
    }
}