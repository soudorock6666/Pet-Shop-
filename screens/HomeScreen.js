import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Text,
  ScrollView,
  Animated,
} from 'react-native';

export default function HomeScreen({ navigation }) {
  const styles = createStyles();

  const openWhatsApp = () => {
    const phoneNumber = '5521975869923';
    const message = 'Olá! Gostaria de saber mais sobre a loja.';
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(err =>
      console.error('Erro ao abrir o WhatsApp:', err)
    );
  };

  const images = [
    require('../assets/fotinha.jpg'),
    require('../assets/dog.jpg'),
    // Adicione mais imagens conforme necessário
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      });
    }, 8000);

    return () => clearInterval(interval);
  }, [fadeAnim]);

  const animais = [
    {
      nome: 'Roedores',
      imagem: require('../assets/hamster.png'),
      destino: 'Roedores',
    },
    {
      nome: 'Peixes',
      imagem: require('../assets/fish.png'),
      destino: 'Peixes',
    },
    {
      nome: 'Pássaros',
      imagem: require('../assets/robin.png'),
      destino: 'Pássaros',
    },
    {
      nome: 'Ração',
      imagem: require('../assets/dog-food.png'),
      destino: 'Ração',
    },
    {
      nome: 'Aquários',
      imagem: require('../assets/aquarium.png'),
      destino: 'Aquários',
    },
    {
      nome: 'Remédios',
      imagem: require('../assets/pills.png'),
      destino: 'Remédios',
    },
  ];

  const irParaDetalhes = (animal) => {
    navigation.navigate(animal.destino, { nome: animal.nome });
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Bem-vindo ao Mundo dos Animais</Text>

        <Animated.Image
          source={images[currentIndex]}
          style={[styles.carouselImage, { opacity: fadeAnim }]}
          resizeMode="cover"
        />

        <TouchableOpacity
          style={styles.aboutButton}
          onPress={() => navigation.navigate('Sobre Nós')}
          activeOpacity={0.8}
        >
          <Text style={styles.aboutButtonText}>Quem é O Mundo dos Animais?</Text>
        </TouchableOpacity>

        <View style={styles.animalGallery}>
          {animais.map((animal, index) => (
            <TouchableOpacity
              key={index}
              style={styles.animalItem}
              onPress={() => irParaDetalhes(animal)}
              activeOpacity={0.7}
            >
              <Image source={animal.imagem} style={styles.animalImage} />
              <Text style={styles.animalText}>{animal.nome}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity onPress={openWhatsApp} style={styles.whatsappButton}>
        <Image
          source={require('../assets/whatsapp.png')}
          style={styles.whatsappIcon}
        />
      </TouchableOpacity>
    </View>
  );
}

const createStyles = () =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f0f4f8', // cor fixa clara
      paddingHorizontal: 15,
      paddingTop: 40,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#333', // cor fixa para texto
      textAlign: 'center',
      marginBottom: 20,
    },
    carouselImage: {
      width: '100%',
      height: 220,
      borderRadius: 15,
      marginBottom: 25,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 6,
    },
    aboutButton: {
      backgroundColor: '#34a853', // cor fixa verde
      paddingVertical: 14,
      borderRadius: 30,
      marginBottom: 30,
      alignItems: 'center',
      shadowColor: '#34a853',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 5,
    },
    aboutButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '600',
      letterSpacing: 0.8,
    },
    animalGallery: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 100,
    },
    animalItem: {
      backgroundColor: '#fff', // cor fixa branco
      width: '47%',
      borderRadius: 15,
      marginBottom: 20,
      alignItems: 'center',
      paddingVertical: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    animalImage: {
      width: 90,
      height: 90,
      borderRadius: 12,
      marginBottom: 10,
    },
    animalText: {
      fontSize: 16,
      color: '#222', // cor fixa texto
      fontWeight: '500',
    },
    whatsappButton: {
      position: 'absolute',
      bottom: 35,
      right: 25,
      backgroundColor: '#25D366',
      borderRadius: 30,
      padding: 12,
      shadowColor: '#25D366',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 10,
      elevation: 8,
    },
    whatsappIcon: {
      width: 36,
      height: 36,
      tintColor: '#fff',
    },
  });
