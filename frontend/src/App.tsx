import './App.css'
import { useState } from 'react';

function App() {
  const [img, setImg] = useState("");
  const [error, setError] = useState("");

  async function getDog() {
    try {
      setError("");
      setImg("");

      const result = await fetch("/api/dog");
      if (result.ok) {
        const data = await result.json();
        setImg(data.imageUrl);
      }
      else {
        setError(("Fetching failed, please try again."));
      }
    } catch (err) {
      setError("Fetching failed, please try again.");
      console.log(err);
    }
  }
  return (
    <>
      <div className='center'>
        <h1> Get your dog picture of the day! </h1>
        <button onClick={getDog} className="">
          <div>Get the picture</div>
        </button>
        <div className='pic'>
          {img && (
            <img src={img} alt="random dog" className="dog" />
          )}
          {error && (
            <p>{error}</p>
          )}
        </div>
      </div>
    </>
  )
}

export default App
