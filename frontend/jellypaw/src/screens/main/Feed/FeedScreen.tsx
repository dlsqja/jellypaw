import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../../../ui/components/Text';
import { getPetList } from '../../../services/api/pet';

export default function FeedScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>피드 화면</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  text: {
    fontSize: 18,
    color: '#284542',
  },
});
