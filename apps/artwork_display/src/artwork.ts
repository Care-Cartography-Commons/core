import paper from 'paper';

let isInitialized = false;
const dotPositions: { x: number; y: number }[] = [];

export function drawArtwork(id: string): void {
  if (isInitialized) return;
  
  const canvas = document.getElementById(id) as HTMLCanvasElement;
  paper.setup(canvas);
  isInitialized = true;
}

export function updateArtwork(data: any[]): void {
  if (!isInitialized) return;
  
  // Clear existing artwork
  paper.project.clear();
  
  // Get the first (and only) institution
  const institution = data[0];
  if (!institution || !institution.ratings) return;
  
  const ratings = institution.ratings;
  const centerX = paper.view.center.x;
  const centerY = paper.view.center.y;
  
  // Define the area where dots can be placed (middle 60% of canvas)
  const areaWidth = paper.view.size.width * 0.6;
  const areaHeight = paper.view.size.height * 0.6;
  
  // Generate new positions only if we have more ratings than stored positions
  while (dotPositions.length < ratings.length) {
    const randomX = centerX + (Math.random() - 0.5) * areaWidth;
    const randomY = centerY + (Math.random() - 0.5) * areaHeight;
    dotPositions.push({ x: randomX, y: randomY });
  }
  
  ratings.forEach((rating: number, index: number) => {
    // Calculate radius based on rating
    let radius: number;
    switch (rating) {
      case 1:
        radius = 3;
        break;
      case 2:
        radius = 6;
        break;
      case 3:
        radius = 10;
        break;
      default:
        radius = 5; // fallback
    }
    
    // Use stored position for this dot
    const position = dotPositions[index];
    
    // Create circle for this rating
    new paper.Path.Circle({
      center: new paper.Point(position.x, position.y),
      radius: radius,
      fillColor: new paper.Color(0, 0.8, 0, 0.5),
      strokeColor: 'black',
      strokeWidth: 0
    });
  });
}

