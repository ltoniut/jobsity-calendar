import axios from "axios";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import { constVoid, flow, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as T from "fp-ts/lib/Task";
import * as TE from "fp-ts/lib/TaskEither";
import * as t from "io-ts";
import { Moment } from "moment";

const userAgent = "challenge-calendar";

const AutocompleteCityC = t.type({
  features: t.array(t.unknown),
});
type AutocompleteCityC = t.TypeOf<typeof AutocompleteCityC>;

const AutocompleteCityFeatureC = t.type({
  properties: t.type({ name: t.string }),
});
type AutocompleteCityFeatureC = t.TypeOf<typeof AutocompleteCityFeatureC>;

export interface JawgdMapsAPI {
  autocompleteCity: (_: {
    search: string;
    size?: number;
  }) => TE.TaskEither<void, Array<AutocompleteCityFeatureC>>;
}

/**
 * @reference API https://www.jawg.io/docs/apidocs/places/autocomplete/
 * @param apiKey
 */
export const jawgdMapsAPI = (apiKey: string): JawgdMapsAPI => ({
  autocompleteCity: ({ search, size = 10 }) =>
    pipe(
      TE.tryCatch(
        () =>
          axios.get("https://api.jawg.io/places/v1/autocomplete", {
            params: {
              layer: "locality",
              "access-token": apiKey,
              text: search,
              size,
            },
          }),
        constVoid
      ),
      T.map(
        E.chain(
          flow(
            (x) => x.data,
            AutocompleteCityC.decode,
            E.map(
              flow(
                (x) => x.features,
                A.filterMap(flow(AutocompleteCityFeatureC.decode, O.fromEither))
              )
            ),
            E.mapLeft(constVoid)
          )
        )
      )
    ),
});

const WeatherC = t.type({
  weather: t.array(t.type({ description: t.string })),
});
export type WeatherC = t.TypeOf<typeof WeatherC>;

export interface OpenWeatherAPI {
  getCurrentWeather: (_: {
    city: string;
    time: Moment;
  }) => TE.TaskEither<unknown, WeatherC>;
}

/**
 * @reference API https://openweathermap.org/current
 * @param apiKey
 */
export const openWeatherAPI = (apiKey: string): OpenWeatherAPI => ({
  getCurrentWeather: ({ city, time }) =>
    pipe(
      TE.tryCatch(
        () =>
          axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
            params: {
              q: city,
              apiKey: apiKey,
              dt: time.utc,
            },
          }),
        constVoid
      ),
      T.map(
        E.chain(flow(({ data }) => data, WeatherC.decode, E.mapLeft(constVoid)))
      )
    ),
});
