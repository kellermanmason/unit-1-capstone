import { BrowserRouter, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import LoadingPage from "./pages/LoadingPage";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";
import RecipeCreatePage from "./pages/RecipeCreatePage";
import RecipesPage from "./pages/RecipesPage"
//import RecipeDetailPage from "./pages/RecipeDetailPage";

import AIAssistantPage from "./pages/AIAssistantPage";






function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/loading" element={<LoadingPage />} />
          <Route element={<ProtectedRoute />}>
  <Route path="/dashboard" element={<DashboardPage />} />
</Route>
<Route element={<ProtectedRoute />}>
  <Route path="/recipes/new" element={<RecipeCreatePage />} />
</Route>
<Route path="/recipes" element={<RecipesPage />} />
          <Route path="/ai-assistant" element={<AIAssistantPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
