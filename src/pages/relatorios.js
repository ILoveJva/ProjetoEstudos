import { useState, useEffect } from 'react';
import './relatorios.css';

// IMPORTS: ajuste os paths para os seus arquivos
import {studyData}  from '../data/studyData'; 
import { coursesData } from '../data/coursesData'; 

/*
Estrutura esperada:
coursesData = [{ id: 1, nome: "Matemática", cor: "#ff0000" }, ...]
studySessions = [{ materiaId: 1, data: "2025-11-16T10:00:00", tempoSessao: 3600, conteudo: "Revisão" }, ...]
*/

function Relatorios() {
  // renomeei o state para evitar colisão com import nomeado anteriormente
  const [study, setStudy] = useState([]);
  const [selectedMateria, setSelectedMateria] = useState('all');
  const [dateRange, setDateRange] = useState('week');

  useEffect(() => {
    // Monta os dados combinando coursesData com studySessions
const loadedData = coursesData.map(materia => {
  // procurar a matéria correspondente no arquivo studyData
  const materiaOriginal = studyData.studyData.find(m => Number(m.id) === Number(materia.id));

  const sessoesMateria = materiaOriginal
    ? materiaOriginal.sessoes.map(sessao => ({
        data: sessao.data,
        tempo: Number(sessao.tempo),
        conteudo: sessao.conteudo || '',
        tags: sessao.tags || []
      }))
    : [];

  const tempoTotal = sessoesMateria.reduce((t, s) => t + s.tempo, 0);

  return {
    ...materia,
    tempoTotal,
    sessoes: sessoesMateria
  };
});


    setStudy(loadedData);
  }, []); // roda uma vez ao montar

  // Converte segundos para string legível
  const formatTime = (seconds) => {
    const sec = Number(seconds) || 0;
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);

    if (hours > 0 && minutes > 0) return `${hours}h ${minutes}min`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}min`;
    return "0min";
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    } catch {
      return dateString;
    }
  };
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const dados = payload[0].payload;

    return (
      <div style={{
        background: "#fff",
        padding: "10px",
        border: "1px solid #ccc",
        borderRadius: "8px"
      }}>
        <p><strong>Data:</strong> {label}</p>
        <p><strong>Matéria:</strong> {dados.materia}</p>
        <p><strong>Tempo estudado:</strong> {dados.tempo} min</p>
        <p><strong>Conteúdo:</strong> {dados.conteudo || "—"}</p>
      </div>
    );
  }
  return null;
};

  // Agrupar sessões por data (aplica filtro de matéria)
  const getSessoesAgrupadas = () => {
    const todasSessoes = study.flatMap(materia =>
      (materia.sessoes || []).map(sessao => ({
        ...sessao,
        materiaId: materia.id,
        materiaNome: materia.nome,
        materiaCor: materia.cor
      }))
    );

    const sessoesFiltradas = selectedMateria === 'all'
      ? todasSessoes
      : todasSessoes.filter(sessao => Number(sessao.materiaId) === Number(selectedMateria));

    const agrupadasPorData = {};
    sessoesFiltradas.forEach(sessao => {
      // tenta normalizar a data (YYYY-MM-DD)
      const iso = new Date(sessao.data).toISOString();
      const dataKey = iso ? iso.split('T')[0] : String(sessao.data).split('T')[0];
      if (!agrupadasPorData[dataKey]) agrupadasPorData[dataKey] = [];
      agrupadasPorData[dataKey].push(sessao);
    });

    return agrupadasPorData;
  };

  const getTotaisPorMateria = () => {
    return study.map(materia => ({
      ...materia,
      tempoTotal: (materia.sessoes || []).reduce((total, sessao) => total + (sessao.tempo || 0), 0)
    }));
  };

  const sessoesAgrupadas = getSessoesAgrupadas();
  const totaisPorMateria = getTotaisPorMateria();
  const datas = Object.keys(sessoesAgrupadas).sort();

  // calcula máximo com segurança (evita -Infinity)
  const temposPorDia = Object.values(sessoesAgrupadas).map(sessoes =>
    sessoes.reduce((total, sessao) => total + (sessao.tempo || 0), 0)
  );
  const maxTempoPorDia = temposPorDia.length > 0 ? Math.max(...temposPorDia) : 0;
  const maxBarHeight = 200;

  // Opcional: se quiser mostrar a UI mesmo sem dados, com mensagem informativa
  if (!study || study.length === 0) {
    return (
      <div className="reports-page">
        <h1>Relatórios de Estudo</h1>
        <p>Carregando dados... (verifique se o arquivo JSON está no caminho correto)</p>
      </div>
    );
  }

  return (
    <div className="reports-page">
      <h1>Relatórios de Estudo</h1>

      <div className="filters">
        <div className="filter-group">
          <label>Matéria:</label>
          <select value={selectedMateria} onChange={(e) => setSelectedMateria(e.target.value)}>
            <option value="all">Todas as Matérias</option>
            {study.map(materia => (
              <option key={materia.id} value={materia.id}>{materia.nome}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="chart-section">
        <h2>Tempo de Estudo por Data</h2>
        <div className="time-chart">
          {datas.length === 0 ? (
            <p>Nenhuma sessão para o filtro selecionado.</p>
          ) : (
            datas.map(data => {
              const sessoesDoDia = sessoesAgrupadas[data];
              const tempoTotalDia = sessoesDoDia.reduce((total, sessao) => total + (sessao.tempo || 0), 0);
              const barHeight = maxTempoPorDia > 0 ? (tempoTotalDia / maxTempoPorDia) * maxBarHeight : 0;

              return (
                <div key={data} className="chart-day">
                  <div className="day-bar">
                    <div className="bar-total" style={{ height: `${barHeight}px` }} title={`${formatTime(tempoTotalDia)} em ${formatDate(data)}`}>
                      {sessoesDoDia.map((sessao, index) => {
                        const sessaoHeight = tempoTotalDia > 0 ? (sessao.tempo / tempoTotalDia) * barHeight : 0;
                        return (
                          <div key={index} className="bar-sessao" style={{ height: `${sessaoHeight}px`, backgroundColor: sessao.materiaCor }} title={`${sessao.materiaNome}: ${formatTime(sessao.tempo)} - ${sessao.conteudo || 'Sem descrição'}`}/>
                        );
                      })}
                    </div>
                  </div>
                  <div className="day-label">{formatDate(data)}</div>
                  <div className="day-total">{formatTime(tempoTotalDia)}</div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="materias-breakdown">
        <h2>Detalhamento por Matéria</h2>
        <div className="materias-list">
          {totaisPorMateria.map(materia => (
            <div key={materia.id} className="materia-item">
              <div className="materia-header">
                <div className="materia-color" style={{ backgroundColor: materia.cor }} />
                <span className="materia-name">{materia.nome}</span>
                <span className="materia-total">{formatTime(materia.tempoTotal)}</span>
              </div>
              <div className="materia-sessoes">
                {materia.sessoes && materia.sessoes.length > 0 ? (
                  materia.sessoes.map((sessao, index) => (
                    <div key={index} className="sessao-item">
                      <span className="sessao-date">{formatDate(sessao.data)}</span>
                      <span className="sessao-time">{formatTime(sessao.tempo)}</span>
                      <span className="sessao-content">{sessao.conteudo || 'Sem descrição'}</span>
                    </div>
                  ))
                ) : (
                  <p className="no-sessoes">Nenhuma sessão registrada</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="stats-summary">
        <h2>Resumo Geral</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total de Sessões</h3>
            <p>{study.reduce((total, materia) => total + (materia.sessoes ? materia.sessoes.length : 0), 0)}</p>
          </div>
          <div className="stat-card">
            <h3>Tempo Total Estudado</h3>
            <p>{formatTime(totaisPorMateria.reduce((total, materia) => total + materia.tempoTotal, 0))}</p>
          </div>
          <div className="stat-card">
            <h3>Matéria com Mais Tempo</h3>
            <p>
              {
                totaisPorMateria.length
                  ? totaisPorMateria.reduce((max, materia) => materia.tempoTotal > (max.tempoTotal || 0) ? materia : max, totaisPorMateria[0]).nome
                  : '-'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Relatorios;
