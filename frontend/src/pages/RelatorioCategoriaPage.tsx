import { useState, useEffect, useCallback } from 'react';
import { relatoriosApi } from '../api/transacoes';
import type { RelatorioCategoriaResponse } from '../types';
import { formatCurrency, saldoColor } from '../utils/format';

/**
 * Página de relatório financeiro consolidado por Categoria (funcionalidade opcional).
 *
 * Exibe:
 *   - Para cada categoria: total de receitas, total de despesas e saldo.
 *   - Ao final: totais gerais de todas as categorias.
 *
 * Categorias sem transações aparecem com valores zerados.
 */
export default function RelatorioCategoriaPage() {
  const [relatorio, setRelatorio] = useState<RelatorioCategoriaResponse | null>(null);
  const [loading, setLoading]     = useState(true);
  const [erro, setErro]           = useState('');

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      const data = await relatoriosApi.porCategoria();
      setRelatorio(data);
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao carregar relatório.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  // Badge visual por finalidade da categoria
  const finalidadeBadge = (f: string) => {
    if (f === 'Despesa') return <span className="badge badge-red">{f}</span>;
    if (f === 'Receita') return <span className="badge badge-green">{f}</span>;
    return <span className="badge badge-blue">Ambas</span>;
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Totais por Categoria</h1>
          <p className="page-subtitle">Resumo financeiro consolidado por categoria</p>
        </div>
        <button className="btn btn-ghost" onClick={carregar}>↻ Atualizar</button>
      </div>

      {erro && <div className="alert alert-error">⚠ {erro}</div>}

      {relatorio && (
        <div className="stats-grid">
          <div className="stat-card">
            <p className="stat-label">Total de Receitas</p>
            <p className="stat-value text-green">{formatCurrency(relatorio.totalGeralReceitas)}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Total de Despesas</p>
            <p className="stat-value text-red">{formatCurrency(relatorio.totalGeralDespesas)}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Saldo Líquido</p>
            <p className="stat-value" style={{ color: saldoColor(relatorio.saldoLiquido) }}>
              {formatCurrency(relatorio.saldoLiquido)}
            </p>
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="card-title">Detalhamento por Categoria</h2>

        {loading ? (
          <p style={{ color: '#94a3b8', textAlign: 'center', padding: '32px' }}>Carregando...</p>
        ) : !relatorio || relatorio.categorias.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏷️</div>
            <p>Nenhuma categoria cadastrada para exibir relatório.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Categoria</th>
                  <th>Finalidade</th>
                  <th className="text-right">Receitas</th>
                  <th className="text-right">Despesas</th>
                  <th className="text-right">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {relatorio.categorias.map((c) => (
                  <tr key={c.categoriaId}>
                    <td><strong>{c.categoriaDescricao}</strong></td>
                    <td>{finalidadeBadge(c.finalidadeDescricao)}</td>
                    <td className="text-right text-green">{formatCurrency(c.totalReceitas)}</td>
                    <td className="text-right text-red">{formatCurrency(c.totalDespesas)}</td>
                    <td className="text-right">
                      <strong style={{ color: saldoColor(c.saldo) }}>
                        {formatCurrency(c.saldo)}
                      </strong>
                    </td>
                  </tr>
                ))}

                {/* Linha de totais gerais */}
                <tr className="total-row">
                  <td colSpan={2}>TOTAL GERAL</td>
                  <td className="text-right text-green">
                    {formatCurrency(relatorio.totalGeralReceitas)}
                  </td>
                  <td className="text-right text-red">
                    {formatCurrency(relatorio.totalGeralDespesas)}
                  </td>
                  <td className="text-right">
                    <strong style={{ color: saldoColor(relatorio.saldoLiquido) }}>
                      {formatCurrency(relatorio.saldoLiquido)}
                    </strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}