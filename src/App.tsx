import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ExampleNavigator from './pages/ExampleNavigator'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<ExampleNavigator />} />
          {/* Add more routes as needed */}
        </Routes>
      </div>
    </Router>
  )
}

export default App
