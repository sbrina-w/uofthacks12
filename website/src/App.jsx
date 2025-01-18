import './App.css';
import antImage from './assets/ant.png';

function App() {
  return (
    <div className="container">
      <div className="left">
        <img src={antImage} alt="Ant" className="ant-image" />
      </div>
      <div className="right">
        <h1>Submit Job Application</h1>
        <form className="application-form">
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

export default App;
