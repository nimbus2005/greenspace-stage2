// App.jsx
import React, { useState, useEffect } from "react";
import MapView from "./components/MapView";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import { auth } from "./utils/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  if (!user) return <Login />;

  return (
    <div>
      <h1>GreenSpace Stage 2</h1>
      <button onClick={() => signOut(auth)}>Logout</button>
      <MapView />
      <Dashboard />
    </div>
  );
};

export default App;
