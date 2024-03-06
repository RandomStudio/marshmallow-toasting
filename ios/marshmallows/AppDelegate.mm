#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import "BeaconDistanceModule.h"

@implementation AppDelegate


- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    self.moduleName = @"Marshmallows";
    // You can add your custom initial props in the dictionary below.
    // They will be passed down to the ViewController used by React Native.
    self.initialProps = @{};

  
    self.locationManager = [[CLLocationManager alloc] init];
    self.locationManager.delegate = self;
    [self.locationManager requestWhenInUseAuthorization];
    
    NSUUID *uuid = [[NSUUID alloc] initWithUUIDString:@"7D0D9B66-0554-4CCF-A6E4-ADE123256969"];
    self.beaconRegion = [[CLBeaconRegion alloc] initWithUUID:uuid identifier:@"Campfire"];
    [self.locationManager startMonitoringForRegion:self.beaconRegion];
    [self.locationManager startRangingBeaconsInRegion:self.beaconRegion];

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self getBundleURL];
}

- (NSURL *)getBundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

- (void)locationManager:(CLLocationManager *)manager didRangeBeacons:(NSArray<CLBeacon *> *)beacons inRegion:(CLBeaconRegion *)region {
    NSMutableArray<NSNumber *> *distances = [[NSMutableArray alloc] init];
    
    for (CLBeacon *beacon in beacons) {
        if (beacon.accuracy > 0) { // beacon.accuracy is a rough estimate of distance in meters
            [distances addObject:@(beacon.accuracy)];
        }
    }
    
    if (distances.count > 0) {
        NSNumber *averageDistance = [distances valueForKeyPath:@"@avg.self"];
        BeaconDistanceModule *module = [self.bridge moduleForClass:[BeaconDistanceModule class]];
        [module emitEventWithDistance:averageDistance.doubleValue];
    }
}

- (void)locationManagerDidChangeAuthorization:(CLLocationManager *)manager {
    if ([CLLocationManager locationServicesEnabled]) {
        switch ([CLLocationManager authorizationStatus]) {
            case kCLAuthorizationStatusAuthorizedWhenInUse:
            case kCLAuthorizationStatusAuthorizedAlways:
                NSLog(@"Location services authorized.");
                break;
            default:
                NSLog(@"Location services not authorized.");
                break;
        }
    } else {
        NSLog(@"Location services not enabled.");
    }
}

@end
