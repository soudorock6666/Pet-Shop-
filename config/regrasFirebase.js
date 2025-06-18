//Copiar e colar no firebase console - firestore database - regras.
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Função auxiliar para verificar se o usuário é admin
    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Regras para a coleção de usuários
    match /users/{userId} {
      // Permite leitura se o usuário estiver autenticado e for o próprio usuário ou admin
      allow read: if request.auth != null && (request.auth.uid == userId || isAdmin());
      
      // Permite criação do próprio perfil durante o registro
      allow create: if request.auth != null && request.auth.uid == userId;
      
      // Permite atualização se for o próprio usuário ou admin
      allow update: if request.auth != null && (request.auth.uid == userId || isAdmin());
      
      // Permite deleção apenas para admin
      allow delete: if request.auth != null && isAdmin();
    }
    
    // Regras para a coleção de produtos
    match /produtos/{productId} {
      // Permite leitura para usuários autenticados
      allow read: if request.auth != null;
      
      // Permite escrita apenas para admins
      allow write: if request.auth != null && isAdmin();
    }
  }
}
*/