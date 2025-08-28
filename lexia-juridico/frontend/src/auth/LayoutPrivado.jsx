import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

export default function LayoutPrivado() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-64 p-6 w-full">
        <Outlet />
      </main>
    </div>
  )
}
