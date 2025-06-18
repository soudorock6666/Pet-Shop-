import { db } from './firebase';
import { doc, getDoc, setDoc, collection } from 'firebase/firestore';

export const createUserProfile = async (user) => {
    try {
        console.log('Iniciando criação/atualização do perfil para usuário:', user.uid);

        if (!db) {
            throw new Error('Firestore não está inicializado');
        }

        // Verifica se a coleção users existe
        const usersCollection = collection(db, 'users');
        console.log('Verificando coleção users...');

        // Verifica se já existe um perfil para este usuário
        const userRef = doc(usersCollection, user.uid);
        console.log('Verificando documento do usuário...');

        try {
            const userDoc = await getDoc(userRef);
            console.log('Documento verificado com sucesso');

            if (!userDoc.exists()) {
                console.log('Perfil não encontrado. Criando novo perfil...');
                // Cria um novo perfil de usuário
                const userProfile = {
                    email: user.email,
                    role: 'user', // Por padrão, todos começam como usuários normais
                    createdAt: new Date().toISOString(),
                    name: user.email.split('@')[0],
                    lastLogin: new Date().toISOString()
                };

                console.log('Tentando salvar novo perfil...');
                // Salva o perfil no Firestore
                try {
                    await setDoc(userRef, userProfile);
                    console.log('Perfil criado com sucesso!');
                    return userProfile;
                } catch (setError) {
                    console.error('Erro ao salvar perfil:', {
                        code: setError.code,
                        message: setError.message,
                        stack: setError.stack
                    });

                    // Mensagens de erro mais específicas
                    let errorMessage = 'Erro ao criar perfil';
                    if (setError.code === 'permission-denied') {
                        errorMessage = 'Sem permissão para criar perfil. Verifique as regras do Firestore.';
                    } else if (setError.code === 'not-found') {
                        errorMessage = 'Coleção users não encontrada. Verifique a configuração do Firestore.';
                    }

                    throw new Error(`${errorMessage}: ${setError.message}`);
                }
            }

            console.log('Perfil encontrado. Atualizando último login...');
            // Se o perfil já existe, atualiza o último login
            try {
                await setDoc(userRef, {
                    lastLogin: new Date().toISOString()
                }, { merge: true });
                console.log('Último login atualizado com sucesso!');
                return userDoc.data();
            } catch (updateError) {
                console.error('Erro ao atualizar último login:', {
                    code: updateError.code,
                    message: updateError.message,
                    stack: updateError.stack
                });
                throw new Error(`Falha ao atualizar último login: ${updateError.message}`);
            }
        } catch (getError) {
            console.error('Erro ao verificar documento:', {
                code: getError.code,
                message: getError.message,
                stack: getError.stack
            });
            throw new Error(`Falha ao verificar documento: ${getError.message}`);
        }
    } catch (error) {
        console.error('Erro detalhado ao criar/atualizar perfil:', {
            code: error.code,
            message: error.message,
            stack: error.stack
        });

        // Mensagem de erro mais amigável para o usuário
        let userMessage = 'Erro ao criar/atualizar perfil. ';
        if (error.message.includes('permission-denied')) {
            userMessage += 'Erro de permissão. Por favor, contate o suporte.';
        } else if (error.message.includes('not-found')) {
            userMessage += 'Erro de configuração. Por favor, contate o suporte.';
        } else {
            userMessage += 'Por favor, tente novamente ou contate o suporte.';
        }

        if (typeof window !== 'undefined') {
            alert(userMessage);
        }
        throw error;
    }
};

export const getUserProfile = async (userId) => {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
            return userDoc.data();
        }
        return null;
    } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        throw error;
    }
};

// Função para tornar um usuário administrador (deve ser chamada apenas por outro admin)
export const makeUserAdmin = async (userId) => {
    try {
        await setDoc(doc(db, 'users', userId), {
            role: 'admin',
            updatedAt: new Date().toISOString()
        }, { merge: true });
        return true;
    } catch (error) {
        console.error('Erro ao atualizar perfil para admin:', error);
        throw error;
    }
}; 