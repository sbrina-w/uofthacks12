import './App.css';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import antImage from './assets/ant.png';
import Submitted from './Submitted';

function Application() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/submitted');
  };

  return (
    <div className="container">
      <div className="left">
        <img src={antImage} alt="Ant" className="ant-image" />
      </div>
      <div className="right">
        <h1>Submit Job Application</h1>
        <form className="application-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name: </label>
            <input type="text" id="name" placeholder="Enter your name" />
          </div>
          <div className="form-group">
            <label htmlFor="resume">Resume: </label>
            <input type="file" id="resume" accept=".pdf,.doc,.docx" />
          </div>
          <button type="submit" className="submit-button">Submit</button>
        </form>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Application />} />
        <Route path="/submitted" element={<Submitted />} />
      </Routes>
    </Router>
  );
}

export default App;
