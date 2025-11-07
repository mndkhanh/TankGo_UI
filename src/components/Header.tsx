import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { FsUser } from "../data/types";
import { getUserFromLocalStorage } from "../utils/userLocalStorage";

const Header = () => {
  const [user, setUser] = useState<FsUser | null>(null);

  useEffect(() => {
    const userData = getUserFromLocalStorage();
    if (userData) {
      setUser(userData);
    } else {
      setUser(null);
    }
  }, []);
  return (
    <header className="text-black p-4 bg-white flex justify-between items-center">
      <span className="text-white">Header here</span>
      {user ? (
        <div className="flex items-center gap-2">
          <img
            src={user.photo}
            alt="User Avatar"
            className="w-8 h-8 rounded-full"
          />
          <span>{user.name}</span>
          <Link to="/auth/logout">Logout</Link>
        </div>
      ) : (
        <Link to="/auth/login">Login</Link>
      )}
    </header>
  );
};

export default Header;
