import './App.css'
import { useState } from 'react';
import type { DogResponse, ErrorResponse } from '../../shared/apiTypes'

/************************************************************************
* Simple React UI that fetches and displays a random dog image.         *
* Handles loading state, errors, and displays the image when available. *
************************************************************************/
function App() {
  const [img, setImg] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  async function fetchDog(): Promise<DogResponse> {

    const endpoint = "/api/dog/image";

    const result = await fetch(endpoint).catch(() => {
      throw new Error("Network error while contacting the Dog API.");
    });

    if (!result.ok) {
      const err: ErrorResponse = await result.json();
      throw new Error(err.error);
    }
    return result.json() as Promise<DogResponse>;
  }

  const getDog = async (): Promise<void> => {
    setImg("");
    setError("");
    setLoading(true);
    try {
      const data = await fetchDog();
      setImg(data.imageUrl);
    } catch (err: any) {
      setError(err.message || "Fetching failed, please try again.");
      setLoading(false);
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
          {loading && (
            <div className="spinner" role="status" aria-label="Loading image…" />
          )}
          {img && (
            <img src={img} alt="random dog" className="dog" onLoad={() => setLoading(false)} onError={() => { setLoading(false); setError("Image failed to load, please try again.")}} />
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
