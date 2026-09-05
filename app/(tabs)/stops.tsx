import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, X, MapPin } from 'lucide-react-native';
import { stops } from '../../src/services/tracker';

export default function AllStopsScreen() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'corridor' | 'feeder' | 'hub'>('all');
  const [isFocused, setIsFocused] = useState(false);

  const filtered = useMemo(() => {
    return stops.filter(s => {
      const matchSearch =
        !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.shortName.toLowerCase().includes(search.toLowerCase()) ||
        s.code.toLowerCase().includes(search.toLowerCase()) ||
        s.hindiName.includes(search) ||
        s.landmark.toLowerCase().includes(search.toLowerCase());

      if (!matchSearch) return false;
      if (filter === 'corridor') return s.corridor === 'Corridor 1';
      if (filter === 'feeder') return s.corridor.includes('Feeder');
      if (filter === 'hub') return s.interchange || s.type === 'hub' || s.type === 'terminal';
      return true;
    });
  }, [search, filter]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* 1. TOP HEADER & DIRECTORY CONTROLS */}
      <View style={styles.header}>
        <Text style={styles.title}>Stations & Shelters</Text>
        <Text style={styles.subtitle}>25 active stops</Text>

        {/* 2. SEARCH BAR */}
        <View style={[styles.searchBar, isFocused && styles.searchBarFocused]}>
          <Search size={16} color={isFocused ? '#18258F' : '#6B7280'} />
          <TextInput
            style={[styles.searchInput, Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}]}
            placeholder="Search station, landmark..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={15} color="#6B7280" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* 3. MINIMAL FILTER CHIPS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterRow}
        >
          <TouchableOpacity
            style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
            onPress={() => setFilter('all')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
              All 25
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filter === 'corridor' && styles.filterChipActive]}
            onPress={() => setFilter('corridor')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, filter === 'corridor' && styles.filterTextActive]}>
              Corridor 1
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filter === 'feeder' && styles.filterChipActive]}
            onPress={() => setFilter('feeder')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, filter === 'feeder' && styles.filterTextActive]}>
              Feeder Loops
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filter === 'hub' && styles.filterChipActive]}
            onPress={() => setFilter('hub')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterText, filter === 'hub' && styles.filterTextActive]}>
              Hubs
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* 4. STATION CARDS / DIRECTORY LIST */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.stopCard} activeOpacity={0.75}>
            {/* ROW 1: PRIMARY STATION NAME & CODE */}
            <View style={styles.stopTopRow}>
              <View style={styles.stopNameBlock}>
                <Text style={styles.stopNameText} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.hindiNameText}>{item.hindiName}</Text>
              </View>
              <View style={styles.badgeCode}>
                <Text style={styles.badgeCodeText}>{item.code}</Text>
              </View>
            </View>

            {/* ROW 2: LOCATION / LANDMARK WITH QUIET NAVY/MUTED PIN */}
            <View style={styles.landmarkRow}>
              <MapPin size={12.5} color="#6B7280" style={{ marginRight: 5, marginTop: 1 }} />
              <Text style={styles.landmarkText} numberOfLines={1}>
                {item.landmark}
              </Text>
            </View>

            {/* ROW 3: QUIET METADATA TAGS */}
            <View style={styles.facilitiesRow}>
              <View style={styles.corridorTag}>
                <Text style={styles.corridorTagText}>
                  {item.corridor}
                </Text>
              </View>
              {item.facilities.slice(0, 2).map((fac, fIdx) => (
                <View key={fIdx} style={styles.facilityTag}>
                  <Text style={styles.facilityTagText}>{fac}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FC',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(24, 37, 143, 0.06)',
  },
  title: {
    fontSize: 27,
    fontWeight: '800',
    color: '#18258F',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 2,
    marginBottom: 12,
  },
  searchBar: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(24, 37, 143, 0.10)',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  searchBarFocused: {
    borderColor: '#18258F',
    backgroundColor: '#FFFFFF',
    shadowColor: '#18258F',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13.5,
    color: '#10131A',
    fontWeight: '500',
  },
  filterScroll: {
    marginHorizontal: -16,
    marginBottom: 2,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 6,
  },
  filterChip: {
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 15,
    backgroundColor: '#F1F3FA',
    borderWidth: 1,
    borderColor: '#DDE2F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: '#E9ECFF',
    borderColor: '#18258F',
  },
  filterText: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#18258F',
    fontWeight: '700',
  },

  /* STATION CARDS — COMPACT, LIGHT & CLICKABLE */
  listContent: {
    padding: 16,
    paddingBottom: 110,
    gap: 10,
  },
  stopCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(24, 37, 143, 0.08)',
    shadowColor: '#18258F',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  stopTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  stopNameBlock: {
    flex: 1,
    marginRight: 8,
  },
  stopNameText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#18258F',
    letterSpacing: -0.2,
  },
  hindiNameText: {
    fontSize: 11.5,
    color: '#6B7280',
    marginTop: 1,
    fontWeight: '500',
  },
  badgeCode: {
    backgroundColor: '#F5EAD8',
    borderWidth: 1,
    borderColor: 'rgba(24, 37, 143, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  badgeCodeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#18258F',
    letterSpacing: 0.2,
  },
  landmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  landmarkText: {
    fontSize: 11.5,
    color: '#6B7280',
    fontWeight: '500',
    flex: 1,
  },
  facilitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  corridorTag: {
    backgroundColor: '#F5EAD8',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 5,
  },
  corridorTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#18258F',
    letterSpacing: 0.2,
  },
  facilityTag: {
    backgroundColor: '#F1F3FA',
    borderWidth: 1,
    borderColor: '#DDE2F0',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 5,
  },
  facilityTagText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#6B7280',
  },
});
