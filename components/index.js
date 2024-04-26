import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, Button, ActivityIndicator, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';
import axios from 'axios';

// Avaa tietokannan
const db = SQLite.openDatabase('news.db');

export default function Newsapp({ navigation }) {
  
  // Tilamuuttujat artikkeleille, latausindikaattorille, hakukyselylle ja onnistumisviestille
  const [articles, setArticles] = useState([]);
  const [originalArticles, setOriginalArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');

  // Alustetaan tietokanta ja haetaan artikkelit kun komponentti latautuu
  useEffect(() => {
    createTable();
    fetchArticles();
  }, []);

  // Luo tietokantataulun artikkeleille
  const createTable = () => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS articles (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT)'
      );
    });
  };

  // Hakee artikkelit News API:sta ja päivittää tilan
  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`https://newsapi.org/v2/top-headlines?country=us&apiKey=b27f9ba2665e4330b3beb8b4362dc8cd`);
      setArticles(response.data.articles);
      setOriginalArticles(response.data.articles);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Suorittaa haun käyttäjän syöttämän hakukyselyn perusteella
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setArticles(originalArticles);
      setLoading(false);
      return;
    }
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

  // Tallentaa artikkelin paikalliseen SQLite-tietokantaan
  const saveArticle = (title, description) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO articles (title, description) VALUES (?, ?)',
        [title, description],
        (_, result) => {
          console.log('Article saved:', result.insertId);
          setSaveSuccessMessage('Artikkeli tallennettu');
          setTimeout(() => setSaveSuccessMessage(''), 3000);
        },
        (_, error) => {
          console.error('Error saving article:', error);
          Alert.alert('Error', 'Failed to save the article.');
        }
      );
    });
  };

  // Komponentin renderöinti
  return (
    <View style={styles.container}>
      <Text style={styles.title}>NewsApp</Text>
      <Button title="Tallennetut artikkelit" onPress={() => navigation.navigate('Tallennetut artikkelit', { saveArticle })} />
      <TextInput
        style={styles.input}
        placeholder="Search articles..."
        value={searchQuery}
        onChangeText={(text) => {
          setSearchQuery(text);
          if (!text.trim()) {
            setArticles(originalArticles); 
          }
        }}
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
              <Text style={styles.articlePublishedAt}>{new Date(item.publishedAt).toLocaleDateString()}</Text>
              <Button
                title="Save"
                onPress={() => saveArticle(item.title, item.description)}
              />
            </View>
          )}
        />
      )}
      {saveSuccessMessage ? <Text style={styles.successMessage}>{saveSuccessMessage}</Text> : null}
    </View>
  );
}

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
    marginBottom: 10,
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
  list: {
    flexGrow: 0,
    width: '90%',
    height: '70%',
  },
  successMessage: {
    color: 'green',
    fontSize: 20,
    marginTop: 20,
  },
  articlePublishedAt: {
    fontSize: 14,
    color: 'grey',
    marginBottom: 5,
  },
});
