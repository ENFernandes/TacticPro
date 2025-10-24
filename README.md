# TacticPro - Plataforma de Desenho Tático de Futebol

Uma aplicação web moderna para treinadores de futebol criarem, editarem e exportarem táticas com animações interativas.

## 🚀 Funcionalidades

### ✨ Principais
- **Canvas Interativo**: Campo de futebol realista com Fabric.js
- **Formações Pré-definidas**: 4-4-2, 4-3-3, 3-5-2, 4-2-3-1 e mais
- **Sistema de Jogadores**: Drag-and-drop, números personalizáveis, cores por equipa
- **Ferramentas de Desenho**: Setas, linhas, formas, texto para anotações
- **Animações**: Timeline com keyframes, múltiplas fases de jogada
- **Exportação**: PNG, JPG, PDF, JSON
- **Auto-save**: Guarda automático a cada 30 segundos
- **Tema Dark/Light**: Interface adaptável
- **Atalhos de Teclado**: Produtividade otimizada

### 🎯 Específicas
- **Zero Setup**: Sem registo necessário, funciona imediatamente
- **Offline-First**: Funciona sem internet após primeiro carregamento
- **Armazenamento Local**: Todas as táticas guardadas no browser
- **Responsivo**: Funciona em desktop e tablet

## 🛠️ Stack Tecnológica

### Frontend
- **Next.js 14+** com App Router e TypeScript
- **Fabric.js** para canvas interativo
- **Tailwind CSS** para estilização
- **Zustand** para gestão de estado
- **Framer Motion** para animações UI
- **Lucide React** para ícones

### Exportação
- **html2canvas** para PNG/JPG
- **jsPDF** para documentos PDF
- **Zod** para validação de dados

### Desenvolvimento
- **ESLint + Prettier** para qualidade de código
- **TypeScript strict mode** para type safety

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Instalação
```bash
# Clonar o repositório
git clone <repository-url>
cd football-tactics-platform

# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

### Build para Produção
```bash
npm run build
npm start
```

## 📖 Como Usar

### 1. Criar Nova Tática
1. Aceder ao editor (`/editor`)
2. Escolher formação na sidebar esquerda
3. Personalizar posições dos jogadores (drag-and-drop)
4. Adicionar anotações com ferramentas de desenho

### 2. Criar Animações
1. Clicar "Adicionar Fase" na timeline
2. Posicionar jogadores para a primeira fase
3. Clicar "Capturar Posição"
4. Mover jogadores para próxima fase
5. Repetir processo
6. Usar Play/Pause para visualizar

### 3. Exportar
- **PNG/JPG**: Para apresentações rápidas
- **PDF**: Para documentos profissionais com múltiplas fases
- **JSON**: Para partilhar projetos completos

## ⌨️ Atalhos de Teclado

| Atalho | Ação |
|--------|------|
| `Ctrl+S` | Guardar tática |
| `Ctrl+E` | Exportar PNG |
| `Ctrl+Shift+E` | Exportar PDF |
| `Espaço` | Play/Pause animação |
| `Escape` | Stop animação |
| `Ctrl++` | Zoom in |
| `Ctrl+-` | Zoom out |
| `Ctrl+0` | Reset zoom |
| `1-6` | Selecionar ferramenta |
| `Delete` | Eliminar objeto selecionado |

## 🏗️ Estrutura do Projeto

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Página inicial
│   └── editor/
│       └── page.tsx       # Editor de táticas
├── components/
│   ├── pitch/             # Componentes do campo
│   ├── sidebar/           # Sidebar e timeline
│   └── ui/               # Componentes reutilizáveis
├── lib/
│   ├── fabric/           # Objetos Fabric.js personalizados
│   ├── storage/          # Persistência e schemas
│   └── export/           # Funcionalidades de exportação
├── hooks/                # Custom hooks
├── store/                # Zustand stores
└── types/                # Definições TypeScript
```

## 🎨 Personalização

### Cores do Campo
```typescript
// src/tailwind.config.ts
colors: {
  pitch: {
    green: "#2D8B3C",    // Cor do campo
    line: "#FFFFFF",     // Cor das linhas
  }
}
```

### Formações Personalizadas
```typescript
// src/lib/formations.ts
export const FORMATIONS: Formation[] = [
  // Adicionar novas formações aqui
];
```

## 🔧 Configurações Avançadas

### Auto-save
```typescript
// src/hooks/useAutoSave.ts
interval: 30000, // 30 segundos (padrão)
```

### Exportação
```typescript
// src/lib/export/export-manager.ts
multiplier: 2, // Resolução da imagem exportada
quality: 0.9,  // Qualidade JPG (0-1)
```

## 🐛 Resolução de Problemas

### Canvas não carrega
- Verificar se Fabric.js está instalado
- Verificar console para erros JavaScript

### Exportação falha
- Verificar se html2canvas/jsPDF estão instalados
- Verificar permissões do browser para download

### Auto-save não funciona
- Verificar se localStorage está disponível
- Verificar se o canvas está inicializado

## 🤝 Contribuição

1. Fork o projeto
2. Criar branch para feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit mudanças (`git commit -m 'Adicionar nova funcionalidade'`)
4. Push para branch (`git push origin feature/nova-funcionalidade`)
5. Abrir Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Ver `LICENSE` para mais detalhes.

## 🙏 Agradecimentos

- [Fabric.js](https://fabricjs.com/) - Biblioteca canvas
- [Next.js](https://nextjs.org/) - Framework React
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [Lucide](https://lucide.dev/) - Ícones

---

**Desenvolvido com ❤️ para a comunidade de treinadores de futebol**


