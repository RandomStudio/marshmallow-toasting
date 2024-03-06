import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DeviceEventEmitter, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import Cooker from './Cooker/Cooker';
import { NativeEventEmitter, NativeModules } from 'react-native';
import { calculateOverallAverage, updateMovingAverage } from './scanUtils';

const { BeaconDistanceModule } = NativeModules;
const beaconDistanceEmitter = new NativeEventEmitter(BeaconDistanceModule);

export type MovingAverage = Record<string, number[]>;

const App = () => {
  const [distances, setDistances] = useState<{[key: string]: number[]}>({});
  useEffect(() => {
    const subscription = beaconDistanceEmitter.addListener(
      'onDistanceUpdate',
      (data) => {
        setDistances((prev) => updateMovingAverage("beacons", data.averageDistance, prev));
      }
    );
    return () => {
      subscription.remove();
    }
  }, []);

  const currentDistance = useMemo(() => calculateOverallAverage(distances), [distances]);

  const handleReset = () => {
    setDistances({});
  }

  return (
    <SafeAreaView style= { styles.page } >
      <StatusBar barStyle="dark-content" />
      <Text style={{ color: 'white'}}>{currentDistance}</Text>
      <Cooker currentDistance={ currentDistance } onReset={handleReset} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  page: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
    width: '100%',
  },
  debug: {
    position: 'absolute',
    bottom: 10,
  },
  text: {
    color: 'white',
  },
});

export default App;
