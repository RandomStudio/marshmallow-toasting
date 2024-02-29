import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import Cooker from './Cooker/Cooker';
import { startScanning, stopScanning } from './bleUtils';
import { BleError, BleManager, Device } from 'react-native-ble-plx';
import { calculateOverallAverage, updateMovingAverage } from './scanUtils';

export type MovingAverage = Record<string, number[]>;

const DEVICE_UUIDS: string[] = [
  // pod '3CE60852-08FF-E563-FC4A-1FC0BB7F952F',
  // case '57E0F20D-EEFC-7607-6E0D-1EE6C86062E5',
];

let bleManager: BleManager;

const App = () => {
  const [isReadyToScan, setIsReadyToScan] = useState(false);

  useEffect(() => {
    bleManager = new BleManager();
    startScanning(bleManager).then(() => setIsReadyToScan(true));
    return () => {
      stopScanning(bleManager);
    }
  }, []);

  const [currentRssiReadings, setCurrentRssiReadings] = useState<MovingAverage>({});

  const [uuids, setUuids] = useState<string[]>([]);
  const handleScan = useCallback((error: BleError | null, device: Device | null) => {
    if (error) {
      console.error(error);
      return;
    }
    if (!device || !device.rssi || device.name !== 'campfire') {
      return;
    }
    if (!device.isConnected) {
      device.connect()
    }
    const { id, rssi } = device;
    setCurrentRssiReadings((prev) => updateMovingAverage(id, rssi, prev));
  }, []);

  useEffect(() => {
    console.log('isReadyToScan', isReadyToScan)
    if (!isReadyToScan && bleManager) {
      return;
    }
    bleManager.startDeviceScan(
      [],
      {
        allowDuplicates: true,
      },
      handleScan
    );
  
    return () => {
      bleManager.stopDeviceScan();
    }
  }, [isReadyToScan]);

  const currentRssi = useMemo(() => calculateOverallAverage(currentRssiReadings), [currentRssiReadings]);

  return (
    <SafeAreaView style= { styles.page } >
      <StatusBar barStyle="dark-content" />
      <Text style={{ color: 'white'}}>{JSON.stringify(currentRssiReadings)}</Text>
      <Text style={{ color: 'white'}}>{currentRssi}</Text>
      <Text style={{ color: 'white'}}>{uuids.join('\n')}</Text>
      {/*<Cooker currentRssi={ currentRssi } />*/}
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
