// Serviço para buscar endereço por CEP usando a API ViaCEP
export const buscarEnderecoPorCep = async (cep) => {
  try {
    // Remover caracteres não numéricos do CEP
    const cepLimpo = cep.replace(/\D/g, "");

    // Validar se o CEP tem 8 dígitos
    if (cepLimpo.length !== 8) {
      throw new Error("CEP deve ter 8 dígitos");
    }


    const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Erro na consulta do CEP");
    }

    const data = await response.json();

    // Verificar se o CEP foi encontrado
    if (data.erro) {
      throw new Error("CEP não encontrado");
    }


    // Retornar dados no formato esperado pelo componente
    return {
      success: true,
      data: {
        rua: data.logradouro || "",
        bairro: data.bairro || "",
        cidade: data.localidade || "",
        estado: data.uf || "",
        cep: cepLimpo,
      },
    };
  } catch (error) {
    console.error("❌ [CEP API] Erro ao buscar CEP:", error.message);

    return {
      success: false,
      error: error.message,
    };
  }
};

// Função para formatar CEP visualmente (00000-000)
export const formatarCep = (cep) => {
  // Remove tudo que não é dígito
  const apenasNumeros = cep.replace(/\D/g, "");

  // Limita a 8 dígitos
  const limitado = apenasNumeros.slice(0, 8);

  // Aplica a máscara 00000-000
  if (limitado.length > 5) {
    return `${limitado.slice(0, 5)}-${limitado.slice(5)}`;
  }

  return limitado;
};

// Função para validar CEP
export const validarCep = (cep) => {
  const cepLimpo = cep.replace(/\D/g, "");
  return cepLimpo.length === 8;
};
