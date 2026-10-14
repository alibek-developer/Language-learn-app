/**
 * ReadScribe App Main Root Component
 * React Native + Expo implementation replacing Android Jetpack Compose codebase.
 */

import React, { useState } from 'react';
import { StyleSheet, View, StatusBar, SafeAreaView } from 'react-native';
import { AppProvider, useApp } from './src/context/AppContext';
import { Colors } from './src/theme';
import { BottomNavBar, TabKey } from './src/components/BottomNavBar';
import HomeScreen from './src/screens/HomeScreen';
import { ReadingScreen } from './src/screens/ReadingScreen';
import { ReaderScreen } from './src/screens/ReaderScreen';
import { VocabularyScreen } from './src/screens/VocabularyScreen';
import { WritingScreen } from './src/screens/WritingScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { WordLookupModal } from './src/components/WordLookupModal';
import { SentenceAnalysisModal } from './src/components/SentenceAnalysisModal';

const MainNavigator: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabKey>('home');
  const [isInReader, setIsInReader] = useState<boolean>(false);
  const { selectReading } = useApp();

  const handleOpenReader = (readingId: string) => {
    selectReading(readingId);
    setIsInReader(true);
  };

  const handleBackFromReader = () => {
    setIsInReader(false);
  };

  const renderActiveScreen = () => {
    if (isInReader) {
      return <ReaderScreen onBack={handleBackFromReader} />;
    }

    switch (currentTab) {
      case 'home':
        return (
          <HomeScreen
            onNavigateTab={(tab) => {
              if (tab === 'reading') {
                setCurrentTab('reading');
              } else {
                setCurrentTab(tab);
              }
            }}
          />
        );
      case 'reading':
        return <ReadingScreen onOpenReader={handleOpenReader} />;
      case 'vocab':
        return <VocabularyScreen onBack={() => setCurrentTab('home')} />;
      case 'writing':
        return <WritingScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen onNavigateTab={setCurrentTab} />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.canvas} />
      <View style={styles.mainContainer}>
        {renderActiveScreen()}

        {/* Floating Bottom Nav Bar (hidden when in reader or on reading tab) */}
        {!isInReader && currentTab !== 'reading' ? (
          <BottomNavBar
            currentTab={currentTab}
            onTabChange={(tab) => {
              setIsInReader(false);
              setCurrentTab(tab);
            }}
          />
        ) : null}

        {/* Global Modals for Word Lookup & AI Explainer */}
        <WordLookupModal />
        <SentenceAnalysisModal />
      </View>
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainNavigator />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.canvas,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.canvas,
  },
});
