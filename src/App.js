/* eslint-disable prettier/prettier */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useEffect, useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';

import { BleManager, LogLevel } from 'react-native-ble-plx';
import Marshmallow from './Marshmallow';

// in theory, we can calculate values using txPower but seems to be null via BLE in Ubuntu. Just using real world values
const BURNING_RSSI = -45;
const COOKING_RSSI = -60;

const BLE_NAME = 'piblack4';

let manager;

const App = () => {
	const [bluetoothStatus, setBluetoothStatus] = useState(null);

	const [isReadyToScan, setIsReadyToScan] = useState(false);

	const [currentRssi, setCurrentRssi] = useState(null);

	useEffect(() => {
		manager = new BleManager();
		manager.setLogLevel(LogLevel.Verbose);

		const subscription = manager.onStateChange((state) => {
			setBluetoothStatus(state);
			if (state === 'PoweredOn') {
				console.log('Bluetooth activated');
				setIsReadyToScan(true);
				subscription.remove();
			}
		}, true);

		return () => {
			subscription.remove();
			manager = null;
			setBluetoothStatus(null);
		};
	}, []);

	useEffect(() => {
		if (!isReadyToScan) {
			return;
		}

		let timer;

		const startScan = () => {
			timer = manager.startDeviceScan(null, null, handleScan);
		};

		const handleScan = async (_, device) => {
			if (!device?.name || device.name !== BLE_NAME) {
				return;
			}
			const { rssi } = device;
			setCurrentRssi(previous => Math.round((previous + rssi) / 2));
			setBluetoothStatus('Connected');
			manager.stopDeviceScan();
			timer = window.setTimeout(startScan, 100);
		};

		startScan();

		return () => {
			manager?.stopDeviceScan();
			window.clearTimeout(timer);
		};
	}, [isReadyToScan]);

	return (
		<SafeAreaView style={styles.page}>
			<StatusBar barStyle="light-content" />
			<Marshmallow isBurning={currentRssi && currentRssi > BURNING_RSSI} isCooking={currentRssi && currentRssi > COOKING_RSSI} />
			<View
				contentInsetAdjustmentBehavior="automatic">

				<Text style={styles.text}>Bluetooth: {bluetoothStatus}</Text>
				<Text style={styles.text}>RSSI: {currentRssi}</Text>
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	page: {
		backgroundColor: '#000',
		height: '100%',
		justifyContent: 'center',
		alignItems: 'center',
		width: '100%',
	},
	text: {
		color: 'white',
	},
});

export default App;
