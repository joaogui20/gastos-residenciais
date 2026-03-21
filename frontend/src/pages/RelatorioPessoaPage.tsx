import { useState, useEffect, useCallback } from 'react';
import { relatoriosApi } from '../api/transacoes';
import type { RelatorioPessoaResponse } from '../types';
import { formatCurrency, saldoColor } from '../utils/format';

/**
 * Página de relatório financeiro consolidado por Pessoa.
 *
 * Exibe:
 *   - Para cada pessoa: total de receitas, total de despesas e saldo individual.
 *   - Ao final: totais gerais de todas as pessoas (receitas, despesas, saldo líquido).
 *
 * Pessoas sem transações aparecem com valores zerados (left join no back-end).
 */
export default function RelatorioPessoaPage() {
    const [relatorio, setRelatorio] = useState<RelatorioPessoaResponse | null>(null);
    const [loading, setLoading]     = useState(true);
    const [erro, setErro]           = useState('');

    const carregar = useCallback(async () => {
        try {
            setLoading(true);
            const data = await relatoriosApi.porPessoa();
            setRelatorio(data);
        } catch (e:unknown) {
            setErro(e instanceof Error ? e.message : 'Erro ao carregar relatório');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { carregar(); }, [carregar]);

    return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Totais por Pessoa</h1>
          <p className="page-subtitle">Resumo financeiro consolidado por pessoa cadastrada</p>
        </div>
        <button className="btn btn-ghost" onClick={carregar}>↻ Atualizar</button>
      </div>

      {erro && <div className="alert alert-error">⚠ {erro}</div>}

      {/* Cards de totais gerais */}
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
        <h2 className="card-title">Detalhamento por Pessoa</h2>

        {loading ? (
          <p style={{ color: '#94a3b8', textAlign: 'center', padding: '32px' }}>Carregando...</p>
        ) : !relatorio || relatorio.pessoas.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <p>Nenhuma pessoa cadastrada para exibir relatório.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Pessoa</th>
                  <th>Idade</th>
                  <th className="text-right">Receitas</th>
                  <th className="text-right">Despesas</th>
                  <th className="text-right">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {relatorio.pessoas.map((p) => (
                  <tr key={p.pessoaId}>
                    <td><strong>{p.pessoaNome}</strong></td>
                    <td>
                      {p.pessoaIdade} anos{' '}
                      {p.pessoaIdade < 18 && <span className="badge badge-red" style={{ fontSize: '0.7rem' }}>menor</span>}
                    </td>
                    <td className="text-right text-green">{formatCurrency(p.totalReceitas)}</td>
                    <td className="text-right text-red">{formatCurrency(p.totalDespesas)}</td>
                    <td className="text-right">
                      <strong style={{ color: saldoColor(p.saldo) }}>
                        {formatCurrency(p.saldo)}
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