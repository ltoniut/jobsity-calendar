import { identity } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { IRestResponse, RestClient } from "typed-rest-client";

const userAgent = "challenge-calendar";

export interface GooglePlaceAPI {
  autocompleteCity: (_: {
    search: string;
  }) => TE.TaskEither<unknown, IRestResponse<unknown>>;
}

/**
 * @reference API https://developers.google.com/places/web-service/autocomplete
 * @param apiKey
 */
export const googlePlaceAPI = (apiKey: string): GooglePlaceAPI => {
  const googlePlacesClient = new RestClient(
    userAgent,
    "https://maps.googleapis.com"
  );
  return {
    autocompleteCity: ({ search }) => {
      return TE.tryCatch(
        () => googlePlacesClient.get(`/maps/api/place/autocomplete`),
        identity
      );
    },
  };
};

export interface OpenWeatherAPI {
  getCurrentWeather: (_: {
    city: string;
  }) => TE.TaskEither<unknown, IRestResponse<unknown>>;
}

/**
 * @reference API https://openweathermap.org/current
 * @param apiKey
 */
export const openWeatherAPI = (apiKey: string): OpenWeatherAPI => {
  const openWeatherClient = new RestClient(
    userAgent,
    "https://api.openweathermap.org"
  );
  return {
    getCurrentWeather: ({ city }) =>
      TE.tryCatch(
        () =>
          openWeatherClient.get(`data/2.5/weather?q=${city}&appid=${apiKey}`),
        identity
      ),
  };
};
