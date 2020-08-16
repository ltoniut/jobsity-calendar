import { GooglePlaceAPI, OpenWeatherAPI } from "./lib/api";

export interface Env {
  googlePlaceAPI: GooglePlaceAPI;
  openWeatherAPI: OpenWeatherAPI;
}
