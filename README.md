# 🌸 Lalateliê | Papelaria Afetiva & Artesanal

> Cadernos, planners, agendas e mimos artesanais feitos à mão com personalização exclusiva. Encadernação afetiva para inspirar a sua rotina.

![Status do Projeto](https://img.shields.io/badge/status-conclu%C3%ADdo-brightgreen)
![Versão](https://img.shields.io/badge/vers%C3%A3o-1.0.0-gold)
![Licença](https://img.shields.io/badge/licen%C3%A7a-MIT-blue)

---

## 📖 Sobre o Projeto

O **Lalateliê** é um site institucional e catálogo digital interativo desenvolvido para apresentar produtos artesanais de papelaria afetiva. A plataforma valoriza o design sofisticado, suave e acolhedor (estética botânica/afetiva com tons *sage*, *dourado* e *off-white*), proporcionando uma experiência de navegação fluida tanto no computador quanto em dispositivos móveis.

---

## ✨ Funcionalidades Principais

- 📱 **Design 100% Responsivo e Mobile-First**: Adaptação perfeita para smartphones, tablets e desktops.
- 🗂️ **Catálogo Dinâmico de Produtos** (`catalogo.html`):
  - Filtragem instantânea por categorias (Agendas, Planners, Cadernos, Mimos, etc.).
  - Ordenação por preço, nome e relevância.
  - Barra de busca em tempo real.
- 🔍 **Visualizador de Produtos e Lightbox**:
  - Página dedicada de produto (`produto.html`) com galeria de fotos e especificações de acabamento.
  - Modal lightbox para ampliação das capas e detalhes artesanais.
- 💬 **Integração com WhatsApp**:
  - Botão de contato rápido com mensagens pré-formatadas.
  - Redirecionamento de pedidos com os dados do produto selecionado.
- 📝 **Formulário de Contato & Orçamento Personalizado**:
  - Envio direto e seguro de mensagens para `personalizadoslalatelie@gmail.com`.
  - Configuração automática do cabeçalho **Reply-To** com o e-mail do cliente para resposta com um clique.
  - Validação completa em tempo real (Nome, E-mail RFC, WhatsApp com máscara, Assunto e Mensagem).
  - Indicador dinâmico de carregamento (*spinner* e desabilitação do botão para evitar envios duplicados).
  - Proteção anti-spam via campo *Honeypot* invisível e sanitização no envio.
  - Tratamento de erros robusto com alertas inline e notificações via *Toast*.
- 🌿 **Acessibilidade e Micro-interações**:
  - Navegação via teclado (`skip-link`, tags semânticas ARIA).
  - Animações suaves de revelação e botões flutuantes interativos (Instagram, WhatsApp e Voltar ao Topo).

---

## 🛠️ Tecnologias Utilizadas

O projeto foi construído utilizando tecnologias modernas e limpas, sem dependência de frameworks pesados:

- **HTML5 Semântico**: Estrutura acessível, otimizada para SEO e mecanismos de busca.
- **CSS3 Moderno**: 
  - CSS Custom Properties (variáveis para paleta de cores e tipografia).
  - Flexbox e CSS Grid para layouts responsivos.
  - Micro-animações e efeitos visuais com transições suaves.
- **JavaScript Vanilla (ES6+)**:
  - Manipulação do DOM de forma modular.
  - Base de dados de produtos centralizada (`produtos-data.js`).
  - Filtros e ordenação dinâmicos em tempo de execução.
- **Ícones & Tipografia**:
  - [Google Fonts](https://fonts.google.com/): *Cormorant Garamond*, *Alex Brush* e *Plus Jakarta Sans*.
  - [Font Awesome 6](https://fontawesome.com/): Biblioteca completa de ícones vetoriais.

---

## 📂 Estrutura de Arquivos

```text
lala1-editar/
├── assets/
│   ├── css/
│   │   ├── style.css           # Estilos principais da Home
│   │   ├── catalogo.css        # Estilos da página de catálogo
│   │   └── produto.css         # Estilos da página de detalhes do produto
│   ├── js/
│   │   ├── script.js           # Lógica da página inicial, menu e formulário
│   │   ├── catalogo.js         # Filtros, ordenação e busca do catálogo
│   │   ├── produto.js          # Lógica da galeria e detalhes de cada produto
│   │   ├── produtos-data.js    # Banco de dados (JSON/Array) dos produtos
│   │   └── scroll-top.js       # Comportamento do botão voltar ao topo
│   └── images/                 # Imagens da marca, capas, produtos e ícones
├── index.html                  # Página Inicial (Landing Page)
├── catalogo.html               # Página do Catálogo Completo
├── produto.html                # Página de Detalhe / Compra do Produto
└── README.md                   # Documentação do projeto
```

---

## 🚀 Como Executar o Projeto Localmente

Por se tratar de uma aplicação web estática (HTML, CSS e JS), não é necessário instalar dependências ou configurar servidores complexos:

1. **Clone este repositório** para sua máquina:
   ```bash
   git clone https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
   ```
2. **Acesse a pasta do projeto**:
   ```bash
   cd lala1-editar
   ```
3. **Abra o arquivo principal**:
   - Dê um duplo clique no arquivo `index.html`, **OU**
   - Use a extensão **Live Server** no Visual Studio Code para rodar com recarregamento automático:
     - Clique com o botão direito em `index.html` e selecione **"Open with Live Server"**.

---

## 🌐 Publicação (Deploy) no GitHub Pages

Você pode colocar este site no ar gratuitamente pelo GitHub Pages em poucos passos:

1. No seu repositório no GitHub, clique na aba **Settings** (Configurações).
2. Na barra lateral esquerda, clique em **Pages**.
3. Em **Build and deployment > Branch**:
   - Selecione a branch `main` (ou `master`).
   - Mantenha a pasta como `/ (root)`.
   - Clique em **Save**.
4. Aguarde cerca de 1 a 2 minutos e o link público do seu site será gerado automaticamente!

---

## 📧 Configuração e Ativação do Envio de E-mails

As mensagens do formulário de contato são enviadas de forma assíncrona (AJAX) para **`personalizadoslalatelie@gmail.com`** usando a API segura do [FormSubmit](https://formsubmit.co/):

- **Primeiro Envio (Ativação Obrigatória)**:
  1. Ao realizar o primeiro envio de teste no site, o serviço enviará um e-mail com o assunto *"Action Required: Confirm FormSubmit Activation"* para a caixa `personalizadoslalatelie@gmail.com`.
  2. Basta abrir a mensagem e clicar no botão **"Activate Form"**.
  3. A partir dessa ativação única, todas as mensagens enviadas por clientes passarão a chegar instantaneamente na caixa de entrada, sem necessidade de confirmações adicionais.
- **Assunto Padronizado em Português**:
  - Formato: `Novo contato pelo site - {Nome do Cliente} | Papelaria Personalizada Lalatelie`.
- **Apresentação em Tabela em Português**:
  - Todas as linhas do e-mail recebido são identificadas em português: *Nome do cliente*, *E-mail para resposta*, *Telefone ou WhatsApp*, *Tipo de personalização desejado*, *Produto de interesse*, *Quantidade estimada*, *Assunto*, *Mensagem enviada*, *Deseja catálogo em PDF* e *Data do envio*.
- **Resposta Automática ao Cliente (Auto-response)**:
  - O FormSubmit dispara automaticamente uma mensagem de confirmação em português brasileiro para o endereço informado pelo cliente.
- **Reply-To Direto**: Ao abrir o e-mail recebido e clicar em **"Responder"** no Gmail, o endereço de resposta será automaticamente o e-mail preenchido pelo cliente.
- **Identificação do Remetente (FormSubmit)**:
  - As mensagens são entregues a partir da infraestrutura do FormSubmit (`submissions@formsubmit.co`), garantindo autenticação SPF/DKIM e evitando que caiam na caixa de spam. A identificação visual da loja e do cliente é assegurada pelo assunto customizado e cabeçalho Reply-To.

---

## 👩‍🎨 Autoria & Direitos

Desenvolvido para **Lalateliê - Papelaria Afetiva & Artesanal**.  
*Ipatinga, MG • Feito com afeto e carinho manual.*
