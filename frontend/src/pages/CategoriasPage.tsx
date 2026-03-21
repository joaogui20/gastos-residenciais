import { useState, useEffect, useCallback } from 'react';
import { categoriasApi } from '../api/categorias';
import type { Categoria, CategoriaRequest } from '../types';
import Modal from '../components/Modal';

/**
 * Página de gerenciamento de Categorias.
 * Funcionalidades: listar e criar.
 *
 * A Finalidade determina quais transações podem usar a categoria:
 *   - Despesa (1): apenas transações de despesa
 *   - Receita (2): apenas transações de receita
 *   - Ambas  (3): qualquer transação
 */
export default function CategoriasPage() {
    const [categorias, setCategorias]   = useState<Categoria[]>([]);
    const [loading, setLoading]         = useState(true);
    const [erro, setErro]               = useState('');
    const [sucesso, setSucesso]         = useState('');
    const [modalAberto, setModalAberto] = useState(false);
    const [form, setForm]               = useState<CategoriaRequest>({ descricao: '', finalidade: 3 });
    const [salvando, setSalvando]       = useState(false);

    const carregar = useCallback(async () => {
        try {
            setLoading(true);
            const data = await categoriasApi.listar();
            setCategorias(data);
        } catch (e: unknown) {
            setErro(e instanceof Error ? e.message : 'Erro ao carregar categorias');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { carregar(); }, [carregar]);

    const exibirSucesso = (msg: string) => {
        setSucesso(msg);
        setTimeout(() => setSucesso(''), 3500);
    };

    const abrirModal = () => {
        setForm({ descricao: '', finalidade: 3 });
        setErro('');
        setModalAberto(true);
    };

    const fecharModal = () => { setModalAberto(false); setErro(''); };

    const handleSubmit = async () => {
    if (!form.descricao.trim()) { setErro('A descrição é obrigatória.'); return; }

    setSalvando(true);
    setErro('');
    try {
      await categoriasApi.criar(form);
      exibirSucesso('Categoria criada com sucesso!');
      fecharModal();
      carregar();
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao criar categoria.');
    } finally {
      setSalvando(false);
    }
  };

  // Mapeia finalidade para badge visual
  const finalidadeBadge = (f: string) => {
    if (f === 'Despesa') return <span className="badge badge-red">Despesa</span>;
    if (f === 'Receita') return <span className="badge badge-green">Receita</span>;
    return <span className="badge badge-blue">Ambas</span>;
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Categorias</h1>
          <p className="page-subtitle">Classifique receitas e despesas por categoria</p>
        </div>
        <button className="btn btn-primary" onClick={abrirModal}>＋ Nova Categoria</button>
      </div>

      {sucesso && <div className="alert alert-success">✓ {sucesso}</div>}
      {erro && !modalAberto && <div className="alert alert-error">⚠ {erro}</div>}

      <div className="card">
        {loading ? (
          <p style={{ color: '#94a3b8', textAlign: 'center', padding: '32px' }}>Carregando...</p>
        ) : categorias.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏷️</div>
            <p>Nenhuma categoria cadastrada ainda.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Finalidade</th>
                </tr>
              </thead>
              <tbody>
                {categorias.map((c) => (
                  <tr key={c.id}>
                    <td>{c.descricao}</td>
                    <td>{finalidadeBadge(c.finalidadeDescricao)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalAberto && (
        <Modal title="Nova Categoria" onClose={fecharModal}>
          {erro && <div className="alert alert-error">⚠ {erro}</div>}

          <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="form-group">
              <label className="form-label">Descrição *</label>
              <input
                className="form-input"
                maxLength={400}
                placeholder="Ex.: Alimentação, Salário, Aluguel..."
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Finalidade *</label>
              <select
                className="form-select"
                value={form.finalidade}
                onChange={(e) => setForm({ ...form, finalidade: Number(e.target.value) })}
              >
                <option value={1}>Despesa</option>
                <option value={2}>Receita</option>
                <option value={3}>Ambas</option>
              </select>
              <small style={{ color: '#64748b', fontSize: '0.78rem' }}>
                Define quais tipos de transação podem usar esta categoria.
              </small>
            </div>
          </div>

          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={fecharModal}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={salvando}>
              {salvando ? 'Salvando...' : 'Criar Categoria'}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}