import './App.css';
import antImage from './assets/ant.png';

function App() {
  return (
    <>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <img src={antImage} alt="Ant" style={{ maxWidth: '200px', height: 'auto' }} />
      </div>
      <h1>Submit Job Application</h1>
      <div>
        <label htmlFor="name">Name: </label>
        <input type="text" id="name" />
      </div>
    </>
  );
}

export default App;
