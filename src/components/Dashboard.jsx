// src/components/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../utils/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../utils/firebase";

const Dashboard = () => {
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);

        const usersSnapshot = await getDocs(collection(db, "users"));
        const userData = usersSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .find(u => u.email === user.email);

        setCurrentUserData(userData);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadReportsAndUsers = async () => {
      if (!currentUserData) return;

      const reportsSnapshot = await getDocs(collection(db, "reports"));
      const filteredReports = reportsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(report => report.parkGroupId === currentUserData.parkGroupId);

      setReports(filteredReports);

      const usersSnapshot = await getDocs(collection(db, "users"));
      const filteredUsers = usersSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.parkGroupId === currentUserData.parkGroupId);

      setUsers(filteredUsers);
    };

    loadReportsAndUsers();
  }, [currentUserData]);

  const resolveReport = async (reportId) => {
    await updateDoc(doc(db, "reports", reportId), { status: "resolved" });
    alert("Report marked as resolved.");
    window.location.reload();
  };

  if (!currentUserData) return <div>Loading Dashboard...</div>;

  return (
    <div>
      <h2>Dashboard</h2>

      <h3>Reports for Park Group: {currentUserData.parkGroupId}</h3>
      <ul>
        {reports.map(report => (
          <li key={report.id}>
            {report.message} | Status: {report.status}
            <button onClick={() => resolveReport(report.id)}>Resolve</button>
          </li>
        ))}
      </ul>

      <h3>Users & Points:</h3>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.name} ({user.role}) - Points: {user.points}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
