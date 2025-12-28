# 🍪 Cookie Manager

A secure cookie storage and sharing system with automatic 1-hour deletion. Built with Next.js, React, and TypeScript.

## 📋 Overview

Cookie Manager is a web application that allows administrators to securely store and share browser cookies with users. All entries are automatically deleted after 1 hour for security purposes. The application features a dual-panel interface: an Admin Panel for creating and managing entries, and a Public User tab for viewing and copying shared cookies.

## ✨ Features

### Admin Panel
- **Create Entries**: Add new cookie entries with website name, cookies, and optional credentials
- **Quick Presets**: Pre-configured templates for popular services:
  - **Streaming**: Netflix, HBO Go, BStation, Disney+
  - **AI Services**: ChatGPT, Perplexity, Merlin AI, Cursor
- **Advanced Cookie Options**: Configure domain, HttpOnly, Secure, SameSite, and priority settings
- **Timer & Progress**: Real-time countdown timer and progress bar for each entry
- **Statistics Dashboard**: View active entries count and total cookies
- **Auto-Delete**: Automatic removal of entries after 1 hour
- **Manual Delete**: Remove entries manually before expiration

### Public User Tab
- **Browse Cookies**: View all available shared cookies
- **Search Functionality**: Search entries by website name
- **One-Click Copy**: Copy cookie values, usernames, and passwords to clipboard
- **Timer Display**: See remaining time for each entry
- **Responsive Design**: Works on desktop and mobile devices

### Additional Features
- **Toast Notifications**: User-friendly success, error, and info messages
- **FAQ Modal**: Built-in help and tutorial system
- **Dark Theme**: Modern dark UI with smooth animations
- **Local Storage**: All data stored locally in browser
- **Real-time Updates**: Automatic UI updates when entries expire

## 🛠️ Tech Stack

- **Framework**: Next.js 16.1.1
- **React**: 19.2.3
- **TypeScript**: 5.x
- **Styling**: Tailwind CSS 4.x
- **Icons**: Lucide React
- **Storage**: Browser LocalStorage

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd copas_cookies
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage

### For Administrators

1. Navigate to the **Admin Panel** tab
2. Choose a preset (optional) or create a custom entry
3. Fill in the website name
4. Add cookie values:
   - Click "Add Field" to add more cookies
   - Use "Show Advanced" to configure domain, HttpOnly, Secure, and SameSite
   - For credentials-based presets (HBO Go, Merlin AI), enter username and password
5. Click **Publish Entry** to save
6. Monitor entries in the "Active Database" section
7. Delete entries manually if needed before expiration

### For Users

1. Navigate to the **Public User** tab
2. Use the search bar to find specific websites
3. Click **Copy** button on any cookie, username, or password to copy to clipboard
4. View the countdown timer to see when entries will expire

## 📁 Project Structure

```
copas_cookies/
├── app/
│   ├── components/
│   │   ├── AdminTab.tsx          # Admin panel interface
│   │   ├── UserTab.tsx            # Public user interface
│   │   ├── CookieForm.tsx         # Dynamic cookie input form
│   │   ├── CookieItem.tsx         # Individual cookie display
│   │   ├── EntryCard.tsx          # Entry card component
│   │   ├── Statistics.tsx         # Statistics dashboard
│   │   ├── FAQModal.tsx           # Help and FAQ modal
│   │   ├── Toast.tsx              # Toast notification component
│   │   ├── ToastContainer.tsx     # Toast container
│   │   └── ToastContext.tsx       # Toast context provider
│   ├── hooks/
│   │   ├── useLocalStorage.ts     # LocalStorage hook
│   │   └── useTimer.ts            # Timer and expiration logic
│   ├── types/
│   │   └── index.ts               # TypeScript type definitions
│   ├── utils/
│   │   ├── formatTime.ts          # Time formatting utilities
│   │   ├── presets.ts             # Preset configurations
│   │   └── storage.ts             # Storage operations
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Main page component
│   └── globals.css                # Global styles
├── public/                        # Static assets
├── package.json
├── tsconfig.json
└── README.md
```

## 🎯 Key Components

### AdminTab
Main interface for administrators to create and manage cookie entries. Features preset templates, dynamic cookie forms, and entry management.

### UserTab
Public-facing interface for users to browse, search, and copy shared cookies. Includes search functionality and entry filtering.

### CookieForm
Dynamic form component that supports:
- Simple cookies (name + value)
- Advanced cookies (with domain, HttpOnly, Secure, SameSite, priority)
- Expandable/collapsible advanced options

### EntryCard
Displays individual entries with:
- Timer countdown
- Progress bar
- Copy functionality
- Delete button (admin only)

### useTimer Hook
Manages countdown timers and automatic expiration:
- Updates every second
- Automatically removes expired entries
- Calculates progress percentage

## 🎨 Presets

The application includes pre-configured presets for quick entry creation:

### Streaming Services
- **Netflix**: Simple cookie preset (SecureNetflixId, NetflixId)
- **HBO Go**: Credentials-based (username/password)
- **BStation**: Full cookie preset with advanced options
- **Disney+**: Full cookie preset with domain configuration

### AI Services
- **ChatGPT**: Full cookie preset with session tokens
- **Perplexity**: Full cookie preset with domain
- **Merlin AI**: Credentials-based (username/password)
- **Cursor**: Full cookie preset with WorkOS session token

## 🔧 Development

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Lint

```bash
npm run lint
```

## 🔒 Security Notes

- All data is stored locally in the browser's LocalStorage
- Entries automatically expire after 1 hour
- No data is sent to external servers
- Cookies are stored as plain text in LocalStorage (use with caution)
- This application is intended for internal/trusted network use

## 📝 License

See [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For questions or issues, please open an issue on the repository.

---

Built with ❤️ using Next.js and React
