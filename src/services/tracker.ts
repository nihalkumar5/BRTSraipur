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

/**
 * Computes proximity between two stations directly from the official bus timetable chart
 * (Minutes difference and number of stops along any connecting route).
 */
export function getTimetableChartDelta(stop1: Stop, stop2: Stop): {
  minutesOnChart: number;
  stopsAway: number;
  routeNumber?: string;
  formatted: string;
} | null {
  if (!stop1 || !stop2) return null;
  let minMinutes = 999;
  let minStops = 999;
  let foundRoute: string | undefined;

  for (const trip of schedules) {
    const fIdx = trip.stops.findIndex(s => matchStop(s.stop, stop1));
    const tIdx = trip.stops.findIndex(s => matchStop(s.stop, stop2));
    if (fIdx !== -1 && tIdx !== -1) {
      const delta = Math.abs(trip.stops[fIdx].mins - trip.stops[tIdx].mins);
      const stopsAway = Math.abs(fIdx - tIdx);
      if (delta < minMinutes || (delta === minMinutes && stopsAway < minStops)) {
        minMinutes = delta;
        minStops = stopsAway;
        foundRoute = trip.routeNumber;
      }
    }
  }

  if (minMinutes !== 999) {
    return {
      minutesOnChart: minMinutes,
      stopsAway: minStops,
      routeNumber: foundRoute,
      formatted: `${minMinutes} min on chart (${minStops} stop${minStops > 1 ? 's' : ''})`,
    };
  }

  return null;
}

export function getNearbyStations(stationNameQuery: string, maxKm: number = 3.5): NearbyStation[] {
  const target = getStopByName(stationNameQuery);
  if (!target) return [];

  const map = new Map<string, NearbyStation>();

  // 1. Timetable-based adjacent stops from official bus schedules (PDF timetable truth)
  for (const trip of schedules) {
    const tIdx = trip.stops.findIndex(s => matchStop(s.stop, target));
    if (tIdx !== -1) {
      for (let offset = 1; offset <= 4; offset++) {
        for (const idx of [tIdx - offset, tIdx + offset]) {
          if (idx >= 0 && idx < trip.stops.length) {
            const adjStop = getStopByName(trip.stops[idx].stop);
            if (!adjStop || adjStop.id === target.id) continue;
            const deltaMins = Math.abs(trip.stops[idx].mins - trip.stops[tIdx].mins);
            if (deltaMins <= 20) {
              const existing = map.get(adjStop.id);
              if (!existing || (existing.routeTimeMins && deltaMins < existing.routeTimeMins)) {
                map.set(adjStop.id, {
                  stop: adjStop,
                  distanceKm: Math.round(deltaMins * 0.4 * 10) / 10,
                  walkingMins: deltaMins,
                  distanceFormatted: `${deltaMins}m on route`,
                  routeTimeMins: deltaMins,
                  stopsAway: offset,
                });
              }
            }
          }
        }
      }
    }
  }

  const results = Array.from(map.values());
  results.sort((a, b) => {
    const aTime = a.routeTimeMins ?? 999;
    const bTime = b.routeTimeMins ?? 999;
    return aTime - bTime;
  });

  return results;
}

export function getNearbyStationsFromCoordinates(
  _userLat: number,
  _userLon: number,
  _maxKm: number = 2.5
): NearbyStation[] {
  return [];
}

export function getNearestStopFromCoordinates(
  _userLat: number,
  _userLon: number
): NearbyStation | null {
  return null;
}

export function findNearbyDirectAlternatives(
  fromName: string,
  toName: string,
  forceServiceDay?: 'weekday' | 'weekend',
  nowMins: number = getCurrentMinutesOfDay(),
  maxRadiusKm: number = 4.5
): NearbyDirectAlternative[] {
  const fromStop = getStopByName(fromName);
  const toStop = getStopByName(toName);
  if (!fromStop || !toStop) return [];

  const serviceDay = forceServiceDay || (isWeekendDay() ? 'weekend' : 'weekday');
  const alternatives: NearbyDirectAlternative[] = [];

  // 1. Nearby origins to fromStop that have a direct bus to toStop
  const candidateOriginMap = new Map<string, { stop: Stop; stopsAway?: number; routeTimeDeltaMins?: number; distanceKm: number; walkingMins: number; distanceFormatted: string }>();

  // Extract adjacent stops along routes passing through fromStop within chart proximity
  for (const trip of schedules) {
    const fIdx = trip.stops.findIndex(s => matchStop(s.stop, fromStop));
    if (fIdx !== -1) {
      for (let offset = 1; offset <= 3; offset++) {
        const checkIndices = [fIdx - offset, fIdx + offset];
        for (const idx of checkIndices) {
          if (idx >= 0 && idx < trip.stops.length) {
            const adjStop = getStopByName(trip.stops[idx].stop);
            if (!adjStop || adjStop.id === fromStop.id || adjStop.id === toStop.id) continue;
            const delta = Math.abs(trip.stops[idx].mins - trip.stops[fIdx].mins);
            // Timetable chart truth: within 20 minutes on chart
            if (delta > 20) continue;
            const walkingMins = delta;
            if (!candidateOriginMap.has(adjStop.id) || (candidateOriginMap.get(adjStop.id)!.routeTimeDeltaMins || 99) > delta) {
              candidateOriginMap.set(adjStop.id, {
                stop: adjStop,
                stopsAway: offset,
                routeTimeDeltaMins: delta,
                distanceKm: Math.round(delta * 0.4 * 10) / 10,
                walkingMins,
                distanceFormatted: `${delta} min on chart (${offset} stop${offset > 1 ? 's' : ''})`,
              });
            }
          }
        }
      }
    }
  }

  const nearbyOrigins = getNearbyStations(fromStop.name, Math.min(2.5, maxRadiusKm));
  for (const nearby of nearbyOrigins) {
    if (nearby.stop.id === fromStop.id || nearby.stop.id === toStop.id) continue;
    if (!candidateOriginMap.has(nearby.stop.id)) {
      candidateOriginMap.set(nearby.stop.id, {
        stop: nearby.stop,
        distanceKm: nearby.distanceKm,
        walkingMins: nearby.walkingMins,
        distanceFormatted: nearby.distanceFormatted,
      });
    }
  }

  for (const nearby of candidateOriginMap.values()) {
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
        matching.push({
          trip,
          fIdx,
          tIdx,
          depMins: trip.stops[fIdx].mins,
          arrMins: trip.stops[tIdx].mins,
        });
      }
    }

    if (matching.length > 0) {
      matching.sort((a, b) => a.depMins - b.depMins);

      let chosen = matching[0];
      let isToday = false;
      let lastDeparted: (typeof matching)[0] | null = null;

      const futureTrips = matching.filter(m => m.depMins >= earliestBoardingMins);
      if (futureTrips.length > 0) {
        chosen = futureTrips[0];
        isToday = true;
      } else {
        const pastTrips = matching.filter(m => m.depMins < earliestBoardingMins);
        if (pastTrips.length > 0) {
          lastDeparted = pastTrips[pastTrips.length - 1];
        }
      }

      const durationMins = chosen.arrMins >= chosen.depMins ? chosen.arrMins - chosen.depMins : chosen.arrMins + 1440 - chosen.depMins;
      const minutesUntilDeparture = isToday ? Math.max(0, chosen.depMins - nowMins) : chosen.depMins + 1440 - nowMins;

      alternatives.push({
        type: 'nearby_origin',
        suggestedStop: nearby.stop,
        referenceStop: fromStop,
        targetStop: toStop,
        stopsAway: nearby.stopsAway,
        routeTimeDeltaMins: nearby.routeTimeDeltaMins,
        distanceKm: nearby.distanceKm,
        walkingMins: nearby.walkingMins,
        distanceFormatted: nearby.distanceFormatted,
        routeNumber: chosen.trip.routeNumber,
        routeName: chosen.trip.route,
        departureTime: chosen.trip.stops[chosen.fIdx].time,
        arrivalTime: chosen.trip.stops[chosen.tIdx].time,
        durationMins,
        fare: getFare(nearby.stop.name, toStop.name) || 10,
        depMins: chosen.depMins,
        minutesUntilDeparture,
        isToday,
        previousDepartureTime: lastDeparted ? lastDeparted.trip.stops[lastDeparted.fIdx].time : undefined,
        isReachableNow: isToday && chosen.depMins >= earliestBoardingMins,
      });
    }
  }

  // 2. Candidate destinations to toStop:
  // Find adjacent stops on routes that serve toStop (both preceding and succeeding stops)
  const candidateDestMap = new Map<string, { stop: Stop; stopsAway?: number; routeTimeDeltaMins?: number; distanceKm: number; walkingMins: number; distanceFormatted: string }>();

  for (const trip of schedules) {
    const tIdx = trip.stops.findIndex(s => matchStop(s.stop, toStop));
    if (tIdx >= 0) {
      for (let offset = 1; offset <= 3; offset++) {
        const checkIndices = [tIdx - offset, tIdx + offset];
        for (const idx of checkIndices) {
          if (idx >= 0 && idx < trip.stops.length) {
            const adjStopObj = getStopByName(trip.stops[idx].stop);
            if (!adjStopObj || adjStopObj.id === toStop.id || adjStopObj.id === fromStop.id) continue;
            const delta = Math.abs(trip.stops[tIdx].mins - trip.stops[idx].mins);
            // Timetable chart truth: within 20 minutes on chart
            if (delta > 20) continue;
            const walkingMins = delta;
            if (!candidateDestMap.has(adjStopObj.id) || (candidateDestMap.get(adjStopObj.id)!.routeTimeDeltaMins || 99) > delta) {
              candidateDestMap.set(adjStopObj.id, {
                stop: adjStopObj,
                stopsAway: offset,
                routeTimeDeltaMins: delta,
                distanceKm: Math.round(delta * 0.4 * 10) / 10,
                walkingMins,
                distanceFormatted: `${delta} min on chart (${offset} stop${offset > 1 ? 's' : ''} ${idx < tIdx ? 'before' : 'after'})`,
              });
            }
          }
        }
      }
    }
  }

  // Also include timetable adjacent destinations as fallback
  const nearbyDestinations = getNearbyStations(toStop.name, maxRadiusKm);
  for (const nearby of nearbyDestinations) {
    if (nearby.stop.id === fromStop.id || nearby.stop.id === toStop.id) continue;
    if (!candidateDestMap.has(nearby.stop.id)) {
      candidateDestMap.set(nearby.stop.id, {
        stop: nearby.stop,
        distanceKm: nearby.distanceKm,
        walkingMins: nearby.walkingMins,
        distanceFormatted: nearby.distanceFormatted,
      });
    }
  }

  for (const nearby of candidateDestMap.values()) {
    if (alternatives.some(a => a.suggestedStop.id === nearby.stop.id && a.type === 'nearby_destination')) continue;

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
        stopsAway: nearby.stopsAway,
        routeTimeDeltaMins: nearby.routeTimeDeltaMins,
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

  // Prioritize active trips running today, then fastest total commute to destination area
  alternatives.sort((a, b) => {
    if (a.isToday && !b.isToday) return -1;
    if (!a.isToday && b.isToday) return 1;
    if (a.isReachableNow && !b.isReachableNow) return -1;
    if (!a.isReachableNow && b.isReachableNow) return 1;
    const aTotalTime = a.minutesUntilDeparture + a.durationMins + (a.routeTimeDeltaMins ?? (a.distanceKm * 8));
    const bTotalTime = b.minutesUntilDeparture + b.durationMins + (b.routeTimeDeltaMins ?? (b.distanceKm * 8));
    if (aTotalTime !== bTotalTime) return aTotalTime - bTotalTime;
    return a.distanceKm - b.distanceKm;
  });

  // Deduplicate if a station appears as both origin and destination (keep fastest)
  const seenStationIds = new Set<string>();
  const uniqueAlternatives: NearbyDirectAlternative[] = [];
  for (const alt of alternatives) {
    if (!seenStationIds.has(alt.suggestedStop.id)) {
      seenStationIds.add(alt.suggestedStop.id);
      uniqueAlternatives.push(alt);
    }
  }

  return uniqueAlternatives.slice(0, 4);
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

  // Prioritize active trips running today, then nearest in timetable time
  results.sort((a, b) => {
    if (a.isToday && !b.isToday) return -1;
    if (!a.isToday && b.isToday) return 1;
    const aTime = a.routeTimeMins ?? a.walkingMins;
    const bTime = b.routeTimeMins ?? b.walkingMins;
    if (aTime !== bTime) return aTime - bTime;
    return a.distanceKm - b.distanceKm;
  });

  return results.slice(0, 4);
}

export function getOptimalProximityHop(
  fromStop: Stop,
  toStop: Stop,
  serviceDay: 'weekday' | 'weekend' = isWeekendDay() ? 'weekend' : 'weekday',
  nowMins: number = getCurrentMinutesOfDay(),
  transferDurationMins: number = 60,
  targetDepMins?: number
): OptimalProximityHop | null {
  if (!fromStop || !toStop || !fromStop.coordinates || !toStop.coordinates) return null;

  // Candidate drop stops near toStop derived directly from the official timetable chart
  const candidateDrops = new Map<string, { stop: Stop; offset: number; routeDelta: number }>();
  for (const s of stops) {
    if (s.id === fromStop.id || s.id === toStop.id) continue;
    const chartDelta = getTimetableChartDelta(s, toStop);
    if (chartDelta && (chartDelta.stopsAway <= 3 || chartDelta.minutesOnChart <= 15)) {
      candidateDrops.set(s.id, {
        stop: s,
        offset: chartDelta.stopsAway,
        routeDelta: chartDelta.minutesOnChart,
      });
    }
  }

  let bestHop: {
    trip: Trip;
    fIdx: number;
    tIdx: number;
    dropStop: Stop;
    busRideMins: number;
    commuteFromDropMins: number;
    walkFromDropFormatted: string;
    totalCommuteMins: number;
    totalScore: number;
    candDrop: { stop: Stop; offset: number; routeDelta: number };
  } | null = null;

  // Search trips on serviceDay for a direct bus from fromStop to any candidate drop stop
  for (const candDrop of candidateDrops.values()) {
    for (const trip of schedules) {
      if (trip.serviceDay !== serviceDay) continue;
      let fIdx = -1;
      let tIdx = -1;
      trip.stops.forEach((st, idx) => {
        if (fIdx === -1 && matchStop(st.stop, fromStop)) fIdx = idx;
        if (tIdx === -1 && fIdx !== -1 && matchStop(st.stop, candDrop.stop)) tIdx = idx;
      });

      if (fIdx !== -1 && tIdx !== -1 && fIdx < tIdx) {
        const depMins = trip.stops[fIdx].mins;
        const arrMins = trip.stops[tIdx].mins;

        // Cyclic wait time: if targetDepMins is provided, match that departure; otherwise cyclic from nowMins
        const waitMins = targetDepMins !== undefined
          ? Math.abs(depMins - targetDepMins)
          : (depMins >= nowMins ? depMins - nowMins : depMins + 1440 - nowMins);

        const busRideMins = arrMins >= depMins ? arrMins - depMins : arrMins + 1440 - depMins;
        const commuteFromDropMins = candDrop.routeDelta;
        const walkFromDropFormatted = `${candDrop.routeDelta} min on chart (${candDrop.offset} stop${candDrop.offset > 1 ? 's' : ''})`;

        const totalCommuteMins = busRideMins + commuteFromDropMins;
        const totalScore = waitMins * 2 + totalCommuteMins;

        if (!bestHop || totalScore < bestHop.totalScore) {
          bestHop = {
            trip,
            fIdx,
            tIdx,
            dropStop: candDrop.stop,
            busRideMins,
            commuteFromDropMins,
            walkFromDropFormatted,
            totalCommuteMins,
            totalScore,
            candDrop,
          };
        }
      }
    }
  }

  // If a direct hop was found
  if (bestHop) {
    const minutesSaved = Math.max(0, transferDurationMins - bestHop.totalCommuteMins);
    const hopFare = getFare(fromStop.name, bestHop.dropStop.name) || 5;

    // Return proximity hop if it saves significant time (>= 20 min) or transfer is very long (>= 60 min)
    if (
      minutesSaved >= 20 ||
      (transferDurationMins >= 60 && bestHop.totalCommuteMins <= 35)
    ) {
      const explanation = `${fromStop.shortName} se ${toStop.shortName} ke liye ${transferDurationMins} min bus transfer ke bajaye Bus ${bestHop.trip.routeNumber} se ${bestHop.dropStop.shortName} (sirf ${bestHop.busRideMins}m ride) utrein! Wahan se ${toStop.shortName} sirf ${bestHop.walkFromDropFormatted} door hai.`;

      return {
        isProximityRoute: true,
        directDistanceKm: Math.round(bestHop.candDrop.routeDelta * 0.4 * 10) / 10,
        directDistanceFormatted: `${bestHop.candDrop.routeDelta} min on chart (${bestHop.candDrop.offset} stop${bestHop.candDrop.offset > 1 ? 's' : ''})`,
        directWalkingMins: bestHop.candDrop.routeDelta,
        hasShortHopBus: true,
        shortHopBus: {
          busNumber: bestHop.trip.routeNumber,
          routeName: bestHop.trip.route,
          boardStation: fromStop.name,
          boardStationShortName: fromStop.shortName,
          dropStation: bestHop.dropStop.name,
          dropStationShortName: bestHop.dropStop.shortName,
          departureTime: bestHop.trip.stops[bestHop.fIdx].time,
          arrivalTime: bestHop.trip.stops[bestHop.tIdx].time,
          departureMins: bestHop.trip.stops[bestHop.fIdx].mins,
          arrivalMins: bestHop.trip.stops[bestHop.tIdx].mins,
          busRideMins: bestHop.busRideMins,
          walkFromDropKm: Math.round(bestHop.candDrop.routeDelta * 0.4 * 10) / 10,
          walkFromDropFormatted: bestHop.walkFromDropFormatted,
          walkFromDropMins: bestHop.commuteFromDropMins,
          totalCommuteMins: bestHop.totalCommuteMins,
          fare: hopFare,
        },
        circuitTransferDurationMins: transferDurationMins,
        minutesSaved,
        explanation,
      };
    }
  }

  // Fallback: If stations are directly adjacent on timetable chart (<= 15 min on chart) and transfer is slow
  const directChart = getTimetableChartDelta(fromStop, toStop);
  if (directChart && directChart.minutesOnChart <= 15 && transferDurationMins > directChart.minutesOnChart) {
    return {
      isProximityRoute: true,
      directDistanceKm: Math.round(directChart.minutesOnChart * 0.4 * 10) / 10,
      directDistanceFormatted: `${directChart.minutesOnChart} min on chart (${directChart.stopsAway} stop${directChart.stopsAway > 1 ? 's' : ''})`,
      directWalkingMins: directChart.minutesOnChart,
      hasShortHopBus: false,
      circuitTransferDurationMins: transferDurationMins,
      minutesSaved: Math.max(0, transferDurationMins - directChart.minutesOnChart),
      explanation: `${fromStop.shortName} aur ${toStop.shortName} timetable chart par sirf ${directChart.minutesOnChart} min (${directChart.stopsAway} stop) door hain.`
    };
  }

  return null;
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

  // Intermediate stops for first leg
  const intermediateStops: JourneyStopInfo[] = chosen.leg1Trip.stops
    .slice(chosen.f1Idx, chosen.t1Idx + 1)
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

  // Second leg intermediate stops
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

  // Build past departures from today - ONLY mark isLastToday if truly no upcoming transfers remain today
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
      isLastToday: upcomingTransfers.length === 0 && idx === arr.length - 1,
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

  // When transfers are running today, prioritize upcoming transfers first so user sees the next bus!
  let transferDepartures: UpcomingDeparture[] = [];
  if (upcomingTransfers.length > 0) {
    transferDepartures = forwardDepartures;
  } else {
    const lastRunToday = pastDeparturesList.length > 0 ? [pastDeparturesList[pastDeparturesList.length - 1]] : [];
    transferDepartures = [...lastRunToday, ...forwardDepartures];
  }

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
    optimalProximity: getOptimalProximityHop(fromStop, toStop, serviceDay, nowMins, chosen.totalDuration, chosen.depMins1),
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
    const transfer = calculateTransferJourney(fromStop, toStop, serviceDay, nowMins, mode, selectedTripId);

    const optimalProx =
      transfer?.optimalProximity ||
      getOptimalProximityHop(fromStop, toStop, serviceDay, nowMins, transfer ? transfer.durationMins : 999);

    // If transfer is an irrelevant/circuitous detour or no transfer exists,
    // and a fast direct bus exists between nearby boarding and/or drop stations:
    if (
      optimalProx &&
      optimalProx.hasShortHopBus &&
      optimalProx.shortHopBus
    ) {
      // Only eliminate genuine absurd detours (e.g. 148 min / ₹70 Telibandha loop for local Nava Raipur travel)
      // Keep reasonable transfers like Balco Hospital -> IIM (27m, ₹10) and user-selected boarding transfers
      const isDetour =
        !transfer ||
        (transfer.durationMins >= 60 && (optimalProx.minutesSaved >= 30 || transfer.fare >= 50)) ||
        (transfer.transferHub?.toLowerCase().includes('telibandha') && transfer.durationMins >= 60);

      if (isDetour) {
        const bStopName = optimalProx.shortHopBus.boardStationShortName || optimalProx.shortHopBus.boardStation;
        const dStopName = optimalProx.shortHopBus.dropStationShortName || optimalProx.shortHopBus.dropStation;
        const boardStop = getStopByName(bStopName) || fromStop;
        const dropStop = getStopByName(dStopName) || toStop;

        // Ensure we don't infinitely recurse if boardStop/dropStop are identical to fromStop/toStop
        if (boardStop.id !== fromStop.id || dropStop.id !== toStop.id) {
          const smartDirectJourney = calculateJourney(
            boardStop.name,
            dropStop.name,
            nowMins,
            mode,
            selectedTripId?.startsWith('PROX_') ? selectedTripId.replace('PROX_', '') : selectedTripId,
            serviceDay
          );

          if (smartDirectJourney) {
            return {
              ...smartDirectJourney,
              isProximityOptimized: true,
              originalOriginStop: boardStop.id !== fromStop.id ? fromStop : undefined,
              proximityBoardStop: boardStop.id !== fromStop.id ? boardStop : undefined,
              proximityBoardWalkFormatted: optimalProx.shortHopBus.walkToBoardFormatted,
              proximityBoardWalkMins: optimalProx.shortHopBus.walkToBoardMins,
              targetDestinationStop: dropStop.id !== toStop.id ? toStop : undefined,
              proximityDropStop: dropStop.id !== toStop.id ? dropStop : undefined,
              proximityWalkFormatted: optimalProx.shortHopBus.walkFromDropFormatted,
              proximityWalkMins: optimalProx.shortHopBus.walkFromDropMins,
              circuitTransferDurationMins: transfer?.durationMins,
              circuitTransferFare: transfer?.fare,
              minutesSaved: optimalProx.minutesSaved,
              optimalProximity: optimalProx,
              detourExplanation: transfer
                ? `Official transfer takes ${transfer.durationMins} min & ₹${transfer.fare} via ${transfer.transferHub} detour. Smart AI routed directly via ${boardStop.shortName} → ${dropStop.shortName} in ${smartDirectJourney.durationMins}m for ₹${smartDirectJourney.fare}.`
                : `Direct bus available from ${boardStop.shortName} to ${dropStop.shortName} in ${smartDirectJourney.durationMins}m for ₹${smartDirectJourney.fare}.`,
            };
          }
        }
      }
    }

    return transfer;
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
      // Fall back to next upcoming bus if selectedTripId is not in this route
      const upcomingTrips = matchingTrips.filter(m => m.depMins >= nowMins);
      if (upcomingTrips.length > 0) {
        chosen = upcomingTrips[0];
      } else {
        chosen = matchingTrips[0];
        isNextDay = true;
      }
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
      if (forwardDepartures.length >= 8) break;
    }
  }

  // Build past departures from earlier today
  // CRITICAL FIX: Only mark isLastToday: true if truly NO upcoming buses remain today!
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
      isLastToday: todayUpcoming.length === 0 && idx === arr.length - 1,
      isInTransit: false,
    };
  });

  // When buses are still running today, UPCOMING buses must come first so the user sees the next bus!
  let upcomingDepartures: UpcomingDeparture[] = [];
  if (todayUpcoming.length > 0) {
    if (mode === 'onboard' && chosen && chosen.depMins < nowMins) {
      const chosenDep: UpcomingDeparture = {
        tripId: chosen.trip.id,
        route: chosen.trip.route,
        departureTime: chosen.trip.stops[chosen.fromIndex].time,
        arrivalTime: chosen.trip.stops[chosen.toIndex].time,
        departureMins: chosen.depMins,
        diffMins: chosen.depMins - nowMins,
        isNextDay: false,
        isDeparted: true,
        isLastToday: false,
        isInTransit: true,
      };
      upcomingDepartures = [chosenDep, ...forwardDepartures.filter(d => d.tripId !== chosen.trip.id)];
    } else {
      upcomingDepartures = forwardDepartures;
    }
  } else {
    // All today's buses have ended: show the final bus of today (with LAST TODAY), then tomorrow morning's departures
    const lastRunToday = pastDeparturesList.length > 0 ? [pastDeparturesList[pastDeparturesList.length - 1]] : [];
    upcomingDepartures = [...lastRunToday, ...forwardDepartures];
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
    upcomingDepartures,
    serviceEndedToday,
    lastDepartedTodayTime,
    nearbyDirectAlternatives: findNearbyDirectAlternatives(fromStop.name, toStop.name, serviceDay, nowMins),
    optimalProximity: getOptimalProximityHop(fromStop, toStop, serviceDay, nowMins, durationMins, trip.stops[fromIndex].mins),
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
