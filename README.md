# 🏈 Fantasy Football Draft Assistant

A modern, responsive React web application designed to help you dominate your fantasy football draft. Built with React and deployed on GitHub Pages.

## ✨ Features

- **Draft Board Management**: Track draft order and current picks
- **Player Database**: Browse available players with rankings and tiers
- **Team Rosters**: View and manage team compositions
- **Real-time Updates**: Live draft progress tracking
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Modern UI**: Beautiful, intuitive interface with smooth animations

## 🚀 Live Demo

Visit the live application: [Fantasy Football Draft Assistant](https://cory.github.io/draft-ui)

## 🛠️ Tech Stack

- **Frontend**: React 18
- **Styling**: CSS3 with modern design patterns
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

1. **Add Teams**: Click the "+ Add Team" button to add teams to your draft
2. **Browse Players**: Use the player list to view available players with rankings and tiers
3. **Select Players**: Click "Draft" to add players to teams
4. **Track Progress**: Monitor draft progress and team rosters in real-time
5. **Analyze Rosters**: View position breakdowns and roster analysis

## 📱 Features in Detail

### Draft Board
- Track current pick number
- View team order and selections
- Navigate between picks
- Add/remove teams dynamically

### Player List
- Search players by name or team
- Filter by position (QB, RB, WR, TE, K, DEF)
- View player rankings and tiers
- Color-coded tier system for easy identification

### Team Roster
- View drafted players by team
- Position breakdown and analysis
- Roster strength indicators
- Draft round tracking

## 🔧 Configuration

### Environment Variables

No environment variables are required for basic functionality. The application uses sample data for demonstration purposes.

### Customization

You can customize the application by:
- Modifying the sample player data in `src/components/PlayerList.js`
- Adjusting the color scheme in the CSS files
- Adding new features to the components

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

## 📞 Support

If you have any questions or need support, please open an issue on GitHub.

---

**Happy Drafting! 🏈**