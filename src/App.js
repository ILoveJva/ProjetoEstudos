import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar";
import Inicio from "./pages/inicio";
import Cursos from "./pages/cursos";
import Conta from "./pages/conta";
import Relatorios from "./pages/relatorios";

function App() {
  return (
    <Router>
      <div className="App">
        { /*Nav bar aparece em todas as paginas*/ }
        <Navbar />
        { /*Definicao das rotas*/ }
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/cursos" element={<Cursos />} />
          <Route path="/conta" element={<Conta />} />
          <Route path="/relatorios" element={<Relatorios />} />
        </Routes>

      </div>
    </Router>
  );
}

export default App;
