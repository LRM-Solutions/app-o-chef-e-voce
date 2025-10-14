import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { theme } from "../utils/theme";
import { getUserEnderecos, createEndereco } from "../api/enderecosApi";
import { getUserId } from "../api/authApi";
import {
  buscarEnderecoPorCep,
  formatarCep,
  validarCep,
} from "../services/cepService";
import Toast from "react-native-toast-message";

export default function EnderecoSelector({
  onEnderecoSelect,
  selectedEnderecoId,
}) {
  const [enderecos, setEnderecos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [formData, setFormData] = useState({
    cep: "",
    rua: "",
    numero: "",
    bairro: "",
    cidade: "",
    estado: "",
    complemento: "",
  });

  useEffect(() => {
    loadEnderecos();
  }, []);

  const loadEnderecos = async () => {
    try {
      setLoading(true);
      const response = await getUserEnderecos();
      if (response.success) {
        setEnderecos(response.data || []);
        setShowForm(response.data.length === 0);
      }
    } catch (error) {
      console.error("Erro ao carregar endereços:", error);
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Não foi possível carregar os endereços",
        visibilityTime: 3000,
      });
      setShowForm(true); // Mostrar formulário em caso de erro
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEndereco = async () => {
    // Validação simples
    if (
      !formData.cep ||
      !formData.rua ||
      !formData.numero ||
      !formData.bairro ||
      !formData.cidade ||
      !formData.estado
    ) {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Preencha todos os campos obrigatórios",
        visibilityTime: 3000,
      });
      return;
    }

    // Validar CEP
    if (!validarCep(formData.cep)) {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "CEP deve ter 8 dígitos",
        visibilityTime: 3000,
      });
      return;
    }

    // Validar se o estado tem 2 caracteres
    if (formData.estado.length !== 2) {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Estado deve ter 2 letras (ex: SP, RJ)",
        visibilityTime: 3000,
      });
      return;
    }

    try {
      setCreating(true);

      // Buscar user_id do storage
      const userId = await getUserId();

      const enderecoData = {
        ...formData,
        cep: formData.cep.replace(/\D/g, ""), // Enviar CEP limpo (apenas números)
        user_id: userId || 1, // Usar 1 como fallback
      };

      const response = await createEndereco(enderecoData);

      if (response.success) {
        Toast.show({
          type: "success",
          text1: "Sucesso",
          text2: "Endereço criado com sucesso",
          visibilityTime: 3000,
        });

        // Recarregar endereços
        await loadEnderecos();
        setShowForm(false);

        // Resetar formulário
        setFormData({
          cep: "",
          rua: "",
          numero: "",
          bairro: "",
          cidade: "",
          estado: "",
          complemento: "",
        });
      }
    } catch (error) {
      console.error("Erro ao criar endereço:", error);
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Não foi possível criar o endereço",
        visibilityTime: 3000,
      });
    } finally {
      setCreating(false);
    }
  };

  const handleCepChange = async (cep) => {
    const cepFormatado = formatarCep(cep);
    setFormData({ ...formData, cep: cepFormatado });

    // Se o CEP tem 8 dígitos, buscar automaticamente
    if (validarCep(cepFormatado)) {
      setLoadingCep(true);

      try {
        const resultado = await buscarEnderecoPorCep(cepFormatado);

        if (resultado.success) {
          // Preencher automaticamente os campos
          setFormData({
            ...formData,
            cep: cepFormatado,
            rua: resultado.data.rua,
            bairro: resultado.data.bairro,
            cidade: resultado.data.cidade,
            estado: resultado.data.estado,
          });

          Toast.show({
            type: "success",
            text1: "CEP encontrado!",
            text2: "Endereço preenchido automaticamente",
            visibilityTime: 2000,
          });
        } else {
          Toast.show({
            type: "error",
            text1: "CEP não encontrado",
            text2: resultado.error || "Verifique o CEP digitado",
            visibilityTime: 3000,
          });
        }
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Erro ao buscar CEP",
          text2: "Tente novamente mais tarde",
          visibilityTime: 3000,
        });
      } finally {
        setLoadingCep(false);
      }
    }
  };

  const formatEndereco = (endereco) => {
    const cepFormatado = endereco.cep
      ? ` - CEP: ${formatarCep(endereco.cep)}`
      : "";
    return `${endereco.rua}, ${endereco.numero}${
      endereco.complemento ? `, ${endereco.complemento}` : ""
    } - ${endereco.bairro}, ${endereco.cidade}/${
      endereco.estado
    }${cepFormatado}`;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <MaterialIcons
            name="location-on"
            size={20}
            color={theme.colors.primary}
          />
          <Text style={styles.headerTitle}>Endereço de Entrega</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Carregando endereços...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons
          name="location-on"
          size={20}
          color={theme.colors.primary}
        />
        <Text style={styles.headerTitle}>Endereço de Entrega</Text>
        {enderecos.length > 0 && !showForm && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowForm(true)}
          >
            <MaterialIcons name="add" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {!showForm && enderecos.length > 0 ? (
        <View style={styles.enderecosList}>
          {enderecos.map((endereco) => (
            <TouchableOpacity
              key={endereco.endereco_id}
              style={[
                styles.enderecoItem,
                selectedEnderecoId === endereco.endereco_id &&
                  styles.enderecoItemSelected,
              ]}
              onPress={() => onEnderecoSelect(endereco)}
            >
              <View style={styles.enderecoContent}>
                <MaterialIcons
                  name="home"
                  size={16}
                  color={
                    selectedEnderecoId === endereco.endereco_id
                      ? theme.colors.primary
                      : "#666"
                  }
                />
                <Text
                  style={[
                    styles.enderecoText,
                    selectedEnderecoId === endereco.endereco_id &&
                      styles.enderecoTextSelected,
                  ]}
                >
                  {formatEndereco(endereco)}
                </Text>
              </View>
              {selectedEnderecoId === endereco.endereco_id && (
                <MaterialIcons
                  name="check-circle"
                  size={20}
                  color={theme.colors.primary}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.formContainer}>
          {enderecos.length > 0 && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowForm(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.formTitle}>Adicionar Novo Endereço</Text>

          {/* CEP Input */}
          <View style={styles.cepContainer}>
            <TextInput
              style={[styles.input, styles.cepInput]}
              placeholder="CEP *"
              value={formData.cep}
              onChangeText={handleCepChange}
              keyboardType="numeric"
              maxLength={9} // 00000-000
            />
            {loadingCep && (
              <View style={styles.cepLoading}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
              </View>
            )}
          </View>

          <View style={styles.inputRow}>
            <TextInput
              style={[
                styles.input,
                styles.inputFlex,
                loadingCep && styles.inputDisabled,
              ]}
              placeholder="Rua *"
              value={formData.rua}
              onChangeText={(text) => setFormData({ ...formData, rua: text })}
              editable={!loadingCep}
            />
            <TextInput
              style={[
                styles.input,
                styles.inputSmall,
                loadingCep && styles.inputDisabled,
              ]}
              placeholder="Nº *"
              value={formData.numero}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  numero: text.replace(/[^0-9]/g, ""),
                })
              }
              keyboardType="numeric"
              editable={!loadingCep}
            />
          </View>

          <TextInput
            style={[styles.input, loadingCep && styles.inputDisabled]}
            placeholder="Complemento (opcional)"
            value={formData.complemento}
            onChangeText={(text) =>
              setFormData({ ...formData, complemento: text })
            }
            editable={!loadingCep}
          />

          <TextInput
            style={[styles.input, loadingCep && styles.inputDisabled]}
            placeholder="Bairro *"
            value={formData.bairro}
            onChangeText={(text) => setFormData({ ...formData, bairro: text })}
            editable={!loadingCep}
          />

          <View style={styles.inputRow}>
            <TextInput
              style={[
                styles.input,
                styles.inputFlex,
                loadingCep && styles.inputDisabled,
              ]}
              placeholder="Cidade *"
              value={formData.cidade}
              onChangeText={(text) =>
                setFormData({ ...formData, cidade: text })
              }
              editable={!loadingCep}
            />
            <TextInput
              style={[
                styles.input,
                styles.inputSmall,
                loadingCep && styles.inputDisabled,
              ]}
              placeholder="UF *"
              value={formData.estado}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  estado: text.toUpperCase().replace(/[^A-Z]/g, ""),
                })
              }
              maxLength={2}
              autoCapitalize="characters"
              editable={!loadingCep}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.createButton,
              creating && styles.createButtonDisabled,
            ]}
            onPress={handleCreateEndereco}
            disabled={creating}
          >
            {creating ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <MaterialIcons name="add-location" size={20} color="white" />
                <Text style={styles.createButtonText}>Salvar Endereço</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.foreground,
    marginLeft: 8,
    flex: 1,
  },
  addButton: {
    padding: 4,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 8,
    color: theme.colors.muted,
  },
  enderecosList: {
    gap: 12,
  },
  enderecoItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  enderecoItemSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}10`,
  },
  enderecoContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  enderecoText: {
    fontSize: 14,
    color: theme.colors.foreground,
    marginLeft: 8,
    flex: 1,
  },
  enderecoTextSelected: {
    color: theme.colors.primary,
    fontWeight: "500",
  },
  formContainer: {
    gap: 12,
  },
  cancelButton: {
    alignSelf: "flex-end",
    padding: 8,
  },
  cancelButtonText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: "500",
  },
  formTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.foreground,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: "white",
  },
  inputDisabled: {
    backgroundColor: "#f5f5f5",
    color: "#999",
  },
  inputFlex: {
    flex: 1,
  },
  inputSmall: {
    width: 80,
  },
  cepContainer: {
    position: "relative",
    marginBottom: 12,
  },
  cepInput: {
    paddingRight: 40, // Espaço para o loading
  },
  cepLoading: {
    position: "absolute",
    right: 12,
    top: 12,
  },
  createButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  createButtonDisabled: {
    opacity: 0.7,
  },
  createButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
});
