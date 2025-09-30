import { useEffect, useState } from "react";
import { Map } from "./components/Map";
import type { Rating } from "./components/Location";

interface Institution {
  id: string;
  name: string;
  ratings: Rating[];
}

function App() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/data")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        console.log("API response:", res);
        // Let's see what the actual response body contains
        return res.text(); // Use .text() instead of .json() to see raw content
      })
      .then((rawData) => {
        console.log("Raw response:", rawData);
        console.log("Response type:", typeof rawData);

        // Try to parse as JSON
        try {
          const data = JSON.parse(rawData);
          console.log("Parsed data:", data);
          setInstitutions(data);
        } catch (parseError) {
          console.error("JSON parse error:", parseError);
          console.error("Raw data that failed to parse:", rawData);
        }
      })
      .catch((err) => console.error("Fetch error:", err.message))
      .finally(() => setLoading(false));
  }, []);

  console.log(institutions);

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h2>Loading artwork...</h2>
      </div>
    );
  }

  return <Map institutions={institutions} />;
}

export default App;

/*
// For now, let's create some mock data to test our components
    // Later this will fetch from the actual API
    const mockInstitutions: Institution[] = [
      {
        id: "inst-1",
        name: "Community Center North",
        ratings: [
          { id: "1", rating: 3, timestamp: "2025-09-30T10:00:00Z", institution_id: "inst-1" },
          { id: "2", rating: 5, timestamp: "2025-09-30T10:30:00Z", institution_id: "inst-1" },
          { id: "3", rating: 2, timestamp: "2025-09-30T11:00:00Z", institution_id: "inst-1" },
          { id: "4", rating: 4, timestamp: "2025-09-30T11:30:00Z", institution_id: "inst-1" },
          { id: "5", rating: 1, timestamp: "2025-09-30T12:00:00Z", institution_id: "inst-1" },
          { id: "6", rating: 3, timestamp: "2025-09-30T12:30:00Z", institution_id: "inst-1" },
          { id: "7", rating: 5, timestamp: "2025-09-30T13:00:00Z", institution_id: "inst-1" },
        ]
      },
      {
        id: "inst-2", 
        name: "Healthcare Center East",
        ratings: [
          { id: "8", rating: 4, timestamp: "2025-09-30T09:00:00Z", institution_id: "inst-2" },
          { id: "9", rating: 2, timestamp: "2025-09-30T09:30:00Z", institution_id: "inst-2" },
          { id: "10", rating: 3, timestamp: "2025-09-30T10:00:00Z", institution_id: "inst-2" },
        ]
      },
      {
        id: "inst-3",
        name: "Library South", 
        ratings: [
          { id: "11", rating: 5, timestamp: "2025-09-30T14:00:00Z", institution_id: "inst-3" },
          { id: "12", rating: 5, timestamp: "2025-09-30T14:30:00Z", institution_id: "inst-3" },
          { id: "13", rating: 4, timestamp: "2025-09-30T15:00:00Z", institution_id: "inst-3" },
          { id: "14", rating: 3, timestamp: "2025-09-30T15:30:00Z", institution_id: "inst-3" },
          { id: "15", rating: 4, timestamp: "2025-09-30T16:00:00Z", institution_id: "inst-3" },
        ]
      }
    ]
    
    // Simulate API call delay
    setTimeout(() => {
      setInstitutions(mockInstitutions)
      setLoading(false)
    }, 1000)
    */
