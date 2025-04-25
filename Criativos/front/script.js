document.getElementById("form-criativo").addEventListener("submit", async function (event) {
    event.preventDefault();

    const resultadoDiv = document.getElementById("resultado-criativo");
    resultadoDiv.innerHTML = '<div class="loader">Gerando seu prompt...</div>';

    const arquivo = document.getElementById('pdf').files[0];
    let textoPDF = "";
    if (arquivo && arquivo.type === 'application/pdf') {
        textoPDF = await lerPDF(arquivo);
        console.log("Texto extraído do PDF:", textoPDF);

    } 

    let apikey = document.getElementById("chave").value.trim();

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
        const criativo = await requisicaoChatGPTGOOGLE(campos, apikey);
        mostrarResultado(criativo);
        const imagemURL = await gerarImagem(criativo, apikey);
        mostrarImagem(imagemURL);

    } catch (error) {
        resultadoDiv.innerHTML = `<div class="erro">Ocorreu um erro ao gerar o prompt: ${error.message}</div>`;
    }

    function mostrarResultado(prompt) {
        resultadoDiv.innerHTML = `
            <div class="criativo-gerado">
                <h3>Seu Prompt Publicitário:</h3>
                <div class="conteudo-criativo" id="conteudo-copiavel">${prompt.replace(/\n/g, '<br>')}</div>
            </div>`;

            document.getElementById("copiar-resultado").style.display = "inline-block";
    }
});


function gerarPromptCriativo(dados) {
    let prompt = `Atue como um Designer Publicitário profissional e crie um prompt para gerar imagens (quantidade decidida pelo usuário) publicitária para uma campanha de marketing altamente persuasiva. 
O prompt deve ser envolvente, detalhado. O prompt deve começar com: Crie uma imagem para uma campanha publicitária usando o novo método de criação de imagens do ChatGPT`;

    for (let chave in dados) {
        if (chave !== "Imagem de Referência") {
            prompt += `- **${chave}**: ${dados[chave]}\n`;
        }
    }

    prompt += `\n🔹 **Instruções adicionais**:
Tema: Baseie-se nas minhas sugestões, mas recrie com criatividade (não use exatamente as mesmas palavras).

Formato: Texto da imagem: Máximo de 2 linhas, direto e impactante. PRESTE ATENÇÃO COM A ESCRITA CORRETA DO PORTUGUÊS

Quantidade de imagens: deve ser usada a quantidade decidida pelo usuário

Visual: Atraente, com cores, fontes e estilo adaptados ao público-alvo.

Evite: Brilho branco atrás do texto ou excesso de elementos.

Qualidade: Seja detalhado no prompt para garantir alta qualidade.

Priorize estética clean e comunicação clara.

Tom: Adequado ao contexto (ex.: descontraído, profissional, inspirador).

CTA (Chamada para Ação): Criativo e natural, integrado ao design.

Exemplo de Estrutura (adaptável):
"Crie uma imagem usando o novo método do ChatGPT de criação de imagens: [Descreva cena, paleta de cores, emoção desejada]. Inclua texto central como: '[Frase impactante em até 2 linhas]'. Estilo: [ex.: minimalista, futurista, vibrante]. Evite poluição visual."`;

    if (dados["Imagem de Referência"]) {
        prompt += `\n- Use como base visual a imagem de referência fornecida.`;
    }

    return prompt;
}

async function gerarImagem(prompt, apikey) {
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
      size: "1024x1024",
      quality: "standard"
    })
  });

  if (!response.ok) {
    const erro = await response.text();
    throw new Error("Erro ao gerar imagem: " + erro);
  }

  const data = await response.json();
  return data.data[0].url;
}


document.getElementById('copiar-resultado').addEventListener('click', function () {
    const resultadoHtml = document.getElementById('conteudo-copiavel');

    // Cria um elemento temporário para extrair o texto sem as tags HTML
    const temp = document.createElement("textarea");
    temp.value = resultadoHtml.innerText;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand("copy");
    document.body.removeChild(temp);

    // Feedback visual
    alert("Prompt copiado para a área de transferência!");
});

async function lerPDF(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let textoFinal = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const textoPagina = content.items.map(item => item.str).join(' ');
        textoFinal += textoPagina + '\n';
    }

    return textoFinal;
}

function mostrarImagem(url) {
    const resultadoDiv = document.getElementById("resultado-criativo");
    const imagemHTML = `
        <div class="imagem-gerada">
            <h3>Imagem Gerada:</h3>
            <img src="${url}" alt="Imagem gerada" style="max-width: 100%; border: 1px solid #ccc; border-radius: 8px;" />
            <a href="${url}" target="_blank" download class="botao-baixar">Baixar Imagem</a>
        </div>`;
    resultadoDiv.innerHTML += imagemHTML;
}
