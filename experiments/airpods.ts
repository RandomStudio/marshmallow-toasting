import * as noble from '@abandonware/noble';

type MovingAverage = Record<string, number[]>;

const deviceUUIDs: string[] = [
  '6bba2d816eb614ba6d84918ace5ce8cb',
  '7872f654159cacc912b2da45df8da5dc',
  '2776a59f66e300d4bbcdcb0d288cad35',
];
const windowSize = 10;

noble.on('stateChange', async (state: string) => {
  state === 'poweredOn' ? startScanning() : stopScanning();
});

noble.on('discover', (peripheral: noble.Peripheral) => {
  const uuid = peripheral.uuid;
  if (deviceUUIDs.includes(uuid)) {
    const data = parseData(peripheral);
    const movingAverages = updateMovingAverage(uuid, data, initializeMovingAverages(deviceUUIDs));
    const average = calculateOverallAverage(movingAverages);
    displayAverage(average);
  }
});

const startScanning = (): void => noble.startScanning([], true);
const stopScanning = (): void => noble.stopScanning();

const initializeMovingAverages = (uuids: string[]): MovingAverage =>
  uuids.reduce((acc, uuid) => ({ ...acc, [uuid]: [] }), {});

const updateMovingAverage = (uuid: string, data: number, movingAverages: MovingAverage): MovingAverage => {
  const updatedAverages = [...(movingAverages[uuid].length >= windowSize ? movingAverages[uuid].slice(1) : movingAverages[uuid]), data];
  return { ...movingAverages, [uuid]: updatedAverages };
};

const calculateOverallAverage = (movingAverages: MovingAverage): number => {
  const sums = Object.values(movingAverages).map(calculateAverage);
  const validAverages = sums.filter(avg => !isNaN(avg));
  return validAverages.reduce((a, b) => a + b, 0) / (validAverages.length || 1);
};

const calculateAverage = (values: number[]): number =>
  values.reduce((a, b) => a + b, 0) / (values.length || 1);

const parseData = (peripheral: noble.Peripheral): number => {
  // Replace this with actual data parsing logic
  return Math.random() * 100; // Example data extraction
};

const displayAverage = (average: number): void => {
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
  console.log(average);
};

process.on('SIGINT', () => {
  console.log('Disconnecting...');
  stopScanning();
  process.exit();
});
