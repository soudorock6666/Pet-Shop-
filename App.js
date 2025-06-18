import 'react-native-gesture-handler'; // IMPORTANTE: deve ser o primeiro import

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, ActivityIndicator } from 'react-native';

import './config/firebase';
import { auth, db } from './config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import ChangePasswordScreen from './screens/ChangePasswordScreen';
import PeixesScreen from './screens/PeixesScreen';
import RoedoresScreen from './screens/RoedoresScreen';
import AquariosScreen from './screens/AquariosScreen';
import PassarosScreen from './screens/PassarosScreen';
import RacaoScreen from './screens/RacaoScreen';
import RemedioScreen from './screens/RemedioScreen';
import SobreScreen from './screens/SobreScreen';
import ProductFormScreen from './screens/ProductFormScreen';
import DeleteScreen from './screens/DeleteScreen';
import ProductDetailScreen from './screens/ProductDetailScreen';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

function DrawerNavigator({ isAdmin }) {
  return (
    <Drawer.Navigator
      initialRouteName="Início"
      screenOptions={{
        headerStyle: { backgroundColor: '#2196F3' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Drawer.Screen name="Início" component={HomeScreen} />
      <Drawer.Screen name="Perfil" component={ProfileScreen} />
      <Drawer.Screen name="Alterar Senha" component={ChangePasswordScreen} />
      <Drawer.Screen name="Peixes" component={PeixesScreen} />
      <Drawer.Screen name="Roedores" component={RoedoresScreen} />
      <Drawer.Screen name="Aquários" component={AquariosScreen} />
      <Drawer.Screen name="Pássaros" component={PassarosScreen} />
      <Drawer.Screen name="Ração" component={RacaoScreen} />
      <Drawer.Screen name="Remédios" component={RemedioScreen} />
      <Drawer.Screen name="Sobre Nós" component={SobreScreen} />
      {isAdmin && (
        <>
          <Drawer.Screen name="Gerenciar Produtos" component={ProductFormScreen} />
          <Drawer.Screen name="Deletar Produtos" component={DeleteScreen} />
        </>
      )}
    </Drawer.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Cadastro" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setIsAdmin(userData.role === 'admin');
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error('Erro ao buscar role:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={{ marginTop: 10, color: '#666' }}>Carregando...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? (
        <Stack.Navigator>
          <Stack.Screen
            name="MainDrawer"
            options={{ headerShown: false }}
          >
            {() => <DrawerNavigator isAdmin={isAdmin} />}
          </Stack.Screen>

          <Stack.Screen
            name="ProductDetailScreen"
            component={ProductDetailScreen}
            options={{
              headerShown: true,
              title: 'Detalhes do Produto',
              headerStyle: { backgroundColor: '#2196F3' },
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: 'bold' },
            }}
          />
        </Stack.Navigator>
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}
