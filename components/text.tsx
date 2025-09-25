"use client"

import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';

const DebugWalletAPI = () => {
  const { token } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isTesting, setIsTesting] = useState(false);

  const runComprehensiveTest = async () => {
    setIsTesting(true);
    const results: any = {};
    
    try {
      // Test 1: Check backend connectivity
      results.test1 = await testBackendConnectivity();
      
      // Test 2: Check token validity
      if (token) {
        results.test2 = await testTokenValidity(token);
      } else {
        results.test2 = { status: 'no-token', message: 'No token available' };
      }
      
      // Test 3: Test wallet balances endpoint
      if (token) {
        results.test3 = await testWalletBalancesEndpoint(token);
      }
      
    } catch (error) {
      results.error = error instanceof Error ? error.message : 'Unknown error';
    } finally {
      setIsTesting(false);
    }
    
    setDebugInfo(results);
    console.log('Debug results:', results);
  };

  const testBackendConnectivity = async () => {
    try {
      const response = await fetch('https://velo-node-backend.onrender.com', {
        method: 'GET',
      });
      return {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        connected: false
      };
    }
  };

  const testTokenValidity = async (token: string) => {
    try {
      const response = await fetch(
        'https://velo-node-backend.onrender.com/user/profile',
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      const responseText = await response.text();
      
      return {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        responseLength: responseText.length,
        preview: responseText.substring(0, 200) + '...'
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const testWalletBalancesEndpoint = async (token: string) => {
    try {
      const response = await fetch(
        'https://velo-node-backend.onrender.com/wallet/balances/testnet',
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      const responseText = await response.text();
      let parsedData = null;
      
      try {
        parsedData = JSON.parse(responseText);
      } catch  {
        // Ignore parse errors for now
      }
      
      return {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        responseLength: responseText.length,
        responsePreview: responseText.substring(0, 500),
        parsedData: parsedData
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      };
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      border: '2px solid #e74c3c', 
      margin: '10px',
      background: '#fff',
      borderRadius: '8px'
    }}>
      <h3 style={{ color: '#e74c3c', marginBottom: '15px' }}>🔧 API Debug Console</h3>
      
      <button 
        onClick={runComprehensiveTest}
        disabled={isTesting}
        style={{
          padding: '10px 20px',
          background: isTesting ? '#95a5a6' : '#3498db',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isTesting ? 'not-allowed' : 'pointer'
        }}
      >
        {isTesting ? 'Testing...' : 'Run Comprehensive Test'}
      </button>
      
      {debugInfo && Object.keys(debugInfo).length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h4>Test Results:</h4>
          <pre style={{ 
            background: '#2c3e50', 
            color: '#ecf0f1',
            padding: '15px',
            borderRadius: '4px',
            overflow: 'auto',
            maxHeight: '400px',
            fontSize: '12px'
          }}>
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default DebugWalletAPI;