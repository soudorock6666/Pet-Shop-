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
import { useNavigation } from '@react-navigation/native';
import { db } from '../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const numColumns = 2;
const tamanhoQuadrado = Dimensions.get('window').width / numColumns - 30;

const RacaoScreen = () => {
  const navigation = useNavigation();
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const produtosQuery = query(collection(db, 'produtos'), where('categoria', '==', 'racao'));
        const querySnapshot = await getDocs(produtosQuery);
        const produtosList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
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
      activeOpacity={0.7}
      onPress={() => navigation.navigate('RacaoDetalhes', { produto: item })}
    >
      {item.imagemUrl ? (
        <Image source={{ uri: item.imagemUrl }} style={styles.imagem} />
      ) : (
        <View style={styles.imagemPlaceholder} />
      )}
      <Text style={styles.nomeProduto}>{item.produto || 'Produto sem nome'}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Venda de Rações</Text>
      <FlatList
        data={produtos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={<Text>Nenhuma ração disponível no momento.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#e0f7fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#006064',
  },
  lista: {
    alignItems: 'center',
  },
  card: {
    width: tamanhoQuadrado,
    height: tamanhoQuadrado + 40,
    backgroundColor: '#ffffff',
    margin: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  imagemPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#b2ebf2',
    borderRadius: 5,
    marginBottom: 10,
  },
  imagem: {
    width: 80,
    height: 80,
    borderRadius: 5,
    marginBottom: 10,
  },
  nomeProduto: {
    textAlign: 'center',
    fontSize: 14,
    color: '#00796b',
  },
});

export default RacaoScreen;
