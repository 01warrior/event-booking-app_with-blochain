import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers'; 
import EventBookingArtifact from './contracts/EventBooking.json';
import { EVENT_BOOKING_CONTRACT_ADDRESS } from './config_contrat';
import './App.css';

function App() {
  const [account, setAccount] = useState(null);
  // provider, signer, and contract are initialized after wallet connection
  const [contract, setContract] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const initWeb3 = useCallback(async (currentAccount) => {
    if (!window.ethereum) {
        setError("MetaMask not detected. Please install MetaMask extension.");
        return null;
    }
    try {
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        const web3Signer = await web3Provider.getSigner(currentAccount); // Get signer for the specific account

        const eventBookingContract = new ethers.Contract(
            EVENT_BOOKING_CONTRACT_ADDRESS,
            EventBookingArtifact.abi,
            web3Signer
        );
        setContract(eventBookingContract);
        return { web3Provider, web3Signer, eventBookingContract };
    } catch (err) {
        console.error("Error initializing Web3:", err);
        setError("Failed to initialize Web3. Ensure MetaMask is configured correctly.");
        setAccount(null); 
        setContract(null);
        return null;
    }
  }, []);


  const connectWallet = async () => {
    setError('');
    setSuccessMessage('');
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          const currentAccount = accounts[0];
          setAccount(currentAccount);
          await initWeb3(currentAccount); // Initialize contract with the new account
        } else {
          setError("No accounts found. Please create or import an account in MetaMask.");
          setAccount(null);
          setContract(null);
        }
      } catch (err) {
        console.error("Error connecting wallet:", err);
        setError(err.message || "Failed to connect wallet. Make sure MetaMask is installed and unlocked.");
        setAccount(null);
        setContract(null);
      }
    } else {
      setError("MetaMask not detected. Please install MetaMask extension.");
    }
  };


  const loadEvents = useCallback(async () => {
    if (!contract || !account) {
        console.log("loadEvents: Contract or account not ready.", { contractExists: !!contract, accountExists: !!account });
        return;
    }
    setLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      const eventCountBigInt = await contract.eventCount();
      const eventCount = Number(eventCountBigInt); // Convert bigint to number because eventCount is a BigInt in ethers v6
      const loadedEvents = [];

      for (let i = 0; i < eventCount; i++) {
        const eventData = await contract.events(i);
        // Dans le contrat un evenement est une strcuture contenant: [name, capacity, registered]
        const capacityNum = Number(eventData.capacity);
        const registeredNum = Number(eventData.registered);
        //verifier si l'utilisateur a reservé cet evenement en utilisant la fonction reservations dans le contrat pour obtenir le booléen
        const userHasReserved = await contract.reservations(account, i);

        loadedEvents.push({
          id: i,
          name: eventData.name,
          capacity: capacityNum,
          registered: registeredNum,
          isReservedByMe: userHasReserved,
          isFull: registeredNum >= capacityNum,
        });
      }
      setEvents(loadedEvents);
    } catch (err) {
      console.error("Error loading events:", err);
      setError("Failed to load events from the blockchain. Check console for details.");
    }
    setLoading(false);
  }, [contract, account]); // Dependencies for useCallback

 
  useEffect(() => {
    if (contract && account) {
      loadEvents();
    }
  }, [contract, account, loadEvents]); // loadEvents is now a dependency

  // Effect for handling MetaMask account and chain changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = async (accounts) => {
        if (accounts.length > 0) {
          const newAccount = accounts[0];
          setAccount(newAccount);
          // Re-initialize provider, signer, and contract with the new account
          await initWeb3(newAccount);
        } else {
          setAccount(null);
          setContract(null);
          setEvents([]);
          setError("MetaMask account disconnected or locked.");
        }
      };

      const handleChainChanged = () => {
        // Reload the page or re-initialize to handle network changes correctly
        // For simplicity, reloading. A more robust solution might re-initialize.
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // Cleanup listeners on component unmount
      return () => {
        if (window.ethereum.removeListener) {
            window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [initWeb3]); // initWeb3 is a dependency

  const handleReserve = async (eventId) => {
    if (!contract) { 
      setError("Contract not loaded.");
      return;
    }
    setLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      // The contract instance already has the signer from initWeb3
      const tx = await contract.reserve(eventId);
      await tx.wait(); // attendre que la transaction soit minée
      setSuccessMessage(`Successfully reserved a place for event ID ${eventId}!`);
      loadEvents(); // Reload events to update UI
    } catch (err) {
      console.error("Error reserving event:", err);
      let reason = "Failed to reserve. ";
      if (err.data && err.data.message) { // Geth style error
        reason += err.data.message;
      } else if (err.reason) {
        reason += err.reason;
      } else if (err.message) {
        reason += err.message;
      }
      // message de l'erreur
      if (reason.toLowerCase().includes("already reserved")) {
        setError("You have already reserved this event.");
      } else if (reason.toLowerCase().includes("event is full")) {
        setError("This event is full.");
      } else if (reason.toLowerCase().includes("invalid event id")) {
        setError("Invalid event ID specified.");
      } else {
        setError(reason.substring(0, 150) + (reason.length > 150 ? "..." : "")); // Truncate long errors
      }
    }
    setLoading(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Event Booking DApp</h1>
        {!account ? (
          <button onClick={connectWallet}>Connect MetaMask</button>
        ) : (
          <p>Connected Account: {account.substring(0, 6)}...{account.substring(account.length - 4)}</p>
        )}
      </header>

      {error && <p className="error-message">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}

      {loading && <p>Loading data from blockchain...</p>}

      {account && contract && (
        <div className="event-list">
          <h2>Available Events</h2>
          {events.length === 0 && !loading && <p>No events found or create some via your contract owner account.</p>}
          {events.map((event) => (
            <div key={event.id} className="event-item">
              <h3>{event.name}</h3>
              <p>Capacity: {event.capacity}</p>
              <p>Registered: {event.registered}</p>
              <p>Places Remaining: {event.capacity - event.registered}</p>
              <button
                onClick={() => handleReserve(event.id)}
                disabled={event.isReservedByMe || event.isFull || loading}
              >
                {loading ? "Processing..." : event.isReservedByMe ? "Already Reserved" : event.isFull ? "Event Full" : "Reserve Place"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;