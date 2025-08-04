# Fantasy Football Draft Assistant

A comprehensive web application for managing and tracking fantasy football drafts with real-time updates, player rankings, and draft analytics.

## Features

- **Multi-Source Draft Tracking**: Support for both Sleeper API and Google Apps Script JSON data sources
- **Real-Time Updates**: Auto-refresh functionality for live draft tracking
- **Player Rankings**: Comprehensive player data with rankings, projections, and analysis
- **Draft Board**: Visual representation of draft progress with team rosters
- **Player Recommendations**: AI-powered suggestions based on team needs and available players
- **Depth Chart Analysis**: Team depth chart integration for better decision making
- **Injury Tracking**: Real-time injury updates and status monitoring
- **Rookie Information**: Detailed rookie profiles with draft position and college stats
- **Search & Filter**: Search by player name or team, filter by position (QB, RB, WR, TE, K, D)

## Data Sources

### Sleeper API
- Real-time draft data from Sleeper fantasy football platform
- Requires draft ID from your Sleeper league
- Provides rich player metadata including position, team, rankings, and projections

### Google Apps Script JSON
- Manual draft tracking via Google Apps Script
- Simple JSON format for easy updates
- Perfect for leagues using platforms not supported by Sleeper

#### Google Apps Script JSON Format

**Current Simple Format:**
```json
{
  "Draft Board": [
    {
      "Michael": "Christian McCaffrey",
      "Koyn": "Bijan Robinson",
      "Robby": "Jonathan Taylor",
      "Randy": "Breece Hall",
      "Bambi": "Tyreek Hill",
      "McBride": "CeeDee Lamb"
    },
    {
      "Michael": "Jalen Hurts",
      "Koyn": "Nico Collins",
      "Robby": "Joe Mixon",
      "Randy": "Chris Olave",
      "Bambi": "De'Von Achane",
      "McBride": "James Cook"
    }
  ]
}
```

**Enhanced Format (Recommended):**
```json
{
  "Draft Board": [
    {
      "round": 1,
      "picks": [
        {
          "team": "Michael",
          "player": "Christian McCaffrey",
          "position": "RB",
          "team": "SF",
          "rank": 1
        },
        {
          "team": "Koyn",
          "player": "Bijan Robinson",
          "position": "RB",
          "team": "ATL",
          "rank": 2
        }
      ]
    }
  ],
  "teams": [
    {
      "name": "Michael",
      "draftPosition": 1
    },
    {
      "name": "Koyn",
      "draftPosition": 2
    }
  ],
  "settings": {
    "totalRounds": 15,
    "draftType": "snake",
    "season": "2025",
    "leagueName": "My Fantasy League"
  }
}
```

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd draft-ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Configure your data source**
   - For Sleeper: Enter your draft ID in the interface
   - For Google Apps Script: Set up your Google Apps Script with the provided JSON format

## Usage

### Using Sleeper API
1. Select "Sleeper API" as your data source
2. Enter your Sleeper draft ID
3. Click "Fetch Sleeper Draft" to load your draft data
4. Enable auto-refresh for real-time updates

### Using Google Apps Script
1. Select "Google Apps Script" as your data source
2. Set up your Google Apps Script to return JSON in the supported format
3. Click "Fetch Google Apps Script Draft" to load your draft data
4. Enable auto-refresh for real-time updates

### Manual Updates
- For Google Apps Script: Update your spreadsheet and the JSON will automatically reflect changes
- The app will refresh automatically if auto-refresh is enabled

## Features in Detail

### Draft Board
- Visual representation of all teams and their picks
- Current pick highlighting with "on the clock" indicators
- Round-by-round draft progression
- Team roster management

### Player List
- Comprehensive player database with rankings and projections
- Position-based filtering and search functionality
- Draft status indicators (available/drafted)
- Player recommendations based on team needs

### My Team
- Personal team roster management
- Position-based roster analysis
- Draft strategy recommendations
- Team strength analysis

### Draft Info
- Draft settings and configuration
- League information and rules
- Draft statistics and analytics
- Historical draft data

## Technical Details

### Architecture
- React-based frontend with modern hooks and functional components
- Modular service architecture for data handling
- Responsive design with CSS Grid and Flexbox
- Real-time data synchronization

### Data Processing
- Unified data processing pipeline for multiple sources
- Player data enrichment with rankings and projections
- Real-time draft state management
- Error handling and validation

### Performance
- Optimized rendering with React.memo and useMemo
- Efficient data structures for large player databases
- Minimal re-renders with proper state management
- Lazy loading for improved initial load times

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation for common questions
- Review the troubleshooting guide

## Roadmap

- [ ] Enhanced player analytics and projections
- [ ] Multi-league support and management
- [ ] Advanced draft strategy tools
- [ ] Mobile app development
- [ ] Integration with additional fantasy platforms
- [ ] Real-time chat and communication features