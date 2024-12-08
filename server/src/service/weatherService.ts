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
  city: string;
  date: Dayjs | string;
  icon: string;
  iconDescription: string;
  tempF: number;
  windSpeed: number;
  humidity: number;

  constructor(city: string, date: Dayjs | string, icon: string, iconDescription: string, tempF: number, windSpeed: number, humidity: number) {
    this.city = city;
    this.date = date;
    this.icon = icon;
    this.iconDescription = iconDescription;
    this.tempF = tempF;
    this.windSpeed = windSpeed;
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
        const data = await fetch(query).then((response) => response.json());
        return data[0];
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
    //console.log("locationData", locationData);
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
    //console.log(response);
      if (!response) {
        throw new Error('Weather data not found');
      }
    //const forecast: Weather[] = this.buildForecastArray(response);
    return response;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return error;
  }
}
  // Build parseCurrentWeather method
  private parseCurrentWeather(response: any) { 
    return new Weather(
      this.cityName,
      new Date(response.list[0].dt * 1000).toLocaleDateString(),
      response.list[0].weather[0].icon,
      response.list[0].weather[0].description,
      response.list[0].main.temp,
      response.list[0].wind.speed,
      response.list[0].main.humidity,
    );
  } 
  // Complete buildForecastArray method
  private buildForecastArray(weatherData: WeatherData): Weather[] {
    const dailyForecasts = this.getFiveDayForecast(weatherData.list);
    return dailyForecasts.map((day: any) => {
      return new Weather(
        this.cityName,
        new Date(day.dt * 1000).toLocaleDateString(),
        day.weather[0].icon,
        day.weather[0].description,
        day.main.temp,
        day.wind.speed,
        day.main.humidity
      );
    });
  }
  
  private getFiveDayForecast(list: any[]): any[] {
    const uniqueDays: any[] = [];
    const seenDates = new Set();
    const today = new Date().toLocaleDateString(); // Current day's date
  
    for (const item of list) {
      const date = new Date(item.dt * 1000).toLocaleDateString();
  
      // Skip today's forecast and add only unique future dates
      if (date !== today && !seenDates.has(date)) {
        uniqueDays.push(item);
        seenDates.add(date);
      }
  
      // Stop after collecting 5 unique days
      if (uniqueDays.length === 5) {
        break;
      }
    }
  
    return uniqueDays;
  }

  //Complete getWeatherForCity method
  public async getWeatherForCity(city: string) {
    try {
      this.cityName = city;
      const coordinates = await this.fetchAndDestructureLocationData();
      //console.log(coordinates);
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
