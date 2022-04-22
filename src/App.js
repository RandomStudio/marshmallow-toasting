/* eslint-disable prettier/prettier */

// campfire-1 – 10.112.10.141
// ##campfire-2 – 10.112.10.229
// campfire-3 – 10.112.10.120

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import Cooker from './Cooker/Cooker';

// in theory, we can calculate values using txPower but seems to be null via BLE in Ubuntu. Just using real world values
const BURNING_RSSI = -40;
const COOKING_RSSI = -55;

const BLE_NAME = 'campfire-';

let manager;

const App = () => {
	const [bluetoothStatus, setBluetoothStatus] = useState(null);

	const [isReadyToScan, setIsReadyToScan] = useState(false);

	const lastSeenRefs = useRef({});
	const [rssiValues, setRssiValues] = useState([0, 0, 0]);

	const currentRssi = useMemo(() => {
		const visibleRssis = rssiValues.filter(value => value);
		return visibleRssis.length > 0 ? visibleRssis.reduce((p, c) => p + c, 0) / visibleRssis.length : 0;
	}, [rssiValues]);

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
		let interval = window.setInterval(() => {
			const timestamps = Object.entries(lastSeenRefs.current);
			for (const [name, timestamp] of timestamps) {
				const index = parseInt(name.replace(BLE_NAME), 10) - 1;
				if (timestamp < Date.now() - 2000) {
					setRssiValues(current => current.map((value, i) => index === i ? null : value));
					delete (lastSeenRefs.current[name]);
				}
			}
		}, 1000);

		return () => {
			window.clearInterval(interval);
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
			if (!device?.name || !device.name.includes(BLE_NAME)) {
				return;
			}
			const index = parseInt(device.name.replace(BLE_NAME, ''), 10) - 1;
			const { rssi } = device;
			lastSeenRefs.current[device.name] = Date.now();
			if (rssi > 80 || rssi < -80) {
				return;
			}
			setRssiValues(current => current.map((value, i) => index === i ? rssi : value));
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
			<StatusBar barStyle="dark-content" />
			<Cooker isBurning={currentRssi && currentRssi > BURNING_RSSI} isCooking={currentRssi && currentRssi > COOKING_RSSI} percentageComplete={percentageComplete} setPercentageComplete={setPercentageComplete} />
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
