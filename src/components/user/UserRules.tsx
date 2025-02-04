import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { ref, set, get } from "firebase/database";
import { db } from "@/lib/firebase";

export function UserRules() {
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [ruleType, setRuleType] = useState("");
  const { toast } = useToast();

  const handleAddRule = async () => {
    try {
      const rulesRef = ref(db, 'rules');
      const snapshot = await get(rulesRef);
      const existingRules = snapshot.val() || {};

      await set(rulesRef, {
        ...existingRules,
        [ruleType]: password
      });

      setIsOpen(false);
      setPassword("");
      setRuleType("");

      toast({
        title: "Berhasil",
        description: "Rule berhasil ditambahkan",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menambahkan rule",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          Pilih Rules
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Rule Baru</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Tipe Rule</Label>
            <Select value={ruleType} onValueChange={setRuleType}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih tipe rule" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button onClick={handleAddRule} className="w-full">
            Tambah Rule
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}