import { useState } from "react";

interface Rating {
  institution: string;
  rating: number;
}

interface ApiResponse {
  status?: string;
  error?: string;
}

function App(): React.ReactElement {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");

  const options = [3, 2, 1];

  async function handleOptionSelect(
    event: React.MouseEvent<HTMLButtonElement>,
  ) {
    const rating = Number(event.currentTarget.textContent);
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/ratings/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          institution: "inst1", // You'll want to make this dynamic
          rating: rating,
        } as Rating),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      if (data.error) {
        setMessage(`Error: ${data.error}`);
      } else {
        setMessage(data.status || "Rating submitted successfully!");
      }
    } catch (error) {
      setMessage(
        `Failed to submit: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h3>
        Velkommen til omsorgskortet! Vælg en af valgmulighederne herunder.
      </h3>
      <div className="options">
        {options.map((option) => (
          <button key={option} onClick={handleOptionSelect} disabled={loading}>
            {option}
          </button>
        ))}
      </div>
      {loading && <p>Submitting...</p>}
      {message && <p>{message}</p>}
    </>
  );
}

export default App;
