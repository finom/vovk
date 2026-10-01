import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VoiceSelectorProps {
  value: "ash" | "ballad" | "coral" | "sage" | "verse";
  onValueChange: (value: "ash" | "ballad" | "coral" | "sage" | "verse") => void;
}

export function VoiceSelector({ value, onValueChange }: VoiceSelectorProps) {
  return (
    <div className="form-group space-y-2">
      <Label htmlFor="voiceSelect" className="text-sm font-medium">
        Select a voice
      </Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={"Select a voice"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ash">Ash</SelectItem>
          <SelectItem value="ballad">Ballad</SelectItem>
          <SelectItem value="coral">Coral</SelectItem>
          <SelectItem value="sage">Sage</SelectItem>
          <SelectItem value="verse">Verse</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
