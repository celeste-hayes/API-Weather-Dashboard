import { Dayjs } from 'dayjs';
import dotenv from 'dotenv';

interface WeatherData {
  list: {
    dt: number;
    main: {
      temp: number;
      humidity: number;
    };
    wind: {
      speed: number;
    };
    weather: {
      icon: string;
      description: string;
    }[];
  }[];
}
dotenv.config();

// Define an interface for the Coordinates object
interface Coordinates {
  name: string;
  lat: number;
  lon: number;
}

// Define a class for the Weather object
class Weather {
  cityName: string;
  date: Dayjs | string;
  icon: string;
  iconDescription: string;
  temperature: number;
  wind: number;
  humidity: number;

  constructor(cityName: string, date: Dayjs | string, icon: string, iconDescription: string, temperature: number, wind: number, humidity: number) {
    this.cityName = cityName;
    this.date = date;
    this.icon = icon;
    this.iconDescription = iconDescription;
    this.temperature = temperature;
    this.wind = wind;
    this.humidity = humidity;
  }
}

// Complete the WeatherService class
class WeatherService {
  // Define the baseURL, API key, and city name properties
  private baseURL?: string;
  private apiKey?: string;
  private cityName = '';
  
  constructor() {
    this.baseURL = process.env.API_BASE_URL || '';
    this.apiKey = process.env.API_KEY || '';
  }

  // Create fetchLocationData method
  private async fetchLocationData(query: string) {
    try {
      if (!this.baseURL || !this.apiKey) {
        throw new Error('Invalid query');
      } {
        return await fetch(query).then((response) => response.json());
      }
    } catch (error) {
      console.error('Error fetching location data:', error);
      return error;
    }
  }
  // Create destructureLocationData method
  private destructureLocationData(locationData: Coordinates): Coordinates {
    if (!locationData) {
      throw new Error('Invalid location data without coordinates');
    }
    const { name, lat, lon } = locationData;
    const coordinates: Coordinates = {
     name,
     lat,
     lon, 
    };
    return coordinates;
  }
  // Create buildGeocodeQuery method
  private buildGeocodeQuery(): string {
    const geoQuery = `https://api.openweathermap.org/geo/1.0/direct?q=${this.cityName}&limit=5&appid=${this.apiKey}`;
    return geoQuery;
  }
  // Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): string {
    const weatherQuery = `https://api.openweathermap.org/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&exclude=minutely,hourly&units=imperial&appid=${this.apiKey}`;
    return weatherQuery;
  }

  // Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData() {
    return await this.fetchLocationData(this.buildGeocodeQuery()).then((data) => 
      this.destructureLocationData(data as Coordinates));
  }

  // Create fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates) {
    try {
    const response = await fetch(this.buildWeatherQuery(coordinates)).then((response) => response.json());
    console.log(response);
      if (!response) {
        throw new Error('Weather data not found');
      }
    const forecast: Weather[] = this.buildForecastArray(response);
    return forecast;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return error;
  }
}
  // Build parseCurrentWeather method
  private parseCurrentWeather(response: any) { 
    if (!response.current) {
      console.error('Invalid API does not contain current weather data');
      throw new Error('Invalid API does not contain current weather data');
    }
    return response.list.daily.map((response: any) => {
      const {main, weather, dt} = response;
      const date = new Date(response.dt * 1000).toLocaleDateString();
      return {
        temp: main.temp,
        wind: main.wind_speed,
        humidity: main.humidity,
        icon: weather[0].icon,
        description: weather[0].description,
        forecast: [],
        date: date,
        dt,
        };
      });
    };
  
  // Complete buildForecastArray method
  private buildForecastArray(weatherData: WeatherData): Weather[] {
    return weatherData.list.slice(1, 6).map((day: any) => {
      return new Weather(
      this.cityName,
      new Date(day.dt * 1000).toISOString(),
      day.weather[0].icon,
      day.weather[0].description,
      day.main.temp,
      day.wind.speed,
      day.main.humidity
      );
    });
  }
  
  //Complete getWeatherForCity method
  public async getWeatherForCity() {
    try {
      const coordinates = await this.fetchAndDestructureLocationData();
      const weatherData = await this.fetchWeatherData(coordinates);
      const currentWeather = await this.parseCurrentWeather(weatherData);
      const forecastArray = this.buildForecastArray(weatherData as WeatherData);
      return { 
        currentWeather: currentWeather,
        forecastArray
      };
    } catch (error) {
      console.error('Error getting weather data:', error);
      throw error;
    }
  }
}

export default WeatherService;
