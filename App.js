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

import { BleManager } from 'react-native-ble-plx';
import { useRef } from 'react/cjs/react.production.min';

const STATES = {
	NORMAL: 'NORMAL',
	PERFECT: 'PERFECT',
	BURNT: 'BURNT',
};

let manager;

const App = () => {
	const [bluetoothStatus, setBluetoothStatus] = useState(null);
	const [currentRssi, setCurrentRssi] = useState(null);
	const [currentDistance, setCurrentDistance] = useState(null);
	const [beaconId, setBeaconId] = useState(null);
	const [marshmallowState, setMarshmallowState] = useState(STATES.NORMAL);
	const [isCooking, setIsCooking] = useState(false);
	const [percentageComplete, setPercentageComplete] = useState(0);

	const handleScan = async (_, device) => {
		if (device.name !== 'piblack4') {
			return;
		}
		await device.connect();
		setBeaconId(device.id);
		console.log('Found beacon');
	};

	useEffect(() => {
		manager = new BleManager();
		const subscription = manager.onStateChange((state) => {
			setBluetoothStatus(state);
			if (state === 'PoweredOn') {
				manager.startDeviceScan(null, null, handleScan);
				subscription.remove();
			}
		}, true);

		return () => {
			subscription.remove();
			manager = null;
			setBluetoothStatus(null);
			setBeaconId(null);
			setCurrentRssi(null);
			setMarshmallowState(STATES.NORMAL);
		};
	}, []);

	useEffect(() => {
		if (!beaconId) {
			return;
		}
		let timer;
		const updateRSSIForBeacon = () => {
			manager.readRSSIForDevice(beaconId).then((result) => {
				console.log('Ping', result);
				const { rssi } = result;
				setCurrentRssi(rssi);
				const distance = 10 ** ((-69 - rssi) / (10 * 2));
				setCurrentDistance(distance)
				timer = window.setTimeout(updateRSSIForBeacon, 100);
			});
		};
		updateRSSIForBeacon();
		return () => {
			window.clearTimeout(timer);
		};
	}, [beaconId]);

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
