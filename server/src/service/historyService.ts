import fs from 'node:fs/promises';
import { v4 as uuidv4 } from 'uuid';

// Define a City class with name and id properties
class City {
  name: string;
  id: string;
  constructor(name: string, id: string) {
    this.name = name;
    this.id = id;
  }
}

// Complete the HistoryService class

  // Define a read method that reads from the searchHistory.json file
  class HistoryService {
  private async read() {
    return await fs.readFile('db/searchHistory.json', {
      flag: 'a+',
      encoding: 'utf-8'
    });
  }

  // Define a write method that writes the updated cities array to the searchHistory.json file
  private async write(cities: City[]) {
    return await fs.writeFile('db/searchHistory.json', JSON.stringify(cities,null,'/t'));
  }

  // Define a getCities method that reads the cities from the searchHistory.json file and returns them as an array of City objects
  async getCities() {
    return await this.read().then((cities) => {
      let parsedCities: City[];
      try {
        parsedCities = [].concat(JSON.parse(cities));
      } catch (error) {
        parsedCities = [];
      }
      return parsedCities;
    });
  }

  // Define an addCity method that adds a city to the searchHistory.json file
  async addCity(city: string) {
    const cities = await this.getCities();
    const newCity = new City(city, uuidv4());
    cities.push(newCity);
    await this.write(cities);
  }

  // * BONUS TODO: Define a removeCity method that removes a city from the searchHistory.json file
  // async removeCity(id: string) {}
}

export default new HistoryService();
