import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Layout } from './components/layout/Layout';
import { InventoryDashboard } from './pages/inventory/InventoryDashboard';
import { InventoryForm } from './pages/inventory/InventoryForm';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="w-screen min-h-screen bg-gray-100">
          <Layout>
            <Routes>
              <Route path="/" element={<InventoryDashboard />} />
              <Route path="/inventory" element={<InventoryDashboard />} />
              <Route path="/inventory/new" element={<InventoryForm />} />
              <Route path="/inventory/:id/edit" element={<InventoryForm />} />
              <Route path="/alerts" element={<InventoryDashboard lowStockOnly />} />
            </Routes>
          </Layout>
        </div>
      </Router>
      <ReactQueryDevtools position="bottom-right" />
    </QueryClientProvider>
  );
}

export default App;
