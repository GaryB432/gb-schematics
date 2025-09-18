import './style.css';
import Victor from 'victor';
import { Oven } from '@appliances/oven';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>Bakery App</h1>
    <div id="svg-container"></div>
    <div id="oven-status"></div>
  </div>
`;

// Create a random rectangle using Victor
function createRandomRectangle() {
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('width', '200');
  svg.setAttribute('height', '200');

  const position = new Victor(Math.random() * 100, Math.random() * 100);

  const size = new Victor(50 + Math.random() * 50, 50 + Math.random() * 50);

  const rect = document.createElementNS(svgNS, 'rect');
  rect.setAttribute('x', position.x.toString());
  rect.setAttribute('y', position.y.toString());
  rect.setAttribute('width', size.x.toString());
  rect.setAttribute('height', size.y.toString());
  rect.setAttribute(
    'fill',
    `rgb(${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)})`,
  );

  svg.appendChild(rect);
  document.getElementById('svg-container')!.appendChild(svg);
}

createRandomRectangle();

// Use the Oven
const oven = new Oven(180);
document.getElementById('oven-status')!.textContent =
  `Oven temperature: ${oven.getTemperature()}°C`;
