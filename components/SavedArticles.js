import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('news.db');

const SavedArticles = () => {
  const [savedArticles, setSavedArticles] = useState([]);

  useEffect(() => {
    fetchSavedArticles();
  }, []);

  const fetchSavedArticles = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM articles',
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Saved Articles</Text>
      <FlatList
        data={savedArticles}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.articleContainer}>
            <Text style={styles.articleTitle}>{item.title}</Text>
            <Text style={styles.articleDescription}>{item.description}</Text>
          </View>
        )}
      />
    </View>
  );
};

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
