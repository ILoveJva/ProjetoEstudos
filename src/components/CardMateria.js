import { useState, useEffect } from 'react';
import './CardMateria.css';

function CardMateria(props) {
    const [expanded, setExpanded] = useState(false);
    const [timerRunning, setTimerRunning] = useState(false);
    const [time, setTime] = useState(0); // tempo em segundos da sessão atual
    const [totalStudiedTime, setTotalStudiedTime] = useState(0); // tempo total estudado

    // Converter tempo do formato "2 horas" para segundos
    const parseTimeToSeconds = (timeString) => {
        if (!timeString) return 0;
        
        const hoursMatch = timeString.match(/(\d+)\s*hora/);
        const minutesMatch = timeString.match(/(\d+)\s*min/);
        
        let totalSeconds = 0;
        if (hoursMatch) totalSeconds += parseInt(hoursMatch[1]) * 3600;
        if (minutesMatch) totalSeconds += parseInt(minutesMatch[1]) * 60;
        
        return totalSeconds;
    };

    // Converter segundos para formato legível
    const formatSecondsToTime = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        
        if (hours > 0 && minutes > 0) {
            return `${hours} hora${hours > 1 ? 's' : ''} ${minutes} min`;
        } else if (hours > 0) {
            return `${hours} hora${hours > 1 ? 's' : ''}`;
        } else {
            return `${minutes} min`;
        }
    };

    // Inicializar o tempo total estudado
    useEffect(() => {
        const initialTime = parseTimeToSeconds(props.tempoestudado);
        setTotalStudiedTime(initialTime);
    }, [props.tempoestudado]);

    const toggleExpand = () => {
        setExpanded(!expanded);
    };

    const startTimer = () => {
        setTimerRunning(true);
    };

    const pauseTimer = () => {
        setTimerRunning(false);
    };

    const stopTimer = () => {
        setTimerRunning(false);
        
        // Quando para, soma o tempo da sessão ao tempo total
        const newTotalTime = totalStudiedTime + time;
        setTotalStudiedTime(newTotalTime);
        
        // Prepara para enviar ao BD
        const timeData = {
            materiaId: props.id,
            materiaNome: props.nome,
            tempoSessao: time, // tempo da sessão atual em segundos
            tempoTotal: newTotalTime, // tempo total acumulado em segundos
            tempoTotalFormatado: formatSecondsToTime(newTotalTime), // formato legível
            data: new Date().toISOString()
        };
        
        // Aqui você enviaria para o BD
        console.log('Dados para salvar no BD:', timeData);
        
        // Simulação de salvamento - substitua por API call real
        saveToDatabase(timeData);
        
        // Reseta o cronômetro da sessão
        setTime(0);
    };

    // Simulação de salvamento no BD
    const saveToDatabase = (timeData) => {
        // EXEMPLO de como seria a chamada API:
        /*
        fetch('/api/study-time', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(timeData)
        });
        */
        
        // Por enquanto, só logamos e atualizamos o localStorage
        
        // Se tiver callback do parent, chama para atualizar
        if (props.onTimeUpdate) {
            props.onTimeUpdate(timeData);
        }
    };

    // Efeito para o cronômetro
    useEffect(() => {
        let interval;
        if (timerRunning) {
            interval = setInterval(() => {
                setTime(prevTime => prevTime + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timerRunning]);

    // Formatar tempo para HH:MM:SS (cronômetro)
    const formatTime = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    if (expanded) {
        return (
            <div className="card-materia-expanded">
                <div className="expanded-content">
                    <button className="close-btn" onClick={toggleExpand}>×</button>
                    <h2>{props.nome}</h2>
                    <div className="color-indicator" style={{ backgroundColor: props.cor }}></div>
                    
                    <div className="timer-container">
                        <div className="timer-display">
                            {formatTime(time)}
                        </div>
                        <div className="timer-controls">
                            {!timerRunning ? (
                                <button className="btn-start" onClick={startTimer}>
                                    Iniciar
                                </button>
                            ) : (
                                <button className="btn-pause" onClick={pauseTimer}>
                                    Pausar
                                </button>
                            )}
                            <button className="btn-stop" onClick={stopTimer}>
                                Parar e Salvar
                            </button>
                        </div>
                    </div>
                    
                    <div className="time-info">
                        <p><strong>Tempo desta sessão:</strong> {formatTime(time)}</p>
                        <p><strong>Tempo total estudado:</strong> {formatSecondsToTime(totalStudiedTime)}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="card-materia" onClick={toggleExpand}>
            <h3>{props.nome}</h3>
            <div className="card-materia-cor">
                <span style={{ backgroundColor: props.cor }}></span>
            </div>
            <p>{formatSecondsToTime(totalStudiedTime)}</p>
            <p>Relatorios &DownArrow;</p>
        </div>
    );
}

export default CardMateria;