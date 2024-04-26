import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Button, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';

// Avataan tietokanta
const db = SQLite.openDatabase('news.db');

const SavedArticles = () => {
 
  // Tilamuuttuja tallennetuille artikkeleille
  const [savedArticles, setSavedArticles] = useState([]);

  // Haetaan tallennetut artikkelit tietokannasta komponentin latautuessa
  useEffect(() => {
    fetchSavedArticles();
  }, []);

  // Funktio tallennettujen artikkelien hakemiseen tietokannasta ja lajitellaan ne viimeisimmän mukaan
  const fetchSavedArticles = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM articles ORDER BY id DESC',
        [],
        (_, { rows: { _array } }) => {
          setSavedArticles(_array);
        },
        (_, error) => {
          console.error('Error fetching saved articles:', error);
        }
      );
    });
  };

  // Funktio artikkelin poistamiseen tietokannasta
  const deleteArticle = (id) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM articles WHERE id = ?',
        [id],
        (_, result) => {
          
          // Tarkistetaan, onko artikkeli poistettu onnistuneesti
          if (result.rowsAffected > 0) {
            Alert.alert('Success', 'Article deleted successfully');
            
            // Haetaan päivitetty lista tallennetuista artikkeleista
            fetchSavedArticles(); 
          } else {
            Alert.alert('Error', 'Failed to delete the article');
          }
        },
        (_, error) => {
          console.error('Error deleting article:', error);
        }
      );
    });
  };

  // Renderöinti
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Saved Articles</Text>
      <FlatList
        data={savedArticles}
        keyExtractor={(item) => item.id.toString()} // Avainkenttä, joka on muunnettava merkkijonoksi
        renderItem={({ item }) => (
          <View style={styles.articleContainer}>
            <Text style={styles.articleTitle}>{item.title}</Text>
            <Text style={styles.articleDescription}>{item.description}</Text>
            {/* Poista-nappi artikkelin poistamiseksi */}
            <Button
              title="Delete"
              onPress={() => deleteArticle(item.id)}
              color="red"
            />
          </View>
        )}
      />
    </View>
  );
};

// Tyylien määrittely
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  articleContainer: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    width: '100%'
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  articleDescription: {
    fontSize: 16,
    marginBottom: 5,
  },
});

export default SavedArticles;
