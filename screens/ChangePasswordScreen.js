import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Alert,
    ActivityIndicator,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Modal
} from 'react-native';
import { auth } from '../config/firebase';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';

export default function ChangePasswordScreen({ navigation }) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const validatePassword = (password) => {
        return password.length >= 6;
    };

    const showError = (message) => {
        setErrorMessage(message);
        setShowErrorModal(true);
    };

    const handleChangePassword = async () => {
        // Validações iniciais
        if (!currentPassword || !newPassword || !confirmPassword) {
            showError('Por favor, preencha todos os campos');
            return;
        }

        if (!validatePassword(newPassword)) {
            showError('A nova senha deve ter pelo menos 6 caracteres');
            return;
        }

        if (newPassword !== confirmPassword) {
            showError('As senhas não coincidem');
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

            // Limpa os campos
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

            // Mostra o modal de sucesso
            setShowSuccessModal(true);

        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            let errorMessage = 'Erro ao alterar senha';

            if (error.code === 'auth/wrong-password') {
                errorMessage = 'Senha atual incorreta. Por favor, verifique e tente novamente.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'A nova senha é muito fraca. Use uma senha mais forte.';
            } else if (error.code === 'auth/requires-recent-login') {
                errorMessage = 'Por favor, faça login novamente antes de alterar a senha.';
            } else if (error.code === 'auth/network-request-failed') {
                errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
            }

            showError(errorMessage);
        } finally {
            setChangingPassword(false);
        }
    };

    const handleSuccessModalClose = () => {
        setShowSuccessModal(false);
        navigation.goBack();
    };

    const handleErrorModalClose = () => {
        setShowErrorModal(false);
        setErrorMessage('');
    };

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
                    <View style={styles.card}>
                        <Text style={styles.title}>Alterar Senha</Text>
                        <Text style={styles.subtitle}>
                            Para sua segurança, você precisa informar sua senha atual
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Senha atual"
                            secureTextEntry
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            editable={!changingPassword}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Nova senha"
                            secureTextEntry
                            value={newPassword}
                            onChangeText={setNewPassword}
                            editable={!changingPassword}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Confirmar nova senha"
                            secureTextEntry
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            editable={!changingPassword}
                        />

                        <TouchableOpacity
                            style={[styles.button, changingPassword && styles.buttonDisabled]}
                            onPress={handleChangePassword}
                            disabled={changingPassword}
                        >
                            {changingPassword ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Alterar Senha</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => navigation.goBack()}
                            disabled={changingPassword}
                        >
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Modal de Sucesso */}
                    <Modal
                        visible={showSuccessModal}
                        transparent={true}
                        animationType="fade"
                        onRequestClose={handleSuccessModalClose}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <View style={styles.successIconContainer}>
                                    <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
                                </View>
                                <Text style={styles.modalTitle}>Senha Alterada!</Text>
                                <Text style={styles.modalText}>
                                    Sua senha foi alterada com sucesso.
                                </Text>
                                <TouchableOpacity
                                    style={styles.modalButton}
                                    onPress={handleSuccessModalClose}
                                >
                                    <Text style={styles.modalButtonText}>OK</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>

                    {/* Modal de Erro */}
                    <Modal
                        visible={showErrorModal}
                        transparent={true}
                        animationType="fade"
                        onRequestClose={handleErrorModalClose}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <View style={styles.errorIconContainer}>
                                    <Ionicons name="alert-circle" size={80} color="#f44336" />
                                </View>
                                <Text style={[styles.modalTitle, styles.errorTitle]}>Erro</Text>
                                <Text style={styles.modalText}>
                                    {errorMessage}
                                </Text>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.errorButton]}
                                    onPress={handleErrorModalClose}
                                >
                                    <Text style={styles.modalButtonText}>Tentar Novamente</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>

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
    container: {
        flex: 1,
        padding: 20,
    },
    card: {
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
        marginBottom: 10,
        color: '#2196F3',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 12,
        borderRadius: 5,
        marginBottom: 15,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    button: {
        backgroundColor: '#2196F3',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cancelButton: {
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#2196F3',
    },
    cancelButtonText: {
        color: '#2196F3',
        fontSize: 16,
        fontWeight: 'bold',
    },
    bottomSpace: {
        height: 50,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        width: '80%',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    successIconContainer: {
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#4CAF50',
        marginBottom: 10,
        textAlign: 'center',
    },
    modalText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    modalButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        minWidth: 120,
        alignItems: 'center',
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    errorIconContainer: {
        marginBottom: 20,
    },
    errorTitle: {
        color: '#f44336',
    },
    errorButton: {
        backgroundColor: '#f44336',
    },
}); 