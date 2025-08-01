# 🏈 Fantasy Football Draft Assistant

A modern, responsive React web application designed to help you dominate your fantasy football draft. Built with React and deployed on GitHub Pages.

## ✨ Features

- **Advanced Player List**: Comprehensive player database with rankings, tiers, and detailed statistics
- **Depth Chart Integration**: Team depth charts accessible via interactive tooltips
- **Injury Tracking**: Visual injury indicators with status information
- **Rookie Identification**: Special badges for rookie players with draft round information
- **Real-time Search & Filtering**: Search players by name or team, filter by position
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Modern UI**: Beautiful, intuitive interface with smooth animations and dark theme

## 🚀 Live Demo

Visit the live application: [Fantasy Football Draft Assistant](https://cory.github.io/draft-ui)

## 🛠️ Tech Stack

- **Frontend**: React 18 with Hooks
- **Styling**: CSS3 with modern design patterns and CSS Grid/Flexbox
- **State Management**: React useState, useMemo, useEffect, useRef
- **Deployment**: GitHub Pages
- **CI/CD**: GitHub Actions

## 📦 Installation & Setup

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/cory/draft-ui.git
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

4. **Open your browser**
   Navigate to `http://localhost:3000` to view the application.

### Building for Production

```bash
npm run build
```

### Deploying to GitHub Pages

The application is automatically deployed to GitHub Pages when you push to the `main` branch. The deployment is handled by GitHub Actions.

To manually deploy:

```bash
npm run deploy
```

## 🎯 How to Use

1. **Browse Players**: View the comprehensive player list with rankings, tiers, and statistics
2. **Search & Filter**: Use the search bar to find players by name or team, or filter by position
3. **View Depth Charts**: Click team buttons below the search bar to view team depth charts
4. **Track Injuries**: Look for crutch icons (🩼) next to injured players with status information
5. **Identify Rookies**: Purple "R1", "R2", etc. badges indicate rookie players and their draft round
6. **Analyze Data**: View detailed player statistics including ADP, projections, upside, risk, and more

## 📱 Features in Detail

### Player List
- **Comprehensive Data**: View player rankings, tiers, ADP, projections, upside, risk, boom/bust potential
- **Search & Filter**: Search by player name or team, filter by position (QB, RB, WR, TE, K, D)
- **Color-coded System**: Position-based color coding for easy identification
- **Tier Organization**: Players organized by tiers for strategic drafting

### Depth Chart Tooltip
- **Team Buttons**: Interactive buttons for each NFL team below the search bar
- **Depth Chart Display**: 4-column layout showing QB, RB, WR, TE depth charts
- **Lazy Loading**: Depth charts load efficiently after initial page load
- **Responsive Design**: Adapts to different screen sizes with optimized layouts

### Player Information Display
- **Injury Tracking**: Crutch icon (🩼) with inline injury status for injured players
- **Rookie Badges**: Purple badges showing draft round (R1, R2, etc.) for rookie players
- **Two-Row Data Layout**: 
  - Row 1: ADP, Projected Points, Upside, Risk
  - Row 2: Previous Rank, Previous Points, Boom, Bust
- **College Information**: College details displayed for rookie players

### Visual Enhancements
- **Dark Theme**: Modern dark interface for reduced eye strain
- **Hover Effects**: Smooth transitions and hover states throughout
- **Responsive Grid**: Adaptive layouts for desktop, tablet, and mobile
- **Professional Typography**: Clean, readable fonts with proper hierarchy

## 🔧 Configuration

### Environment Variables

No environment variables are required for basic functionality. The application uses sample data for demonstration purposes.

### Customization

You can customize the application by:
- Modifying the player data structure in `src/services/playerDataService.js`
- Adjusting the color scheme in the CSS files
- Adding new features to the components
- Customizing depth chart display options

## 🏗️ Project Structure

```
src/
├── components/
│   ├── PlayerList.js          # Main player list component
│   ├── PlayerList.css         # Player list styling
│   ├── DepthChartTooltip.js   # Depth chart tooltip component
│   ├── DepthChartTooltip.css  # Tooltip styling
│   ├── LeagueSelector.js      # League selection component
│   └── LeagueSelector.css     # League selector styling
├── services/
│   └── playerDataService.js   # Data fetching and processing
├── App.js                     # Main application component
└── App.css                    # Global application styling
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with React and modern web technologies
- Deployed on GitHub Pages
- Icons and emojis for enhanced user experience
- Depth chart data integration for comprehensive team analysis

## 📞 Support

If you have any questions or need support, please open an issue on GitHub.

---

**Happy Drafting! 🏈**