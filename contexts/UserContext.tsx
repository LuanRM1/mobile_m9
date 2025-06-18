import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  gainRandomModifier,
  useModifier as apiUseModifier,
  createOrGetUser,
} from "@/services/api";
import { ModifierId } from "@/constants/Modifiers";

type Inventory = Record<ModifierId, number>;

interface User {
  nick: string;
  inventory: Inventory;
}

interface UserContextValue {
  user: User | null;
  loading: boolean;
  setNick: (nick: string) => Promise<void>;
  gainModifier: () => Promise<void>;
  useModifier: (modifier: ModifierId) => Promise<boolean>; // true se usado
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Carrega nick salvo
  useEffect(() => {
    (async () => {
      const savedNick = await AsyncStorage.getItem("nick");
      if (savedNick) {
        await setNick(savedNick);
      } else {
        setLoading(false);
      }
    })();
  }, []);

  const setNick = async (nick: string) => {
    setLoading(true);
    try {
      const data = await createOrGetUser(nick);
      setUser(data);
      await AsyncStorage.setItem("nick", nick);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  const gainModifier = async () => {
    if (!user) return;
    try {
      const res = await gainRandomModifier(user.nick);
      setUser((prev) => prev && { ...prev, inventory: res.inventory });
    } catch (e) {
      console.warn(e);
    }
  };

  const useModifier = async (modifier: ModifierId) => {
    if (!user) return false;
    if (user.inventory[modifier] <= 0) return false;
    try {
      const res = await apiUseModifier(user.nick, modifier);
      setUser((prev) => prev && { ...prev, inventory: res.inventory });
      return true;
    } catch (e) {
      console.warn(e);
      return false;
    }
  };

  return (
    <UserContext.Provider
      value={{ user, loading, setNick, gainModifier, useModifier }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("UserContext not found");
  return ctx;
}
