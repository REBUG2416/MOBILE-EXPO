import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
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



type NewEntryScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "NewEntry"
>;

type NewEntryScreenRouteProp = RouteProp<RootStackParamList, "NewEntry">;

type Props = {
  navigation: NewEntryScreenNavigationProp;
  route: NewEntryScreenRouteProp;
};

export default function NewEntryScreen({ navigation, route }: Props) {
  const [content, setContent] = useState<string>("");
  const [editingDate, setEditingDate] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false); // Track edit state

  useEffect(() => {
    if (route.params?.entry) {
      setContent(route.params.entry.content);
      setEditingDate(route.params.entry.date);
    }
  }, [route.params]);

  const saveEntry = async () => {
    if (content.trim().length === 0) return;

    try {
      const jsonEntries = await AsyncStorage.getItem("@journal_entries");
      let entries = jsonEntries ? JSON.parse(jsonEntries) : [];

      if (editingDate) {
        // Update the existing entry if editing
        entries = entries.map((entry: any) =>
          entry.date === editingDate ? { ...entry, content } : entry
        );
      } else {
        // Add new entry if not editing
        const newEntry = { date: new Date().getTime(), content };
        entries.push(newEntry);
      }

      await AsyncStorage.setItem("@journal_entries", JSON.stringify(entries));
      navigation.goBack(); // Go back after saving
    } catch (e) {
      console.error("Failed to save the entry:", e);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const toggleEditMode = () => {
    if (!isEditing) {
      setIsEditing(true); // Set to edit mode
    } else {
      saveEntry(); // Save when in editing mode
      setIsEditing(false); // Exit edit mode after saving
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.container}>
          <Image
            source={require("../assets/images/Note_img.png")}
            resizeMode="cover"
            style={styles.headerImage}
          />
          <View style={styles.overlay}>
            <Text style={styles.titleText}>
              {editingDate ? "Edit Journal" : "New Journal"}
            </Text>
          </View>

          <View style={styles.contentContainer}>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: 10,
                paddingBottom: 20,
                alignItems: "center",
              }}
            >
              <Text style={styles.dateText}>
                {editingDate
                  ? new Date(editingDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
              </Text>
              <TouchableOpacity
                onPress={toggleEditMode}
                style={styles.editButton}
              >
                <Feather
                  name={isEditing ? "save" : "edit"}
                  size={24}
                  color="#5b57ea"
                />
                <Text style={styles.editButtonText}>
                  {isEditing ? "Save" : "Edit"}
                </Text>
              </TouchableOpacity>
            </View>
            {/* Text Input for Entry */}
            <TextInput
              style={styles.input}
              multiline
              placeholder="What's on your mind today?"
              placeholderTextColor="#9e9e9e"
              value={content}
              onChangeText={setContent}
              editable={isEditing} // Only editable in edit mode
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  headerImage: {
    width: "100%",
    height: 200,
    opacity: 0.7,
  },
  overlay: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: 200,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  titleText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  editButton: {
    display:"flex",
    flexDirection:"row",
    alignItems:"center",
    gap:5,
  },

  editButtonText: {
    color: "#5b57ea",
    fontSize: 18,
    fontWeight: "bold",
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "rgba(54, 50, 96, 1)",
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#fff",
    lineHeight: 24,
    textAlignVertical: "top",
    backgroundColor: "#282c32",
    borderRadius: 10,
    padding: 15,
  },
});
