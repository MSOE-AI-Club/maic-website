import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Achievements from './pages/Achievements'
import Points from './pages/Points'
import About from './pages/About'
import Contact from './pages/Contact'
import Merch from './pages/Merch'
import Library from './pages/Library/Library'
import LearningTree from './pages/LearningTree'
import Events from './pages/Events'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/points" element={<Points />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/merch" element={<Merch />} />
          <Route path="/library" element={<Library />} />
          <Route path="/learning-tree" element={<LearningTree />} />
          <Route path="/events" element={<Events />} />
          {/* Add more routes as needed */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
