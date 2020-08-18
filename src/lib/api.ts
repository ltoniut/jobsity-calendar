import axios from "axios";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import { constVoid, flow, identity, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as T from "fp-ts/lib/Task";
import * as TE from "fp-ts/lib/TaskEither";
import * as t from "io-ts";
import { IRestResponse } from "typed-rest-client";
import { Moment } from "moment";
import { DateTime } from "luxon";

const userAgent = "challenge-calendar";

const AutocompleteCityC = t.type({
  features: t.array(t.unknown),
});
type AutocompleteCityC = t.TypeOf<typeof AutocompleteCityC>;

const AutocompleteCityFeatureC = t.type({
  properties: t.type({ name: t.string }),
});
type AutocompleteCityFeatureC = t.TypeOf<typeof AutocompleteCityFeatureC>;

const WeatherC = t.type({
  weather: t.type({ description: t.string }),
});
type WeatherTypeC = t.TypeOf<typeof WeatherC>;

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
export const jawgdMapsAPI = (apiKey: string): JawgdMapsAPI => {
  return {
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
                  A.filterMap(
                    flow(AutocompleteCityFeatureC.decode, O.fromEither)
                  )
                )
              ),
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
    dt: Moment;
  }) => TE.TaskEither<unknown, WeatherTypeC>;
}

/**
 * @reference API https://openweathermap.org/current
 * @param apiKey
 */
export const openWeatherAPI = (apiKey: string): OpenWeatherAPI => {
  return {
    getCurrentWeather: ({ city, dt }) =>
      TE.tryCatch(
        () =>
          axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&&dt=${dt.utc}`
          ),
        identity
      ),
  };
};
