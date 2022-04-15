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

const TX_POWER = 12; // in theory this is hardcoded in chip and based on clean measurement at 1m distance

const STATES = {
	NORMAL: 'NORMAL',
	PERFECT: 'PERFECT',
	BURNT: 'BURNT',
};

let manager;

const App = () => {
	const [bluetoothStatus, setBluetoothStatus] = useState(null);

	const [isReadyToScan, setIsReadyToScan] = useState(false);

	const [currentRssi, setCurrentRssi] = useState(null);
	const [currentDistance, setCurrentDistance] = useState(null);

	const [marshmallowState, setMarshmallowState] = useState(STATES.NORMAL);
	const [isCooking, setIsCooking] = useState(false);
	const [percentageComplete, setPercentageComplete] = useState(0);

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
			setCurrentRssi(null);
			setMarshmallowState(STATES.NORMAL);
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
			if (!device?.name || !(device.name === 'piblack4' || device.name === 'campfire' || device.name.includes('ZBOX'))) {
				return;
			}

			console.log('Update RSSI')
			setBluetoothStatus('Connected');
			setCurrentRssi(device.rssi);
			manager.stopDeviceScan();
			timer = window.setTimeout(startScan, 500);
		};

		startScan();

		return () => {
			window.clearTimeout(timer);
		}
	}, [isReadyToScan]);

	useEffect(() => {
		if (percentageComplete > 100 && percentageComplete < 125) {
			setMarshmallowState(STATES.PERFECT);
		}
		if (percentageComplete > 125) {
			setMarshmallowState(STATES.BURNT);
		}
	}, [percentageComplete]);

	return (
		<SafeAreaView style={styles.page}>
			<StatusBar barStyle="light-content" />
			<View
				contentInsetAdjustmentBehavior="automatic">
				<Text style={styles.text}>Bluetooth: {bluetoothStatus}</Text>
				<Text style={styles.text}>State: {marshmallowState}</Text>
				<Text style={styles.text}>{isCooking ? 'Is Cooking' : 'Not cooking'}</Text>
				<Text style={styles.text}>Complete: {percentageComplete}</Text>
				<Text style={styles.text}>RSSI: {currentRssi}</Text>
				<Text style={styles.text}>Distance: {currentDistance}</Text>
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
