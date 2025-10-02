import './style.css'
import { drawArtwork, updateArtwork } from './artwork.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <h1>Care Map</h1>
  <canvas id="artwork" resize></canvas>
  <p id="info">...loading</p>
`

drawArtwork('artwork');

const socket = new WebSocket('ws://localhost:8000/api/data/ws');

// Connection opened
socket.addEventListener("open", (e) => {
  console.log("WebSocket is open now.");
});

// Listen for messages
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  console.log("Message from server: ", message);
  
  if (message.type === "initial_data" || message.type === "data_update") {
    updateArtwork(message.data);
    
    // Update info text
    const institution = message.data[0];
    const ratingCount = institution?.ratings?.length || 0;
    document.querySelector('#info')!.textContent = 
      `${institution?.name || 'Unknown'}: ${ratingCount} ratings`;
  }
});
