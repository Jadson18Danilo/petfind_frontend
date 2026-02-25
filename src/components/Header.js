import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getMe, logoutUser } from '../services/auth';
import { getUnreadMessagesCount } from '../services/matches';
import { Home, Heart, MessageCircle, User } from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const path = router.pathname;
  const isHome = path === '/';
  const isMatches = path.startsWith('/match');
  const isChat = path.startsWith('/chat');
  const isProfile = path.startsWith('/tutor-profile') || path.startsWith('/tutor-edit');

  useEffect(() => {
    let mounted = true;

    async function loadUserData() {
      try {
        const data = await getMe();
        if (!mounted) return;
        setUser(data);

        // Load unread messages count
        const count = await getUnreadMessagesCount();
        if (!mounted) return;
        setUnreadCount(count);
      } catch (err) {
        if (!mounted) return;
        setUser(null);
      }
    }

    loadUserData();

    return () => {
      mounted = false;
    };
  }, [router.asPath]);

  // Reload unread count when leaving chat page
  useEffect(() => {
    if (router.pathname !== '/chat-on' && user) {
      const loadUnread = async () => {
        const count = await getUnreadMessagesCount();
        setUnreadCount(count);
      };
      loadUnread();
    }
  }, [router.pathname, user]);

  async function handleLogout() {
    await logoutUser();
    setUser(null);
  }

  function handleChatClick() {
    router.push(user ? '/chat-on' : '/chat-off');
  }

  function handleProfileClick() {
    router.push(user ? '/tutor-profile' : '/login-off');
  }

  const showMatchButton = Boolean(user);
  const isPrimaryActive = showMatchButton ? isMatches : isHome;

  function handlePrimaryClick() {
    router.push(showMatchButton ? '/match-display' : '/');
  }

  return (
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href={user ? '/match-display' : '/'} className="flex items-center gap-1">
            <img 
              src="https://img.icons8.com/material-two-tone/24/cat-footprint.png" 
              alt="Ícone de pegada de gato" 
              width={24} 
              height={24}
              style={{ 
                filter: 'sepia(1) saturate(4) hue-rotate(330deg) brightness(1.15) contrast(1.05)',
                transform: 'rotate(40deg)'
              }}
            />

            <h1 className="text-xl sm:text-2xl font-bold text-[#ffa98f]">
              PetFind
            </h1>
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrimaryClick}
              aria-label={showMatchButton ? 'Match' : 'Início'}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                isPrimaryActive ? 'bg-[rgba(255,169,143,0.13)] hover:bg-[rgba(255,169,143,0.2)]' : 'hover:bg-gray-50'
              }`}
            >
              {showMatchButton ? (
                <Heart className={`w-6 h-6 ${isPrimaryActive ? 'text-[#FFA98F]' : 'text-[#4A5565]'}`} />
              ) : (
                <Home className={`w-6 h-6 ${isPrimaryActive ? 'text-[#FFA98F]' : 'text-[#4A5565]'}`} />
              )}
            </button>
            <button
              type="button"
              onClick={handleChatClick}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors relative ${
                isChat ? 'bg-[rgba(255,169,143,0.13)] hover:bg-[rgba(255,169,143,0.2)]' : 'hover:bg-gray-50'
              }`}
              aria-label="Chat"
            >
              <MessageCircle className={`w-6 h-6 ${isChat ? 'text-[#FFA98F]' : 'text-[#4A5565]'}`} />
              {unreadCount > 0 && !isChat && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={handleProfileClick}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                isProfile ? 'bg-[rgba(255,169,143,0.13)] hover:bg-[rgba(255,169,143,0.2)]' : 'hover:bg-gray-50'
              }`}
              aria-label="Perfil"
            >
              <User className={`w-6 h-6 ${isProfile ? 'text-[#FFA98F]' : 'text-[#4A5565]'}`} />
            </button>
          </div>

          <div className="md:hidden flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrimaryClick}
              aria-label={showMatchButton ? 'Match' : 'Início'}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                isPrimaryActive ? 'bg-[rgba(255,169,143,0.13)]' : 'hover:bg-gray-50'
              }`}
            >
              {showMatchButton ? (
                <Heart className={`w-5 h-5 ${isPrimaryActive ? 'text-[#FFA98F]' : 'text-[#4A5565]'}`} />
              ) : (
                <Home className={`w-5 h-5 ${isPrimaryActive ? 'text-[#FFA98F]' : 'text-[#4A5565]'}`} />
              )}
            </button>

            <button
              type="button"
              onClick={handleChatClick}
              aria-label="Chat"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors relative ${
                isChat ? 'bg-[rgba(255,169,143,0.13)]' : 'hover:bg-gray-50'
              }`}
            >
              <MessageCircle className={`w-5 h-5 ${isChat ? 'text-[#FFA98F]' : 'text-[#4A5565]'}`} />
              {unreadCount > 0 && !isChat && (
                <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={handleProfileClick}
              aria-label="Perfil"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                isProfile ? 'bg-[rgba(255,169,143,0.13)]' : 'hover:bg-gray-50'
              }`}
            >
              <User className={`w-5 h-5 ${isProfile ? 'text-[#FFA98F]' : 'text-[#4A5565]'}`} />
            </button>
          </div>
        </div>
      </header>
  );
}




// import Link from 'next/link';
// import { useEffect, useState } from 'react';
// import { getMe, logoutUser } from '../services/auth';
// import { Menu, X } from 'lucide-react';

// export default function Header() {
//   const [user, setUser] = useState(null);
//   const [open, setOpen] = useState(false);

//   useEffect(() => {
//     async function loadUser() {
//       try {
//         const data = await getMe();
//         setUser(data);
//       } catch (err) {
//         setUser(null);
//       }
//     }

//     loadUser();
//   }, []);

//   async function handleLogout() {
//     await logoutUser();
//     setUser(null);
//   }

//   return (
//     <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
//       <div className="container-page flex items-center justify-between py-4">
//         <Link className="text-xl font-semibold tracking-tight" href="/">PetFind</Link>

//         <nav aria-label="Main navigation" className="hidden md:flex items-center gap-4 text-sm text-slate-600">
//           <Link className="hover:text-slate-900" href="/register">Cadastro</Link>
//           <Link className="hover:text-slate-900" href="/login">Login</Link>
//           <Link className="hover:text-slate-900" href="/pets">Pets</Link>
//           <Link className="hover:text-slate-900" href="/matches">Matches</Link>
//           <Link className="hover:text-slate-900" href="/chat">Chat</Link>
//         </nav>

//         <div className="flex items-center gap-3 text-sm">
//           <div className="hidden md:flex items-center gap-3">
//             {user ? (
//               <>
//                 <span className="text-slate-600">Olá, {user.name}</span>
//                 <button
//                   className="btn-secondary"
//                   onClick={handleLogout}
//                   type="button"
//                 >
//                   Sair
//                 </button>
//               </>
//             ) : (
//               <span className="text-slate-500">Visitante</span>
//             )}
//           </div>

//           <button
//             aria-expanded={open}
//             aria-label={open ? 'Fechar menu' : 'Abrir menu'}
//             onClick={() => setOpen((v) => !v)}
//             className="md:hidden p-2 rounded-lg hover:bg-slate-100"
//             type="button"
//           >
//             {open ? <X className="w-5 h-5 text-slate-700" /> : <Menu className="w-5 h-5 text-slate-700" />}
//           </button>
//         </div>
//       </div>

//       {/* Mobile menu */}
//       <div className={`md:hidden ${open ? 'block' : 'hidden'}`}>
//         <div className="border-t border-slate-100 bg-white">
//           <div className="px-4 py-3 space-y-2">
//             <Link className="block py-2 px-2 rounded hover:bg-slate-50" href="/register">Cadastro</Link>
//             <Link className="block py-2 px-2 rounded hover:bg-slate-50" href="/login">Login</Link>
//             <Link className="block py-2 px-2 rounded hover:bg-slate-50" href="/pets">Pets</Link>
//             <Link className="block py-2 px-2 rounded hover:bg-slate-50" href="/matches">Matches</Link>
//             <Link className="block py-2 px-2 rounded hover:bg-slate-50" href="/chat">Chat</Link>
//             <div className="pt-2">
//               {user ? (
//                 <>
//                   <div className="text-sm text-slate-700">Olá, {user.name}</div>
//                   <button className="mt-2 btn-secondary w-full" onClick={handleLogout} type="button">Sair</button>
//                 </>
//               ) : (
//                 <div className="text-sm text-slate-600">Visitante</div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }
