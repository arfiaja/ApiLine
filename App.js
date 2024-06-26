import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const API_BASE_URL = 'https://www.api.comuline.com/v1/';
const Stack = createStackNavigator();

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.homeContainer}>
      <View style={styles.iconContainer}>
        <Image
          source={{ uri: 'https://static.vecteezy.com/system/resources/previews/032/433/905/original/train-icon-silhouette-logo-simple-design-illustration-vector.jpg' }}
          style={styles.icon}
        />
      </View>
      <Text style={styles.welcomeText}>Selamat Datang di ApiLine</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('StationList')}
      >
        <Text style={styles.buttonText}>Masuk ke Halaman Utama</Text>
      </TouchableOpacity>
    </View>
  );
};

const StationList = ({ navigation }) => {
  const [stations, setStations] = useState([]);
  const [search, setSearch] = useState('');
  const [filteredStations, setFilteredStations] = useState([]);

  useEffect(() => {
    fetchStations();
  }, []);

  useEffect(() => {
    setFilteredStations(
      stations.filter(station =>
        station.name.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, stations]);

  const fetchStations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}station/`);
      const data = await response.json();
      setStations(data.data);
      setFilteredStations(data.data);
    } catch (error) {
      console.error('Error fetching stations:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Cari Nama Stasiun"
        value={search}
        onChangeText={setSearch}
      />
      <ScrollView>
        {filteredStations.map((station) => (
          <TouchableOpacity
            key={station.id}
            style={styles.stationItem}
            onPress={() => navigation.navigate('TrainSchedule', { stationId: station.id })}
          >
            <Text style={styles.stationName}>{station.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const TrainSchedule = ({ route }) => {
  const [trainData, setTrainData] = useState([]);
  const { stationId } = route.params;

  useEffect(() => {
    fetchTrainData(stationId);
  }, [stationId]);

  const fetchTrainData = async (stationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}schedule/${stationId}`);
      const data = await response.json();
      const sortedData = data.data.sort((a, b) => a.destination.localeCompare(b.destination));
      setTrainData(sortedData);
    } catch (error) {
      console.error('Error fetching train data:', error);
    }
  };

  const getNearbyTrains = (data) => {
    const currentTime = new Date().getTime();
    return data.filter((train) => {
      const [hours, minutes, seconds] = train.timeEstimated.split(':');
      const trainTime = new Date().setHours(parseInt(hours), parseInt(minutes), parseInt(seconds), 0);
      return trainTime > currentTime;
    });
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  return (
    <ScrollView>
      {trainData.map((train, index) => (
        <View key={index} style={styles.trainContainer}>
          {index === 0 || train.destination !== trainData[index - 1].destination ? (
            <Text style={styles.destinationHeader}>{train.destination}</Text>
          ) : null}
          <Text style={styles.departureTime}>
            berangkat pukul {formatTime(train.timeEstimated)}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'ApiLine' }} />
        <Stack.Screen name="StationList" component={StationList} options={{ title: 'Pilih Stasiun' }} />
        <Stack.Screen name="TrainSchedule" component={TrainSchedule} options={{ title: 'Jadwal Kereta Api' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  homeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  welcomeText: {
    fontSize: 24,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  searchBar: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  stationItem: {
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  stationName: {
    fontSize: 16,
  },
  trainContainer: {
    marginBottom: 20,
  },
  destinationHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  departureTime: {
    fontSize: 16,
    marginBottom: 5,
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  icon: {
    width: 100,
    height: 100,
    margin: 10,
  }
});

export default App;
