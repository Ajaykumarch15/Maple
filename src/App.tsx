import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import LibraryPage from "./pages/LibraryPage";
import CollectionsPage from "./pages/CollectionsPage";
import ReflectionsPage from "./pages/ReflectionsPage";
import SearchPage from "./pages/SearchPage";
import QuoteDetailPage from "./pages/QuoteDetailPage";
import AddQuotePage from "./pages/AddQuotePage";
import RediscoverPage from "./pages/RediscoverPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="library" element={<LibraryPage />} />
        <Route path="collections" element={<CollectionsPage />} />
        <Route path="reflections" element={<ReflectionsPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="rediscover" element={<RediscoverPage />} />
        <Route path="quotes/:id" element={<QuoteDetailPage />} />
        <Route path="*" element={<HomePage />} />
      </Route>
      <Route path="/add" element={<AddQuotePage />} />
    </Routes>
  );
}
