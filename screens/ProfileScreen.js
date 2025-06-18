import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Alert,
    ActivityIndicator,
    TouchableOpacity,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { auth } from '../config/firebase.js';
import { getUserProfile } from '../config/userUtils.js';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

export default function ProfileScreen({ navigation }) {
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [changingPassword, setChangingPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        try {
            const user = auth.currentUser;
            if (!user) {
                Alert.alert('Erro', 'Usuário não autenticado');
                navigation.replace('Login');
                return;
            }

            const profile = await getUserProfile(user.uid);
            setUserProfile(profile);
        } catch (error) {
            console.error('Erro ao carregar perfil:', error);
            Alert.alert('Erro', 'Não foi possível carregar o perfil');
        } finally {
            setLoading(false);
        }
    };

    const validatePassword = (password) => {
        return password.length >= 6;
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos');
            return;
        }

        if (!validatePassword(newPassword)) {
            Alert.alert('Erro', 'A nova senha deve ter pelo menos 6 caracteres');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Erro', 'As senhas não coincidem');
            return;
        }

        setChangingPassword(true);
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('Usuário não autenticado');
            }

            // Reautenticar o usuário antes de mudar a senha
            const credential = EmailAuthProvider.credential(
                user.email,
                currentPassword
            );

            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);

            Alert.alert('Sucesso', 'Senha alterada com sucesso!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            let errorMessage = 'Erro ao alterar senha';

            if (error.code === 'auth/wrong-password') {
                errorMessage = 'Senha atual incorreta';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'A nova senha é muito fraca';
            } else if (error.code === 'auth/requires-recent-login') {
                errorMessage = 'Por favor, faça login novamente antes de alterar a senha';
            }

            Alert.alert('Erro', errorMessage);
        } finally {
            setChangingPassword(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2196F3" />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingView}
        >
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollViewContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.container}>
                    <View style={styles.profileSection}>
                        <Text style={styles.title}>Perfil do Usuário</Text>

                        <View style={styles.infoContainer}>
                            <Text style={styles.label}>Email:</Text>
                            <Text style={styles.value}>{userProfile?.email}</Text>
                        </View>

                        <View style={styles.infoContainer}>
                            <Text style={styles.label}>Nome:</Text>
                            <Text style={styles.value}>{userProfile?.name}</Text>
                        </View>

                        <View style={styles.infoContainer}>
                            <Text style={styles.label}>Função:</Text>
                            <Text style={styles.value}>
                                {userProfile?.role === 'admin' ? 'Administrador' : 'Usuário'}
                            </Text>
                        </View>

                        <View style={styles.infoContainer}>
                            <Text style={styles.label}>Último login:</Text>
                            <Text style={styles.value}>
                                {userProfile?.lastLogin ? new Date(userProfile.lastLogin).toLocaleString() : 'N/A'}
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={styles.changePasswordButton}
                            onPress={() => navigation.navigate('ChangePassword')}
                        >
                            <Text style={styles.changePasswordButtonText}>Alterar Senha</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Espaço extra no final */}
                    <View style={styles.bottomSpace} />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    keyboardAvoidingView: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        flexGrow: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    container: {
        flex: 1,
        padding: 20,
    },
    profileSection: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#2196F3',
        textAlign: 'center',
    },
    infoContainer: {
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        color: '#666',
        marginBottom: 5,
    },
    value: {
        fontSize: 18,
        color: '#333',
        fontWeight: '500',
    },
    changePasswordButton: {
        backgroundColor: '#2196F3',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 20,
    },
    changePasswordButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    bottomSpace: {
        height: 50,
    },
}); 