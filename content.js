// content.js - VERSÃO 5.0 (FINAL - USANDO A CONSULTA EXATA DO CRM)

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "scrapeData") {
        console.log("[Extensão] Mensagem recebida. Iniciando busca com a consulta final...");
        fetchDataFromApi()
            .then(data => {
                console.log("[Extensão] Sucesso! Dados formatados:", data);
                sendResponse(data);
            })
            .catch(error => {
                console.error("[Extensão] Erro capturado:", error.message);
                sendResponse({ error: error.message });
            });
    }
    return true; 
});

async function fetchDataFromApi() {
    const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1Ymp2a2N1ZGJ1ZHB4Y3ZtZHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2Mjk5NTgsImV4cCI6MjA2NDIwNTk1OH0.VuwYXyyflF-8ynNdewiBn2AcivOXyIy06zLZrP1XPAQ';
    const authTokenKey = 'crm-auth-token';

    // 1. Pega o UUID da URL
    const pathParts = window.location.pathname.split('/tickets/');
    if (!pathParts[1]) throw new Error("ID do ticket não encontrado na URL.");
    const currentTicketUUID = pathParts[1].split('/')[0];
    console.log(`[Extensão] Passo 1: UUID do ticket a ser buscado: ${currentTicketUUID}`);

    // --- A CONSULTA EXATA DO SEU CURL ---
    // Esta é a string 'select' que o frontend do CRM usa e que sabemos que funciona.
    const selectQuery = `*%2Cclient%3Aclient_id(id%2Cname%2Cgroup_id%2Cgroup%3Agroup_id(id%2Cname%2Cpriority))%2Ctasks%3Atasks(*)%2Cmessages%3Aticket_messages(*)%2Cfiles%3Aticket_files(*)`;
    
    // Montamos a URL final, combinando a consulta exata com nosso filtro de ID.
    const apiUrl = `https://jubjvkcudbudpxcvmdsc.supabase.co/rest/v1/tickets?select=${selectQuery}&id=eq.${currentTicketUUID}`;
    console.log("[Extensão] Usando URL final montada a partir do CURL:", apiUrl);
    // ------------------------------------

    // 2. Pega o token de autenticação
    const authDataString = localStorage.getItem(authTokenKey);
    if (!authDataString) throw new Error(`Token não encontrado (chave: ${authTokenKey}).`);
    const authData = JSON.parse(authDataString);
    const bearerToken = authData.access_token;
    if (!bearerToken) throw new Error("A chave 'access_token' não foi encontrada.");
    console.log("[Extensão] Passo 2: Token de autenticação encontrado.");

    // 3. Executa a chamada fetch
    console.log("[Extensão] Passo 3: Realizando chamada fetch para a API...");
    const response = await fetch(apiUrl, {
        method: 'GET',
        headers: { 'apikey': apiKey, 'Authorization': `Bearer ${bearerToken}` }
    });
    console.log(`[Extensão] Resposta da API recebida com status: ${response.status}`);
    if (!response.ok) throw new Error(`Erro na API: Status ${response.status}.`);
    
    const ticketResponse = await response.json();
    if (!ticketResponse || ticketResponse.length === 0) {
        throw new Error(`A API não retornou dados para o ticket com UUID ${currentTicketUUID}.`);
    }
    const currentTicket = ticketResponse[0];
    console.log("[Extensão] Ticket atual encontrado:", currentTicket);

    // 4. Formata os dados
    const formattedData = {
        ticketUUID: currentTicket.id,
        ticketNumber: currentTicket.number,
        ticketTitle: currentTicket.title,
        ticketDescription: currentTicket.description,
        clientName: currentTicket.client?.name || 'Cliente não encontrado',
        clientGroup: currentTicket.client?.group?.name || 'Grupo não definido',
        ticketScheduleStart: currentTicket.scheduled_start,
        ticketScheduleEnd: currentTicket.scheduled_end,
        
        // Incluindo os arrays completos para o n8n processar
        tasks: (currentTicket.tasks || []).map(task => ({
            taskUUID: task.id, 
            title: task.title, 
            status: task.status,
            description: task.description,
            scheduleStart: task.scheduled_start, 
            scheduleEnd: task.scheduled_end,
        })),
        messages: currentTicket.messages || [], // ENVIANDO O ARRAY DE MENSAGENS
        files: currentTicket.files || []       // ENVIANDO O ARRAY DE ARQUIVOS
    };
    console.log("[Extensão] Passo 4: Dados formatados para envio.");
    return formattedData;
}