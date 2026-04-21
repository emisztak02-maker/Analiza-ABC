import React, { useState, useEffect } from 'react';
import { Text, View, Button, TextInput, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [input, setInput] = useState('');
  const [factors, setFactors] = useState([]);
  const [pairs, setPairs] = useState([]);
  const [index, setIndex] = useState(0);
  const [scores, setScores] = useState({});
  const [started, setStarted] = useState(false);

  // 🔁 Wczytaj zapis
  useEffect(() => {
    loadData();
  }, []);

  async function saveData(data) {
    await AsyncStorage.setItem('projekt', JSON.stringify(data));
  }

  async function loadData() {
    let data = await AsyncStorage.getItem('projekt');
    if (data) {
      let parsed = JSON.parse(data);
      setFactors(parsed.factors || []);
      setPairs(parsed.pairs || []);
      setIndex(parsed.index || 0);
      setScores(parsed.scores || {});
      setStarted(parsed.started || false);
    }
  }

  function addFactor() {
    if (input && factors.length < 20) {
      const newFactors = [...factors, input];
      const newScores = { ...scores, [input]: 0 };

      setFactors(newFactors);
      setScores(newScores);
      setInput('');

      saveData({ factors: newFactors, pairs, index, scores: newScores, started });
    }
  }

  function generatePairs() {
    let p = [];
    for (let i = 0; i < factors.length; i++) {
      for (let j = i + 1; j < factors.length; j++) {
        p.push([factors[i], factors[j]]);
      }
    }
    return p;
  }

  function start() {
    const p = generatePairs();
    setPairs(p);
    setStarted(true);

    saveData({ factors, pairs: p, index: 0, scores, started: true });
  }

  function answer(type) {
    let [a, b] = pairs[index];
    let newScores = { ...scores };

    if (type === 'first') newScores[a] += 2;
    else if (type === 'second') newScores[b] += 2;
    else {
      newScores[a] += 1;
      newScores[b] += 1;
    }

    let newIndex = index + 1;

    setScores(newScores);
    setIndex(newIndex);

    saveData({
      factors,
      pairs,
      index: newIndex,
      scores: newScores,
      started
    });
  }

  function reset() {
    setFactors([]);
    setPairs([]);
    setIndex(0);
    setScores({});
    setStarted(false);
    AsyncStorage.removeItem('projekt');
  }

  // 🟢 EKRAN STARTOWY
  if (!started) {
    return (
      <ScrollView style={{ padding: 20 }}>
        <Text style={{ fontSize: 20 }}>Dodaj czynniki:</Text>

        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Wpisz czynnik"
          style={{ borderWidth: 1, marginVertical: 10, padding: 5 }}
        />

        <Button title="Dodaj czynnik" onPress={addFactor} />

        {factors.map((f, i) => (
          <Text key={i}>• {f}</Text>
        ))}

        <Button title="Start analizy" onPress={start} />
      </ScrollView>
    );
  }

  // 🟢 WYNIKI
  if (index >= pairs.length) {
    let sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);

    return (
      <ScrollView style={{ padding: 20 }}>
        <Text style={{ fontSize: 20 }}>Wyniki:</Text>

        {sorted.map(([k, v]) => (
          <Text key={k}>{k}: {v} pkt</Text>
        ))}

        <Button title="Nowa analiza" onPress={reset} />
      </ScrollView>
    );
  }

  // 🟢 PYTANIA
  let [a, b] = pairs[index];

  return (
    <View style={{ padding: 20 }}>
      <Text>Pytanie {index + 1} / {pairs.length}</Text>
      <Text style={{ fontSize: 18, marginVertical: 10 }}>
        Który czynnik jest ważniejszy?
      </Text>

      <Text>{a} vs {b}</Text>

      <Button title={`➡ ${a}`} onPress={() => answer('first')} />
      <Button title="Remis" onPress={() => answer('equal')} />
      <Button title={`${b} ⬅`} onPress={() => answer('second')} />
    </View>
  );
}
