import './App.css';
import antImage from './assets/ant.png';

function App() {
  return (
    <div className="container">
      <div className="left">
        <img src={antImage} alt="Ant" style={{ maxWidth: '400px', height: 'auto' }} />
      </div>
      <div className="right">
        <h1>Submit Job Application</h1>
        <div>
          <label htmlFor="name">Name: </label>
          <input type="text" id="name" />
        </div>
      </div>
    </div>
  );
}

export default App;
