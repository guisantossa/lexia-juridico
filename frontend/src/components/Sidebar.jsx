import { FaFileAlt, FaChartBar, FaCog, FaBook , FaSignOutAlt  } from 'react-icons/fa';
import logo from '../assets/logo.png';
import { useAuth } from '../auth/AuthContext'

export default function Sidebar() {
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    window.location.href = '/login' // Redireciona para a página de login após
    // fazer logout
  }

  return (
    <aside className="lexia-sidebar fixed left-0 top-0 h-screen flex flex-col justify-between">
      <div>
        {/* Logo / Título */}
        <img src={logo} alt="Lexia Logo" className="w-32 mb-6" />

        {/* Menu */}
        <nav className="flex flex-col gap-4">
          <a href="/analises" className="flex items-center gap-3 text-sm hover:text-white text-[#9ca3af]">
            <FaFileAlt className="text-lg" />
            Análises
          </a>
          <a href="#" className="flex items-center gap-3 text-sm hover:text-white text-[#9ca3af]">
            <FaChartBar className="text-lg" />
            Relatórios
          </a>
          <a href="#" className="flex items-center gap-3 text-sm hover:text-white text-[#9ca3af]">
            <FaCog className="text-lg" />
            Configurações
          </a>
          <a href="/referencias" className="flex items-center gap-3 text-sm hover:text-white text-[#9ca3af]">
            <FaBook  className="text-lg" />
            Referencias
          </a>
        </nav>
      </div>
      {/* Botão de Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 text-sm text-[#9ca3af] hover:text-white"
      >
        <FaSignOutAlt className="text-lg" />
        Sair
      </button>
      {/* Rodapé ou versão */}
      <div className="text-xs text-[#9ca3af] mt-10">
        © 2025 Lexia
      </div>
    </aside>
  );
}
