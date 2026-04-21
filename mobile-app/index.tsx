import React from 'react';
import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';

export function App() {
  // @ts-ignore
  const ctx = require.context('./app');
  return <ExpoRoot context={ctx} />;
}

// THIS IS THE KEY: Expo Router needs a default export sometimes 
// or registerRootComponent fails.
registerRootComponent(App);
export default App;