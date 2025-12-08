import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AdminNavigation from "./AdminNavigation";
import { Footer } from "./layout/Footer";
import { Header } from "./layout/Header";

interface LayoutProps {
  children: React.ReactNode;
  includeFooter?: boolean;
  includeHeader?: boolean;
  style?: ViewStyle;
}

const Layout = React.memo<LayoutProps>(
  ({ children, includeFooter = true, includeHeader = true, style }) => {
    return (
      <SafeAreaView style={[styles.container, style]}>
        {includeHeader && <Header />}
        <AdminNavigation />
        <View style={styles.main}>{children}</View>
        {includeFooter && <Footer />}
      </SafeAreaView>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  main: {
    flex: 1,
  },
});

Layout.displayName = "Layout";

export default Layout;
