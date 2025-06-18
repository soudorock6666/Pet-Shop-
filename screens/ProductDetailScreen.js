import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';


const { width } = Dimensions.get('window');

export default function ProductDetailScreen({ route, navigation }) {
  const id = route?.params?.id;
  const [produto, setProduto] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    if (!id) {
      Alert.alert('Erro', 'ID do produto não fornecido!');
      setTimeout(() => navigation?.goBack(), 1000);
      return;
    }

    async function fetchProduto() {
      try {
        const docRef = doc(db, 'produtos', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && isActive) {
          const data = docSnap.data();
          setProduto(data);

          // Se quiser atualizar o título da tela dinamicamente
          navigation?.setOptions({ title: data.produto || 'Detalhes do Produto' });
        } else if (isActive) {
          Alert.alert('Erro', 'Produto não encontrado');
          setTimeout(() => navigation?.goBack(), 1000);
        }
      } catch (error) {
        console.error('Erro ao buscar produto:', error);
        if (isActive) {
          Alert.alert('Erro', 'Erro ao carregar detalhes');
          setTimeout(() => navigation?.goBack(), 1000);
        }
      } finally {
        if (isActive) setLoading(false);
      }
    }

    fetchProduto();

    return () => {
      isActive = false;
    };
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00796b" />
      </View>
    );
  }

  if (!produto) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Produto não encontrado.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {typeof produto?.imagem === 'string' && produto.imagem.startsWith('http') ? (
        <Image source={{ uri: produto.imagem }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.placeholderText}>Sem imagem</Text>
        </View>
      )}

      <View style={styles.detailsBox}>
        <Text style={styles.title}>{produto?.produto || 'Produto'}</Text>

        <View style={styles.divider} />

        <View style={styles.infoSection}>
          <Text style={styles.label}>Descrição:</Text>
          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionText}>
              {produto?.descricao || 'Sem descrição.'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoSection}>
          <Text style={styles.label}>Quantidade disponível:</Text>
          <Text style={styles.text}>
            {produto?.quantidade !== undefined ? produto.quantidade : 'N/A'}
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.label}>Categoria:</Text>
          <Text style={styles.text}>{produto?.categoria || 'N/A'}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#d32f2f',
    fontWeight: '600',
    textAlign: 'center',
  },
  image: {
    width: width * 0.9,
    height: 250,
    borderRadius: 20,
    resizeMode: 'cover',
    marginBottom: 25,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  imagePlaceholder: {
    width: width * 0.9,
    height: 250,
    backgroundColor: '#ccc',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },
  placeholderText: {
    color: '#555',
    fontSize: 18,
    fontWeight: '600',
  },
  detailsBox: {
    backgroundColor: '#f9f9f9',
    borderRadius: 20,
    width: '100%',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00796b',
    marginBottom: 15,
    textAlign: 'center',
  },
  infoSection: {
    marginBottom: 20,
  },
  label: {
    fontWeight: '700',
    fontSize: 17,
    color: '#004d40',
    marginBottom: 6,
  },
  text: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  descriptionBox: {
    backgroundColor: '#e0f2f1',
    padding: 12,
    borderRadius: 10,
  },
  descriptionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    textAlign: 'justify',
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 15,
  },
});
