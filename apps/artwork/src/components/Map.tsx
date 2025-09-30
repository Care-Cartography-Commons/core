import { Location } from "./Location";
import type { Rating } from "./Location";

interface Institution {
  id: string;
  name: string;
  ratings: Rating[];
}

interface MapProps {
  institutions: Institution[];
}

export const Map = ({ institutions }: MapProps) => {
  return (
    <div className="map-container">
      <h1>Care Map</h1>
      <div className="institutions-grid">
        {institutions.map((institution) => (
          <div key={institution.id} className="institution-card">
            <Location
              institutionId={institution.id}
              institutionName={institution.name}
              ratings={institution.ratings}
              width={350}
              height={250}
            />
          </div>
        ))}
      </div>
      {institutions.length === 0 && (
        <div className="no-data">
          <p>No institutions with data available yet.</p>
        </div>
      )}
    </div>
  );
};
