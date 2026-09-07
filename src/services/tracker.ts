import rawStops from '../data/stops.json';
import rawSchedules from '../data/schedules.json';
import rawFares from '../data/fares.json';
import rawPopularRoutes from '../data/popular_routes.json';
import { Stop, Trip, ActiveJourney, PopularRoute, UpcomingDeparture, JourneyStopInfo, NearbyStation, NearbyDirectAlternative, OptimalProximityHop, NearbyServiceStation } from '../types';

export const stops: Stop[] = rawStops as Stop[];
export const schedules: Trip[] = rawSchedules as Trip[];
export const fares: Record<string, Record<string, number>> = rawFares as Record<string, Record<string, number>>;
export const popularRoutes: PopularRoute[] = rawPopularRoutes as PopularRoute[];

export function matchStop(scheduleStopName: string, targetStop: Stop): boolean {
  if (!scheduleStopName || !targetStop) return false;
  const s = scheduleStopName.trim().toLowerCase();
  const targetName = targetStop.name.trim().toLowerCase();
  const targetShort = targetStop.shortName.trim().toLowerCase();
  const targetCode = targetStop.code.trim().toLowerCase();

  // Guard: Railway Station must NEVER match CBD Railway Station
  if ((targetShort === 'railway station' || targetName.includes('raipur railway station')) && s.includes('cbd')) {
    return false;
  }

  // Guard: HNLU Gate must NEVER match HNLU terminal, and vice-versa
  if ((targetShort === 'hnlu gate' || targetName.includes('hnlu gate')) && s === 'hnlu') {
    return false;
  }
  if ((targetShort === 'hnlu' || targetName.includes('hnlu (national law university)')) && (s.includes('gate') || s === 'hnlu gate')) {
    return false;
  }

  // Exact matches
  if (s === targetName || s === targetShort || s === targetCode) {
    return true;
  }

  // Known official timetable aliases from BRTS PDF schedules
  if ((targetShort === 'iiit' || targetCode === 'iiit') && (s === 'iit' || s === 'iiit' || s === 'iiit naya raipur')) return true;
  if (targetShort === 'nawagaon' && (s === 'navagaon' || s === 'nawagaon')) return true;
  if (targetShort === 'cricket stadium' && (s === 'stadium' || s === 'cricket stadium')) return true;
  if (targetShort === 'rawatpura univ' && (s.includes('rawatpura') || s === 'rawatpura sarkar hospital')) return true;

  // Substring matching
  if (targetShort.length >= 4 && s.includes(targetShort)) return true;
  if (targetName.length >= 5 && targetName.includes(s)) return true;

  return false;
}

export function getStopByName(nameQuery: string): Stop | undefined {
  if (!nameQuery) return undefined;
  const q = nameQuery.trim().toLowerCase();

  // Explicit aliases for unambiguous station resolution
  if (q === 'railway station' || q === 'railway stn' || q === 'station' || q === 'raipur station') {
    return stops.find(s => s.id === 'RRS' || s.shortName.toLowerCase() === 'railway station');
  }
  if (q === 'iiit' || q === 'iiit naya raipur' || q === 'iit') {
    return stops.find(s => s.id === 'IIT');
  }
  if (q === 'navagaon' || q === 'nawagaon') {
    return stops.find(s => s.id === 'NWG');
  }
  if (q === 'stadium' || q === 'cricket stadium') {
    return stops.find(s => s.id === 'STD');
  }
  if (q.includes('rawatpura')) {
    return stops.find(s => s.id === 'RSU');
  }

  // 1. Exact match priority (shortName, code, or full name)
  const exact = stops.find(
    s =>
      s.shortName.toLowerCase() === q ||
      s.code.toLowerCase() === q ||
      s.name.toLowerCase() === q
  );
  if (exact) return exact;

  // 2. Starts-with match
  const starts = stops.find(
    s =>
      s.shortName.toLowerCase().startsWith(q) ||
      s.name.toLowerCase().startsWith(q)
  );
  if (starts) return starts;

  // 3. Fallback to includes (excluding CBD when looking for Railway Station)
  return stops.find(s => {
    if (q.includes('railway') && s.shortName.toLowerCase().includes('cbd')) return false;
    return s.name.toLowerCase().includes(q) || s.shortName.toLowerCase().includes(q);
  });
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

export function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatDistance(distKm: number): string {
  if (distKm < 1) {
    return `${Math.round(distKm * 1000)}m`;
  }
  return `${distKm.toFixed(1)} km`;
}

export function getNearbyStations(stationNameQuery: string, maxKm: number = 2.5): NearbyStation[] {
  const target = getStopByName(stationNameQuery);
  if (!target || !target.coordinates) return [];

  const results: NearbyStation[] = [];

  for (const s of stops) {
    if (s.id === target.id || !s.coordinates) continue;
    const dist = getDistanceKm(
      target.coordinates.latitude,
      target.coordinates.longitude,
      s.coordinates.latitude,
      s.coordinates.longitude
    );
    if (dist <= maxKm) {
      results.push({
        stop: s,
        distanceKm: Math.round(dist * 100) / 100,
        walkingMins: Math.max(1, Math.round((dist / 4.5) * 60)),
        distanceFormatted: formatDistance(dist),
      });
    }
  }

  results.sort((a, b) => a.distanceKm - b.distanceKm);
  return results;
}

export function getNearbyStationsFromCoordinates(
  userLat: number,
  userLon: number,
  maxKm: number = 2.5
): NearbyStation[] {
  const results: NearbyStation[] = [];

  for (const s of stops) {
    if (!s.coordinates) continue;
    const dist = getDistanceKm(
      userLat,
      userLon,
      s.coordinates.latitude,
      s.coordinates.longitude
    );
    if (dist <= maxKm) {
      results.push({
        stop: s,
        distanceKm: Math.round(dist * 100) / 100,
        walkingMins: Math.max(1, Math.round((dist / 4.5) * 60)),
        distanceFormatted: formatDistance(dist),
      });
    }
  }

  results.sort((a, b) => a.distanceKm - b.distanceKm);
  return results;
}

export function getNearestStopFromCoordinates(
  userLat: number,
  userLon: number
): NearbyStation | null {
  const nearby = getNearbyStationsFromCoordinates(userLat, userLon, 25);
  return nearby.length > 0 ? nearby[0] : null;
}

export function findNearbyDirectAlternatives(
  fromName: string,
  toName: string,
  forceServiceDay?: 'weekday' | 'weekend',
  nowMins: number = getCurrentMinutesOfDay(),
  maxRadiusKm: number = 3.5
): NearbyDirectAlternative[] {
  const fromStop = getStopByName(fromName);
  const toStop = getStopByName(toName);
  if (!fromStop || !toStop) return [];

  const serviceDay = forceServiceDay || (isWeekendDay() ? 'weekend' : 'weekday');
  const alternatives: NearbyDirectAlternative[] = [];

  // 1. Nearby origins to fromStop that have a direct bus to toStop
  const nearbyOrigins = getNearbyStations(fromStop.name, maxRadiusKm);
  for (const nearby of nearbyOrigins) {
    if (nearby.stop.id === fromStop.id || nearby.stop.id === toStop.id) continue;

    // Strict walking buffer: bus departure must be after the user finishes walking there
    const earliestBoardingMins = nowMins + Math.max(1, nearby.walkingMins - 1);

    const matching: { trip: Trip; fIdx: number; tIdx: number; depMins: number; arrMins: number }[] = [];
    for (const trip of schedules) {
      if (trip.serviceDay !== serviceDay) continue;
      let fIdx = -1;
      let tIdx = -1;
      trip.stops.forEach((s, idx) => {
        if (fIdx === -1 && matchStop(s.stop, nearby.stop)) {
          fIdx = idx;
        }
        if (tIdx === -1 && fIdx !== -1 && matchStop(s.stop, toStop)) {
          tIdx = idx;
        }
      });
      if (fIdx !== -1 && tIdx !== -1 && fIdx < tIdx) {
        matching.push({ trip, fIdx, tIdx, depMins: trip.stops[fIdx].mins, arrMins: trip.stops[tIdx].mins });
      }
    }

    if (matching.length > 0) {
      matching.sort((a, b) => a.depMins - b.depMins);
      const reachableToday = matching.filter(m => m.depMins >= earliestBoardingMins);
      const pastToday = matching.filter(m => m.depMins < nowMins);
      const lastDeparted = pastToday.length > 0 ? pastToday[pastToday.length - 1] : null;

      let chosen: (typeof matching)[0];
      let isToday = true;

      if (reachableToday.length > 0) {
        chosen = reachableToday[0];
      } else {
        chosen = matching[0];
        isToday = false;
      }

      const durationMins = chosen.arrMins >= chosen.depMins ? chosen.arrMins - chosen.depMins : (chosen.arrMins + 1440 - chosen.depMins);
      const minutesUntilDeparture = isToday
        ? Math.max(0, chosen.depMins - nowMins)
        : (chosen.depMins + 1440 - nowMins);

      alternatives.push({
        type: 'nearby_origin',
        suggestedStop: nearby.stop,
        referenceStop: fromStop,
        targetStop: toStop,
        distanceKm: nearby.distanceKm,
        walkingMins: nearby.walkingMins,
        distanceFormatted: nearby.distanceFormatted,
        routeNumber: chosen.trip.routeNumber,
        routeName: chosen.trip.route,
        departureTime: chosen.trip.stops[chosen.fIdx].time,
        arrivalTime: chosen.trip.stops[chosen.tIdx].time,
        durationMins,
        fare: getFare(nearby.stop.name, toStop.name),
        depMins: chosen.depMins,
        minutesUntilDeparture,
        isToday,
        previousDepartureTime: lastDeparted ? lastDeparted.trip.stops[lastDeparted.fIdx].time : undefined,
        isReachableNow: isToday && chosen.depMins >= earliestBoardingMins,
      });
    }
  }

  // 2. Nearby destinations to toStop that can be reached directly from fromStop
  const nearbyDestinations = getNearbyStations(toStop.name, maxRadiusKm);
  for (const nearby of nearbyDestinations) {
    if (nearby.stop.id === fromStop.id || nearby.stop.id === toStop.id) continue;
    if (alternatives.some(a => a.suggestedStop.id === nearby.stop.id)) continue;

    const matching: { trip: Trip; fIdx: number; tIdx: number; depMins: number; arrMins: number }[] = [];
    for (const trip of schedules) {
      if (trip.serviceDay !== serviceDay) continue;
      let fIdx = -1;
      let tIdx = -1;
      trip.stops.forEach((s, idx) => {
        if (fIdx === -1 && matchStop(s.stop, fromStop)) {
          fIdx = idx;
        }
        if (tIdx === -1 && fIdx !== -1 && matchStop(s.stop, nearby.stop)) {
          tIdx = idx;
        }
      });
      if (fIdx !== -1 && tIdx !== -1 && fIdx < tIdx) {
        matching.push({ trip, fIdx, tIdx, depMins: trip.stops[fIdx].mins, arrMins: trip.stops[tIdx].mins });
      }
    }

    if (matching.length > 0) {
      matching.sort((a, b) => a.depMins - b.depMins);
      const reachableToday = matching.filter(m => m.depMins >= nowMins - 1);
      const pastToday = matching.filter(m => m.depMins < nowMins);
      const lastDeparted = pastToday.length > 0 ? pastToday[pastToday.length - 1] : null;

      let chosen: (typeof matching)[0];
      let isToday = true;

      if (reachableToday.length > 0) {
        chosen = reachableToday[0];
      } else {
        chosen = matching[0];
        isToday = false;
      }

      const durationMins = chosen.arrMins >= chosen.depMins ? chosen.arrMins - chosen.depMins : (chosen.arrMins + 1440 - chosen.depMins);
      const minutesUntilDeparture = isToday
        ? Math.max(0, chosen.depMins - nowMins)
        : (chosen.depMins + 1440 - nowMins);

      alternatives.push({
        type: 'nearby_destination',
        suggestedStop: nearby.stop,
        referenceStop: toStop,
        targetStop: fromStop,
        distanceKm: nearby.distanceKm,
        walkingMins: nearby.walkingMins,
        distanceFormatted: nearby.distanceFormatted,
        routeNumber: chosen.trip.routeNumber,
        routeName: chosen.trip.route,
        departureTime: chosen.trip.stops[chosen.fIdx].time,
        arrivalTime: chosen.trip.stops[chosen.tIdx].time,
        durationMins,
        fare: getFare(fromStop.name, nearby.stop.name),
        depMins: chosen.depMins,
        minutesUntilDeparture,
        isToday,
        previousDepartureTime: lastDeparted ? lastDeparted.trip.stops[lastDeparted.fIdx].time : undefined,
        isReachableNow: isToday,
      });
    }
  }

  // Prioritize active trips running today, then nearest distance
  alternatives.sort((a, b) => {
    if (a.isToday && !b.isToday) return -1;
    if (!a.isToday && b.isToday) return 1;
    if (a.isReachableNow && !b.isReachableNow) return -1;
    if (!a.isReachableNow && b.isReachableNow) return 1;
    return a.distanceKm - b.distanceKm;
  });

  return alternatives.slice(0, 4);
}

export function getNearbyStationsWithService(
  fromName: string,
  toName: string,
  forceServiceDay?: 'weekday' | 'weekend',
  nowMins: number = getCurrentMinutesOfDay(),
  maxRadiusKm: number = 2.5
): NearbyServiceStation[] {
  const fromStop = getStopByName(fromName);
  const toStop = getStopByName(toName);
  if (!fromStop || !toStop) return [];

  const serviceDay = forceServiceDay || (isWeekendDay() ? 'weekend' : 'weekday');
  const results: NearbyServiceStation[] = [];

  // 1. Nearby origins to fromStop that have a direct bus to toStop
  const nearbyOrigins = getNearbyStations(fromStop.name, maxRadiusKm);
  for (const nearby of nearbyOrigins) {
    if (nearby.stop.id === fromStop.id || nearby.stop.id === toStop.id) continue;

    const earliestBoardingMins = nowMins + Math.max(1, nearby.walkingMins - 1);

    const matching: { trip: Trip; fIdx: number; tIdx: number; depMins: number }[] = [];
    for (const trip of schedules) {
      if (trip.serviceDay !== serviceDay) continue;
      let fIdx = -1, tIdx = -1;
      trip.stops.forEach((s, idx) => {
        if (fIdx === -1 && matchStop(s.stop, nearby.stop)) fIdx = idx;
        if (tIdx === -1 && fIdx !== -1 && matchStop(s.stop, toStop)) tIdx = idx;
      });
      if (fIdx !== -1 && tIdx !== -1 && fIdx < tIdx) {
        matching.push({ trip, fIdx, tIdx, depMins: trip.stops[fIdx].mins });
      }
    }

    if (matching.length > 0) {
      matching.sort((a, b) => a.depMins - b.depMins);
      const reachableToday = matching.filter(m => m.depMins >= earliestBoardingMins);

      let chosen: (typeof matching)[0];
      let isToday = true;

      if (reachableToday.length > 0) {
        chosen = reachableToday[0];
      } else {
        chosen = matching[0];
        isToday = false;
      }

      const depTime = chosen.trip.stops[chosen.fIdx].time;
      const minutesUntilDeparture = isToday
        ? Math.max(0, chosen.depMins - nowMins)
        : (chosen.depMins + 1440 - nowMins);

      const routeSummary = isToday
        ? `Bus ${chosen.trip.routeNumber} at ${depTime} (in ${minutesUntilDeparture}m · ~${nearby.walkingMins}m walk)`
        : `Service ended today · First bus tomorrow at ${depTime} (Bus ${chosen.trip.routeNumber})`;

      results.push({
        stop: nearby.stop,
        distanceKm: nearby.distanceKm,
        walkingMins: nearby.walkingMins,
        distanceFormatted: nearby.distanceFormatted,
        serviceType: 'direct',
        actionType: 'board',
        routeNumber: chosen.trip.routeNumber,
        depMins: chosen.depMins,
        minutesUntilDeparture,
        departureTimeText: depTime,
        isToday,
        routeSummary,
      });
    }
  }

  // 2. Nearby destinations to toStop that can be reached directly from fromStop
  const nearbyDestinations = getNearbyStations(toStop.name, maxRadiusKm);
  for (const nearby of nearbyDestinations) {
    if (nearby.stop.id === fromStop.id || nearby.stop.id === toStop.id) continue;
    if (results.some(r => r.stop.id === nearby.stop.id)) continue;

    const matching: { trip: Trip; fIdx: number; tIdx: number; depMins: number }[] = [];
    for (const trip of schedules) {
      if (trip.serviceDay !== serviceDay) continue;
      let fIdx = -1, tIdx = -1;
      trip.stops.forEach((s, idx) => {
        if (fIdx === -1 && matchStop(s.stop, fromStop)) fIdx = idx;
        if (tIdx === -1 && fIdx !== -1 && matchStop(s.stop, nearby.stop)) tIdx = idx;
      });
      if (fIdx !== -1 && tIdx !== -1 && fIdx < tIdx) {
        matching.push({ trip, fIdx, tIdx, depMins: trip.stops[fIdx].mins });
      }
    }

    if (matching.length > 0) {
      matching.sort((a, b) => a.depMins - b.depMins);
      const reachableToday = matching.filter(m => m.depMins >= nowMins - 1);

      let chosen: (typeof matching)[0];
      let isToday = true;

      if (reachableToday.length > 0) {
        chosen = reachableToday[0];
      } else {
        chosen = matching[0];
        isToday = false;
      }

      const depTime = chosen.trip.stops[chosen.fIdx].time;
      const minutesUntilDeparture = isToday
        ? Math.max(0, chosen.depMins - nowMins)
        : (chosen.depMins + 1440 - nowMins);

      const routeSummary = isToday
        ? `Bus ${chosen.trip.routeNumber} at ${depTime} (departs in ${minutesUntilDeparture}m) to ${nearby.stop.shortName} (~${nearby.walkingMins}m walk)`
        : `Service ended today · First bus tomorrow at ${depTime} to ${nearby.stop.shortName}`;

      results.push({
        stop: nearby.stop,
        distanceKm: nearby.distanceKm,
        walkingMins: nearby.walkingMins,
        distanceFormatted: nearby.distanceFormatted,
        serviceType: 'direct',
        actionType: 'deboard',
        routeNumber: chosen.trip.routeNumber,
        depMins: chosen.depMins,
        minutesUntilDeparture,
        departureTimeText: depTime,
        isToday,
        routeSummary,
      });
    }
  }

  // Prioritize active trips running today
  results.sort((a, b) => {
    if (a.isToday && !b.isToday) return -1;
    if (!a.isToday && b.isToday) return 1;
    return a.distanceKm - b.distanceKm;
  });

  return results.slice(0, 4);
}

export function getOptimalProximityHop(
  fromStop: Stop,
  toStop: Stop,
  serviceDay: 'weekday' | 'weekend' = isWeekendDay() ? 'weekend' : 'weekday',
  nowMins: number = getCurrentMinutesOfDay(),
  transferDurationMins: number = 60
): OptimalProximityHop | null {
  if (!fromStop || !toStop || !fromStop.coordinates || !toStop.coordinates) return null;

  const directDist = getDistanceKm(
    fromStop.coordinates.latitude,
    fromStop.coordinates.longitude,
    toStop.coordinates.latitude,
    toStop.coordinates.longitude
  );

  // If stations are more than 3.5 km apart, this is not a short-hop neighbour situation
  if (directDist > 3.5) return null;

  const directWalkingMins = Math.max(1, Math.round((directDist / 4.5) * 60));

  let bestHop: {
    trip: Trip;
    fIdx: number;
    tIdx: number;
    dropStop: Stop;
    busRideMins: number;
    walkDist: number;
    walkMins: number;
    totalCommuteMins: number;
  } | null = null;

  // Search trips for a direct bus to a nearby station within 900m of toStop
  for (const trip of schedules) {
    if (trip.serviceDay !== serviceDay) continue;
    let fIdx = -1;
    trip.stops.forEach((s, idx) => {
      const sName = s.stop.toLowerCase();
      if (fIdx === -1 && (sName === fromStop.name.toLowerCase() || sName === fromStop.shortName.toLowerCase() || sName.includes(fromStop.shortName.toLowerCase()))) {
        fIdx = idx;
      }
    });
    if (fIdx === -1) continue;

    for (let tIdx = fIdx + 1; tIdx < trip.stops.length; tIdx++) {
      const dropStopName = trip.stops[tIdx].stop;
      const dropStop = getStopByName(dropStopName);
      if (!dropStop || !dropStop.coordinates) continue;

      const walkDist = getDistanceKm(
        dropStop.coordinates.latitude,
        dropStop.coordinates.longitude,
        toStop.coordinates.latitude,
        toStop.coordinates.longitude
      );

      // Drops within 900m of destination
      if (walkDist <= 0.9) {
        const busRideMins = trip.stops[tIdx].mins >= trip.stops[fIdx].mins
          ? trip.stops[tIdx].mins - trip.stops[fIdx].mins
          : trip.stops[tIdx].mins + 1440 - trip.stops[fIdx].mins;
        const walkMins = Math.max(1, Math.round((walkDist / 4.5) * 60));
        const totalCommuteMins = busRideMins + walkMins;

        if (!bestHop || totalCommuteMins < bestHop.totalCommuteMins) {
          bestHop = {
            trip,
            fIdx,
            tIdx,
            dropStop,
            busRideMins,
            walkDist,
            walkMins,
            totalCommuteMins,
          };
        }
      }
    }
  }

  // If a best route was found, pick the next upcoming departure for it
  if (bestHop) {
    const upcomingSame = schedules.filter(t => 
      t.serviceDay === serviceDay &&
      t.routeNumber === bestHop!.trip.routeNumber &&
      t.stops.some(s => s.stop.toLowerCase().includes(fromStop.shortName.toLowerCase()) && s.mins >= nowMins - 1)
    );
    if (upcomingSame.length > 0) {
      upcomingSame.sort((a, b) => {
        const aStop = a.stops.find(s => s.stop.toLowerCase().includes(fromStop.shortName.toLowerCase()))!;
        const bStop = b.stops.find(s => s.stop.toLowerCase().includes(fromStop.shortName.toLowerCase()))!;
        return aStop.mins - bStop.mins;
      });
      const upTrip = upcomingSame[0];
      const fIdx = upTrip.stops.findIndex(s => s.stop.toLowerCase().includes(fromStop.shortName.toLowerCase()));
      const tIdx = upTrip.stops.findIndex(s => s.stop.toLowerCase().includes(bestHop!.dropStop.shortName.toLowerCase()));
      if (fIdx !== -1 && tIdx !== -1 && fIdx < tIdx) {
        bestHop.trip = upTrip;
        bestHop.fIdx = fIdx;
        bestHop.tIdx = tIdx;
      }
    }
  }

  if (!bestHop) {
    return {
      isProximityRoute: true,
      directDistanceKm: Math.round(directDist * 100) / 100,
      directDistanceFormatted: formatDistance(directDist),
      directWalkingMins,
      hasShortHopBus: false,
      circuitTransferDurationMins: transferDurationMins,
      minutesSaved: Math.max(0, transferDurationMins - directWalkingMins),
      explanation: `${fromStop.shortName} aur ${toStop.shortName} ke beech direct distance sirf ${formatDistance(directDist)} hai.`
    };
  }

  const minutesSaved = Math.max(0, transferDurationMins - bestHop.totalCommuteMins);

  return {
    isProximityRoute: true,
    directDistanceKm: Math.round(directDist * 100) / 100,
    directDistanceFormatted: formatDistance(directDist),
    directWalkingMins,
    hasShortHopBus: true,
    shortHopBus: {
      busNumber: bestHop.trip.routeNumber,
      routeName: bestHop.trip.route,
      boardStation: fromStop.shortName,
      dropStation: bestHop.dropStop.name,
      dropStationShortName: bestHop.dropStop.shortName,
      departureTime: bestHop.trip.stops[bestHop.fIdx].time,
      arrivalTime: bestHop.trip.stops[bestHop.tIdx].time,
      departureMins: bestHop.trip.stops[bestHop.fIdx].mins,
      arrivalMins: bestHop.trip.stops[bestHop.tIdx].mins,
      busRideMins: bestHop.busRideMins,
      walkFromDropKm: Math.round(bestHop.walkDist * 100) / 100,
      walkFromDropFormatted: formatDistance(bestHop.walkDist),
      walkFromDropMins: bestHop.walkMins,
      totalCommuteMins: bestHop.totalCommuteMins,
      fare: getFare(fromStop.name, bestHop.dropStop.name) || 10,
    },
    circuitTransferDurationMins: transferDurationMins,
    minutesSaved,
    explanation: `${fromStop.shortName} aur ${toStop.shortName} ke beech doori sirf ${formatDistance(directDist)} hai. Circular loop bus transfer ${transferDurationMins} min leta hai, jabki Bus ${bestHop.trip.routeNumber} se ${bestHop.dropStop.shortName} (sirf ${bestHop.busRideMins}m) + ${formatDistance(bestHop.walkDist)} walk se aap sirf ${bestHop.totalCommuteMins} min me pahunch jaoge!`
  };
}

function calculateTransferJourney(
  fromStop: Stop,
  toStop: Stop,
  serviceDay: 'weekday' | 'weekend',
  nowMins: number,
  mode: 'next' | 'onboard' = 'next',
  selectedTripId?: string
): ActiveJourney | null {
  const hubs = ['North Block', 'CBD', 'HNLU', 'Sector 30', 'Sector 27', 'Sector 29', 'Telibandha', 'Sector 22', 'Navagaon', 'Sector 17'];

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
        if (fIdx === -1 && matchStop(s.stop, fromStop)) {
          fIdx = idx;
        }
        if (tIdx === -1 && fIdx !== -1 && matchStop(s.stop, hubStop)) {
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
        if (fIdx === -1 && matchStop(s.stop, hubStop)) {
          fIdx = idx;
        }
        if (tIdx === -1 && fIdx !== -1 && matchStop(s.stop, toStop)) {
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

  // Deduplicate transfer options by departure time (depMins1)
  // If multiple interchange hubs or connection pairings exist for the exact same initial bus departure,
  // select the optimal option (shortest total duration, then shortest platform wait time).
  const uniqueTransferMap = new Map<number, TransferOption>();
  for (const opt of transferOptions) {
    const existing = uniqueTransferMap.get(opt.depMins1);
    if (!existing) {
      uniqueTransferMap.set(opt.depMins1, opt);
    } else {
      if (
        opt.totalDuration < existing.totalDuration ||
        (opt.totalDuration === existing.totalDuration && opt.waitMins < existing.waitMins)
      ) {
        uniqueTransferMap.set(opt.depMins1, opt);
      }
    }
  }

  const dedupedOptions = Array.from(uniqueTransferMap.values()).sort((a, b) => a.depMins1 - b.depMins1);

  // Filter for upcoming departures
  const upcomingTransfers = dedupedOptions.filter(t => t.depMins1 >= nowMins - 1);

  let chosen: TransferOption;
  let isNextDay = false;
  if (selectedTripId) {
    const found = dedupedOptions.find(o => `${o.leg1Trip.id}_${o.leg2Trip.id}` === selectedTripId);
    if (found) {
      chosen = found;
      isNextDay = chosen.depMins1 < nowMins - 1;
    } else {
      chosen = upcomingTransfers.length > 0 ? upcomingTransfers[0] : dedupedOptions[0];
      isNextDay = upcomingTransfers.length === 0;
    }
  } else {
    chosen = upcomingTransfers.length > 0 ? upcomingTransfers[0] : dedupedOptions[0];
    isNextDay = upcomingTransfers.length === 0;
  }

  const fare1 = getFare(fromStop.name, chosen.hub);
  const fare2 = getFare(chosen.hub, toStop.name);
  const totalFare = fare1 + fare2;

  const fromTime = chosen.leg1Trip.stops[chosen.f1Idx].time;
  const toTime = chosen.leg2Trip.stops[chosen.t2Idx].time;
  const hubArrivalTime = chosen.leg1Trip.stops[chosen.t1Idx].time;
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

  const pastTransfersToday = dedupedOptions.filter(t => t.depMins1 < nowMins - 1);
  const serviceEndedToday = isNextDay;
  const lastDepartedTransfer = pastTransfersToday.length > 0 ? pastTransfersToday[pastTransfersToday.length - 1] : null;
  const lastDepartedTodayTime = lastDepartedTransfer ? lastDepartedTransfer.leg1Trip.stops[lastDepartedTransfer.f1Idx].time : undefined;

  // Build upcoming departures, and include previous departed buses from today (so users can see earlier schedule)
  const pastDeparturesList: UpcomingDeparture[] = pastTransfersToday.slice(-2).map((o, idx, arr) => {
    const diff = o.depMins1 - nowMins;
    return {
      tripId: `${o.leg1Trip.id}_${o.leg2Trip.id}`,
      route: `${o.leg1Trip.routeNumber} ➔ ${o.leg2Trip.routeNumber}`,
      departureTime: o.leg1Trip.stops[o.f1Idx].time,
      arrivalTime: o.leg2Trip.stops[o.t2Idx].time,
      departureMins: o.depMins1,
      diffMins: diff,
      isNextDay: false,
      isDeparted: true,
      isLastToday: idx === arr.length - 1,
      isInTransit: false,
    };
  });

  let forwardDepartures: UpcomingDeparture[] = [];
  if (upcomingTransfers.length > 0) {
    forwardDepartures = upcomingTransfers.slice(0, 6).map(o => {
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
    forwardDepartures = dedupedOptions.slice(0, 4).map(o => {
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

  const transferDepartures: UpcomingDeparture[] = [...pastDeparturesList, ...forwardDepartures];

  return {
    trip: {
      ...chosen.leg1Trip,
      id: `${chosen.leg1Trip.id}_${chosen.leg2Trip.id}`,
    },
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
      ? `Resumes after 12:00 AM (Next: ${fromTime})`
      : diffMins === 0
      ? 'Departing now'
      : `Departing in ${timeStr}`,
    timeRemainingText: isNextDay ? `After 12 AM (${fromTime})` : diffMins === 0 ? 'Now' : `in ${timeStr}`,
    progressPercent: 0,
    isUpcoming: !isNextDay,
    isInTransit: false,
    currentStatusText: isNextDay
      ? `Service ended for today · Schedule active after 12:00 AM`
      : `Change at ${chosen.hub} · ${chosen.waitMins} min transfer wait`,
    intermediateStopsCount: intermediateStops.length + secondLegStops.length - 1,
    intermediateStops,
    upcomingDepartures: transferDepartures,
    isTransfer: true,
    transferHub: chosen.hub,
    transferWaitMins: chosen.waitMins,
    transferArrivalTime: hubArrivalTime,
    connectingTrip: chosen.leg2Trip,
    connectingFromTime: hubDepartureTime,
    connectingToTime: toTime,
    secondLegStops,
    nearbyDirectAlternatives: findNearbyDirectAlternatives(fromStop.name, toStop.name, serviceDay, nowMins),
    optimalProximity: getOptimalProximityHop(fromStop, toStop, serviceDay, nowMins, chosen.totalDuration),
    serviceEndedToday,
    lastDepartedTodayTime,
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
      if (fIdx === -1 && matchStop(s.stop, fromStop)) {
        fIdx = idx;
      }
      if (tIdx === -1 && fIdx !== -1 && matchStop(s.stop, toStop)) {
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
        if (fIdx === -1 && matchStop(s.stop, fromStop)) {
          fIdx = idx;
        }
        if (tIdx === -1 && fIdx !== -1 && matchStop(s.stop, toStop)) {
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
    return calculateTransferJourney(fromStop, toStop, serviceDay, nowMins, mode, selectedTripId);
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
    countdownText = `Resumes after 12:00 AM (Next: ${fromTime})`;
    timeRemainingText = `After 12 AM (${fromTime})`;
    currentStatusText = 'Service ended for today · Schedule active after 12:00 AM';
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

  const pastTripsToday = matchingTrips.filter(m => m.depMins < nowMins - 1);
  const serviceEndedToday = isNextDay;
  const lastDepartedTrip = pastTripsToday.length > 0 ? pastTripsToday[pastTripsToday.length - 1] : null;
  const lastDepartedTodayTime = lastDepartedTrip ? lastDepartedTrip.trip.stops[lastDepartedTrip.fromIndex].time : undefined;

  // Build past departures from earlier today
  const pastDeparturesList: UpcomingDeparture[] = pastTripsToday.slice(-2).map((m, idx, arr) => {
    const diff = m.depMins - nowMins;
    return {
      tripId: m.trip.id,
      route: m.trip.route,
      departureTime: m.trip.stops[m.fromIndex].time,
      arrivalTime: m.trip.stops[m.toIndex].time,
      departureMins: m.depMins,
      diffMins: diff,
      isNextDay: false,
      isDeparted: true,
      isLastToday: idx === arr.length - 1,
      isInTransit: false,
    };
  });

  // Build upcoming departures strictly forward from current time (nowMins)
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

  let rawUpcoming: UpcomingDeparture[] = [];

  if (todayUpcoming.length > 0) {
    todayUpcoming.sort((a, b) => a.diffMins - b.diffMins);
    rawUpcoming = todayUpcoming;
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
    rawUpcoming = tomorrowDepartures;
  }

  // Deduplicate by departureTime so identical times are never repeated
  const forwardDepartures: UpcomingDeparture[] = [];
  const seenTimes = new Set<string>();
  for (const dep of rawUpcoming) {
    if (!seenTimes.has(dep.departureTime)) {
      seenTimes.add(dep.departureTime);
      forwardDepartures.push(dep);
      if (forwardDepartures.length >= 6) break;
    }
  }

  const upcomingDepartures: UpcomingDeparture[] = [...pastDeparturesList, ...forwardDepartures];

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
    upcomingDepartures,
    serviceEndedToday,
    lastDepartedTodayTime,
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
