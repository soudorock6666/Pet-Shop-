import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { db } from '../config/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

export default function DeleteScreen() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProdutos = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'produtos'));
      const listaProdutos = [];
      querySnapshot.forEach((document) => {
        const data = document.data();
        console.log('Produto do Firestore:', data);
        listaProdutos.push({ id: document.id, ...data });
      });
      setProdutos(listaProdutos);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os produtos.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProdutos();
  }, []);

  // Corrigido para usar o campo 'produto' como nome principal
  const getNomeProduto = (produto) => {
    return produto.produto || produto.nome || produto.name || produto.titulo || produto.produtoNome || 'Sem nome';
  };

  const deletarProduto = (id, nomeProduto) => {
    Alert.alert(
      'Confirmação',
      `Deseja realmente deletar o produto "${nomeProduto}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'produtos', id));
              Alert.alert('Sucesso', 'Produto deletado!');
              fetchProdutos();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível deletar o produto.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (produtos.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.texto}>Nenhum produto cadastrado.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={produtos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const nomeDoProduto = getNomeProduto(item);
          return (
            <View style={styles.card}>
              <Text style={styles.nomeProduto}>{nomeDoProduto}</Text>
              <TouchableOpacity
                style={styles.botaoDeletar}
                onPress={() => deletarProduto(item.id, nomeDoProduto)}
              >
                <Text style={styles.textoBotao}>Deletar</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  card: {
    backgroundColor: '#f2f2f2',
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nomeProduto: { fontSize: 16, color: '#000' },
  botaoDeletar: {
    backgroundColor: '#e74c3c',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  textoBotao: { color: '#fff', fontWeight: 'bold' },
  texto: { fontSize: 18, textAlign: 'center', marginTop: 50 },
});