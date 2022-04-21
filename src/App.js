/* eslint-disable prettier/prettier */

// campfire-1 – 10.112.10.141
// campfire-2 – 10.112.10.229
// campfire-3 – 10.112.10.120

import React, { useEffect, useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import Cooker from './Cooker/Cooker';

// in theory, we can calculate values using txPower but seems to be null via BLE in Ubuntu. Just using real world values
const BURNING_RSSI = -45;
const COOKING_RSSI = -60;

const BLE_NAME = 'campfire-1';

let manager;

const TX_POWERS = [-50];

const App = () => {
	const [bluetoothStatus, setBluetoothStatus] = useState(null);

	const [isReadyToScan, setIsReadyToScan] = useState(false);

	const [currentRssi, setCurrentRssi] = useState(null);

	const [percentageComplete, setPercentageComplete] = useState(0);

	useEffect(() => {
		manager = new BleManager();

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
			setCurrentRssi(rssi);
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
			<Cooker isBurning={currentRssi && currentRssi > BURNING_RSSI} isCooking={currentRssi && currentRssi > COOKING_RSSI} percentageComplete={percentageComplete} setPercentageComplete={setPercentageComplete} />
			<View
				contentInsetAdjustmentBehavior="automatic"
				style={styles.debug}
			>
				<Text style={styles.text}>Bluetooth: {bluetoothStatus}</Text>
				<Text style={styles.text}>RSSI: {currentRssi}</Text>
				<Text style={styles.text}>Percentage: {percentageComplete}</Text>
			</View>
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
