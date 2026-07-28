import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, useWindowDimensions, ImageBackground } from 'react-native';

export default function IntroScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  return (
    <ImageBackground
      source={require('../../assets/web-bg.jpg')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={[styles.content, isMobile && styles.contentMobile]}>
          <Image 
            source={require('../../assets/sanslogo.png')} 
            style={styles.logo} 
            resizeMode="contain" 
          />
          <Text style={styles.title}>Agendamento Premium</Text>
          <Text style={styles.subtitle}>
            A melhor experiência para cuidar do seu estilo, agora no seu navegador.
          </Text>
          
          <View style={styles.buttonsContainer}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.primaryButtonText}>Fazer Login</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('SignUp')}
            >
              <Text style={styles.secondaryButtonText}>Criar Nova Conta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100vh',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
    padding: 40,
    borderRadius: 24,
    backgroundColor: 'rgba(20, 20, 20, 0.4)',
    backdropFilter: 'blur(15px)',
    WebkitBackdropFilter: 'blur(15px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 5,
  },
  contentMobile: {
    padding: 24,
    maxWidth: '100%',
    borderRadius: 16,
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 26,
  },
  buttonsContainer: {
    width: '100%',
    gap: 16,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#ffffff',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: 'transparent',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
