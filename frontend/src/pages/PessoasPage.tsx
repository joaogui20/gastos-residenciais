import { useState, useEffect, useCallback } from 'react';
import { pessoasApi } from '../api/pessoas';
import type { Pessoa, PessoaRequest } from '../types';
import Modal from '../components/Modal';

/**
 * Página de gerenciamento de Pessoas.
 * Funcionalidades: listar, criar, editar e deletar.
 *
 * Ao deletar uma pessoa, o back-end remove todas as suas transações
 * automaticamente via cascade — isso é comunicado ao usuário na confirmação.
 */
export default function PessoasPage() {
  const [pessoas, setPessoas]       = useState<Pessoa[]>([]);
  const [loading, setLoading]       = useState(true);
  const [erro, setErro]             = useState('');
  const [sucesso, setSucesso]       = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando]     = useState<Pessoa | null>(null);
  const [form, setForm]             = useState<PessoaRequest>({ nome: '', idade: 0 });
  const [salvando, setSalvando]     = useState(false);

  // ── Carregamento inicial ───────────────────────────────────────────────
  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      const data = await pessoasApi.listar();
      setPessoas(data);
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao carregar pessoas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  // ── Helpers de feedback ────────────────────────────────────────────────
  const exibirSucesso = (msg: string) => {
    setSucesso(msg);
    setTimeout(() => setSucesso(''), 3500);
  };

  // ── Abrir modal para criar ou editar ──────────────────────────────────
  const abrirCriar = () => {
    setEditando(null);
    setForm({ nome: '', idade: 0 });
    setErro('');
    setModalAberto(true);
  };

  const abrirEditar = (p: Pessoa) => {
    setEditando(p);
    setForm({ nome: p.nome, idade: p.idade });
    setErro('');
    setModalAberto(true);
  };

  const fecharModal = () => { setModalAberto(false); setErro(''); };

  // ── Submissão do formulário (criar ou editar) ──────────────────────────
  const handleSubmit = async () => {
    if (!form.nome.trim()) { setErro('O nome é obrigatório.'); return; }
    if (form.idade <= 0 || form.idade > 150) { setErro('Idade inválida.'); return; }

    setSalvando(true);
    setErro('');
    try {
      if (editando) {
        await pessoasApi.atualizar(editando.id, form);
        exibirSucesso('Pessoa atualizada com sucesso!');
      } else {
        await pessoasApi.criar(form);
        exibirSucesso('Pessoa cadastrada com sucesso!');
      }
      fecharModal();
      carregar();
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao salvar.');
    } finally {
      setSalvando(false);
    }
  };

  // ── Exclusão ───────────────────────────────────────────────────────────
  const handleDeletar = async (pessoa: Pessoa) => {
    const confirmado = window.confirm(
      `Deseja excluir "${pessoa.nome}"?\n\nATENÇÃO: todas as transações desta pessoa também serão excluídas.`
    );
    if (!confirmado) return;

    try {
      await pessoasApi.deletar(pessoa.id);
      exibirSucesso(`"${pessoa.nome}" excluído(a) com sucesso.`);
      carregar();
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao excluir.');
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Pessoas</h1>
          <p className="page-subtitle">Gerencie as pessoas do controle de gastos</p>
        </div>
        <button className="btn btn-primary" onClick={abrirCriar}>
          ＋ Nova Pessoa
        </button>
      </div>

      {sucesso && <div className="alert alert-success">✓ {sucesso}</div>}
      {erro && !modalAberto && <div className="alert alert-error">⚠ {erro}</div>}

      <div className="card">
        {loading ? (
          <p style={{ color: '#94a3b8', textAlign: 'center', padding: '32px' }}>Carregando...</p>
        ) : pessoas.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👤</div>
            <p>Nenhuma pessoa cadastrada ainda.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Idade</th>
                  <th>Perfil</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {pessoas.map((p) => (
                  <tr key={p.id}>
                    <td><strong>{p.nome}</strong></td>
                    <td>{p.idade} anos</td>
                    <td>
                      {p.idade < 18
                        ? <span className="badge badge-red">Menor de idade</span>
                        : <span className="badge badge-green">Maior de idade</span>}
                    </td>
                    <td>
                      <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => abrirEditar(p)}>
                          ✏ Editar
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeletar(p)}>
                          🗑 Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de criação/edição */}
      {modalAberto && (
        <Modal title={editando ? 'Editar Pessoa' : 'Nova Pessoa'} onClose={fecharModal}>
          {erro && <div className="alert alert-error">⚠ {erro}</div>}

          <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="form-group">
              <label className="form-label">Nome *</label>
              <input
                className="form-input"
                maxLength={200}
                placeholder="Nome completo"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Idade *</label>
              <input
                className="form-input"
                type="number"
                min={0}
                max={150}
                value={form.idade}
                onChange={(e) => setForm({ ...form, idade: Number(e.target.value) })}
              />
              {form.idade < 18 && form.idade >= 0 && (
                <small style={{ color: '#b45309', fontSize: '0.78rem' }}>
                  ⚠ Menor de idade: só poderá registrar despesas.
                </small>
              )}
            </div>
          </div>

          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={fecharModal}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={salvando}>
              {salvando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Cadastrar'}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}