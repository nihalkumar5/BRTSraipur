import rawStops from '../data/stops.json';
import rawSchedules from '../data/schedules.json';
import rawFares from '../data/fares.json';
import rawPopularRoutes from '../data/popular_routes.json';
import { Stop, Trip, ActiveJourney, PopularRoute, UpcomingDeparture, JourneyStopInfo } from '../types';

export const stops: Stop[] = rawStops as Stop[];
export const schedules: Trip[] = rawSchedules as Trip[];
export const fares: Record<string, Record<string, number>> = rawFares as Record<string, Record<string, number>>;
export const popularRoutes: PopularRoute[] = rawPopularRoutes as PopularRoute[];

export function getStopByName(nameQuery: string): Stop | undefined {
  if (!nameQuery) return undefined;
  const q = nameQuery.trim().toLowerCase();
  return stops.find(
    s =>
      s.name.toLowerCase() === q ||
      s.shortName.toLowerCase() === q ||
      s.code.toLowerCase() === q ||
      s.name.toLowerCase().includes(q)
  );
}

export function getFare(fromStopName: string, toStopName: string): number {
  if (!fromStopName || !toStopName) return 10;
  if (fromStopName === toStopName) return 0;

  const direct = fares[fromStopName]?.[toStopName];
  if (typeof direct === 'number') return direct;

  const reverse = fares[toStopName]?.[fromStopName];
  if (typeof reverse === 'number') return reverse;

  // Fallback fuzzy search in fare matrix
  const fromKey = Object.keys(fares).find(k => k.toLowerCase().includes(fromStopName.toLowerCase()) || fromStopName.toLowerCase().includes(k.toLowerCase()));
  const toKey = Object.keys(fares).find(k => k.toLowerCase().includes(toStopName.toLowerCase()) || toStopName.toLowerCase().includes(k.toLowerCase()));

  if (fromKey && toKey) {
    const f = fares[fromKey]?.[toKey] ?? fares[toKey]?.[fromKey];
    if (typeof f === 'number') return f;
  }

  return 15; // default reasonable average fare
}

export function getCurrentMinutesOfDay(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

export function isWeekendDay(): boolean {
  const day = new Date().getDay();
  return day === 0 || day === 6; // Sunday or Saturday
}

export function formatMinutesToTime(mins: number): string {
  const normalized = ((mins % 1440) + 1440) % 1440;
  let hours = Math.floor(normalized / 60);
  const m = normalized % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;
  return `${hours}:${m.toString().padStart(2, '0')} ${period}`;
}

function calculateTransferJourney(
  fromStop: Stop,
  toStop: Stop,
  serviceDay: 'weekday' | 'weekend',
  nowMins: number,
  mode: 'next' | 'onboard' = 'next'
): ActiveJourney | null {
  const hubs = ['North Block', 'CBD', 'Sector 22', 'Navagaon'];

  interface TransferOption {
    hub: string;
    leg1Trip: Trip;
    leg2Trip: Trip;
    f1Idx: number;
    t1Idx: number;
    f2Idx: number;
    t2Idx: number;
    depMins1: number;
    arrMins1: number;
    depMins2: number;
    arrMins2: number;
    waitMins: number;
    totalDuration: number;
  }

  const transferOptions: TransferOption[] = [];

  for (const hubName of hubs) {
    const hubStop = getStopByName(hubName);
    if (!hubStop) continue;
    if (hubStop.id === fromStop.id || hubStop.id === toStop.id) continue;

    // Find all trips from fromStop to hub
    const leg1Trips: { trip: Trip; fIdx: number; tIdx: number; depMins: number; arrMins: number }[] = [];
    for (const trip of schedules) {
      if (trip.serviceDay !== serviceDay) continue;
      let fIdx = -1;
      let tIdx = -1;
      trip.stops.forEach((s, idx) => {
        const sName = s.stop.toLowerCase();
        if (fIdx === -1 && (sName === fromStop.name.toLowerCase() || sName.includes(fromStop.shortName.toLowerCase()) || fromStop.name.toLowerCase().includes(sName))) {
          fIdx = idx;
        }
        if (tIdx === -1 && fIdx !== -1 && (sName === hubStop.name.toLowerCase() || sName.includes(hubStop.shortName.toLowerCase()) || hubStop.name.toLowerCase().includes(sName))) {
          tIdx = idx;
        }
      });
      if (fIdx !== -1 && tIdx !== -1 && fIdx < tIdx) {
        leg1Trips.push({ trip, fIdx, tIdx, depMins: trip.stops[fIdx].mins, arrMins: trip.stops[tIdx].mins });
      }
    }

    // Find all trips from hub to toStop
    const leg2Trips: { trip: Trip; fIdx: number; tIdx: number; depMins: number; arrMins: number }[] = [];
    for (const trip of schedules) {
      if (trip.serviceDay !== serviceDay) continue;
      let fIdx = -1;
      let tIdx = -1;
      trip.stops.forEach((s, idx) => {
        const sName = s.stop.toLowerCase();
        if (fIdx === -1 && (sName === hubStop.name.toLowerCase() || sName.includes(hubStop.shortName.toLowerCase()) || hubStop.name.toLowerCase().includes(sName))) {
          fIdx = idx;
        }
        if (tIdx === -1 && fIdx !== -1 && (sName === toStop.name.toLowerCase() || sName.includes(toStop.shortName.toLowerCase()) || toStop.name.toLowerCase().includes(sName))) {
          tIdx = idx;
        }
      });
      if (fIdx !== -1 && tIdx !== -1 && fIdx < tIdx) {
        leg2Trips.push({ trip, fIdx, tIdx, depMins: trip.stops[fIdx].mins, arrMins: trip.stops[tIdx].mins });
      }
    }

    // Pair them up with a transfer window of 2 to 60 minutes
    for (const l1 of leg1Trips) {
      for (const l2 of leg2Trips) {
        const wait = l2.depMins - l1.arrMins;
        if (wait >= 2 && wait <= 60) {
          const totalDuration = l2.arrMins - l1.depMins;
          transferOptions.push({
            hub: hubName,
            leg1Trip: l1.trip,
            leg2Trip: l2.trip,
            f1Idx: l1.fIdx,
            t1Idx: l1.tIdx,
            f2Idx: l2.fIdx,
            t2Idx: l2.tIdx,
            depMins1: l1.depMins,
            arrMins1: l1.arrMins,
            depMins2: l2.depMins,
            arrMins2: l2.arrMins,
            waitMins: wait,
            totalDuration,
          });
        }
      }
    }
  }

  if (transferOptions.length === 0) {
    return null;
  }

  // Filter for upcoming departures
  transferOptions.sort((a, b) => a.depMins1 - b.depMins1);
  const upcomingTransfers = transferOptions.filter(t => t.depMins1 >= nowMins - 1);
  const chosen = upcomingTransfers.length > 0 ? upcomingTransfers[0] : transferOptions[0];
  const isNextDay = upcomingTransfers.length === 0;

  const fare1 = getFare(fromStop.name, chosen.hub);
  const fare2 = getFare(chosen.hub, toStop.name);
  const totalFare = fare1 + fare2;

  const fromTime = chosen.leg1Trip.stops[chosen.f1Idx].time;
  const toTime = chosen.leg2Trip.stops[chosen.t2Idx].time;
  const hubDepartureTime = chosen.leg2Trip.stops[chosen.f2Idx].time;

  // Leg 1 stops
  const intermediateStops: JourneyStopInfo[] = chosen.leg1Trip.stops
    .slice(chosen.f1Idx, chosen.t1Idx + 1)
    .map((s, idx, arr) => {
      const matched = getStopByName(s.stop);
      return {
        name: s.stop,
        code: matched ? matched.code : s.stop.slice(0, 3).toUpperCase(),
        time: s.time,
        mins: s.mins,
        passed: s.mins < nowMins,
        isCurrentNext: false,
        isBoarding: idx === 0,
        isDropoff: idx === arr.length - 1,
      };
    });

  // Leg 2 stops
  const secondLegStops: JourneyStopInfo[] = chosen.leg2Trip.stops
    .slice(chosen.f2Idx, chosen.t2Idx + 1)
    .map((s, idx, arr) => {
      const matched = getStopByName(s.stop);
      return {
        name: s.stop,
        code: matched ? matched.code : s.stop.slice(0, 3).toUpperCase(),
        time: s.time,
        mins: s.mins,
        passed: false,
        isCurrentNext: false,
        isBoarding: idx === 0,
        isDropoff: idx === arr.length - 1,
      };
    });

  const diffMins = isNextDay ? chosen.depMins1 + 1440 - nowMins : Math.max(0, chosen.depMins1 - nowMins);
  const timeStr = diffMins >= 60 ? `${Math.floor(diffMins / 60)}h ${diffMins % 60}m` : `${diffMins}m`;

  let transferDepartures: UpcomingDeparture[] = [];
  if (upcomingTransfers.length > 0) {
    transferDepartures = upcomingTransfers.slice(0, 8).map(o => {
      const diff = o.depMins1 - nowMins;
      return {
        tripId: `${o.leg1Trip.id}_${o.leg2Trip.id}`,
        route: `${o.leg1Trip.routeNumber} ➔ ${o.leg2Trip.routeNumber}`,
        departureTime: o.leg1Trip.stops[o.f1Idx].time,
        arrivalTime: o.leg2Trip.stops[o.t2Idx].time,
        departureMins: o.depMins1,
        diffMins: Math.max(0, diff),
        isNextDay: false,
        isInTransit: false,
      };
    });
  } else {
    transferDepartures = transferOptions.slice(0, 8).map(o => {
      const diff = o.depMins1 + 1440 - nowMins;
      return {
        tripId: `${o.leg1Trip.id}_${o.leg2Trip.id}`,
        route: `${o.leg1Trip.routeNumber} ➔ ${o.leg2Trip.routeNumber}`,
        departureTime: o.leg1Trip.stops[o.f1Idx].time,
        arrivalTime: o.leg2Trip.stops[o.t2Idx].time,
        departureMins: o.depMins1,
        diffMins: diff,
        isNextDay: true,
        isInTransit: false,
      };
    });
  }

  return {
    trip: chosen.leg1Trip,
    fromStop,
    toStop,
    fromTime,
    toTime,
    departureMins: chosen.depMins1,
    arrivalMins: chosen.arrMins2,
    durationMins: chosen.totalDuration,
    fare: totalFare,
    classFareText: `₹${totalFare} · 1 Transfer via ${chosen.hub}`,
    routeBadge: `${chosen.leg1Trip.routeNumber} ➔ ${chosen.leg2Trip.routeNumber}`,
    countdownText: isNextDay
      ? `Tomorrow at ${fromTime}`
      : diffMins === 0
      ? 'Departing now'
      : `Departing in ${timeStr}`,
    timeRemainingText: isNextDay ? `Tomorrow ${fromTime}` : diffMins === 0 ? 'Now' : `in ${timeStr}`,
    progressPercent: 0,
    isUpcoming: true,
    isInTransit: false,
    currentStatusText: isNextDay
      ? `Today's service ended · Next bus tomorrow ${fromTime}`
      : `Change at ${chosen.hub} · ${chosen.waitMins} min transfer wait`,
    intermediateStopsCount: intermediateStops.length + secondLegStops.length - 1,
    intermediateStops,
    upcomingDepartures: transferDepartures,
    isTransfer: true,
    transferHub: chosen.hub,
    transferWaitMins: chosen.waitMins,
    connectingTrip: chosen.leg2Trip,
    connectingFromTime: hubDepartureTime,
    connectingToTime: toTime,
    secondLegStops,
  };
}

export function calculateJourney(
  fromName: string,
  toName: string,
  nowMins: number = getCurrentMinutesOfDay(),
  mode: 'next' | 'onboard' = 'next',
  selectedTripId?: string,
  forceServiceDay?: 'weekday' | 'weekend'
): ActiveJourney | null {
  const fromStop = getStopByName(fromName);
  const toStop = getStopByName(toName);

  if (!fromStop || !toStop) return null;
  if (fromStop.name === toStop.name) return null;

  const serviceDay = forceServiceDay || (isWeekendDay() ? 'weekend' : 'weekday');

  // Find all trips that contain both fromStop and toStop in proper sequential order
  let matchingTrips: {
    trip: Trip;
    fromIndex: number;
    toIndex: number;
    depMins: number;
    arrMins: number;
    originDepMins: number;
    destArrMins: number;
  }[] = [];

  for (const trip of schedules) {
    if (trip.serviceDay !== serviceDay) continue;

    let fIdx = -1;
    let tIdx = -1;

    trip.stops.forEach((s, idx) => {
      const sName = s.stop.toLowerCase();
      if (fIdx === -1 && (sName === fromStop.name.toLowerCase() || sName.includes(fromStop.shortName.toLowerCase()) || fromStop.name.toLowerCase().includes(sName))) {
        fIdx = idx;
      }
      if (tIdx === -1 && fIdx !== -1 && (sName === toStop.name.toLowerCase() || sName.includes(toStop.shortName.toLowerCase()) || toStop.name.toLowerCase().includes(sName))) {
        tIdx = idx;
      }
    });

    if (fIdx !== -1 && tIdx !== -1 && fIdx < tIdx) {
      matchingTrips.push({
        trip,
        fromIndex: fIdx,
        toIndex: tIdx,
        depMins: trip.stops[fIdx].mins,
        arrMins: trip.stops[tIdx].mins,
        originDepMins: trip.stops[0].mins,
        destArrMins: trip.stops[trip.stops.length - 1].mins,
      });
    }
  }

  // Fallback to other day schedule if none on current day
  if (matchingTrips.length === 0) {
    for (const trip of schedules) {
      if (trip.serviceDay === serviceDay) continue;
      let fIdx = -1;
      let tIdx = -1;
      trip.stops.forEach((s, idx) => {
        const sName = s.stop.toLowerCase();
        if (fIdx === -1 && (sName === fromStop.name.toLowerCase() || sName.includes(fromStop.shortName.toLowerCase()))) {
          fIdx = idx;
        }
        if (tIdx === -1 && fIdx !== -1 && (sName === toStop.name.toLowerCase() || sName.includes(toStop.shortName.toLowerCase()))) {
          tIdx = idx;
        }
      });
      if (fIdx !== -1 && tIdx !== -1 && fIdx < tIdx) {
        matchingTrips.push({
          trip,
          fromIndex: fIdx,
          toIndex: tIdx,
          depMins: trip.stops[fIdx].mins,
          arrMins: trip.stops[tIdx].mins,
          originDepMins: trip.stops[0].mins,
          destArrMins: trip.stops[trip.stops.length - 1].mins,
        });
      }
    }
  }

  if (matchingTrips.length === 0) {
    return calculateTransferJourney(fromStop, toStop, serviceDay, nowMins, mode);
  }

  // Sort matching trips chronologically by departure time from the boarding station
  matchingTrips.sort((a, b) => a.depMins - b.depMins);

  let chosen: (typeof matchingTrips)[0];
  let isNextDay = false;
  let isInTransit = false;

  if (selectedTripId) {
    const found = matchingTrips.find(m => m.trip.id === selectedTripId);
    if (found) {
      chosen = found;
      if (nowMins >= found.depMins && nowMins <= found.arrMins) {
        isInTransit = true;
      }
    } else {
      chosen = matchingTrips[0];
    }
  } else if (mode === 'onboard') {
    // Look for a bus that is currently running on the route between origin/boarding and destination
    const runningTrips = matchingTrips.filter(m => m.depMins <= nowMins && nowMins <= m.arrMins);
    if (runningTrips.length > 0) {
      chosen = runningTrips[0];
      isInTransit = true;
    } else {
      // If no trip exactly in range, find the most recent departed trip or nearest upcoming
      const pastTrips = matchingTrips.filter(m => m.depMins <= nowMins);
      if (pastTrips.length > 0) {
        chosen = pastTrips[pastTrips.length - 1];
        if (nowMins <= chosen.arrMins + 5) {
          isInTransit = true;
        }
      } else {
        chosen = matchingTrips[0];
      }
    }
  } else {
    // Mode 'next' (Waiting at station for upcoming bus)
    const upcomingTrips = matchingTrips.filter(m => m.depMins >= nowMins);
    if (upcomingTrips.length > 0) {
      chosen = upcomingTrips[0];
    } else {
      chosen = matchingTrips[0];
      isNextDay = true;
    }
  }

  const { trip, fromIndex, toIndex, depMins, arrMins } = chosen;
  const fromTime = trip.stops[fromIndex].time;
  const toTime = trip.stops[toIndex].time;
  const durationMins = arrMins >= depMins ? arrMins - depMins : (arrMins + 1440 - depMins);
  const fare = getFare(fromStop.name, toStop.name);

  // Check if chosen trip is actively running
  if (nowMins >= depMins && nowMins <= arrMins) {
    isInTransit = true;
  }

  // Build intermediate stops for the route timeline with rich status
  let nextFound = false;
  let nextStopName = '';
  let nextStopETA = '';

  const intermediateStops = trip.stops.slice(fromIndex, toIndex + 1).map((s, idx, arr) => {
    const matchedStop = getStopByName(s.stop);
    const passed = s.mins < nowMins;
    let isCurrentNext = false;

    if (isInTransit && !passed && !nextFound) {
      isCurrentNext = true;
      nextFound = true;
      nextStopName = matchedStop ? matchedStop.shortName : s.stop;
      const etaMins = Math.max(0, s.mins - nowMins);
      nextStopETA = etaMins === 0 ? 'Now' : `${etaMins}m`;
    }

    return {
      name: s.stop,
      code: matchedStop ? matchedStop.code : s.stop.slice(0, 3).toUpperCase(),
      time: s.time,
      mins: s.mins,
      passed,
      isCurrentNext,
      isBoarding: idx === 0,
      isDropoff: idx === arr.length - 1,
    };
  });

  const remainingStopsCount = intermediateStops.filter(s => !s.passed).length;

  // Calculate live countdown and status texts
  let countdownText = '';
  let timeRemainingText = '';
  let currentStatusText = '';
  let progressPercent = 0;

  if (isInTransit) {
    const totalJourneySpan = Math.max(1, arrMins - depMins);
    const elapsed = Math.max(0, nowMins - depMins);
    progressPercent = Math.min(100, Math.max(5, Math.round((elapsed / totalJourneySpan) * 100)));
    const minsToDest = Math.max(0, arrMins - nowMins);

    countdownText = nextStopName ? `Next: ${nextStopName} in ${nextStopETA}` : `Arriving at destination`;
    timeRemainingText = minsToDest === 0 ? 'Arriving now' : `${minsToDest}m left to ${toStop.shortName}`;
    currentStatusText = `Live on route · ${remainingStopsCount} stops remaining`;
  } else if (isNextDay) {
    let diffMins = depMins - nowMins;
    if (diffMins < 0) diffMins += 1440;
    const hrs = Math.floor(diffMins / 60);
    const remM = diffMins % 60;
    countdownText = `Tomorrow at ${fromTime}`;
    timeRemainingText = hrs > 0 ? `in ${hrs}h ${remM}m` : `in ${remM}m`;
    currentStatusText = 'First bus tomorrow';
    progressPercent = 0;
  } else {
    let diffMins = depMins - nowMins;
    if (diffMins < 0) diffMins += 1440;
    if (diffMins === 0) {
      countdownText = 'Departing now';
      timeRemainingText = 'Departing now';
      currentStatusText = 'Boarding open at shelter';
    } else if (diffMins <= 5) {
      countdownText = `Departing in ${diffMins}m`;
      timeRemainingText = `${diffMins} mins left`;
      currentStatusText = 'Arriving at shelter';
    } else {
      const hrs = Math.floor(diffMins / 60);
      const remM = diffMins % 60;
      const timeStr = hrs > 0 ? `${hrs}h ${remM}m` : `${remM}m`;
      countdownText = `Departing in ${timeStr}`;
      timeRemainingText = `in ${timeStr}`;
      currentStatusText = 'Scheduled departure';
    }
    progressPercent = 0;
  }

  const isWknd = trip.serviceDay === 'weekend';
  const classFareText = `₹${fare} / ${isWknd ? 'Weekend Express' : 'BRTS Corridor'}`;

  // Build upcoming departures strictly forward from current time (nowMins)
  // Trips earlier today have already departed and MUST NOT appear in upcoming departures!
  const todayUpcoming = matchingTrips
    .filter(m => m.depMins >= nowMins - 1)
    .map(m => {
      const diff = m.depMins - nowMins;
      const inTransit = m.depMins <= nowMins && nowMins <= m.arrMins;
      return {
        tripId: m.trip.id,
        route: m.trip.route,
        departureTime: m.trip.stops[m.fromIndex].time,
        arrivalTime: m.trip.stops[m.toIndex].time,
        departureMins: m.depMins,
        diffMins: Math.max(0, diff),
        isNextDay: false,
        isInTransit: inTransit,
      };
    });

  let upcomingDepartures: UpcomingDeparture[] = [];

  if (todayUpcoming.length > 0) {
    todayUpcoming.sort((a, b) => a.diffMins - b.diffMins);
    upcomingDepartures = todayUpcoming.slice(0, 8);
  } else {
    // All today's buses have departed; show tomorrow's morning departures
    const tomorrowDepartures = matchingTrips.map(m => {
      const diff = m.depMins + 1440 - nowMins;
      return {
        tripId: m.trip.id,
        route: m.trip.route,
        departureTime: m.trip.stops[m.fromIndex].time,
        arrivalTime: m.trip.stops[m.toIndex].time,
        departureMins: m.depMins,
        diffMins: diff,
        isNextDay: true,
        isInTransit: false,
      };
    });
    tomorrowDepartures.sort((a, b) => a.departureMins - b.departureMins);
    upcomingDepartures = tomorrowDepartures.slice(0, 8);
  }

  return {
    trip,
    fromStop,
    toStop,
    fromTime,
    toTime,
    departureMins: depMins,
    arrivalMins: arrMins,
    durationMins,
    fare,
    classFareText,
    routeBadge: trip.route,
    countdownText,
    timeRemainingText,
    progressPercent,
    isUpcoming: !isInTransit,
    isInTransit,
    currentStatusText,
    nextStopName: nextStopName || undefined,
    nextStopETA: nextStopETA || undefined,
    remainingStopsCount,
    intermediateStopsCount: intermediateStops.length,
    intermediateStops,
    upcomingDepartures
  };
}

export function findTripByDesiredArrival(
  fromName: string,
  toName: string,
  desiredArrivalMins: number,
  forceServiceDay?: 'weekday' | 'weekend'
): ActiveJourney | null {
  const fromStop = getStopByName(fromName);
  const toStop = getStopByName(toName);

  if (!fromStop || !toStop || fromStop.id === toStop.id) {
    return null;
  }

  const serviceDay = forceServiceDay ?? (isWeekendDay() ? 'weekend' : 'weekday');

  // Find trips that arrive before or close to desiredArrivalMins
  const candidateTrips: {
    trip: Trip;
    fromIndex: number;
    toIndex: number;
    depMins: number;
    arrMins: number;
  }[] = [];

  for (const trip of schedules) {
    if (trip.serviceDay !== serviceDay) continue;
    let fIdx = -1;
    let tIdx = -1;
    trip.stops.forEach((s, idx) => {
      const sName = s.stop.toLowerCase();
      if (fIdx === -1 && (sName === fromStop.name.toLowerCase() || sName.includes(fromStop.shortName.toLowerCase()))) {
        fIdx = idx;
      }
      if (tIdx === -1 && fIdx !== -1 && (sName === toStop.name.toLowerCase() || sName.includes(toStop.shortName.toLowerCase()))) {
        tIdx = idx;
      }
    });
    if (fIdx !== -1 && tIdx !== -1 && fIdx < tIdx) {
      candidateTrips.push({
        trip,
        fromIndex: fIdx,
        toIndex: tIdx,
        depMins: trip.stops[fIdx].mins,
        arrMins: trip.stops[tIdx].mins
      });
    }
  }

  if (candidateTrips.length === 0) return null;

  // Filter those that arrive before or exactly at desiredArrivalMins
  const onTimeTrips = candidateTrips.filter(t => t.arrMins <= desiredArrivalMins);
  let chosen = onTimeTrips.length > 0 
    ? onTimeTrips[onTimeTrips.length - 1] // latest bus that still gets there on time
    : candidateTrips[0]; // or earliest bus of day

  const { trip, fromIndex, toIndex, depMins, arrMins } = chosen;
  const fromTime = trip.stops[fromIndex].time;
  const toTime = trip.stops[toIndex].time;
  const durationMins = arrMins >= depMins ? arrMins - depMins : (arrMins + 1440 - depMins);
  const fare = getFare(fromStop.name, toStop.name);
  const isWknd = trip.serviceDay === 'weekend';

  return {
    trip,
    fromStop,
    toStop,
    fromTime,
    toTime,
    departureMins: depMins,
    arrivalMins: arrMins,
    durationMins,
    fare,
    classFareText: `₹${fare} / ${isWknd ? 'Weekend Express' : 'BRTS Corridor'}`,
    routeBadge: trip.route,
    countdownText: `Reaches by ${toTime}`,
    timeRemainingText: `${durationMins}m transit`,
    progressPercent: 0,
    isUpcoming: true,
    isInTransit: false,
    currentStatusText: `Optimal for arrival by ${formatMinutesToTime(desiredArrivalMins)}`,
    intermediateStopsCount: toIndex - fromIndex + 1,
    intermediateStops: trip.stops.slice(fromIndex, toIndex + 1).map((s, idx, arr) => ({
      name: s.stop,
      code: getStopByName(s.stop)?.code ?? s.stop.slice(0, 3).toUpperCase(),
      time: s.time,
      mins: s.mins,
      passed: false,
      isCurrentNext: idx === 0,
      isBoarding: idx === 0,
      isDropoff: idx === arr.length - 1,
    })),
    upcomingDepartures: []
  };
}

export interface StationDeparture {
  tripId: string;
  route: string;
  routeNumber: string;
  routeType: 'trunk' | 'feeder';
  departureTime: string;
  destination: string;
  departureMins: number;
  diffMins: number;
  isNextDay: boolean;
}

export function getStationDepartures(
  stationName: string,
  nowMins: number = getCurrentMinutesOfDay()
): StationDeparture[] {
  const departures: StationDeparture[] = [];
  const serviceDay = isWeekendDay() ? 'weekend' : 'weekday';
  const q = stationName.trim().toLowerCase();

  for (const trip of schedules) {
    if (trip.serviceDay !== serviceDay) continue;
    const stopIdx = trip.stops.findIndex(
      s => s.stop.toLowerCase() === q || s.stop.toLowerCase().includes(q) || q.includes(s.stop.toLowerCase())
    );
    if (stopIdx !== -1 && stopIdx < trip.stops.length - 1) {
      const depStop = trip.stops[stopIdx];
      const diff = depStop.mins - nowMins;
      departures.push({
        tripId: trip.id,
        route: trip.route,
        routeNumber: trip.routeNumber,
        routeType: trip.routeType || 'trunk',
        departureTime: depStop.time,
        destination: trip.destination,
        departureMins: depStop.mins,
        diffMins: diff >= 0 ? diff : diff + 1440,
        isNextDay: diff < 0,
      });
    }
  }

  departures.sort((a, b) => a.diffMins - b.diffMins);
  return departures.slice(0, 8);
}

export function getRoutesServingStation(stationName: string): string[] {
  const q = stationName.trim().toLowerCase();
  const routesSet = new Set<string>();
  for (const trip of schedules) {
    if (trip.stops.some(s => s.stop.toLowerCase() === q || s.stop.toLowerCase().includes(q) || q.includes(s.stop.toLowerCase()))) {
      routesSet.add(trip.routeNumber);
    }
  }
  return Array.from(routesSet);
}
