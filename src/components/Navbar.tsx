"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Menu, X, Heart, ChevronDown, LogOut, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

const genres = [
  { id: 28, name: "Action" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 18, name: "Drama" },
  { id: 14, name: "Fantasy" },
  { id: 27, name: "Horror" },
  { id: 10749, name: "Romance" },
  { id: 53, name: "Thriller" },
  { id: 10752, name: "War" },
  { id: 878, name: "Sci-Fi" },
  { id: 16, name: "Animation" },
  { id: 99, name: "Documentary" },
];

export default function Navbar() {
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [genreOpen, setGenreOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  
  const searchRef = useRef<HTMLInputElement>(null);
  const genreRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (genreRef.current && !genreRef.current.contains(e.target as Node)) {
        setGenreOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
      setMenuOpen(false);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-bg-primary/95 backdrop-blur-xl shadow-lg shadow-black/20"
          : "bg-gradient-to-b from-black/80 to-transparent"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <Image
              src="/logo-v5.png"
              alt="StreamAura"
              width={140}
              height={40}
              className="h-8 lg:h-10 w-auto group-hover:brightness-125 transition-all"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/movies">Movies</NavLink>
            <NavLink href="/series">TV Series</NavLink>

            {/* Genre Dropdown */}
            <div ref={genreRef} className="relative">
              <button
                onClick={() => setGenreOpen(!genreOpen)}
                className="flex items-center gap-1 px-4 py-2 text-sm text-text-secondary hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                Genres
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-300 ${genreOpen ? "rotate-180" : ""}`}
                />
              </button>

              {genreOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-[#1a1a2e] border border-white/10 rounded-xl p-2 shadow-2xl shadow-black/60 z-[60] animate-fade-in-scale">
                  <div className="grid grid-cols-2 gap-1">
                    {genres.map((genre) => (
                      <Link
                        key={genre.id}
                        href={`/genre/${genre.id}?name=${genre.name}`}
                        onClick={() => setGenreOpen(false)}
                        className="px-3 py-2 text-sm text-text-secondary hover:text-white hover:bg-white/10 rounded-lg transition-all"
                      >
                        {genre.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <NavLink href="/contact">Contact</NavLink>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              {searchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center">
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search movies, shows..."
                    className="w-48 sm:w-64 bg-bg-secondary/90 backdrop-blur-sm border border-border rounded-full px-4 py-2 text-sm text-white placeholder-text-muted focus:outline-none focus:border-accent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery("");
                    }}
                    className="ml-2 p-2 text-text-secondary hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 text-text-secondary hover:text-white transition-colors rounded-lg hover:bg-white/5"
                  aria-label="Search"
                >
                  <Search size={20} />
                </button>
              )}
            </div>

            {/* Watchlist */}
            <Link
              href="/watchlist"
              className="hidden sm:flex p-2 text-text-secondary hover:text-accent transition-colors rounded-lg hover:bg-white/5"
              aria-label="Watchlist"
            >
              <Heart size={20} />
            </Link>

            {/* Desktop Auth Section */}
            {session ? (
              <div ref={profileRef} className="relative hidden sm:block">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-white/5 transition-all focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20">
                    {session.user?.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-accent flex items-center justify-center text-white text-xs font-bold">
                        {session.user?.name ? session.user.name[0].toUpperCase() : "U"}
                      </div>
                    )}
                  </div>
                  <ChevronDown
                    size={14}
                    className={`text-text-secondary transition-transform duration-300 ${
                      profileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-[#1a1a2e] border border-white/10 rounded-2xl p-3 shadow-2xl shadow-black/80 z-[60] animate-fade-in-scale">
                    <div className="px-3 py-2 border-b border-white/5 mb-2">
                      <p className="text-sm font-semibold text-white truncate">
                        {session.user?.name}
                      </p>
                      <p className="text-xs text-text-muted truncate">
                        {session.user?.email}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Link
                        href="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-text-secondary hover:text-white hover:bg-white/5 rounded-xl transition-all"
                      >
                        <UserIcon size={16} />
                        My Profile
                      </Link>
                      <Link
                        href="/watchlist"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-text-secondary hover:text-white hover:bg-white/5 rounded-xl transition-all"
                      >
                        <Heart size={16} />
                        My Watchlist
                      </Link>
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          signOut({ callbackUrl: "/" });
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-rating-red hover:text-white hover:bg-rating-red/20 rounded-xl transition-all"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-full transition-all hover:shadow-lg hover:shadow-accent/25"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 text-text-secondary hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden transition-all duration-300 overflow-hidden ${
          menuOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-bg-primary/98 backdrop-blur-xl border-t border-border px-4 py-4 space-y-1">
          <MobileNavLink href="/" onClick={() => setMenuOpen(false)}>Home</MobileNavLink>
          <MobileNavLink href="/movies" onClick={() => setMenuOpen(false)}>Movies</MobileNavLink>
          <MobileNavLink href="/series" onClick={() => setMenuOpen(false)}>TV Series</MobileNavLink>
          
          <div className="py-2">
            <p className="px-4 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider">Genres</p>
            <div className="grid grid-cols-2 gap-1">
              {genres.map((genre) => (
                <Link
                  key={genre.id}
                  href={`/genre/${genre.id}?name=${genre.name}`}
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-2 text-sm text-text-secondary hover:text-white hover:bg-white/5 rounded-lg transition-all"
                >
                  {genre.name}
                </Link>
              ))}
            </div>
          </div>
          
          <MobileNavLink href="/profile" onClick={() => setMenuOpen(false)}>
            <UserIcon size={16} className="inline mr-2" />
            My Profile
          </MobileNavLink>
          <MobileNavLink href="/watchlist" onClick={() => setMenuOpen(false)}>
            <Heart size={16} className="inline mr-2" />
            Watchlist
          </MobileNavLink>
          <MobileNavLink href="/contact" onClick={() => setMenuOpen(false)}>Contact</MobileNavLink>
          
          <div className="pt-3 border-t border-border">
            {session ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-4 py-2">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20">
                    {session.user?.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-accent flex items-center justify-center text-white text-sm font-bold">
                        {session.user?.name ? session.user.name[0].toUpperCase() : "U"}
                      </div>
                    )}
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-semibold text-white truncate">
                      {session.user?.name}
                    </p>
                    <p className="text-xs text-text-muted truncate">
                      {session.user?.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="block w-full text-center px-4 py-3 bg-rating-red/20 hover:bg-rating-red text-white text-sm font-semibold rounded-xl transition-all"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="block w-full text-center px-4 py-3 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-xl transition-all"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-4 py-2 text-sm text-text-secondary hover:text-white transition-colors rounded-lg hover:bg-white/5"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-4 py-3 text-text-secondary hover:text-white hover:bg-white/5 rounded-xl transition-all"
    >
      {children}
    </Link>
  );
}
