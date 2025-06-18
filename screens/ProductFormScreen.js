import React, { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { db, auth } from '../config/firebase';
import { addDoc, collection, doc, updateDoc, getDoc } from 'firebase/firestore';

const ImgBB_API_KEY = '';

export default function ProductFormScreen({ route, navigation }) {
  const [produto, setProduto] = useState('');
  const [descricao, setDescricao] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [categoria, setCategoria] = useState('peixes'); // default
  const [imagem, setImagem] = useState(null);
  const [imagemURL, setImagemURL] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { id } = route.params || {};

  useEffect(() => {
    checkUserRole();
    if (id) {
      loadProduct();
    } else {
      setLoading(false);
    }
  }, [id]);

  const checkUserRole = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        navigation.replace('Login');
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const isUserAdmin = userData.role === 'admin';
        setIsAdmin(isUserAdmin);

        if (!isUserAdmin) {
          Alert.alert('Acesso Negado', 'Apenas administradores podem gerenciar produtos');
          navigation.goBack();
        }
      } else {
        Alert.alert('Erro', 'Perfil de usuário não encontrado');
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível verificar suas permissões');
      navigation.goBack();
    }
  };

  const loadProduct = async () => {
    try {
      const docRef = doc(db, 'produtos', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProduto(data.produto);
        setDescricao(data.descricao);
        setQuantidade(String(data.quantidade));
        setImagemURL(data.imagem || null);
        setCategoria(data.categoria || 'peixes');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar o produto');
    } finally {
      setLoading(false);
    }
  };

  const escolherImagem = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Você precisa permitir acesso à galeria.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.6,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setImagem(result.assets[0]);
    } else {
      Alert.alert('Imagem não selecionada');
    }
  };

  const uploadParaImgBB = async () => {
    if (!imagem?.base64) return null;

    try {
      const body = `key=${ImgBB_API_KEY}&image=${encodeURIComponent(imagem.base64)}`;
      const response = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
      });

      const json = await response.json();

      if (json.success) {
        return json.data.url;
      } else {
        throw new Error('Falha ao enviar imagem');
      }
    } catch (err) {
      console.error('Erro ImgBB:', err);
      Alert.alert('Erro', 'Erro ao enviar imagem para o ImgBB');
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!isAdmin) return;

    if (!produto || !quantidade) {
      Alert.alert('Erro', 'Nome do produto e quantidade são obrigatórios');
      return;
    }

    const quantidadeNumerica = parseInt(quantidade);
    if (isNaN(quantidadeNumerica) || quantidadeNumerica < 0) {
      Alert.alert('Erro', 'Quantidade inválida');
      return;
    }

    try {
      setLoading(true);

      let urlFinal = imagemURL;
      if (imagem?.base64) {
        urlFinal = await uploadParaImgBB();
        if (!urlFinal) throw new Error('Upload falhou');
      }

      const data = {
        produto,
        descricao: descricao || '',
        quantidade: quantidadeNumerica,
        imagem: urlFinal || '',
        categoria: categoria.toLowerCase(),
        updatedAt: new Date().toISOString(),
      };

      if (id) {
        await updateDoc(doc(db, 'produtos', id), data);
        Alert.alert('Sucesso', 'Produto atualizado');
      } else {
        data.createdAt = new Date().toISOString();
        await addDoc(collection(db, 'produtos'), data);
        Alert.alert('Sucesso', 'Produto cadastrado');
      }

      navigation.goBack();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      Alert.alert('Erro', 'Não foi possível salvar o produto');
    } finally {
      setLoading(false);
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
    <ScrollView contentContainerStyle={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Nome do Produto"
        value={produto}
        onChangeText={setProduto}
      />
      <TextInput
        style={styles.input}
        placeholder="Descrição"
        value={descricao}
        onChangeText={setDescricao}
        multiline
        numberOfLines={3}
      />
      <TextInput
        style={styles.input}
        placeholder="Quantidade"
        value={quantidade}
        onChangeText={setQuantidade}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Categoria</Text>
      <Picker
        selectedValue={categoria}
        onValueChange={(itemValue) => setCategoria(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Peixes" value="peixes" />
  <Picker.Item label="Roedores" value="roedores" />
  <Picker.Item label="Aquários" value="aquarios" />
  <Picker.Item label="Ração" value="racao" />
  <Picker.Item label="Remédio" value="remedio" />
  <Picker.Item label="Pássaros" value="passaros" />
</Picker>

      <Button title="Selecionar Imagem" onPress={escolherImagem} />

      {imagem?.uri && <Image source={{ uri: imagem.uri }} style={styles.image} />}
      {!imagem?.uri && imagemURL && <Image source={{ uri: imagemURL }} style={styles.image} />}

      <Button title={id ? 'Atualizar' : 'Salvar'} onPress={handleSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  label: {
    marginBottom: 5,
    fontWeight: 'bold',
    color: '#333',
  },
  picker: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
  },
  image: {
    width: 150,
    height: 150,
    marginTop: 10,
    alignSelf: 'center',
  },
});
