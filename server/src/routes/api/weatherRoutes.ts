import { Router } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

// POST Request with city name to retrieve weather data
router.post('/', (req, res) => {
  // Weather data from city name
  const city = req.body.cityName;
  const weatherData = WeatherService.getWeatherForCity();
  res.json(weatherData);
  // Save city to search history
  HistoryService.addCity(city);
});

// GET search history
router.get('/history', async (_req, res) => {
  const cities = await HistoryService.getCities();
  res.json(cities);
});

// * BONUS: DELETE city from search history
router.delete('/history/:id', async (req, res) => {
  await HistoryService.removeCity(req.params.id);
  res.sendStatus(200);
});

export default router;
