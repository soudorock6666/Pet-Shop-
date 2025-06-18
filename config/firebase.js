import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuração do Firebase (substitua por variáveis de ambiente, se preferir)
const firebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: ':',
};

// Inicialização segura
let app;
let auth;
let db;

try {
  // Inicializa o Firebase apenas uma vez
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

  // Inicializa os serviços do Firebase
  auth = getAuth(app);
  db = getFirestore(app);

  // Define idioma padrão do Firebase Auth (opcional)
  auth.useDeviceLanguage();

  // 🔒 IMPORTANTE: Não conecte a emuladores em builds standalone
  // Emuladores só devem ser usados em ambiente local de desenvolvimento
} catch (error) {
  console.error('Erro ao inicializar Firebase:', error);
}

// Exporta os serviços para uso no app
export { auth, db };
