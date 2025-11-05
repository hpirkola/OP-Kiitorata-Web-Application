import './App.css'
import { useState } from 'react';
import type { DogResponse, ErrorResponse } from '../../shared/apiTypes'

function App() {
  const [img, setImg] = useState<string>("");
  const [error, setError] = useState<string>("");

  async function fetchDog(): Promise<DogResponse> {

    const result = await fetch("/api/dog/image");
    if (!result.ok) {
      const err: ErrorResponse = await result.json();
      setError("Fetching failed, please try again.");
      throw new Error(err.error);
    }
    return result.json() as Promise<DogResponse>;
  }

  const getDog = async (): Promise<void> => {
    setImg("");
    setError("");
    try {
      const data = await fetchDog();
      setImg(data.imageUrl);
    } catch (err: unknown) {
      console.log("Fetching failed, please try again.");
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
