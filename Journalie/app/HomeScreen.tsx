import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Feather } from "@expo/vector-icons";

 type RootStackParamList = {
   Intro: undefined;
   Home: undefined;
   NewEntry: { entry?: JournalEntry };
 };

 interface JournalEntry {
   date: number;
   content: string;
 }



type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

type Props = {
  navigation: HomeScreenNavigationProp;
};

interface JournalEntry {
  date: number;
  content: string;
}

export default function HomeScreen({ navigation }: Props) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<JournalEntry | null>(null);
  const [stats, setStats] = useState({
    entriesThisYear: 0,
    totalWords: 0,
    daysJournaled: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      loadEntries();
    }
  }, [isFocused]);

  const loadEntries = async () => {
    try {
      const jsonEntries = await AsyncStorage.getItem("@journal_entries");
      if (jsonEntries !== null) {
        const loadedEntries = JSON.parse(jsonEntries);
        setEntries(loadedEntries);
        updateStats(loadedEntries);
      }
    } catch (e) {
      console.error("Failed to load entries:", e);
    }
  };

  const updateStats = (loadedEntries: JournalEntry[]) => {
    const currentYear = new Date().getFullYear();
    const entriesThisYear = loadedEntries.filter(
      (entry) => new Date(entry.date).getFullYear() === currentYear
    ).length;
    const totalWords = loadedEntries.reduce((sum, entry) => {
      const wordCount = entry.content.trim().split(/\s+/).length;
      return sum + wordCount;
    }, 0);
    const uniqueDays = new Set(
      loadedEntries.map((entry) => new Date(entry.date).toDateString())
    ).size;

    setStats({
      entriesThisYear,
      totalWords,
      daysJournaled: uniqueDays,
    });
  };

  const handleDelete = async () => {
    if (currentEntry) {
      try {
        const updatedEntries = entries.filter(
          (entry) => entry.date !== currentEntry.date
        );
        await AsyncStorage.setItem(
          "@journal_entries",
          JSON.stringify(updatedEntries)
        );
        setEntries(updatedEntries);
        updateStats(updatedEntries);
        setShowModal(false);
      } catch (e) {
        console.error("Failed to delete the entry:", e);
      }
    }
  };

  const handleEdit = () => {
    if (currentEntry) {
      navigation.navigate("NewEntry", { entry: currentEntry });
      setShowModal(false);
    }
  };

  const filteredEntries = entries.filter((entry) =>
    entry.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }: { item: JournalEntry }) => (
    <TouchableOpacity
      style={styles.entryItem}
      onPress={() => {
        setCurrentEntry(item);
        handleEdit();
      }}
    >
      <View style={styles.entryHeader}>
        <Text style={styles.entryDate}>
          {new Date(item.date).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>
        <TouchableOpacity
          onPress={() => {
            setCurrentEntry(item);
            setShowModal(true);
          }}
        >
          <Feather name="more-vertical" size={20} color="#6200EE" />
        </TouchableOpacity>
      </View>
      <Text style={styles.entryPreview}>
        {item.content.substring(0, 100)}...
      </Text>
    </TouchableOpacity>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Image
          source={require("../assets/images/Note_img.png")}
          resizeMode="cover"
          style={styles.headerImage}
        />
        <Text style={styles.headerText}>My Journal</Text>
        <View style={styles.searchContainer}>
          <Feather
            name="search"
            size={16}
            color="#6200EE"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search entries..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        {!searchQuery && (
          <>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Feather name="book" size={24} color="#7081e1" />
                <Text style={styles.statText}>{stats.entriesThisYear}</Text>
                <Text style={styles.statLabel}>Entries this Year</Text>
              </View>
              <View style={styles.statItem}>
                <Feather name="edit-2" size={24} color="#bf6d6c" />
                <Text style={styles.statText}>{stats.totalWords}</Text>
                <Text style={styles.statLabel}>Words Written</Text>
              </View>
              <View style={styles.statItem}>
                <Feather name="calendar" size={24} color="#6200EE" />
                <Text style={styles.statText}>{stats.daysJournaled}</Text>
                <Text style={styles.statLabel}>Days Journaled</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.newEntry}
              onPress={() => navigation.navigate("NewEntry", {})}
            >
              <Feather name="edit" size={24} color="#5b57ea" />
              <Text style={{ color: "#5b57ea" }}>New Entry</Text>
            </TouchableOpacity>
          </>
        )}
        <FlatList
          data={filteredEntries.sort((a, b) => b.date - a.date)}
          renderItem={renderItem}
          keyExtractor={(item) => item.date.toString()}
          contentContainerStyle={styles.listContainer}
        />
        <TouchableOpacity
          style={styles.newEntryButton}
          onPress={() => navigation.navigate("NewEntry", {})}
        >
          <Feather name="plus" size={24} color="#fff" />
        </TouchableOpacity>

        <Modal
          visible={showModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>What would you like to do?</Text>
              <TouchableOpacity style={styles.modalButton} onPress={handleEdit}>
                <Text style={styles.modalButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleDelete}
              >
                <Text style={styles.modalButtonText}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#282c32",
  },
  headerImage: {
    width: "100%",
    height: 200,
    opacity: 0.5,
  },
  newEntry: {
    width: "45%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 7,
    paddingHorizontal: 25,
    textAlign: "center",
    margin: "auto",
    marginVertical: 20,
    borderRadius: 15,
    backgroundColor: "rgba(54, 50, 76, 0.90)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    position: "absolute",
    top: 140,
    left: 20,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  listContainer: {
    paddingHorizontal: 20,
    marginTop: 5,
  },
  entryItem: {
    backgroundColor: "rgba(54, 50, 96, 1)",
    padding: 20,
    marginBottom: 15,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  entryDate: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
  },
  entryPreview: {
    fontSize: 16,
    color: "rgba(100, 100, 100, 1)",
    lineHeight: 24,
  },
  newEntryButton: {
    backgroundColor: "#6200EE",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 30,
    right: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "#282c32",
    padding: 20,
    borderRadius: 10,
    width: 250,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 20,
  },
  modalButton: {
    padding: 10,
    backgroundColor: "rgba(54, 50, 96, 1)",
    borderRadius: 5,
    marginBottom: 10,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 15,
    backgroundColor: "rgba(54, 50, 76, 0.90)",
    marginTop: 10,
    marginHorizontal: 20,
    borderRadius: 15,
  },
  statItem: {
    alignItems: "center",
  },
  statText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 5,
  },
  statLabel: {
    color: "#ccc",
    fontSize: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(54, 50, 76, 0.90)",
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 10,
    paddingHorizontal: 10,
    height: 36,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
    height: "100%",
  },
});
