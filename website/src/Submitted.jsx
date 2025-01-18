import React from 'react';
import { useNavigate } from 'react-router-dom';

function Submitted() {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate('/application');
  };

  return (
    <div className="container">
      <div className="submitted-container">
        <h1>Application Submitted!</h1>
        <button onClick={handleEdit} className="edit-button">
          Edit Response
        </button>
      </div>
    </div>
  );
}

export default Submitted;
