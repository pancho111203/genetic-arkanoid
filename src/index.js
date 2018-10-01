import Simulation from './Simulation';
import { getUrlVars } from './util';


const levelNr = getUrlVars()['level'] || 0;
const simulation = new Simulation(true, [
    {
        levelNr: 20,
        balls: [[[-34.09, -27.18, 0], [-0.67, 0.74, 0]]]
    }
]);

window.run = () => {
    simulation.run();
}

window.pause = () => {
    simulation.pause();
}

window.reset = () => {
    simulation.reset();
}