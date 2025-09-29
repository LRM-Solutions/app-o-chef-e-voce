# Fortelyne App

Um aplicativo React Native desenvolvido com JavaScript e StyleSheet para estilização.

## 🚀 Funcionalidades

- ✅ Autenticação de usuário com JWT
- ✅ Armazenamento seguro de token com AsyncStorage
- ✅ Interface moderna com StyleSheet do React Native
- ✅ Interceptadores de requisição automáticos
- ✅ Gerenciamento de estado de autenticação

## 📁 Estrutura do Projeto

```
src/
├── api/              # Configuração da API e funções
│   ├── apiConfig.js  # Configuração do Axios
│   └── authApi.js    # Funções de autenticação
├── components/       # Componentes reutilizáveis
│   ├── AuthProvider.js    # Provider de autenticação
│   └── LoadingScreen.js   # Tela de carregamento
├── screens/          # Telas da aplicação
│   ├── LoginScreen.js     # Tela de login
│   └── HomeScreen.js      # Tela inicial
├── utils/            # Funções utilitárias
└── assets/           # Imagens e estilos
    ├── images/
    └── styles/
```

## 🛠️ Tecnologias Utilizadas

- **React Native** - Framework mobile
- **Expo** - Plataforma de desenvolvimento
- **StyleSheet** - Estilização nativa do React Native
- **Axios** - Cliente HTTP
- **AsyncStorage** - Armazenamento local
- **React Context** - Gerenciamento de estado

## 📦 Instalação

1. Clone o repositório
2. Instale as dependências:

   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente no arquivo `.env`:
   ```
   API_BASE_URL=https://api-fortelyne.lrmsolutions.com.br/
   ```

## 🎯 Como Executar

```bash
# Para iOS
npm run ios

# Para Android
npm run android

# Para Web
npm run web
```

## 🔐 Autenticação

O app utiliza autenticação JWT com os seguintes endpoints:

- **Login**: `POST /login`
  - Body: `{ user_email, user_password }`
  - Resposta: `{ token }`

O token é automaticamente armazenado no AsyncStorage e incluído em todas as requisições subsequentes.

## 📱 Telas

### Login Screen

- Formulário de login com validação
- Feedback visual de loading
- Armazenamento automático do token

### Home Screen

- Tela inicial após autenticação
- Opção de logout
- Interface responsiva

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request
