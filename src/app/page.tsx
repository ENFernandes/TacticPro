import Link from "next/link";
import { Plus, Play, Settings } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            TacticPro
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Plataforma de Desenho Tático para Treinadores de Futebol
          </p>
        </header>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                Criar Nova Tática
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Comece do zero ou escolha uma formação pré-definida para criar
                sua tática personalizada.
              </p>
              <Link
                href="/editor"
                className="btn btn-primary inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Nova Tática
              </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                Táticas Guardadas
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Visualize e edite suas táticas anteriores. Todas guardadas
                localmente no seu browser.
              </p>
              <button className="btn btn-secondary inline-flex items-center gap-2">
                <Play className="w-5 h-5" />
                Ver Táticas
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
              Funcionalidades
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
                  Animações
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Crie animações de movimento dos jogadores para visualizar
                  jogadas completas.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
                  Formações
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Biblioteca de formações comuns: 4-4-2, 4-3-3, 3-5-2 e
                  muitas outras.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
                  Exportação
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Exporte suas táticas como PNG, JPG ou PDF para
                  apresentações.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

