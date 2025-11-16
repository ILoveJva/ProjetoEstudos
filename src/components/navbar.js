import { Link } from 'react-router-dom';

function Navbar() {
    return (
        <nav>
            <ul>
                <li><Link to="/">Início</Link></li>
                <li><Link to="/cursos">Cursos</Link></li>
                <li><Link to="/conta">Conta</Link></li>
                <li><Link to="/relatorios">Relatórios</Link></li>
            </ul>
        </nav>
    );
}
export default Navbar;