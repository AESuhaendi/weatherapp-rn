import React, {useEffect, useMemo, useReducer} from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import SearchInput from './src/components/SearchInput';
import getImageForWeather from './src/utils/getImageForWeather';
import {fetchLocationId, fetchWeather} from './src/utils/api';

/** @namespace */
const AppState = {
  location: '',
  loading: false,
  error: false,
  temperature: 0,
  weather: '',
};
const reducer = (state, newState) => ({...state, ...newState});

const App = () => {
  /** @type {[AppState, function(AppState): void]} */
  const [state, setState] = useReducer(reducer, AppState);

  const handleUpdateLocation = async city => {
    if (!city) {
      return;
    }
    try {
      setState({
        loading: true,
      });

      const locationId = await fetchLocationId(city);
      const {location, weather, temperature} = await fetchWeather(locationId);

      setState({
        loading: false,
        error: false,
        location,
        weather,
        temperature,
      });
    } catch (e) {
      setState({
        loading: false,
        error: true,
      });
    }
  };

  const imageForWeather = useMemo(
    () => getImageForWeather(state.weather),
    [state.weather],
  );

  useEffect(() => {
    handleUpdateLocation('Jakarta');
  }, []);

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={imageForWeather}
        style={styles.imageContainer}
        imageStyle={styles.image}>
        <View style={styles.detailsContainer}>
          <ActivityIndicator
            animating={state.loading}
            color="white"
            size="large"
          />

          {!state.loading && (
            <View>
              {state.error && (
                <Text style={[styles.smallText, styles.textStyle]}>
                  Could not load weather, please try a different city.
                </Text>
              )}

              {!state.error && (
                <View>
                  <Text style={[styles.largeText, styles.textStyle]}>
                    {state.location}
                  </Text>
                  <Text style={[styles.smallText, styles.textStyle]}>
                    {state.weather}
                  </Text>
                  <Text style={[styles.largeText, styles.textStyle]}>
                    {`${Math.round(state.temperature)}°`}
                  </Text>
                </View>
              )}

              <SearchInput
                placeholder="Search any city"
                onSubmit={handleUpdateLocation}
              />
            </View>
          )}
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  textStyle: {
    textAlign: 'center',
    ...Platform.select({
      ios: {
        fontFamily: 'AvenirNext-Regular',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
    color: 'white',
  },
  largeText: {
    fontSize: 44,
  },
  smallText: {
    fontSize: 18,
  },
  imageContainer: {
    flex: 1,
  },
  image: {
    flex: 1,
    width: null,
    height: null,
    resizeMode: 'cover',
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 20,
  },
});

export default App;
