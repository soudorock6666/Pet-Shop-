// screens/ProductListScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { db, auth } from '../config/firebase';
import { collection, onSnapshot, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

export default function ProductListScreen({ navigation }) {
    const [produtos, setProdutos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        checkUserRole();
        const unsubscribe = onSnapshot(collection(db, 'produtos'), (snapshot) => {
            const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProdutos(lista);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const checkUserRole = async () => {
        try {
            const user = auth.currentUser;
            if (!user) {
                navigation.replace('Login');
                return;
            }

            console.log('Verificando permissões para usuário:', user.uid);
            const userDoc = await getDoc(doc(db, 'users', user.uid));

            if (userDoc.exists()) {
                const userData = userDoc.data();
                console.log('Dados do usuário:', userData);
                setIsAdmin(userData.role === 'admin');

                if (userData.role !== 'admin') {
                    console.log('Usuário não é admin');
                } else {
                    console.log('Usuário é admin');
                }
            } else {
                console.log('Documento do usuário não encontrado');
                setIsAdmin(false);
            }
        } catch (error) {
            console.error('Erro ao verificar permissões:', error);
            Alert.alert('Erro', 'Não foi possível verificar suas permissões');
            setIsAdmin(false);
        }
    };

    const handleDelete = async (id) => {
        if (!isAdmin) {
            Alert.alert('Acesso Negado', 'Apenas administradores podem excluir produtos');
            return;
        }

        Alert.alert(
            'Confirmar Exclusão',
            'Tem certeza que deseja excluir este produto?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, 'produtos', id));
                            Alert.alert('Sucesso', 'Produto excluído com sucesso');
                        } catch (error) {
                            Alert.alert('Erro', 'Não foi possível excluir o produto');
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2196F3" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {isAdmin && (
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate('ProductForm')}
                >
                    <Ionicons name="add-circle-outline" size={24} color="white" />
                    <Text style={styles.addButtonText}>Novo Produto</Text>
                </TouchableOpacity>
            )}

            <FlatList
                data={produtos}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.productCard}>
                        <View style={styles.productInfo}>
                            <Text style={styles.productName}>{item.produto}</Text>
                            <Text style={styles.productDescription}>{item.descricao}</Text>
                            <Text style={styles.productPrice}>Quantidade: {item.quantidade}</Text>
                        </View>
                        {isAdmin && (
                            <View style={styles.productActions}>
                                <TouchableOpacity
                                    style={styles.editButton}
                                    onPress={() => navigation.navigate('ProductForm', { id: item.id })}
                                >
                                    <Ionicons name="pencil" size={24} color="#2196F3" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => handleDelete(item.id)}
                                >
                                    <Ionicons name="trash" size={24} color="#f44336" />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 15,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButton: {
        backgroundColor: '#2196F3',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    addButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    adminWarning: {
        backgroundColor: '#fff3cd',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ffeeba',
    },
    adminWarningText: {
        color: '#856404',
        marginLeft: 10,
        flex: 1,
    },
    productCard: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    productDescription: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2196F3',
        marginTop: 5,
    },
    productActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    editButton: {
        padding: 5,
        marginRight: 10,
    },
    deleteButton: {
        padding: 5,
    },
});