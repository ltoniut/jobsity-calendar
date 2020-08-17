import { identity, pipe, constVoid, flow } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import * as T from "fp-ts/lib/Task";
import * as E from "fp-ts/lib/Either";
import * as t from "io-ts";
import axios from "axios";
import { IRestResponse } from "typed-rest-client";

const userAgent = "challenge-calendar";

const GooglePlaceAutocompleteCityC = t.type({
  predictions: t.array(t.type({ description: t.string })),
});

type GooglePlaceAutocompleteT = t.TypeOf<typeof GooglePlaceAutocompleteCityC>;

export interface GooglePlaceAPI {
  autocompleteCity: (_: {
    search: string;
  }) => TE.TaskEither<void, GooglePlaceAutocompleteT>;
}

/**
 * @reference API https://developers.google.com/places/web-service/autocomplete
 * @param apiKey
 */
export const googlePlaceAPI = (apiKey: string): GooglePlaceAPI => {
  return {
    autocompleteCity: ({ search }) =>
      pipe(
        TE.tryCatch(
          () =>
            axios.get(`http://gd.geobytes.com/AutoCompleteCity`, {
              headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "ACCEPT",
              },
              params: { q: search },
            }),
          constVoid
        ),
        T.map(
          E.chain(
            flow(
              (x) => x.data,
              GooglePlaceAutocompleteCityC.decode,
              E.mapLeft(constVoid)
            )
          )
        )
      ),
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
  return {
    getCurrentWeather: ({ city }) =>
      TE.tryCatch(
        () =>
          axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`
          ),
        identity
      ),
  };
};
