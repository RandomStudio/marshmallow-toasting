// BeaconDistanceModule.m

#import "BeaconDistanceModule.h"

@implementation BeaconDistanceModule

RCT_EXPORT_MODULE();

+ (id)allocWithZone:(NSZone *)zone {
  static BeaconDistanceModule *sharedInstance = nil;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    sharedInstance = [super allocWithZone:zone];
  });
  return sharedInstance;
}

- (NSArray<NSString *> *)supportedEvents {
  return @[@"onDistanceUpdate"]; // Define the event name
}

- (void)emitEventWithDistance:(double)distance {
  [self sendEventWithName:@"onDistanceUpdate" body:@{@"averageDistance": @(distance)}];
}

@end
