
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface BeaconDistanceModule : RCTEventEmitter <RCTBridgeModule>

- (void)emitEventWithDistance:(double)distance;

@end
