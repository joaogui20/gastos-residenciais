import { useState, useEffect, useCallback } from 'react';
import { transacoesApi } from '../api/transacoes';
import { pessoasApi } from '../api/pessoas';
import { categoriasApi } from '../api/categorias';
import type { Transacao, TransacaoRequest, Pessoa, Categoria } from '../types';
import Modal from '../components/Modal';
import { formatCurrency } from '../utils/format';

/**
 * Página de gerenciamento de Transações.
 * Funcionalidades: listar e criar.
 *
 * Regras de negócio aplicadas também no front-end (validação antecipada):
 *   1. Ao selecionar uma pessoa menor de 18 anos, o campo Tipo é bloqueado em "Despesa".
 *   2. Ao alterar o Tipo, as categorias disponíveis são recarregadas via API
 *      (endpoint /categorias/por-tipo), garantindo que apenas categorias compatíveis apareçam.
 *
 * A validação definitiva ocorre no back-end; o front apenas melhora a UX.
 */
export default function TransacoesPage() {
  const [transacoes, setTransacoes]   = useState<Transacao[]>([]);
  const [pessoas, setPessoas]         = useState<Pessoa[]>([]);
  const [categorias, setCategorias]   = useState<Categoria[]>([]);
  const [loading, setLoading]         = useState(true);
  const [erro, setErro]               = useState('');
  const [sucesso, setSucesso]         = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [salvando, setSalvando]       = useState(false);

  // Estado do formulário — tipo inicia como Despesa (1)
  const [form, setForm] = useState<TransacaoRequest>({
    descricao: '',
    valor: 0,
    tipo: 1,
    categoriaId: '',
    pessoaId: '',
  });

  // ── Carregamento de dados ──────────────────────────────────────────────
  const carregarTransacoes = useCallback(async () => {
    try {
      const data = await transacoesApi.listar();
      setTransacoes(data);
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao carregar transações.');
    } finally {
      setLoading(false);
    }
  }, []);

  const carregarPessoas = useCallback(async () => {
    const data = await pessoasApi.listar();
    setPessoas(data);
  }, []);

  /**
   * Recarrega as categorias compatíveis sempre que o tipo de transação muda.
   * Isso implementa no front a regra de compatibilidade Categoria × Tipo.
   */
  const carregarCategoriasPorTipo = useCallback(async (tipo: number) => {
    const data = await categoriasApi.listarPorTipo(tipo);
    setCategorias(data);
    // Reseta a categoria selecionada para forçar nova escolha
    setForm((prev) => ({ ...prev, categoriaId: '' }));
  }, []);

  useEffect(() => {
    carregarTransacoes();
    carregarPessoas();
    carregarCategoriasPorTipo(1); // carrega categorias para Despesa inicialmente
  }, [carregarTransacoes, carregarPessoas, carregarCategoriasPorTipo]);

  // ── Helpers ────────────────────────────────────────────────────────────
  const exibirSucesso = (msg: string) => {
    setSucesso(msg);
    setTimeout(() => setSucesso(''), 3500);
  };

  const pessoaSelecionada = pessoas.find((p) => p.id === form.pessoaId);
  const eMenorDeIdade = pessoaSelecionada && pessoaSelecionada.idade < 18;

  const abrirModal = () => {
    setForm({ descricao: '', valor: 0, tipo: 1, categoriaId: '', pessoaId: '' });
    setErro('');
    carregarCategoriasPorTipo(1);
    setModalAberto(true);
  };

  const fecharModal = () => { setModalAberto(false); setErro(''); };

  // ── Mudança de tipo: recarrega categorias compatíveis ─────────────────
  const handleTipoChange = (novoTipo: number) => {
    setForm((prev) => ({ ...prev, tipo: novoTipo }));
    carregarCategoriasPorTipo(novoTipo);
  };

  // ── Mudança de pessoa: bloqueia tipo se menor de idade ────────────────
  const handlePessoaChange = (pessoaId: string) => {
    const p = pessoas.find((x) => x.id === pessoaId);
    const tipoForcado = p && p.idade < 18 ? 1 : form.tipo; // menor → força Despesa
    setForm((prev) => ({ ...prev, pessoaId, tipo: tipoForcado }));
    if (p && p.idade < 18) carregarCategoriasPorTipo(1);
  };

  // ── Submissão ──────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.descricao.trim()) { setErro('A descrição é obrigatória.'); return; }
    if (form.valor <= 0)        { setErro('O valor deve ser maior que zero.'); return; }
    if (!form.pessoaId)         { setErro('Selecione uma pessoa.'); return; }
    if (!form.categoriaId)      { setErro('Selecione uma categoria.'); return; }

    setSalvando(true);
    setErro('');
    try {
      await transacoesApi.criar(form);
      exibirSucesso('Transação registrada com sucesso!');
      fecharModal();
      carregarTransacoes();
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao registrar transação.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Transações</h1>
          <p className="page-subtitle">Registre receitas e despesas por pessoa</p>
        </div>
        <button className="btn btn-primary" onClick={abrirModal}>＋ Nova Transação</button>
      </div>

      {sucesso && <div className="alert alert-success">✓ {sucesso}</div>}
      {erro && !modalAberto && <div className="alert alert-error">⚠ {erro}</div>}

      <div className="card">
        {loading ? (
          <p style={{ color: '#94a3b8', textAlign: 'center', padding: '32px' }}>Carregando...</p>
        ) : transacoes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💸</div>
            <p>Nenhuma transação registrada ainda.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Tipo</th>
                  <th>Categoria</th>
                  <th>Pessoa</th>
                  <th className="text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {transacoes.map((t) => (
                  <tr key={t.id}>
                    <td>{t.descricao}</td>
                    <td>
                      {t.tipo === 'Receita'
                        ? <span className="badge badge-green">Receita</span>
                        : <span className="badge badge-red">Despesa</span>}
                    </td>
                    <td>{t.categoriaDescricao}</td>
                    <td>{t.pessoaNome}</td>
                    <td className="text-right">
                      <strong style={{ color: t.tipo === 'Receita' ? '#16a34a' : '#dc2626' }}>
                        {t.tipo === 'Receita' ? '+' : '-'} {formatCurrency(t.valor)}
                      </strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de nova transação */}
      {modalAberto && (
        <Modal title="Nova Transação" onClose={fecharModal}>
          {erro && <div className="alert alert-error">⚠ {erro}</div>}

          <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="form-group">
              <label className="form-label">Pessoa *</label>
              <select
                className="form-select"
                value={form.pessoaId}
                onChange={(e) => handlePessoaChange(e.target.value)}
              >
                <option value="">Selecione...</option>
                {pessoas.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome} {p.idade < 18 ? '(menor de idade)' : ''}
                  </option>
                ))}
              </select>
              {eMenorDeIdade && (
                <small style={{ color: '#b45309' }}>
                  ⚠ Menor de idade: apenas despesas são permitidas.
                </small>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Tipo *</label>
              <select
                className="form-select"
                value={form.tipo}
                onChange={(e) => handleTipoChange(Number(e.target.value))}
                disabled={!!eMenorDeIdade} // bloqueia se menor de idade
              >
                <option value={1}>Despesa</option>
                <option value={2} disabled={!!eMenorDeIdade}>Receita</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Categoria *</label>
              <select
                className="form-select"
                value={form.categoriaId}
                onChange={(e) => setForm({ ...form, categoriaId: e.target.value })}
              >
                <option value="">Selecione...</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.descricao}</option>
                ))}
              </select>
              {categorias.length === 0 && (
                <small style={{ color: '#dc2626' }}>
                  Nenhuma categoria compatível. Cadastre uma categoria com finalidade adequada.
                </small>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Descrição *</label>
              <input
                className="form-input"
                maxLength={400}
                placeholder="Ex.: Compras no mercado, Pagamento de salário..."
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Valor (R$) *</label>
              <input
                className="form-input"
                type="number"
                min={0.01}
                step={0.01}
                placeholder="0,00"
                value={form.valor || ''}
                onChange={(e) => setForm({ ...form, valor: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={fecharModal}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={salvando}>
              {salvando ? 'Registrando...' : 'Registrar Transação'}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}