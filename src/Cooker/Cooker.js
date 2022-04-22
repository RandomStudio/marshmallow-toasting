/* eslint-disable prettier/prettier */
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Marshmallow from './Marshmallow/Marshmallow';

const STATES = {
	NORMAL: 'NORMAL',
	PERFECT: 'PERFECT',
	BURNT: 'BURNT',
};


const Cooker = ({ isBurning, isCooking, percentageComplete, setPercentageComplete }) => {
	const [marshmallowState, setMarshmallowState] = useState(STATES.NORMAL);

	useEffect(() => {
		return () => {
			setMarshmallowState(STATES.NORMAL);
		};
	}, []);

	useEffect(() => {
		if (!isCooking) {
			return;
		}
		let interval;
		interval = window.setInterval(() => {
			setPercentageComplete(current => current + (isBurning ? 10 : 2));
		}, 500);
		return () => {
			window.clearInterval(interval);
		};
	}, [isBurning, isCooking, setPercentageComplete]);

	useEffect(() => {
		if (percentageComplete > 100 && percentageComplete < 125) {
			setMarshmallowState(STATES.PERFECT);
		}
		if (percentageComplete > 125) {
			setMarshmallowState(STATES.BURNT);
		}
	}, [percentageComplete]);

	return (
		<Marshmallow percentageComplete={percentageComplete} />
	);
};

export default Cooker;
