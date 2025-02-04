import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { UserRules } from "@/components/user/UserRules";

const Users = () => {
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const ADMIN_PASSWORD = "HezekiahEthan123";

  const handleVerify = () => {
    if (password === ADMIN_PASSWORD) {
      setPassword("");
      toast({
        title: "Berhasil",
        description: "Verifikasi berhasil",
      });
    } else {
      toast({
        title: "Error",
        description: "Password salah",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Manajemen User</h1>
      <div className="max-w-md space-y-4">
        <Input
          type="password"
          placeholder="Masukkan password admin"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button onClick={handleVerify} className="w-full">
          Verifikasi
        </Button>
        <UserRules />
      </div>
    </div>
  );
};

export default Users;