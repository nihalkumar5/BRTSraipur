export interface StopCoordinates {
  latitude: number;
  longitude: number;
}

export interface Stop {
  id: string;
  name: string;
  shortName: string;
  code: string;
  hindiName: string;
  type: string;
  corridor: string;
  landmark: string;
  interchange: boolean;
  facilities: string[];
  coordinates: StopCoordinates;
}

export interface TripStop {
  stop: string;
  time: string;
  mins: number;
}

export interface Trip {
  id: string;
  route: string;
  routeNumber: string;
  serviceDay: 'weekday' | 'weekend';
  direction: 'up' | 'down';
  serviceName: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  departureMins: number;
  arrivalMins: number;
  routeType?: 'trunk' | 'feeder';
  stops: TripStop[];
}

export interface UpcomingDeparture {
  tripId: string;
  route: string;
  departureTime: string;
  arrivalTime: string;
  departureMins: number;
  diffMins: number;
  isNextDay: boolean;
  isInTransit?: boolean;
  currentStopIndex?: number;
}

export interface JourneyStopInfo {
  name: string;
  code: string;
  time: string;
  mins: number;
  passed: boolean;
  isCurrentNext: boolean;
  isBoarding: boolean;
  isDropoff: boolean;
}

export interface ActiveJourney {
  trip: Trip;
  fromStop: Stop;
  toStop: Stop;
  fromTime: string;
  toTime: string;
  departureMins: number;
  arrivalMins: number;
  durationMins: number;
  fare: number;
  classFareText: string;
  routeBadge: string;
  countdownText: string;
  timeRemainingText: string;
  progressPercent: number;
  isUpcoming: boolean;
  isInTransit: boolean;
  currentStatusText: string;
  currentStopName?: string;
  nextStopName?: string;
  nextStopETA?: string;
  remainingStopsCount?: number;
  intermediateStopsCount: number;
  intermediateStops: JourneyStopInfo[];
  upcomingDepartures: UpcomingDeparture[];
  isTransfer?: boolean;
  transferHub?: string;
  transferWaitMins?: number;
  transferArrivalTime?: string;
  connectingTrip?: Trip;
  connectingFromTime?: string;
  connectingToTime?: string;
  secondLegStops?: JourneyStopInfo[];
}

export interface PopularRoute {
  id: string;
  from: string;
  to: string;
  fromDisplay: string;
  toDisplay: string;
  tag: string;
  typicalDuration: string;
  fare: number;
}
