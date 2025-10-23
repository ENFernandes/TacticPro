# Plataforma TacticPro - Editor Tático de Futebol (Frontend Only)

## Stack Tecnológica

### Frontend

- **Next.js 14+** (App Router) com TypeScript
- **React** para componentes interativos
- **Konva.js/React-Konva** - biblioteca canvas para desenho e manipulação de elementos táticos (arrastar, rotacionar, escalar)
- **Tailwind CSS** - estilização moderna e responsiva
- **Zustand** - gestão de estado do editor
- **Zod** - validação de schemas para táticas exportadas/importadas
- **localStorage** - persistência local das táticas

## Arquitetura

```
TacticPro/
├── src/
│   └── TacticPro.Web/           # Frontend Next.js
│       ├── app/
│       │   ├── page.tsx         # Landing page
│       │   ├── editor/
│       │   │   ├── page.tsx     # Editor principal
│       │   │   └── [id]/
│       │   │       └── page.tsx # Editor com tática específica
│       │   └── share/
│       │       └── [id]/
│       │           └── page.tsx # Visualização readonly
│       ├── components/
│       │   ├── editor/         # Canvas e ferramentas
│       │   │   ├── TacticCanvas.tsx
│       │   │   ├── Toolbar.tsx
│       │   │   ├── FieldBackground.tsx
│       │   │   ├── PlayerElement.tsx
│       │   │   ├── ArrowElement.tsx
│       │   │   └── TextElement.tsx
│       │   ├── ui/             # Componentes base
│       │   │   ├── Button.tsx
│       │   │   ├── Input.tsx
│       │   │   └── Modal.tsx
│       │   └── tactics/        # Biblioteca de táticas
│       │       ├── TacticLibrary.tsx
│       │       └── TacticCard.tsx
│       ├── lib/
│       │   ├── store.ts        # Zustand store
│       │   ├── utils.ts
│       │   └── validation.ts   # Zod schemas
│       └── types/
│           └── tactic.ts
├── package.json
└── README.md
```

## Funcionalidades Core

### 1. Editor Tático (Canvas)

- Campo de futebol renderizado no canvas (Konva.js)
- Arrastar e posicionar jogadores (círculos numerados 1-11)
- Desenhar setas direcionais (movimentos, passes)
- Adicionar texto/anotações
- Ferramentas: seleção, mover, apagar, desfazer/refazer
- Paleta de cores para diferentes elementos

### 2. Gestão de Táticas (Local)

- Guardar tática com nome e descrição (localStorage)
- Listar táticas guardadas localmente
- Editar/eliminar táticas existentes
- Exportar como imagem PNG ou JSON
- Importar táticas de JSON

### 3. Partilha Básica

- Gerar link de partilha (URL com dados codificados)
- Ver táticas partilhadas via URL (readonly)
- Copiar link para clipboard

## Modelos de Dados

### TacticData (Frontend - JSON schema)

```typescript
interface TacticData {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  content: {
    players: Array<{
      id: string;
      x: number;
      y: number;
      number: number;
      color: string;
    }>;
    arrows: Array<{
      id: string;
      points: number[];
      color: string;
      type: 'movement' | 'pass';
    }>;
    annotations: Array<{
      id: string;
      x: number;
      y: number;
      text: string;
      fontSize: number;
      color: string;
    }>;
  };
}
```

## Implementação

### Frontend (Next.js)

- **Página principal** (`/`) - landing page com biblioteca de táticas
- **Editor** (`/editor` ou `/editor/[id]`) - canvas principal
- **Partilha** (`/share/[id]`) - visualização readonly via URL params

### Componentes Principais

- `TacticCanvas` - componente Konva Stage/Layer
- `Toolbar` - ferramentas de desenho
- `PlayerElement` - jogador arrastável
- `ArrowElement` - seta direcional
- `TextElement` - anotação de texto
- `FieldBackground` - marcações do campo
- `TacticLibrary` - lista de táticas guardadas

### Estado Global (Zustand)

```typescript
interface EditorStore {
  // Canvas state
  players: Player[];
  arrows: Arrow[];
  annotations: Annotation[];
  
  // UI state
  selectedTool: 'select' | 'player' | 'arrow' | 'text';
  selectedElement: string | null;
  
  // Actions
  addPlayer: (player: Player) => void;
  addArrow: (arrow: Arrow) => void;
  addAnnotation: (annotation: Annotation) => void;
  updateElement: (id: string, updates: any) => void;
  deleteElement: (id: string) => void;
  clearCanvas: () => void;
  
  // Tactic management
  saveTactic: (name: string, description?: string) => void;
  loadTactic: (id: string) => void;
  exportAsImage: () => void;
  exportAsJson: () => void;
}
```

## Fluxo de Trabalho

1. Utilizador acede ao editor vazio ou carrega tática existente
2. Desenha no canvas (adicionar jogadores, setas, texto)
3. Guarda tática localmente (localStorage)
4. Pode partilhar (gerar URL com dados codificados)
5. Outros utilizadores acedem via link de partilha (readonly)

## Tecnologias-Chave Justificadas

- **Konva.js**: Melhor biblioteca React para canvas interativo, suporta arrastar/eventos/transformações out-of-the-box
- **Next.js**: SSR para landing/partilha, Client Components para editor
- **Zustand**: Estado global simples e performático
- **localStorage**: Persistência local sem necessidade de backend
- **URL encoding**: Partilha simples via query parameters

## Pontos de Atenção

- Canvas state pode ficar grande; considerar debounce no autosave
- Exportar PNG via `stage.toDataURL()` do Konva
- Validar JSON de táticas importadas com Zod
- URLs de partilha podem ficar longas com muitos elementos
- localStorage tem limite de ~5-10MB por domínio

## To-dos

- [ ] Criar estrutura inicial do projeto Next.js
- [ ] Configurar TypeScript, Tailwind CSS e dependências (react-konva, zustand, zod)
- [ ] Implementar componente TacticCanvas com Konva (campo, jogadores arrastáveis, setas, texto)
- [ ] Criar toolbar com ferramentas (adicionar jogador, seta, texto, apagar, guardar)
- [ ] Implementar estado global com Zustand (canvas state, ações)
- [ ] Criar sistema de persistência local (localStorage) para táticas
- [ ] Implementar exportação PNG e JSON
- [ ] Criar página de biblioteca de táticas guardadas
- [ ] Implementar sistema de partilha via URL (encoding/decoding)
- [ ] Criar página de visualização readonly para táticas partilhadas
- [ ] Adicionar validação com Zod para importação de táticas
- [ ] Implementar funcionalidades de desfazer/refazer
- [ ] Adicionar paleta de cores e personalização visual
