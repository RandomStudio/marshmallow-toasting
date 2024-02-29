import { BleManager } from 'react-native-ble-plx';


export const startScanning = async (manager: BleManager) => {
  await new Promise<void>((resolve, reject) => {
    const subscription = manager.onStateChange((state) => {
      if (state === 'PoweredOn') {
        console.log('Bluetooth activated');
        subscription.remove();
        resolve();
      }
    }, true);
  });
}

export const stopScanning = (manager: BleManager) => {
  manager.stopDeviceScan()
  manager.destroy();
}