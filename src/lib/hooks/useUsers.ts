import { useEffect, useState } from "react";
import { getUsers } from "@/services/api/users";
import { User } from "@/models/user";

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    getUsers().then(setUsers).catch(console.error);
  }, []);

  return { users };
}