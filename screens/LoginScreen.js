import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Button,
  Alert,
  Text,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import { auth } from '../config/firebase';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { createUserProfile } from '../config/userUtils';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isWeb] = useState(Platform.OS === 'web');

  // Listener do estado de autenticação Firebase
  useEffect(() => {
    if (!auth) {
      console.error('Firebase Auth não está inicializado');
      Alert.alert('Erro', 'Não foi possível conectar ao servidor. Por favor, recarregue a página.');
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Usuário está logado, navega direto pra tela principal (nome da rota corrigido)
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],  // <-- nome correto da tela principal
        });
      }
      // Se user for null, permanece na tela de login
    });

    return () => unsubscribe();
  }, []);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLoginSuccess = () => {
    setLoading(false);
    if (isWeb) {
      Alert.alert('Sucesso', 'Login realizado com sucesso!', [
        {
          text: 'OK',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }], // <-- nome correto
            });
          },
        },
      ]);
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }], // <-- nome correto
      });
    }
  };

  const login = async () => {
    if (!auth) {
      Alert.alert('Erro', 'Serviço de autenticação não disponível. Por favor, recarregue a página.');
      return;
    }
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert('Erro', 'Por favor, insira um email válido');
      return;
    }
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await createUserProfile(userCredential.user);

      handleLoginSuccess();
    } catch (error) {
      let errorMessage = 'Erro ao fazer login';
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Email inválido';
          break;
        case 'auth/user-not-found':
          errorMessage = 'Usuário não encontrado';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Senha incorreta';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Muitas tentativas. Tente novamente mais tarde';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Erro de conexão. Verifique sua internet';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Credenciais inválidas';
          break;
      }
      Alert.alert('Erro no login', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Exemplo de função de logout (você pode usar na tela principal)
  const logout = async () => {
    try {
      await signOut(auth);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível sair. Tente novamente.');
    }
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        editable={!loading}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        editable={!loading}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#2196F3" />
      ) : (
        <Button title="Entrar" onPress={login} />
      )}

      <Text
        style={styles.link}
        onPress={() => !loading && navigation.navigate('Register')}
      >
        Não tem conta? Registre-se
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  link: {
    marginTop: 20,
    color: 'blue',
    textAlign: 'center',
  },
});
