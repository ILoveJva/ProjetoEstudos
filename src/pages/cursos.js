import CardMateria from '../components/CardMateria';
import { coursesData as materias } from '../data/cousersData';

function Cursos() {
    const cardsMaterias = [];

    // Usando for para criar todos os cards
    for (let i = 0; i < materias.length; i++) {
        const materia = materias[i];
        cardsMaterias.push(
            <CardMateria
                key={materia.id}
                nome={materia.nome}
                cor={materia.cor}
                tempoestudado={materia.tempoestudado}
            />
        );
    }
    return (
        <div>
            <h1>Cursos</h1>
            <p>Página de Cursos</p>
            <div className='conteiner'>
                {cardsMaterias}
            </div>
            
        </div>
    );
}

export default Cursos;