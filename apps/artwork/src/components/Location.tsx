import { useEffect, useRef } from "react";
import p5 from "p5";

export interface Rating {
  id: string;
  rating: number;
  timestamp: string;
  institution_id: string;
}

interface LocationProps {
  institutionId: string;
  institutionName?: string;
  ratings: Rating[];
  width?: number;
  height?: number;
}

export const Location = ({
  institutionId,
  institutionName,
  ratings,
  width = 400,
  height = 300,
}: LocationProps) => {
  const sketchRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);

  useEffect(() => {
    if (!sketchRef.current) return;

    const sketch = (p: p5) => {
      p.setup = () => {
        p.createCanvas(width, height);
        console.log("Drawing ratings:", ratings);
      };

      p.draw = () => {
        // Draw dots for each rating
        const padding = 40;
        const drawAreaWidth = width - padding * 2;
        const startY = institutionName ? 50 : padding;

        ratings.forEach((rating, index) => {
          // Calculate position based on index and available space
          const dotsPerRow = Math.floor(drawAreaWidth / 20); // 20px spacing between dots
          const row = Math.floor(index / dotsPerRow);
          const col = index % dotsPerRow;

          const x = padding + col * 20 + 10; // 10px dot radius + 10px spacing
          const y = startY + row * 20 + 10;

          // Skip if we're outside the drawable area
          if (y > height - padding) return;

          // Color mapping: 1=red, 2=yellow, 3=green, 4=blue, 5=purple
          let color: [number, number, number];
          switch (rating) {
            case 1:
              color = [255, 0, 0]; // Red
              break;
            case 2:
              color = [255, 255, 0]; // Yellow
              break;
            case 3:
              color = [0, 255, 0]; // Green
              break;
            default:
              color = [128, 128, 128]; // Gray for invalid ratings
          }

          p.fill(color[0], color[1], color[2]);
          p.noStroke();
          p.circle(x, y, 10);
        });

        /*
        // Draw legend
        const legendY = height - 30;
        const legendStartX = padding;

        p.textAlign(p.LEFT, p.CENTER);
        p.textSize(12);
        p.fill(0);
        p.text("Ratings:", legendStartX, legendY);
        const legendColors = [
          { rating: 1, color: [255, 0, 0], label: "1" },
          { rating: 2, color: [255, 255, 0], label: "2" },
          { rating: 3, color: [0, 255, 0], label: "3" },
          { rating: 4, color: [0, 0, 255], label: "4" },
          { rating: 5, color: [128, 0, 128], label: "5" },
        ];

        legendColors.forEach((item, index) => {
          const x = legendStartX + 60 + index * 30;
          p.fill(item.color[0], item.color[1], item.color[2]);
          p.circle(x, legendY, 8);
          p.fill(0);
          p.text(item.label, x + 10, legendY);
        });*/
      };
    };

    // Create new p5 instance
    p5InstanceRef.current = new p5(sketch, sketchRef.current);

    // Cleanup function
    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
    };
  }, [ratings, width, height, institutionName]);

  return (
    <div className="location-container">
      <h3>{institutionName || "Institution"}</h3>
      <div ref={sketchRef} />
      <div className="location-info">
        <p>Id: {institutionId}</p>
        <p>Total ratings: {ratings.length}</p>
      </div>
    </div>
  );
};
