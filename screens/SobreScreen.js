import { View, Text, StyleSheet, Image, TouchableOpacity, Linking, ScrollView } from 'react-native';
import React from 'react';

export default function ProfileScreen() {
  const styles = createStyles();

  const openLink = async (url) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      alert(`Não é possível abrir o link: ${url}`);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🐾 Sobre a Loja</Text>

      <Text style={styles.address}>
        📍 Av. Gov. Leonel de Moura Brizola, 1452{"\n"}
        Centro, Duque de Caxias - RJ, 25010-002
      </Text>

      <Image 
        source={{ uri: 'https://lh3.googleusercontent.com/p/AF1QipMY4iFr4sZ7iwAe9AuVdbMHKKMsO4rvyw8-A_OH=w507-h240-k-no' }} 
        style={styles.image} 
      />

      <Text style={styles.subtitle}>Siga a gente nas redes sociais!</Text>

      <View style={styles.socialContainer}>
        <TouchableOpacity onPress={() => openLink('https://www.instagram.com/mundodosanimaispet/?hl=pt')}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/174/174855.png' }}
            style={styles.socialIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => openLink('https://www.facebook.com/mundodosanimaiscaxias')}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/733/733547.png' }}
            style={styles.socialIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => openLink('https://wa.me/5521999999999')}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/733/733585.png' }}
            style={styles.socialIcon}
          />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const createStyles = () =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      padding: 24,
      backgroundColor: '#f0f8ff',
      alignItems: 'center',
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#00796b',
      textAlign: 'center',
      marginBottom: 15,
    },
    address: {
      fontSize: 16,
      color: '#333',
      textAlign: 'center',
      marginBottom: 20,
      lineHeight: 22,
    },
    image: {
      width: '100%',
      height: 220,
      borderRadius: 15,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 5,
    },
    subtitle: {
      fontSize: 20,
      fontWeight: '600',
      color: '#004d40',
      marginBottom: 15,
      textAlign: 'center',
    },
    socialContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '50%',
      marginTop: 10,
      gap: 20,
    },
    socialIcon: {
      width: 50,
      height: 50,
    },
  });
