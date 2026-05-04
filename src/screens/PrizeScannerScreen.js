import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { theme } from "../utils/theme";
import { redeemPrize } from "../api/barberApi";

export default function PrizeScannerScreen({ route, navigation }) {
  const { prize } = route.params;
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const isProcessing = React.useRef(false);

  useEffect(() => {
    if (!permission) {
        requestPermission();
    }
  }, [permission]);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <MaterialIcons name="camera-alt" size={64} color={theme.colors.textMuted} />
        <Text style={styles.permissionText}>Precisamos de acesso à câmera para escanear o QR Code.</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Dar Permissão</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanned || loading || isProcessing.current) return;
    
    // Immediate lock
    isProcessing.current = true;
    setScanned(true);
    setLoading(true);

    // We expect the QR Code to have the pattern: "sansclub:prize:1"
    
    const expectedPayload = `sansclub:prize:${prize.prize_id || prize.id}`;
    
    if (data !== expectedPayload) {
      Alert.alert(
        "QR Code Inválido",
        "Este QR Code não corresponde ao prêmio selecionado.",
        [{ text: "Tentar Novamente", onPress: () => {
          setScanned(false);
          setLoading(false);
          isProcessing.current = false;
        } }]
      );
      return;
    }

    try {
      const response = await redeemPrize(prize.prize_id || prize.id);
      
      // Navigate to Success screen
      navigation.replace("RedemptionSuccess", { 
        prize, 
        redemption: response.redemption 
      });
    } catch (error) {
      Alert.alert(
        "Erro no Resgate",
        error.message || "Não foi possível resgatar o prêmio. Verifique seu saldo.",
        [{ text: "Voltar", onPress: () => {
           if (navigation.canGoBack()) {
             navigation.goBack();
           } else {
             navigation.navigate("MainTabs");
           }
        } }]
      );
      setScanned(false);
      setLoading(false);
      isProcessing.current = false;
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      />
      
      {/* Overlay UI */}
      <View style={[styles.overlay, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="close" size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Escaneie o QR Code</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.scannerBoxContainer}>
          <View style={styles.scannerBox}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
            
            {loading && (
              <View style={styles.loadingOverlay}>
                <Text style={styles.loadingText}>Validando resgate...</Text>
              </View>
            )}
          </View>
          <Text style={styles.instructionText}>
            Aponte a câmera para o QR Code de confirmação do prêmio: 
            {"\n"}<Text style={{ fontWeight: 'bold' }}>{prize.name}</Text>
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionText: {
    color: '#FFF',
    textAlign: 'center',
    margin: 20,
    fontSize: 16,
  },
  permissionButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  title: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scannerBoxContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerBox: {
    width: 250,
    height: 250,
    backgroundColor: 'transparent',
    position: 'relative',
    marginBottom: 30,
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: theme.colors.primary,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  instructionText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 24,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFF',
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
  }
});
