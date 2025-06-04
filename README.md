# Auto Organize Me - Mobile App for Auto Mechanics

> A comprehensive mobile application designed to help auto mechanics efficiently manage their daily workflow, customer interactions, and administrative tasks.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey.svg)
![Framework](https://img.shields.io/badge/framework-React%20Native-61DAFB.svg)
![Expo](https://img.shields.io/badge/expo-53.0.9-000020.svg)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Screenshots](#screenshots)
- [Installation](#installation)
- [Development Setup](#development-setup)
- [Usage](#usage)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

Auto Organize Me is a mobile application built specifically for independent auto mechanics and small auto repair shops. The app provides a centralized platform for managing core aspects of an auto mechanic's work, including customer management, task tracking, invoicing, scheduling, and photo documentation.

**Key Benefits:**

- ⚡ Fully offline functionality - no internet required
- 📱 Modern, intuitive interface with dark theme
- 🔒 Local data storage for privacy and security
- 📸 Photo capture and documentation
- 💼 Complete business workflow management

## ✨ Features

### 👥 Customer Management

- Add, edit, and view customer profiles
- Store comprehensive customer details (name, contact info, address)
- Manage multiple vehicles per customer
- Track vehicle specifications (make, model, year, VIN, engine type)

### 📝 Task Management

- Create, edit, and organize repair tasks
- Categorize tasks (Repairs, Maintenance, Diagnostics)
- Track task status (To Do, In Progress, Awaiting Parts, Completed, Cancelled)
- Associate tasks with specific customers and vehicles

### 💰 Invoice Management

- Generate professional invoices from completed tasks
- Detailed cost breakdown (parts and labor)
- Track payment status (Unpaid, Partially Paid, Paid)
- Customer and vehicle information integration

### 📅 Scheduling

- Calendar view for job scheduling
- Assign tasks to specific time slots
- Multiple view options (day, week, month)
- Visual scheduling interface

### 📸 Photo Documentation

- Capture photos using device camera
- Associate photos with vehicles and specific tasks
- Document pre-repair conditions and completed work
- Secure local photo storage

### 🚗 Vehicle Management

- Comprehensive vehicle database
- Track vehicle history and maintenance
- Multiple vehicles per customer support
- Detailed vehicle specifications

## 📱 Screenshots

_Coming soon - Screenshots will be added once the app is fully developed_

## 🚀 Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development) or Android Studio (for Android development)

### Quick Start

1. **Clone the repository**

   ```bash
   git clone <your-repository-url>
   cd "Auto Organize Me Mobile App/auto-organize-me"
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm start
   ```

4. **Run on your preferred platform**

   ```bash
   # For iOS
   npm run ios

   # For Android
   npm run android

   # For Web
   npm run web
   ```

## 🛠️ Development Setup

### Environment Setup

1. **Install Expo CLI globally**

   ```bash
   npm install -g @expo/cli
   ```

2. **Install dependencies**

   ```bash
   cd auto-organize-me
   npm install
   ```

3. **Start development server**
   ```bash
   expo start
   ```

### Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run web` - Run in web browser

## 📖 Usage

### Getting Started

1. **Launch the app** on your mobile device
2. **Navigate through the main sections**:
   - **Home**: Dashboard with quick access to all features
   - **Customers**: Manage customer profiles and vehicles
   - **Tasks**: Create and track repair jobs
   - **Invoices**: Generate and manage invoices
   - **Schedule**: View and manage your calendar

### Basic Workflow

1. **Add a Customer**: Create customer profile with contact details
2. **Add Vehicle**: Associate vehicles with customers
3. **Create Task**: Set up repair or maintenance tasks
4. **Document Work**: Take photos and update task progress
5. **Generate Invoice**: Create invoice from completed tasks
6. **Track Payment**: Monitor payment status

## 🔧 Tech Stack

### Frontend

- **React Native** (0.79.2) - Cross-platform mobile development
- **Expo** (53.0.9) - Development platform and tools
- **React Navigation** (7.x) - Navigation library
- **React** (19.0.0) - UI library

### Database & Storage

- **Expo SQLite** - Local database storage
- **AsyncStorage** - Key-value storage for app settings

### UI & Styling

- **Custom Inter Font Family** - Modern, professional typography
- **Dark Theme** - Professional appearance
- **React Native Gesture Handler** - Touch interactions

### Utilities

- **UUID** - Unique identifier generation
- **Date Time Picker** - Date and time selection
- **Expo Camera** - Photo capture functionality

## 🏗️ Architecture

### Project Structure

```
auto-organize-me/
├── src/
│   ├── components/           # Reusable UI components
│   │   └── common/          # Common components (buttons, inputs, etc.)
│   ├── screens/             # Screen components
│   │   ├── CustomerManagement/
│   │   ├── TaskManagement/
│   │   ├── InvoiceManagement/
│   │   ├── VehicleManagement/
│   │   └── Scheduling/
│   ├── navigation/          # Navigation configuration
│   ├── database/           # Database setup and queries
│   ├── constants/          # App constants and themes
│   ├── utils/              # Utility functions
│   ├── hooks/              # Custom React hooks
│   ├── styles/             # Global styles
│   └── assets/             # Images, fonts, and other assets
├── App.js                   # Main app component
└── package.json            # Dependencies and scripts
```

### Design Patterns

- **Component-based architecture** for reusability
- **Custom hooks** for shared logic
- **Local-first data storage** for offline functionality
- **Navigation stack** for screen management

## 🗄️ Database Schema

The app uses SQLite for local data storage with the following main entities:

- **Customers**: Customer information and contact details
- **Vehicles**: Vehicle specifications linked to customers
- **Tasks**: Repair and maintenance tasks
- **Invoices**: Generated invoices with payment tracking
- **Photos**: Image documentation linked to vehicles/tasks
- **Schedule**: Calendar events and appointments

## 🚧 Development Status

### Current MVP Includes:

- ✅ Customer Management
- ✅ Vehicle Management
- ✅ Task Management
- ✅ Invoice Management
- ✅ Basic Scheduling
- ✅ Photo Capture & Storage
- ✅ Local Database Storage
- ✅ Offline Functionality

### Future Enhancements:

- 🔄 Cloud synchronization and backup
- 👥 Multi-user support
- 📊 Reporting and analytics
- 📦 Parts inventory management
- 🔗 Accounting software integration
- 📱 Push notifications

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow React Native best practices
- Maintain the existing code style
- Test on both iOS and Android platforms
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For questions, issues, or feature requests:

- Create an issue in this repository
- Contact the development team

---

**Built with ❤️ for the automotive repair community**

_Auto Organize Me - Streamlining automotive workflows, one repair at a time._
