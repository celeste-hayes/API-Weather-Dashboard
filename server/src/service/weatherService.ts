import dotenv from 'dotenv';
dotenv.config();

// Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}

// Define a class for the Weather object
class Weather {
  city: string;
  date: string;
  icon: string;
  iconDescription: string;
  temperature: number;
  wind: number;
  humidity: number;

  constructor(city: string, date: string, icon: string, iconDescription: string, temperature: number, wind: number, humidity: number) {
    this.city = city;
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
  private baseURL?: string | undefined;
  private apiKey?: string | undefined;
  private cityName?: string;
  constructor() {
    this.baseURL = process.env.API_BASE_URL;
    this.apiKey = process.env.API_KEY || '';
  }

  // Create fetchLocationData method
  private async fetchLocationData(query: string) {
    const response = await fetch(query);
    const locationData = await response.json();
    return locationData[0];
  }
  // Create destructureLocationData method
  private destructureLocationData(locationData: Coordinates): Coordinates {
    const coord: Coordinates = {
      lat: locationData.lat,
      lon: locationData.lon
    }
    return coord;
  }
  // Create buildGeocodeQuery method
  private buildGeocodeQuery(): string {
    return `${this.baseURL}/geo/1.0/direct?q=${this.cityName}&limit=1&appid=${this.apiKey}`
  }

  // Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData() {
    const locationData = await this.fetchLocationData(this.buildGeocodeQuery())
    return this.destructureLocationData(locationData);
  }

  // Create fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates) {
    const response = await fetch(`${this.baseURL}/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}&units=imperial`)
    const weatherData = await response.json();
    return weatherData;
  }

  // Build parseCurrentWeather method
  private parseCurrentWeather(response: any) { 
    const localTime = new Date((response.dt + response.timezone)* 1000);
    //format the date
    const year = localTime.getUTCFullYear();
    const month = String(localTime.getUTCMonth() + 1).padStart(2, '0');
    const day = String(localTime.getUTCDate()).padStart(2, '0');
    const formattedDate = `${month}-${day}-${year}`;

    const currentWeather = new Weather(
      response.name,
      formattedDate,
      response.weather[0].icon,
      response.weather[0].description,
      response.main.temp,
      response.wind.speed,
      response.main.humidity
    );
    return currentWeather;
  }
  // Complete buildForecastArray method
  private buildForecastArray(currentWeather: Weather, weatherData: any[], timezone: number) {
    const forecast: Weather[] = [];
    forecast.push(currentWeather)

    const forecastData: { [key: string]: any } = {};
    weatherData.forEach((data) => {
      const localTime = new Date((data.dt + timezone) * 1000);

      //format the date
      const year = localTime.getUTCFullYear();
      const month = String(localTime.getUTCMonth() + 1).padStart(2, '0');
      const day = String(localTime.getUTCDate()).padStart(2, '0');
      const formattedDate = `${month}-${day}-${year}`;

      if (!forecastData[formattedDate]) {
        forecastData[formattedDate] = {
          date: formattedDate,
          icon: data.weather[0].icon,
          iconDescription: data.weather[0].description,
          temperature: data.main.temp,
          wind: data.wind.speed,
          humidity: data.main.humidity
        }
      }else{
        if(localTime.getUTCHours() < 15){
          forecastData[formattedDate].icon = data.weather[0].icon;
          forecastData[formattedDate].iconDescription = data.weather[0].description;

          forecastData[formattedDate].tempF = data.main.temp;
          forecastData[formattedDate].windSpeed = data.wind.speed;
          forecastData[formattedDate].humidity = data.main.humidity;
      }
    }
  });
  //push the forecast data to the forecast array
  for(const key in forecastData){
    forecast.push(new Weather(
      currentWeather.city,
      forecastData[key].date,
      forecastData[key].icon,
      forecastData[key].iconDescription,
      forecastData[key].temperature,
      forecastData[key].wind,
      forecastData[key].humidity
    ));
  }
  return forecast;
}
  
  //Complete getWeatherForCity method
  async getWeatherForCity(city: string) {
    this.cityName = city;
    const coordinates = await this.fetchAndDestructureLocationData();
    const weatherData = await this.fetchWeatherData(coordinates);
    const currentWeather = this.parseCurrentWeather(weatherData.list[0]);
    const forecast = this.buildForecastArray(currentWeather, weatherData.list, weatherData.city.timezone);
    return forecast;
  }
}

export default new WeatherService();
