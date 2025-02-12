// app/_layout.tsx
import React, { useEffect, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { auth } from '../firebaseConfig';

export default function Layout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();



  return (
    <Stack screenOptions={{ headerShown: false }}>  
      <Stack.Screen name="index" options={{ title: "Login" }} />
      
    </Stack>
  );
}
