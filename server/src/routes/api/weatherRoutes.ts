import { Router, type Request, type Response } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

// POST Request with city name to retrieve weather data
router.post('/', async (req: Request, res: Response) => {
  // Weather data from city name
  const city = req.body.city;
  const weatherData = WeatherService.getWeatherData(city);
  // Save city to search history
  await HistoryService.addCity(city);
  res.json(weatherData);
});

// GET search history
router.get('/history', async (_req: Request, res: Response) => {
  const savedCities = HistoryService.getCities();
  res.json(savedCities);
});

// * BONUS TODO: DELETE city from search history
router.delete('/history/:id', async (_req: Request, _res: Response) => {});

export default router;
