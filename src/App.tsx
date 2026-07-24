import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute, PublicOnlyRoute } from './auth/ProtectedRoute'
import { AppShell } from './components/AppShell'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { Dashboard } from './pages/Dashboard'
import { ContentList } from './pages/ContentList'
import { ContentEditor } from './pages/ContentEditor'

function App() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/content" element={<ContentList />} />
          <Route path="/content/new" element={<ContentEditor />} />
          <Route path="/content/:id/edit" element={<ContentEditor />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
