document.getElementById("form-criativo").addEventListener("submit", async function (event) {
    event.preventDefault();

    const resultadoDiv = document.getElementById("resultado-criativo");
    resultadoDiv.innerHTML = '<div class="loader">Gerando seu prompt...</div>';

    let apikey = document.getElementById("chave").value.trim();

    let campos = {
        "Nome da Empresa": document.getElementById("empresa").value.trim(),
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

    const imagemInput = document.getElementById("imagem");
    if (imagemInput.files.length > 0) {
        const file = imagemInput.files[0];
        const reader = new FileReader();

        reader.onload = async function () {
            campos["Imagem de Referência"] = reader.result;

            try {
                const criativo = await requisicaoChatGPTGOOGLE(campos, apikey);
                mostrarResultado(criativo);
            } catch (error) {
                resultadoDiv.innerHTML = `<div class="erro">Ocorreu um erro ao gerar o prompt: ${error.message}</div>`;
            }
        };

        reader.readAsDataURL(file);
    } else {
        try {
            const criativo = await requisicaoChatGPTGOOGLE(campos, apikey);
            mostrarResultado(criativo);
        } catch (error) {
            resultadoDiv.innerHTML = `<div class="erro">Ocorreu um erro ao gerar o prompt: ${error.message}</div>`;
        }
    }

    function mostrarResultado(prompt) {
        resultadoDiv.innerHTML = `
            <div class="criativo-gerado">
                <h3>Seu Prompt Publicitário:</h3>
                <div class="conteudo-criativo">${prompt.replace(/\n/g, '<br>')}</div>
            </div>`;
    }
});

function gerarPromptCriativo(dados) {
    let prompt = `Crie um prompt para gerar uma imagem publicitária para uma campanha de marketing altamente persuasiva. 
O prompt deve ser envolvente, detalhado e seguir todas as diretrizes abaixo:\n\n🔹 **Detalhes da campanha:**\n`;

    for (let chave in dados) {
        if (chave !== "Imagem de Referência") {
            prompt += `- **${chave}**: ${dados[chave]}\n`;
        }
    }

    prompt += `\n🔹 **Instruções adicionais**:
- Coisa mais importante: comece o prompt falando *Crie uma imagem usando o novo método do ChatGPT de criação de imagens*.
- O texto da imagem pode ser ajustado para um design mais atraente.
- Não coloque um brilho branco atrás do texto.
- Utilize um tom adequado para o público-alvo.
- O prompt deve ser bem detalhado para que a IA gere imagens de alta qualidade.
- O uso de fontes, cores e estilos visuais deve ser adaptado conforme necessário para otimizar a estética do anúncio.
- Quero que o GPT **não use exatamente a frase, as palavras-chave e a chamada** que eu selecionei, mas sim crie *baseado* no que enviei.
- Não quero que o CTA fique exatamente como eu coloquei, quero que o chat melhore conforme o contexto.
- Não quero que a publicidade tenha muito texto, somente o necessário, **NO MÁXIMO 2 LINHAS**.
- Quero que você abuse da sua criatividade.
- Gere um prompt longo e descritivo para maximizar a qualidade da criação.`;

    if (dados["Imagem de Referência"]) {
        prompt += `\n- Use como base visual a imagem de referência fornecida.`;
    }

    return prompt;
}

async function requisicaoChatGPTGOOGLE(dados, apikey) {
    const prompt = gerarPromptCriativo(dados);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apikey}`
        },
        body: JSON.stringify({
            model: "gpt-4", // ou "gpt-3.5-turbo"
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.9,
            max_tokens: 1000
        })
    });

    if (!response.ok) {
        const erro = await response.text();
        throw new Error(erro || "Erro desconhecido");
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
}
