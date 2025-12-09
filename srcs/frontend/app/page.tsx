'use client'; // Indique que c'est un Client Component pour utiliser fetch/hooks

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function Home() {
  const [apiMessage, setApiMessage] = useState('En attente de l\'API...');
  const [dbStatus, setDbStatus] = useState('Non testé');

  // Fonction pour tester la route GET du backend
  const testApi = async () => {
    try {
      const response = await fetch(`${API_URL}/status`);
      const message = await response.text();
      setApiMessage(message);
    } catch (error) {
      setApiMessage('Erreur de connexion à l\'API (Backend down ou URL incorrecte)');
    }
  };

  // Fonction pour tester la connexion Prisma (route POST)
  const testDb = async () => {
    const username = `test_player_${Date.now()}`;
    try {
      const response = await fetch(`${API_URL}/status/player`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const data = await response.json();
      if (data && data.id) {
        setDbStatus(`Joueur créé avec succès (ID: ${data.id}, Nom: ${data.username})`);
      } else {
        setDbStatus('Échec de la création du joueur (Vérifiez la migration Prisma)');
      }
    } catch (error) {
      setDbStatus(`Erreur de BDD/Prisma : ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>🚀 Environment Test - Coding Game</h1>
      
      <h2>Backend Status (GET /status)</h2>
      <p style={{ fontWeight: 'bold' }}>{apiMessage}</p>
      <button onClick={testApi}>Tester API</button>
      
      <hr style={{ margin: '20px 0' }} />
      
      <h2>Prisma/DB Status (POST /status/player)</h2>
      <p style={{ fontWeight: 'bold' }}>{dbStatus}</p>
      <button onClick={testDb}>Tester Connexion BDD</button>
      
      <hr style={{ margin: '20px 0' }} />
      
      <p>Frontend Next.js est bien opérationnel sur **http://localhost:3001**.</p>
    </div>
  );
}

