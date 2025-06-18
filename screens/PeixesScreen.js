import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Image,
} from 'react-native';

import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

const numColumns = 2;
const tamanhoQuadrado = Dimensions.get('window').width / numColumns - 30;

const PeixesScreen = ({ navigation }) => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'produtos'));
        const produtosList = querySnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter(
            produto =>
              produto.categoria &&
              produto.categoria.toLowerCase() === 'peixes'
          );
        setProdutos(produtosList);
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProdutos();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ProductDetailScreen', { id: item.id })}
      activeOpacity={0.8}
    >
      {item.imagem ? (
        <Image source={{ uri: item.imagem }} style={styles.imagem} />
      ) : (
        <View style={styles.imagemPlaceholder}>
          <Text style={styles.placeholderText}>Sem imagem</Text>
        </View>
      )}
      <Text style={styles.nomeProduto}>{item.produto}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00796b" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>🐟 Peixes à Venda</Text>
      <FlatList
        data={produtos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        contentContainerStyle={styles.lista}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f8ff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#00796b',
    textAlign: 'center',
  },
  lista: {
    paddingBottom: 20,
    alignItems: 'center',
  },
  card: {
    width: tamanhoQuadrado,
    backgroundColor: '#ffffff',
    margin: 10,
    borderRadius: 15,
    alignItems: 'center',
    padding: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  imagem: {
    width: '100%',
    height: 100,
    borderRadius: 12,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  imagemPlaceholder: {
    width: '100%',
    height: 100,
    backgroundColor: '#b2ebf2',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  placeholderText: {
    color: '#666',
    fontSize: 14,
  },
  nomeProduto: {
    textAlign: 'center',
    fontSize: 15,
    color: '#00796b',
    fontWeight: '600',
  },
});

export default PeixesScreen;
