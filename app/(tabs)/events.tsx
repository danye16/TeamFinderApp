import React, { useState, useCallback, useMemo } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  RefreshControl, 
  SectionList, 
  TextInput,
  ScrollView 
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/coloresVistaPrincipal';
import { getAllEvents, EventoDto } from '@/components/services/events.service';

// --- UTILIDADES PARA FECHAS ---
const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

// Obtiene "Noviembre 2023" de una fecha ISO
const getMonthYearKey = (dateString: string) => {
  const d = new Date(dateString);
  return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
};

// Obtiene un valor numérico para ordenar (ej: 202311)
const getSortKey = (dateString: string) => {
  const d = new Date(dateString);
  return d.getFullYear() * 100 + d.getMonth();
};

export default function EventsListScreen() {
  const [allEvents, setAllEvents] = useState<EventoDto[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para Filtros
  const [searchText, setSearchText] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  const router = useRouter();

  // 1. Carga de datos
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await getAllEvents();
      // Ordenamos por fecha (del más reciente al más lejano o viceversa)
      data.sort((a, b) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime());
      setAllEvents(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [])
  );

  // 2. Lógica de Filtrado y Agrupación (Se ejecuta auto cuando cambian los filtros)
  const sections = useMemo(() => {
    // A. Filtrar primero por texto (Juego u Organizador)
    let filtered = allEvents.filter(e => {
      const search = searchText.toLowerCase();
      return (
        e.juegoNombre.toLowerCase().includes(search) || 
        e.organizadorUsername.toLowerCase().includes(search)
      );
    });

    // B. Agrupar por Mes
    const groupedMap: Record<string, EventoDto[]> = {};
    
    filtered.forEach(event => {
      const key = getMonthYearKey(event.fechaInicio);
      if (!groupedMap[key]) groupedMap[key] = [];
      groupedMap[key].push(event);
    });

    // C. Convertir a Array de Secciones
    let sectionArray = Object.keys(groupedMap).map(key => ({
      title: key,
      data: groupedMap[key],
      sortKey: getSortKey(groupedMap[key][0].fechaInicio)
    }));

    // D. Ordenar las secciones por fecha
    sectionArray.sort((a, b) => a.sortKey - b.sortKey);

    // E. Aplicar filtro de Mes específico si está seleccionado
    if (selectedMonth) {
      return sectionArray.filter(s => s.title === selectedMonth);
    }

    return sectionArray;
  }, [allEvents, searchText, selectedMonth]);

  // 3. Extraer lista de meses disponibles para el selector
  const availableMonths = useMemo(() => {
    const months = new Set(allEvents.map(e => getMonthYearKey(e.fechaInicio)));
    return Array.from(months).sort((a, b) => {
        // Truco rápido para ordenar los meses del selector basándonos en los datos ya cargados
        const eventA = allEvents.find(e => getMonthYearKey(e.fechaInicio) === a);
        const eventB = allEvents.find(e => getMonthYearKey(e.fechaInicio) === b);
        return getSortKey(eventA!.fechaInicio) - getSortKey(eventB!.fechaInicio);
    });
  }, [allEvents]);


  // --- RENDERIZADO ---

  const renderSectionHeader = ({ section: { title } }: any) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  const renderItem = ({ item }: { item: EventoDto }) => (
    <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
      <View style={styles.cardHeader}>
        <Text style={styles.gameTitle}>{item.juegoNombre}</Text>
        <View style={[styles.badge, !item.tieneCuposDisponibles && { backgroundColor: '#FF4444' }]}>
            <Ionicons name="person" size={12} color="#FFF" />
            <Text style={styles.badgeText}>
                {item.cantidadParticipantes}/{item.maxParticipantes}
            </Text>
        </View>
      </View>

      <Text style={styles.eventTitle}>{item.titulo}</Text>
      <Text style={styles.dateText}>
        📅 {new Date(item.fechaInicio).toLocaleDateString()}
      </Text>
      
      <View style={styles.organizerRow}>
        <Text style={styles.organizerLabel}>Organizado por: </Text>
        <Text style={styles.organizerName}>{item.organizadorUsername}</Text>
      </View>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => {
            router.push({
              pathname: '/event-detail/[id]', // @ts-ignore
              params: { id: item.id }
            } as any);
        }}
      >
        <Text style={styles.buttonText}>Ver Detalles</Text>
        <Ionicons name="chevron-forward" size={18} color="#FFF"/>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* --- ZONA DE FILTROS --- */}
      <View style={styles.filterContainer}>
        {/* Buscador Texto */}
        <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#888" style={{ marginRight: 8 }} />
            <TextInput 
                placeholder="Buscar por juego u organizador..." 
                placeholderTextColor="#666"
                style={styles.searchInput}
                value={searchText}
                onChangeText={setSearchText}
            />
            {searchText !== '' && (
                <TouchableOpacity onPress={() => setSearchText('')}>
                    <Ionicons name="close-circle" size={20} color="#888" />
                </TouchableOpacity>
            )}
        </View>

        {/* Scroll Horizontal de Meses */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthSelector}>
            <TouchableOpacity 
                style={[styles.chip, !selectedMonth && styles.chipActive]}
                onPress={() => setSelectedMonth(null)}
            >
                <Text style={[styles.chipText, !selectedMonth && styles.chipTextActive]}>Todos</Text>
            </TouchableOpacity>
            
            {availableMonths.map(month => (
                <TouchableOpacity 
                    key={month}
                    style={[styles.chip, selectedMonth === month && styles.chipActive]}
                    onPress={() => setSelectedMonth(month === selectedMonth ? null : month)}
                >
                    <Text style={[styles.chipText, selectedMonth === month && styles.chipTextActive]}>{month}</Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
      </View>

      {/* --- LISTA AGRUPADA --- */}
      <SectionList
        sections={sections}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false} // Pon true si quieres que el mes se quede pegado arriba al scrollear
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchEvents} tintColor={colors.secondaryAccent} />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
                <Ionicons name="calendar-outline" size={64} color="#444" />
                <Text style={styles.emptyText}>No se encontraron eventos con estos filtros.</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBackground,
  },
  filterContainer: {
    padding: 16,
    backgroundColor: colors.primaryBackground,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  searchBar: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333'
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
  },
  monthSelector: {
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#333'
  },
  chipActive: {
    backgroundColor: colors.secondaryAccent,
    borderColor: colors.secondaryAccent,
  },
  chipText: {
    color: '#888',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#000', // Texto oscuro sobre el acento verde/brillante
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  sectionHeader: {
    paddingVertical: 16,
    backgroundColor: colors.primaryBackground, // Para tapar el contenido al hacer scroll
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
    textTransform: 'capitalize'
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gameTitle: {
    color: colors.secondaryAccent,
    fontWeight: 'bold',
    fontSize: 14,
    textTransform: 'uppercase',
  },
  eventTitle: {
    color: colors.primaryText,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dateText: {
    color: '#AAA',
    fontSize: 14,
    marginBottom: 12,
    fontStyle: 'italic'
  },
  organizerRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  organizerLabel: {
    color: '#888',
  },
  organizerName: {
    color: colors.primaryText,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: '#333',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#333', 
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    opacity: 0.5
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
  }
});