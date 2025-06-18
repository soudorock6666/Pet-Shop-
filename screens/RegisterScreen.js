import React, { useState } from 'react';
import { View, TextInput, Button, Alert, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { auth } from '../config/firebase.js';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { createUserProfile } from '../config/userUtils.js';

export default function RegisterScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        return password.length >= 6;
    };

    const register = async () => {
        if (!email || !password) {
            Alert.alert("Erro", "Por favor, preencha todos os campos");
            return;
        }

        if (!validateEmail(email)) {
            Alert.alert("Erro", "Por favor, insira um email válido");
            return;
        }

        if (!validatePassword(password)) {
            Alert.alert("Erro", "A senha deve ter pelo menos 6 caracteres");
            return;
        }

        setLoading(true);
        try {
            console.log('Tentando criar usuário com email:', email);
            // Cria o usuário no Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log('Usuário criado com sucesso:', userCredential.user.uid);

            console.log('Iniciando criação do perfil...');
            // Cria o perfil do usuário no Firestore
            await createUserProfile(userCredential.user);
            console.log('Perfil criado com sucesso');

            Alert.alert("Sucesso", "Conta criada com sucesso!");
            navigation.replace('Início');
        } catch (error) {
            console.error('Erro detalhado no registro:', {
                code: error.code,
                message: error.message,
                stack: error.stack
            });

            let errorMessage = "Erro ao criar conta";
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = "Este email já está em uso";
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "Email inválido";
            } else if (error.code === 'auth/weak-password') {
                errorMessage = "A senha é muito fraca";
            } else if (error.code === 'auth/network-request-failed') {
                errorMessage = "Erro de conexão. Verifique sua internet";
            } else if (error.code === 'auth/operation-not-allowed') {
                errorMessage = "Operação não permitida. Contate o suporte";
            }
            Alert.alert("Erro ao registrar", `${errorMessage}\n\nCódigo: ${error.code}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Criar Conta</Text>
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
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
            />
            {loading ? (
                <ActivityIndicator size="large" color="#2196F3" />
            ) : (
                <Button title="Registrar" onPress={register} />
            )}
            <Text
                style={styles.link}
                onPress={() => !loading && navigation.navigate('Login')}
            >
                Já tem conta? Faça login
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
    }
});
