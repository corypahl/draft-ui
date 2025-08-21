import React, { useState, useEffect, useRef } from 'react';
import './LeagueSelector.css';
import { fetchAndProcessDraftData, DATA_SOURCES } from '../services/draftDataService';

const LeagueSelector = ({ onLeagueChange, onDraftDataUpdate }) => {
  // League-specific default configurations
  const leagueDefaults = {
    'FanDuel': {
      dataSource: DATA_SOURCES.SLEEPER,
      draftId: '1257088161859772417' // FanDuel league draft ID
    },
    'Jackson': {
      dataSource: DATA_SOURCES.SLEEPER,
      draftId: '1257138560100741120' // Jackson league draft ID
    },
    'GVSU': {
      dataSource: DATA_SOURCES.GOOGLE_APPS_SCRIPT,
      draftId: '' // No draft ID needed for Google Apps Script
    }
  };

  const [selectedLeague, setSelectedLeague] = useState('Jackson');
  const [dataSource, setDataSource] = useState(leagueDefaults['Jackson'].dataSource);
  const [draftId, setDraftId] = useState(leagueDefaults['Jackson'].draftId);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(5); // Default 5 seconds
  const [lastRefresh, setLastRefresh] = useState(null);
  const intervalRef = useRef(null);

  const leagues = [
    { id: 'FanDuel', name: 'FanDuel' },
    { id: 'Jackson', name: 'Jackson' },
    { id: 'GVSU', name: 'GVSU' }
  ];

  // Fetch draft data on initial load
  useEffect(() => {
    // Automatically fetch draft data when component mounts with Jackson league defaults
    const defaults = leagueDefaults['Jackson'];
    if (defaults) {
      console.log('LeagueSelector: Initial load - fetching data with params:', defaults.dataSource, defaults.draftId);
      fetchDraftDataWithParams(defaults.dataSource, defaults.draftId);
    }
  }, []); // Empty dependency array means this runs once on mount

  // Handle auto-refresh functionality
  useEffect(() => {
    if (autoRefresh && (dataSource === DATA_SOURCES.GOOGLE_APPS_SCRIPT || draftId.trim())) {
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      // Set up new interval
      intervalRef.current = setInterval(() => {
        fetchDraftData();
      }, refreshInterval * 1000);
      
      console.log(`Auto-refresh enabled: ${refreshInterval} seconds`);
    } else {
      // Clear interval if auto-refresh is disabled
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        console.log('Auto-refresh disabled');
      }
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, draftId, dataSource]);

  const handleLeagueChange = (leagueId) => {
    console.log('LeagueSelector: Switching to league:', leagueId);
    setSelectedLeague(leagueId);
    setError('');
    
    // Apply league-specific defaults
    const defaults = leagueDefaults[leagueId];
    if (defaults) {
      console.log('LeagueSelector: Applying defaults:', defaults);
      setDataSource(defaults.dataSource);
      setDraftId(defaults.draftId);
      
      // Automatically fetch draft data when switching leagues
      // Use the new values directly instead of relying on state updates
      setTimeout(() => {
        console.log('LeagueSelector: Fetching data with params:', defaults.dataSource, defaults.draftId);
        fetchDraftDataWithParams(defaults.dataSource, defaults.draftId);
      }, 100); // Small delay to ensure state updates are applied
    }
    
    onLeagueChange(leagueId);
  };

  const handleDataSourceChange = (e) => {
    setDataSource(e.target.value);
    setError('');
  };

  const handleDraftIdChange = (e) => {
    setDraftId(e.target.value);
    setError('');
  };

  const handleAutoRefreshToggle = () => {
    setAutoRefresh(!autoRefresh);
  };

  const handleRefreshIntervalChange = (e) => {
    const value = parseInt(e.target.value);
    if (value >= 1 && value <= 300) {
      setRefreshInterval(value);
    }
  };

  const fetchDraftDataWithParams = async (source, id) => {
    // Validate input based on data source
    if (source === DATA_SOURCES.SLEEPER && !id.trim()) {
      setError('Please enter a draft ID for Sleeper API');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Fetching draft data from:', source, 'with ID:', id);
      
      // Use the new unified service
      const processedData = await fetchAndProcessDraftData(source, id);
      console.log('Processed data:', processedData);
      
      onDraftDataUpdate(processedData);
      setError('');
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error in fetchDraftData:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDraftData = async () => {
    return fetchDraftDataWithParams(dataSource, draftId);
  };



  return (
    <div className="league-selector">
      <div className="selector-container">
        <div className="league-dropdown">
          <label htmlFor="league-select">League:</label>
          <select
            id="league-select"
            value={selectedLeague}
            onChange={(e) => handleLeagueChange(e.target.value)}
          >
            {leagues.map(league => (
              <option key={league.id} value={league.id}>
                {league.name}
              </option>
            ))}
          </select>
        </div>

        <div className="data-source-dropdown">
          <label htmlFor="data-source-select">Data Source:</label>
          <select
            id="data-source-select"
            value={dataSource}
            onChange={handleDataSourceChange}
          >
            <option value={DATA_SOURCES.SLEEPER}>Sleeper API</option>
            <option value={DATA_SOURCES.GOOGLE_APPS_SCRIPT}>Google Apps Script</option>
          </select>
        </div>

        {dataSource === DATA_SOURCES.SLEEPER && (
          <div className="draft-id-input">
            <label htmlFor="draft-id">Draft ID:</label>
            <input
              id="draft-id"
              type="text"
              placeholder="Enter Sleeper draft ID..."
              value={draftId}
              onChange={handleDraftIdChange}
              onKeyPress={(e) => e.key === 'Enter' && fetchDraftData()}
            />
          </div>
        )}

        <div className="refresh-interval-input">
          <label htmlFor="refresh-interval">Refresh (sec):</label>
                       <input
               type="number"
               id="refresh-interval"
               min="1"
               max="300"
               value={refreshInterval}
               onChange={handleRefreshIntervalChange}
               className="interval-input"
             />
        </div>

        <label className="auto-refresh-toggle">
          <input
            type="checkbox"
            id="auto-refresh-toggle"
            checked={autoRefresh}
            onChange={handleAutoRefreshToggle}
          />
          <span className="toggle-label">Auto</span>
        </label>

        <button 
          className="fetch-btn"
          onClick={fetchDraftData}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : `Fetch ${dataSource === DATA_SOURCES.SLEEPER ? 'Sleeper' : 'Google Apps Script'} Draft`}
        </button>
      </div>

      {lastRefresh && (
        <div className="last-refresh-info">
          Last refreshed: {lastRefresh.toLocaleTimeString()}
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="loading-message">
          Fetching draft data from {dataSource === DATA_SOURCES.SLEEPER ? 'Sleeper' : 'Google Apps Script'}...
        </div>
      )}
    </div>
  );
};

export default LeagueSelector; 