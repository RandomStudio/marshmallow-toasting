import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Marshmallow from './Marshmallow/Marshmallow';
import { Text } from 'react-native';

// in theory, we can calculate values using txPower but seems to be null via BLE in Ubuntu. Just using real world values
const BURNING_RSSI = -50;
const COOKING_RSSI = -60;


const Cooker = ({ currentRssi }: {currentRssi: number}) => {
  const [percentageComplete, setPercentageComplete] = useState(0);

  const updateToasting = useCallback((rssi: number, currentPecentageToasted: number) => {
    // Define toasting rate thresholds based on distance ranges
    let toastingRate = 0;
    if (rssi < -50) {
      toastingRate = 1; // Very fast toasting rate
    }
    if (rssi < -45) {
      toastingRate = 3;
    }
    if (rssi < -40) {
      toastingRate = 10;
    }
  
    const newPercentageToasted = Math.min(200, currentPecentageToasted + toastingRate);
  
    return newPercentageToasted
  }, []);

  useEffect(() => {
    let timer = window.setInterval(() => {
      setPercentageComplete((currentPecentageToasted) => updateToasting(currentRssi, currentPecentageToasted));
    }, 125);
    return () => {
      clearInterval(timer);
    };
  }, [currentRssi, updateToasting]);

  return (
    <>
    <Text>{percentageComplete}</Text>
    <Marshmallow percentageComplete={percentageComplete} />
    </>
  );
};

export default Cooker;
