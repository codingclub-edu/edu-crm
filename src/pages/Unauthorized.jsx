import { useNavigate } from 'react-router-dom'

export default function Unauthorized() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-error">403</h1>
        <p className="text-xl font-semibold mt-2">Access Denied</p>
        <p className="text-base-content/60 mt-1 mb-6">You don't have permission to view this page.</p>
        <button className="btn btn-primary" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    </div>
  )
}
