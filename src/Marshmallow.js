/* eslint-disable prettier/prettier */
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

const STATES = {
	NORMAL: 'NORMAL',
	PERFECT: 'PERFECT',
	BURNT: 'BURNT',
};

const COLOUR_STAGES = {
	0: [255, 255, 255],
	40: [225, 213, 201],
	60: [203, 181, 162],
	80: [157, 119, 86],
	100: [78, 59, 43],
	125: [0, 0, 0],
};

const styles = StyleSheet.create({
	marshmallow: {
		backgroundColor: 'white',
		height: 160,
		width: 80,
	},
	text: {
		color: 'white',
	},
});

const colourPercentages = Object.keys(COLOUR_STAGES);
const colours = Object.values(COLOUR_STAGES);

const Marshmallow = ({ isBurning, isCooking }) => {
	const [marshmallowState, setMarshmallowState] = useState(STATES.NORMAL);
	const [percentageComplete, setPercentageComplete] = useState(0);

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
	}, [isBurning, isCooking]);

	useEffect(() => {
		if (percentageComplete > 100 && percentageComplete < 125) {
			setMarshmallowState(STATES.PERFECT);
		}
		if (percentageComplete > 125) {
			setMarshmallowState(STATES.BURNT);
		}
	}, [percentageComplete]);

	const marshmallowColour = useMemo(() => {
		if (percentageComplete === 0) {
			return 'rgb(255,255,255)';
		}

		if (marshmallowState === STATES.BURNT) {
			return 'rgb(0,0,0)';
		}

		const nearestColour = colourPercentages.reduce((prev, curr) => Math.abs(curr - percentageComplete) < Math.abs(prev - percentageComplete) ? curr : prev);
		const nearestColourIndex = colourPercentages.findIndex(c => c === nearestColour);

		const [low, high] = percentageComplete > nearestColour ? [nearestColour, colourPercentages[nearestColourIndex + 1]] : [colourPercentages[nearestColourIndex - 1], nearestColour];
		const [lowColor, highColor] = percentageComplete > nearestColour ? [colours[nearestColourIndex], colours[nearestColourIndex + 1]] : [colours[nearestColourIndex - 1], colours[nearestColourIndex]];

		const diff = high - low;
		const colourDiffs = [lowColor[0] - highColor[0], lowColor[1] - highColor[1], lowColor[2] - highColor[2]];

		const progress = (100 / diff) * (percentageComplete - low);

		return `
			rgb(
				${lowColor[0] - (colourDiffs[0] / 100 * progress)},
				${lowColor[1] - (colourDiffs[1] / 100 * progress)},
				${lowColor[2] - (colourDiffs[2] / 100 * progress)}
			)
		`;
	}, [marshmallowState, percentageComplete]);

	const marshmallowStyle = {
		...styles.marshmallow,
		backgroundColor: marshmallowColour,
	};

	return (
		<View contentInsetAdjustmentBehavior="automatic">
			<View style={marshmallowStyle} />
			<Text style={styles.text}>State: {marshmallowState}</Text>
			<Text style={styles.text}>
				{isCooking ? 'Is Cooking' : 'Not cooking'}
			</Text>
			<Text style={styles.text}>Complete: {percentageComplete}</Text>
		</View>
	);
};

export default Marshmallow;
