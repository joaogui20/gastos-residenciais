import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import PessoasPage         from './pages/PessoasPage';
import CategoriasPage      from './pages/CategoriasPage';
import TransacoesPage      from './pages/TransacoesPage';
import RelatorioPessoaPage    from './pages/RelatorioPessoaPage';
import RelatorioCategoriaPage from './pages/RelatorioCategoriaPage';
import './styles/global.css';

/**
 * Componente raiz da aplicação.
 * Configura o roteamento (React Router v6) e o layout com sidebar fixa.
 * Cada rota corresponde a uma seção do sistema de controle de gastos.
 */
export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        {/* ── Sidebar de navegação ───────────────────────────────────── */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <span>🏠</span> Gastos Residenciais
          </div>

          <nav>
            <p className="sidebar-section">Cadastros</p>
            <NavLink to="/pessoas"    className={({ isActive }) => isActive ? 'active' : ''}>
              👤 Pessoas
            </NavLink>
            <NavLink to="/categorias" className={({ isActive }) => isActive ? 'active' : ''}>
              🏷️ Categorias
            </NavLink>
            <NavLink to="/transacoes" className={({ isActive }) => isActive ? 'active' : ''}>
              💸 Transações
            </NavLink>

            <p className="sidebar-section" style={{ marginTop: '12px' }}>Relatórios</p>
            <NavLink to="/relatorio/pessoa"    className={({ isActive }) => isActive ? 'active' : ''}>
              📊 Totais por Pessoa
            </NavLink>
            <NavLink to="/relatorio/categoria" className={({ isActive }) => isActive ? 'active' : ''}>
              📈 Totais por Categoria
            </NavLink>
          </nav>
        </aside>

        {/* ── Área de conteúdo principal ─────────────────────────────── */}
        <main className="main-content">
          <Routes>
            {/* Redireciona a raiz para a listagem de pessoas */}
            <Route path="/"                      element={<Navigate to="/pessoas" replace />} />
            <Route path="/pessoas"               element={<PessoasPage />} />
            <Route path="/categorias"            element={<CategoriasPage />} />
            <Route path="/transacoes"            element={<TransacoesPage />} />
            <Route path="/relatorio/pessoa"      element={<RelatorioPessoaPage />} />
            <Route path="/relatorio/categoria"   element={<RelatorioCategoriaPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}