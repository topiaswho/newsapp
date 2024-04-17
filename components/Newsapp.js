import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, Button, ActivityIndicator } from 'react-native';
import * as SQLite from 'expo-sqlite';
import axios from 'axios';

const db = SQLite.openDatabase('news.db');

export default function Newsapp({  navigation }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    createTable();
    fetchArticles();
  }, []);

  const createTable = () => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS articles (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT)'
      );
    });
  };

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`https://newsapi.org/v2/top-headlines?country=us&apiKey=b27f9ba2665e4330b3beb8b4362dc8cd`);
      setArticles(response.data.articles);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`https://newsapi.org/v2/everything?q=${searchQuery}&apiKey=b27f9ba2665e4330b3beb8b4362dc8cd`);
      setArticles(response.data.articles);
    } catch (error) {
      console.error('Error searching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveArticle = (title, description) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO articles (title, description) VALUES (?, ?)',
        [title, description],
        (_, result) => console.log('Article saved:', result.insertId),
        (_, error) => console.error('Error saving article:', error)
      );
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NewsApp</Text>
      <Button title="Tallennetut artikkelit" onPress={() => navigation.navigate('Tallennetut artikkelit', { savedArticles })} />
      <TextInput
        style={styles.input}
        placeholder="Search articles..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <Button title="Search" onPress={handleSearch} />
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          style={styles.list}
          data={articles}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.articleContainer}>
              <Text style={styles.articleTitle}>{item.title}</Text>
              <Text style={styles.articleDescription}>{item.description}</Text>
              <Button
                title="Save"
                onPress={() => saveArticle(item.title, item.description)}
              />
            </View>
          )}
        />
      )}
    </View>
  );
}

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
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
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
  list: {
    flexGrow: 0,
    width: '90%',
    height: '70%',
  },
});
