import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Marshmallow from './Marshmallow/Marshmallow';
import { Button, Text, View } from 'react-native';


const Cooker = ({ currentDistance, onReset }: {currentDistance: number, onReset: () => void}) => {
  const [percentageComplete, setPercentageComplete] = useState(0);

  const updateToasting = useCallback((distance: number, currentPecentageToasted: number) => {
    // Define toasting rate thresholds based on distance ranges
    let toastingRate = 0;
    if (distance < 0.7) {
      toastingRate = 1; // Very fast toasting rate
    }
    if (distance < 0.5) {
      toastingRate = 3;
    }
  
    const newPercentageToasted = Math.min(200, currentPecentageToasted + toastingRate);
  
    return newPercentageToasted
  }, []);

  useEffect(() => {
    let timer = window.setInterval(() => {
      setPercentageComplete((currentPecentageToasted) => updateToasting(currentDistance, currentPecentageToasted));
    }, 125);
    return () => {
      clearInterval(timer);
    };
  }, [currentDistance, updateToasting]);

  const handleReset = () => {
    setPercentageComplete(0);
    onReset()
  }

  return (
    <>
    <Text>{percentageComplete}</Text>
    <Marshmallow percentageComplete={percentageComplete} />
    {percentageComplete >= 100 && (
      <View style={{
        position: 'absolute',
        bottom: 10,
        right: 10,
        borderColor: 'white',
        borderWidth: 1,
      }}>
        <Button color="white" title="Reset" onPress={handleReset} />
      </View>
    )}
    </>
  );
};

export default Cooker;
