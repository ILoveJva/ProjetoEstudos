import { useState, useEffect } from 'react';
import './CardMateria.css';

function CardMateria(props) {
    const [expanded, setExpanded] = useState(false);
    const [timerRunning, setTimerRunning] = useState(false);
    const [time, setTime] = useState(0);
    const [totalStudiedTime, setTotalStudiedTime] = useState(0);
    const [showContentModal, setShowContentModal] = useState(false);
    const [studyContent, setStudyContent] = useState('');
    const [tags, setTags] = useState('');
    const [hasStarted, setHasStarted] = useState(false);
    const [showTimer, setShowTimer] = useState(false); // Novo estado para controlar visibilidade do cronômetro

    // Converter tempo string para segundos
    const parseTimeToSeconds = (timeString) => {
        if (!timeString) return 0;
        
        let totalSeconds = 0;
        const hoursMatch = timeString.match(/(\d+)\s*hora/);
        const minutesMatch = timeString.match(/(\d+)\s*min/);
        
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
        if (!timerRunning) {
            setExpanded(!expanded);
            if (expanded) {
                // Se está fechando, reseta tudo
                setTime(0);
                setHasStarted(false);
                setTimerRunning(false);
                setShowTimer(false); // Esconde o cronômetro ao fechar
            }
        }
    };

    const startTimer = () => {
        setTimerRunning(true);
        setHasStarted(true);
        setShowTimer(true); // Mostra o cronômetro ao iniciar
    };

    const pauseTimer = () => {
        setTimerRunning(false);
    };

    const stopTimer = () => {
        setTimerRunning(false);
        
        if (time > 0) {
            setShowContentModal(true);
        } else {
            setTime(0);
            setHasStarted(false);
            setShowTimer(false); // Esconde o cronômetro se tempo for zero
            setExpanded(false);
        }
    };

    const handleSaveWithContent = () => {
        const newTotalTime = totalStudiedTime + time;
        setTotalStudiedTime(newTotalTime);
        
        const timeData = {
            materiaId: props.id,
            materiaNome: props.nome,
            tempoSessao: time,
            tempoTotal: newTotalTime,
            conteudo: studyContent,
            tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
            data: new Date().toISOString()
        };

        saveToDatabase(timeData);
        
        setShowContentModal(false);
        setExpanded(false);
        setTime(0);
        setHasStarted(false);
        setShowTimer(false); // Esconde o cronômetro após salvar
        setStudyContent('');
        setTags('');
    };

    const handleSaveWithoutContent = () => {
        const newTotalTime = totalStudiedTime + time;
        setTotalStudiedTime(newTotalTime);
        
        const timeData = {
            materiaId: props.id,
            materiaNome: props.nome,
            tempoSessao: time,
            tempoTotal: newTotalTime,
            conteudo: '',
            tags: [],
            data: new Date().toISOString()
        };

        saveToDatabase(timeData);
        
        setShowContentModal(false);
        setExpanded(false);
        setTime(0);
        setHasStarted(false);
        setShowTimer(false); // Esconde o cronômetro após salvar
    };

    const handleCancel = () => {
        setShowContentModal(false);
        setExpanded(false);
        setTime(0);
        setHasStarted(false);
        setTimerRunning(false);
        setShowTimer(false); // Esconde o cronômetro ao cancelar
        setStudyContent('');
        setTags('');
    };

    const saveToDatabase = (timeData) => {
        const existingData = JSON.parse(localStorage.getItem(`studyTime_${props.id}`) || '[]');
        const newData = Array.isArray(existingData) ? [...existingData, timeData] : [timeData];
        localStorage.setItem(`studyTime_${props.id}`, JSON.stringify(newData));
        
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

    // Formatar tempo para HH:MM:SS
    const formatTime = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    if (expanded) {
        return (
            <>
                <div className="card-materia-expanded">
                    <div className="expanded-content">
                        <button 
                            className="close-btn" 
                            onClick={toggleExpand}
                            disabled={timerRunning}
                            style={{ 
                                opacity: timerRunning ? 0.5 : 1,
                                cursor: timerRunning ? 'not-allowed' : 'pointer'
                            }}
                        >
                            ×
                        </button>
                        <h2>{props.nome}</h2>
                        <div className="color-indicator" style={{ backgroundColor: props.cor }}></div>
                        
                        <div className="timer-container">
                            {/* Cronômetro só aparece se o usuário iniciou */}
                            {showTimer ? (
                                <>
                                    <div className="timer-display">
                                        {formatTime(time)}
                                    </div>
                                    <div className="timer-controls">
                                        {!timerRunning ? (
                                            <button className="btn-start" onClick={startTimer}>
                                                Continuar
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
                                </>
                            ) : (
                                /* Tela inicial - antes de iniciar */
                                <div className="timer-init-screen">
                                    <div className="init-message">
                                    </div>
                                    <div className="timer-controls">
                                        <button className="btn-start" onClick={startTimer}>
                                            Iniciar Estudo
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="time-info">
                            <p><strong>Tempo total estudado:</strong> {formatSecondsToTime(totalStudiedTime)}</p>
                        </div>

                        {timerRunning}
                    </div>
                </div>

                {/* Modal de Conteúdo Estudado */}
                {showContentModal && (
                    <div className="modal-overlay">
                        <div className="content-modal">
                            <h3>Registrar Conteúdo Estudado</h3>
                            <p>Você estudou <strong>{props.nome}</strong> por <strong>{formatTime(time)}</strong></p>
                            
                            <div className="form-group">
                                <label>O que você estudou?</label>
                                <textarea
                                    value={studyContent}
                                    onChange={(e) => setStudyContent(e.target.value)}
                                    placeholder="Descreva brevemente o conteúdo estudado..."
                                    rows="4"
                                />
                            </div>
                        
                            <div className="modal-buttons">
                                <button 
                                    className="btn-cancel"
                                    onClick={handleCancel}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    className="btn-save-without"
                                    onClick={handleSaveWithoutContent}
                                >
                                    Salvar Sem Conteúdo
                                </button>
                                <button 
                                    className="btn-save-with"
                                    onClick={handleSaveWithContent}
                                    disabled={!studyContent.trim()}
                                >
                                    Salvar com Conteúdo
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    }

    return (
        <div className="card-materia" onClick={toggleExpand}>
            <h3>{props.nome}</h3>
            <div className="card-materia-cor">
                <span style={{ backgroundColor: props.cor }}></span>
            </div>
            <p>{formatSecondsToTime(totalStudiedTime)}</p>
        </div>
    );
}

export default CardMateria;