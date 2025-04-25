// Função principal ao enviar o formulário
document.getElementById("form-criativo").addEventListener("submit", async function (event) {
    event.preventDefault();

    const resultadoDiv = document.getElementById("resultado-criativo");
    resultadoDiv.innerHTML = '<div class="loader">Gerando seu prompt e imagem...</div>';

    // Extrai texto do PDF (se existir)
    const arquivo = document.getElementById('pdf').files[0];
    let textoPDF = "";
    if (arquivo && arquivo.type === 'application/pdf') {
        textoPDF = await lerPDF(arquivo);
    }

    const apikey = document.getElementById("chave").value.trim();

    // Coleta todos os campos do formulário
    let campos = {
        "Texto retirado do arquivo de identidade visual da empresa": textoPDF, 
        "Nome da Empresa": document.getElementById("empresa").value.trim(),
        "Quantidade de criativos": document.getElementById("quantidade").value.trim(),
        "Setor da Empresa": document.getElementById("setor").value.trim(),
        "Público-alvo": document.getElementById("publico").value.trim(),
        "Qual produto ou serviço": document.getElementById("produto").value.trim(),
        "Cores da Marca": document.getElementById("cores").value.trim(),
        "Fonte Desejada": document.getElementById("fonte").value.trim(),
        "Background": document.getElementById("cenario").value.trim(),
        "Estilo Visual": document.getElementById("estilo").value.trim(),
        "Mensagem Principal": document.getElementById("mensagem").value.trim(),
        "Chamada para Ação (CTA)": document.getElementById("cta").value.trim(),
        "Formato do Anúncio": document.getElementById("formato").value.trim(),
        "Plataforma do Anúncio": document.getElementById("plataforma").value.trim(),
        "Tamanho do Criativo": document.getElementById("tamanho").value.trim(),
        "Tom da Mensagem": document.getElementById("tom").value.trim(),
        "Sentimento Desejado": document.getElementById("sentimento").value.trim(),
        "Objetivo da Campanha": document.getElementById("objetivo").value.trim(),
        "Palavras-chave ou Frases de Impacto": document.getElementById("palavras-chave").value.trim(),
        "Referências ou Inspirações": document.getElementById("referencias").value.trim(),
        "Observações Finais": document.getElementById("observacoes").value.trim()
    };

    try {
        // 1. Gera o prompt com GPT-4
        const promptCriativo = await gerarPromptComGPT4(campos, apikey);
        
        // 2. Gera a imagem com DALL-E
        const imagemUrl = await gerarImagemComDallE(promptCriativo, apikey);
        
        // 3. Exibe resultados + botão de download
        mostrarResultadoCompleto(promptCriativo, imagemUrl);
    } catch (error) {
        resultadoDiv.innerHTML = `<div class="erro">Erro: ${error.message}</div>`;
        console.error("Erro detalhado:", error);
    }
});

// Gera o prompt criativo usando GPT-4
async function gerarPromptComGPT4(dados, apikey) {
    const prompt = formatarPromptParaGPT(dados);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apikey}`
        },
        body: JSON.stringify({
            model: "gpt-4",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.9,
            max_tokens: 1000
        })
    });

    if (!response.ok) {
        const erro = await response.json();
        throw new Error(erro.error?.message || "Erro ao gerar prompt");
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
}

// Formata o prompt para o GPT-4
function formatarPromptParaGPT(dados) {
    let prompt = `Crie um prompt detalhado para gerar imagens (quantidade definida pelo usuario nos dados) publicitárias usando DALL-E 3 (novo metodo de criação de imagens do ChatGPT). Siga estas especificações:\n\n`;

    for (let chave in dados) {
        if (dados[chave]) {
            prompt += `- **${chave}**: ${dados[chave]}\n`;
        }
    }

    prompt += `\n🔹 **Instruções adicionais**:
Tema: Baseie-se nas minhas sugestões, mas recrie com criatividade (não use exatamente as mesmas palavras).

Formato: Texto da imagem: Máximo de 2 linhas, direto e impactante.

Quantidade de imagens: deve ser usada a quantidade decidida pelo usuário

Visual: Atraente, com cores, fontes e estilo adaptados ao público-alvo.

Evite: Brilho branco atrás do texto ou excesso de elementos.

Qualidade: Seja detalhado no prompt para garantir alta qualidade.

Priorize estética clean e comunicação clara.

Tom: Adequado ao contexto (ex.: descontraído, profissional, inspirador).

CTA (Chamada para Ação): Criativo e natural, integrado ao design.

Exemplo de Estrutura (adaptável):
"Crie uma imagem usando o novo método do ChatGPT de criação de imagens: [Descreva cena, paleta de cores, emoção desejada]. Inclua texto central como: '[Frase impactante em até 2 linhas]'. Estilo: [ex.: minimalista, futurista, vibrante]. Evite poluição visual."`;

    return prompt;
}

// Gera imagem usando DALL-E
async function gerarImagemComDallE(prompt, apikey) {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apikey}`
        },
        body: JSON.stringify({
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
            size: document.getElementById("tamanho").value.trim() || "1024x1024",
            quality: "hd"
        })
    });

    if (!response.ok) {
        const erro = await response.json();
        throw new Error(erro.error?.message || "Erro ao gerar imagem");
    }

    const data = await response.json();
    return data.data[0].url;
}

// Exibe resultados na página
function mostrarResultadoCompleto(prompt, imagemUrl) {
    const resultadoDiv = document.getElementById("resultado-criativo");
    
    resultadoDiv.innerHTML = `
        <div class="resultado-container">
            <div class="prompt-section">
                <h3>Prompt Gerado:</h3>
                <div class="conteudo-criativo">${formatarTexto(prompt)}</div>
                <button id="copiar-prompt" class="btn-copiar">Copiar Prompt</button>
            </div>
            
            <div class="imagem-section">
                <h3>Sua Imagem:</h3>
                <img src="${imagemUrl}" alt="Criativo publicitário gerado" class="imagem-gerada">
                <button id="baixar-imagem" class="btn-download">Baixar Imagem</button>
            </div>
        </div>
    `;

    // Configura eventos dos botões
    document.getElementById("copiar-prompt").addEventListener("click", () => {
        copiarParaAreaTransferencia(prompt);
        alert("Prompt copiado!");
    });

    document.getElementById("baixar-imagem").addEventListener("click", () => {
        baixarImagem(imagemUrl, "criativo-publicitario.png");
    });
}

// Utilitários
function formatarTexto(texto) {
    return texto.replace(/\n/g, '<br>')
               .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

function copiarParaAreaTransferencia(texto) {
    const textarea = document.createElement("textarea");
    textarea.value = texto;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
}

async function baixarImagem(url, nomeArquivo) {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = nomeArquivo;
        link.click();
    } catch (error) {
        alert("Erro ao baixar imagem: " + error.message);
    }
}

// Leitor de PDF (requer pdf.js)
async function lerPDF(file) {
    if (!window.pdfjsLib) {
        console.error("PDF.js não carregado");
        return "";
    }

    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let textoFinal = '';

        for (let i = 1; i <= Math.min(pdf.numPages, 5); i++) { // Limita a 5 páginas
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            textoFinal += content.items.map(item => item.str).join(' ') + '\n';
        }

        return textoFinal;
    } catch (error) {
        console.error("Erro na leitura do PDF:", error);
        return "";
    }
}
